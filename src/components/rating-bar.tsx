import getScoreColor from "@/lib/get-score-color";

type RatingBarProps = {
  rating: number;
  label: string;
  denominator: number;
};
export default function RatingBar({
  label,
  rating,
  denominator,
}: RatingBarProps) {
  const ratingPercentage = (rating / denominator) * 100;
  const scoreColor = getScoreColor({ score: rating, denominator });

  return (
    <div className="text-xs font-medium text-base-content/50">
      <div className="flex items-center mb-1 gap-1">
        <div className="w-24">{label}</div>
        <div className="w-full bg-base-200 rounded h-2.5  me-2">
          <div
            className={`h-2.5 rounded bg-${scoreColor}`}
            style={{ width: `${ratingPercentage}%` }}
          ></div>
        </div>
        <span>
          {rating}
          {denominator === 100 ? "%" : `/${denominator}`}
        </span>
      </div>
    </div>
  );
}
