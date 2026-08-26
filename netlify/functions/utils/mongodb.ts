import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(uri: string): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect().catch((error: unknown) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}
