import prisma from "./db";

export async function getReviews(searchQuery: string) {
  console.log(
    `[getReviews] Searching for reviews with query: "${searchQuery}"`
  );

  // Convert the search query to lowercase
  const lowerCaseSearchQuery = searchQuery.toLowerCase();
  console.log(
    `[getReviews] Normalized search query to: "${lowerCaseSearchQuery}"`
  );

  try {
    const reviews = await prisma.reviewItem.findMany({
      where: {
        OR: [
          { searchQuery: lowerCaseSearchQuery },
          { productName: lowerCaseSearchQuery },
        ],
      },
    });

    const totalCount = await prisma.reviewItem.count({
      where: {
        OR: [
          { searchQuery: lowerCaseSearchQuery },
          { productName: lowerCaseSearchQuery },
        ],
      },
    });

    console.log(
      `[getReviews] Found ${totalCount} reviews for query: "${lowerCaseSearchQuery}"`
    );
    if (totalCount > 0) {
      console.log(
        `[getReviews] First review title: "${reviews[0]?.title || "N/A"}"`
      );
    }

    return { reviews, totalCount };
  } catch (error) {
    console.error(`[getReviews] Error fetching reviews:`, error);
    throw error;
  }
}
