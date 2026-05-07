import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leerlingen = await db.student.findMany({
    where: { groupId: id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(leerlingen);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { naam } = await req.json();

  if (!naam?.trim()) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  const groep = await db.group.findUnique({
    where: { id },
    include: { teachers: true }
  });

  if (!groep) {
    return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404 });
  }

  const isOwner = groep.teacherId === session.user.id;
  const isCollaborator = groep.teachers.some(t => t.teacherId === session.user.id);

  if (!isOwner && !isCollaborator) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const leerling = await db.student.create({
      data: { name: naam.trim(), groupId: id },
    });
    return NextResponse.json(leerling, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Naam bestaat al in deze groep" },
      { status: 409 }
    );
  }
}
