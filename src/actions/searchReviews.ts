// "use server";

// import prisma from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { useRouter } from "next/navigation";

// const searchReviews = async (formData: FormData) => {
//     const router = useRouter();
//     const search = formData.get("search");

//   if (!searchText || searchText.length <= MIN_SEARCH_CHAR) {
//     return;
//   }
//     router.push(`/?search=${searchText}`);
//     revalidatePath(`/?search=${searchText}`);

//   // Check if the search query is valid
//   // If not, show an error message
//   // Otherwise, lookup prisma db for the search query
//   // If count of matches > MIN_REVIEW_COUNT, return the results
//   // Otherwise, scrape youtube
//   // Add new reviews to db
//   await prisma.reviewItem.upsert({
//     where: { videoId: review.videoId },
//     update: {},
//     create: review,
//   });
// };
