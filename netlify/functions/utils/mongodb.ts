import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

export function getMongoErrorDetails(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { name: "UnknownError", message: "An unknown MongoDB error occurred." };
  }

  const details: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };
  const errorRecord = asRecord(error);
  const cause = errorRecord?.cause;
  if (cause instanceof Error) {
    details.cause = { name: cause.name, message: cause.message };
  }

  const reason = asRecord(errorRecord?.reason);
  const servers = reason?.servers;
  if (servers instanceof Map) {
    details.servers = Array.from(servers.entries(), ([address, value]) => {
      const server = asRecord(value);
      const serverError = server?.error;
      return {
        address,
        type: server?.type,
        error:
          serverError instanceof Error
            ? { name: serverError.name, message: serverError.message }
            : undefined,
      };
    });
  }

  return details;
}

export function getMongoClient(uri: string): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5_000,
      serverSelectionTimeoutMS: 7_000,
      socketTimeoutMS: 7_000,
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
    });
    clientPromise = client.connect().catch((error: unknown) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}
