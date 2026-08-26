import { ChartNoAxesColumnIncreasing } from "lucide-react";
import type { CareerSession } from "../careerSessions";
import { formatDate, formatScore } from "../careerFormatters";

export default function FormScoreChart({
  sessions,
}: {
  sessions: CareerSession[];
}) {
  const chronological = [...sessions].reverse();
  const visibleSessions = chronological.slice(-12);
  const firstSessionNumber = chronological.length - visibleSessions.length + 1;
  const chartWidth = 760;
  const chartHeight = 320;
  const left = 54;
  const right = 20;
  const top = 20;
  const bottom = 42;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const points = visibleSessions.map((session, index) => ({
    session,
    sessionNumber: firstSessionNumber + index,
    x:
      visibleSessions.length === 1
        ? left + plotWidth / 2
        : left + (index / (visibleSessions.length - 1)) * plotWidth,
    y: top + ((100 - session.overallFormScore) / 100) * plotHeight,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-orange-500/15 p-2 text-orange-300">
          <ChartNoAxesColumnIncreasing className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-orange-200 sm:text-base">
            FORM SCORE PROGRESS
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Overall mechanics score by analysis session
          </p>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/20 px-5 text-center">
          <ChartNoAxesColumnIncreasing className="mb-3 h-8 w-8 text-orange-300/70" />
          <p className="font-semibold text-white">
            Your progress will appear here
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
            Complete your first shooting-form analysis to start tracking your
            form score over time.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label={`Form score progress chart with ${points.length} sessions`}
            className="h-auto min-w-140 w-full"
          >
            {[0, 25, 50, 75, 100].map((score) => {
              const y = top + ((100 - score) / 100) * plotHeight;
              return (
                <g key={score}>
                  <line
                    x1={left}
                    y1={y}
                    x2={chartWidth - right}
                    y2={y}
                    stroke="rgba(255,255,255,0.12)"
                    strokeDasharray={score === 0 ? undefined : "4 6"}
                  />
                  <text
                    x={left - 12}
                    y={y + 4}
                    textAnchor="end"
                    fill="#a1a1aa"
                    fontSize="12"
                  >
                    {score}
                  </text>
                </g>
              );
            })}
            <text
              x={15}
              y={top + plotHeight / 2}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="12"
              transform={`rotate(-90 15 ${top + plotHeight / 2})`}
            >
              FORM SCORE
            </text>
            <text
              x={left + plotWidth / 2}
              y={chartHeight - 4}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="12"
            >
              SESSION NUMBER
            </text>
            {points.length > 1 && (
              <polyline
                points={line}
                fill="none"
                stroke="#fb923c"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map(({ session, sessionNumber, x, y }) => (
              <g key={session.id}>
                <circle cx={x} cy={y} r="10" fill="#fb923c" opacity="0.18" />
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#fb923c"
                  stroke="#111827"
                  strokeWidth="2"
                >
                  <title>
                    Session {sessionNumber}:{" "}
                    {formatScore(session.overallFormScore)} points —{" "}
                    {formatDate(session.analyzedAt)}
                  </title>
                </circle>
                <text
                  x={x}
                  y={chartHeight - bottom + 20}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="11"
                >
                  {sessionNumber}
                </text>
              </g>
            ))}
          </svg>
          <p className="mt-1 text-center text-xs text-zinc-500">
            Showing the latest {points.length} of {sessions.length} sessions.
            Hover or tap a point for details.
          </p>
        </div>
      )}
    </section>
  );
}
