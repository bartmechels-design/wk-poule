import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const wedstrijden = await db.match.findMany({
    where: { externalId: { not: null } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(wedstrijden);
}
