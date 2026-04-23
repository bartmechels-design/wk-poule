import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateGroepCode } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const groepen = await db.group.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { students: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groepen);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { naam } = await req.json();
  if (!naam?.trim()) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  let code = generateGroepCode();
  let tries = 0;
  while (tries < 10) {
    const bestaand = await db.group.findUnique({ where: { code } });
    if (!bestaand) break;
    code = generateGroepCode();
    tries++;
  }

  const groep = await db.group.create({
    data: { name: naam.trim(), code, teacherId: session.user.id },
  });

  return NextResponse.json(groep, { status: 201 });
}
