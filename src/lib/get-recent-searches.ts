import prisma from "./db";

export async function getRecentSearches(count = 3) {
  try {
    const recentProducts = await prisma.productItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: count,
    });

    return recentProducts.map((product) => product.productName);
  } catch (error) {
    console.log("Failed to fetch recent product names:", error);
    console.error("Failed to fetch recent product names:", error);
    return [];
  }
}

// import prisma from "./db";
// import { ReviewItem } from "@prisma/client";

// export async function getRecentSearches(count = 3) {
//   // Use Prisma's groupBy to perform the aggregation
//   const groupedReviews = await prisma.reviewItem.groupBy({
//     by: ["searchQuery"],
//     _max: {
//       updatedAt: true,
//     },
//     orderBy: {
//       _max: {
//         updatedAt: "desc",
//       },
//     },
//     take: count,
//   });

//   // After getting the latest updates, fetch the corresponding ReviewItems
//   const latestSearches = await Promise.all(
//     groupedReviews.map(async (group) => {
//       if (group._max.updatedAt !== null) {
//         // Check for null explicitly
//         return prisma.reviewItem.findFirst({
//           where: {
//             searchQuery: group.searchQuery,
//             updatedAt: group._max.updatedAt,
//           },
//           select: {
//             searchQuery: true,
//             videoId: true,
//           },
//         });
//       }
//       return null;
//     })
//   );

//   // Filter out null results and map to desired structure
//   const searches = latestSearches
//     .filter((review): review is ReviewItem => review !== null)
//     .map((review) => ({
//       query: review.searchQuery,
//       videoId: review.videoId,
//     }));

//   return { searches };
// }
