# PENG HUB — PRD

## Original Problem Statement (latest iteration)
- "FOR THE LANDING PAGE ITS TOO SPREAD OUT, GO THROUGH THE FILES MAKE A PLAN AND ASK QUESTIONS"
- "ok for the feed, i want it more to the left like WAYY to the left but make sure everything looks clean and perfect also anybody can access admin console not just admins, fix that"
- "UPGRADE THE SITE AS A WHOLE MAKE IT FEEL ALIVE, UI GFX LIKE WHEN U PRESS UR GEMS THE U.I IS FLOATING WITH ANIMATIONS NOT JUST THERE YOU KNOW"
- Music: add a config to drop songs into; only show music dock on the landing page.
- Landing on PC felt "closed together like a universe about to do the big bang" — wanted cosmic spread.

## Architecture
- Next.js 14 (app router) + Tailwind + Prisma + SQLite (dev)
- Custom JWT cookie auth (`lib/auth.ts`)
- Custom CSS variables driving the `peng_os` skin

## What's Implemented (this iteration — Apr 26 / Jan 2026 cycle)
- **Music config (`lib/music-config.ts`)** — drop tracks into `MUSIC_PLAYLIST` (url, title, artist). Falls back to API uploads, then public samples. Local files: place in `/public/music/` and reference as `/music/<file>.mp3`.
- **Audio dock landing-only** — `AudioPlayer` now uses `usePathname()`; renders + builds playlist only on `/`. Auto-pauses on route change.
- **Admin console gated server-side** — `/hub/admin` is now a server component that calls `getCurrentUser()`. Anonymous → `/auth/signin?callback=/hub/admin`. Non-`ADMIN` role → `/hub`.
- **Hub hard-left layout** — new `.hub-grid` (220 / 1fr / 320, full-width, no center max-width). Sidebar pinned to viewport left edge, sticky on scroll. Main column capped at 820px so it doesn't bleed across.
- **Cosmic landing layout** — wider 3-col (300/1fr/300, up to 340 at xl), 1700px max-width, much bigger gaps + top padding. Halo rings around peng card. New cosmic orbs background + 60 twinkling stars + cursor glow.
- **Floating currency UI** — `components/Effects/FloatingStats.tsx` shows clickable shard/gem/xp pills in topbar with count-up animation and a pulsing ring. Click → full-screen overlay panel with: 3 concentric orbital rings (one dashed, opposite spin), 12 orbiting nodes at 3 radii, 16 radiating sparks, glowing core symbol, big-number stat with shadow, 4-cell stat grid (level/streak/role/longest), context tip per currency. Esc to close.
- **Particle burst system** (`ParticleBurst.tsx`) — `fireBurst(x, y, color)` API. Used on daily check-in: bursts XP green + shard cyan from the button.
- **Live touches** — streak ring flame flicker, post-card hover lift + glow, feed-card stagger reveal on tab switch, sidebar item slide-on-hover, breathing pink PENG glow on landing, sticky sidebar.

## Tech Files Touched
- `app/page.tsx`, `app/layout.tsx` (audio still mounted there but conditionally renders)
- `app/hub/page.tsx` (unchanged), `app/hub/admin/page.tsx` (server-gated)
- `app/globals.css` (new keyframes / utilities)
- `components/Hub/HubShell.tsx`, `components/Hub/FeedView.tsx`, `components/Hub/RightRail.tsx`
- `components/AudioPlayer/AudioPlayer.tsx`
- `components/Effects/FloatingStats.tsx` (new)
- `components/Effects/CursorGlow.tsx` (new)
- `components/Effects/CosmicOrbs.tsx` (new)
- `components/Effects/TiltCard.tsx` (new — available for future use)
- `components/Effects/ParticleBurst.tsx` (new)
- `lib/music-config.ts` (new)

## Next Action Items
- Add real songs into `lib/music-config.ts` (drop mp3s into `/app/frontend/public/music/`).
- Add tilt/hover animation to landing peng card itself (TiltCard wrapper) if user wants the card to physically tilt with the cursor.
- Wire the floating gems panel to a real "spend gems" flow when shop UI is built.
- Consider adding sound FX (subtle click + check-in ding) — easy to add via WebAudio when assets are ready.

## Known
- Currently authenticated peng/admin user has 0 shards/gems/xp so the count-up animation doesn't have much to demo. Earn some via daily check-in to see it shine.
