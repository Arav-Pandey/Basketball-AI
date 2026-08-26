import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "hoopcorrector_auth0_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionCookie(
  username: string,
  secret: string,
  isSecure: boolean,
): string {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload, secret)}`;
  const secureAttribute = isSecure ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secureAttribute}`;
}

export function clearSessionCookie(isSecure: boolean): string {
  const secureAttribute = isSecure ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureAttribute}`;
}

export function getSessionUsername(
  cookieHeader: string | undefined,
  secret: string,
): string | null {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  const token = cookie?.slice(SESSION_COOKIE_NAME.length + 1);
  const [payload, signature, ...extraParts] = token?.split(".") ?? [];

  if (!payload || !signature || extraParts.length > 0) return null;

  const expectedSignature = sign(payload, secret);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof session !== "object" ||
      session === null ||
      !("username" in session) ||
      !("expiresAt" in session) ||
      typeof session.username !== "string" ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return session.username;
  } catch {
    return null;
  }
}

export function isSecureCookie(): boolean {
  return process.env.NETLIFY_DEV !== "true";
}
