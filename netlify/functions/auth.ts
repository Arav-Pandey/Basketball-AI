import type { Handler } from "@netlify/functions";
import {
  getSessionUsername,
  SESSION_COOKIE_NAME,
} from "./utils/session";

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { ...headers, Allow: "GET" },
      body: JSON.stringify({ error: "Method not allowed." }),
    };
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("Authentication is unavailable: AUTH_SECRET is not configured.");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Authentication is temporarily unavailable." }),
    };
  }

  const cookieHeader = event.headers.cookie ?? event.headers.Cookie;
  const username = getSessionUsername(cookieHeader, secret);
  if (!username) {
    return {
      statusCode: 401,
      headers: {
        ...headers,
        "Set-Cookie": `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NETLIFY_DEV === "true" ? "" : "; Secure"}`,
      },
      body: JSON.stringify({ authenticated: false }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ authenticated: true, username }),
  };
};
