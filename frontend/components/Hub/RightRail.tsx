"use client";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useEffect, useRef, useState } from "react";
import { fireBurst } from "@/components/Effects/ParticleBurst";

export function RightRail() {
  const { user, refresh } = useAuth();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [checkInState, setCheckInState] = useState<{ canCheckIn: boolean; loading: boolean }>({
    canCheckIn: false,
    loading: true,
  });
  const [flash, setFlash] = useState<string | null>(null);
  const checkinBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/leaderboard").then((r) => r.json()).then((d) => setTopUsers(d.users?.slice(0, 5) ?? []));
    if (user) {
      fetch("/api/check-in").then((r) => r.json()).then((d) =>
        setCheckInState({ canCheckIn: !!d.canCheckIn, loading: false })
      );
    }
  }, [user]);

  async function checkIn() {
    setCheckInState((s) => ({ ...s, loading: true }));
    const r = await fetch("/api/check-in", { method: "POST" });
    const d = await r.json();
    if (r.ok) {
      // particle burst from the button
      const btn = checkinBtnRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        fireBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, "var(--xp-color)");
        setTimeout(() => fireBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, "var(--shard-color)"), 180);
      }
      setFlash(`+${d.shardsEarned} shards · ${d.streak}-day streak`);
      setCheckInState({ canCheckIn: false, loading: false });
      refresh();
    } else {
      setFlash(d.error ?? "couldn't check in");
      setCheckInState({ canCheckIn: false, loading: false });
    }
    setTimeout(() => setFlash(null), 4000);
  }

  return (
    <div className="space-y-4" data-testid="right-rail">
      {/* Welcome card */}
      <div className="peng-card border-[var(--bg-border)]">
        <p className="text-[10px] tracking-widest text-[var(--xp-color)] mb-2" style={{ fontFamily: "var(--font-mono)" }}>
          PENG_BOT · v1.0
        </p>
        <h3 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "var(--font-syne)" }}>
          welcome to the hub
        </h3>
        <p className="text-xs text-white/55 leading-relaxed mb-4">
          a creator + fan community built for late-night streamers, clip hunters, and the void. be real. be kind. promote hard.
        </p>
        <div className="flex gap-2">
          <Link href="/hub/board/announcements" className="peng-btn peng-btn-ghost text-[10px] flex-1" data-testid="announcements-link">ANNOUNCEMENTS</Link>
          <Link href="/hub/inbox" className="peng-btn peng-btn-ghost text-[10px] flex-1" data-testid="support-link">SUPPORT</Link>
        </div>
      </div>

      {/* Status */}
      {user && (
        <div className="peng-card">
          <p className="text-[10px] tracking-widest text-white/40 mb-3" style={{ fontFamily: "var(--font-mono)" }}>YOUR STATUS</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center streak-flicker" style={{ background: "linear-gradient(135deg, #ff6a00, #ff2e55)" }}>
              <span className="text-xl font-black text-white" data-testid="streak-count">{user.streakCount}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white" style={{ fontFamily: "var(--font-mono)" }}>day streak</p>
              <p className="text-[10px] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>CHECK IN DAILY TO KEEP IT ALIVE</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-white/70">LVL {user.level} · {user.role.toLowerCase()}</span>
            <span className="text-[var(--xp-color)]" data-testid="xp-display">{user.xp} xp</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full" style={{ width: `${Math.min(100, (user.xp % 100))}%`, background: "linear-gradient(90deg, var(--xp-color), var(--shard-color))" }} />
          </div>
          {flash && (
            <p className="text-xs text-green-400 text-center mb-2" data-testid="checkin-flash" style={{ fontFamily: "var(--font-mono)" }}>{flash}</p>
          )}
          <button
            ref={checkinBtnRef}
            onClick={checkIn}
            disabled={!checkInState.canCheckIn || checkInState.loading}
            className="w-full peng-btn peng-btn-primary text-xs py-3 disabled:opacity-30"
            data-testid="checkin-button"
          >
            {checkInState.loading ? "..." : checkInState.canCheckIn ? "CHECK IN TODAY" : "CHECKED IN ✓"}
          </button>
        </div>
      )}

      {/* Quests stub */}
      <div className="peng-card">
        <p className="text-[10px] tracking-widest text-[var(--accent)] mb-3" style={{ fontFamily: "var(--font-mono)" }}>◆ TODAY&apos;S QUESTS</p>
        <ul className="space-y-2">
          {[
            { label: "Daily check-in", reward: 10 },
            { label: "Post or comment", reward: 20 },
            { label: "Vote on 3 posts", reward: 5 },
          ].map((q, i) => (
            <li key={i} className="flex items-center justify-between text-xs">
              <span className="text-white/55 truncate flex-1">{q.label}</span>
              <span className="text-[var(--xp-color)] font-mono ml-2">+{q.reward}xp</span>
            </li>
          ))}
        </ul>
        <Link href="/hub/quests" className="block text-[10px] text-white/40 hover:text-white mt-3" data-testid="all-quests-link" style={{ fontFamily: "var(--font-mono)" }}>ALL QUESTS →</Link>
      </div>

      {/* Top fans */}
      <div className="peng-card">
        <p className="text-[10px] tracking-widest text-white/40 mb-3" style={{ fontFamily: "var(--font-mono)" }}>♛ TOP FANS · WEEK</p>
        <ul className="space-y-2">
          {topUsers.map((u, i) => (
            <li key={u.id} className="flex items-center gap-2 text-xs">
              <span className="text-white/40 w-4">{i + 1}</span>
              <Link href={`/hub/user/${u.username}`} className="flex items-center gap-2 flex-1 hover:text-white" data-testid={`top-fan-${u.username}`}>
                <div className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center" style={{ background: `${u.accentColor}55` }}>
                  {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover rounded-full" /> : "🐧"}
                </div>
                <span className="text-white/70">{u.displayName}</span>
              </Link>
              <span className="text-[var(--xp-color)] text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>{u.xp}xp</span>
            </li>
          ))}
          {topUsers.length === 0 && <li className="text-xs text-white/30 italic">no fans yet</li>}
        </ul>
      </div>
    </div>
  );
}
