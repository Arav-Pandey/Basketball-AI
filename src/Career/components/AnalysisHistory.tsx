import { History, Minus } from "lucide-react";
import type { CareerSession } from "../careerSessions";
import {
  formatDate,
  formatScore,
  scoreColor,
} from "../careerFormatters";
import { ScoreValue } from "./CareerValueComponents";

export default function AnalysisHistory({
  sessions,
  onRemoveSession,
  deletingSessionId,
}: {
  sessions: CareerSession[];
  onRemoveSession: (sessionId: string) => void;
  deletingSessionId: string | null;
}) {
  return (
    <section className="rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-orange-500/15 p-2 text-orange-300">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-orange-200 sm:text-base">
            ANALYSIS HISTORY
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            All completed analyses, newest first
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5 text-sm leading-6 text-zinc-400">
          No completed analyses yet. Your saved sessions and individual form
          scores will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div key={session.id} className="flex items-center gap-2">
              <article className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-white">
                      Session {sessions.length - index}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDate(session.analyzedAt)}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Overall
                    </span>
                    <span
                      className={`text-2xl font-black tabular-nums ${scoreColor(session.overallFormScore)}`}
                    >
                      {formatScore(session.overallFormScore)}
                    </span>
                    <span className="text-xs text-zinc-500">/ 100</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {[
                    { label: "Elbow Flare", score: session.flareScore },
                    { label: "Knee Bend", score: session.bendScore },
                    {
                      label: "Foot Position",
                      score: session.feetDistanceScore,
                    },
                    {
                      label: "Knee Alignment",
                      score: session.kneeAlignmentScore,
                    },
                    {
                      label: "Similarity to Reference",
                      score: session.similarityScore,
                    },
                  ].map(({ label, score }) => (
                    <div key={label} className="rounded-xl bg-zinc-900/80 p-3">
                      <p className="text-xs leading-4 text-zinc-500">{label}</p>
                      <p className="mt-1 text-base">
                        <ScoreValue score={score} />
                      </p>
                    </div>
                  ))}
                </div>
              </article>
              <button
                type="button"
                onClick={() => onRemoveSession(session.id)}
                disabled={deletingSessionId !== null}
                aria-label={`Remove session ${sessions.length - index}`}
                title="Remove session"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-950 bg-red-950/70 text-red-500 transition hover:border-red-900 hover:bg-red-950 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Minus className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
