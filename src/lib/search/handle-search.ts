"use server";

import { ProductItem, ReviewItem } from "@prisma/client";
import { MIN_REVIEW_COUNT, MIN_SEARCH_CHAR } from "../const";
import prisma from "../db";
import { getReviews } from "../get-reviews";
import { getProduct } from "../get-product";
import getYoutubeResults from "../youtube/get-youtube-results";
import analyzeTranscriptGpt from "../openai/analyze-transcript-gpt";
import summarizeProductGpt from "../openai/summarize-product-gpt";

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

export default async function handleSearch(
  query: string
): Promise<SearchResults | undefined> {
  if (!query || query.length <= MIN_SEARCH_CHAR) {
    return undefined;
  }

  const { reviews, totalCount, productResult } = await fetchInitialData(query);

  if (totalCount >= MIN_REVIEW_COUNT) {
    return { reviews, totalCount, product: productResult || null };
  }

  const { videoResults, videoIds, transcriptResponse } = await fetchYoutubeData(
    query
  );

  const analyzedTranscripts = await processTranscripts(
    transcriptResponse,
    query,
    videoResults
  );

  await updateDatabase(
    analyzedTranscripts,
    query,
    videoResults,
    transcriptResponse
  );

  return await fetchUpdatedData(query);
}

async function fetchInitialData(query: string) {
  try {
    const { reviews, totalCount } = await getReviews(query);
    const productResult = await getProduct(query);
    return { reviews, totalCount, productResult };
  } catch (error) {
    console.error("Failed to fetch reviews or product:", error);
    throw new Error("Error fetching initial data.");
  }
}

async function fetchYoutubeData(query: string) {
  try {
    const videoResults = await getYoutubeResults(query);
    const videoIds = videoResults.map((video: VideoResult) => video.id);
    const transcriptResponse = await fetch(
      "https://us-central1-youtube-product-reviews-420119.cloudfunctions.net/get_transcripts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_ids: videoIds }),
      }
    ).then((res) => res.json());

    return { videoResults, videoIds, transcriptResponse };
  } catch (error) {
    console.error("Error fetching YouTube results or transcripts:", error);
    throw new Error("Failed to process YouTube data.");
  }
}

async function processTranscripts(
  transcriptResponse: any,
  query: string,
  videoResults: VideoResult[]
) {
  const transcriptEntries = Object.entries<string>(transcriptResponse);
  const validTranscripts = transcriptEntries.filter(
    ([, transcript]) =>
      transcript !== "none" && transcript != null && transcript.length > 100
  );

  const analysisPromises = validTranscripts.map(([, transcript]) =>
    analyzeTranscriptGpt(transcript, query)
  );

  const analyzedTranscripts = await Promise.all(analysisPromises);
  if (analyzedTranscripts.some((at) => !at)) {
    console.error(
      "One or more transcripts could not be analyzed successfully."
    );
    throw new Error("Failed to analyze all transcripts.");
  }

  return analyzedTranscripts;
}

async function updateDatabase(
  analyzedTranscripts: any[],
  query: string,
  videoResults: VideoResult[],
  transcriptResponse: any
) {
  const transcriptEntries = Object.entries<string>(transcriptResponse);
  const validTranscripts = transcriptEntries.filter(
    ([, transcript]) =>
      transcript !== "none" && transcript != null && transcript.length > 100
  );

  const videoTranscriptMap = new Map<string, string>(validTranscripts);

  const productSummary = await summarizeProductGpt(
    JSON.stringify(analyzedTranscripts)
  );
  const productName = productSummary.whiskyName.toLowerCase();

  for (const [index, analyzedTranscript] of analyzedTranscripts.entries()) {
    if (!analyzedTranscript) {
      console.error("Analyzed transcript is undefined at index", index);
      continue;
    }
    const [videoId] = validTranscripts[index];
    const videoResult = videoResults.find(
      (video: VideoResult) => video.id === videoId
    );

    const review = {
      videoId,
      title: videoResult?.title || "",
      thumbnailUrl: videoResult?.thumbnailUrl || "",
      channelTitle: videoResult?.channelTitle || "",
      publishedAt: videoResult?.publishedAt || new Date().toISOString(),
      transcript: videoTranscriptMap.get(videoId) || "",
      searchQuery: query.toLowerCase(),
      productName,
      gptResponse: JSON.stringify(analyzedTranscript),
      age: analyzedTranscript.age,
      region: analyzedTranscript.region,
      abv: analyzedTranscript.abv,
      tags: JSON.stringify(analyzedTranscript.tags),
      casks: JSON.stringify(analyzedTranscript.casks),
      sentimentScore: analyzedTranscript.sentimentScore,
      overallScore: analyzedTranscript.overallScore,
      priceScore: analyzedTranscript.priceScore,
      complexityScore: analyzedTranscript.complexityScore,
      tasteNotes: JSON.stringify(analyzedTranscript.tasteNotes),
      tasteQuotes: JSON.stringify(analyzedTranscript.tasteQuotes),
      valueQuotes: JSON.stringify(analyzedTranscript.valueQuotes),
      opinionQuote: analyzedTranscript.opinionQuote,
      reviewSummary: analyzedTranscript.summary,
    };

    console.log("Adding review item to prisma: " + review.title);

    await prisma.reviewItem.upsert({
      where: { videoId },
      update: {},
      create: review,
    });
  }

  const productItem = {
    productName,
    age: productSummary.age,
    region: productSummary.region,
    abv: productSummary.abv,
    tags: JSON.stringify(productSummary.tags),
    casks: JSON.stringify(productSummary.casks),
    sentimentScore: productSummary.sentimentScore,
    overallScore: productSummary.overallScore,
    priceScore: productSummary.priceScore,
    complexityScore: productSummary.complexityScore,
    tasteNotes: JSON.stringify(productSummary.tasteNotes),
    reviewSummary: productSummary.summary,
  };

  console.log(
    "Adding product item to prisma: " +
      productName +
      ". Summary: " +
      productItem.reviewSummary
  );

  await prisma.productItem.upsert({
    where: { productName },
    update: {},
    create: productItem,
  });
}
async function fetchUpdatedData(query: string) {
  try {
    const updatedReviews = await getReviews(query);
    const updatedProduct = await getProduct(query);
    return {
      reviews: updatedReviews.reviews,
      totalCount: updatedReviews.totalCount,
      product: updatedProduct || null,
    };
  } catch (error) {
    console.error("Failed to fetch updated data:", error);
    throw new Error("Error fetching updated data.");
  }
}

// "use server";

// import { ProductItem, ReviewItem } from "@prisma/client";
// import { MIN_REVIEW_COUNT, MIN_SEARCH_CHAR } from "../const";
// import prisma from "../db";
// import analyzeTranscriptGpt from "../openai/analyze-transcript-gpt";
// import { getReviews } from "../get-reviews";
// import getYoutubeResults from "../youtube/get-youtube-results";
// import summarizeProductGpt from "../openai/summarize-product-gpt";
// import { getProduct } from "../get-product";

// type SearchResults = {
//   reviews: ReviewItem[];
//   totalCount: number;
//   product: ProductItem | null; // This line is updated to accept 'null' as a value.
// };

// type VideoResult = {
//   id: string;
//   title: string;
//   thumbnailUrl: string;
//   channelTitle: string;
//   publishedAt: string;
// };

// export default async function handleSearch(
//   query: string
// ): Promise<SearchResults | undefined> {
//   if (!query || query.length <= MIN_SEARCH_CHAR) {
//     return undefined; // Return undefined to handle the case where the query is invalid
//   }

//   let reviews, totalCount, productResult;
//   try {
//     ({ reviews, totalCount } = await getReviews(query));
//     productResult = await getProduct(query);
//   } catch (error) {
//     console.error("Failed to fetch reviews or product:", error);
//     throw new Error("Error fetching initial data.");
//   }

//   console.log(`Count of entries for query {${query}}: ${totalCount}`);

//   if (totalCount >= MIN_REVIEW_COUNT) {
//     return { reviews, totalCount, product: productResult || null };
//   }

//   let videoResults, videoIds, transcriptResponse;
//   try {
//     videoResults = await getYoutubeResults(query);
//     videoIds = videoResults.map((video: VideoResult) => video.id);
//     transcriptResponse = await fetch(
//       "https://us-central1-youtube-product-reviews-420119.cloudfunctions.net/get_transcripts",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ video_ids: videoIds }),
//       }
//     ).then((res) => res.json());
//   } catch (error) {
//     console.error("Error fetching YouTube results or transcripts:", error);
//     throw new Error("Failed to process YouTube data.");
//   }

//   // Processing transcripts and analysis
//   try {
//     const transcriptEntries = Object.entries<string>(transcriptResponse);
//     const validTranscripts = transcriptEntries.filter(
//       ([, transcript]) =>
//         transcript !== "none" && transcript != null && transcript.length > 100
//     );

//     const videoTranscriptMap = new Map<string, string>(validTranscripts);
//     const analysisPromises = validTranscripts.map(([, transcript]) =>
//       analyzeTranscriptGpt(transcript, query)
//     );

//     // Ensuring all transcripts are fetched and analyzed before proceeding
//     const analyzedTranscripts = await Promise.all(analysisPromises);
//     if (analyzedTranscripts.some((at) => !at)) {
//       console.error(
//         "One or more transcripts could not be analyzed successfully."
//       );
//       throw new Error("Failed to analyze all transcripts.");
//     }

//     // Proceed with creating/updating database entries only after successful analysis
//     const productSummary = await summarizeProductGpt(
//       JSON.stringify(analyzedTranscripts)
//     );
//     const productName = productSummary.whiskyName.toLowerCase();

//     for (const [index, analyzedTranscript] of analyzedTranscripts.entries()) {
//       if (!analyzedTranscript) {
//         console.error("Analyzed transcript is undefined at index", index);
//         continue; // Skip this iteration if the analyzed data is undefined
//       }
//       const [videoId] = validTranscripts[index];
//       const videoResult = videoResults.find(
//         (video: VideoResult) => video.id === videoId
//       );

//       const review = {
//         videoId,
//         title: videoResult?.title || "",
//         thumbnailUrl: videoResult?.thumbnailUrl || "",
//         channelTitle: videoResult?.channelTitle || "",
//         publishedAt: videoResult?.publishedAt || new Date().toISOString(),
//         transcript: videoTranscriptMap.get(videoId) || "",
//         searchQuery: query.toLowerCase(),
//         productName: productName,
//         gptResponse: JSON.stringify(analyzedTranscript),
//         age: analyzedTranscript.age,
//         region: analyzedTranscript.region,
//         abv: analyzedTranscript.abv,
//         tags: JSON.stringify(analyzedTranscript.tags),
//         casks: JSON.stringify(analyzedTranscript.casks),
//         sentimentScore: analyzedTranscript.sentimentScore,
//         overallScore: analyzedTranscript.overallScore,
//         priceScore: analyzedTranscript.priceScore,
//         complexityScore: analyzedTranscript.complexityScore,
//         tasteNotes: JSON.stringify(analyzedTranscript.tasteNotes),
//         tasteQuotes: JSON.stringify(analyzedTranscript.tasteQuotes),
//         valueQuotes: JSON.stringify(analyzedTranscript.valueQuotes),
//         opinionQuote: analyzedTranscript.opinionQuote,
//         reviewSummary: analyzedTranscript.summary,
//       };

//       console.log("Adding review item to prisma: " + review.title);

//       await prisma.reviewItem.upsert({
//         where: { videoId },
//         update: {},
//         create: review,
//       });
//     }

//     const productItem = {
//       productName,
//       age: productSummary.age,
//       region: productSummary.region,
//       abv: productSummary.abv,
//       tags: JSON.stringify(productSummary.tags),
//       casks: JSON.stringify(productSummary.casks),
//       sentimentScore: productSummary.sentimentScore,
//       overallScore: productSummary.overallScore,
//       priceScore: productSummary.priceScore,
//       complexityScore: productSummary.complexityScore,
//       tasteNotes: JSON.stringify(productSummary.tasteNotes),
//       reviewSummary: productSummary.summary,
//     };

//     console.log(
//       "Adding product item to prisma: " +
//         productName +
//         ". Summary: " +
//         productItem.reviewSummary
//     );

//     await prisma.productItem.upsert({
//       where: { productName },
//       update: {},
//       create: productItem,
//     });
//     let updatedReviews, updatedProduct;
//     try {
//       updatedReviews = await getReviews(productName);
//       updatedProduct = await getProduct(productName);
//     } catch (error) {
//       console.error("Failed to fetch updated data:", error);
//       throw new Error("Error fetching updated data.");
//     }

//     console.log("Fetched product: ", updatedProduct);

//     return {
//       reviews: updatedReviews.reviews,
//       totalCount: updatedReviews.totalCount,
//       product: updatedProduct || null,
//     };
//   } catch (error) {
//     console.error("Error during analysis or database update:", error);
//     throw new Error("Failed during analysis or updating database.");
//   }
// }
