import { titleCase } from "@/lib/utils";

type BadgeProps = {
  label: string;
  tagType?: "casks" | "tasteNotes" | "tags" | "";
};

export default function Badge({ label, tagType = "" }: BadgeProps) {
  return (
    <a
      href={tagType ? `/reviews?${tagType}=${label}` : undefined}
      className="badge badge-ghost text-nowrap"
    >
      {titleCase(label)}
    </a>
  );
}
