import { ChartNoAxesColumnIncreasing } from "lucide-react";
import type { CareerSession, CareerSummary } from "../careerSessions";
import {
  formatDate,
  formatScore,
  scoreColor,
} from "../careerFormatters";
import {
  ScoreValue,
  TrendValue,
} from "./CareerValueComponents";

type SessionMetric =
  | "flareScore"
  | "bendScore"
  | "feetDistanceScore"
  | "kneeAlignmentScore";

const comparisonMetrics: Array<{ key: SessionMetric; label: string }> = [
  { key: "flareScore", label: "Elbow Flare" },
  { key: "bendScore", label: "Knee Bend" },
  { key: "feetDistanceScore", label: "Foot Position" },
  { key: "kneeAlignmentScore", label: "Knee Alignment" },
];

export default function CareerSummaryPanel({
  summary,
  latest,
  previous,
}: {
  summary: CareerSummary;
  latest: CareerSession | null;
  previous: CareerSession | null;
}) {
  return (
    <>
      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-orange-400/40 bg-linear-to-br from-orange-500/20 to-zinc-950/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:col-span-2 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">
            Latest Form Score
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-6xl font-black tabular-nums sm:text-7xl ${scoreColor(summary.latestFormScore)}`}
            >
              {formatScore(summary.latestFormScore)}
            </span>
            <span className="text-lg font-semibold text-zinc-400">/ 100</span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {latest
              ? formatDate(latest.analyzedAt)
              : "Complete an analysis to set your first score"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-zinc-400">
            Previous Form Score
          </p>
          <p
            className={`mt-3 text-4xl font-black tabular-nums ${scoreColor(summary.previousFormScore)}`}
          >
            {formatScore(summary.previousFormScore)}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {previous ? formatDate(previous.analyzedAt) : "No previous session"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-zinc-400">
            Overall Change
          </p>
          <div className="mt-4 text-2xl">
            <TrendValue difference={summary.overallChange} />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            Since your previous session
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-zinc-400">
            Total Sessions Analyzed
          </p>
          <p className="mt-3 text-4xl font-black tabular-nums text-white">
            {summary.totalSessions}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Career analyses on this device
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-orange-500/15 p-2 text-orange-300">
            <ChartNoAxesColumnIncreasing className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-orange-200 sm:text-base">
              SESSION COMPARISON
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Latest session compared with the previous one
            </p>
          </div>
        </div>

        {!previous ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-6 text-zinc-400">
            {latest
              ? "Complete another analysis to compare changes in your shooting mechanics."
              : "Complete your first analysis to begin comparing your progress."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {comparisonMetrics.map(({ key, label }) => {
              const latestScore = latest?.[key] ?? null;
              const previousScore = previous[key];
              const difference =
                latestScore !== null && previousScore !== null
                  ? latestScore - previousScore
                  : null;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-sm font-semibold text-zinc-300">{label}</p>
                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm text-zinc-400">
                      <ScoreValue score={previousScore} /> →{" "}
                      <ScoreValue score={latestScore} />
                    </span>
                    <TrendValue difference={difference} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
