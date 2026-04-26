import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HubProfileView } from "@/components/HubProfile/HubProfileView";
import { Suspense } from "react";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import type { Metadata } from "next";

interface Props { params: { username: string } }

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
  const [profile, viewer] = await Promise.all([
    prisma.user.findUnique({
      where: { username: params.username.toLowerCase() },
      select: {
        id: true,
        username: true,
        displayName: true,
        image: true,
        bio: true,
        bannerUrl: true,
        accentColor: true,
        shards: true,
        gems: true,
        xp: true,
        level: true,
        streakCount: true,
        longestStreak: true,
        role: true,
        createdAt: true,
        hubProfile: true,
        achievements: { include: { achievement: true }, orderBy: { earnedAt: "desc" }, take: 12 },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            board: { select: { slug: true, name: true } },
            author: { select: { username: true, displayName: true, image: true, accentColor: true } },
          },
        },
        _count: { select: { posts: true, followers: true, follows: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!profile) notFound();

  const isOwn = viewer?.username === profile.username;

  // Parse showcase JSON
  const showcase = profile.hubProfile ? JSON.parse(profile.hubProfile.showcase || "[]") : [];
  const interests = profile.hubProfile ? JSON.parse(profile.hubProfile.interests || "[]") : [];

  return (
    <Suspense>
      <HubShell rightRail={<RightRail />}>
        <HubProfileView
          profile={{
            ...profile,
            hubProfile: profile.hubProfile ? { ...profile.hubProfile, showcase, interests } : null,
            posts: profile.posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
            counts: profile._count,
          } as any}
          isOwn={isOwn}
        />
      </HubShell>
    </Suspense>
  );
}
