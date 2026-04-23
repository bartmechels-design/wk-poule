import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const teacher = await db.teacher.findUnique({
          where: { email: credentials.email as string },
        });

        if (!teacher) return null;

        const ok = await bcrypt.compare(
          credentials.password as string,
          teacher.passwordHash
        );
        if (!ok) return null;

        return { id: teacher.id, email: teacher.email, name: teacher.name };
      },
    }),
  ],
});

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name: string };
  }
}
