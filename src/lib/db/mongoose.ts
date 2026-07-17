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
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
