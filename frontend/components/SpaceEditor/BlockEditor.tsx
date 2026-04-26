"use client";
import { useState, useRef } from "react";
import type { Block } from "@/components/BlockRenderer/BlockRenderer";

const BLOCK_OPTIONS: Array<{ type: string; label: string; gems?: boolean }> = [
  { type: "TEXT", label: "Text" },
  { type: "IMAGE", label: "Image" },
  { type: "VIDEO_EMBED", label: "Video Embed" },
  { type: "MUSIC_PLAYER", label: "Music Player (URL)" },
  { type: "MP3_UPLOAD", label: "MP3 Upload", gems: true },
  { type: "SOCIAL_LINKS", label: "Social Links" },
  { type: "PORTAL", label: "Portal Button" },
  { type: "STATS_CARD", label: "Stats Card" },
  { type: "COUNTDOWN", label: "Countdown" },
  { type: "SPOTIFY_EMBED", label: "Spotify Embed" },
  { type: "TIKTOK_FEED", label: "TikTok Link" },
  { type: "GUESTBOOK", label: "Guestbook" },
  { type: "CUSTOM_HTML", label: "Custom HTML", gems: true },
];

function newBlock(type: string): Block {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults: Record<string, any> = {
    TEXT: { heading: "Heading", body: "your text here" },
    IMAGE: { url: "", alt: "" },
    VIDEO_EMBED: { embedUrl: "", title: "" },
    MUSIC_PLAYER: { title: "Track", artist: "", audioUrl: "" },
    MP3_UPLOAD: { title: "Audio", artist: "", url: "" },
    SOCIAL_LINKS: { links: [{ label: "TikTok ↗", url: "https://tiktok.com/@" }] },
    PORTAL: { label: "ENTER", href: "/" },
    STATS_CARD: { stats: [{ label: "FANS", value: "0" }, { label: "STREAMS", value: "0" }, { label: "DAYS", value: "0" }] },
    COUNTDOWN: { label: "Until next stream", targetDate: new Date(Date.now() + 86400000).toISOString() },
    SPOTIFY_EMBED: { embedUrl: "https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC", height: 152 },
    TIKTOK_FEED: { username: "peng" },
    GUESTBOOK: { title: "Guestbook" },
    CUSTOM_HTML: { html: "<div style='color:white'>your html</div>", height: 200 },
  };
  return { id, type: type as any, order: 0, config: defaults[type] ?? {} };
}

export function BlockEditor({
  blocks,
  onChange,
  gemsUnlocked = false,
}: {
  blocks: Block[];
  onChange: (b: Block[]) => void;
  gemsUnlocked?: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function addBlock(type: string) {
    const b = newBlock(type);
    b.order = blocks.length;
    onChange([...blocks, b]);
    setAdding(false);
    setEditing(b.id);
  }

  function updateBlock(id: string, config: any) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, config } : b)));
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const arr = [...blocks];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    onChange(arr.map((b, i) => ({ ...b, order: i })));
  }

  return (
    <div className="space-y-3" data-testid="block-editor">
      {blocks.map((b) => (
        <div key={b.id} className="peng-card border border-[var(--bg-border)]" data-testid={`block-${b.id}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] tracking-wider text-[var(--accent)]" style={{ fontFamily: "var(--font-mono)" }}>
              {b.type}
            </span>
            <div className="flex gap-1">
              <button onClick={() => move(b.id, -1)} className="text-white/40 hover:text-white text-xs" data-testid={`block-up-${b.id}`}>↑</button>
              <button onClick={() => move(b.id, 1)} className="text-white/40 hover:text-white text-xs" data-testid={`block-down-${b.id}`}>↓</button>
              <button onClick={() => setEditing(editing === b.id ? null : b.id)} className="text-white/40 hover:text-white text-xs px-2" data-testid={`block-edit-${b.id}`}>{editing === b.id ? "done" : "edit"}</button>
              <button onClick={() => removeBlock(b.id)} className="text-red-400/60 hover:text-red-300 text-xs px-2" data-testid={`block-remove-${b.id}`}>✕</button>
            </div>
          </div>
          {editing === b.id && <BlockConfig block={b} onChange={(cfg) => updateBlock(b.id, cfg)} />}
        </div>
      ))}

      {adding ? (
        <div className="peng-card">
          <p className="text-[10px] tracking-wider text-white/40 mb-3" style={{ fontFamily: "var(--font-mono)" }}>SELECT BLOCK TYPE</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {BLOCK_OPTIONS.map((o) => {
              const locked = o.gems && !gemsUnlocked;
              return (
                <button
                  key={o.type}
                  onClick={() => !locked && addBlock(o.type)}
                  disabled={locked}
                  data-testid={`add-block-type-${o.type}`}
                  className={`peng-btn text-xs ${locked ? "opacity-30 cursor-not-allowed peng-btn-ghost" : "peng-btn-ghost hover:border-[var(--accent)]"}`}
                >
                  {o.label} {locked && <span className="text-[var(--gem-color)]">◆</span>}
                </button>
              );
            })}
          </div>
          <button onClick={() => setAdding(false)} className="text-xs text-white/40 hover:text-white mt-3" data-testid="cancel-add-block">cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full peng-btn peng-btn-ghost border-dashed py-3 text-xs"
          data-testid="add-block-button"
        >
          + Add Block
        </button>
      )}
    </div>
  );
}

function BlockConfig({ block, onChange }: { block: Block; onChange: (cfg: any) => void }) {
  const cfg = block.config;
  const set = (k: string, v: any) => onChange({ ...cfg, [k]: v });

  const inputCls = "w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent)]";

  switch (block.type as any) {
    case "TEXT":
      return (
        <div className="space-y-2">
          <input className={inputCls} placeholder="heading" value={cfg.heading ?? ""} onChange={(e) => set("heading", e.target.value)} data-testid="text-heading-input" />
          <textarea className={inputCls} placeholder="body" rows={4} value={cfg.body ?? ""} onChange={(e) => set("body", e.target.value)} data-testid="text-body-input" />
        </div>
      );
    case "IMAGE":
      return (
        <div className="space-y-2">
          <input className={inputCls} placeholder="image URL" value={cfg.url ?? ""} onChange={(e) => set("url", e.target.value)} data-testid="image-url-input" />
          <input className={inputCls} placeholder="alt text" value={cfg.alt ?? ""} onChange={(e) => set("alt", e.target.value)} />
        </div>
      );
    case "VIDEO_EMBED":
      return (
        <input className={inputCls} placeholder="embed URL (YouTube, Vimeo)" value={cfg.embedUrl ?? ""} onChange={(e) => set("embedUrl", e.target.value)} data-testid="video-embed-input" />
      );
    case "MUSIC_PLAYER":
      return (
        <div className="space-y-2">
          <input className={inputCls} placeholder="title" value={cfg.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          <input className={inputCls} placeholder="artist" value={cfg.artist ?? ""} onChange={(e) => set("artist", e.target.value)} />
          <input className={inputCls} placeholder="audio URL (mp3 link)" value={cfg.audioUrl ?? ""} onChange={(e) => set("audioUrl", e.target.value)} />
        </div>
      );
    case "MP3_UPLOAD":
      return <Mp3UploadConfig cfg={cfg} set={set} />;
    case "SOCIAL_LINKS":
      return (
        <div className="space-y-2">
          {(cfg.links ?? []).map((l: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} placeholder="label" value={l.label} onChange={(e) => {
                const links = [...(cfg.links ?? [])];
                links[i] = { ...links[i], label: e.target.value };
                set("links", links);
              }} />
              <input className={inputCls} placeholder="url" value={l.url} onChange={(e) => {
                const links = [...(cfg.links ?? [])];
                links[i] = { ...links[i], url: e.target.value };
                set("links", links);
              }} />
              <button onClick={() => set("links", (cfg.links ?? []).filter((_: any, j: number) => j !== i))} className="text-red-400 px-2">×</button>
            </div>
          ))}
          <button onClick={() => set("links", [...(cfg.links ?? []), { label: "", url: "" }])} className="peng-btn peng-btn-ghost text-xs">+ Add link</button>
        </div>
      );
    case "PORTAL":
      return (
        <div className="space-y-2">
          <input className={inputCls} placeholder="label" value={cfg.label ?? ""} onChange={(e) => set("label", e.target.value)} />
          <input className={inputCls} placeholder="href" value={cfg.href ?? ""} onChange={(e) => set("href", e.target.value)} />
        </div>
      );
    case "STATS_CARD":
      return (
        <div className="space-y-2">
          {(cfg.stats ?? []).map((s: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} placeholder="label" value={s.label} onChange={(e) => {
                const arr = [...(cfg.stats ?? [])];
                arr[i] = { ...arr[i], label: e.target.value };
                set("stats", arr);
              }} />
              <input className={inputCls} placeholder="value" value={s.value} onChange={(e) => {
                const arr = [...(cfg.stats ?? [])];
                arr[i] = { ...arr[i], value: e.target.value };
                set("stats", arr);
              }} />
            </div>
          ))}
          <button onClick={() => set("stats", [...(cfg.stats ?? []), { label: "", value: "" }])} className="peng-btn peng-btn-ghost text-xs">+ Add stat</button>
        </div>
      );
    case "COUNTDOWN":
      return (
        <div className="space-y-2">
          <input className={inputCls} placeholder="label" value={cfg.label ?? ""} onChange={(e) => set("label", e.target.value)} />
          <input className={inputCls} type="datetime-local" value={cfg.targetDate ? cfg.targetDate.slice(0, 16) : ""} onChange={(e) => set("targetDate", new Date(e.target.value).toISOString())} />
        </div>
      );
    case "SPOTIFY_EMBED":
      return <input className={inputCls} placeholder="Spotify embed URL (open.spotify.com/embed/...)" value={cfg.embedUrl ?? ""} onChange={(e) => set("embedUrl", e.target.value)} />;
    case "TIKTOK_FEED":
      return <input className={inputCls} placeholder="TikTok username (without @)" value={cfg.username ?? ""} onChange={(e) => set("username", e.target.value)} />;
    case "CUSTOM_HTML":
      return <textarea className={inputCls} rows={6} placeholder="<your html>" value={cfg.html ?? ""} onChange={(e) => set("html", e.target.value)} />;
    case "GUESTBOOK":
      return <input className={inputCls} placeholder="title" value={cfg.title ?? ""} onChange={(e) => set("title", e.target.value)} />;
    default:
      return null;
  }
}

function Mp3UploadConfig({ cfg, set }: { cfg: any; set: (k: string, v: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputCls = "w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent)]";

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", cfg.title ?? file.name);
      if (cfg.artist) fd.append("artist", cfg.artist);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) { setError(typeof d.error === "string" ? d.error : "Upload failed"); return; }
      set("url", d.upload.url);
      set("title", d.upload.title);
      set("artist", d.upload.artist);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input className={inputCls} placeholder="title" value={cfg.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      <input className={inputCls} placeholder="artist" value={cfg.artist ?? ""} onChange={(e) => set("artist", e.target.value)} />
      <input ref={fileRef} type="file" accept="audio/*" onChange={upload} className="hidden" data-testid="mp3-file-input" />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="peng-btn peng-btn-ghost text-xs w-full disabled:opacity-50"
        data-testid="mp3-upload-button"
      >
        {uploading ? "uploading…" : cfg.url ? "Replace MP3" : "Upload MP3"}
      </button>
      {cfg.url && (
        <div className="space-y-1">
          <audio controls src={cfg.url} className="w-full" style={{ height: 36 }} />
          <p className="text-[10px] text-white/30 truncate" style={{ fontFamily: "var(--font-mono)" }}>{cfg.url}</p>
        </div>
      )}
      {error && <p className="text-xs text-red-400" data-testid="upload-error">{error}</p>}
    </div>
  );
}
