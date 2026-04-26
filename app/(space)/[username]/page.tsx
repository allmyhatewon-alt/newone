import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BlockRenderer } from "@/components/BlockRenderer/BlockRenderer";
import type { Block } from "@/components/BlockRenderer/BlockRenderer";
import type { Metadata } from "next";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = await prisma.space.findFirst({
    where: { user: { username: params.username.toLowerCase() } },
    include: { user: { select: { displayName: true } } },
  });
  if (!space || !space.published) return { title: "Not Found" };
  return {
    title: space.metaTitle ?? `${space.user.displayName}'s Space`,
    description: space.metaDescription ?? `Welcome to ${space.user.displayName}'s personal space`,
  };
}

export default async function SpacePage({ params }: Props) {
  const session = await auth();

  const userRow = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      accentColor: true,
      gemsUnlocked: true,
      space: true,
    },
  });

  if (!userRow || !userRow.space) notFound();

  const space = userRow.space;
  const isOwner = (session?.user as any)?.username === userRow.username;

  // Unpublished spaces only visible to owner
  if (!space.published && !isOwner) notFound();

  const viewerGemsUnlocked =
    isOwner
      ? userRow.gemsUnlocked
      : false;

  const blocks = (space.blocks ?? []) as Block[];

  return (
    <div
      className="min-h-screen pb-24"
      style={
        {
          "--user-accent": userRow.accentColor,
          "--user-accent-glow": `${userRow.accentColor}33`,
        } as React.CSSProperties
      }
    >
      {/* Apply custom CSS from space (gems feature) */}
      {space.customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: space.customCss.replace(/<\/?style[^>]*>/gi, ""),
          }}
        />
      )}

      <div className="max-w-xl mx-auto px-4 pt-12">
        {/* Owner controls */}
        {isOwner && (
          <div className="flex justify-end gap-2 mb-6">
            <a href="/hub/space/edit" className="peng-btn peng-btn-ghost text-xs">
              Edit Space
            </a>
            {!space.published && (
              <span className="peng-btn text-xs opacity-40" style={{ cursor: "default" }}>
                Draft
              </span>
            )}
          </div>
        )}

        {blocks.length === 0 ? (
          <div className="text-center py-24 opacity-30" style={{ fontFamily: "var(--font-mono)" }}>
            <p className="text-4xl mb-4">🐧</p>
            <p className="text-sm">this space is empty</p>
            {isOwner && (
              <a href="/hub/space/edit" className="peng-btn peng-btn-primary text-xs mt-4 inline-flex">
                Build Your Space
              </a>
            )}
          </div>
        ) : (
          <BlockRenderer
            blocks={blocks}
            isOwner={isOwner}
            gemsUnlocked={viewerGemsUnlocked}
          />
        )}
      </div>
    </div>
  );
}
