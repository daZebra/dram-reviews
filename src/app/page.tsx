import ReviewList from "@/components/review-list";
import SearchForm from "@/components/search-form";
import Tags from "@/components/tags";

type HomeProps = {
  searchParams: { search: string | undefined };
};
export default function Home({ searchParams }: HomeProps) {
  const { search } = searchParams;

  return (
    <main className="flex flex-col items-center py-24 ">
      <section className=" text-center flex flex-col items-center gap-4 max-w-sm md:max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold pb-2 ">
          Browse reviews from the world{"'"}s top whisky experts
        </h1>
        <SearchForm />
        <section className="flex pt-2 gap-x-4 text-sm text-base-content/60 ">
          <p>Recent searches:</p>
          <Tags />
        </section>
      </section>
      <ReviewList search={search} />
    </main>
  );
}
