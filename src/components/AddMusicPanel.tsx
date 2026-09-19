import { useState } from "react";
import { X, Plus, Trash2, Music, Library, Check } from "lucide-react";
import type { Music as MusicType, Track } from "../data/mockData";
import { makeId, ACCENT_PRESETS } from "../hooks/useLocalMusic";

type Mode = "single" | "album";

type Props = {
  onClose: () => void;
  onAddSingle: (m: MusicType) => void;
  onAddAlbum:  (m: MusicType) => void;
};

const EMPTY_TRACK = (): Omit<Track, "id"> => ({
  title: "", artist: "", duration: "", durationSec: 0, audioUrl: "",
});

function parseDuration(s: string): number {
  const [m = "0", sec = "0"] = s.split(":");
  return parseInt(m) * 60 + parseInt(sec);
}

export default function AddMusicPanel({ onClose, onAddSingle, onAddAlbum }: Props) {
  const [mode, setMode] = useState<Mode>("single");
  const [done, setDone] = useState(false);

  // Shared fields
  const [title,    setTitle]    = useState("");
  const [artist,   setArtist]   = useState("LIBR4");
  const [coverUrl, setCoverUrl] = useState("");
  const [accentIdx, setAccentIdx] = useState(0);

  // Single-only
  const [audioUrl,  setAudioUrl]  = useState("");
  const [duration,  setDuration]  = useState("");

  // Album tracks
  const [tracks, setTracks] = useState([EMPTY_TRACK()]);

  const accent = ACCENT_PRESETS[accentIdx];

  const addTrackRow = () => setTracks(p => [...p, EMPTY_TRACK()]);
  const removeTrackRow = (i: number) => setTracks(p => p.filter((_, idx) => idx !== i));
  const updateTrack = (i: number, field: keyof ReturnType<typeof EMPTY_TRACK>, val: string) => {
    setTracks(p => p.map((t, idx) => idx !== i ? t : {
      ...t,
      [field]: val,
      ...(field === "duration" ? { durationSec: parseDuration(val) } : {}),
    }));
  };

  const valid = mode === "single"
    ? !!(title && audioUrl)
    : !!(title && tracks.some(t => t.audioUrl));

  const submit = () => {
    if (!valid) return;
    const base = {
      id: makeId(title),
      title,
      artist,
      coverUrl,
      accentColor: accent.accent,
      labelColor:  accent.label,
    };

    if (mode === "single") {
      onAddSingle({
        ...base,
        tracks: [{
          id: makeId(title) + "-1",
          title,
          artist,
          duration,
          durationSec: parseDuration(duration),
          audioUrl,
        }],
      });
    } else {
      onAddAlbum({
        ...base,
        tracks: tracks
          .filter(t => t.audioUrl)
          .map((t, i) => ({
            id: base.id + "-" + (i + 1),
            title:      t.title  || `Track ${i + 1}`,
            artist:     t.artist || artist,
            duration:   t.duration,
            durationSec: parseDuration(t.duration),
            audioUrl:   t.audioUrl,
          })),
      });
    }

    setDone(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      <div className="relative glass-strong rounded-3xl w-full max-w-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-white/80">Add Music</span>
          <button
            onClick={onClose}
            className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70"
          >
            <X size={14} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["single", "album"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={mode === m
                ? { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.15)" }
                : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
            >
              {m === "single" ? <Music size={12} /> : <Library size={12} />}
              {m === "single" ? "Single" : "Album"}
            </button>
          ))}
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-4 space-y-4">

          {/* Shared fields */}
          <Field label="Title" required>
            <Input value={title} onChange={setTitle} placeholder={mode === "single" ? "Song title" : "Album title"} />
          </Field>

          <Field label="Artist">
            <Input value={artist} onChange={setArtist} placeholder="LIBR4" />
          </Field>

          <Field label="Cover Image URL" hint="Square image — Unsplash, Imgur, etc.">
            <Input value={coverUrl} onChange={setCoverUrl} placeholder="https://..." />
          </Field>

          {/* Colour picker */}
          <Field label="Accent Colour">
            <div className="flex gap-2 flex-wrap">
              {ACCENT_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setAccentIdx(i)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: p.accent, outline: accentIdx === i ? `2px solid ${p.accent}` : "none", outlineOffset: 2 }}
                >
                  {accentIdx === i && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </Field>

          {mode === "single" ? (
            <>
              <Field label="Audio URL" required hint="Paste a YouTube link or a direct .mp3 URL">
                <Input value={audioUrl} onChange={setAudioUrl} placeholder="https://www.youtube.com/watch?v=... or .mp3" />
              </Field>
              <Field label="Duration" hint="Format: 3:42">
                <Input value={duration} onChange={setDuration} placeholder="3:42" className="w-24" />
              </Field>
            </>
          ) : (
            <Field label="Tracks" required>
              <div className="space-y-2">
                {tracks.map((t, i) => (
                  <div key={i} className="glass rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-white/30">Track {i + 1}</span>
                      {tracks.length > 1 && (
                        <button onClick={() => removeTrackRow(i)} className="text-white/20 hover:text-red-400/60 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <Input value={t.title}    onChange={v => updateTrack(i, "title", v)}    placeholder="Track title" />
                    <Input value={t.audioUrl} onChange={v => updateTrack(i, "audioUrl", v)} placeholder="YouTube link or .mp3 URL (required)" />
                    <div className="flex gap-2">
                      <Input value={t.artist}   onChange={v => updateTrack(i, "artist", v)}   placeholder={`Artist (default: ${artist})`} />
                      <Input value={t.duration} onChange={v => updateTrack(i, "duration", v)} placeholder="3:42" className="w-20 flex-shrink-0" />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTrackRow}
                  className="w-full py-2 rounded-xl border border-dashed border-white/15 text-xs text-white/30 hover:text-white/60 hover:border-white/25 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={12} /> Add Track
                </button>
              </div>
            </Field>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={submit}
            disabled={!valid || done}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: done ? "#22c55e" : accent.accent }}
          >
            {done ? <><Check size={15} /> Added!</> : `Add ${mode === "single" ? "Single" : "Album"}`}
          </button>
          <p className="text-[10px] text-white/20 text-center mt-2 leading-relaxed">
            Saved globally — visible to every visitor in real time.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] text-white/40 flex items-center gap-1">
        {label}
        {required && <span className="text-white/25">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-white/20">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-white/25 transition-colors ${className}`}
    />
  );
}
