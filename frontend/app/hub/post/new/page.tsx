"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";

function PostNew() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialBoard = sp.get("board") ?? "general";
  const initialFlair = sp.get("flair") ?? "";
  const [boards, setBoards] = useState<{ slug: string; name: string }[]>([]);
  const [boardSlug, setBoardSlug] = useState(initialBoard);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [flair, setFlair] = useState(initialFlair);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/boards").then((r) => r.json()).then((d) => setBoards(d.boards || []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardSlug, title, body, flair: flair || undefined }),
      });
      const d = await r.json();
      if (!r.ok) { setError(typeof d.error === "string" ? d.error : "Something went wrong"); return; }
      router.push(`/hub/post/${d.post.id}`);
    } finally { setLoading(false); }
  }

  return (
    <HubShell rightRail={<RightRail />}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-black text-white lowercase mb-1" style={{ fontFamily: "var(--font-syne)" }}>create post</h1>
        <p className="text-xs text-white/40 mb-6" style={{ fontFamily: "var(--font-mono)" }}>share clips, thoughts, art</p>
        <form onSubmit={submit} className="space-y-4" data-testid="create-post-form">
          <div>
            <label className="text-[10px] text-white/40 tracking-wider mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>BOARD</label>
            <select
              data-testid="post-board-select"
              value={boardSlug}
              onChange={(e) => setBoardSlug(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {boards.map((b) => <option key={b.slug} value={b.slug}>b/{b.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 tracking-wider mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>TITLE</label>
            <input
              data-testid="post-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 tracking-wider mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>BODY</label>
            <textarea
              data-testid="post-body-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={10000}
              rows={8}
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 tracking-wider mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>FLAIR (optional)</label>
            <input
              data-testid="post-flair-input"
              type="text"
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
              placeholder="e.g. CLIP, FAN DISCUSSION"
              maxLength={40}
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
          {error && <p className="text-xs text-red-400" data-testid="create-post-error">{error}</p>}
          <button data-testid="create-post-submit" disabled={loading} className="peng-btn peng-btn-primary disabled:opacity-40">{loading ? "posting…" : "+ Post"}</button>
        </form>
      </div>
    </HubShell>
  );
}

export default function Page() {
  return <Suspense><PostNew /></Suspense>;
}
