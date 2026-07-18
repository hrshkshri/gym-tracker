import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";
import { BodyweightModel } from "@/lib/models/bodyweight.model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const rows = await BodyweightModel.find({}, { _id: 0, __v: 0 }).lean().exec();
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    await BodyweightModel.updateOne({ id: body.id }, body, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}
