"use client";

export interface Block {
  id: string;
  type: string; // TEXT | IMAGE | VIDEO_EMBED | MUSIC_PLAYER | SOCIAL_LINKS | PORTAL | CUSTOM_HTML | STATS_CARD | GUESTBOOK | COUNTDOWN | SPOTIFY_EMBED | TIKTOK_FEED | MP3_UPLOAD
  order: number;
  config: Record<string, any>;
  gemsRequired?: boolean;
}

interface Props { blocks: Block[]; isOwner?: boolean; gemsUnlocked?: boolean }

export function BlockRenderer({ blocks, isOwner, gemsUnlocked }: Props) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  return (
    <div className="flex flex-col gap-4 w-full" data-testid="block-renderer">
      {sorted.map((block) => {
        if (block.gemsRequired && !gemsUnlocked) {
          return (
            <div key={block.id} className="peng-card opacity-40 text-center text-xs" data-testid={`gem-locked-${block.id}`} style={{ fontFamily: "var(--font-mono)" }}>
              ◆ gems required to view this block
            </div>
          );
        }
        return <BlockItem key={block.id} block={block} />;
      })}
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case "TEXT": return <TextBlock config={block.config} />;
    case "IMAGE": return <ImageBlock config={block.config} />;
    case "VIDEO_EMBED": return <VideoBlock config={block.config} />;
    case "MUSIC_PLAYER": return <MusicPlayerBlock config={block.config} />;
    case "SOCIAL_LINKS": return <SocialLinksBlock config={block.config} />;
    case "PORTAL": return <PortalBlock config={block.config} />;
    case "STATS_CARD": return <StatsCardBlock config={block.config} />;
    case "COUNTDOWN": return <CountdownBlock config={block.config} />;
    case "SPOTIFY_EMBED": return <SpotifyBlock config={block.config} />;
    case "TIKTOK_FEED": return <TikTokBlock config={block.config} />;
    case "MP3_UPLOAD": return <MP3Block config={block.config} />;
    case "CUSTOM_HTML": return <CustomHtmlBlock config={block.config} />;
    case "GUESTBOOK": return <GuestbookBlock config={block.config} />;
    default: return null;
  }
}

function TextBlock({ config }: { config: any }) {
  return (
    <div className="peng-card">
      {config.heading && <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-syne)" }}>{config.heading}</h2>}
      {config.body && <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{config.body}</p>}
    </div>
  );
}
function ImageBlock({ config }: { config: any }) {
  if (!config.url) return null;
  return (
    <div className="peng-card !p-0 overflow-hidden">
      <img src={config.url} alt={config.alt ?? ""} className="w-full object-cover" style={{ maxHeight: config.maxHeight ?? "400px" }} />
      {config.caption && <p className="text-xs text-white/40 px-4 py-2" style={{ fontFamily: "var(--font-mono)" }}>{config.caption}</p>}
    </div>
  );
}
function VideoBlock({ config }: { config: any }) {
  if (!config.embedUrl) return null;
  return <div className="peng-card !p-0 overflow-hidden aspect-video"><iframe src={config.embedUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen /></div>;
}
function MusicPlayerBlock({ config }: { config: any }) {
  return (
    <div className="peng-card flex items-center gap-4">
      <span className="text-2xl">♪</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{config.title ?? "Track"}</p>
        {config.artist && <p className="text-xs text-white/40 truncate">{config.artist}</p>}
      </div>
      {config.audioUrl && <audio controls src={config.audioUrl} className="w-48" style={{ height: "32px" }} />}
    </div>
  );
}
function SocialLinksBlock({ config }: { config: any }) {
  const links = config.links ?? [];
  if (!links.length) return null;
  return (
    <div className="peng-card">
      <div className="flex flex-wrap gap-2">
        {links.map((l: any, i: number) => (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="peng-btn peng-btn-ghost text-xs">{l.label} ↗</a>
        ))}
      </div>
    </div>
  );
}
function PortalBlock({ config }: { config: any }) {
  return (
    <a href={config.href ?? "#"} className="block peng-btn peng-btn-primary text-center py-5 text-sm w-full"
       style={{ fontFamily: "var(--font-press-start)", fontSize: "0.65rem", letterSpacing: "0.15em", boxShadow: "0 0 30px var(--accent-glow)" }}>
      {config.label ?? "Enter"}
    </a>
  );
}
function StatsCardBlock({ config }: { config: any }) {
  return (
    <div className="peng-card grid grid-cols-3 gap-4 text-center">
      {(config.stats ?? []).map((s: any, i: number) => (
        <div key={i}>
          <p className="text-xl font-black text-white" style={{ fontFamily: "var(--font-mono)" }}>{s.value}</p>
          <p className="text-xs text-white/40 uppercase tracking-wider mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
function CountdownBlock({ config }: { config: any }) {
  const target = config.targetDate ? new Date(config.targetDate) : null;
  const now = new Date();
  const diff = target ? Math.max(0, target.getTime() - now.getTime()) : 0;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return (
    <div className="peng-card text-center">
      {config.label && <p className="text-xs uppercase tracking-widest text-white/50 mb-3" style={{ fontFamily: "var(--font-mono)" }}>{config.label}</p>}
      <div className="flex justify-center gap-4">
        {[{ v: days, u: "days" }, { v: hours, u: "hrs" }, { v: mins, u: "min" }].map((x) => (
          <div key={x.u} className="flex flex-col items-center">
            <span className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-mono)" }}>{String(x.v).padStart(2, "0")}</span>
            <span className="text-xs text-white/40 uppercase mt-1">{x.u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function SpotifyBlock({ config }: { config: any }) {
  if (!config.embedUrl) return null;
  return (
    <div className="peng-card !p-0 overflow-hidden">
      <iframe src={config.embedUrl} width="100%" height={config.height ?? 152} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ border: "none" }} />
    </div>
  );
}
function TikTokBlock({ config }: { config: any }) {
  return (
    <div className="peng-card text-center">
      <a href={`https://tiktok.com/@${config.username ?? ""}`} target="_blank" rel="noopener noreferrer" className="peng-btn peng-btn-ghost">
        @{config.username ?? "username"} on TikTok ↗
      </a>
    </div>
  );
}
function MP3Block({ config }: { config: any }) {
  return (
    <div className="peng-card">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">🎧</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{config.title ?? "Audio"}</p>
          {config.artist && <p className="text-xs text-white/40 truncate">{config.artist}</p>}
        </div>
      </div>
      {config.url && <audio controls src={config.url} className="w-full" style={{ height: "40px" }} />}
    </div>
  );
}
function CustomHtmlBlock({ config }: { config: any }) {
  return (
    <div className="peng-card !p-0 overflow-hidden">
      <iframe srcDoc={config.html ?? ""} sandbox="allow-scripts allow-same-origin" className="w-full border-0" style={{ height: config.height ?? "200px", background: "transparent" }} />
    </div>
  );
}
function GuestbookBlock({ config }: { config: any }) {
  return (
    <div className="peng-card">
      <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>{config.title ?? "Guestbook"}</h3>
      <p className="text-xs text-white/40 italic" style={{ fontFamily: "var(--font-mono)" }}>// guestbook coming soon</p>
    </div>
  );
}
