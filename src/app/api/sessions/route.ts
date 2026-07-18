import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import { SessionModel } from "@/lib/models/session.model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const sessions = await SessionModel.find({}, { _id: 0, __v: 0 }).lean().exec();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    await SessionModel.updateOne({ id: body.id }, body, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}
