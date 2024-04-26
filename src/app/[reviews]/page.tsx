import AccordionCard from "@/components/accordion-card";
import { getAllReviews } from "@/lib/get-all-reviews";

export default async function Reviews() {
  const { reviews, totalCount } = await getAllReviews();

  return (
    <div className="flex flex-col items-center text-center my-10">
      <h2 className={` text-2xl text-base-content/50`}>
        Browse over {totalCount} reviews
      </h2>
      <section className="flex flex-col items-center w-full max-w-lg md:max-w-4xl gap-10 py-10">
        {reviews.map((review) => (
          <div key={review.videoId} className="w-full">
            <AccordionCard key={review.videoId} review={review} />
          </div>
        ))}
      </section>
    </div>
  );
}
