import {
  X, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, VolumeX,
} from "lucide-react";
import VinylDisc from "./VinylDisc";
import type { Music } from "../data/mockData";
import type { PlayerState } from "../hooks/usePlayer";

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  state: PlayerState;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (pct: number) => void;
  onVolume: (v: number) => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onSelectTrack: (music: Music, index: number) => void;
};

export default function AlbumPlayer({
  state,
  onClose, onTogglePlay, onNext, onPrev, onSeek, onVolume,
  onShuffle, onRepeat, onSelectTrack,
}: Props) {
  const { music, track, trackIndex, isPlaying, progress, elapsed, duration, volume, shuffle, repeat } = state;
  if (!music) return null;

  const coverImage = track?.coverUrl || music.coverUrl;
  const effectiveDuration = duration || track?.durationSec || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative glass-strong rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden animate-scale-in">
        {/* Accent glows */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: music.accentColor }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: music.accentColor }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 glass-pill w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">

          {/* ── Left: vinyl + controls ──────────────────────────────────── */}
          <div className="flex flex-col items-center gap-5 p-6 lg:p-8 lg:w-[360px] flex-shrink-0">

            {/* Vinyl disc with cover art in center */}
            <div className="relative">
              {/* Glow behind vinyl */}
              <div
                className="absolute inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{ backgroundColor: music.accentColor }}
              />
              <VinylDisc
                isPlaying={isPlaying}
                labelColor={music.labelColor}
                coverImage={coverImage}
                size={264}
              />
            </div>

            {/* Track info */}
            <div className="text-center w-full">
              <div className="text-base font-semibold text-white/90 truncate leading-snug">
                {track?.title ?? music.title}
              </div>
              <div className="text-sm text-white/40 mt-0.5">{track?.artist ?? music.artist}</div>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-1.5">
              <div
                className="relative h-1 rounded-full cursor-pointer group/bar"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onSeek(((e.clientX - rect.left) / rect.width) * 100);
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: music.accentColor }}
                />
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, transform: "translateX(-50%) translateY(-50%)" }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/30">
                <span>{fmt(elapsed)}</span>
                <span>{effectiveDuration ? fmt(effectiveDuration) : (track?.duration ?? "--:--")}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-5">
              <button
                onClick={onShuffle}
                className={`transition-colors ${shuffle ? "text-white/80" : "text-white/25 hover:text-white/55"}`}
              >
                <Shuffle size={15} />
              </button>
              <button onClick={onPrev} className="text-white/55 hover:text-white/90 transition-colors">
                <SkipBack size={22} />
              </button>
              <button
                onClick={onTogglePlay}
                className="w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: music.accentColor, boxShadow: `0 8px 32px ${music.accentColor}60` }}
              >
                {isPlaying
                  ? <Pause size={22} fill="white" />
                  : <Play size={22} fill="white" className="ml-0.5" />}
              </button>
              <button onClick={onNext} className="text-white/55 hover:text-white/90 transition-colors">
                <SkipForward size={22} />
              </button>
              <button
                onClick={onRepeat}
                className={`transition-colors ${repeat !== "off" ? "text-white/80" : "text-white/25 hover:text-white/55"}`}
              >
                {repeat === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={() => onVolume(volume > 0 ? 0 : 0.8)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div
                className="flex-1 h-1 rounded-full cursor-pointer"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onVolume((e.clientX - rect.left) / rect.width);
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${volume * 100}%`, backgroundColor: "rgba(255,255,255,0.35)" }}
                />
              </div>
            </div>
          </div>

          {/* ── Right: track list ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-h-0 border-t lg:border-t-0 lg:border-l border-white/[0.06]">
            <div className="p-6 pb-3">
              <div className="text-lg font-bold text-white/85">{music.title}</div>
              <div className="text-sm text-white/35 mt-0.5">{music.artist}</div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-0.5">
              {music.tracks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTrack(music, i)}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
                    i === trackIndex
                      ? "bg-white/[0.07] border border-white/[0.08]"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Number / playing indicator */}
                  <div className="w-6 flex-shrink-0 text-center">
                    {i === trackIndex && isPlaying ? (
                      <div className="flex items-end justify-center gap-[2px] h-4">
                        {[0, 1, 2].map(b => (
                          <span
                            key={b}
                            className="w-[3px] rounded-full animate-vinyl"
                            style={{
                              height: `${8 + b * 4}px`,
                              backgroundColor: music.accentColor,
                              animationDuration: `${0.7 + b * 0.2}s`,
                              animationDelay: `${b * 0.1}s`,
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs font-mono ${
                        i === trackIndex ? "text-white/60" : "text-white/25 group-hover:text-white/50"
                      }`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Track art (if per-track cover differs) */}
                  {t.coverUrl && t.coverUrl !== music.coverUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                      <img src={t.coverUrl || undefined} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        i === trackIndex ? "text-white/90" : "text-white/60 group-hover:text-white/80"
                      }`}
                      style={i === trackIndex ? { color: music.accentColor } : {}}
                    >
                      {t.title}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5 truncate">{t.artist}</div>
                  </div>

                  <div className="text-xs font-mono text-white/25 flex-shrink-0">{t.duration}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
