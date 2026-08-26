export function formatScore(score: number | null): string {
  if (score === null) return "N/A";
  return Number.isInteger(score) ? `${score}` : score.toFixed(1);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function scoreColor(score: number | null): string {
  if (score === null) return "text-zinc-500";
  if (score >= 85) return "text-emerald-300";
  if (score >= 65) return "text-lime-300";
  if (score >= 41) return "text-amber-300";
  return "text-rose-300";
}
