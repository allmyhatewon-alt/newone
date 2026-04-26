import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const top = await prisma.user.findMany({
    orderBy: [{ xp: "desc" }, { level: "desc" }],
    take: 50,
    select: {
      id: true,
      username: true,
      displayName: true,
      image: true,
      accentColor: true,
      xp: true,
      level: true,
      shards: true,
      streakCount: true,
    },
  });
  return NextResponse.json({ users: top });
}
