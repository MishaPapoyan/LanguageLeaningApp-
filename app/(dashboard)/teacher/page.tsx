import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Dashboard — LinguaFlow",
  description: "Manage your French learning classroom",
};

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "TEACHER") redirect("/home");

  const groups = await prisma.group.findMany({
    where: { teacherId: session.user.id },
    include: {
      members: {
        include: {
          user: {
            include: { progress: true },
          },
        },
      },
      assignments: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return <TeacherDashboard groups={JSON.parse(JSON.stringify(groups))} />;
}
