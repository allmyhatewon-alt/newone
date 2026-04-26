import Link from "next/link";
import { GifBackground } from "@/components/Landing/GifBackground";
import { PengLetters } from "@/components/Landing/PengLetters";
import { SignalBoard } from "@/components/Landing/SignalBoard";
import { PengFund } from "@/components/Landing/PengFund";
import { EnterHubPortal } from "@/components/Landing/EnterHubPortal";
import { LandingPengCard } from "@/components/Landing/LandingPengCard";
import { CosmicOrbs } from "@/components/Effects/CosmicOrbs";
import { CursorGlow } from "@/components/Effects/CursorGlow";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" data-testid="landing-page">
      <GifBackground />
      <CosmicOrbs />
      <PengLetters />
      <CursorGlow />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-5"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
        aria-hidden="true"
      />

      {/* GIANT pink PENG header (top-left) */}
      <h1
        className="fixed top-0 left-0 select-none pointer-events-none z-0 peng-breathe"
        style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 900,
          fontSize: "clamp(8rem, 18vw, 22rem)",
          color: "#ff2bd6",
          letterSpacing: "-0.03em",
          lineHeight: 0.82,
          paddingTop: "0.4rem",
          paddingLeft: "1rem",
        }}
        data-testid="giant-peng-text"
      >
        PENG
      </h1>

      {/* Three-column landing layout — cosmic spread, side rails pinned to viewport edges */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[300px_1fr_300px] xl:grid-cols-[340px_1fr_340px] gap-8 md:gap-12 xl:gap-16 w-full max-w-[1700px] mx-auto px-6 md:px-10 xl:px-14 pt-44 md:pt-52 xl:pt-56 pb-32">
        {/* LEFT: SignalBoard + PengFund */}
        <div className="space-y-5 slide-up delay-1">
          <SignalBoard />
          <PengFund />
        </div>

        {/* CENTER: peng card with halo */}
        <div className="flex items-start justify-center slide-up delay-2">
          <div className="peng-card-halo w-full max-w-md">
            <LandingPengCard />
          </div>
        </div>

        {/* RIGHT: Enter Hub Portal + creator card */}
        <div className="space-y-5 slide-up delay-3">
          <EnterHubPortal />
          <div className="peng-card">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                style={{ background: "linear-gradient(135deg, #00d4ff66, #c084fc66)" }}
              >
                🐧
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white" style={{ fontFamily: "var(--font-mono)" }}>@peng</p>
                <p className="text-[10px] text-white/40">Offline</p>
              </div>
            </div>
            <Link href="https://discord.gg/peng" target="_blank" rel="noopener" className="peng-btn peng-btn-primary text-[10px] w-full mt-3" data-testid="join-server-link">
              JOIN SERVER →
            </Link>
          </div>
          <div className="peng-card">
            <div className="flex items-start gap-2 mb-1">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black" style={{ background: "#fff", color: "#000", fontFamily: "var(--font-syne)" }}>P</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white" style={{ fontFamily: "var(--font-mono)" }}>peng bot</p>
                <p className="text-[10px] text-white/40 truncate">id:1799401528588773</p>
              </div>
            </div>
            <p className="text-[10px] text-white/50 mt-2" style={{ fontFamily: "var(--font-mono)" }}>discord.gg/pengs ²ᵏ</p>
            <div className="flex items-center gap-1 text-[10px] text-white/50 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block animate-pulse" />
              guarding the hub aura
            </div>
            <Link href="https://discord.com/api/oauth2/authorize" target="_blank" rel="noopener" className="peng-btn peng-btn-ghost text-[10px] w-full mt-3" data-testid="invite-bot-link">
              INVITE BOT →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom-right contact + achievement badges */}
      <Link
        href="mailto:hello@pengelus.me"
        className="fixed bottom-20 right-6 peng-btn peng-btn-ghost text-[10px] z-20 flex items-center gap-1"
        data-testid="contact-button"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        CONTACT
      </Link>
      <div className="fixed bottom-32 right-6 text-[10px] text-[var(--xp-color)] z-20 hidden md:block" style={{ fontFamily: "var(--font-mono)" }}>
        <span>★</span> achievement unlocked: press_start
      </div>
    </main>
  );
}
