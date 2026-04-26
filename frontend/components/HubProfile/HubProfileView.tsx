"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckInButton } from "@/components/Economy/CheckInButton";
import { BlockRenderer, type Block } from "@/components/BlockRenderer/BlockRenderer";

interface Achievement {
  achievement: { slug: string; name: string; iconEmoji: string; description: string };
  earnedAt: Date;
}

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  image: string | null;
  bio: string | null;
  bannerUrl: string | null;
  accentColor: string;
  shards: number;
  gems: number;
  xp: number;
  level: number;
  streakCount: number;
  longestStreak: number;
  role: string;
  hubProfile: {
    portalEnabled: boolean;
    portalLabel: string;
    tiktokUrl: string | null;
    twitchUrl: string | null;
    youtubeUrl: string | null;
    kickUrl: string | null;
    discordUser: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    showStats: boolean;
    showStreak: boolean;
    showcase: Block[];
    interests: string[];
  } | null;
  achievements: Achievement[];
  posts: any[];
  counts: { posts: number; followers: number; follows: number };
}

const TABS = ["POSTS", "COMMENTS", "ABOUT", "SHOWCASE"] as const;
type Tab = (typeof TABS)[number];

export function HubProfileView({ profile, isOwn }: { profile: ProfileData; isOwn: boolean }) {
  const [tab, setTab] = useState<Tab>("POSTS");
  const hp = profile.hubProfile;
  const accent = profile.accentColor || "#8a2be2";

  return (
    <div data-testid="hub-profile-view">
      {/* Banner */}
      <div
        className="h-40 -mx-4 lg:-mx-0 mb-0 relative rounded-lg overflow-hidden"
        style={{
          background: profile.bannerUrl
            ? `url(${profile.bannerUrl}) center/cover`
            : `linear-gradient(135deg, ${accent}33 0%, ${accent}11 50%, transparent 100%)`,
          borderBottom: `1px solid ${accent}33`,
        }}
        data-testid="profile-banner"
      />

      {/* Header */}
      <div className="flex items-start gap-4 -mt-12 px-2 mb-6">
        <div
          className="w-24 h-24 rounded-full border-4 overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{
            borderColor: accent,
            background: `linear-gradient(135deg, ${accent}55, ${accent}22)`,
            boxShadow: `0 0 30px ${accent}66`,
          }}
          data-testid="profile-avatar"
        >
          {profile.image ? (
            <img src={profile.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🐧</span>
          )}
        </div>

        <div className="flex-1 pt-12 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-syne)" }} data-testid="profile-displayname">{profile.displayName}</h1>
            {profile.role !== "USER" && (
              <span className="text-[10px] tracking-wider px-2 py-0.5 rounded border border-[var(--accent)] text-[var(--accent)]" data-testid="profile-role-badge">
                {profile.role}
              </span>
            )}
            <span className="text-[10px] tracking-wider px-2 py-0.5 rounded border border-[var(--bg-border)] text-white/50">FAN</span>
          </div>
          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>
            @{profile.username} · {profile.role.toLowerCase()}
          </p>
          {profile.bio && <p className="text-sm text-white/70 mt-2" data-testid="profile-bio">{profile.bio}</p>}
          <div className="flex items-baseline gap-3 mt-3 text-xs text-white/50" style={{ fontFamily: "var(--font-mono)" }}>
            <span><b className="text-white">{profile.counts.followers}</b> followers</span>
            <span><b className="text-white">{profile.counts.follows}</b> following</span>
            <span><b className="text-white">{profile.counts.posts}</b> posts</span>
            <span className="text-[var(--xp-color)]">{profile.xp} xp · lvl {profile.level}</span>
          </div>
        </div>

        {isOwn ? (
          <Link href="/hub/showcase" className="peng-btn peng-btn-ghost text-xs" data-testid="edit-profile-button">
            EDIT PROFILE
          </Link>
        ) : (
          <button className="peng-btn peng-btn-primary text-xs" data-testid="follow-button">+ FOLLOW</button>
        )}
      </div>

      {/* Portal — link to Personal Space */}
      {hp?.portalEnabled && (
        <Link
          href={`/@${profile.username}`}
          className="block w-full text-center peng-btn peng-btn-primary mb-6 py-4"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
            borderColor: accent,
            fontFamily: "var(--font-press-start)",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            boxShadow: `0 0 30px ${accent}55`,
          }}
          data-testid="portal-to-space-button"
        >
          {hp.portalLabel}
        </Link>
      )}

      {/* Tabs + 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
        <div>
          <div className="flex gap-1 border-b border-[var(--bg-border)] mb-4" data-testid="profile-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-[10px] tracking-widest transition-colors ${
                  tab === t ? "text-white border-b-2 border-[var(--accent)]" : "text-white/40 hover:text-white"
                }`}
                data-testid={`profile-tab-${t.toLowerCase()}`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "POSTS" && (
            <div className="space-y-3" data-testid="profile-posts">
              {profile.posts.length === 0 ? (
                <p className="text-xs text-white/30 italic py-8 text-center">no posts yet</p>
              ) : (
                profile.posts.map((p: any) => (
                  <Link key={p.id} href={`/hub/post/${p.id}`} className="block peng-card hover:border-[var(--accent)]/40">
                    <div className="text-xs mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                      <span className="text-white/60">b/{p.board.slug}</span>
                      <span className="text-white/20 mx-2">·</span>
                      <span className="text-white/40">{new Date(p.createdAt).toLocaleDateString()}</span>
                      {p.flair && <span className="ml-2 text-[10px] px-2 py-0.5 border border-[var(--bg-border)] rounded">{p.flair}</span>}
                    </div>
                    <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>{p.title}</h3>
                    <p className="text-sm text-white/60 line-clamp-2 mt-1">{p.body}</p>
                  </Link>
                ))
              )}
            </div>
          )}

          {tab === "COMMENTS" && (
            <p className="text-xs text-white/30 italic py-8 text-center" data-testid="profile-comments-empty" style={{ fontFamily: "var(--font-mono)" }}>// recent comments coming soon</p>
          )}

          {tab === "ABOUT" && (
            <div className="space-y-3" data-testid="profile-about">
              <div className="peng-card">
                <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>BIO</p>
                <p className="text-sm text-white/80">{profile.bio ?? "no bio yet"}</p>
              </div>
              {hp && (
                <div className="peng-card">
                  <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>SOCIALS</p>
                  <div className="flex flex-wrap gap-2">
                    {hp.tiktokUrl && <a href={hp.tiktokUrl} target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-xs">TikTok ↗</a>}
                    {hp.twitchUrl && <a href={hp.twitchUrl} target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-xs">Twitch ↗</a>}
                    {hp.youtubeUrl && <a href={hp.youtubeUrl} target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-xs">YouTube ↗</a>}
                    {hp.kickUrl && <a href={hp.kickUrl} target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-xs">Kick ↗</a>}
                    {hp.twitterUrl && <a href={hp.twitterUrl} target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-xs">X ↗</a>}
                    {hp.instagramUrl && <a href={hp.instagramUrl} target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-xs">Instagram ↗</a>}
                    {hp.discordUser && <span className="peng-btn peng-btn-ghost text-xs opacity-60">discord: {hp.discordUser}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "SHOWCASE" && (
            <div className="space-y-3" data-testid="profile-showcase">
              {(hp?.showcase ?? []).length === 0 ? (
                <div className="peng-card text-center py-12">
                  <p className="text-xs text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>// nothing showcased yet</p>
                  {isOwn && (
                    <Link href="/hub/showcase" className="peng-btn peng-btn-primary text-xs mt-2 inline-block" data-testid="add-showcase-link">
                      Customize Showcase
                    </Link>
                  )}
                </div>
              ) : (
                <BlockRenderer blocks={hp!.showcase} isOwner={isOwn} gemsUnlocked={true} />
              )}
            </div>
          )}
        </div>

        {/* Right side cards */}
        <div className="space-y-3">
          {hp?.showStats && (
            <div className="peng-card">
              <p className="text-[10px] tracking-widest text-white/40 mb-3" style={{ fontFamily: "var(--font-mono)" }}>STATS</p>
              <Stat label="◈ SHARDS" value={profile.shards} color="var(--shard-color)" />
              <Stat label="◆ GEMS" value={profile.gems} color="var(--gem-color)" />
              <Stat label="★ XP" value={profile.xp} color="var(--xp-color)" />
              <Stat label="⬡ LVL" value={profile.level} color={accent} />
            </div>
          )}

          {hp?.showStreak && (
            <div className="peng-card">
              <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>STREAK</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-orange-400" data-testid="profile-streak">{profile.streakCount}</span>
                {isOwn && <CheckInButton />}
              </div>
              <p className="text-[10px] text-white/30 mt-1" style={{ fontFamily: "var(--font-mono)" }}>best: {profile.longestStreak}</p>
            </div>
          )}

          <div className="peng-card">
            <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>BADGES</p>
            <div className="flex flex-wrap gap-1">
              {profile.achievements.length === 0 && <p className="text-xs text-white/30 italic">none yet</p>}
              {profile.achievements.map((ua) => (
                <span
                  key={ua.achievement.slug}
                  className="text-[10px] px-2 py-1 border border-[var(--bg-border)] rounded text-white/70"
                  title={ua.achievement.description}
                  data-testid={`badge-${ua.achievement.slug}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {ua.achievement.iconEmoji} {ua.achievement.name}
                </span>
              ))}
            </div>
          </div>

          <div className="peng-card">
            <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>INTERESTS</p>
            {(hp?.interests ?? []).length === 0 ? (
              <p className="text-xs text-white/30 italic">none yet</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {hp!.interests.map((i, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-1 border border-[var(--bg-border)] rounded text-white/70" style={{ fontFamily: "var(--font-mono)" }}>{i}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
      <span className="text-white/50" style={{ color }}>{label}</span>
      <span className="text-white font-bold">{value.toLocaleString()}</span>
    </div>
  );
}
