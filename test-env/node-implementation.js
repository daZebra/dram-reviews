/**
 * Node.js Implementation of YouTube Transcript Fetching
 *
 * This demonstrates how to implement YouTube transcript fetching in your Next.js application.
 * You can create an API endpoint in your Next.js app based on this implementation.
 *
 * Running this demo:
 * 1. npm install axios
 * 2. node node-implementation.js <video_id>
 */

const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to fetch transcripts using the Python YouTube Transcript API
async function getTranscriptsWithPython(videoIds) {
  console.log(
    `Fetching transcripts for ${videoIds.length} videos using Python...`
  );

  // Create a temporary Python script
  const tempScriptPath = path.join(__dirname, "temp_transcript_fetcher.py");
  const scriptContent = `
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcripts(video_ids):
    results = {}
    
    for video_id in video_ids:
        try:
            # Create API instance
            ytt_api = YouTubeTranscriptApi()
            
            # Fetch transcript
            transcript = ytt_api.fetch(video_id)
            
            # Convert to raw data
            transcript_data = transcript.to_raw_data()
            
            # Join text to create full transcript
            full_text = ' '.join([item['text'] for item in transcript_data])
            
            results[video_id] = full_text
            
        except Exception as e:
            results[video_id] = "none"
            print(f"Error fetching transcript for {video_id}: {str(e)}", file=sys.stderr)
    
    # Output as JSON
    print(json.dumps(results))

# Read video IDs from command line arguments
if len(sys.argv) > 1:
    video_ids = sys.argv[1].split(',')
    get_transcripts(video_ids)
else:
    print(json.dumps({"error": "No video IDs provided"}))
  `;

  fs.writeFileSync(tempScriptPath, scriptContent);

  try {
    // Execute the Python script
    const videoIdsStr = videoIds.join(",");
    const result = execSync(`python ${tempScriptPath} ${videoIdsStr}`, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large transcripts
    });

    // Parse the JSON result
    const transcripts = JSON.parse(result);

    return transcripts;
  } catch (error) {
    console.error("Error executing Python script:", error.message);
    // Return empty transcripts if there's an error
    return videoIds.reduce((acc, id) => {
      acc[id] = "none";
      return acc;
    }, {});
  } finally {
    // Clean up the temporary script
    try {
      fs.unlinkSync(tempScriptPath);
    } catch (e) {
      console.error("Failed to delete temporary script:", e);
    }
  }
}

// Function to create a Next.js API route handler
async function createApiHandler(req, res) {
  // This would be the implementation of your Next.js API route
  const { video_ids } = req.body;

  if (!video_ids || !Array.isArray(video_ids) || video_ids.length === 0) {
    return {
      status: 400,
      body: {
        error:
          "Missing or invalid video_ids parameter. Expected non-empty array.",
      },
    };
  }

  try {
    const transcripts = await getTranscriptsWithPython(video_ids);
    return {
      status: 200,
      body: transcripts,
    };
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return {
      status: 500,
      body: { error: "Failed to fetch transcripts: " + error.message },
    };
  }
}

// Simple function to simulate an API request
async function simulateApiRequest(videoIds) {
  console.log(`Simulating API request for video IDs: ${videoIds.join(", ")}`);

  // Create mock request and response objects
  const req = {
    body: { video_ids: videoIds },
  };

  let statusCode = null;
  let responseBody = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (body) => {
      responseBody = body;
      console.log(`Response [${statusCode}]:`, JSON.stringify(body, null, 2));
    },
  };

  // Call the handler function
  const result = await createApiHandler(req, res);

  if (result) {
    console.log(`Handler returned:`, JSON.stringify(result, null, 2));
  }
}

// Main function to run a demo
async function main() {
  const videoIds = process.argv.slice(2);

  if (videoIds.length === 0) {
    console.log(
      "Please provide at least one YouTube video ID as a command line argument"
    );
    console.log("Example: node node-implementation.js QtUSxUwCqlg");
    process.exit(1);
  }

  console.log(
    "======= YouTube Transcript API - Node.js Implementation ======="
  );
  console.log("This is a demonstration of how to implement YouTube transcript");
  console.log("fetching in a Next.js application using Python as a backend.");
  console.log("==============================================================");

  // Directly fetch transcripts
  console.log("\n1. Direct transcript fetching:");
  try {
    const transcripts = await getTranscriptsWithPython(videoIds);
    console.log("Transcripts:", JSON.stringify(transcripts, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }

  // Simulate an API request
  console.log("\n2. Simulating API request:");
  await simulateApiRequest(videoIds);

  console.log(
    "\n=============================================================="
  );
  console.log("To implement this in your Next.js application:");
  console.log(
    "1. Install Python and the youtube-transcript-api package on your server"
  );
  console.log(
    "2. Create an API route in pages/api/transcripts.js or app/api/transcripts/route.js"
  );
  console.log(
    "3. Use the getTranscriptsWithPython function to fetch transcripts"
  );
  console.log("4. Call this API endpoint from your client code");
  console.log("==============================================================");
}

// Run the demo
main().catch(console.error);
