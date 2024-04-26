import prisma from "./db";
import { ReviewItem } from "@prisma/client";

export async function getRecentSearches(count = 3) {
  // Use a raw query to fetch unique reviews based on `searchQuery`
  const reviews = await prisma.$queryRaw<ReviewItem[]>`
    SELECT ri.*
    FROM ReviewItem ri
    INNER JOIN (
        SELECT searchQuery, MAX(updatedAt) as maxUpdatedAt
        FROM ReviewItem
        GROUP BY searchQuery
    ) groupedRi ON ri.searchQuery = groupedRi.searchQuery AND ri.updatedAt = groupedRi.maxUpdatedAt
    ORDER BY ri.updatedAt DESC
    LIMIT ${count};
  `;

  // Assuming that each review has a 'searchQuery' and 'videoId' field
  // Map the result to only include these fields
  const searches = reviews.map((review) => ({
    query: review.searchQuery,
    videoId: review.videoId,
  }));

  return { searches };
}
