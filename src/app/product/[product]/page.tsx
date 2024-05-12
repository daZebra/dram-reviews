import Badge from "@/components/badge";
import QuoteCard from "@/components/quote-card";
import { RadialProgress } from "@/components/radial-progress";
import RatingBar from "@/components/rating-bar";
import VideoCard from "@/components/video-card";
import handleSearch from "@/lib/search/handle-search";
import { titleCase } from "@/lib/utils";
import { ReviewItem } from "@prisma/client";

import {
  ChevronLeftIcon,
  DrawingPinIcon,
  ReaderIcon,
  SliderIcon,
} from "@radix-ui/react-icons";

type Props = {
  params: { product: string };
};

export default async function Review({ params }: Props) {
  if (!params.product) {
    return <ProductPageEmptyState />;
  }

  const productName = decodeURIComponent(params.product);

  try {
    const result = await handleSearch(productName);

    if (!result) {
      return <ProductPageEmptyState />;
    }
    const { product, reviews } = result;

    console.log(product);

    if (!reviews || !product) {
      return <ProductPageEmptyState />;
    }
    // console.log(product);

    return (
      <section className="bg-white  py-10">
        <div className="flex flex-col justify-center max-w-6xl mx-auto px-5 md:px-10 lg:px-40">
          <div className="flex text-xs text-neutral-400">
            <ChevronLeftIcon />
            <a href="/">Back</a>
          </div>
          <header className="flex flex-col items-center text-center gap-4">
            <RadialProgress
              percentage={product.sentimentScore}
              label="sentiment"
            />
            <h1 className="text-3xl font-bold">
              {titleCase(product.productName)}
            </h1>
            <div className="flex justify-center gap-2 text-xs text-neutral-500">
              <SliderIcon className="text-accent" />
              <span>{product.abv}% ABV</span>
              <ReaderIcon className="text-accent" />
              {isNaN(parseInt(product.age))
                ? titleCase(product.age)
                : `${parseInt(product.age)} y.o.`}

              <DrawingPinIcon className="text-accent" />
              <span>{product.region}</span>
            </div>
          </header>
          <section className="flex flex-col gap-4 w-full mx-auto">
            <div className="font-bold text-sm bg-base-100  py-2 px-4 mt-8 rounded-md">
              Overview
            </div>
            <div className="text-sm text-base-content/80 px-4">
              <p className="mt-2">{product.reviewSummary}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <RatingBar
                    rating={product.overallScore}
                    label="Overall"
                    denominator={10}
                  />
                  <RatingBar
                    rating={product.complexityScore}
                    label="Complexity"
                    denominator={10}
                  />
                  <RatingBar
                    rating={product.priceScore}
                    label="Price"
                    denominator={10}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <span className="min-w-24 text-nowrap text-xs font-medium text-base-content/50">
                      Casks{" "}
                    </span>
                    <div className="flex  flex-wrap  max-w-96 gap-2">
                      {JSON.parse(product.casks).map((cask: string) => (
                        <Badge key={cask} label={cask} tagType="casks" />
                      ))}
                    </div>
                  </div>

                  {JSON.parse(product.tags).length > 0 && (
                    <div className="flex gap-2">
                      <span className="min-w-24 text-nowrap text-xs font-medium text-base-content/50">
                        Tags{" "}
                      </span>
                      <div className="flex  flex-wrap  max-w-96 gap-2">
                        {JSON.parse(product.tags).map((tag: string) => (
                          <Badge key={tag} label={tag} tagType="tags" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className="min-w-24 text-nowrap text-xs font-medium text-base-content/50">
                      Tasting Notes{" "}
                    </span>
                    <div className="flex  flex-wrap  max-w-96 gap-2">
                      {JSON.parse(product.tasteNotes).map(
                        (tasteNote: string) => (
                          <Badge
                            key={tasteNote}
                            label={tasteNote}
                            tagType="tasteNotes"
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
              {reviews.map((review: ReviewItem) => (
                <div key={review.videoId} className="break-inside-avoid mb-4">
                  <QuoteCard
                    key={review.videoId}
                    thumbnailUrl={review.thumbnailUrl}
                    quote={
                      (JSON.parse(review.tasteQuotes)[0] || "") +
                      " " +
                      (JSON.parse(review.valueQuotes)[0] || "")
                    }
                    channelTitle={review.channelTitle}
                    overallRating={review.overallScore}
                  />
                </div>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-4 w-full mx-auto">
            <div className="font-bold text-sm bg-base-100  py-2 px-4 mt-8 rounded-md">
              Reviews
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
              {reviews.map((review: ReviewItem) => (
                <div key={review.videoId} className="break-inside-avoid mb-4">
                  <VideoCard
                    key={review.videoId}
                    thumbnailUrl={review.thumbnailUrl}
                    quote={review.opinionQuote}
                    channelTitle={review.channelTitle}
                    score={review.sentimentScore}
                    date={new Date(review.publishedAt)
                      .toISOString()
                      .substring(0, 10)}
                    title={review.title}
                    videoId={review.videoId}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    );
  } catch (error) {
    return <ProductPageEmptyState />;
  }
}

function ProductPageEmptyState() {
  return (
    <section className="flex min-h-32 items-center p-30 justify-center max-w-6xl mx-auto">
      <div className="flex text-xl font-medium text-base-content/80 text-center">
        No results found, try a different search
      </div>
    </section>
  );
}
