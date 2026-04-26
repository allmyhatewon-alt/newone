"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const BGM_TRACKS = [
  "comet - forever w_ exodus1900, kasper gem, starfall, saturn, crusifye, idiot, mom, roxas, kuru, sholoh (iatneh).mp3",
  "#zombiemode (prod. coni).mp3",
  "ALMIGHTYY SOSAAA.mp3",
  "BATMAN.mp3",
  "Control - Heffie.mp3",
  "DISTRESS SPORTVVS.mp3",
  "Gotta Keep Going! (autumn).mp3",
  "Hired Gun (unmixed) Prod. h e a l.mp3",
  "I Deserve It prod me.mp3",
  "SHOLOH STAIN.mp3",
  "TAKE ME AWAY.mp3",
  "WTF_BY IAYZE.mp3",
  "a punk song about sobriety and paranoia.mp3",
  "backwards w_ d0llywood1 + saturn.mp3",
  "keeping secrets.mp3",
  "nope your too late i died w_ jacko.mp3",
  "serialkilled by p4rkr.mp3",
  "song ill never release.mp3",
  "talk talk by kurtains.mp3",
  "the end of our love story_heygwuapo.mp3",
  "threat by lieu.mp3",
  "three am - osquinn.mp3",
  "tweaking tg.mp3",
];

const INTRO_TRACK = BGM_TRACKS[0];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPlaylist(): string[] {
  const rest = shuffled(BGM_TRACKS.filter((t) => t !== INTRO_TRACK));
  return [INTRO_TRACK, ...rest];
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  const [playlist, setPlaylist] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [cleanMode, setCleanMode] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [started, setStarted] = useState(false);

  // Build playlist once
  useEffect(() => {
    const pl = buildPlaylist();
    setPlaylist(pl);
    setTrackName(stripExt(pl[0]));
  }, []);

  function stripExt(s: string) {
    return s.replace(/\.(mp3|wav|ogg)$/i, "");
  }

  // Init Web Audio
  const initAudio = useCallback(() => {
    if (!audioRef.current || ctxRef.current) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Expose globally for other components (gif bg, peng letters)
    (window as any)._discordAuraAudioCtx = ctx;

    const src = ctx.createMediaElementSource(audioRef.current);
    srcRef.current = src;
    audioRef.current._pengMediaSource = src;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.5;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination);

    // Expose for visualizer consumers
    (window as any)._pengAnalyser = analyser;
    (window as any)._pengDataArray = dataArray;

    drawVisualizer();
  }, []);

  // Canvas visualizer
  function drawVisualizer() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!canvas || !ctx) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barW = canvas.width / data.length;
      data.forEach((val, i) => {
        const h = (val / 255) * canvas.height;
        const hue = 270 + (i / data.length) * 60; // purple to cyan
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.fillRect(i * barW, canvas.height - h, barW - 1, h);
      });
    }

    draw();
  }

  function loadTrack(trackIdx: number) {
    if (!audioRef.current || !playlist.length) return;
    const track = playlist[trackIdx];
    audioRef.current.src = `/bg/${encodeURIComponent(track)}`;
    audioRef.current.volume = volume;
    setTrackName(stripExt(track));
  }

  function play() {
    if (!audioRef.current || !playlist.length) return;
    initAudio();
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume();
    if (!started) {
      loadTrack(0);
      setStarted(true);
    }
    audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
  }

  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function skip() {
    const next = (idx + 1) % playlist.length;
    setIdx(next);
    loadTrack(next);
    if (playing) {
      audioRef.current?.play().catch(() => {});
    }
  }

  function onEnded() {
    skip();
  }

  function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  return (
    <div
      id="audio-player-dock"
      className={cleanMode ? "clean-mode" : ""}
    >
      {/* Visualizer behind controls */}
      <canvas
        ref={canvasRef}
        id="visualizer-canvas"
        style={{ height: "48px" }}
      />

      <div className="relative z-10 flex items-center gap-3 px-4 py-2 h-12">
        {/* Track name */}
        <span
          className="flex-1 truncate text-xs opacity-60"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}
        >
          {started ? trackName : "click ▶ to start"}
        </span>

        {/* Controls */}
        <button
          onClick={playing ? pause : play}
          className="peng-btn peng-btn-ghost px-3 py-1 text-xs"
          title={playing ? "pause" : "play"}
        >
          {playing ? "⏸" : "▶"}
        </button>

        <button
          onClick={skip}
          className="peng-btn peng-btn-ghost px-3 py-1 text-xs"
          title="skip"
        >
          ⏭
        </button>

        {/* Volume */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={onVolumeChange}
          className="w-20 accent-purple-500"
          style={{ height: "2px" }}
          title="volume"
        />

        {/* Clean mode toggle */}
        <button
          onClick={() => setCleanMode((c) => !c)}
          className="peng-btn peng-btn-ghost px-2 py-1 text-xs opacity-50 hover:opacity-100"
          title={cleanMode ? "expand player" : "clean mode"}
        >
          {cleanMode ? "▲" : "—"}
        </button>
      </div>

      <audio ref={audioRef} onEnded={onEnded} preload="none" />
    </div>
  );
}

// Extend HTMLAudioElement for our media source cache
declare global {
  interface HTMLAudioElement {
    _pengMediaSource?: MediaElementAudioSourceNode;
  }
}
