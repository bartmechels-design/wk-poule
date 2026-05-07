import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { code } = await params;

  const groep = await db.group.findUnique({
    where: { code: code.toUpperCase() },
    include: { teachers: true }
  });

  if (!groep) return NextResponse.json({ error: "Groep niet gevonden" }, { status: 404 });

  const isAlreadyMember = groep.teacherId === session.user.id ||
    groep.teachers.some(t => t.teacherId === session.user.id);

  if (isAlreadyMember) {
    return NextResponse.json({ error: "Je bent al lid van deze groep" }, { status: 400 });
  }

  try {
    await db.groupTeacher.create({
      data: {
        groupId: groep.id,
        teacherId: session.user.id
      }
    });
    return NextResponse.json({ success: true, groupId: groep.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Kon niet toetreden" }, { status: 400 });
  }
}
