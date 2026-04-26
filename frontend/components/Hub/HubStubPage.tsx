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
        <h1 className="hub-page-title mb-1" data-testid="stub-title">{title}</h1>
        <p className="hub-page-sub mb-8">{description}</p>
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
