import prisma from "./db";

export async function getReview(videoId: string) {
  const review = await prisma.reviewItem.findUnique({
    where: {
      videoId: videoId,
    },
  });

  return review;
}
