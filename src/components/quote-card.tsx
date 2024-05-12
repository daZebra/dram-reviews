import getScoreColor from "@/lib/get-score-color";
import Image from "next/image";

type QuoteCardProps = {
  thumbnailUrl: string;
  quote: string;
  channelTitle: string;
  overallRating: number;
};

export default function QuoteCard({
  thumbnailUrl,
  quote,
  channelTitle,
  overallRating,
}: QuoteCardProps) {
  const scoreColor = getScoreColor({ score: overallRating, denominator: 10 });

  return (
    <div className="flex flex-col bg-white shadow-md shadow-base-200 rounded-lg p-4 gap-2 border min-w-sm h-fit  border-neutral-100 ">
      <div className="flex justify-between items-center gap-1">
        <div className="flex gap-4 items-center">
          <div style={{ position: "relative", width: "40px", height: "40px" }}>
            {" "}
            {/* Container to hold the image */}
            <Image
              src={`${thumbnailUrl}`}
              alt="image"
              layout="fill" // This tells the Image component to fill the container
              objectFit="cover" // Change to 'fill' to stretch and fill the area
              className="rounded-full" // Maintains the rounded corners
            />
          </div>
          <p className="text-sm text-accent text-medium ">{channelTitle}</p>
        </div>
        <div className="flex justify-center gap-0 items-center min-w-10">
          <span className={`text-md text-${scoreColor} font-bold`}>
            {overallRating}{" "}
          </span>
          <span className=" text-xs text-base-content/40">/10</span>
        </div>
      </div>
      <p className="text-sm text-neutral/80">{quote}</p>
    </div>
  );
}
