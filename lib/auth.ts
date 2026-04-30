import { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // MED-9: typed cast avoids `user as any`
        token.role = (user as { id: string; role?: string }).role;
      }
      // LOW-12: Only hit DB on sign-in (user present) or explicit session update —
      // skip extra DB round-trip on every normal request by checking trigger first.
      if (user || trigger === "update") {
        const userId = (token.id ?? user?.id) as string | undefined;
        if (userId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { targetLanguage: true, nativeLanguage: true },
          });
          if (dbUser) {
            token.targetLanguage = dbUser.targetLanguage;
            token.nativeLanguage = dbUser.nativeLanguage;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.targetLanguage = (token.targetLanguage as string) ?? "fr";
        session.user.nativeLanguage = (token.nativeLanguage as string) ?? "en";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // MED-13: upsert guards against duplicate-key errors if the event fires twice
      // (e.g. race between OAuth and createUser webhook) or during re-seeding.
      await prisma.progress.upsert({
        where:  { userId: user.id! },
        create: { userId: user.id!, skillTree: { vocabulary: 0, grammar: 0, speaking: 0 }, weeklyXp: {} },
        update: {},
      });
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      targetLanguage: string;
      nativeLanguage: string;
    };
  }
}
