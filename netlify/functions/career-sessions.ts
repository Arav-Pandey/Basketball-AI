import type { Handler, HandlerResponse } from "@netlify/functions";
import type { Document, Filter } from "mongodb";
import {
  CAREER_SESSIONS_STORAGE_KEY,
  createCareerSession,
  isCareerSession,
  sanitizeCareerSession,
  type AnalysisScores,
  type CareerSession,
  type CareerSummary,
} from "../../src/Career/careerSessions";
import { getMongoClient, getMongoErrorDetails } from "./utils/mongodb";
import { getSessionUsername } from "./utils/session";

interface UserDocument extends Document {
  _id?: string;
  username?: string;
  careerSessions?: unknown;
}

function jsonResponse(
  statusCode: number,
  body: Record<string, unknown>,
): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

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

function isAnalysisScores(value: unknown): value is AnalysisScores {
  if (typeof value !== "object" || value === null) return false;
  const scores = value as Record<string, unknown>;
  return (
    isOptionalScore(scores.flareScore) &&
    isOptionalScore(scores.bendScore) &&
    isOptionalScore(scores.feetDistanceScore) &&
    isOptionalScore(scores.kneeDistanceScore) &&
    isOptionalScore(scores.kneeFlareScore) &&
    isOptionalScore(scores.similarityScore)
  );
}

function getSessions(user: UserDocument): CareerSession[] {
  return Array.isArray(user.careerSessions)
    ? user.careerSessions.filter(isCareerSession).map(sanitizeCareerSession)
    : [];
}

function sortNewestFirst(sessions: CareerSession[]): CareerSession[] {
  return [...sessions].sort(
    (first, second) =>
      Date.parse(second.analyzedAt) - Date.parse(first.analyzedAt),
  );
}

function summarizeCareer(sessions: CareerSession[]): CareerSummary {
  const sorted = sortNewestFirst(sessions);
  const latestFormScore = sorted[0]?.overallFormScore ?? null;
  const previousFormScore = sorted[1]?.overallFormScore ?? null;
  return {
    latestFormScore,
    previousFormScore,
    overallChange:
      latestFormScore !== null && previousFormScore !== null
        ? latestFormScore - previousFormScore
        : null,
    totalSessions: sorted.length,
    updatedAt: new Date().toISOString(),
  };
}

export const handler: Handler = async (event) => {
  if (
    event.httpMethod !== "GET" &&
    event.httpMethod !== "POST" &&
    event.httpMethod !== "DELETE"
  ) {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    console.error("Career sessions are unavailable: AUTH_SECRET is not configured.");
    return jsonResponse(500, { error: "Career history is temporarily unavailable." });
  }

  const cookieHeader = event.headers.cookie ?? event.headers.Cookie;
  const identity = getSessionUsername(cookieHeader, authSecret);
  if (!identity) {
    return jsonResponse(401, { error: "Sign in to access career history." });
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Career sessions are unavailable: MONGODB_URI is not configured.");
    return jsonResponse(503, { error: "Career history is temporarily unavailable." });
  }

  try {
    const client = await getMongoClient(mongoUri);
    const users = client
      .db(process.env.MONGODB_DB || "BasketballAI")
      .collection<UserDocument>("users");
    const identityFilter: Filter<UserDocument> = {
      $or: [{ _id: `auth0:${identity}` }, { username: identity }],
    };
    const profileCacheKey = `${CAREER_SESSIONS_STORAGE_KEY}:${encodeURIComponent(identity)}`;

    if (event.httpMethod === "GET") {
      const user = await users.findOne(identityFilter, {
        projection: { careerSessions: 1, careerSummary: 1 },
      });
      if (!user) {
        return jsonResponse(404, { error: "Your user profile could not be found." });
      }

      const sessions = sortNewestFirst(getSessions(user));
      const summary = summarizeCareer(sessions);
      await users.updateOne(identityFilter, {
        $set: { careerSessions: sessions, careerSummary: summary },
        $unset: { careerConsistency: "" },
      });
      return jsonResponse(200, {
        sessions,
        summary,
        profileCacheKey,
      });
    }

    if (event.httpMethod === "DELETE") {
      if (!event.body) {
        return jsonResponse(400, {
          error: "A session ID or career-history clear request is required.",
        });
      }

      let requestBody: unknown;
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        return jsonResponse(400, { error: "Request body must be valid JSON." });
      }

      if (typeof requestBody !== "object" || requestBody === null) {
        return jsonResponse(400, { error: "Delete request is invalid." });
      }

      if ("clearCareer" in requestBody && requestBody.clearCareer === true) {
        const sessions: CareerSession[] = [];
        const summary = summarizeCareer(sessions);
        const clearResult = await users.updateOne(identityFilter, {
          $set: {
            careerSessions: sessions,
            careerSummary: summary,
          },
          $unset: { careerConsistency: "" },
        });

        if (clearResult.matchedCount === 0) {
          return jsonResponse(404, {
            error: "Your user profile could not be found.",
          });
        }

        return jsonResponse(200, {
          sessions,
          summary,
          profileCacheKey,
        });
      }

      if (
        !("sessionId" in requestBody) ||
        typeof requestBody.sessionId !== "string" ||
        requestBody.sessionId.length === 0 ||
        requestBody.sessionId.length > 200
      ) {
        return jsonResponse(400, {
          error: "Session ID or clear request is invalid.",
        });
      }

      const deleteResult = await users.updateOne(
        {
          ...identityFilter,
          "careerSessions.id": requestBody.sessionId,
        },
        [
          {
            $set: {
              careerSessions: {
                $filter: {
                  input: {
                    $cond: [
                      { $isArray: "$careerSessions" },
                      "$careerSessions",
                      [],
                    ],
                  },
                  as: "session",
                  cond: {
                    $ne: [
                      "$$session.id",
                      { $literal: requestBody.sessionId },
                    ],
                  },
                },
              },
            },
          },
        ],
      );

      if (deleteResult.matchedCount === 0) {
        const user = await users.findOne(identityFilter, {
          projection: { _id: 1 },
        });
        if (!user) {
          return jsonResponse(404, {
            error: "Your user profile could not be found.",
          });
        }
        return jsonResponse(404, { error: "Analysis session was not found." });
      }

      const updatedUser = await users.findOne(identityFilter, {
        projection: { careerSessions: 1 },
      });
      if (!updatedUser) {
        throw new Error("User profile disappeared after deleting a career session.");
      }

      const sessions = sortNewestFirst(getSessions(updatedUser));
      const summary = summarizeCareer(sessions);
      await users.updateOne(identityFilter, {
        $set: { careerSessions: sessions, careerSummary: summary },
        $unset: { careerConsistency: "" },
      });

      return jsonResponse(200, {
        sessions,
        summary,
        profileCacheKey,
      });
    }

    if (!event.body) {
      return jsonResponse(400, { error: "Analysis results are required." });
    }

    let requestBody: unknown;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      return jsonResponse(400, { error: "Request body must be valid JSON." });
    }

    if (
      typeof requestBody !== "object" ||
      requestBody === null ||
      !("analysisId" in requestBody) ||
      typeof requestBody.analysisId !== "string" ||
      requestBody.analysisId.length === 0 ||
      requestBody.analysisId.length > 200 ||
      !("scores" in requestBody) ||
      !isAnalysisScores(requestBody.scores)
    ) {
      return jsonResponse(400, { error: "Analysis results are invalid." });
    }

    const session = createCareerSession(
      requestBody.analysisId,
      requestBody.scores,
    );
    if (!session) {
      return jsonResponse(422, {
        error: "No valid form measurements were available to save.",
      });
    }

    const updateResult = await users.updateOne(
      {
        ...identityFilter,
        "careerSessions.analysisId": { $ne: session.analysisId },
      },
      [
        {
          $set: {
            careerSessions: {
              $concatArrays: [
                {
                  $cond: [
                    { $isArray: "$careerSessions" },
                    "$careerSessions",
                    [],
                  ],
                },
                [{ $literal: session }],
              ],
            },
          },
        },
      ],
    );

    if (updateResult.matchedCount === 0) {
      const user = await users.findOne(identityFilter, {
        projection: { careerSessions: 1 },
      });
      if (!user) {
        return jsonResponse(404, { error: "Your user profile could not be found." });
      }

      const existingSession = getSessions(user).find(
        (saved) => saved.analysisId === session.analysisId,
      );
      if (existingSession) {
        return jsonResponse(200, {
          session: existingSession,
          profileCacheKey,
          duplicate: true,
        });
      }

      throw new Error("Career session could not be added to the user profile.");
    }

    const updatedUser = await users.findOne(identityFilter, {
      projection: { careerSessions: 1 },
    });
    if (!updatedUser) {
      throw new Error("User profile disappeared after saving a career session.");
    }

    const sessions = getSessions(updatedUser);
    const summary = summarizeCareer(sessions);
    await users.updateOne(identityFilter, {
      $set: { careerSessions: sessions, careerSummary: summary },
      $unset: { careerConsistency: "" },
    });

    return jsonResponse(201, {
      session,
      summary,
      profileCacheKey,
      duplicate: false,
    });
  } catch (error) {
    console.error("Career sessions request failed:", getMongoErrorDetails(error));
    return jsonResponse(503, {
      error: "Could not load or save career history. Please try again.",
    });
  }
};
