"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { usePathname } from "next/navigation";
import { FloatingStat } from "@/components/Effects/FloatingStats";
import { ParticleBurstHost } from "@/components/Effects/ParticleBurst";

// SVG icon component to avoid emoji "AI slop" — minimal stroke iconography
function Icon({ name, className = "w-3.5 h-3.5" }: { name: string; className?: string }) {
  const paths: Record<string, JSX.Element> = {
    home: <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />,
    flame: <path d="M12 2s4 4 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 1-3 5a6 6 0 0 0 12 0c0-7-6-11-6-11z" />,
    trending: <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m9 9 7-2-2 7-7 2z" /></>,
    bars: <path d="M3 21V8M9 21V3M15 21v-9M21 21v-5" />,
    play: <path d="M8 5v14l11-7z" />,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20c0-3 4-5 7-5s7 2 7 5M14 20c0-2 3-3 5-3s4 1 4 3" /></>,
    bookmark: <path d="M5 3h14v18l-7-5-7 5z" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    crown: <path d="M3 7l4 6 5-9 5 9 4-6v12H3z" />,
    palette: <path d="M12 2a10 10 0 0 0 0 20c2 0 2-2 2-3s2-2 4-2 4-2 4-5a10 10 0 0 0-10-10z" />,
    bolt: <path d="M13 2 4 14h7v8l9-12h-7z" />,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" /><path d="M9 21a3 3 0 0 0 6 0" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    shield: <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    inbox: <path d="M3 13h5l2 3h4l2-3h5M5 5h14v16H5z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] ?? null}
    </svg>
  );
}

const SIDEBAR_FEED = [
  { href: "/hub", label: "Home", icon: "home" },
  { href: "/hub?sort=hot", label: "Hot", icon: "flame" },
  { href: "/hub?sort=new", label: "New", icon: "trending" },
  { href: "/hub/discover", label: "Discover", icon: "compass" },
  { href: "/hub/live", label: "Live Now", icon: "bars" },
  { href: "/hub/clips", label: "Clips", icon: "play" },
  { href: "/hub/following", label: "Following", icon: "users" },
  { href: "/hub/saved", label: "Saved", icon: "bookmark" },
];

const SIDEBAR_COMMUNITY = [
  { href: "/hub/all-boards", label: "All boards", icon: "grid" },
  { href: "/hub/leaderboard", label: "Leaderboard", icon: "crown" },
  { href: "/hub/board/fanart", label: "Fan Art", icon: "palette" },
  { href: "/hub/quests", label: "Daily quests", icon: "bolt" },
  { href: "/hub/inbox", label: "Inbox", icon: "inbox" },
];

const SIDEBAR_OWNER = [
  { href: "/hub/admin", label: "Admin console", icon: "shield" },
  { href: "/hub/owner", label: "Owner Center", icon: "bolt" },
  { href: "/hub/settings", label: "Settings", icon: "settings" },
];

export function HubShell({ children, rightRail }: { children: React.ReactNode; rightRail?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [boards, setBoards] = useState<{ slug: string; name: string }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/boards").then((r) => r.json()).then((d) => setBoards(d.boards || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-20" data-testid="hub-shell">
      <ParticleBurstHost />
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--bg-border)] bg-black/85 backdrop-blur">
        <div className="flex items-center gap-4 px-4 lg:px-5 h-14">
          <Link href="/hub" className="flex items-center gap-2" data-testid="hub-logo-link">
            <span className="font-black text-white" style={{ fontFamily: "var(--font-syne)", fontSize: "1.05rem" }}>peng</span>
            <span className="text-white/40 font-mono text-sm" style={{ fontFamily: "var(--font-mono)" }}>hub</span>
            <span className="text-[10px] text-[var(--accent)] opacity-70" style={{ fontFamily: "var(--font-mono)" }}>v2</span>
          </Link>

          <div className="flex-1 max-w-xl relative">
            <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              data-testid="hub-search-input"
              type="text"
              placeholder="search creators, posts, boards…"
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-full pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[var(--accent)] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          {/* Floating currency stats — clickable, opens animated panel */}
          {user && (
            <div className="hidden md:flex items-center gap-2" data-testid="topbar-stats">
              <FloatingStat kind="shards" />
              {user.gemsUnlocked && <FloatingStat kind="gems" />}
              <FloatingStat kind="xp" />
            </div>
          )}

          <Link href="/" className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--bg-border)] text-[10px] uppercase tracking-wider text-white/60 hover:border-[var(--accent)] hover:text-white transition-colors" data-testid="goto-landing-link" style={{ fontFamily: "var(--font-mono)" }}>
            + Landing
          </Link>

          <Link href="/hub/quests" className="text-white/40 hover:text-white transition-colors" data-testid="goto-notifications-link"><Icon name="bell" className="w-4 h-4" /></Link>

          <Link href="/hub/post/new" className="text-white/40 hover:text-white transition-colors" data-testid="create-post-link"><Icon name="plus" className="w-4 h-4" /></Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen((m) => !m)} className="flex items-center gap-2 hover:opacity-90" data-testid="user-menu-button">
                <div
                  className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs"
                  style={{ background: `linear-gradient(135deg, ${user.accentColor}, ${user.accentColor}88)` }}
                >
                  {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : "🐧"}
                </div>
                <span className="text-xs text-white" style={{ fontFamily: "var(--font-mono)" }}>{user.username}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg shadow-2xl py-1 z-50" data-testid="user-dropdown-menu">
                  <Link href={`/hub/user/${user.username}`} className="block px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white">view profile</Link>
                  <Link href={`/@${user.username}`} className="block px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white">my space</Link>
                  <Link href="/hub/showcase" className="block px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white">edit showcase</Link>
                  <Link href="/hub/settings" className="block px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white">settings</Link>
                  <button onClick={signOut} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5" data-testid="sign-out-button">sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/signin" className="text-xs text-white/60 hover:text-white px-2" data-testid="signin-link" style={{ fontFamily: "var(--font-mono)" }}>SIGN IN</Link>
          )}

          {user && (
            <button onClick={signOut} className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white" data-testid="sign-out-topbar-button" style={{ fontFamily: "var(--font-mono)" }}>SIGN OUT</button>
          )}
        </div>
      </header>

      {/* HARD-LEFT grid: full width, sidebar pinned to viewport edge */}
      <div className="hub-grid">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block sticky top-16 self-start" data-testid="hub-sidebar">
          <SidebarSection label="FEED" items={SIDEBAR_FEED} pathname={pathname} />
          <div className="mt-6" />
          <SidebarSection label="COMMUNITY" items={SIDEBAR_COMMUNITY} pathname={pathname} />
          {user?.role === "ADMIN" && <><div className="mt-6" /><SidebarSection label="OWNER" items={SIDEBAR_OWNER} pathname={pathname} /></>}
          <div className="mt-6" />
          <p className="text-[10px] tracking-widest text-white/30 mb-3 px-3" style={{ fontFamily: "var(--font-mono)" }}>POPULAR BOARDS</p>
          <ul className="space-y-1">
            {boards.slice(0, 6).map((b) => (
              <li key={b.slug}>
                <Link href={`/hub/board/${b.slug}`} className="block px-3 py-1 text-xs text-white/50 hover:text-white transition-colors" data-testid={`board-link-${b.slug}`} style={{ fontFamily: "var(--font-mono)" }}>
                  {b.name}
                </Link>
              </li>
            ))}
            <li><Link href="/hub/all-boards" className="block px-3 py-1 text-xs text-white/30 hover:text-white" data-testid="see-all-boards-link" style={{ fontFamily: "var(--font-mono)" }}>see all →</Link></li>
          </ul>
        </aside>

        {/* MAIN — left-aligned, no center max-width */}
        <main className="min-w-0 max-w-[820px]">{children}</main>

        {/* RIGHT RAIL */}
        <aside className="hidden lg:block">
          {rightRail}
        </aside>
      </div>
    </div>
  );
}

function SidebarSection({ label, items, pathname }: { label: string; items: typeof SIDEBAR_FEED; pathname: string | null }) {
  return (
    <>
      <p className="text-[10px] tracking-widest text-white/30 mb-3 px-3" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.href.split("?")[0];
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-all ${
                  active
                    ? "bg-white/5 text-white border-l-2 border-[var(--accent)]"
                    : "text-white/55 hover:text-white hover:bg-white/[0.03] hover:translate-x-0.5"
                }`}
                data-testid={`sidebar-${it.label.toLowerCase().replace(/\s+/g, "-")}-link`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Icon name={it.icon} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
