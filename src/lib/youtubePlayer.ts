// YouTube IFrame Player API wrapper.
// Runs a hidden 320x180 iframe off-screen so the vinyl UI stays front-and-center.

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTCbs = {
  onStateChange?: (playing: boolean) => void;
  onTime?: (current: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (msg: string) => void;
};

// YouTube player state numbers
const ST_PLAYING = 1;
const ST_PAUSED  = 2;
const ST_ENDED   = 0;

class YouTubePlayerManager {
  private player: any = null;
  private apiReady = false;
  private cbs: YTCbs = {};
  private pollId: ReturnType<typeof setInterval> | null = null;
  private pendingId: string | null = null;
  private pendingAutoplay = false;
  private readonly containerId = "yt-hidden-player";

  constructor() {
    if (typeof window === "undefined") return;
    this._ensureContainer();
    this._loadAPI();
  }

  private _ensureContainer() {
    if (document.getElementById(this.containerId)) return;
    const el = document.createElement("div");
    el.id = this.containerId;
    // Off-screen but rendered (hidden iframes lose audio in some browsers)
    el.style.cssText = [
      "position:fixed", "left:-400px", "top:-400px",
      "width:320px", "height:180px",
      "opacity:0", "pointer-events:none", "z-index:-1",
    ].join(";");
    document.body.appendChild(el);
  }

  private _loadAPI() {
    if (window.YT?.Player) { this._onAPIReady(); return; }
    if (document.getElementById("yt-api-script")) {
      // Script already injected, wait for the global callback
      window.onYouTubeIframeAPIReady = () => this._onAPIReady();
      return;
    }
    const script = document.createElement("script");
    script.id = "yt-api-script";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
    window.onYouTubeIframeAPIReady = () => this._onAPIReady();
  }

  private _onAPIReady() {
    this.apiReady = true;
    this._createPlayer();
  }

  private _createPlayer(initialId = "dQw4w9WgXcQ") {
    this.player = new window.YT.Player(this.containerId, {
      width: "320", height: "180",
      videoId: initialId,
      playerVars: {
        autoplay: 0, controls: 0, disablekb: 1,
        fs: 0, rel: 0, modestbranding: 1, iv_load_policy: 3,
      },
      events: {
        onReady: () => {
          if (this.pendingId) {
            this._doLoad(this.pendingId, this.pendingAutoplay);
            this.pendingId = null;
          }
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === ST_PLAYING) {
            this.cbs.onStateChange?.(true);
            this._startPoll();
          } else if (e.data === ST_PAUSED) {
            this.cbs.onStateChange?.(false);
            this._stopPoll();
          } else if (e.data === ST_ENDED) {
            this._stopPoll();
            this.cbs.onEnded?.();
            this.cbs.onStateChange?.(false);
          }
        },
        onError: () => this.cbs.onError?.("YouTube playback error — check the video ID or try another URL."),
      },
    });
  }

  private _doLoad(videoId: string, autoplay: boolean) {
    if (autoplay) this.player?.loadVideoById?.(videoId);
    else          this.player?.cueVideoById?.(videoId);
  }

  private _startPoll() {
    this._stopPoll();
    this.pollId = setInterval(() => {
      if (!this.player) return;
      const current  = this.player.getCurrentTime?.() ?? 0;
      const duration = this.player.getDuration?.()    ?? 0;
      if (duration > 0) this.cbs.onTime?.(current, duration);
    }, 500);
  }

  private _stopPoll() {
    if (this.pollId !== null) { clearInterval(this.pollId); this.pollId = null; }
  }

  on(cbs: YTCbs) { this.cbs = cbs; }

  loadVideoId(videoId: string) {
    if (!this.apiReady || !this.player?.loadVideoById) {
      this.pendingId = videoId; this.pendingAutoplay = true;
    } else {
      this._doLoad(videoId, true);
    }
  }

  cueVideoId(videoId: string) {
    if (!this.apiReady || !this.player?.cueVideoById) {
      this.pendingId = videoId; this.pendingAutoplay = false;
    } else {
      this._doLoad(videoId, false);
    }
  }

  play()             { this.player?.playVideo?.(); }
  pause()            { this.player?.pauseVideo?.(); }
  seekTo(s: number)  { this.player?.seekTo?.(s, true); }
  setVolume(v: number) { this.player?.setVolume?.(Math.round(v * 100)); }

  stop() {
    this._stopPoll();
    this.player?.stopVideo?.();
  }
}

export const youtubePlayer = new YouTubePlayerManager();

// Extract YouTube video ID from any common URL format or bare ID
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Already a bare 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
