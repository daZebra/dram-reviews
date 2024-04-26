"use client";

import handleSearch from "@/lib/search/handleSearch";
import AccordionCard from "./accordion-card";
import { useEffect, useState } from "react";
import Loading from "@/components/loading";
import { ReviewItem } from "@prisma/client";
import { titleCase } from "@/lib/utils";

type ReviewListProps = {
  search?: string;
};
export default function ReviewList({ search }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  const searchText = search || "";

  useEffect(() => {
    setLoading(true);
    handleSearch(search || "").then((result) => {
      if (result) {
        setReviews(result.reviews);
      }
      setLoading(false);
    });
  }, [search]);

  if (loading) {
    return <Loading search={search} />;
  }

  return (
    <div className="text-center mt-12">
      <h2 className="text-xl  text-base-content/50">
        {reviews.length > 0 && "Reviews for "}
        <span className="text-base-content font-bold">
          {titleCase(searchText)}
        </span>
      </h2>
      <section className="flex flex-col w-auto max-w-lg md:max-w-4xl gap-10 justify-center pt-6">
        {reviews.map((review) => (
          <AccordionCard key={review.videoId} review={review} />
        ))}
      </section>
    </div>
  );
}
