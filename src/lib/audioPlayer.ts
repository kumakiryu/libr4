// Unified audio engine: auto-detects YouTube URLs and delegates to the IFrame
// API; falls back to HTML5 Audio for direct MP3/CDN links.

import { youtubePlayer, extractYouTubeId } from "./youtubePlayer";

function normalizeMediaUrl(url: string) {
  // Pasted links are often copied with Markdown emphasis or quote characters.
  return url.trim().replace(/^["'`*]+|["'`*]+$/g, "");
}

type Cbs = {
  onTime?: (current: number, duration: number) => void;
  onEnded?: () => void;
  onStateChange?: (playing: boolean) => void;
  onAutoplayBlocked?: () => void;
  onError?: (msg: string) => void;
};

class AudioPlayerManager {
  private el: HTMLAudioElement | null = null;
  private cbs: Cbs = {};
  private _volume = 0.8;
  private _mode: "audio" | "youtube" = "audio";

  on(cbs: Cbs) {
    this.cbs = cbs;
    // Mirror callbacks into the YouTube player
    youtubePlayer.on({
      onTime:        (c, d) => this._mode === "youtube" && this.cbs.onTime?.(c, d),
      onStateChange: (p)    => this._mode === "youtube" && this.cbs.onStateChange?.(p),
      onEnded:       ()     => this._mode === "youtube" && this.cbs.onEnded?.(),
      onError:       (m)    => this._mode === "youtube" && this.cbs.onError?.(m),
    });
  }

  private _makeAudio(url: string): HTMLAudioElement {
    const a = new Audio();
    // No crossOrigin — many CDNs reject CORS preflight for audio
    a.preload = "auto";
    a.volume  = this._volume;
    a.addEventListener("timeupdate", () =>
      this.cbs.onTime?.(a.currentTime, isFinite(a.duration) ? a.duration : 0));
    a.addEventListener("ended", () => {
      this.cbs.onEnded?.();
      this.cbs.onStateChange?.(false);
    });
    a.addEventListener("play",  () => this.cbs.onStateChange?.(true));
    a.addEventListener("pause", () => this.cbs.onStateChange?.(false));
    a.addEventListener("error", () => {
      this.cbs.onError?.("Failed to load audio. Check the URL and CORS headers.");
      this.cbs.onStateChange?.(false);
    });
    a.src = url;
    return a;
  }

  private _stopAudio() {
    if (this.el) {
      this.el.pause();
      this.el = null;
    }
  }

  private _stopYouTube() {
    youtubePlayer.stop();
  }

  private _playAudio() {
    if (!this.el) return;
    this.el.play().catch((error: DOMException) => {
      this.cbs.onStateChange?.(false);
      if (error.name === "NotAllowedError") {
        this.cbs.onAutoplayBlocked?.();
      } else {
        this.cbs.onError?.("Audio playback failed. Check the audio URL and try again.");
      }
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  loadUrl(url: string) {
    url = normalizeMediaUrl(url);
    const ytId = extractYouTubeId(url);
    if (ytId) {
      this._stopAudio();
      this._mode = "youtube";
      youtubePlayer.loadVideoId(ytId);
    } else {
      this._stopYouTube();
      this._stopAudio();
      this._mode = "audio";
      this.el = this._makeAudio(url);
      this._playAudio();
    }
  }

  cueUrl(url: string) {
    url = normalizeMediaUrl(url);
    const ytId = extractYouTubeId(url);
    if (ytId) {
      this._stopAudio();
      this._mode = "youtube";
      youtubePlayer.cueVideoId(ytId);
    } else {
      this._stopYouTube();
      this._stopAudio();
      this._mode = "audio";
      this.el = this._makeAudio(url);
      // Do not call play()
    }
  }

  playOrLoad(url: string) {
    url = normalizeMediaUrl(url);
    if (this._mode === "youtube") {
      youtubePlayer.play();
    } else if (this.el) {
      this._playAudio();
    } else {
      this.loadUrl(url);
    }
  }

  play() {
    if (this._mode === "youtube") youtubePlayer.play();
    else this._playAudio();
  }

  pause() {
    if (this._mode === "youtube") youtubePlayer.pause();
    else this.el?.pause();
  }

  seekTo(s: number) {
    if (this._mode === "youtube") youtubePlayer.seekTo(s);
    else if (this.el) this.el.currentTime = s;
  }

  setVolume(v: number) {
    this._volume = Math.min(1, Math.max(0, v));
    if (this._mode === "youtube") youtubePlayer.setVolume(this._volume);
    else if (this.el) this.el.volume = this._volume;
  }

  cleanup() {
    this._stopAudio();
    this._stopYouTube();
    this._mode = "audio";
  }
}

export const audioPlayer = new AudioPlayerManager();
