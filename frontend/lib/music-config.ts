// ═══════════════════════════════════════════════════════════
// PENG MUSIC CONFIG
// ═══════════════════════════════════════════════════════════
// Drop your songs in here. They'll auto-play (shuffled) on the
// landing page when the user clicks ▶ in the bottom dock.
//
// Each track:
//   - url:    Direct link to an mp3/ogg/wav  (CORS-allowed origin
//             OR same-origin file in /public)
//   - title:  Shown in the player
//   - artist: (optional) Shown after a · in the player
//
// LOCAL FILES: drop the file into /app/frontend/public/music/yoursong.mp3
//              then use:  url: "/music/yoursong.mp3"
//
// REMOTE FILES: must allow CORS. Soundcloud/Youtube links won't work.
// ═══════════════════════════════════════════════════════════

export type MusicTrack = {
  url: string;
  title: string;
  artist?: string;
};

export const MUSIC_PLAYLIST: MusicTrack[] = [
  // {
  //   url: "/music/jaakuna.mp3",
  //   title: "jaakuna",
  //   artist: "peng",
  // },
  // {
  //   url: "/music/void-signal.mp3",
  //   title: "void signal",
  //   artist: "peng",
  // },
];

// Used only when MUSIC_PLAYLIST is empty AND no API uploads exist.
// Public-domain ambient samples so the dock isn't dead on first load.
export const FALLBACK_PLAYLIST: MusicTrack[] = [
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "SoundHelix Song 1", artist: "fallback" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", title: "SoundHelix Song 2", artist: "fallback" },
];
