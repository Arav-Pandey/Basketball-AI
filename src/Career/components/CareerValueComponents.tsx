import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatScore, scoreColor } from "../careerFormatters";

export function ScoreValue({ score }: { score: number | null }) {
  return (
    <span className={`font-bold tabular-nums ${scoreColor(score)}`}>
      {formatScore(score)}
    </span>
  );
}

export function TrendValue({ difference }: { difference: number | null }) {
  if (difference === null) {
    return <span className="font-semibold text-zinc-500">N/A</span>;
  }
  if (difference === 0) {
    return <span className="font-semibold text-zinc-300">No change</span>;
  }

  const improved = difference > 0;
  const Icon = improved ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold ${improved ? "text-emerald-300" : "text-rose-300"}`}
    >
      <Icon className="h-4 w-4" />
      {difference > 0 ? "+" : ""}
      {formatScore(difference)} pts
    </span>
  );
}
