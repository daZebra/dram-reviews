"use client";

import { MIN_SEARCH_CHAR } from "@/lib/const";
import { titleCase } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchForm() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log(
      `[SearchForm] Search text changed: "${searchText}" (${searchText.length} characters)`
    );

    if (searchText.length >= 4) {
      setIsLoading(true);
      console.log(
        `[SearchForm] Fetching autocomplete suggestions for: "${searchText}"`
      );

      fetch(`/api/autocomplete?query=${encodeURIComponent(searchText)}`)
        .then((response) => {
          if (!response.ok) {
            console.error(
              `[SearchForm] Autocomplete API returned status: ${response.status}`
            );
            return { productNames: [] };
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            `[SearchForm] Received ${
              data.productNames?.length || 0
            } suggestions:`,
            data.productNames
          );
          setSuggestions(data.productNames || []);
        })
        .catch((error) => {
          console.error(`[SearchForm] Autocomplete API error:`, error);
          setSuggestions([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [searchText]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(
      `[SearchForm] Form submitted with search text: "${searchText}"`
    );

    if (!searchText || searchText.length <= MIN_SEARCH_CHAR) {
      console.warn(
        `[SearchForm] Search text too short (${searchText.length} chars, min: ${MIN_SEARCH_CHAR})`
      );
      setError("Please enter a longer product name.");
      return;
    } else {
      setError("");
      const encodedSearchText = encodeURIComponent(searchText);
      console.log(`[SearchForm] Redirecting to: /product/${encodedSearchText}`);
      router.push(`/product/${encodedSearchText}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log(`[SearchForm] Suggestion selected: "${suggestion}"`);
    setSearchText(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center md:items-start gap-4 justify-center"
      >
        <div>
          <input
            name="search"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-primary input-lg w-full"
            placeholder="e.g. Highland Park 12"
            spellCheck="false"
            aria-label="Search for whisky"
          />
          {isLoading && (
            <div className="text-sm text-gray-500 mt-1">
              Loading suggestions...
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="autocomplete-results bg-base-200/60 rounded-lg">
              {suggestions.map((name, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-base-200 cursor-pointer "
                  onClick={() => handleSuggestionClick(name)}
                >
                  {titleCase(name)}
                </li>
              ))}
            </ul>
          )}
        </div>
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

// "use client";

// import { MIN_SEARCH_CHAR } from "@/lib/const";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function SearchForm() {
//   const [searchText, setSearchText] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!searchText || searchText.length <= MIN_SEARCH_CHAR) {
//       setError("Please enter a longer product name.");
//       return;
//     } else {
//       setError("");
//       router.push(`/product/${encodeURI(searchText)}`);
//     }
//   };
//   return (
//     <div className="flex flex-col items-center justify-center gap-4 ">
//       <form
//         // action={searchReviews}
//         onSubmit={handleSubmit}
//         className="flex flex-col md:flex-row items-center gap-4 justify-center   "
//       >
//         <input
//           name="search"
//           type="text"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           className="input input-primary input-lg w-80 md:w-96"
//           placeholder="e.g. Highland Park 12"
//           spellCheck="false"
//         />
//         <button
//           type="submit"
//           className="btn btn-primary btn-lg text-white w-36"
//         >
//           Search
//         </button>
//       </form>

//       {error.length > 0 ? <div className="text-error pt-4">{error}</div> : null}
//     </div>
//   );
// }
