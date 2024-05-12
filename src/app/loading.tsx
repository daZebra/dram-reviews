import SkeletonCard from "@/components/skeleton-card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 items-center pt-24">
      <h2 className="text-2xl text-base-content animate-pulse">Loading ...</h2>
      <span className="loading loading-ring loading-lg loading-accent" />
    </div>
  );
}
