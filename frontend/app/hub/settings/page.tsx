"use client";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { useAuth } from "@/app/providers";
import Link from "next/link";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  if (!user) {
    return (
      <HubShell rightRail={<RightRail />}>
        <p className="text-xs text-white/40">sign in to access settings</p>
      </HubShell>
    );
  }
  return (
    <HubShell rightRail={<RightRail />}>
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white lowercase mb-1" style={{ fontFamily: "var(--font-syne)" }}>settings</h1>
          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-mono)" }}>account · preferences · session</p>
        </div>

        <div className="peng-card space-y-2">
          <p className="text-[10px] tracking-widest text-white/40" style={{ fontFamily: "var(--font-mono)" }}>ACCOUNT</p>
          <Row label="username" value={`@${user.username}`} />
          <Row label="email" value={user.email} />
          <Row label="role" value={user.role} />
        </div>

        <div className="peng-card space-y-3">
          <p className="text-[10px] tracking-widest text-white/40" style={{ fontFamily: "var(--font-mono)" }}>CUSTOMIZATION</p>
          <Link href="/hub/showcase" className="peng-btn peng-btn-ghost text-xs w-full" data-testid="settings-customize-showcase">Customize Hub Profile + Showcase</Link>
          <Link href="/hub/space/edit" className="peng-btn peng-btn-ghost text-xs w-full" data-testid="settings-edit-space">Edit Personal Space</Link>
        </div>

        <div className="peng-card">
          <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>SESSION</p>
          <button onClick={signOut} className="peng-btn peng-btn-ghost text-xs text-red-400 hover:text-red-300" data-testid="settings-sign-out">Sign Out</button>
        </div>
      </div>
    </HubShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-1" style={{ fontFamily: "var(--font-mono)" }}>
      <span className="text-white/40">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
