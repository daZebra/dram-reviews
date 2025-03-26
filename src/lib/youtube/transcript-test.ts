// This is a standalone test file for the YouTube Transcript API
// Run it with: npx ts-node src/lib/youtube/transcript-test.ts <video_id>

const axios = require("axios");

// Test the current Cloud Function approach
async function testCloudFunction(videoId: string) {
  console.log(`Testing Cloud Function with video ID: ${videoId}`);

  try {
    const response = await axios.post(
      "https://us-central1-youtube-product-reviews-420119.cloudfunctions.net/get_transcripts",
      { video_ids: [videoId] }
    );

    console.log("Cloud Function Response:");
    console.log(JSON.stringify(response.data, null, 2));

    // Check if transcript is usable
    const transcript = response.data[videoId];
    if (!transcript || transcript === "none" || transcript.length < 50) {
      console.log('⚠️ Transcript is not usable (null, "none", or too short)');
    } else {
      console.log(
        `✅ Usable transcript found (${transcript.length} characters)`
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error with Cloud Function approach:", error);
    return null;
  }
}

// Install youtube-transcript-api first:
// npm install youtube-transcript-api
// Function to test the direct YouTube Transcript API approach
// This won't work until you install the package
async function testDirectApi(videoId: string) {
  console.log(
    `\nThis function is commented out until you install the YouTube Transcript API package.`
  );
  console.log(`Run: npm install youtube-transcript-api`);
  console.log(`Then uncomment the code in transcript-test.ts`);

  /* 
  // Uncomment this code after installing the package
  
  try {
    // Import dynamically to avoid errors if package isn't installed
    const { YouTubeTranscriptApi } = require('youtube-transcript-api');
    
    console.log(`Testing direct YouTube Transcript API with video ID: ${videoId}`);
    
    const ytt_api = new YouTubeTranscriptApi();
    const transcript = await ytt_api.fetch(videoId);
    
    console.log('Direct API Response:');
    console.log(JSON.stringify(transcript.to_raw_data().slice(0, 3), null, 2)); // Show first 3 items
    console.log(`... (${transcript.length} total transcript snippets)`);
    
    return transcript;
  } catch (error) {
    console.error('Error with direct API approach:', error);
    return null;
  }
  */
}

// Run tests with command line argument as video ID
async function main() {
  // Get video ID from command line
  const videoId = process.argv[2];

  if (!videoId) {
    console.error("Please provide a YouTube video ID as an argument.");
    console.error(
      "Example: npx ts-node src/lib/youtube/transcript-test.ts dQw4w9WgXcQ"
    );
    process.exit(1);
  }

  // Display youtube video URL for reference
  console.log(
    `Testing with video: https://www.youtube.com/watch?v=${videoId}\n`
  );

  // Test current cloud function approach
  await testCloudFunction(videoId);

  // Test direct API approach
  // This won't work until you install the package and uncomment the code
  await testDirectApi(videoId);
}

// Run the tests
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

// Instructions to run:
// 1. npx ts-node src/lib/youtube/transcript-test.ts <video_id>
// 2. Try with known videos that should have transcripts:
//    - dQw4w9WgXcQ (Rick Astley - Never Gonna Give You Up)
//    - jNQXAC9IVRw (Me at the zoo - First YouTube video)
//    - eg-F_NNTbLE (Whisky Review/Tasting: Scapa Skiren)
