import Link from "next/link";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
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
  return (
    <HubShell rightRail={<RightRail />}>
      <div>
        <h1 className="text-3xl font-black text-white lowercase mb-1" style={{ fontFamily: "var(--font-syne)" }}>leaderboard</h1>
        <p className="text-xs text-white/40 mb-6" style={{ fontFamily: "var(--font-mono)" }}>top fans by xp · all time</p>
        <ol className="space-y-2" data-testid="leaderboard-list">
          {top.map((u, i) => (
            <li key={u.id} className="peng-card flex items-center gap-3" data-testid={`leaderboard-row-${u.username}`}>
              <span className="text-2xl font-black w-10 text-center" style={{ color: i < 3 ? "var(--accent)" : "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{i + 1}</span>
              <Link href={`/hub/user/${u.username}`} className="flex items-center gap-3 flex-1 hover:opacity-80">
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center" style={{ background: `${u.accentColor}33` }}>
                  {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : "🐧"}
                </div>
                <div>
                  <p className="text-sm text-white" style={{ fontFamily: "var(--font-mono)" }}>{u.displayName}</p>
                  <p className="text-[10px] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>@{u.username} · LVL {u.level}</p>
                </div>
              </Link>
              <div className="text-right" style={{ fontFamily: "var(--font-mono)" }}>
                <p className="text-sm text-[var(--xp-color)]">{u.xp} xp</p>
                <p className="text-[10px] text-white/40">◈ {u.shards}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </HubShell>
  );
}
