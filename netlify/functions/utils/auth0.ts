import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const AUTH0_STATE_COOKIE = "hoopcorrector_auth0_state";
const AUTH0_STATE_MAX_AGE_SECONDS = 10 * 60;

export interface Auth0Transaction {
  state: string;
  nonce: string;
  codeVerifier: string;
  expiresAt: number;
}

export interface Auth0Config {
  issuer: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export function getAuth0Config(): Auth0Config {
  const domain = process.env.AUTH0_DOMAIN?.trim().replace(/^https?:\/\//i, "");
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const callbackUrl = process.env.AUTH0_CALLBACK_URL;

  if (!domain || !clientId || !clientSecret || !callbackUrl) {
    throw new Error("Auth0 environment variables are not configured.");
  }

  const issuerUrl = new URL(`https://${domain}`);
  const callback = new URL(callbackUrl);
  const isLocalHttpCallback =
    process.env.NETLIFY_DEV === "true" &&
    callback.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(callback.hostname);
  if (
    issuerUrl.protocol !== "https:" ||
    issuerUrl.pathname !== "/" ||
    issuerUrl.search ||
    issuerUrl.hash ||
    (callback.protocol !== "https:" && !isLocalHttpCallback)
  ) {
    throw new Error("Auth0 domain or callback URL is invalid.");
  }

  return {
    issuer: `${issuerUrl.origin}/`,
    clientId,
    clientSecret,
    callbackUrl: callback.toString(),
  };
}

export function createAuth0Transaction(): Auth0Transaction {
  return {
    state: randomBytes(32).toString("base64url"),
    nonce: randomBytes(32).toString("base64url"),
    codeVerifier: randomBytes(32).toString("base64url"),
    expiresAt: Math.floor(Date.now() / 1000) + AUTH0_STATE_MAX_AGE_SECONDS,
  };
}

export function getCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAuth0TransactionCookie(
  transaction: Auth0Transaction,
  secret: string,
  isSecure: boolean,
): string {
  const payload = Buffer.from(JSON.stringify(transaction)).toString("base64url");
  const signature = sign(payload, secret);
  const secureAttribute = isSecure ? "; Secure" : "";
  return `${AUTH0_STATE_COOKIE}=${payload}.${signature}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${AUTH0_STATE_MAX_AGE_SECONDS}${secureAttribute}`;
}

export function clearAuth0TransactionCookie(isSecure: boolean): string {
  const secureAttribute = isSecure ? "; Secure" : "";
  return `${AUTH0_STATE_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureAttribute}`;
}

export function readAuth0Transaction(
  cookieHeader: string | undefined,
  secret: string,
): Auth0Transaction | null {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH0_STATE_COOKIE}=`));
  const token = cookie?.slice(AUTH0_STATE_COOKIE.length + 1);
  const [payload, signature, ...extraParts] = token?.split(".") ?? [];

  if (!payload || !signature || extraParts.length > 0) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("state" in parsed) ||
      !("nonce" in parsed) ||
      !("codeVerifier" in parsed) ||
      !("expiresAt" in parsed)
    ) {
      return null;
    }

    const { state, nonce, codeVerifier, expiresAt } = parsed;
    if (
      typeof state !== "string" ||
      typeof nonce !== "string" ||
      typeof codeVerifier !== "string" ||
      typeof expiresAt !== "number" ||
      expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { state, nonce, codeVerifier, expiresAt };
  } catch {
    return null;
  }
}

export function getAuth0LogoutUrl(
  issuer: string,
  clientId: string,
  callbackUrl: string,
): string {
  const url = new URL("v2/logout", issuer);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("returnTo", new URL(callbackUrl).origin);
  return url.toString();
}
