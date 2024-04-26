import prisma from "./db";

export async function getReviews(searchQuery: string) {
  // Convert the search query to lowercase
  const lowerCaseSearchQuery = searchQuery.toLowerCase();

  const reviews = await prisma.reviewItem.findMany({
    where: {
      searchQuery: lowerCaseSearchQuery,
    },
  });

  const totalCount = await prisma.reviewItem.count({
    where: {
      searchQuery: lowerCaseSearchQuery,
    },
  });
  return { reviews, totalCount };
}
