import { getReviews } from "@/lib/get-reviews";
import getScoreColor from "@/lib/get-score-color";
import { CSSProperties } from "react";

type RadialProgressStyle = CSSProperties & {
  "--value"?: string;
  "--size"?: string;
  "--thickness"?: string;
};

export function RadialProgress({
  percentage,
  label,
}: {
  percentage: number;
  label: string;
}) {
  const scoreColor = getScoreColor({ score: percentage, denominator: 100 });

  return (
    <div
      className="radial-progress text-base-100"
      style={
        {
          "--value": "100",
          "--size": "7rem",
          "--thickness": "5px",
        } as RadialProgressStyle
      }
      role="progressbar"
    >
      <div
        className={`radial-progress text-${scoreColor}`}
        style={
          {
            "--value": `${percentage}`,
            "--size": "7rem",
            "--thickness": "5px",
          } as RadialProgressStyle
        }
        role="progressbar"
      >
        <p className={`text-${scoreColor} text-2xl font-bold`}>+{percentage}</p>
        <p className=" text-xs text-neutral-500 ">{label}</p>
      </div>
    </div>
  );
}
