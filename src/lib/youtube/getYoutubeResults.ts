import axios from "axios";
import { MAX_YT_RESULTS, MIN_REVIEW_COUNT } from "../const";

// Environment variable for API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Base URL for YouTube Data API
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

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
  try {
    const params = {
      part: "snippet",
      type: "video",
      maxResults: MAX_YT_RESULTS, // Adjust number of results as needed
      q: searchQuery + " review",
      relevanceLanguage: "en",
      // order: "date",
      // videoDuration: "medium",
      key: YOUTUBE_API_KEY,
      // videoCaption: "closedCaption", // Include only videos with captions
    };

    // Make the HTTP request to YouTube API
    const response = await axios.get(YOUTUBE_API_URL, { params });

    // Map response to a format that suits your application's needs
    const videoResults = response.data.items.map((item: videoResult) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    return videoResults;
  } catch (error) {
    console.error("Failed to fetch YouTube results", error);
    throw error; // Rethrow or handle as needed
  }
}

export default getYoutubeResults;
