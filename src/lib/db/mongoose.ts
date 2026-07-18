import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

let cached = (global as any)._mongoose as
  | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
  | undefined;

if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };

export async function connectMongo(): Promise<typeof mongoose> {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, { dbName: "gym" });
  }
  try {
    cached!.conn = await cached!.promise;
  } catch (err) {
    // Reset so the next request retries instead of re-awaiting a rejected
    // promise forever (e.g. after the Atlas IP allowlist is fixed).
    cached!.promise = null;
    throw err;
  }
  return cached!.conn;
}
