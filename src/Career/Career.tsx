import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Dumbbell, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CAREER_SESSIONS_UPDATED_EVENT,
  getCareerSessionsStorageKey,
  isCareerSession,
  isCareerSummary,
  loadCareerSessions,
  replaceCareerSessions,
  type CareerSession,
  type CareerSummary,
} from "./careerSessions";
import AnalysisHistory from "./components/AnalysisHistory";
import CareerSummaryPanel from "./components/CareerSummaryPanel";
import FormScoreChart from "./components/FormScoreChart";

type SyncStatus = "loading" | "synced" | "error";

interface CareerHistory {
  sessions: CareerSession[];
  storageAvailable: boolean;
}

export default function Career() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<CareerHistory>({
    sessions: [],
    storageAvailable: true,
  });
  const [profileSummary, setProfileSummary] = useState<CareerSummary | null>(
    null,
  );
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const [isClearingCareer, setIsClearingCareer] = useState(false);

  useEffect(() => {
    let active = true;

    const refreshFromProfile = async () => {
      try {
        const authResponse = await fetch("/.netlify/functions/auth", {
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        });
        if (!authResponse.ok) {
          throw new Error("Could not verify the signed-in profile.");
        }

        const authResult: unknown = await authResponse.json();
        if (
          typeof authResult !== "object" ||
          authResult === null ||
          !("username" in authResult) ||
          typeof authResult.username !== "string"
        ) {
          throw new Error("Signed-in profile response was invalid.");
        }

        const storageKey = getCareerSessionsStorageKey(authResult.username);
        if (active) setStorageKey(storageKey);
        const cachedHistory = loadCareerSessions(storageKey);
        if (active) setHistory(cachedHistory);

        const response = await fetch("/.netlify/functions/career-sessions", {
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) {
          throw new Error(
            `Career history request failed (${response.status}).`,
          );
        }

        const result: unknown = await response.json();
        if (
          typeof result !== "object" ||
          result === null ||
          !("sessions" in result) ||
          !Array.isArray(result.sessions) ||
          !("summary" in result) ||
          !isCareerSummary(result.summary) ||
          !("profileCacheKey" in result) ||
          result.profileCacheKey !== storageKey
        ) {
          throw new Error("Career history response was invalid.");
        }

        const sessions = result.sessions.filter(isCareerSession);
        const storageAvailable = replaceCareerSessions(sessions, storageKey);
        if (active) {
          setHistory({ sessions, storageAvailable });
          setProfileSummary(result.summary);
          setSyncStatus("synced");
        }
      } catch (error) {
        console.error(
          "Could not load career history from the user profile.",
          error,
        );
        if (active) {
          setProfileSummary(null);
          setSyncStatus("error");
        }
      }
    };

    const handleProfileUpdate = () => {
      void refreshFromProfile();
    };

    void refreshFromProfile();
    window.addEventListener(CAREER_SESSIONS_UPDATED_EVENT, handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      active = false;
      window.removeEventListener(
        CAREER_SESSIONS_UPDATED_EVENT,
        handleProfileUpdate,
      );
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const sessions = useMemo(
    () =>
      [...history.sessions].sort(
        (first, second) =>
          Date.parse(second.analyzedAt) - Date.parse(first.analyzedAt),
      ),
    [history.sessions],
  );
  const latest = sessions[0] ?? null;
  const previous = sessions[1] ?? null;
  const overallChange =
    latest && previous
      ? latest.overallFormScore - previous.overallFormScore
      : null;
  const summary =
    syncStatus === "synced" && profileSummary
      ? profileSummary
      : {
          latestFormScore: latest?.overallFormScore ?? null,
          previousFormScore: previous?.overallFormScore ?? null,
          overallChange,
          totalSessions: sessions.length,
          updatedAt: new Date().toISOString(),
        };
  const removeSession = async (sessionId: string) => {
    setDeletingSessionId(sessionId);
    setDeleteError(null);
    try {
      const response = await fetch("/.netlify/functions/career-sessions", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`Session removal failed (${response.status}).`);
      }

      const result: unknown = await response.json();
      if (
        typeof result !== "object" ||
        result === null ||
        !("sessions" in result) ||
        !Array.isArray(result.sessions) ||
        !("summary" in result) ||
        !isCareerSummary(result.summary) ||
        !("profileCacheKey" in result) ||
        typeof result.profileCacheKey !== "string" ||
        result.profileCacheKey !== storageKey
      ) {
        throw new Error("Session removal response was invalid.");
      }

      const updatedSessions = result.sessions.filter(isCareerSession);
      const storageAvailable = replaceCareerSessions(
        updatedSessions,
        result.profileCacheKey,
      );
      setHistory({ sessions: updatedSessions, storageAvailable });
      setProfileSummary(result.summary);
      setSyncStatus("synced");
    } catch (error) {
      console.error("Could not remove career history session.", error);
      setDeleteError(
        "Could not remove this session. Please try again.",
      );
    } finally {
      setDeletingSessionId(null);
    }
  };

  const clearCareer = async () => {
    if (!storageKey || syncStatus !== "synced" || isClearingCareer) return;

    setIsClearingCareer(true);
    setDeletingSessionId("clear-career");
    setDeleteError(null);
    try {
      const response = await fetch("/.netlify/functions/career-sessions", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearCareer: true }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`Career history clearing failed (${response.status}).`);
      }

      const result: unknown = await response.json();
      if (
        typeof result !== "object" ||
        result === null ||
        !("sessions" in result) ||
        !Array.isArray(result.sessions) ||
        result.sessions.length !== 0 ||
        !("summary" in result) ||
        !isCareerSummary(result.summary) ||
        !("profileCacheKey" in result) ||
        result.profileCacheKey !== storageKey
      ) {
        throw new Error("Career history clearing response was invalid.");
      }

      const storageAvailable = replaceCareerSessions([], storageKey);
      setHistory({ sessions: [], storageAvailable });
      setProfileSummary(result.summary);
      setSyncStatus("synced");
      setIsClearConfirmationOpen(false);
    } catch (error) {
      console.error("Could not clear career history.", error);
      setDeleteError(
        "Could not clear career history. Your saved data has not been confirmed as deleted; please try again.",
      );
    } finally {
      setIsClearingCareer(false);
      setDeletingSessionId(null);
    }
  };

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
