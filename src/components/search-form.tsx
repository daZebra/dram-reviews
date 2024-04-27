"use client";

import { MIN_SEARCH_CHAR } from "@/lib/const";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchForm() {
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchText || searchText.length <= MIN_SEARCH_CHAR) {
      setError("Please enter a longer product name.");
      return;
    } else {
      setError("");
      router.push(`/?search=${searchText}`);
      // revalidatePath(`/?search=${searchText}`);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4 ">
      <form
        // action={searchReviews}
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center gap-4 justify-center   "
      >
        <input
          name="search"
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="input input-primary input-lg w-80 md:w-96"
          placeholder="e.g. Highland Park 12"
          spellCheck="false"
        />
        <button
          type="submit"
          className="btn btn-primary btn-lg text-white w-36"
        >
          Search
        </button>
      </form>

      {error.length > 0 ? <div className="text-error pt-4">{error}</div> : null}
    </div>
  );
}
