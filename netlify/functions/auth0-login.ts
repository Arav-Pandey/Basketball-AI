import type { Handler, HandlerResponse } from "@netlify/functions";
import {
  createAuth0Transaction,
  createAuth0TransactionCookie,
  getAuth0Config,
  getCodeChallenge,
} from "./utils/auth0";

export const handler: Handler = async (
  event,
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET", "Content-Type": "text/plain" },
      body: "Method not allowed.",
    };
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    console.error("Auth0 login is unavailable: AUTH_SECRET is not configured.");
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Login is temporarily unavailable.",
    };
  }

  try {
    const config = getAuth0Config();
    const transaction = createAuth0Transaction();
    const authorizeUrl = new URL("authorize", config.issuer);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", config.clientId);
    authorizeUrl.searchParams.set("redirect_uri", config.callbackUrl);
    authorizeUrl.searchParams.set("scope", "openid profile email");
    authorizeUrl.searchParams.set("state", transaction.state);
    authorizeUrl.searchParams.set("nonce", transaction.nonce);
    authorizeUrl.searchParams.set(
      "code_challenge",
      getCodeChallenge(transaction.codeVerifier),
    );
    authorizeUrl.searchParams.set("code_challenge_method", "S256");

    if (event.queryStringParameters?.screen_hint === "signup") {
      authorizeUrl.searchParams.set("screen_hint", "signup");
    }

    return {
      statusCode: 302,
      headers: {
        Location: authorizeUrl.toString(),
        "Cache-Control": "no-store",
        "Set-Cookie": createAuth0TransactionCookie(
          transaction,
          authSecret,
          process.env.NETLIFY_DEV !== "true",
        ),
      },
      body: "",
    };
  } catch (error) {
    console.error(
      "Unable to start Auth0 login:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Login is temporarily unavailable.",
    };
  }
};
