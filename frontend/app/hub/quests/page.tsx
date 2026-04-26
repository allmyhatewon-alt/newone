"use client";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { useAuth } from "@/app/providers";

export default function QuestsPage() {
  const { user } = useAuth();
  const QUESTS = [
    { label: "Daily check-in", reward: "+10 xp · +10 shards", href: user ? "/hub" : "/auth/signin", testid: "quest-checkin" },
    { label: "Make a post", reward: "+5 xp · +2 shards", href: "/hub/post/new", testid: "quest-post" },
    { label: "Comment 3 times", reward: "+10 xp", href: "/hub", testid: "quest-comment" },
    { label: "Vote on 5 posts", reward: "+5 xp", href: "/hub", testid: "quest-vote" },
    { label: "Customize showcase", reward: "+25 xp · unlock badge", href: "/hub/showcase", testid: "quest-showcase" },
    { label: "Build your space", reward: "+50 xp · unlock badge", href: "/hub/space/edit", testid: "quest-space" },
  ];
  return (
    <HubShell rightRail={<RightRail />}>
      <div>
        <h1 className="text-3xl font-black text-white lowercase mb-1" style={{ fontFamily: "var(--font-syne)" }}>daily quests</h1>
        <p className="text-xs text-white/40 mb-6" style={{ fontFamily: "var(--font-mono)" }}>complete to earn xp + shards</p>
        <div className="space-y-3" data-testid="quests-list">
          {QUESTS.map((q) => (
            <a key={q.label} href={q.href} className="peng-card hover:border-[var(--accent)]/40 transition-colors flex items-center justify-between" data-testid={q.testid}>
              <div>
                <p className="text-sm text-white" style={{ fontFamily: "var(--font-mono)" }}>{q.label}</p>
                <p className="text-[10px] text-[var(--xp-color)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>{q.reward}</p>
              </div>
              <span className="text-xs text-white/40">→</span>
            </a>
          ))}
        </div>
      </div>
    </HubShell>
  );
}
