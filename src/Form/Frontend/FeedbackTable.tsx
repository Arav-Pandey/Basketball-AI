import type { FeedbackTableProps } from "../interfaces";

interface FeedbackRowProps {
  label: string;
  feedback: string;
  score?: number | null;
  href?: string;
}

function scoreToHue(score: number): number {
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped <= 40) return 0;
  if (clamped <= 64) return 45;
  if (clamped <= 84) return 80;

  return 145;
}

function scoreToRating(score: number): {
  emoji: string;
  label: string;
} {
  const rounded = Math.round(Math.max(0, Math.min(100, score)));

  if (rounded >= 85) return { emoji: "🤩", label: "Excellent" };
  if (rounded >= 65) return { emoji: "😊", label: "Above Average" };
  if (rounded >= 41) return { emoji: "😐", label: "Average" };

  return { emoji: "😫", label: "Poor" };
}

function FeedbackRow({ label, feedback, score, href }: FeedbackRowProps) {
  const hasScore = score !== null && score !== undefined;

  const style = hasScore
    ? ({
        ["--hue" as any]: scoreToHue(score as number),
      } as React.CSSProperties)
    : undefined;

  const rating =
    hasScore && label !== "Curry Comparison"
      ? scoreToRating(score as number)
      : null;

  return (
    <tr className="accent-row" style={style}>
      <td className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold tracking-wide text-white sm:text-lg">
            {label}
          </span>

          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit cursor-pointer text-xs font-semibold text-blue-300 underline decoration-1 underline-offset-2 sm:text-sm"
            >
              Learn More
            </a>
          )}
        </div>
      </td>

      <td className="px-4 py-4 leading-8 text-zinc-200 sm:px-6 sm:text-xl">
        {feedback}
      </td>

      <td className="px-4 py-4 sm:px-6">
        {hasScore ? (
          <span
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-base font-black text-zinc-950 shadow-lg sm:h-11 sm:min-w-11 sm:px-3.5 sm:text-lg"
            style={{
              backgroundColor: `hsl(${scoreToHue(score as number)}, 85%, 55%)`,
            }}
          >
            {Math.round(score as number)}%
          </span>
        ) : (
          <span className="text-base font-semibold text-zinc-500 sm:text-lg">
            —
          </span>
        )}
      </td>

      <td className="px-4 py-4 sm:px-6">
        {rating ? (
          <span className="flex items-center gap-2.5">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800/20 p-1 text-4xl shadow-lg ring-1 ring-white/10"
              aria-hidden="true"
            >
              {rating.emoji}
            </span>

            <span className="text-sm font-semibold text-zinc-200 sm:text-base">
              {rating.label}
            </span>
          </span>
        ) : (
          <span className="text-base font-semibold text-zinc-500 sm:text-lg">
            —
          </span>
        )}
      </td>
    </tr>
  );
}

export default function FeedbackTable({
  feetFeedback,
  flareFeedback,
  bendFeedback,
  kneeFeedback,
  kneeFlareFeedback,
  feetDistanceScore,
  flareScore,
  bendScore,
  kneeDistanceScore,
  kneeFlareScore,
  similarityFeedback,
  similarity,
}: FeedbackTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-orange-500/20">
      <table className="w-full text-left text-sm sm:text-base">
        <thead>
          <tr className="border-b border-orange-500/20 bg-linear-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20 text-[11px] uppercase tracking-[0.25em] text-orange-200 sm:text-sm">
            <th className="px-4 py-4 font-black sm:px-6 sm:py-5">Metric</th>

            <th className="px-4 py-4 font-black sm:px-6 sm:py-5">Feedback</th>

            <th className="px-4 py-4 font-black sm:px-6 sm:py-5">Score</th>

            <th className="px-4 py-4 font-black sm:px-6 sm:py-5">Rating</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800/60">
          {feetFeedback && (
            <FeedbackRow
              label="Feet Distance"
              feedback={feetFeedback}
              score={feetDistanceScore}
              href="/sections/feet-distance"
            />
          )}

          {flareFeedback && (
            <FeedbackRow
              label="Elbow Alignment"
              feedback={flareFeedback}
              score={flareScore}
              href="/sections/elbow-flare"
            />
          )}

          {bendFeedback && (
            <FeedbackRow
              label="Knee Bend"
              feedback={bendFeedback}
              score={bendScore}
              href="/sections/knee-bend"
            />
          )}

          {kneeFeedback && (
            <FeedbackRow
              label="Knee Distance"
              feedback={kneeFeedback}
              score={kneeDistanceScore}
              href="/sections/knee-distance"
            />
          )}

          {kneeFlareFeedback && (
            <FeedbackRow
              label="Knee Alignment"
              feedback={kneeFlareFeedback}
              score={kneeFlareScore}
              href="/sections/knee-flare"
            />
          )}

          {similarity.current && (
            <FeedbackRow
              label="Steph Curry Comparison"
              feedback={similarityFeedback ?? ""}
              score={Math.round(similarity.current)}
              href="/sections/pros"
            />
          )}
        </tbody>
      </table>
    </div>
  );
}
