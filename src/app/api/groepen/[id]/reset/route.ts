import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

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

  const students = await db.student.findMany({ where: { groupId: id }, select: { id: true } });
  const studentIds = students.map((s) => s.id);

  await db.prediction.deleteMany({ where: { studentId: { in: studentIds } } });
  await db.tournamentPrediction.deleteMany({ where: { studentId: { in: studentIds } } });
  await db.student.updateMany({ where: { id: { in: studentIds } }, data: { totalPoints: 0 } });

  return NextResponse.json({ ok: true });
}
