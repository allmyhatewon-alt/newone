"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HubShell } from "@/components/Hub/HubShell";
import { RightRail } from "@/components/Hub/RightRail";
import { useAuth } from "@/app/providers";
import { BlockEditor } from "@/components/SpaceEditor/BlockEditor";
import { BlockRenderer, type Block } from "@/components/BlockRenderer/BlockRenderer";

export default function ShowcasePage() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showcase, setShowcase] = useState<Block[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [portalLabel, setPortalLabel] = useState("Enter My Space");
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [socials, setSocials] = useState<any>({});
  const [bio, setBio] = useState("");
  const [accent, setAccent] = useState("#8a2be2");
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/showcase").then((r) => r.json()).then((d) => {
      if (d.profile) {
        setProfile(d.profile);
        setShowcase(d.profile.showcase || []);
        setInterests(d.profile.interests || []);
        setPortalLabel(d.profile.portalLabel);
        setPortalEnabled(d.profile.portalEnabled);
        setSocials({
          tiktokUrl: d.profile.tiktokUrl ?? "",
          twitchUrl: d.profile.twitchUrl ?? "",
          youtubeUrl: d.profile.youtubeUrl ?? "",
          twitterUrl: d.profile.twitterUrl ?? "",
          instagramUrl: d.profile.instagramUrl ?? "",
          kickUrl: d.profile.kickUrl ?? "",
          discordUser: d.profile.discordUser ?? "",
        });
      }
    });
    if (user) {
      setBio(user.bio ?? "");
      setAccent(user.accentColor);
    }
  }, [user]);

  async function save() {
    setSaving(true);
    const [a, b] = await Promise.all([
      fetch("/api/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showcase,
          interests,
          portalLabel,
          portalEnabled,
          ...socials,
        }),
      }),
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, accentColor: accent }),
      }),
    ]);
    if (a.ok && b.ok) {
      setSaved("Saved ✓");
      refresh();
      setTimeout(() => setSaved(null), 2500);
    } else {
      setSaved("Failed to save");
    }
    setSaving(false);
  }

  if (!user) {
    return (
      <HubShell rightRail={<RightRail />}>
        <p className="text-xs text-white/40 italic">sign in to customize your showcase</p>
      </HubShell>
    );
  }

  return (
    <HubShell rightRail={<RightRail />}>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white lowercase" style={{ fontFamily: "var(--font-syne)" }}>customize showcase</h1>
          <p className="text-xs text-white/40 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            this is the showcase tab on your hub profile · think of it as a mini-landing
          </p>
          <Link href={`/hub/user/${user.username}`} className="text-xs text-[var(--accent)] hover:underline" data-testid="view-profile-link" style={{ fontFamily: "var(--font-mono)" }}>
            view your profile →
          </Link>
        </div>

        {/* Profile basics */}
        <Section title="PROFILE">
          <Field label="bio">
            <textarea
              data-testid="bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
            />
          </Field>
          <Field label="accent color">
            <div className="flex items-center gap-2">
              <input
                data-testid="accent-color-input"
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-10 h-10 rounded border border-[var(--bg-border)] bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-white/60">{accent}</span>
            </div>
          </Field>
        </Section>

        {/* Portal */}
        <Section title="PORTAL TO SPACE">
          <Field label="enabled">
            <label className="inline-flex items-center gap-2 text-xs text-white/70 cursor-pointer">
              <input data-testid="portal-enabled-toggle" type="checkbox" checked={portalEnabled} onChange={(e) => setPortalEnabled(e.target.checked)} />
              show portal button on profile
            </label>
          </Field>
          <Field label="button label">
            <input
              data-testid="portal-label-input"
              type="text"
              value={portalLabel}
              onChange={(e) => setPortalLabel(e.target.value)}
              maxLength={40}
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </Field>
        </Section>

        {/* Socials */}
        <Section title="SOCIAL LINKS">
          {[
            ["tiktokUrl", "TikTok URL"],
            ["twitchUrl", "Twitch URL"],
            ["youtubeUrl", "YouTube URL"],
            ["twitterUrl", "X / Twitter URL"],
            ["instagramUrl", "Instagram URL"],
            ["kickUrl", "Kick URL"],
            ["discordUser", "Discord username"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                data-testid={`social-${key}-input`}
                type="text"
                value={socials[key] ?? ""}
                onChange={(e) => setSocials((s: any) => ({ ...s, [key]: e.target.value }))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
              />
            </Field>
          ))}
        </Section>

        {/* Interests */}
        <Section title="INTERESTS">
          <div className="flex flex-wrap gap-2 mb-2">
            {interests.map((i, idx) => (
              <span key={idx} className="text-xs px-2 py-1 border border-[var(--bg-border)] rounded text-white/70 flex items-center gap-2" style={{ fontFamily: "var(--font-mono)" }}>
                {i}
                <button onClick={() => setInterests(interests.filter((_, j) => j !== idx))} className="text-red-400 hover:text-red-300" data-testid={`remove-interest-${idx}`}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              data-testid="interest-input"
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="add an interest"
              className="flex-1 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && interestInput.trim()) {
                  setInterests([...interests, interestInput.trim()]);
                  setInterestInput("");
                  e.preventDefault();
                }
              }}
            />
            <button
              data-testid="add-interest-button"
              onClick={() => { if (interestInput.trim()) { setInterests([...interests, interestInput.trim()]); setInterestInput(""); } }}
              className="peng-btn peng-btn-ghost text-xs"
              type="button"
            >
              + Add
            </button>
          </div>
        </Section>

        {/* Showcase blocks */}
        <Section title="SHOWCASE BLOCKS" sub="customize your profile like the landing page">
          <BlockEditor blocks={showcase} onChange={setShowcase} gemsUnlocked={user.gemsUnlocked} />

          <div className="mt-6">
            <p className="text-[10px] tracking-widest text-white/40 mb-2" style={{ fontFamily: "var(--font-mono)" }}>PREVIEW</p>
            <div className="peng-card p-4 bg-black/40">
              {showcase.length === 0 ? (
                <p className="text-xs text-white/30 italic">no blocks yet</p>
              ) : (
                <BlockRenderer blocks={showcase} isOwner={true} gemsUnlocked={true} />
              )}
            </div>
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center gap-3 pb-12">
          <button
            data-testid="save-showcase-button"
            onClick={save}
            disabled={saving}
            className="peng-btn peng-btn-primary disabled:opacity-40"
          >
            {saving ? "saving…" : "Save Changes"}
          </button>
          {saved && <span className="text-xs text-green-400" data-testid="save-status" style={{ fontFamily: "var(--font-mono)" }}>{saved}</span>}
        </div>
      </div>
    </HubShell>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-[10px] tracking-widest text-[var(--accent)]" style={{ fontFamily: "var(--font-mono)" }}>{title}</p>
        {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
      </div>
      <div className="peng-card space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 tracking-wider mb-1.5 block" style={{ fontFamily: "var(--font-mono)" }}>{label}</label>
      {children}
    </div>
  );
}
