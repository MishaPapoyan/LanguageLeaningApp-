import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MemoryPalace } from "@/components/games/MemoryPalace";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Palace — LangCraft",
  description: "Learn French words through spatial memory",
};

export default async function MemoryPalacePage() {
  const session = await getServerSession(authOptions);

  // Get kitchen/home words for the memory palace
  const words = await prisma.word.findMany({
    where: { category: { in: ["food", "travel", "places", "greetings"] } },
    take: 8,
  });

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-zinc-900">Memory Palace</h1>
        <p className="text-sm text-zinc-500 mt-1">Place French words around a virtual café — click objects to reveal their names</p>
      </div>
      <MemoryPalace words={words as any} />
    </div>
  );
}
