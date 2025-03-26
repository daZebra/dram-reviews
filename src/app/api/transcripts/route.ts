import { NextResponse } from "next/server";
import { fetchTranscript } from "@/lib/youtube/youtube-api";
import { logger } from "@/lib/logger";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Check if the Python dependencies are installed
async function checkDependencies() {
  try {
    await execAsync('python3 -c "import youtube_transcript_api"');
    return { installed: true };
  } catch (error: any) {
    const errorMessage = error.stderr || error.message;
    if (errorMessage.includes("No module named 'youtube_transcript_api'")) {
      return {
        installed: false,
        message:
          "Missing Python dependency: youtube_transcript_api. Please install it with: pip install youtube-transcript-api",
      };
    } else if (errorMessage.includes("python3")) {
      return {
        installed: false,
        message:
          "Python 3 is not installed or not in PATH. Please install Python 3.",
      };
    }
    return {
      installed: false,
      message: `Unknown error checking dependencies: ${errorMessage}`,
    };
  }
}

export async function POST(request: Request) {
  try {
    // First check if dependencies are installed
    const dependencyCheck = await checkDependencies();
    if (!dependencyCheck.installed) {
      logger.error(`Dependency check failed: ${dependencyCheck.message}`);
      return NextResponse.json(
        {
          error: "Dependency Error",
          message: dependencyCheck.message,
          details:
            "The API requires Python and youtube-transcript-api to function. Please check the installation instructions in the README.",
        },
        { status: 500 }
      );
    }

    const requestData = await request.json();
    const { video_ids } = requestData;

    if (!video_ids || !Array.isArray(video_ids) || video_ids.length === 0) {
      logger.warn(
        "Invalid request to transcripts API: Missing or empty video_ids array"
      );
      return NextResponse.json(
        { error: "Missing or invalid video_ids parameter" },
        { status: 400 }
      );
    }

    logger.info(
      `Transcript API request received for ${video_ids.length} videos`
    );

    // Process each video ID and fetch transcripts
    const transcriptPromises = video_ids.map(async (videoId) => {
      try {
        logger.info(`Fetching transcript for video ${videoId}`);
        const transcript = await fetchTranscript(videoId);
        return { videoId, transcript };
      } catch (error) {
        logger.error(`Error fetching transcript for video ${videoId}:`, error);
        return { videoId, transcript: "none" };
      }
    });

    const transcriptResults = await Promise.all(transcriptPromises);

    // Convert array of results to an object with video IDs as keys
    const responseData = transcriptResults.reduce(
      (acc, { videoId, transcript }) => {
        acc[videoId] = transcript;
        return acc;
      },
      {} as Record<string, string>
    );

    logger.info(
      `Successfully processed ${transcriptResults.length} transcript requests`
    );

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error("Error in transcripts API:", error);
    return NextResponse.json(
      { error: "Failed to process transcript request" },
      { status: 500 }
    );
  }
}
