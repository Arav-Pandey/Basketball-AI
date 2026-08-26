export const CAREER_SESSIONS_STORAGE_KEY =
  "basketball-ai-career-sessions-v1";
export const CAREER_SESSIONS_UPDATED_EVENT =
  "basketball-ai-career-sessions-updated";

export interface AnalysisScores {
  flareScore: number | null;
  bendScore: number | null;
  feetDistanceScore: number | null;
  kneeDistanceScore: number | null;
  kneeFlareScore: number | null;
  similarityScore: number | null;
}

export interface CompletedAnalysis {
  scores: AnalysisScores;
}

export interface CareerSession {
  id: string;
  analysisId: string;
  analyzedAt: string;
  overallFormScore: number;
  flareScore: number | null;
  bendScore: number | null;
  feetDistanceScore: number | null;
  kneeAlignmentScore: number | null;
  similarityScore: number | null;
}

export interface CareerSessionsLoadResult {
  sessions: CareerSession[];
  storageAvailable: boolean;
}

export interface CareerSummary {
  latestFormScore: number | null;
  previousFormScore: number | null;
  overallChange: number | null;
  totalSessions: number;
  updatedAt: string;
}

export function isCareerSummary(value: unknown): value is CareerSummary {
  if (typeof value !== "object" || value === null) return false;
  const summary = value as Record<string, unknown>;
  return (
    (summary.latestFormScore === null || isScore(summary.latestFormScore)) &&
    (summary.previousFormScore === null ||
      isScore(summary.previousFormScore)) &&
    (summary.overallChange === null ||
      (typeof summary.overallChange === "number" &&
        Number.isFinite(summary.overallChange) &&
        summary.overallChange >= -100 &&
        summary.overallChange <= 100)) &&
    typeof summary.totalSessions === "number" &&
    Number.isInteger(summary.totalSessions) &&
    summary.totalSessions >= 0 &&
    typeof summary.updatedAt === "string" &&
    Number.isFinite(Date.parse(summary.updatedAt))
  );
}

export type CareerSessionSaveResult =
  | "saved"
  | "duplicate"
  | "unavailable";

const completedAnalysisIds = new Set<string>();

function isScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function isOptionalScore(value: unknown): value is number | null {
  return value === null || isScore(value);
}

function average(values: number[]): number | null {
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
}

function createUniqueId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createAnalysisId(): string {
  return createUniqueId();
}

export function getCareerSessionsStorageKey(identity: string): string {
  return `${CAREER_SESSIONS_STORAGE_KEY}:${encodeURIComponent(identity)}`;
}

export function createCareerSession(
  analysisId: string,
  scores: AnalysisScores,
  analyzedAt = new Date(),
): CareerSession | null {
  const flareScore = isScore(scores.flareScore) ? scores.flareScore : null;
  const bendScore = isScore(scores.bendScore) ? scores.bendScore : null;
  const feetDistanceScore = isScore(scores.feetDistanceScore)
    ? scores.feetDistanceScore
    : null;
  const kneeDistanceScore = isScore(scores.kneeDistanceScore)
    ? scores.kneeDistanceScore
    : null;
  const kneeFlareScore = isScore(scores.kneeFlareScore)
    ? scores.kneeFlareScore
    : null;
  const similarityScore = isScore(scores.similarityScore)
    ? scores.similarityScore
    : null;
  const kneeAlignmentScore = average(
    [kneeDistanceScore, kneeFlareScore].filter(isScore),
  );
  const overallFormScore = average(
    [flareScore, bendScore, feetDistanceScore, kneeAlignmentScore].filter(
      isScore,
    ),
  );

  if (overallFormScore === null) return null;

  return {
    id: createUniqueId(),
    analysisId,
    analyzedAt: analyzedAt.toISOString(),
    overallFormScore,
    flareScore,
    bendScore,
    feetDistanceScore,
    kneeAlignmentScore,
    similarityScore,
  };
}

export function isCareerSession(value: unknown): value is CareerSession {
  if (typeof value !== "object" || value === null) return false;

  const session = value as Record<string, unknown>;
  return (
    typeof session.id === "string" &&
    session.id.length > 0 &&
    typeof session.analysisId === "string" &&
    session.analysisId.length > 0 &&
    typeof session.analyzedAt === "string" &&
    Number.isFinite(Date.parse(session.analyzedAt)) &&
    isScore(session.overallFormScore) &&
    isOptionalScore(session.flareScore) &&
    isOptionalScore(session.bendScore) &&
    isOptionalScore(session.feetDistanceScore) &&
    isOptionalScore(session.kneeAlignmentScore) &&
    isOptionalScore(session.similarityScore)
  );
}

export function sanitizeCareerSession(
  session: CareerSession,
): CareerSession {
  return {
    id: session.id,
    analysisId: session.analysisId,
    analyzedAt: session.analyzedAt,
    overallFormScore: session.overallFormScore,
    flareScore: session.flareScore,
    bendScore: session.bendScore,
    feetDistanceScore: session.feetDistanceScore,
    kneeAlignmentScore: session.kneeAlignmentScore,
    similarityScore: session.similarityScore,
  };
}

function sortNewestFirst(sessions: CareerSession[]): CareerSession[] {
  return [...sessions].sort(
    (first, second) =>
      Date.parse(second.analyzedAt) - Date.parse(first.analyzedAt),
  );
}

function readStoredSessions(storageKey: string): CareerSession[] {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.warn("Career history was corrupted and could not be loaded.", error);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn("Career history had an invalid format and was ignored.");
    return [];
  }

  const validSessions = parsed.filter(isCareerSession);
  if (validSessions.length !== parsed.length) {
    console.warn("Invalid career history entries were ignored.");
  }

  return sortNewestFirst(validSessions.map(sanitizeCareerSession));
}

export function loadCareerSessions(
  storageKey: string,
): CareerSessionsLoadResult {
  if (typeof window === "undefined") {
    return { sessions: [], storageAvailable: false };
  }

  try {
    return {
      sessions: readStoredSessions(storageKey),
      storageAvailable: true,
    };
  } catch (error) {
    console.warn("Unable to read career history from local storage.", error);
    return { sessions: [], storageAvailable: false };
  }
}

export function saveCareerSession(
  session: CareerSession,
  storageKey: string,
): CareerSessionSaveResult {
  if (completedAnalysisIds.has(session.analysisId)) return "duplicate";
  completedAnalysisIds.add(session.analysisId);

  if (typeof window === "undefined") return "unavailable";

  try {
    const sessions = readStoredSessions(storageKey);
    if (sessions.some((saved) => saved.analysisId === session.analysisId)) {
      return "duplicate";
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(sortNewestFirst([session, ...sessions])),
    );
    window.dispatchEvent(new Event(CAREER_SESSIONS_UPDATED_EVENT));
    return "saved";
  } catch (error) {
    console.warn("Unable to save career history to local storage.", error);
    return "unavailable";
  }
}

export function replaceCareerSessions(
  sessions: CareerSession[],
  storageKey: string,
): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(sortNewestFirst(sessions)),
    );
    return true;
  } catch (error) {
    console.warn("Unable to cache career history in local storage.", error);
    return false;
  }
}
