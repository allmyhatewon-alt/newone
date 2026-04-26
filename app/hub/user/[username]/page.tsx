import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { HubProfileView } from "@/components/HubProfile/HubProfileView";
import type { Metadata } from "next";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    select: { displayName: true, bio: true },
  });
  if (!user) return { title: "Not Found" };
  return {
    title: `${user.displayName} (@${params.username}) — peng hub`,
    description: user.bio ?? `${user.displayName}'s hub profile`,
  };
}

export default async function HubUserPage({ params }: Props) {
  const [profile, session] = await Promise.all([
    prisma.user.findUnique({
      where: { username: params.username.toLowerCase() },
      select: {
        id: true,
        username: true,
        displayName: true,
        image: true,
        bio: true,
        accentColor: true,
        shards: true,
        gems: true,
        xp: true,
        level: true,
        streakCount: true,
        longestStreak: true,
        createdAt: true,
        hubProfile: {
          select: {
            portalEnabled: true,
            portalLabel: true,
            activeSkinId: true,
            activeAuraId: true,
            tiktokUrl: true,
            twitchUrl: true,
            youtubeUrl: true,
            kickUrl: true,
            discordUser: true,
            twitterUrl: true,
            instagramUrl: true,
            showStats: true,
            showStreak: true,
          },
        },
        achievements: {
          include: { achievement: true },
          orderBy: { earnedAt: "desc" },
          take: 12,
        },
        _count: { select: { inventory: true } },
      },
    }),
    auth(),
  ]);

  if (!profile) notFound();

  const isOwn = (session?.user as any)?.username === profile.username;

  return <HubProfileView profile={profile} isOwn={isOwn} />;
}
