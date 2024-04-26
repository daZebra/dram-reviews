"use server";

import { ReviewItem } from "@prisma/client";
import { MIN_REVIEW_COUNT, MIN_SEARCH_CHAR } from "../const";
import prisma from "../db";
import analyzeTranscriptGpt from "../openai/analyzeTranscriptGpt";
import { getReviews } from "../get-reviews";
import getYoutubeResults from "../youtube/getYoutubeResults";

type SearchResults = {
  reviews: ReviewItem[];
  totalCount: number;
};

type VideoResult = {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
};

export default async function handleSearch(
  query: string
): Promise<SearchResults | undefined> {
  const searchQuery = query;

  if (searchQuery.length <= MIN_SEARCH_CHAR || !searchQuery) {
    return;
  }

  let { reviews, totalCount } = await getReviews(searchQuery);

  console.log(`Count of entries for query {${searchQuery}}: ${totalCount}`);

  if (totalCount >= MIN_REVIEW_COUNT) {
    return { reviews, totalCount };
  }

  const videoResults = await getYoutubeResults(searchQuery);
  const videoIds = videoResults.map((video: VideoResult) => video.id);

  console.log("Video ids: " + JSON.stringify(videoIds));

  const transcriptResponse = await fetch(
    "https://us-central1-youtube-product-reviews-420119.cloudfunctions.net/get_transcripts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_ids: videoIds }),
    }
  ).then((res) => res.json());

  const transcriptEntries = Object.entries<string>(transcriptResponse);
  const validTranscripts = transcriptEntries.filter(
    ([, transcript]) =>
      transcript !== "none" && transcript != null && transcript.length > 100
  );

  //   console.log("Valid Transcripts: " + JSON.stringify(validTranscripts));

  const videoTranscriptMap = new Map<string, string>(validTranscripts);

  const analysisPromises = validTranscripts.map(([, transcript]) =>
    analyzeTranscriptGpt(transcript)
  );
  const analyzedTranscripts = await Promise.all(analysisPromises);

  for (const [index, analyzedTranscript] of analyzedTranscripts.entries()) {
    const [videoId] = validTranscripts[index];

    console.log("Looping over video id " + videoId);

    const transcript = videoTranscriptMap.get(videoId) || "";
    const videoResult = videoResults.find(
      (video: VideoResult) => video.id === videoId
    );

    const review = {
      videoId,
      title: videoResult.title,
      thumbnailUrl: videoResult.thumbnailUrl,
      channelTitle: videoResult.channelTitle,
      publishedAt: videoResult.publishedAt,
      transcript,
      tasteProfile: JSON.stringify(analyzedTranscript.tasteProfile),
      whiskyReview: JSON.stringify(analyzedTranscript.whiskyReview),
      critique: JSON.stringify(analyzedTranscript.critique),
      rating: analyzedTranscript.rating.toString(),
      searchQuery: searchQuery.toLowerCase(),
    };

    console.log(
      "Adding item to prisma: " + videoId + "\n Critique: " + review.critique
    );

    await prisma.reviewItem.upsert({
      where: { videoId },
      update: {},
      create: review,
    });
  }

  // Fetch the updated reviews after insertion
  const updatedReviews = await getReviews(searchQuery);
  return {
    reviews: updatedReviews.reviews,
    totalCount: updatedReviews.totalCount,
  };
}
