/**
 * YouTube API module for fetching transcripts
 */
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import { logger } from "@/lib/logger";

const execAsync = promisify(exec);

/**
 * Check if the required Python dependencies are installed
 * @returns Promise<boolean> True if all dependencies are installed, false otherwise
 */
async function checkPythonDependencies(): Promise<boolean> {
  try {
    logger.debug("Checking if Python and youtube_transcript_api are installed");

    // First check if Python is installed
    await execAsync("python3 --version");

    // Then check if youtube_transcript_api is installed
    await execAsync('python3 -c "import youtube_transcript_api"');

    logger.debug("Python dependencies check passed");
    return true;
  } catch (error: any) {
    logger.error("Python dependency check failed:", error);

    if (error.stderr?.includes("No module named 'youtube_transcript_api'")) {
      logger.error(
        "youtube_transcript_api module is not installed. Please install it with: pip install youtube-transcript-api"
      );
    } else if (error.stderr?.includes("python3")) {
      logger.error(
        "Python 3 is not installed or not in PATH. Please install Python 3"
      );
    }

    return false;
  }
}

/**
 * Fetches the transcript for a YouTube video using youtube-transcript-api
 * @param videoId The YouTube video ID
 * @returns The transcript text or 'none' if not available
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  logger.debug(`Starting transcript fetch for video ${videoId}`);

  // Check dependencies first
  const dependenciesInstalled = await checkPythonDependencies();
  if (!dependenciesInstalled) {
    logger.error("Missing Python dependencies - cannot fetch transcript");
    return "none";
  }

  // Create a temporary Python script in the OS temp directory
  const tempDir = os.tmpdir();
  const tempScriptPath = path.join(
    tempDir,
    `transcript_fetcher_${Date.now()}_${videoId}.py`
  );

  logger.debug(`Creating temporary Python script at ${tempScriptPath}`);

  // Define the Python script content
  const scriptContent = `
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id):
    try:
        # Create API instance
        ytt_api = YouTubeTranscriptApi()
        
        # Fetch transcript
        fetched_transcript = ytt_api.fetch(video_id)
        
        # Convert to raw data
        transcript_data = fetched_transcript.to_raw_data()
        
        # Join text to create full transcript
        full_text = ' '.join([item['text'] for item in transcript_data])
        
        if len(full_text) > 50:  # Only consider it valid if it has reasonable content
            return full_text
        else:
            print(f"Transcript too short ({len(full_text)} chars)", file=sys.stderr)
            return "none"
        
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}", file=sys.stderr)
        return "none"

# Read video ID from command line argument
if len(sys.argv) > 1:
    video_id = sys.argv[1]
    result = get_transcript(video_id)
    print(json.dumps(result))
else:
    print(json.dumps("none"))
`;

  // Write the Python script to a temporary file
  fs.writeFileSync(tempScriptPath, scriptContent);

  try {
    logger.debug(`Executing Python script for ${videoId}`);

    // Execute the Python script
    const { stdout, stderr } = await execAsync(
      `python3 ${tempScriptPath} ${videoId}`,
      {
        maxBuffer: 1024 * 1024 * 5, // 5MB buffer for potentially large transcripts
      }
    );

    if (stderr) {
      logger.debug(`Python script stderr: ${stderr}`);
    }

    try {
      // Parse the JSON result
      const transcript = JSON.parse(stdout);

      if (typeof transcript === "string" && transcript !== "none") {
        logger.info(
          `Successfully fetched transcript for ${videoId} (${transcript.length} chars)`
        );
        return transcript;
      } else {
        logger.warn(`No valid transcript found for ${videoId}`);
        return "none";
      }
    } catch (parseError) {
      logger.error(`Failed to parse JSON result for ${videoId}:`, parseError);
      return "none";
    }
  } catch (error: any) {
    logger.error(`Error executing Python script for ${videoId}:`, error);
    return "none";
  } finally {
    // Clean up the temporary script
    try {
      fs.unlinkSync(tempScriptPath);
      logger.debug(`Deleted temporary Python script for ${videoId}`);
    } catch (e) {
      logger.error(`Failed to delete temporary script for ${videoId}:`, e);
    }
  }
}
