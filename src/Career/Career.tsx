import { useEffect, useMemo, useState } from "react";
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
import Display from "./Display";

type SyncStatus = "loading" | "synced" | "error";

interface CareerHistory {
  sessions: CareerSession[];
  storageAvailable: boolean;
}

export default function Career() {
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
      setDeleteError("Could not remove this session. Please try again.");
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

  // add all parameters
  return (
    <Display
      setDeleteError={setDeleteError}
      setIsClearConfirmationOpen={setIsClearConfirmationOpen}
      syncStatus={syncStatus}
      isClearingCareer={isClearingCareer}
      deletingSessionId={deletingSessionId}
      summary={summary}
      latest={latest}
      previous={previous}
      storageKey={storageKey}
      sessions={sessions}
      history={history}
      deleteError={deleteError}
      isClearConfirmationOpen={isClearConfirmationOpen}
      removeSession={removeSession}
      clearCareer={clearCareer}
    />
  );
}
