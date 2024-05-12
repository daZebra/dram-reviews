type GetScoreColorProps = {
  score: number;
  denominator: number;
};

export default function getScoreColor({
  score,
  denominator,
}: GetScoreColorProps) {
  const rating = score / denominator;

  const scoreColor =
    rating >= 0.9
      ? "[#52C893]"
      : rating >= 0.8
      ? "success"
      : rating >= 0.7
      ? "warning"
      : "error";

  return scoreColor;
}
