import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, emailOtp, phoneOtp } = await req.json();

  if (!email || !emailOtp || !phoneOtp) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailOtp !== emailOtp) {
    return NextResponse.json({ error: "Invalid email code" }, { status: 400 });
  }
  if (user.phoneOtp !== phoneOtp) {
    return NextResponse.json({ error: "Invalid phone code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      phoneVerified: true,
      emailOtp: null,
      phoneOtp: null,
    },
  });

  return NextResponse.json({ success: true });
}
