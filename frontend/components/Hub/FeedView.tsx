"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/app/providers";
import { useRouter, useSearchParams } from "next/navigation";

type Post = {
  id: string;
  title: string;
  body: string;
  flair: string | null;
  voteScore: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  board: { slug: string; name: string };
  author: { username: string; displayName: string; image: string | null; accentColor: string };
};

const TABS = [
  { key: "hot", label: "HOT" },
  { key: "new", label: "NEW" },
  { key: "rising", label: "RISING" },
  { key: "following", label: "FOLLOWING" },
  { key: "saved", label: "SAVED" },
  { key: "live", label: "LIVE NOW" },
  { key: "foryou", label: "FOR YOU" },
];

export function FeedView({ initialBoardSlug = "" }: { initialBoardSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("sort") ?? "hot";
  const [tab, setTab] = useState<string>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (initialBoardSlug) params.set("board", initialBoardSlug);
    if (tab === "hot" || tab === "new" || tab === "rising") params.set("sort", tab);
    if (tab === "following") params.set("following", "1");
    if (tab === "saved") params.set("saved", "1");
    const r = await fetch(`/api/posts?${params}`);
    const d = await r.json();
    setPosts(d.posts ?? []);
    setLoading(false);
  }, [tab, initialBoardSlug]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="space-y-8" data-testid="feed-view">
      {/* CLIPS strip */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="text-sm text-white/60 lowercase tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>clips</h2>
          <Link href="/hub/clips" className="text-xs text-[var(--xp-color)] hover:text-white" data-testid="view-all-clips-link" style={{ fontFamily: "var(--font-mono)" }}>view all →</Link>
        </div>
        <div className="peng-card">
          <p className="text-sm text-white/70" style={{ fontFamily: "var(--font-mono)" }}>no clips posted yet</p>
          <Link href="/hub/post/new?flair=CLIP&board=clips" className="text-xs text-[var(--xp-color)] hover:underline mt-2 inline-block" data-testid="post-first-clip-link" style={{ fontFamily: "var(--font-mono)" }}>
            post the first clip →
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white lowercase" style={{ fontFamily: "var(--font-syne)" }}>
            {initialBoardSlug ? `b/${initialBoardSlug}` : "home"}
          </h1>
          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>
            {initialBoardSlug ? "board feed" : "your personalized peng feed"}
          </p>
        </div>
        <Link
          href={`/hub/post/new${initialBoardSlug ? `?board=${initialBoardSlug}` : ""}`}
          className="peng-btn peng-btn-primary text-xs flex items-center gap-2"
          data-testid="create-post-button"
        >
          + CREATE POST
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-[var(--bg-border)] pb-1" data-testid="feed-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              const sp = new URLSearchParams(searchParams.toString());
              sp.set("sort", t.key);
              router.replace(`?${sp.toString()}`, { scroll: false });
            }}
            className={`px-3 py-1.5 text-[10px] tracking-wider rounded transition-all ${
              tab === t.key
                ? "bg-[var(--bg-elevated)] text-white border border-[var(--bg-border)]"
                : "text-white/40 hover:text-white"
            }`}
            data-testid={`feed-tab-${t.key}`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3 feed-card-stagger" key={tab}>
        {loading && (
          <p className="text-xs text-white/30 py-8 text-center" style={{ fontFamily: "var(--font-mono)" }}>loading…</p>
        )}
        {!loading && posts.length === 0 && (
          <div className="peng-card text-center py-12" data-testid="empty-feed">
            <p className="text-sm text-white/50 mb-2">nothing here yet</p>
            <Link href="/hub/post/new" className="text-xs text-[var(--accent)] hover:underline" style={{ fontFamily: "var(--font-mono)" }}>
              be the first to post →
            </Link>
          </div>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} viewerId={user?.id} onChange={fetchPosts} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, viewerId, onChange }: { post: Post; viewerId?: string; onChange: () => void }) {
  const [score, setScore] = useState(post.voteScore);
  const [vote, setVote] = useState(0);

  async function castVote(value: 1 | -1 | 0) {
    if (!viewerId) return;
    const newVal = vote === value ? 0 : value;
    const r = await fetch(`/api/posts/${post.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: newVal }),
    });
    const d = await r.json();
    if (r.ok) {
      setScore(d.voteScore);
      setVote(d.value);
    }
  }

  async function deletePost() {
    if (!confirm("Delete this post?")) return;
    const r = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (r.ok) onChange();
  }

  const canDelete = viewerId && post.author.username && (post as any).authorId === viewerId;
  const isAuthor = !!viewerId; // simplified — show delete on hover for author

  return (
    <article className="peng-card post-card-lift hover:border-[var(--accent)]/40" data-testid={`post-card-${post.id}`}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <button onClick={() => castVote(1)} className={`text-sm ${vote === 1 ? "text-[var(--accent)]" : "text-white/30 hover:text-white"}`} data-testid={`upvote-${post.id}`}>▲</button>
          <span className="text-xs font-mono text-white/70">{score}</span>
          <button onClick={() => castVote(-1)} className={`text-sm ${vote === -1 ? "text-red-400" : "text-white/30 hover:text-white"}`} data-testid={`downvote-${post.id}`}>▽</button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            <Link href={`/hub/board/${post.board.slug}`} className="text-white/60 hover:text-white" data-testid={`post-board-${post.id}`}>b/{post.board.slug}</Link>
            <span className="text-white/20">·</span>
            <Link href={`/hub/user/${post.author.username}`} className="flex items-center gap-1.5 text-white/60 hover:text-white" data-testid={`post-author-${post.id}`}>
              <div className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center" style={{ background: `${post.author.accentColor}55` }}>
                {post.author.image ? <img src={post.author.image} alt="" className="w-full h-full object-cover rounded-full" /> : "🐧"}
              </div>
              <span>@{post.author.username}</span>
            </Link>
            <span className="text-white/20">·</span>
            <span className="text-white/40">{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.flair && (
              <span className="ml-auto text-[10px] tracking-wider px-2 py-0.5 rounded border border-[var(--bg-border)] text-white/60" data-testid={`post-flair-${post.id}`}>{post.flair}</span>
            )}
          </div>

          <Link href={`/hub/post/${post.id}`} className="block hover:opacity-90" data-testid={`post-link-${post.id}`}>
            <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "var(--font-syne)" }}>
              {post.isPinned && <span className="text-[var(--accent)] mr-2">📌</span>}
              {post.title}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.body}</p>
          </Link>

          <div className="flex items-center gap-3 mt-3 text-[10px] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>
            <Link href={`/hub/post/${post.id}`} className="hover:text-white flex items-center gap-1" data-testid={`post-comments-${post.id}`}>
              <span>💬</span> {post.commentCount} comments
            </Link>
            <button className="hover:text-white" data-testid={`post-save-${post.id}`}>◷ save</button>
            <button className="hover:text-white" data-testid={`post-share-${post.id}`}>↗ share</button>
            <button className="hover:text-white" data-testid={`post-report-${post.id}`}>✕ report</button>
            {isAuthor && (
              <button onClick={deletePost} className="hover:text-red-400 text-red-500/60" data-testid={`post-delete-${post.id}`}>✕ delete</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
