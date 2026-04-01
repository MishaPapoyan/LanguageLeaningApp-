import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;

  const words = await prisma.word.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { word: { contains: q, mode: "insensitive" } },
                { translation: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    orderBy: { word: "asc" },
    take: 50,
  });

  return NextResponse.json(words);
}
