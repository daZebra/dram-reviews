"use server";

import { ProductItem, ReviewItem } from "@prisma/client";
import { MIN_REVIEW_COUNT, MIN_SEARCH_CHAR } from "../const";
import prisma from "../db";
import { getReviews } from "../get-reviews";
import { getProduct } from "../get-product";
import getYoutubeResults from "../youtube/get-youtube-results";
import analyzeTranscriptGpt from "../openai/analyze-transcript-gpt";
import summarizeProductGpt from "../openai/summarize-product-gpt";
import { logger } from "../logger";

type SearchResults = {
  reviews: ReviewItem[];
  totalCount: number;
  product: ProductItem | null;
};

type VideoResult = {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
};

// Simple in-memory cache for recent searches
const searchCache: Record<
  string,
  {
    timestamp: number;
    data: SearchResults;
  }
> = {};

// Cache time limit (10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

export default async function handleSearch(
  query: string
): Promise<SearchResults | undefined> {
  logger.info(`Starting search for: "${query}"`);

  // Normalize the query
  const normalizedQuery = query.trim().toLowerCase();

  // Sanity check for empty or super short query
  if (!normalizedQuery || normalizedQuery.length < 3) {
    logger.warn(
      `Query too short or empty, skipping search: "${normalizedQuery}"`
    );
    return undefined;
  }

  try {
    // Check cache first for recent searches
    const now = Date.now();
    const cachedResult = searchCache[normalizedQuery];

    if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
      logger.info(`Found recent cached result for: "${normalizedQuery}"`);
      return cachedResult.data;
    }

    // First, fetch existing data from the database
    logger.info(`Fetching existing data for: "${normalizedQuery}"`);
    const existingData = await fetchInitialData(normalizedQuery);
    const existingReviewCount = existingData?.reviews?.length || 0;

    logger.info(
      `Found ${existingReviewCount} existing reviews for: "${normalizedQuery}"`
    );

    // If we have enough reviews already, return existing data
    if (existingReviewCount >= MIN_REVIEW_COUNT) {
      logger.info(
        `Found sufficient existing reviews (${existingReviewCount}), returning data`
      );

      // Cache the result
      searchCache[normalizedQuery] = {
        timestamp: now,
        data: existingData,
      };

      return existingData;
    }

    // Return existing data even if not enough reviews but some data exists
    if (existingReviewCount > 0) {
      logger.info(
        `Found some existing reviews (${existingReviewCount}), returning data`
      );

      // Cache the result
      searchCache[normalizedQuery] = {
        timestamp: now,
        data: existingData,
      };

      return existingData;
    }

    // If no existing data, fetch from YouTube
    logger.info(
      `No existing data, fetching from YouTube for: "${normalizedQuery}"`
    );
    const { videoResults, transcriptResponse } = await fetchYoutubeData(
      normalizedQuery
    );
    logger.info(`Fetched ${videoResults.length} YouTube videos`);

    logger.info(`Processing transcripts for analysis`);
    const analyzedTranscripts = await processTranscripts(
      transcriptResponse,
      normalizedQuery,
      videoResults
    );

    logger.info(`Processed ${analyzedTranscripts.length} transcripts`);

    if (analyzedTranscripts.length === 0) {
      logger.warn(`No transcripts were successfully analyzed`);
      return undefined;
    }

    // Update the database with the new data
    logger.info(`Updating database with analyzed transcripts`);
    await updateDatabase(
      analyzedTranscripts,
      normalizedQuery,
      videoResults,
      transcriptResponse
    );

    // Fetch the updated data after saving to database
    logger.info(`Fetching updated data after database update`);
    const updatedData = await fetchUpdatedData(normalizedQuery);

    // Cache the result
    searchCache[normalizedQuery] = {
      timestamp: now,
      data: updatedData,
    };

    logger.info(`Search complete for: "${normalizedQuery}"`);
    return updatedData;
  } catch (error) {
    logger.error(`Error during search for "${normalizedQuery}":`, error);
    throw error;
  }
}

async function fetchInitialData(query: string): Promise<SearchResults> {
  logger.info(`Fetching initial data for query: "${query}"`);

  try {
    // Fetch existing reviews from database
    const { reviews, totalCount } = await getReviews(query);
    logger.info(`Found ${totalCount} reviews in database`);

    // Fetch product information
    const productResult = await getProduct(query);
    logger.info(`Product found: ${productResult ? "yes" : "no"}`);

    return {
      reviews,
      totalCount,
      product: productResult,
    };
  } catch (error) {
    logger.error(`Error fetching initial data:`, error);
    return { reviews: [], totalCount: 0, product: null };
  }
}

async function fetchYoutubeData(query: string) {
  logger.info(`Fetching YouTube data for query: "${query}"`);

  try {
    // Fetch YouTube search results
    const videoResults = await getYoutubeResults(query);

    if (!videoResults || videoResults.length === 0) {
      logger.error(`No YouTube videos found for query: "${query}"`);
      throw new Error("No YouTube videos found for the search query");
    }

    logger.info(`Found ${videoResults.length} YouTube videos for query`);

    // Extract video IDs
    const videoIds = videoResults.map((video: VideoResult) => video.id);
    logger.debug(`Video IDs: ${videoIds.join(", ")}`);

    // Fetch transcripts using our API endpoint
    logger.info(`Fetching transcripts for ${videoIds.length} videos`);

    // Use a relative URL to avoid cross-origin and authorization issues
    const apiUrl = "/api/transcripts";

    // For better performance, we'll split the video IDs into smaller batches
    // and process them in parallel if there are many videos
    let transcriptResponse: Record<string, string> = {};

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_ids: videoIds }),
        cache: "no-store", // Ensure fresh response each time
      });

      if (!response.ok) {
        // Handle any dependency or API errors
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.error === "Dependency Error") {
            logger.error(`Dependency error: ${errorData.message}`);
            // Create empty placeholders
            transcriptResponse = videoIds.reduce(
              (acc: Record<string, string>, id: string) => {
                acc[id] = "none";
                return acc;
              },
              {} as Record<string, string>
            );
          } else {
            throw new Error(
              `API error: ${errorData.message || "Unknown error"}`
            );
          }
        } else {
          throw new Error(`API returned status: ${response.status}`);
        }
      } else {
        transcriptResponse = await response.json();
        logger.info(
          `Received transcript data for ${
            Object.keys(transcriptResponse).length
          } videos`
        );
      }
    } catch (error) {
      logger.error(`Error fetching transcripts:`, error);
      // Create empty placeholders on error
      transcriptResponse = videoIds.reduce(
        (acc: Record<string, string>, id: string) => {
          acc[id] = "none";
          return acc;
        },
        {} as Record<string, string>
      );
    }

    // Pre-validate the transcripts to see if we have any potentially usable ones
    const usableTranscripts = Object.values(transcriptResponse).filter(
      (transcript) =>
        transcript && transcript !== "none" && transcript.length > 50
    );

    logger.info(
      `Found ${usableTranscripts.length} potentially usable transcripts`
    );

    if (usableTranscripts.length === 0) {
      logger.warn(`No valid transcripts found, search may not yield results`);
      logger.warn(
        `To enable transcript fetching, make sure the API is properly configured and the youtube-transcript package is installed.`
      );
    }

    return { videoResults, transcriptResponse };
  } catch (error) {
    logger.error(`Error fetching YouTube data:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Pre-screen transcript for whisky content before AI analysis
 * This is a simple keyword-based check to avoid sending irrelevant videos to expensive AI processing
 */
function isLikelyWhiskyReview(transcript: string): boolean {
  // Convert to lowercase once for efficiency
  const transcriptLower = transcript.toLowerCase();

  // Instead of checking each term individually, use a more efficient approach
  // where we count matches using a single pass through the text

  // Whisky and review terms (pre-lowercase for efficiency)
  const whiskyTerms = new Set([
    // General whisky terminology
    "whisky",
    "whiskey",
    "scotch",
    "bourbon",
    "malt",
    "dram",
    "distillery",
    "single malt",
    "blend",
    "blended",
    "cask",
    "matured",
    "spirit",
    "spirits",
    "abv",
    "proof",
    "alcohol",
    "bottling",
    "bottled",
    "batch",
    "expression",

    // Whisky regions
    "islay",
    "speyside",
    "highland",
    "lowland",
    "campbeltown",
    "islands",
    "scotland",
    "scottish",
    "irish",
    "ireland",
    "american",
    "japanese",
    "japan",

    // Production terms
    "peat",
    "peaty",
    "smoky",
    "smoke",
    "oaky",
    "oak",
    "cask strength",
    "age statement",
    "nas",
    "non-age statement",
    "sherry",
    "bourbon cask",
    "wood",
    "maturation",
    "barrel",
    "finish",
    "finishing",
    "distilled",
    "fermentation",
    "pot still",
    "column still",
    "double distilled",

    // Popular distilleries and brands - just include key ones for efficiency
    "lagavulin",
    "talisker",
    "glenfiddich",
    "macallan",
    "glenmorangie",
    "ardbeg",
    "laphroaig",
    "bowmore",
    "balvenie",
    "glenlivet",
    "jameson",
    "jack daniels",
    "yamazaki",
  ]);

  const reviewTerms = new Set([
    "review",
    "taste",
    "tasting",
    "drinking",
    "rating",
    "score",
    "recommend",
    "flavor",
    "flavour",
    "bottle",
    "bottling",
    "aged",
  ]);

  // Count matches efficiently with a single pass through words
  let whiskyTermCount = 0;
  let reviewTermCount = 0;

  // Target counts for performance optimization
  const TARGET_WHISKY_TERMS = 2;
  const TARGET_REVIEW_TERMS = 1;

  // Split into words for more efficient matching
  const words = transcriptLower.split(/\s+/);

  // Early exit optimization - check first 200 words for efficiency on long videos
  const checkLimit = Math.min(words.length, 200);

  for (let i = 0; i < checkLimit; i++) {
    const word = words[i];

    // Check for single-word matches
    if (whiskyTerms.has(word)) {
      whiskyTermCount++;
      // Early success - if we have enough terms, no need to check further
      if (
        whiskyTermCount >= TARGET_WHISKY_TERMS &&
        reviewTermCount >= TARGET_REVIEW_TERMS
      ) {
        logger.info(
          `Early match detection: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
        );
        return true;
      }
    }

    if (reviewTerms.has(word)) {
      reviewTermCount++;
      // Early success check
      if (
        whiskyTermCount >= TARGET_WHISKY_TERMS &&
        reviewTermCount >= TARGET_REVIEW_TERMS
      ) {
        logger.info(
          `Early match detection: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
        );
        return true;
      }
    }

    // Check for two-word terms if there's another word ahead
    if (i < checkLimit - 1) {
      const twoWordTerm = `${word} ${words[i + 1]}`;
      if (whiskyTerms.has(twoWordTerm)) {
        whiskyTermCount++;
        // Early success check
        if (
          whiskyTermCount >= TARGET_WHISKY_TERMS &&
          reviewTermCount >= TARGET_REVIEW_TERMS
        ) {
          logger.info(
            `Early match detection: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
          );
          return true;
        }
      }
    }
  }

  // For longer transcripts, also check a sample from the middle
  if (words.length > 400) {
    const middleStart = Math.floor(words.length / 2) - 100;
    const middleEnd = Math.min(middleStart + 200, words.length);

    for (let i = middleStart; i < middleEnd; i++) {
      const word = words[i];

      if (whiskyTerms.has(word)) {
        whiskyTermCount++;
        if (
          whiskyTermCount >= TARGET_WHISKY_TERMS &&
          reviewTermCount >= TARGET_REVIEW_TERMS
        ) {
          logger.info(
            `Middle section match: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
          );
          return true;
        }
      }

      if (reviewTerms.has(word)) {
        reviewTermCount++;
        if (
          whiskyTermCount >= TARGET_WHISKY_TERMS &&
          reviewTermCount >= TARGET_REVIEW_TERMS
        ) {
          logger.info(
            `Middle section match: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
          );
          return true;
        }
      }

      // Check for two-word terms
      if (i < middleEnd - 1) {
        const twoWordTerm = `${word} ${words[i + 1]}`;
        if (whiskyTerms.has(twoWordTerm)) {
          whiskyTermCount++;
          if (
            whiskyTermCount >= TARGET_WHISKY_TERMS &&
            reviewTermCount >= TARGET_REVIEW_TERMS
          ) {
            logger.info(
              `Middle section match: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
            );
            return true;
          }
        }
      }
    }
  }

  // Log the final counts
  logger.info(
    `Pre-screening transcript: found ${whiskyTermCount} whisky terms and ${reviewTermCount} review terms`
  );

  // Return true if we have reasonable confidence this is a whisky review
  return (
    whiskyTermCount >= TARGET_WHISKY_TERMS &&
    reviewTermCount >= TARGET_REVIEW_TERMS
  );
}

async function processTranscripts(
  transcriptResponse: Record<string, string>,
  query: string,
  videoResults: VideoResult[]
) {
  logger.info(`Processing transcripts for query: "${query}"`);

  // Create a map of video IDs to video results for easier access
  const videoMap = videoResults.reduce((map, video) => {
    map[video.id] = video;
    return map;
  }, {} as Record<string, VideoResult>);

  // First, filter for reasonably sized transcripts and pre-screen for whisky content
  const validTranscripts = Object.entries(transcriptResponse)
    .filter(
      ([videoId, transcript]) =>
        transcript &&
        transcript !== "none" &&
        transcript.length > 100 &&
        videoMap[videoId]
    )
    .filter(([videoId, transcript]) => {
      // Pre-screen for whisky content
      const isWhiskyRelated = isLikelyWhiskyReview(transcript);
      if (!isWhiskyRelated) {
        logger.info(
          `Video ${videoId} doesn't appear to be a whisky review - skipping AI analysis`
        );
      }
      return isWhiskyRelated;
    })
    .map(([videoId, transcript]) => ({
      videoId,
      transcript,
      videoData: videoMap[videoId],
    }));

  logger.info(
    `Found ${
      validTranscripts.length
    } probable whisky review transcripts out of ${
      Object.keys(transcriptResponse).length
    }`
  );

  // If we have enough pre-screened transcripts, analyze them
  if (validTranscripts.length > 0) {
    return await analyzeTranscripts(validTranscripts, query);
  }

  // Otherwise, if we don't have any transcripts that look like whisky reviews
  logger.warn(`No whisky review transcripts found for query: "${query}"`);
  return [];
}

async function analyzeTranscripts(
  transcriptItems: {
    videoId: string;
    transcript: string;
    videoData: VideoResult;
  }[],
  query: string
) {
  logger.info(`Analyzing ${transcriptItems.length} transcripts in parallel`);

  try {
    // Use Promise.all to process all transcripts in parallel
    const analysisPromises = transcriptItems.map(async (item) => {
      const { videoId, transcript, videoData } = item;
      logger.info(`Starting analysis for video: ${videoId}`);
      logger.info(`Transcript length: ${transcript.length} characters`);

      try {
        const analysisResult = await analyzeTranscriptGpt(transcript, query);
        if (analysisResult) {
          logger.info(`Successfully analyzed transcript for video: ${videoId}`);
          return {
            videoId,
            videoData,
            analysis: analysisResult,
          };
        } else {
          logger.warn(`Analysis returned null for video: ${videoId}`);
          return null;
        }
      } catch (error) {
        logger.error(`Error analyzing transcript for video ${videoId}:`, error);
        return null;
      }
    });

    // Wait for all transcript analyses to complete
    const results = await Promise.all(analysisPromises);

    // Filter out any null results
    const analyzedTranscripts = results.filter((result) => result !== null);

    logger.info(
      `Successfully analyzed ${analyzedTranscripts.length}/${transcriptItems.length} transcripts`
    );

    return analyzedTranscripts;
  } catch (error) {
    logger.error(`Error in parallel transcript analysis:`, error);
    return [];
  }
}

async function updateDatabase(
  analyzedTranscripts: any[],
  query: string,
  videoResults: VideoResult[],
  transcriptResponse: Record<string, string>
) {
  logger.info(`Updating database for query: "${query}"`);

  // Sanity check - make sure we have analyzed transcripts
  if (analyzedTranscripts.length === 0) {
    logger.warn(`No analyzed transcripts provided, skipping database update`);
    return;
  }

  // Create a map of video IDs to video results for easier access
  const videoMap: Record<string, VideoResult> = {};
  for (const video of videoResults) {
    videoMap[video.id] = video;
  }

  try {
    // Prepare data for product summarization
    const analysisObjects = analyzedTranscripts.map((item) => {
      return JSON.stringify(item.analysis);
    });

    logger.info(
      `Summarizing product data from ${analysisObjects.length} analyzed transcripts`
    );
    const productData = await summarizeProductGpt(analysisObjects.join("\n"));

    // Create or update review items in database
    for (const item of analyzedTranscripts) {
      const { videoId, videoData, analysis } = item;

      if (!videoId || !videoData || !analysis) {
        logger.warn(`Missing data for transcript item, skipping`);
        continue;
      }

      logger.info(`Processing review for video: ${videoId}`);
      const {
        age,
        region,
        abv,
        tags,
        casks,
        tasteNotes,
        tasteQuotes,
        valueQuotes,
        opinionQuote,
        summary,
        sentimentScore,
        overallScore,
        priceScore,
        complexityScore,
      } = analysis;

      try {
        // Create or update the review item
        await prisma.reviewItem.upsert({
          where: { videoId },
          create: {
            videoId,
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            productName: query.toLowerCase(),
            searchQuery: query.toLowerCase(),
            channelTitle: videoData.channelTitle,
            publishedAt: new Date(videoData.publishedAt),
            transcript: transcriptResponse[videoId] || "",
            age,
            region,
            abv,
            tags: JSON.stringify(tags || []),
            casks: JSON.stringify(casks || []),
            tasteNotes: JSON.stringify(tasteNotes || []),
            tasteQuotes: JSON.stringify(tasteQuotes || []),
            valueQuotes: JSON.stringify(valueQuotes || []),
            opinionQuote,
            reviewSummary: summary,
            sentimentScore,
            overallScore,
            priceScore,
            complexityScore,
          },
          update: {
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            productName: query.toLowerCase(),
            searchQuery: query.toLowerCase(),
            channelTitle: videoData.channelTitle,
            publishedAt: new Date(videoData.publishedAt),
            transcript: transcriptResponse[videoId] || "",
            age,
            region,
            abv,
            tags: JSON.stringify(tags || []),
            casks: JSON.stringify(casks || []),
            tasteNotes: JSON.stringify(tasteNotes || []),
            tasteQuotes: JSON.stringify(tasteQuotes || []),
            valueQuotes: JSON.stringify(valueQuotes || []),
            opinionQuote,
            reviewSummary: summary,
            sentimentScore,
            overallScore,
            priceScore,
            complexityScore,
          },
        });
        logger.info(
          `Successfully created/updated review for video: ${videoId}`
        );
      } catch (error) {
        logger.error(
          `Error creating/updating review for video ${videoId}:`,
          error
        );
      }
    }

    // Create or update product item
    if (productData) {
      try {
        logger.info(`Creating/updating product: ${productData.whiskyName}`);
        await prisma.productItem.upsert({
          where: { productName: query.toLowerCase() },
          create: {
            productName: query.toLowerCase(),
            age: productData.age,
            region: productData.region,
            abv: productData.abv,
            tags: JSON.stringify(productData.tags || []),
            casks: JSON.stringify(productData.casks || []),
            tasteNotes: JSON.stringify(productData.tasteNotes || []),
            reviewSummary: productData.summary,
            sentimentScore: productData.sentimentScore,
            overallScore: productData.overallScore,
            priceScore: productData.priceScore,
            complexityScore: productData.complexityScore,
          },
          update: {
            age: productData.age,
            region: productData.region,
            abv: productData.abv,
            tags: JSON.stringify(productData.tags || []),
            casks: JSON.stringify(productData.casks || []),
            tasteNotes: JSON.stringify(productData.tasteNotes || []),
            reviewSummary: productData.summary,
            sentimentScore: productData.sentimentScore,
            overallScore: productData.overallScore,
            priceScore: productData.priceScore,
            complexityScore: productData.complexityScore,
          },
        });
        logger.info(
          `Successfully created/updated product: ${productData.whiskyName}`
        );
      } catch (error) {
        logger.error(`Error creating/updating product:`, error);
      }
    }

    logger.info(`Database update complete for query: "${query}"`);
  } catch (error) {
    logger.error(`Error updating database:`, error);
    throw error;
  }
}

async function fetchUpdatedData(query: string): Promise<SearchResults> {
  logger.info(`Fetching updated data after database update for: "${query}"`);

  try {
    // Fetch reviews again to get fresh data
    const { reviews, totalCount } = await getReviews(query);
    logger.info(`Retrieved ${totalCount} reviews from database`);

    // Fetch updated product information
    const product = await getProduct(query);
    logger.info(`Product found: ${product ? "yes" : "no"}`);

    return { reviews, totalCount, product };
  } catch (error) {
    logger.error(`Error fetching updated data:`, error);
    return { reviews: [], totalCount: 0, product: null };
  }
}
