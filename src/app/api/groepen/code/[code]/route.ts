import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const groep = await db.group.findUnique({
    where: { code: code.toUpperCase() },
    select: { id: true, name: true, code: true },
  });

  if (!groep) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return NextResponse.json(groep);
}
