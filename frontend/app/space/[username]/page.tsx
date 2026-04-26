import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BlockRenderer } from "@/components/BlockRenderer/BlockRenderer";
import type { Block } from "@/components/BlockRenderer/BlockRenderer";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    select: { displayName: true, space: true },
  });
  if (!user || !user.space) return { title: "Not Found" };
  return {
    title: user.space.metaTitle ?? `${user.displayName}'s Space`,
    description: user.space.metaDescription ?? `Welcome to ${user.displayName}'s personal space`,
  };
}

export default async function SpacePage({ params }: Props) {
  const viewer = await getCurrentUser();
  const userRow = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      accentColor: true,
      gemsUnlocked: true,
      bio: true,
      image: true,
      space: true,
    },
  });
  if (!userRow || !userRow.space) notFound();

  const space = userRow.space;
  const isOwner = viewer?.username === userRow.username;
  if (!space.published && !isOwner) notFound();

  const blocks = (JSON.parse(space.blocks || "[]") || []) as Block[];

  return (
    <div
      className="min-h-screen pb-24 pt-12"
      style={{
        // @ts-expect-error CSS custom props
        "--user-accent": userRow.accentColor,
        "--user-accent-glow": `${userRow.accentColor}33`,
      } as React.CSSProperties}
      data-testid="personal-space"
    >
      {space.customCss && (
        <style dangerouslySetInnerHTML={{ __html: space.customCss.replace(/<\/?style[^>]*>/gi, "") }} />
      )}

      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/hub" className="text-xs text-white/40 hover:text-white" data-testid="back-to-hub-link" style={{ fontFamily: "var(--font-mono)" }}>← peng hub</Link>
          {isOwner && (
            <div className="flex gap-2">
              <Link href="/hub/space/edit" className="peng-btn peng-btn-ghost text-xs" data-testid="edit-space-link">Edit Space</Link>
              {!space.published && (
                <span className="peng-btn peng-btn-ghost text-xs opacity-40" style={{ cursor: "default" }}>DRAFT</span>
              )}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 rounded-full overflow-hidden border-2 mb-3" style={{ borderColor: userRow.accentColor }}>
            {userRow.image ? <img src={userRow.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: `${userRow.accentColor}33` }}>🐧</div>}
          </div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-syne)" }} data-testid="space-displayname">{userRow.displayName}</h1>
          <p className="text-xs text-white/40 mt-1" style={{ fontFamily: "var(--font-mono)" }}>@{userRow.username}</p>
          {userRow.bio && <p className="text-sm text-white/60 mt-3 max-w-md mx-auto">{userRow.bio}</p>}
        </div>

        {blocks.length === 0 ? (
          <div className="text-center py-24 opacity-30" style={{ fontFamily: "var(--font-mono)" }}>
            <p className="text-4xl mb-4">🐧</p>
            <p className="text-sm">this space is empty</p>
            {isOwner && (
              <Link href="/hub/space/edit" className="peng-btn peng-btn-primary text-xs mt-4 inline-flex" data-testid="build-space-link">
                Build Your Space
              </Link>
            )}
          </div>
        ) : (
          <BlockRenderer blocks={blocks} isOwner={isOwner} gemsUnlocked={isOwner ? userRow.gemsUnlocked : true} />
        )}
      </div>
    </div>
  );
}
