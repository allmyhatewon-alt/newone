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
- **Hub layout — centered, balanced** — `.hub-grid` is `220 / 1fr / 320`, `max-width: 1380px; margin: 0 auto`. Sidebar sticky, main column min-width: 0 (no left bleed, no right bleed). Replaced flush-left look from previous iteration after user feedback.
- **Bricolage Grotesque** added as `--font-bricolage` and applied to all hub headings (`.hub-page-title`) and post titles (`.post-title`). Replaced the stretched `font-syne lowercase 3xl black` style on `Home`, `b/<slug>`, `discover`, `live now`, `clips`, etc. (touched `FeedView.tsx`, `HubStubPage.tsx`).
- **Cosmic landing layout** — wider 3-col, 1700px max-width, halo rings around peng card, cosmic orbs background + 60 twinkling stars + soft purple cursor glow.
- **Floating currency UI** — clickable shard/gem/xp pills in topbar with count-up + pulsing ring. **Shards / XP** open the orbital stats panel; **Gems** opens the new shop.
- **Gem Shop (`components/Effects/GemShop.tsx`)** — terminal-styled overlay (mac-window dots, monospace screen). 8 items with natural, peng-voiced captions (no AI fluff). Captions reveal **letter by letter with a Web-Audio typewriter sound** (noise burst + triangle "thunk" with varied pitch + "carriage return" tone on `,` and `.`). Mute toggle in header. Re-types on item switch. Items list with rare items twinkling gold ✦. BUY button stub for now.
- **Live touches** — streak ring flame flicker, post-card hover lift + glow, feed-card stagger reveal on tab switch, breathing pink PENG glow on landing, sticky sidebar, **live "online" pulse pill** with mocked drift, **rotating ambient ticker** with 7 natural one-liners.
- **Particle burst** on daily check-in (xp green + shard cyan).
- **Portal helper (`Effects/Portal.tsx`)** — required because the topbar's `backdrop-blur` was creating a containing block that broke `position: fixed` for any modal rendered inside it. All overlays + the particle host now portal to `document.body`.
- **Hydration fix** — `LivePulse` no longer seeds with `Math.random()` during SSR; computes after mount.

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
