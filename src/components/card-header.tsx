import { capitalize } from "@/lib/utils";
import { ReviewItem } from "@prisma/client";
import Image from "next/image";

type CardHeaderProps = {
  onClick: () => void;
  review: ReviewItem;
};

export default function CardHeader({ onClick, review }: CardHeaderProps) {
  return (
    <section
      className="flex flex-col md:flex-row justify-between gap-x-20 gap-y-4 p-4 bg-base-200/80 rounded-t-lg text-center md:text-left cursor-pointer  max-w-7xl"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative justify-center py-10 w-full md:w-36 h-44 md:h-24 ">
          <a
            href={`https://www.youtube.com/watch?v=${review.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={review.thumbnailUrl}
              alt="image"
              className="object-cover rounded-md"
              fill={true}
            />
          </a>
        </div>

        <div className="flex flex-col justify-center">
          {" "}
          <p className="text-accent">@{review.channelTitle}</p>
          <h2 className="text-xl font-bold">
            {review.title.length > 50
              ? capitalize(
                  review.title.substring(0, review.title.lastIndexOf(" ", 50))
                ) + " [...]"
              : capitalize(review.title)}
          </h2>
          <p className=" text-base-content/50 text-sm">
            posted on{" "}
            {new Date(review.publishedAt).toISOString().substring(0, 10)}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center text-center py-2 md:py-0 md:px-6 rounded-lg bg-base-300/40">
        <p className="text-base-content/50 text-sm">Rating</p>
        <p className="text-xl font-bold text-accent">{review.rating}</p>
      </div>
    </section>
  );
}
