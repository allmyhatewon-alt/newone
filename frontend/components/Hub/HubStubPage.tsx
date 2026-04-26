"use client";
import Link from "next/link";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";

export function HubStubPage({
  title,
  description,
  icon = "◈",
  cta,
}: {
  title: string;
  description: string;
  icon?: string;
  cta?: { href: string; label: string; testid?: string };
}) {
  return (
    <HubShell rightRail={<RightRail />}>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black text-white lowercase mb-1" style={{ fontFamily: "var(--font-syne)" }}>{title}</h1>
        <p className="text-xs text-white/40 mb-8" style={{ fontFamily: "var(--font-mono)" }}>{description}</p>
        <div className="peng-card text-center py-16">
          <div className="text-5xl mb-4 opacity-40">{icon}</div>
          <p className="text-sm text-white/50" style={{ fontFamily: "var(--font-mono)" }}>// nothing here yet</p>
          {cta && (
            <Link href={cta.href} className="peng-btn peng-btn-primary text-xs mt-6 inline-block" data-testid={cta.testid}>
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </HubShell>
  );
}
