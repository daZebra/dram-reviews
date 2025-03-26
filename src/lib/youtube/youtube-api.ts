/**
 * YouTube API module for fetching transcripts
 */
import { logger } from "@/lib/logger";
import { YoutubeTranscript } from "youtube-transcript";

// Define the interface for transcript items
interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

/**
 * Fetches the transcript for a YouTube video using youtube-transcript npm package
 * @param videoId The YouTube video ID
 * @returns The transcript text or 'none' if not available
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  logger.debug(`Starting transcript fetch for video ${videoId}`);

  try {
    // Fetch transcript using the youtube-transcript npm package
    const transcriptItems = (await YoutubeTranscript.fetchTranscript(
      videoId
    )) as TranscriptItem[];

    if (!transcriptItems || transcriptItems.length === 0) {
      logger.warn(`No transcript found for video ${videoId}`);
      return "none";
    }

    // Join all transcript pieces into a single string
    const fullTranscript = transcriptItems
      .map((item: TranscriptItem) => item.text)
      .join(" ");

    if (fullTranscript.length < 50) {
      logger.warn(
        `Transcript too short for video ${videoId} (${fullTranscript.length} chars)`
      );
      return "none";
    }

    logger.info(
      `Successfully fetched transcript for ${videoId} (${fullTranscript.length} chars)`
    );
    return fullTranscript;
  } catch (error) {
    logger.error(`Error fetching transcript for ${videoId}:`, error);
    return "none";
  }
}
