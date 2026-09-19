import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export type DiscordUser = {
  id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  discriminator: string;
};

export type Activity = {
  id: string;
  name: string;
  /** 0=Game 1=Streaming 2=Listening 3=Watching 4=Custom 5=Competing */
  type: 0 | 1 | 2 | 3 | 4 | 5;
  state?: string;
  details?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  timestamps?: { start?: number; end?: number };
};

export type SpotifyData = {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: { start: number; end: number };
};

export type LanyardData = {
  discord_user: DiscordUser;
  discord_status: DiscordStatus;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  listening_to_spotify: boolean;
  activities: Activity[];
  spotify: SpotifyData | null;
  kv: Record<string, string>;
};

type HookResult = {
  data: LanyardData | null;
  loading: boolean;
  connected: boolean;
  error: string | null;
};

// ── Avatar helper ─────────────────────────────────────────────────────────────
export function discordAvatarUrl(user: DiscordUser, size = 128): string {
  if (!user.avatar) {
    const idx = Number(user.discriminator) === 0
      ? (Number(user.id) >> 22) % 6
      : Number(user.discriminator) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}

// ── Spotify progress helper ───────────────────────────────────────────────────
export function spotifyProgress(sp: SpotifyData): { elapsed: number; duration: number; pct: number } {
  const now = Date.now();
  const elapsed = Math.max(0, (now - sp.timestamps.start) / 1000);
  const duration = Math.max(1, (sp.timestamps.end - sp.timestamps.start) / 1000);
  return { elapsed, duration, pct: Math.min(100, (elapsed / duration) * 100) };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const PLACEHOLDER: LanyardData = {
  discord_user: {
    id: "0",
    username: "LIBR4xx",
    display_name: "LIBR4",
    avatar: null,
    discriminator: "0",
  },
  discord_status: "offline",
  active_on_discord_desktop: false,
  active_on_discord_mobile: false,
  listening_to_spotify: false,
  activities: [],
  spotify: null,
  kv: {},
};

// ← Paste your Discord User ID here (right-click yourself → Copy User ID)
const DISCORD_USER_ID = "712662013649879062";

export function useDiscord(): HookResult {
  const userId =
    DISCORD_USER_ID ||
    (import.meta.env.VITE_DISCORD_USER_ID as string) ||
    "";

  const [result, setResult] = useState<HookResult>({
    data: null,
    loading: true,
    connected: false,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    if (!userId) {
      // No user ID configured — show placeholder after brief delay
      const t = setTimeout(() => {
        if (!unmountedRef.current) {
          setResult({ data: PLACEHOLDER, loading: false, connected: false, error: null });
        }
      }, 600);
      return () => { unmountedRef.current = true; clearTimeout(t); };
    }

    let attempt = 0;

    function connect() {
      if (unmountedRef.current) return;

      const ws = new WebSocket("wss://api.lanyard.rest/socket");
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        if (unmountedRef.current) return;
        let msg: any;
        try { msg = JSON.parse(ev.data as string); } catch { return; }

        switch (msg.op) {
          case 1: // Hello — start heartbeat + subscribe
            hbRef.current = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
            }, msg.d.heartbeat_interval);

            ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
            break;

          case 0: // Event
            if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
              attempt = 0;
              setResult({ data: msg.d as LanyardData, loading: false, connected: true, error: null });
            }
            break;
        }
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        if (hbRef.current) { clearInterval(hbRef.current); hbRef.current = null; }
        setResult(prev => ({ ...prev, connected: false }));
        // Exponential back-off: 2s, 4s, 8s … capped at 30s
        const delay = Math.min(2000 * 2 ** attempt, 30_000);
        attempt++;
        reconnectRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        if (unmountedRef.current) return;
        setResult(prev => ({ ...prev, error: "WebSocket error — retrying…" }));
        ws.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (hbRef.current) clearInterval(hbRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [userId]);

  return result;
}
