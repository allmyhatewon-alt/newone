import Link from "next/link";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { prisma } from "@/lib/prisma";

export default async function AllBoardsPage() {
  const boards = await prisma.board.findMany({ orderBy: { postCount: "desc" } });
  return (
    <HubShell rightRail={<RightRail />}>
      <div>
        <h1 className="text-3xl font-black text-white lowercase mb-1" style={{ fontFamily: "var(--font-syne)" }}>all boards</h1>
        <p className="text-xs text-white/40 mb-6" style={{ fontFamily: "var(--font-mono)" }}>community boards · pick your tribe</p>
        <div className="grid sm:grid-cols-2 gap-3" data-testid="boards-grid">
          {boards.map((b) => (
            <Link
              key={b.id}
              href={`/hub/board/${b.slug}`}
              data-testid={`board-card-${b.slug}`}
              className="peng-card hover:border-[var(--accent)]/40 transition-colors"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>b/{b.slug}</h3>
                <span className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>{b.postCount} posts</span>
              </div>
              <p className="text-sm text-white/60 mt-1">{b.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </HubShell>
  );
}
