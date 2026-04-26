"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Track = { url: string; title: string; artist?: string };

// Fallback CC0 ambient tracks (if user hasn't uploaded any, the player still works)
const FALLBACK_TRACKS: Track[] = [
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "SoundHelix Song 1", artist: "fallback" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", title: "SoundHelix Song 2", artist: "fallback" },
];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [cleanMode, setCleanMode] = useState(false);
  const [started, setStarted] = useState(false);

  // Build playlist: prefer user uploads, fall back to public sample tracks
  useEffect(() => {
    fetch("/api/upload")
      .then((r) => r.ok ? r.json() : { uploads: [] })
      .then((d) => {
        const userTracks: Track[] = (d.uploads ?? []).map((u: any) => ({
          url: u.url,
          title: u.title || u.filename,
          artist: u.artist || undefined,
        }));
        setPlaylist(userTracks.length ? shuffled(userTracks) : FALLBACK_TRACKS);
      })
      .catch(() => setPlaylist(FALLBACK_TRACKS));
  }, []);

  const initAudio = useCallback(() => {
    if (!audioRef.current || ctxRef.current) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const src = ctx.createMediaElementSource(audioRef.current);
    srcRef.current = src;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.5;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination);

    (window as any)._pengAnalyser = analyser;
    (window as any)._pengDataArray = dataArray;

    drawVisualizer();
  }, []);

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
      analyser!.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barW = canvas.width / data.length;
      data.forEach((val, i) => {
        const h = (val / 255) * canvas.height;
        const hue = 270 + (i / data.length) * 60;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.fillRect(i * barW, canvas.height - h, barW - 1, h);
      });
    }
    draw();
  }

  function loadTrack(trackIdx: number) {
    const track = playlist[trackIdx];
    if (!audioRef.current || !track) return;
    audioRef.current.src = track.url;
    audioRef.current.volume = volume;
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
    if (!playlist.length) return;
    const next = (idx + 1) % playlist.length;
    setIdx(next);
    loadTrack(next);
    if (playing) audioRef.current?.play().catch(() => {});
  }

  function onEnded() { skip(); }

  function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const trackName = started && playlist[idx] ? playlist[idx].title : "click ▶ to start";

  return (
    <div id="audio-player-dock" className={cleanMode ? "clean-mode" : ""} data-testid="audio-player-dock">
      <canvas ref={canvasRef} id="visualizer-canvas" style={{ height: "48px" }} />
      <div className="relative z-10 flex items-center gap-3 px-4 py-2 h-12">
        <span className="flex-1 truncate text-xs opacity-60" style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }} data-testid="audio-track-name">
          {trackName}
        </span>
        <button onClick={playing ? pause : play} className="peng-btn peng-btn-ghost px-3 py-1 text-xs" title={playing ? "pause" : "play"} data-testid="audio-play-button">
          {playing ? "⏸" : "▶"}
        </button>
        <button onClick={skip} className="peng-btn peng-btn-ghost px-3 py-1 text-xs" title="skip" data-testid="audio-skip-button">⏭</button>
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
          data-testid="audio-volume-slider"
        />
        <button
          onClick={() => setCleanMode((c) => !c)}
          className="peng-btn peng-btn-ghost px-2 py-1 text-xs opacity-50 hover:opacity-100"
          title={cleanMode ? "expand" : "clean"}
          data-testid="audio-clean-mode-button"
        >
          {cleanMode ? "▲" : "CLEAN"}
        </button>
      </div>
      <audio ref={audioRef} onEnded={onEnded} preload="none" crossOrigin="anonymous" />
    </div>
  );
}
