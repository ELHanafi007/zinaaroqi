import { NextResponse } from "next/server";
import { requireListingsAccess } from "@/lib/auth/requireSession";
import { connectToDatabase } from "@/lib/mongodb/connect";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireListingsAccess();
  if (response) return response;
  try {
    await connectToDatabase();
    const users = await User.find({ active: true }).select("_id name").sort({ name: 1 }).lean();
    return NextResponse.json({ data: users.map(user => ({ userId: user._id.toString(), name: user.name })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Failed to load user options." }, { status: 500 });
  }
}
