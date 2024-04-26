import { getRecentSearches } from "@/lib/get-recent-searches";
import { titleCase } from "@/lib/utils";
import Link from "next/link";

export default async function Tags() {
  const { searches } = await getRecentSearches(3);

  if (!searches) {
    return <Tag />;
  } else {
    return (
      <div className="space-x-2 ">
        {searches.map((search) => (
          <Tag key={search.videoId} name={search.query} />
        ))}
      </div>
    );
  }
}

function Tag({ name = "Highland Park 12", queryParam = "search" }) {
  return (
    <Link
      href={`/?${queryParam}=${name}`}
      className="badge bg-base-200  px-2 hover:text-primary"
    >
      {titleCase(name)}
    </Link>
  );
}
