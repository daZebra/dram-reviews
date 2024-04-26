"use client";
import { useState, useEffect } from "react";
import SkeletonCard from "@/components/skeleton-card";
import { titleCase } from "@/lib/utils";

type LoadingProps = {
  search?: string;
};

export default function Loading({ search }: LoadingProps) {
  const [loadingState, setLoadingState] = useState({
    text: "Searching Youtube videos for",
    value: 5,
  });

  useEffect(() => {
    const timeouts = [
      setTimeout(
        () =>
          setLoadingState({ text: "Getting video transcripts for", value: 25 }),
        4000
      ),
      setTimeout(
        () =>
          setLoadingState({
            text: "Analyzing video transcripts for",
            value: 50,
          }),
        8000
      ),
      setTimeout(
        () => setLoadingState({ text: "Fetching reviews for", value: 75 }),
        12000
      ),
    ];

    return () => timeouts.forEach(clearTimeout); // Cleanup timeouts on component unmount
  }, []); // Empty dependency array to run only once on mount

  if (!search) {
    return;
  }
  const searchString = titleCase(search);

  return (
    <div className="flex flex-col gap-4 items-center pt-24">
      <h2 className="text-2xl text-base-content animate-pulse">
        {loadingState.text}
        <span className="text-primary font-bold"> {searchString}</span>...
      </h2>
      <progress
        className="progress progress-primary w-56"
        value={loadingState.value}
        max="100"
      ></progress>

      {Array.from({ length: 3 }).map((item, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
