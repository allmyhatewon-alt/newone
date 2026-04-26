"use client";
import Link from "next/link";
import Image from "next/image";
import { CheckInButton } from "@/components/Economy/CheckInButton";

interface Achievement {
  achievement: { slug: string; name: string; iconEmoji: string; description: string };
  earnedAt: Date;
}

interface HubProfile {
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
  activeSkinId: string | null;
  activeAuraId: string | null;
}

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  image: string | null;
  bio: string | null;
  accentColor: string;
  shards: number;
  gems: number;
  xp: number;
  level: number;
  streakCount: number;
  longestStreak: number;
  createdAt: Date;
  hubProfile: HubProfile | null;
  achievements: Achievement[];
  _count: { inventory: number };
}

export function HubProfileView({
  profile,
  isOwn,
}: {
  profile: ProfileData;
  isOwn: boolean;
}) {
  const hp = profile.hubProfile;
  const accent = profile.accentColor || "#8a2be2";

  return (
    <div
      className="min-h-screen pb-20"
      style={
        {
          "--user-accent": accent,
          "--user-accent-glow": `${accent}33`,
        } as React.CSSProperties
      }
    >
      {/* Aura header banner */}
      <div
        className="h-32 w-full relative"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, transparent 60%)`,
          borderBottom: `1px solid ${accent}22`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 -mt-16">
        {/* Avatar + name */}
        <div className="flex items-end gap-4 mb-6">
          <div
            className="w-24 h-24 rounded-full border-4 overflow-hidden flex-shrink-0"
            style={{
              borderColor: accent,
              boxShadow: `0 0 30px ${accent}44`,
            }}
          >
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.displayName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl"
                style={{ background: `${accent}22` }}
              >
                🐧
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {profile.displayName}
            </h1>
            <p
              className="text-xs opacity-50"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              @{profile.username}
            </p>
          </div>

          {isOwn && (
            <Link href="/hub/settings" className="peng-btn peng-btn-ghost text-xs">
              Edit Profile
            </Link>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm mb-6 opacity-70 leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats grid */}
        {hp?.showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="SHARDS" value={profile.shards} color="var(--shard-color)" icon="◈" />
            <StatCard label="GEMS" value={profile.gems} color="var(--gem-color)" icon="◆" />
            <StatCard label="XP" value={profile.xp} color="var(--xp-color)" icon="★" />
            <StatCard label={`LVL ${profile.level}`} value={profile.xp % 100} color={accent} icon="⬡" isBar />
          </div>
        )}

        {/* Streak */}
        {hp?.showStreak && (
          <div className="peng-card mb-6 flex items-center justify-between">
            <div>
              <p
                className="text-xs opacity-50 mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                DAILY STREAK
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-orange-400">
                  {profile.streakCount}
                </span>
                <span className="text-xs opacity-50">days</span>
                <span className="text-xs opacity-30 ml-2">
                  best: {profile.longestStreak}
                </span>
              </div>
            </div>
            {isOwn && <CheckInButton />}
          </div>
        )}

        {/* Portal — link to Space */}
        {hp?.portalEnabled && (
          <Link
            href={`/@${profile.username}`}
            className="block w-full text-center peng-btn peng-btn-primary mb-6 py-4"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
              borderColor: accent,
              fontFamily: "var(--font-press-start)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              boxShadow: `0 0 30px ${accent}44`,
            }}
          >
            {hp.portalLabel}
          </Link>
        )}

        {/* Social links */}
        {hp && (
          <div className="flex flex-wrap gap-2 mb-6">
            {hp.tiktokUrl && <SocialPill href={hp.tiktokUrl} label="TikTok" />}
            {hp.twitchUrl && <SocialPill href={hp.twitchUrl} label="Twitch" />}
            {hp.youtubeUrl && <SocialPill href={hp.youtubeUrl} label="YouTube" />}
            {hp.kickUrl && <SocialPill href={hp.kickUrl} label="Kick" />}
            {hp.twitterUrl && <SocialPill href={hp.twitterUrl} label="Twitter/X" />}
            {hp.instagramUrl && <SocialPill href={hp.instagramUrl} label="Instagram" />}
            {hp.discordUser && (
              <span className="peng-btn peng-btn-ghost text-xs opacity-60">
                Discord: {hp.discordUser}
              </span>
            )}
          </div>
        )}

        {/* Achievements */}
        {profile.achievements.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xs uppercase tracking-widest opacity-50 mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Achievements
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.achievements.map((ua) => (
                <div
                  key={ua.achievement.slug}
                  className="peng-card px-3 py-2 flex items-center gap-2 text-xs"
                  title={ua.achievement.description}
                >
                  <span>{ua.achievement.iconEmoji}</span>
                  <span className="opacity-70">{ua.achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
  isBar,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
  isBar?: boolean;
}) {
  return (
    <div className="peng-card flex flex-col gap-1">
      <span
        className="text-xs opacity-50"
        style={{ fontFamily: "var(--font-mono)", color }}
      >
        {icon} {label}
      </span>
      {isBar ? (
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(value, 100)}%`, background: color }}
          />
        </div>
      ) : (
        <span
          className="text-xl font-black"
          style={{ color, fontFamily: "var(--font-mono)" }}
        >
          {value.toLocaleString()}
        </span>
      )}
    </div>
  );
}

function SocialPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="peng-btn peng-btn-ghost text-xs"
    >
      {label} ↗
    </a>
  );
}
