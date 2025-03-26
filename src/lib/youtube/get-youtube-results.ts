import axios from "axios";
import { MAX_YT_RESULTS, MIN_REVIEW_COUNT } from "../const";
import { logger } from "../logger";

// Environment variable for API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Base URL for YouTube Data API
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

// Higher number to fetch more videos initially before filtering
const INITIAL_FETCH_COUNT = MAX_YT_RESULTS * 3;

type videoResult = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
};

/**
 * Fetch YouTube search results for a given query.
 * @param {string} searchQuery - The search query for YouTube videos.
 * @returns {Promise<Object[]>} A promise that resolves to an array of video results.
 */
async function getYoutubeResults(searchQuery: string) {
  logger.info(`[getYoutubeResults] Searching YouTube for: "${searchQuery}"`);

  if (!YOUTUBE_API_KEY) {
    logger.error(`[getYoutubeResults] YouTube API key is missing!`);
    throw new Error("YouTube API key is not configured.");
  }

  try {
    // Simple query approach - just append whisky review to the search
    const youtubeQuery = `${searchQuery} whisky review`;
    logger.info(`[getYoutubeResults] Final YouTube query: "${youtubeQuery}"`);

    // Simple params with minimal restrictions
    const params = {
      part: "snippet",
      type: "video",
      maxResults: INITIAL_FETCH_COUNT,
      q: youtubeQuery,
      relevanceLanguage: "en",
      key: YOUTUBE_API_KEY,
    };

    logger.info(
      `[getYoutubeResults] Making YouTube API request with max results: ${INITIAL_FETCH_COUNT}`
    );
    logger.debug(
      `[getYoutubeResults] Search parameters: ${JSON.stringify(
        params,
        null,
        2
      )}`
    );

    // Make the HTTP request to YouTube API
    const response = await axios.get(YOUTUBE_API_URL, { params });

    logger.info(
      `[getYoutubeResults] YouTube API returned ${
        response.data.items?.length || 0
      } results`
    );

    // Simple mapping of results without any filtering
    let videoResults = response.data.items.map((item: videoResult) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    // Cap at the maximum results we actually want to use
    videoResults = videoResults.slice(0, MAX_YT_RESULTS);

    if (videoResults.length > 0) {
      logger.info(
        `[getYoutubeResults] Final result: ${videoResults.length} videos. First title: "${videoResults[0].title}"`
      );
      // Log all video IDs for debugging
      logger.debug(
        `[getYoutubeResults] Video IDs: ${videoResults
          .map((v: { id: string }) => v.id)
          .join(", ")}`
      );
    } else {
      logger.warn(`[getYoutubeResults] No videos found in API response`);
    }

    // If we don't have any results, log an error
    if (videoResults.length === 0) {
      logger.error(
        `[getYoutubeResults] Failed to find any videos for query: "${searchQuery}"`
      );
    }

    return videoResults;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        `[getYoutubeResults] YouTube API error (${
          error.response?.status || "unknown"
        }):`,
        error.response?.data || error.message
      );
    } else {
      logger.error(
        `[getYoutubeResults] Failed to fetch YouTube results:`,
        error
      );
    }
    throw error; // Rethrow or handle as needed
  }
}

export default getYoutubeResults;
