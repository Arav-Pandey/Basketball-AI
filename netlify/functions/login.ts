import { compare } from "bcryptjs";
import type { Handler } from "@netlify/functions";
import { getMongoClient } from "./utils/mongodb";
import { createSessionCookie, isSecureCookie } from "./utils/session";

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...headers, Allow: "POST" },
      body: JSON.stringify({ error: "Method not allowed." }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Username and password are required." }),
    };
  }

  let credentials: unknown;
  try {
    credentials = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Request body must be valid JSON." }),
    };
  }

  if (
    typeof credentials !== "object" ||
    credentials === null ||
    !("username" in credentials) ||
    !("password" in credentials)
  ) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Username and password are required." }),
    };
  }

  const { username, password } = credentials;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password ||
    username.trim().length > 100 ||
    password.length > 1024
  ) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Enter a valid username and password." }),
    };
  }

  const uri = process.env.MONGODB_URI;
  const authSecret = process.env.AUTH_SECRET;
  if (!uri || !authSecret) {
    console.error(
      "Login is unavailable: MONGODB_URI or AUTH_SECRET is not configured.",
    );
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Login is temporarily unavailable." }),
    };
  }

  try {
    const mongoClient = await getMongoClient(uri);
    const database = mongoClient.db(process.env.MONGODB_DB || "BasketballAI");
    const user = await database
      .collection<{ passwordHash?: string }>("users")
      .findOne(
        { username: username.trim() },
        { projection: { passwordHash: 1 } },
      );

    if (
      !user ||
      typeof user.passwordHash !== "string" ||
      !(await compare(password, user.passwordHash))
    ) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid username or password." }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Set-Cookie": createSessionCookie(
          username.trim(),
          authSecret,
          isSecureCookie(),
        ),
      },
      body: JSON.stringify({ message: "Login successful." }),
    };
  } catch (error) {
    console.error(
      "Login function failed:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Login is temporarily unavailable." }),
    };
  }
};
