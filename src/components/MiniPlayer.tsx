import { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  ChevronUp,
  Volume2,
  VolumeX,
  ListMusic,
} from "lucide-react";
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
  onTogglePlay: () => void;
  onNext: () => void;
  onSeek: (pct: number) => void;
  onVolume: (volume: number) => void;
  musicLibrary: Music[];
  onSelectTrack: (music: Music, trackIndex: number) => void;
  onAddCustomTrack: (music: Music, trackIndex: number) => void;
  onOpenPlayer: () => void;
};

export default function MiniPlayer({
  state,
  onTogglePlay,
  onNext,
  onSeek,
  onVolume,
  musicLibrary,
  onSelectTrack,
  onAddCustomTrack,
  onOpenPlayer,
}: Props) {
  const [showMusic, setShowMusic] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const {
    music,
    track,
    isPlaying,
    progress,
    elapsed,
    volume,
    autoplayBlocked,
    playbackError,
  } = state;
  if (!music || !track) return null;

  const artSrc = track.coverUrl || music.coverUrl;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(520px,calc(100vw-2rem))] animate-slide-up">
      {showMusic && (
        <div className="glass-strong absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-y-auto rounded-2xl p-2 animate-scale-in">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Choose background music
          </div>
          <div className="mb-2 space-y-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="text-xs font-medium text-white/65">Custom background music</div>
            <input
              type="text"
              value={customTitle}
              onChange={event => setCustomTitle(event.target.value)}
              placeholder="Song title"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 outline-none placeholder:text-white/20 focus:border-white/25"
            />
            <input
              type="text"
              value={customArtist}
              onChange={event => setCustomArtist(event.target.value)}
              placeholder="Artist"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 outline-none placeholder:text-white/20 focus:border-white/25"
            />
            <input
              type="url"
              value={customUrl}
              onChange={event => setCustomUrl(event.target.value)}
              placeholder="YouTube or direct MP3 URL"
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 outline-none placeholder:text-white/20 focus:border-white/25"
            />
            <button
              disabled={!customUrl.trim()}
              onClick={() => {
                const title = customTitle.trim() || "Custom background";
                const artist = customArtist.trim() || "Unknown artist";
                const audioUrl = customUrl
                  .trim()
                  .replace(/^["'`*]+|["'`*]+$/g, "");
                const customMusic: Music = {
                  id: `custom-background-${Date.now()}`,
                  title,
                  artist,
                  coverUrl: music.coverUrl,
                  accentColor: music.accentColor,
                  labelColor: music.labelColor,
                  tracks: [{
                    id: `custom-track-${Date.now()}`,
                    title,
                    artist,
                    duration: "",
                    durationSec: 0,
                    audioUrl,
                  }],
                };
                onAddCustomTrack(customMusic, 0);
                setCustomTitle("");
                setCustomArtist("");
                setCustomUrl("");
                setShowMusic(false);
              }}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Save for everyone
            </button>
            <div className="text-[10px] leading-relaxed text-white/25">
              Admin password required. This becomes the default music for every visitor.
            </div>
          </div>
          {musicLibrary.flatMap(item =>
            item.tracks.map((itemTrack, index) => (
              <button
                key={`${item.id}-${itemTrack.id}`}
                onClick={() => {
                  onSelectTrack(item, index);
                  setShowMusic(false);
                }}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                  item.id === music.id && itemTrack.id === track.id
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/85"
                }`}
              >
                <span className="block truncate text-sm font-medium">{itemTrack.title}</span>
                <span className="block truncate text-xs text-white/30">{itemTrack.artist}</span>
              </button>
            )),
          )}
        </div>
      )}

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
            <div className="text-xs text-white/35 truncate">
              {playbackError
                ? "Could not play this URL"
                : autoplayBlocked
                  ? "Click play to enable sound"
                  : track.artist}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={e => onSeek(Number(e.target.value))}
              aria-label="Track progress"
              className="player-range mt-1.5 w-full"
              style={{ accentColor: music.accentColor }}
            />
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

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 w-24 flex-shrink-0">
            <button
              onClick={() => onVolume(volume > 0 ? 0 : 0.8)}
              className="text-white/30 hover:text-white/65 transition-colors"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={e => onVolume(Number(e.target.value))}
              aria-label="Volume"
              className="player-range min-w-0 flex-1"
            />
          </div>

          {/* Expand */}
          <button
            onClick={() => setShowMusic(value => !value)}
            className="text-white/25 hover:text-white/65 transition-colors flex-shrink-0"
            aria-label="Choose background music"
          >
            <ListMusic size={16} />
          </button>
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
