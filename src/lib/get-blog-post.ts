// import prisma from "./db";
// import { getReview } from "./get-review";
// import writeBlogPostGpt from "./openai/write-blog-post-gpt";

// export default async function getBlogPost(videoId: string) {
//   const review = await getReview(videoId);

//   //   console.log(review?.title);

//   if (!review) {
//     return {
//       //   blogTitle: "",
//       blogBody: "",
//     };
//   }

//   if (review.blogBody) {
//     console.log("Found a blog post for " + videoId);
//     return {
//       //   blogTitle: review.blogTitle,
//       blogBody: review.blogBody,
//     };
//   } else {
//     console.log(
//       "Didn't find a blog post for " + videoId + "--> writing post now with GPT"
//     );
//     const blogPost = await writeBlogPostGpt(
//       review.transcript,
//       review.searchQuery
//     );

//     console.log("GPT Response: " + JSON.stringify(blogPost));

//     const record = {
//       videoId,

//       blogBody: blogPost,
//     };

//     try {
//       console.log("Updating record with id: " + videoId);
//       const data = await prisma.reviewItem.findUnique({
//         where: {
//           videoId: videoId,
//         },
//       });

//       console.log("Fetched VideoId: " + data?.videoId);
//       console.log("Updating VideoId: " + videoId);

//       await prisma.reviewItem.update({
//         where: { videoId: videoId },
//         data: record,
//       });
//       console.log("Update successful");
//     } catch (error) {
//       console.error("Update failed with error: ", error.message);
//     }

//     return { blogBody: blogPost };
//   }
// }
