import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardShards, awardXP, checkInReward } from "@/lib/economy";
import { TransactionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Check if already checked in today
  const existing = await prisma.checkIn.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already checked in today", alreadyDone: true }, { status: 409 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakCount: true, longestStreak: true, lastCheckIn: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Streak logic: if last check-in was yesterday, extend streak; otherwise reset
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const lastCheckInDate = user.lastCheckIn
    ? user.lastCheckIn.toISOString().slice(0, 10)
    : null;

  let newStreak =
    lastCheckInDate === yesterdayStr
      ? user.streakCount + 1
      : 1; // reset if gap

  const newLongest = Math.max(newStreak, user.longestStreak);
  const { shards, multiplier } = checkInReward(newStreak);

  // Write everything atomically
  await prisma.$transaction(async (tx) => {
    await tx.checkIn.create({
      data: {
        userId,
        date: today,
        streak: newStreak,
        multiplier,
        shardsEarned: shards,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreak,
        longestStreak: newLongest,
        lastCheckIn: new Date(),
      },
    });
  });

  // Award shards and XP (each writes their own ledger entries)
  const [shardsResult] = await Promise.all([
    awardShards(userId, shards, TransactionType.CHECK_IN_REWARD, {
      streak: newStreak,
      multiplier,
      date: today,
    }),
    awardXP(userId, Math.floor(shards / 2)),
  ]);

  // Grant streak achievements
  const milestones = [3, 7, 14, 30, 60, 100];
  const hitMilestone = milestones.find((m) => m === newStreak);
  if (hitMilestone) {
    const achievement = await prisma.achievement.findUnique({
      where: { slug: `streak_${hitMilestone}` },
    });
    if (achievement) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
        create: { userId, achievementId: achievement.id },
        update: {},
      });
    }
  }

  return NextResponse.json({
    streak: newStreak,
    multiplier,
    shardsEarned: shards,
    newBalance: shardsResult.newBalance,
    longestStreak: newLongest,
    milestone: hitMilestone ?? null,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const today = new Date().toISOString().slice(0, 10);

  const [existing, user] = await Promise.all([
    prisma.checkIn.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, longestStreak: true, shards: true },
    }),
  ]);

  return NextResponse.json({
    canCheckIn: !existing,
    streak: user?.streakCount ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    shards: user?.shards ?? 0,
    lastCheckIn: existing ? today : null,
  });
}
