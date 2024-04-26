import prisma from "./db";
import { ReviewItem } from "@prisma/client";

export async function getRecentSearches(count = 3) {
  // Use Prisma's groupBy to perform the aggregation
  const groupedReviews = await prisma.reviewItem.groupBy({
    by: ["searchQuery"],
    _max: {
      updatedAt: true,
    },
    orderBy: {
      _max: {
        updatedAt: "desc",
      },
    },
    take: count,
  });

  // After getting the latest updates, fetch the corresponding ReviewItems
  const latestSearches = await Promise.all(
    groupedReviews.map(async (group) => {
      if (group._max.updatedAt !== null) {
        // Check for null explicitly
        return prisma.reviewItem.findFirst({
          where: {
            searchQuery: group.searchQuery,
            updatedAt: group._max.updatedAt,
          },
          select: {
            searchQuery: true,
            videoId: true,
          },
        });
      }
      return null;
    })
  );

  // Filter out null results and map to desired structure
  const searches = latestSearches
    .filter((review): review is ReviewItem => review !== null)
    .map((review) => ({
      query: review.searchQuery,
      videoId: review.videoId,
    }));

  return { searches };
}
