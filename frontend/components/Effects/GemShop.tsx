"use client";
import { useEffect, useRef, useState } from "react";

// ── SHOP ITEMS — natural, specific captions (no AI fluff) ─────────────
type ShopItem = {
  id: string;
  name: string;
  price: number;
  caption: string;
  rare?: boolean;
};

const ITEMS: ShopItem[] = [
  {
    id: "name-glow",
    name: "Name Glow",
    price: 200,
    caption: "your @handle gets a soft outline. people notice. that's it.",
  },
  {
    id: "custom-accent",
    name: "Custom Accent",
    price: 350,
    caption: "pick literally any hex for your profile. no presets, no themes.",
  },
  {
    id: "post-pin",
    name: "Post Pin",
    price: 500,
    caption: "pin one of your posts to a board for 48h. mods can still unpin it if it sucks.",
  },
  {
    id: "streak-shield",
    name: "Streak Shield",
    price: 600,
    caption: "miss a day, streak doesn't break. one use. expires in 30 days. don't hoard it.",
  },
  {
    id: "xp-weekend",
    name: "2× XP Weekend",
    price: 800,
    caption: "double xp on every action sat 00:00 → sun 23:59 utc. stacks with check-in streak.",
  },
  {
    id: "custom-cursor",
    name: "Custom Cursor",
    price: 1200,
    caption: "swap the penguin cursor for one you draw yourself. send a 32×32 png.",
    rare: true,
  },
  {
    id: "clip-feature",
    name: "Clip Feature",
    price: 1500,
    caption: "your clip rotates on hub home for 6h. peng watches all of these. no exceptions.",
    rare: true,
  },
  {
    id: "own-board",
    name: "Spin Up A Board",
    price: 5000,
    caption: "your own board. you set the slug, the icon, the rules. mods report to you.",
    rare: true,
  },
];

// ── Typewriter sound (no asset, generated via WebAudio) ────────────────
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  try {
    const A = window.AudioContext || (window as any).webkitAudioContext;
    _ctx = new A();
    return _ctx;
  } catch { return null; }
}

// short low-volume "click" — softer the longer you hold it down
function playKeyClick() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  // 1) tiny noise burst (the 'tick')
  const buf = ctx.createBuffer(1, 256, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.06, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  const noiseFilt = ctx.createBiquadFilter();
  noiseFilt.type = "highpass";
  noiseFilt.frequency.value = 1800;
  noise.connect(noiseFilt).connect(noiseGain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.05);

  // 2) thin "thunk" tone for body
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  // varied pitch for natural feel
  const base = 320 + Math.random() * 220;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(base * 0.6, t + 0.05);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.045, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}

function playReturn() {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.07, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.13);
}

// ── component ────────────────────────────────────────────────────────
export function GemShop({ user, onClose }: { user: any; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(ITEMS[0].id);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const active = ITEMS.find((i) => i.id === activeId)!;

  return (
    <div
      ref={overlayRef}
      className="floating-stat-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      data-testid="gem-shop"
    >
      <div className="gem-shop-card">
        <button onClick={onClose} className="floating-stat-close" data-testid="gem-shop-close" aria-label="close">×</button>

        <header className="gem-shop-header">
          <div>
            <p className="gem-shop-kicker">PENG_OS · TRADE TERMINAL</p>
            <h2 className="gem-shop-title">spend your gems</h2>
          </div>
          <div className="gem-shop-balance">
            <span className="gem-shop-bal-label">BALANCE</span>
            <span className="gem-shop-bal-value">
              <span className="text-[var(--gem-color)] mr-1">◆</span>
              {(user?.gems ?? 0).toLocaleString()}
            </span>
            <button
              onClick={() => setMuted((m) => !m)}
              className="gem-shop-mute"
              data-testid="gem-shop-mute"
              title={muted ? "unmute" : "mute typewriter"}
              aria-label="toggle sound"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </header>

        <div className="gem-shop-body">
          {/* LEFT — item list */}
          <ul className="gem-shop-list" data-testid="gem-shop-list">
            {ITEMS.map((it) => {
              const owned = (user?.gems ?? 0) >= it.price;
              const active = it.id === activeId;
              return (
                <li key={it.id}>
                  <button
                    onClick={() => setActiveId(it.id)}
                    className={`gem-shop-row ${active ? "is-active" : ""} ${it.rare ? "is-rare" : ""}`}
                    data-testid={`gem-shop-item-${it.id}`}
                  >
                    <span className="gem-shop-row-name">
                      {it.rare && <span className="gem-shop-row-rare" title="rare">✦</span>}
                      {it.name}
                    </span>
                    <span className={`gem-shop-row-price ${!owned ? "is-locked" : ""}`}>
                      ◆ {it.price.toLocaleString()}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* RIGHT — terminal preview */}
          <div className="gem-shop-preview">
            <div className="gem-shop-screen">
              <div className="gem-shop-screen-bar">
                <span className="dot" /><span className="dot" /><span className="dot" />
                <span className="gem-shop-screen-id">~/peng/shop/{active.id}</span>
              </div>
              <div className="gem-shop-screen-body" data-testid="gem-shop-preview">
                <p className="gem-shop-prompt">
                  <span className="gem-shop-prompt-arrow">›</span>
                  <span className="gem-shop-prompt-name">{active.name}</span>
                  {active.rare && <span className="gem-shop-prompt-tag">RARE</span>}
                </p>
                <Typed
                  key={active.id /* re-mount on switch so it retypes */}
                  text={active.caption}
                  muted={muted}
                />
              </div>
            </div>

            <button
              className="gem-shop-buy"
              data-testid={`gem-shop-buy-${active.id}`}
              onClick={() => alert("the gem economy is not live yet — peng is still tuning the rates.")}
            >
              <span>buy for</span>
              <span className="gem-shop-buy-price">◆ {active.price.toLocaleString()}</span>
            </button>
            <p className="gem-shop-foot">esc to close · gems carry across seasons · refunds within 5 minutes if it bricks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Typed: prints text char-by-char with WebAudio click ──────────────
function Typed({ text, muted }: { text: string; muted: boolean }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    setOut("");
    let cancelled = false;
    function step() {
      if (cancelled) return;
      i += 1;
      setOut(text.slice(0, i));
      // play click on most chars (skip spaces sometimes for natural rhythm)
      if (!muted && text[i - 1] && text[i - 1] !== " ") playKeyClick();
      if (text[i - 1] === "." || text[i - 1] === ",") {
        if (!muted) playReturn();
      }
      if (i < text.length) {
        // varied delay for natural typing rhythm
        const ch = text[i - 1] ?? "";
        let d = 22 + Math.random() * 24;
        if (ch === " ") d += 30;
        if (ch === ",") d += 90;
        if (ch === ".") d += 160;
        setTimeout(step, d);
      }
    }
    const t = setTimeout(step, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [text, muted]);
  return (
    <p className="gem-shop-caption" data-testid="gem-shop-caption">
      {out}
      <span className="gem-shop-caret" />
    </p>
  );
}
