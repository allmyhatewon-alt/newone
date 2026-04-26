"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { useAuth } from "@/app/providers";
import { BlockEditor } from "@/components/SpaceEditor/BlockEditor";
import { BlockRenderer, type Block } from "@/components/BlockRenderer/BlockRenderer";

export default function SpaceEditPage() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [published, setPublished] = useState(true);
  const [customCss, setCustomCss] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/space").then((r) => r.json()).then((d) => {
      if (d.space) {
        setBlocks(d.space.blocks || []);
        setPublished(!!d.space.published);
        setCustomCss(d.space.customCss ?? "");
      }
    });
  }, []);

  async function save() {
    setSaving(true);
    const r = await fetch("/api/space", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks, published, customCss: user?.gemsUnlocked ? customCss : "" }),
    });
    if (r.ok) {
      setSaved("Saved ✓");
      setTimeout(() => setSaved(null), 2500);
    } else {
      setSaved("Failed");
    }
    setSaving(false);
  }

  if (!user) {
    return (
      <HubShell rightRail={<RightRail />}>
        <p className="text-xs text-white/40">sign in to edit your space</p>
      </HubShell>
    );
  }

  return (
    <HubShell rightRail={<RightRail />}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white lowercase" style={{ fontFamily: "var(--font-syne)" }}>edit your space</h1>
          <p className="text-xs text-white/40 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            this is your personal domain at <Link href={`/@${user.username}`} className="text-[var(--accent)] hover:underline" data-testid="space-public-link">/@{user.username}</Link>
          </p>
        </div>

        <div className="peng-card flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input data-testid="space-published-toggle" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span style={{ fontFamily: "var(--font-mono)" }}>published</span>
          </label>
          <Link href={`/@${user.username}`} className="text-xs text-[var(--accent)] hover:underline" data-testid="space-preview-link" style={{ fontFamily: "var(--font-mono)" }}>view live →</Link>
        </div>

        <BlockEditor blocks={blocks} onChange={setBlocks} gemsUnlocked={user.gemsUnlocked} />

        {/* Custom CSS — gems feature */}
        <div className="peng-card">
          <p className="text-[10px] tracking-widest mb-2 flex items-center gap-2" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="text-[var(--gem-color)]">◆</span>
            <span className="text-white/40">CUSTOM CSS</span>
            {!user.gemsUnlocked && <span className="text-[10px] text-[var(--gem-color)]">(gems required)</span>}
          </p>
          <textarea
            data-testid="custom-css-input"
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            disabled={!user.gemsUnlocked}
            rows={6}
            placeholder="/* your custom CSS — wrap in selectors */"
            className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-xs text-white font-mono outline-none focus:border-[var(--accent)] disabled:opacity-40"
          />
        </div>

        <div>
          <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>PREVIEW</p>
          <div className="peng-card p-4 bg-black/40">
            {blocks.length === 0 ? (
              <p className="text-xs text-white/30 italic">add blocks to preview</p>
            ) : (
              <BlockRenderer blocks={blocks} isOwner={true} gemsUnlocked={user.gemsUnlocked} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pb-12">
          <button onClick={save} disabled={saving} className="peng-btn peng-btn-primary disabled:opacity-40" data-testid="save-space-button">
            {saving ? "saving…" : "Save Space"}
          </button>
          {saved && <span className="text-xs text-green-400" data-testid="space-save-status">{saved}</span>}
        </div>
      </div>
    </HubShell>
  );
}
