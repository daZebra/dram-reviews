import getScoreColor from "@/lib/get-score-color";
import { decodeHtmlEntities } from "@/lib/utils";
import Image from "next/image";

type VideoCardProps = {
  thumbnailUrl: string;
  channelTitle: string;
  title: string;
  quote: string;
  score: number;
  date: string;
  videoId: string;
};

export default function VideoCard({
  thumbnailUrl,
  channelTitle,
  title,
  quote,
  score,
  date,
  videoId,
}: VideoCardProps) {
  const scoreColor = getScoreColor({ score: score, denominator: 100 });

  // Decode HTML entities in text fields
  const decodedTitle = decodeHtmlEntities(title);
  const decodedChannelTitle = decodeHtmlEntities(channelTitle);
  const decodedQuote = decodeHtmlEntities(quote);

  return (
    <div className="flex md:flex-col bg-white shadow-md shadow-base-200 rounded-xl p-3 gap-4 border min-w-sm  border-neutral-100 h-fit">
      <div className="relative min-w-28 min-h-28 md:w-full md:h-32 bg-neutral rounded-lg overflow-hidden ">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          {/* Container to hold the image */}
          <Image
            src={`${thumbnailUrl}`}
            alt="image"
            layout="fill" // This tells the Image component to fill the container
            objectFit="cover" // Change to 'fill' to stretch and fill the area
          />
          <div
            className={`
            flex justify-end h-full
            text-center md:text-right text-${scoreColor}-content 
            backdrop-blur-[1px] backdrop-grayscale backdrop-opacity-90 
            bg-neutral bg-opacity-20 
            hover:backdrop-blur-none hover:bg-opacity-0 hover:backdrop-grayscale-0 transition-all`}
          >
            <div
              className={` rounded-md py-1 px-2 m-2 text-md font-bold bg-${scoreColor} bg-opacity-85 w-full h-fit md:w-fit`}
            >
              {score}%
            </div>
          </div>
        </a>
      </div>

      <div className="flex flex-col gap-1 ">
        <div className="flex flex-col  md:flex-row justify-between">
          <p className="text-sm text-accent order-last md:order-first text-medium  ">
            @{decodedChannelTitle}
          </p>
          <p className="text-sm text-base-content/40 text-medium align-right min-w-20 ">
            {date}
          </p>
        </div>
        <p className="text-md font-bold line-clamp-2">{decodedTitle}</p>
        <p className="text-sm text-base-content/80">{decodedQuote}</p>
      </div>

      {/* <div className="hidden md:hidden items-center w-12 text-center  md:w-full bg-base-200/60 text-base-content justify-center text-xs md:text-sm p-2 rounded-lg font-medium">
        Review: {score}%
      </div> */}
    </div>
  );
}
