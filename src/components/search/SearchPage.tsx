"use client";

import { ProductItem, ReviewItem } from "@prisma/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { decodeHtmlEntities } from "@/lib/utils";

type SearchResults = {
  reviews: ReviewItem[];
  totalCount: number;
  product: ProductItem | null;
};

type SearchPageProps = {
  query: string;
  searchResults: SearchResults | undefined;
};

export default function SearchPage({ query, searchResults }: SearchPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testTranscripts, setTestTranscripts] = useState<null | Record<
    string,
    string
  >>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Function to test our transcript API directly
  const testTranscriptApi = async () => {
    if (!searchResults?.reviews.length) return;

    setIsLoading(true);
    setTestError(null);

    try {
      // Get first 2 video IDs from the results
      const videoIds = searchResults.reviews
        .slice(0, 2)
        .map((review) => review.videoId);

      // Call our API - for client side, relative URL works but let's be consistent
      const baseUrl = window.location.origin; // In the browser, we can use the current origin

      const response = await fetch(`${baseUrl}/api/transcripts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_ids: videoIds }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      setTestTranscripts(data);
    } catch (error) {
      console.error("Error testing transcript API:", error);
      setTestError((error as Error).message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!searchResults) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Search Results for "{query}"
        </h1>
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded">
          <p>No results found for this search query.</p>
          <p className="mt-2">
            We're still working on expanding our database. Please try a
            different search term or check back later.
          </p>
          <Link href="/" className="text-blue-600 hover:underline block mt-4">
            Return to Home
          </Link>

          <button
            onClick={testTranscriptApi}
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Testing API..." : "Test Transcript API"}
          </button>
        </div>
      </div>
    );
  }

  const { reviews, totalCount, product } = searchResults;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {product && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">{product.productName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Details</h3>
              <p className="text-gray-600">Age: {product.age || "Unknown"}</p>
              <p className="text-gray-600">
                Region: {product.region || "Unknown"}
              </p>
              <p className="text-gray-600">ABV: {product.abv || "Unknown"}</p>
            </div>
            <div>
              <h3 className="font-medium">Ratings</h3>
              <p className="text-gray-600">
                Overall: {product.overallScore?.toFixed(1) || "N/A"}/10
              </p>
              <p className="text-gray-600">
                Value: {product.priceScore?.toFixed(1) || "N/A"}/10
              </p>
              <p className="text-gray-600">
                Complexity: {product.complexityScore?.toFixed(1) || "N/A"}/10
              </p>
            </div>
            <div>
              <h3 className="font-medium">Summary</h3>
              <p className="text-gray-600 line-clamp-3">
                {product.reviewSummary || "No summary available"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600">Found {totalCount} reviews</p>

        <button
          onClick={testTranscriptApi}
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Testing API..." : "Test Transcript API"}
        </button>

        {testError && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
            Error: {testError}
          </div>
        )}

        {testTranscripts && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded overflow-hidden">
            <h3 className="font-medium mb-2">API Test Results</h3>
            {Object.entries(testTranscripts).map(([videoId, transcript]) => (
              <div key={videoId} className="mb-4 last:mb-0">
                <p className="font-semibold">Video ID: {videoId}</p>
                {transcript === "none" ? (
                  <p className="text-red-600">No transcript available</p>
                ) : (
                  <>
                    <p className="text-green-600">
                      Transcript found ({transcript.length} characters)
                    </p>
                    <div className="mt-1 p-2 bg-gray-100 rounded max-h-32 overflow-y-auto">
                      <p className="text-sm">
                        {transcript.substring(0, 300)}...
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review.videoId}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="aspect-video relative">
              <Image
                src={review.thumbnailUrl}
                alt={decodeHtmlEntities(review.title)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold line-clamp-2 mb-2">
                {decodeHtmlEntities(review.title)}
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                {decodeHtmlEntities(review.channelTitle)} •{" "}
                {new Date(review.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 line-clamp-3 mb-3">
                {review.reviewSummary
                  ? decodeHtmlEntities(review.reviewSummary)
                  : "No summary available"}
              </p>
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  Score: {review.overallScore?.toFixed(1) || "N/A"}/10
                </span>
                <a
                  href={`https://youtube.com/watch?v=${review.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded">
          <p>No reviews found for this search query.</p>
          <p className="mt-2">
            We're still working on expanding our database. Please try a
            different search term or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
