// @refresh reset
import { useState, useEffect, useRef, useCallback } from "react";
import type { Music, Track } from "../data/mockData";
import { audioPlayer } from "../lib/audioPlayer";

export type RepeatMode = "off" | "all" | "one";

export type PlayerState = {
  music: Music | null;
  track: Track | null;
  trackIndex: number;
  isPlaying: boolean;
  progress: number;
  elapsed: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isOpen: boolean;
  autoplayBlocked: boolean;
};

const INITIAL: PlayerState = {
  music: null, track: null, trackIndex: 0,
  isPlaying: false, progress: 0, elapsed: 0, duration: 0,
  volume: 0.8, shuffle: false, repeat: "off",
  isOpen: false, autoplayBlocked: false,
};

export function usePlayer() {
  const [state, setState] = useState<PlayerState>(INITIAL);

  // Always-current state ref — lets callbacks read current state without stale closures
  const stateRef = useRef<PlayerState>(INITIAL);

  function patch(changes: Partial<PlayerState>) {
    stateRef.current = { ...stateRef.current, ...changes };
    setState(stateRef.current);
  }

  // ── Simulated playback ────────────────────────────────────────────────────
  const simId = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  function stopSim() {
    if (simId.current !== null) { clearInterval(simId.current); simId.current = null; }
  }

  function startSim(duration: number) {
    stopSim();
    if (duration <= 0) return;
    simId.current = setInterval(() => {
      elapsedRef.current = Math.min(elapsedRef.current + 0.5, duration);
      const pct = (elapsedRef.current / duration) * 100;
      if (elapsedRef.current >= duration) {
        stopSim();
        patch({ isPlaying: false, progress: 100, elapsed: duration });
      } else {
        patch({ elapsed: elapsedRef.current, progress: pct });
      }
    }, 500);
  }

  // ── Load a track (side effects only, no setState) ─────────────────────────
  function doLoad(track: Track, autoplay: boolean) {
    stopSim();
    elapsedRef.current = 0;
    if (track.audioUrl) {
      if (autoplay) audioPlayer.loadUrl(track.audioUrl);
      else audioPlayer.cueUrl(track.audioUrl);
    } else if (autoplay) {
      startSim(track.durationSec);
    }
  }

  // ── Register audioPlayer callbacks once on mount ──────────────────────────
  useEffect(() => {
    audioPlayer.on({
      onTime(current, duration) {
        patch({
          elapsed: current,
          duration,
          progress: duration > 0 ? Math.min((current / duration) * 100, 100) : 0,
        });
      },
      onEnded() {
        const s = stateRef.current;
        if (!s.music) { patch({ isPlaying: false }); return; }

        if (s.repeat === "one") {
          doLoad(s.track!, true);
          patch({ progress: 0, elapsed: 0 });
          return;
        }

        const nextIdx = (s.trackIndex + 1) % s.music.tracks.length;
        if (nextIdx === 0 && s.repeat === "off") {
          patch({ isPlaying: false, progress: 0, elapsed: 0 });
          return;
        }

        const next = s.music.tracks[nextIdx];
        doLoad(next, true);
        patch({
          track: next,
          trackIndex: nextIdx,
          isPlaying: !!next.audioUrl,
          progress: 0,
          elapsed: 0,
          duration: next.durationSec || 0,
        });
        if (!next.audioUrl) startSim(next.durationSec);
      },
      onStateChange(playing) {
        patch({ isPlaying: playing, autoplayBlocked: false });
      },
      onError(msg) {
        console.warn("[audioPlayer]", msg);
        patch({ isPlaying: false, autoplayBlocked: true });
      },
    });

    return () => { stopSim(); audioPlayer.cleanup(); };
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  // Open modal. If already playing this music, just show the modal.
  const openMusic = useCallback((music: Music) => {
    const s = stateRef.current;
    if (s.music?.id === music.id) {
      patch({ isOpen: true });
      return;
    }
    const track = music.tracks[0] ?? null;
    doLoad(track!, false);
    patch({
      music, track, trackIndex: 0,
      isPlaying: false, progress: 0, elapsed: 0,
      duration: track?.durationSec ?? 0,
      isOpen: true, autoplayBlocked: false,
    });
  }, []);

  const closePlayer = useCallback(() => {
    patch({ isOpen: false });
  }, []);

  const togglePlay = useCallback(() => {
    const s = stateRef.current;
    if (s.track?.audioUrl) {
      if (s.isPlaying) audioPlayer.pause();
      else audioPlayer.playOrLoad(s.track.audioUrl);
      // isPlaying updated via onStateChange callback
    } else {
      // Sim mode
      if (s.isPlaying) { stopSim(); patch({ isPlaying: false }); }
      else { startSim(s.track?.durationSec ?? 0); patch({ isPlaying: true }); }
    }
  }, []);

  const selectTrack = useCallback((music: Music, index: number) => {
    const track = music.tracks[index];
    doLoad(track, true);
    patch({
      music, track, trackIndex: index,
      isPlaying: !!track.audioUrl,
      progress: 0, elapsed: 0,
      duration: track.durationSec || 0,
      autoplayBlocked: false,
    });
    if (!track.audioUrl) startSim(track.durationSec);
  }, []);

  const nextTrack = useCallback(() => {
    const s = stateRef.current;
    if (!s.music) return;
    const nextIdx = (s.trackIndex + 1) % s.music.tracks.length;
    const track = s.music.tracks[nextIdx];
    doLoad(track, s.isPlaying);
    patch({
      track, trackIndex: nextIdx,
      progress: 0, elapsed: 0,
      duration: track.durationSec || 0,
      isPlaying: s.isPlaying && !!track.audioUrl,
    });
    if (!track.audioUrl && s.isPlaying) startSim(track.durationSec);
  }, []);

  const prevTrack = useCallback(() => {
    const s = stateRef.current;
    if (!s.music) return;
    if (s.elapsed > 3) {
      elapsedRef.current = 0;
      if (s.track?.audioUrl) audioPlayer.seekTo(0);
      else { stopSim(); if (s.isPlaying) startSim(s.track!.durationSec); }
      patch({ progress: 0, elapsed: 0 });
      return;
    }
    const prevIdx = (s.trackIndex - 1 + s.music.tracks.length) % s.music.tracks.length;
    const track = s.music.tracks[prevIdx];
    doLoad(track, s.isPlaying);
    patch({
      track, trackIndex: prevIdx,
      progress: 0, elapsed: 0,
      duration: track.durationSec || 0,
      isPlaying: s.isPlaying && !!track.audioUrl,
    });
    if (!track.audioUrl && s.isPlaying) startSim(track.durationSec);
  }, []);

  const seek = useCallback((pct: number) => {
    const s = stateRef.current;
    const dur = s.duration || s.track?.durationSec || 0;
    const newElapsed = (pct / 100) * dur;
    elapsedRef.current = newElapsed;
    if (s.track?.audioUrl) audioPlayer.seekTo(newElapsed);
    patch({ progress: pct, elapsed: newElapsed });
  }, []);

  const setVolume = useCallback((v: number) => {
    audioPlayer.setVolume(v);
    patch({ volume: v });
  }, []);

  const toggleShuffle = useCallback(() => {
    patch({ shuffle: !stateRef.current.shuffle });
  }, []);

  const cycleRepeat = useCallback(() => {
    const next: RepeatMode =
      stateRef.current.repeat === "off" ? "all" :
      stateRef.current.repeat === "all" ? "one" : "off";
    patch({ repeat: next });
  }, []);

  return { state, openMusic, closePlayer, togglePlay, selectTrack, nextTrack, prevTrack, seek, setVolume, toggleShuffle, cycleRepeat };
}
