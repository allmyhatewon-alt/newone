import { prisma } from "@/lib/prisma";
import { Currency, TransactionType } from "@prisma/client";

// XP required per level — grows quadratically
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Shard reward for check-in with streak multiplier
export function checkInReward(streak: number): { shards: number; multiplier: number } {
  const BASE = 10;
  let multiplier = 1.0;
  if (streak >= 3) multiplier = 1.5;
  if (streak >= 7) multiplier = 2.0;
  if (streak >= 14) multiplier = 2.5;
  if (streak >= 30) multiplier = 3.0;
  return { shards: Math.floor(BASE * multiplier), multiplier };
}

// Award shards, update balance, write ledger entry — all in one transaction
export async function awardShards(
  userId: string,
  amount: number,
  type: TransactionType,
  metadata?: Record<string, unknown>
): Promise<{ newBalance: number }> {
  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { shards: { increment: amount } },
      select: { shards: true },
    });

    await tx.transaction.create({
      data: {
        userId,
        type,
        currency: Currency.SHARD,
        amount,
        balance: user.shards,
        metadata: metadata ?? {},
      },
    });

    // Check if XP should level up
    await tx.user.updateMany({
      where: { id: userId, xp: { gte: xpForLevel(1) } }, // simplified; full check in route
    });

    return user;
  });

  return { newBalance: updated.shards };
}

// Spend shards — throws if insufficient balance
export async function spendShards(
  userId: string,
  amount: number,
  type: TransactionType,
  metadata?: Record<string, unknown>
): Promise<{ newBalance: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { shards: true } });
  if (!user || user.shards < amount) throw new Error("Insufficient shards");

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { shards: { decrement: amount } },
      select: { shards: true },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.SPEND_SHARD,
        currency: Currency.SHARD,
        amount: -amount,
        balance: u.shards,
        metadata: metadata ?? {},
      },
    });
    return u;
  });

  return { newBalance: updated.shards };
}

// Award XP and handle level-ups
export async function awardXP(
  userId: string,
  amount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });
  if (!user) throw new Error("User not found");

  const newXP = user.xp + amount;
  let newLevel = user.level;
  let leveledUp = false;

  while (newXP >= xpForLevel(newLevel)) {
    newLevel++;
    leveledUp = true;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { xp: newXP, level: newLevel },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.CHECK_IN_REWARD,
        currency: Currency.XP,
        amount,
        balance: newXP,
      },
    });
  });

  return { newXP, newLevel, leveledUp };
}
