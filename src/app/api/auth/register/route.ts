import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, school, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Vul alle verplichte velden in." }, { status: 400 });
    }

    const bestaand = await db.teacher.findUnique({ where: { email } });
    if (bestaand) {
      return NextResponse.json(
        { error: "Dit e-mailadres is al in gebruik." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.teacher.create({
      data: { name, school: school || null, email, passwordHash },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Serverfout." }, { status: 500 });
  }
}
