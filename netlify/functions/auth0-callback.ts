import type { Handler, HandlerResponse } from "@netlify/functions";
import type { Document } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  clearAuth0TransactionCookie,
  getAuth0Config,
  readAuth0Transaction,
} from "./utils/auth0";
import { getMongoClient } from "./utils/mongodb";
import { createSessionCookie } from "./utils/session";

interface Auth0UserDocument extends Document {
  _id: string;
}

function redirectToLogin(
  secure: boolean,
  sessionCookie?: string,
): HandlerResponse {
  const cookies = [clearAuth0TransactionCookie(secure)];
  if (sessionCookie) cookies.push(sessionCookie);

  return {
    statusCode: 302,
    headers: {
      Location: "/login?authError=1",
      "Cache-Control": "no-store",
    },
    multiValueHeaders: { "Set-Cookie": cookies },
    body: "",
  };
}

export const handler: Handler = async (event) => {
  const secure = process.env.NETLIFY_DEV !== "true";
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET", "Content-Type": "text/plain" },
      body: "Method not allowed.",
    };
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    console.error("Auth0 callback is unavailable: AUTH_SECRET is not configured.");
    return redirectToLogin(secure);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Auth0 callback is unavailable: MONGODB_URI is not configured.");
    return redirectToLogin(secure);
  }

  const callbackState = event.queryStringParameters?.state;
  const code = event.queryStringParameters?.code;
  const providerError = event.queryStringParameters?.error;
  if (providerError || !callbackState || !code) {
    return redirectToLogin(secure);
  }

  const cookieHeader = event.headers.cookie ?? event.headers.Cookie;
  const transaction = readAuth0Transaction(cookieHeader, authSecret);
  if (!transaction || transaction.state !== callbackState) {
    return redirectToLogin(secure);
  }

  try {
    const config = getAuth0Config();
    const tokenResponse = await fetch(new URL("oauth/token", config.issuer), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl,
        code_verifier: transaction.codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Auth0 token exchange failed:", tokenResponse.status);
      return redirectToLogin(secure);
    }

    const tokenResponseBody: unknown = await tokenResponse.json();
    if (
      typeof tokenResponseBody !== "object" ||
      tokenResponseBody === null ||
      !("id_token" in tokenResponseBody) ||
      typeof tokenResponseBody.id_token !== "string"
    ) {
      console.error("Auth0 token response did not contain an ID token.");
      return redirectToLogin(secure);
    }

    const jwks = createRemoteJWKSet(
      new URL(".well-known/jwks.json", config.issuer),
    );
    const { payload } = await jwtVerify(tokenResponseBody.id_token, jwks, {
      issuer: config.issuer,
      audience: config.clientId,
      algorithms: ["RS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      payload.sub.length === 0 ||
      payload.nonce !== transaction.nonce
    ) {
      console.error("Verified Auth0 ID token did not contain a subject.");
      return redirectToLogin(secure);
    }

    const mongoClient = await getMongoClient(mongoUri);
    const database = mongoClient.db(process.env.MONGODB_DB || "BasketballAI");
    const now = new Date();
    const userProfile: Record<string, unknown> = {
      auth0Id: payload.sub,
      lastLoginAt: now,
    };
    if (typeof payload.email === "string") {
      userProfile.email = payload.email;
    }
    if (typeof payload.email_verified === "boolean") {
      userProfile.emailVerified = payload.email_verified;
    }
    if (typeof payload.name === "string") {
      userProfile.name = payload.name;
    }
    if (typeof payload.picture === "string") {
      userProfile.picture = payload.picture;
    }

    await database.collection<Auth0UserDocument>("users").updateOne(
      { _id: `auth0:${payload.sub}` },
      {
        $set: userProfile,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    const sessionCookie = createSessionCookie(
      payload.sub,
      authSecret,
      secure,
    );
    return {
      statusCode: 302,
      headers: {
        Location: "/",
        "Cache-Control": "no-store",
      },
      multiValueHeaders: {
        "Set-Cookie": [
          clearAuth0TransactionCookie(secure),
          sessionCookie,
        ],
      },
      body: "",
    };
  } catch (error) {
    console.error(
      "Auth0 callback failed:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return redirectToLogin(secure);
  }
};
