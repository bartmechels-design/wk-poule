import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const verwijderd = await db.match.deleteMany({
    where: { externalId: null },
  });

  return NextResponse.json({
    message: `${verwijderd.count} dubbele wedstrijden (zonder externe koppeling) verwijderd`,
    count: verwijderd.count,
  });
}
