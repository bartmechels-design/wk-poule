import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const leerling = await db.student.findUnique({
    where: { id },
    include: {
      group: {
        include: { teachers: true }
      }
    },
  });

  if (!leerling) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const isOwner = leerling.group.teacherId === session.user.id;
  const isCollaborator = leerling.group.teachers.some(t => t.teacherId === session.user.id);

  if (!isOwner && !isCollaborator) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  await db.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
