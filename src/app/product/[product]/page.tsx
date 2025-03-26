export const maxDuration = 30; // This function can run for a maximum of 30 seconds

import Badge from "@/components/badge";
import QuoteCard from "@/components/quote-card";
import { RadialProgress } from "@/components/radial-progress";
import RatingBar from "@/components/rating-bar";
import VideoCard from "@/components/video-card";
import handleSearch from "@/lib/search/handle-search";
import { titleCase, serverDecodeHtmlEntities } from "@/lib/utils";
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
  console.log(`[ProductPage] Rendering product page with params:`, params);

  if (!params.product) {
    console.warn(`[ProductPage] No product parameter found in URL`);
    return <ProductPageEmptyState message="No product specified in search." />;
  }

  const productName = decodeURIComponent(params.product);
  console.log(`[ProductPage] Decoded product name: "${productName}"`);

  try {
    console.log(`[ProductPage] Calling handleSearch for: "${productName}"`);
    const result = await handleSearch(productName);

    if (!result) {
      console.warn(
        `[ProductPage] handleSearch returned no results for: "${productName}"`
      );
      return (
        <ProductPageEmptyState
          message={`We couldn't find any information for "${productName}". Try a different search.`}
        />
      );
    }

    const { product, reviews, totalCount } = result;
    console.log(
      `[ProductPage] Search results: ${totalCount} reviews, product ${
        product ? "found" : "not found"
      }`
    );

    if (!reviews || !product) {
      console.warn(
        `[ProductPage] No reviews or product data found for: "${productName}"`
      );
      return (
        <ProductPageEmptyState
          message={`No detailed information available for "${productName}". Try searching for a popular whisky brand.`}
        />
      );
    }

    console.log(
      `[ProductPage] Rendering product page for: "${product.productName}" with ${reviews.length} reviews`
    );

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
            {reviews.length > 0 && (
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
            )}
          </section>
          {reviews.length > 0 && (
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
                      quote={serverDecodeHtmlEntities(
                        review.opinionQuote || ""
                      )}
                      channelTitle={serverDecodeHtmlEntities(
                        review.channelTitle
                      )}
                      score={review.sentimentScore}
                      date={new Date(review.publishedAt)
                        .toISOString()
                        .substring(0, 10)}
                      title={serverDecodeHtmlEntities(review.title)}
                      videoId={review.videoId}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error(
      `[ProductPage] Error rendering product page for "${productName}":`,
      error
    );
    return (
      <ProductPageEmptyState message="An error occurred while processing your search. Please try again later." />
    );
  }
}

type EmptyStateProps = {
  message?: string;
};

function ProductPageEmptyState({
  message = "No results found, try a different search",
}: EmptyStateProps) {
  console.log(`[ProductPage] Rendering empty state with message: "${message}"`);
  return (
    <section className="flex min-h-80 items-center p-30 justify-center max-w-6xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="text-xl font-medium text-base-content/80">
          {message}
        </div>
        <a href="/" className="btn btn-primary">
          Return to Search
        </a>
      </div>
    </section>
  );
}
