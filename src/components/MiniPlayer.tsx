import { Play, Pause, SkipForward, ChevronUp } from "lucide-react";
import type { PlayerState } from "../hooks/usePlayer";

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  state: PlayerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpenPlayer: () => void;
};

export default function MiniPlayer({ state, onTogglePlay, onNext, onOpenPlayer }: Props) {
  const { music, track, isPlaying, progress, elapsed } = state;
  if (!music || !track) return null;

  const artSrc = track.coverUrl || music.coverUrl;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(520px,calc(100vw-2rem))] animate-slide-up">
      <div
        className="rounded-2xl border border-white/[0.1] overflow-hidden"
        style={{
          background: "rgba(18, 18, 20, 0.55)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Album art */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
            <img src={artSrc} alt={track.title} className="w-full h-full object-cover" />
          </div>

          {/* Info + progress */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white/85 truncate leading-tight">{track.title}</div>
            <div className="text-xs text-white/35 truncate">{track.artist}</div>
            <div className="mt-1.5 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: music.accentColor }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="hidden sm:block text-[10px] font-mono text-white/25 flex-shrink-0 tabular-nums">
            {fmt(elapsed)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: music.accentColor }}
            >
              {isPlaying
                ? <Pause size={14} fill="white" />
                : <Play size={14} fill="white" className="ml-0.5" />}
            </button>
            <button onClick={onNext} className="text-white/40 hover:text-white/70 transition-colors">
              <SkipForward size={16} />
            </button>
          </div>

          {/* Expand */}
          <button
            onClick={onOpenPlayer}
            className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
