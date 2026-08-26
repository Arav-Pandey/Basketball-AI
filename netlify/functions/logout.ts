import type { Handler, HandlerResponse } from "@netlify/functions";
import { clearSessionCookie, isSecureCookie } from "./utils/session";
import { getAuth0Config, getAuth0LogoutUrl } from "./utils/auth0";

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

  let logoutUrl = "/";
  try {
    const config = getAuth0Config();
    logoutUrl = getAuth0LogoutUrl(
      config.issuer,
      config.clientId,
      config.callbackUrl,
    );
  } catch (error) {
    console.error(
      "Auth0 logout is not configured:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }

  return {
    statusCode: 302,
    headers: {
      Location: logoutUrl,
      "Cache-Control": "no-store",
      "Set-Cookie": clearSessionCookie(isSecureCookie()),
    },
    body: "",
  };
};
