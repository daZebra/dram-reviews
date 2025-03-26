/**
 * Simple script to test the new YouTube transcript API endpoint
 *
 * Usage:
 * 1. Start your Next.js development server: npm run dev
 * 2. In another terminal, run: node src/lib/youtube/test-api.js
 */

const fetch = require("node-fetch");

async function testTranscriptApi() {
  console.log("Testing YouTube Transcript API endpoint...");

  // Test the specific video IDs requested by the user
  const videoIds = [
    "TI0Q7z-4VLs", // First test ID
    "jESHMGi-Ro4", // Second test ID
    "7S3kIskUZN0", // Third test ID
  ];

  console.log(
    `Testing with ${videoIds.length} video IDs: ${videoIds.join(", ")}`
  );

  try {
    // When running the test script outside of the Next.js app, we need to use the full URL
    const baseUrl = "http://localhost:3000";
    console.log(
      `Sending request to API endpoint at: ${baseUrl}/api/transcripts`
    );

    const response = await fetch(`${baseUrl}/api/transcripts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_ids: videoIds }),
    });

    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Response received:");

    // Process each transcript
    for (const [videoId, transcript] of Object.entries(data)) {
      if (transcript === "none") {
        console.log(`❌ Video ${videoId}: No usable transcript found`);
      } else {
        console.log(
          `✅ Video ${videoId}: Transcript found (${transcript.length} characters)`
        );
        console.log(`Preview: "${transcript.substring(0, 100)}..."`);
      }
      console.log("---");
    }

    console.log("API test complete!");
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

// Run the test
testTranscriptApi().catch(console.error);
