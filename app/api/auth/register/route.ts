import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  password: z.string().min(6),
  role: z.enum(["STUDENT"]).default("STUDENT"),
  targetLanguage: z.enum(["fr", "es", "en"]).default("fr"),
  nativeLanguage: z.string().max(10).default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role, targetLanguage, nativeLanguage } = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "Email already in use" : "Phone already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        targetLanguage,
        nativeLanguage,
        emailVerified: true,
        phoneVerified: true,
        progress: {
          create: {
            skillTree: { vocabulary: 0, grammar: 0, speaking: 0 },
            weeklyXp: {},
          },
        },
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[register] unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
