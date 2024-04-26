import prisma from "./db";

export async function getAllReviews(count = 20) {
  // Fetch the first 20 reviews ordered by updatedAt in descending order
  const reviews = await prisma.reviewItem.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: count,
  });

  // Count the total number of reviews in the database
  const totalCount = await prisma.reviewItem.count();

  return { reviews, totalCount };
}
