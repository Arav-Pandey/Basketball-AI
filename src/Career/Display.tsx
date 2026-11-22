import { AlertTriangle, Dumbbell, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CareerSummaryPanel from "./components/CareerSummaryPanel";
import type { CareerSession, CareerSummary } from "./careerSessions";
import FormScoreChart from "./components/FormScoreChart";
import AnalysisHistory from "./components/AnalysisHistory";

interface Props {
  setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsClearConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  syncStatus: SyncStatus;
  isClearingCareer: boolean;
  deletingSessionId: string | null;
  summary: CareerSummary;
  latest: CareerSession;
  previous: CareerSession;
  sessions: CareerSession[];
  history: CareerHistory;
  deleteError: string | null;
  isClearConfirmationOpen: boolean;
  removeSession: (sessionId: string) => Promise<void>;
  clearCareer: () => Promise<void>;
  storageKey: string | null;
}

interface CareerHistory {
  sessions: CareerSession[];
  storageAvailable: boolean;
}

type SyncStatus = "loading" | "synced" | "error";

export default function Display({
  setDeleteError,
  setIsClearConfirmationOpen,
  syncStatus,
  isClearingCareer,
  deletingSessionId,
  summary,
  latest,
  previous,
  storageKey,
  sessions,
  history,
  deleteError,
  isClearConfirmationOpen,
  removeSession,
  clearCareer,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl px-3 pb-12 pt-16 text-left text-white sm:px-6 sm:pt-20">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-orange-300">
            Basketball AI
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            MY <span className="text-orange-400">CAREER</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Track your shooting mechanics and progress over time.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setIsClearConfirmationOpen(true);
            }}
            disabled={
              syncStatus !== "synced" ||
              isClearingCareer ||
              deletingSessionId !== null
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/60 px-4 py-3 text-sm font-bold text-red-200 transition hover:border-red-400/50 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear Career
          </button>
          <button
            type="button"
            onClick={() => navigate("/form-home")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-95 sm:w-auto"
          >
            <Dumbbell className="h-5 w-5" />
            Analyze a Shot
          </button>
        </div>
      </header>

      <CareerSummaryPanel
        summary={summary}
        latest={latest}
        previous={previous}
      />

      {syncStatus === "loading" && (
        <p
          role="status"
          className="mb-6 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200"
        >
          Syncing your career history with your profile…
        </p>
      )}
      {syncStatus === "error" && (
        <p
          role="status"
          className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          Could not sync with your profile. Showing any career history cached on
          this device.
        </p>
      )}
      {syncStatus === "synced" && !history.storageAvailable && (
        <p
          role="status"
          className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          Your profile history loaded, but this device could not cache it
          locally.
        </p>
      )}

      <div className="mb-6">
        <FormScoreChart sessions={sessions} />
      </div>

      {deleteError && !isClearConfirmationOpen && (
        <p
          role="alert"
          className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {deleteError}
        </p>
      )}
      <AnalysisHistory
        sessions={sessions}
        onRemoveSession={(sessionId) => void removeSession(sessionId)}
        deletingSessionId={deletingSessionId}
      />

      {isClearConfirmationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-career-title"
          aria-describedby="clear-career-description"
        >
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 text-left shadow-2xl shadow-black/60 sm:p-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2
              id="clear-career-title"
              className="text-xl font-black text-white"
            >
              Clear your career history?
            </h2>
            <p
              id="clear-career-description"
              className="mt-3 text-sm leading-6 text-zinc-300"
            >
              This permanently deletes all saved form-analysis sessions and
              career statistics from your MongoDB profile. Your account and
              sign-in information will not be deleted.
            </p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              This action cannot be undone.
            </p>
            {deleteError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              >
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isClearingCareer}
                onClick={() => {
                  setIsClearConfirmationOpen(false);
                  setDeleteError(null);
                }}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  isClearingCareer ||
                  syncStatus !== "synced" ||
                  !storageKey ||
                  (deletingSessionId !== null &&
                    deletingSessionId !== "clear-career")
                }
                onClick={() => void clearCareer()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClearingCareer ? "Clearing…" : "Confirm and clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
