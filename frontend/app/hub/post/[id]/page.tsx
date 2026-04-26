"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { useAuth } from "@/app/providers";

type Post = {
  id: string;
  title: string;
  body: string;
  flair: string | null;
  voteScore: number;
  commentCount: number;
  createdAt: string;
  board: { slug: string; name: string };
  author: { username: string; displayName: string; image: string | null; accentColor: string; level?: number };
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { username: string; displayName: string; image: string | null; accentColor: string };
  }>;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch(`/api/posts/${params.id}`);
    if (!r.ok) { setPost(null); return; }
    const d = await r.json();
    setPost(d.post);
  }
  useEffect(() => { load(); }, [params.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    const r = await fetch(`/api/posts/${params.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment }),
    });
    if (r.ok) { setComment(""); await load(); }
    setLoading(false);
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    const r = await fetch(`/api/posts/${params.id}`, { method: "DELETE" });
    if (r.ok) router.push("/hub");
  }

  return (
    <HubShell rightRail={<RightRail />}>
      <div className="max-w-2xl">
        {!post ? (
          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>loading…</p>
        ) : (
          <>
            <div className="text-xs mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              <Link href={`/hub/board/${post.board.slug}`} className="text-white/60 hover:text-white" data-testid="post-detail-board-link">b/{post.board.slug}</Link>
              <span className="text-white/20 mx-2">·</span>
              <Link href={`/hub/user/${post.author.username}`} className="text-white/60 hover:text-white" data-testid="post-detail-author-link">@{post.author.username}</Link>
              <span className="text-white/20 mx-2">·</span>
              <span className="text-white/40">{new Date(post.createdAt).toLocaleString()}</span>
              {post.flair && <span className="ml-2 text-[10px] tracking-wider px-2 py-0.5 rounded border border-[var(--bg-border)] text-white/60">{post.flair}</span>}
            </div>
            <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "var(--font-syne)" }} data-testid="post-detail-title">{post.title}</h1>
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap mb-6" data-testid="post-detail-body">{post.body}</p>

            <div className="flex items-center gap-3 text-xs text-white/40 mb-8" style={{ fontFamily: "var(--font-mono)" }}>
              <span>▲ {post.voteScore}</span>
              <span>💬 {post.commentCount}</span>
              {user?.username === post.author.username && (
                <button onClick={deletePost} className="text-red-400 hover:underline" data-testid="post-detail-delete">delete</button>
              )}
            </div>

            <h2 className="text-xs tracking-wider text-white/50 uppercase mb-3" style={{ fontFamily: "var(--font-mono)" }}>comments ({post.comments.length})</h2>
            {user && (
              <form onSubmit={submit} className="mb-6" data-testid="comment-form">
                <textarea
                  data-testid="comment-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="add a comment…"
                  className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
                  rows={3}
                />
                <button data-testid="comment-submit" disabled={loading} className="peng-btn peng-btn-primary text-xs mt-2 disabled:opacity-40">
                  {loading ? "posting…" : "Post Comment"}
                </button>
              </form>
            )}
            <div className="space-y-3" data-testid="comments-list">
              {post.comments.map((c) => (
                <div key={c.id} className="peng-card">
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <Link href={`/hub/user/${c.author.username}`} className="flex items-center gap-1.5 text-white/60 hover:text-white" data-testid={`comment-author-${c.id}`}>
                      <div className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center" style={{ background: `${c.author.accentColor}55` }}>
                        {c.author.image ? <img src={c.author.image} className="w-full h-full object-cover rounded-full" alt="" /> : "🐧"}
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)" }}>@{c.author.username}</span>
                    </Link>
                    <span className="text-white/30 text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
              {post.comments.length === 0 && <p className="text-xs text-white/30 italic" style={{ fontFamily: "var(--font-mono)" }}>no comments yet · be the first</p>}
            </div>
          </>
        )}
      </div>
    </HubShell>
  );
}
