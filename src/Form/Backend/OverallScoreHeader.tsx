interface ScoreWeights {
  bend: number;
  flare: number;
  kneeFlare: number;
  feetDistance: number;
  kneeDistance: number;
}

interface OverallScoreInputs {
  bendScore: number | null;
  flareScore: number | null;
  kneeFlareScore: number | null;
  feetDistanceScore: number | null;
  kneeDistanceScore: number | null;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  bend: 0.3,
  flare: 0.25,
  feetDistance: 0.2,
  kneeDistance: 0.15,
  kneeFlare: 0.1,
};

export function calculateOverallScore(
  scores: OverallScoreInputs,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS,
): number | null {
  const entries: Array<[number | null, number]> = [
    [scores.bendScore, weights.bend],
    [scores.flareScore, weights.flare],
    [scores.kneeFlareScore, weights.kneeFlare],
    [scores.feetDistanceScore, weights.feetDistance],
    [scores.kneeDistanceScore, weights.kneeDistance],
  ];

  let weightedSum = 0;
  let weightTotal = 0;

  for (const [score, weight] of entries) {
    if (score === null || !Number.isFinite(score)) continue;
    weightedSum += score * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) return null;

  return weightedSum / weightTotal;
}

function getScoreLabel(score: number): {
  emoji: string;
  label: string;
  color: string;
} {
  if (score < 41) return { emoji: "😫", label: "Poor", color: "0 85% 55%" };
  if (score < 65) return { emoji: "😐", label: "Average", color: "45 85% 55%" };
  if (score < 85)
    return { emoji: "😊", label: "Above Average", color: "80 85% 55%" };
  return { emoji: "🤩", label: "Excellent", color: "145 85% 55%" };
}

interface OverallScoreHeaderProps extends OverallScoreInputs {
  weights?: ScoreWeights;
}

export default function OverallScoreHeader({
  bendScore,
  flareScore,
  kneeFlareScore,
  feetDistanceScore,
  kneeDistanceScore,
  weights,
}: OverallScoreHeaderProps) {
  const allScoresReady =
    bendScore !== null &&
    flareScore !== null &&
    kneeFlareScore !== null &&
    feetDistanceScore !== null &&
    kneeDistanceScore !== null;

  if (!allScoresReady) return null;

  const overallScore = calculateOverallScore(
    {
      bendScore,
      flareScore,
      kneeFlareScore,
      feetDistanceScore,
      kneeDistanceScore,
    },
    weights,
  );

  if (overallScore === null) return null;

  const rounded = Math.round(overallScore);
  const { emoji, label, color } = getScoreLabel(rounded);

  return (
    <div className="mx-auto mb-6 w-full max-w-xl rounded-3xl border border-orange-500/25 bg-zinc-950/80 px-6 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-[13px] font-black uppercase tracking-[0.3em] text-orange-200">
        Overall Shot Score
      </p>

      <div className="mt-2 flex items-center justify-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <span
          className="text-5xl font-black"
          style={{ color: `hsl(${color})` }}
        >
          {rounded}
        </span>
        <span className="text-lg font-semibold text-zinc-400">/ 100</span>
      </div>

      <p
        className="mt-1 text-sm font-semibold"
        style={{ color: `hsl(${color})` }}
      >
        {label}
      </p>
    </div>
  );
}
