/**
 * Script to test specific YouTube video IDs for transcript availability
 *
 * Usage:
 * 1. Start your Next.js development server: npm run dev
 * 2. In another terminal, run: node src/lib/youtube/test-specific-ids.js
 */

const fetch = require("node-fetch");

async function testSpecificVideoIds() {
  console.log(
    "Testing specific YouTube video IDs for transcript availability..."
  );

  // The specific video IDs to test
  const videoIds = [
    "TI0Q7z-4VLs", // First test ID
    "jESHMGi-Ro4", // Second test ID
    "7S3kIskUZN0", // Third test ID
  ];

  console.log(
    `Testing ${videoIds.length} specific video IDs: ${videoIds.join(", ")}`
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

    // Process and display detailed results for each video
    console.log("\n=== TRANSCRIPT TEST RESULTS ===\n");

    let foundCount = 0;
    let missingCount = 0;

    for (const [videoId, transcript] of Object.entries(data)) {
      console.log(`Video ID: ${videoId}`);
      console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);

      if (transcript === "none") {
        console.log(`❌ RESULT: No usable transcript found`);
        missingCount++;
      } else {
        console.log(
          `✅ RESULT: Transcript found (${transcript.length} characters)`
        );
        console.log(`Preview: "${transcript.substring(0, 100)}..."`);
        foundCount++;
      }
      console.log("---");
    }

    // Summary
    console.log("\n=== SUMMARY ===");
    console.log(`Total videos tested: ${videoIds.length}`);
    console.log(`Videos with transcripts: ${foundCount}`);
    console.log(`Videos without transcripts: ${missingCount}`);

    if (foundCount === 0) {
      console.log(
        "\n❗ NOTE: No transcripts were found for any of these videos."
      );
      console.log("This could be due to:");
      console.log("1. These videos don't have any captions/subtitles");
      console.log("2. YouTube API restrictions on accessing these transcripts");
      console.log(
        "3. Issues with your Python youtube-transcript-api installation"
      );
      console.log(
        "\nTo troubleshoot, try running the installation helper script:"
      );
      console.log("node src/lib/youtube/install-deps.js");
    }

    console.log("\nTest complete!");
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

// Run the test
testSpecificVideoIds().catch(console.error);
