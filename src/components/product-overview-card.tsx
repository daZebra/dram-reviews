import { DrawingPinIcon, ReaderIcon, SliderIcon } from "@radix-ui/react-icons";

import ProfilePictures from "./profile-pictures";

import { titleCase } from "@/lib/utils";
import { ProductItem } from "@prisma/client";
import { getReviews } from "@/lib/get-reviews";
import getScoreColor from "@/lib/get-score-color";

type ProductOverviewCardProps = {
  product: ProductItem;
};

export default async function ProductOverviewCard({
  product,
}: ProductOverviewCardProps) {
  const scoreColor = getScoreColor({
    score: product.sentimentScore,
    denominator: 100,
  });

  const { reviews, totalCount } = await getReviews(product.productName);

  const thumbnailUrls = reviews
    .map((review) => review.thumbnailUrl)
    .slice(0, 5);

  return (
    <a
      href={`/product/${product.productName}`}
      className="flex flex-col md:flex-row  bg-white shadow-lg shadow-base-200 rounded-xl p-6 md:p-8 gap-2 md:gap-8 border max-w-2xl  border-neutral-100"
    >
      {/* <RadialProgress percentage={89} label="sentiment" /> */}

      <div className="flex flex-col gap-1 text-left ">
        <p className="text-xl font-bold text-base-content">
          {titleCase(product.productName)}
        </p>
        <div className="flex  gap-2 text-xs text-base-content/60">
          <SliderIcon className="text-accent" />
          <span>{product.abv}% ABV</span>
          <ReaderIcon className="text-accent" />
          {isNaN(parseInt(product.age))
            ? titleCase(product.age)
            : `${parseInt(product.age)} y.o.`}

          <DrawingPinIcon className="text-accent" />
          <span>{product.region}</span>
        </div>
        {/* <div className="flex gap-2 text-xs text-base-content/60 flex-wrap">
          <span>Notes:</span>
          {notes.map((note: string) => (
            <p key={note} className="text-xs text-nowrap ">
              {titleCase(note)}
            </p>
          ))}
        </div> */}
        <div className="text-sm text-base-content/80">
          <p className="line-clamp-2">{product.reviewSummary}</p>
        </div>
      </div>

      <div className="flex md:flex-col align-start md:align-center md:justify-center gap-4 md:gap-0">
        <div className="flex flex-col">
          <div className="flex justify-center gap-0 items-center min-w-10">
            <span
              className={`text-md md:text-lg  font-bold text-${scoreColor}`}
            >
              {product.sentimentScore}
            </span>
            <span className=" text-sm  text-base-content/40">%</span>
          </div>
          <span className=" text-xs text-nowrap text-base-content/40">
            {totalCount} reviews
          </span>
        </div>
        <ProfilePictures
          urls={thumbnailUrls}
          imgClass="-ml-3 h-8 w-8 md:h-6 md:w-6"
          divClass="ml-2 mt-1 w-full md:justify-center"
        />
      </div>
    </a>
  );
}
