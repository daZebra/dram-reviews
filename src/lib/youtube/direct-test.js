// This script tests YouTube caption availability directly via YouTube Data API
// Run with: node src/lib/youtube/direct-test.js VIDEO_ID YOUR_API_KEY

const axios = require("axios");

async function checkYouTubeVideo(videoId, apiKey) {
  if (!videoId || !apiKey) {
    console.error("Usage: node direct-test.js VIDEO_ID YOUR_API_KEY");
    process.exit(1);
  }

  console.log(`\nChecking video: https://www.youtube.com/watch?v=${videoId}\n`);

  try {
    // 1. First, get video details using YouTube Data API
    console.log("1. Fetching video details from YouTube Data API...");
    const videoResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      console.error("Error: Video not found");
      return;
    }

    const videoDetails = videoResponse.data.items[0];
    console.log("\nVideo details:");
    console.log(`Title: ${videoDetails.snippet.title}`);
    console.log(`Channel: ${videoDetails.snippet.channelTitle}`);
    console.log(`Published: ${videoDetails.snippet.publishedAt}`);

    // Check if the video has captions according to contentDetails
    const hasCaptions = videoDetails.contentDetails.caption === "true";
    console.log(`Has captions (according to API): ${hasCaptions}`);

    // 2. Get caption tracks for the video
    console.log("\n2. Fetching caption tracks...");
    const captionResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
    );

    const captions = captionResponse.data.items || [];
    console.log(`Found ${captions.length} caption tracks:`);

    if (captions.length > 0) {
      captions.forEach((caption, i) => {
        console.log(`\nTrack ${i + 1}:`);
        console.log(`Language: ${caption.snippet.language}`);
        console.log(`Track ID: ${caption.id}`);
        console.log(`Track kind: ${caption.snippet.trackKind}`);
        console.log(
          `Is CC: ${
            caption.snippet.trackKind === "ASR" ? "No (auto-generated)" : "Yes"
          }`
        );
      });
    } else {
      console.log("No caption tracks found through the API.");
      console.log("This usually means either:");
      console.log("1. The video has no captions at all");
      console.log(
        "2. The video has only auto-generated captions that aren't visible to the API"
      );
    }

    // 3. Additional check for problems
    console.log("\n3. Possible issues with your current setup:");

    if (!hasCaptions && captions.length === 0) {
      console.log("- This video appears to have no captions at all");
      console.log("- You should try a different video for your tests");
    } else if (hasCaptions && captions.length === 0) {
      console.log("- This video may have only auto-generated captions");
      console.log(
        "- The youtube-transcript-api might still work even though the Data API shows no captions"
      );
    }

    console.log("\n4. Recommendations:");
    console.log("- Try running the Python test script for this video:");
    console.log(`  python src/lib/youtube/transcript-test.py ${videoId}`);
    console.log(
      "- The YouTube Transcript API may access captions that the Data API cannot"
    );
    console.log(
      "- Make sure your Cloud Function is properly calling the YouTube Transcript API"
    );
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

// Run the test with command line arguments
const videoId = process.argv[2];
const apiKey = process.argv[3];
checkYouTubeVideo(videoId, apiKey);
