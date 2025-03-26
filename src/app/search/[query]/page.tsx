import SearchPage from "@/components/search/SearchPage";
import handleSearch from "@/lib/search/handle-search";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: { query: string } }) {
  try {
    const query = decodeURIComponent(params.query);

    // If query is too short, redirect to home page
    if (!query || query.length < 3) {
      logger.warn(`Search query too short: "${query}"`);
      redirect("/");
    }

    logger.info(`Handling search request for: "${query}"`);

    // Process the search
    const searchResults = await handleSearch(query);

    // Log search results summary
    if (searchResults) {
      logger.info(
        `Search results for "${query}": ${searchResults.reviews.length} reviews found`
      );
    } else {
      logger.warn(`No search results found for "${query}"`);
    }

    return <SearchPage query={query} searchResults={searchResults} />;
  } catch (error) {
    logger.error(`Error in search page for "${params.query}":`, error);
    redirect("/error?message=Failed to process search request");
  }
}
