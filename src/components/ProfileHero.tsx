import { useState, useEffect } from "react";
import { Code2, MessageCircle, Play, AtSign, Globe, Eye, Clock, Disc3, Library } from "lucide-react";
import { useDiscord, discordAvatarUrl, spotifyProgress } from "../hooks/useDiscord";
import { useClock } from "../hooks/useClock";
import { useVisitors } from "../hooks/useVisitors";

const SOCIALS = [
  { icon: Play, label: "YouTube", href: "https://youtube.com/@LIBR4xx" },
  { icon: AtSign, label: "Tiktok", href: "https://x.com" },
  { icon: Globe, label: "Website", href: "https://libr4.xyz" },
];

const STATUS_COLOR: Record<string, string> = {
  online: "#22c55e",
  idle: "#f59e0b",
  dnd: "#ef4444",
  offline: "#6b7280",
};

const STATUS_LABEL: Record<string, string> = {
  online: "Online",
  idle: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

type Props = { singlesCount?: number; albumsCount?: number };

export default function ProfileHero({ singlesCount = 0, albumsCount = 0 }: Props) {
  const { data: discord, loading, connected } = useDiscord();
  const { time, offset } = useClock();
  const visitors = useVisitors();
  const [spotifyPct, setSpotifyPct] = useState(0);

  // Animate Spotify progress bar
  useEffect(() => {
    if (!discord?.spotify) return;
    const tick = () => {
      const { pct } = spotifyProgress(discord.spotify!);
      setSpotifyPct(pct);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [discord?.spotify?.track_id]);

  const user = discord?.discord_user;
  const status = discord?.discord_status ?? "offline";
  const avatarUrl = user && user.id !== "0" ? discordAvatarUrl(user, 256) : null;
  const displayName = user?.display_name || user?.username || "LIBR4";

  // Pick the most interesting activity (skip Spotify type=2, custom status type=4)
  const activity = discord?.activities?.find(a => a.type === 0 || a.type === 1 || a.type === 3);

  return (
    <div className="glass rounded-3xl p-6 lg:p-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-start">

        {/* ── Left: social links + music counts ─────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-medium uppercase tracking-widest text-white/25 mb-2">
            Socials
          </div>
          {SOCIALS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="glass-pill rounded-xl px-3 py-2 flex items-center gap-2.5 text-xs text-white/50 hover:text-white/80 w-fit"
            >
              <Icon size={13} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
          ))}

          {/* Singles & Albums counts */}
          <div className="mt-4 glass rounded-2xl px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-white/30">
                <Disc3 size={11} />
                <span className="text-[10px] uppercase tracking-widest font-medium">Singles</span>
              </div>
              <span className="text-lg font-semibold text-white/80 tabular-nums">{singlesCount}</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-white/30">
                <Library size={11} />
                <span className="text-[10px] uppercase tracking-widest font-medium">Albums</span>
              </div>
              <span className="text-lg font-semibold text-white/80 tabular-nums">{albumsCount}</span>
            </div>
          </div>
        </div>

        {/* ── Center: avatar + identity + live presence ──────────────── */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Avatar */}
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, rgba(37,99,235,0.2) 50%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            <div
              className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full p-[2px]"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)" }}
            >
              <div className="w-full h-full rounded-full overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl lg:text-5xl font-bold text-white/90 select-none"
                    style={{ background: "linear-gradient(135deg, #4c1d95 0%, #1e3a8a 60%, #064e3b 100%)" }}
                  >
                    L4
                  </div>
                )}
              </div>
            </div>
            {/* Status dot */}
            <div
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
              style={{ backgroundColor: STATUS_COLOR[status], borderColor: "#09090b" }}
            />
          </div>

          {/* Name + handle */}
          <div>
            <div className="text-xl font-bold text-white/90 tracking-tight">{displayName}</div>
            <div className="text-xs font-mono text-white/35 mt-0.5">@{user?.username ?? "LIBR4xx"}</div>
          </div>

          {/* Discord status pill */}
          {loading ? (
            <div className="glass-pill rounded-full px-3 py-1.5 text-[11px] text-white/25 animate-pulse">
              Connecting to Discord…
            </div>
          ) : (
            <div className="glass-pill rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] text-white/50">
              <span
                className="w-1.5 h-1.5 rounded-full animate-status-pulse"
                style={{ backgroundColor: STATUS_COLOR[status] }}
              />
              {STATUS_LABEL[status]}
              {!connected && (
                <span className="text-white/25 ml-1">· not connected</span>
              )}
            </div>
          )}

          {/* Custom status (type 4 activity) — emoji intentionally omitted */}
          {(() => {
            const custom = discord?.activities?.find(a => a.type === 4);
            if (!custom?.state) return null;
            return (
              <div className="text-xs text-white/35 italic">
                {custom.state}
              </div>
            );
          })()}

          {/* Bio */}
          <p className="text-sm text-white/40 leading-relaxed max-w-xs italic">
            for the ones who feel too much.
          </p>

          {/* ── Other game/app activity ─────────────────────────────── */}
          {activity && (
            <div className="glass rounded-2xl px-4 py-3 w-full max-w-xs text-left mt-1">
              <div className="text-[10px] uppercase tracking-widest text-white/25 mb-1 font-medium">
                {activity.type === 0 ? "Playing" : activity.type === 1 ? "Streaming" : "Watching"}
              </div>
              <div className="text-sm font-medium text-white/70 truncate">{activity.name}</div>
              {activity.details && (
                <div className="text-xs text-white/35 truncate mt-0.5">{activity.details}</div>
              )}
              {activity.state && (
                <div className="text-xs text-white/25 truncate">{activity.state}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: stats ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Visitor count — live */}
          <div className="glass rounded-2xl px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <Eye size={11} className="text-white/30" />
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Visitors</span>
            </div>
            <div className="text-xl font-semibold text-white/85 tabular-nums">
              {visitors == null ? (
                <span className="text-white/20 animate-pulse">—</span>
              ) : (
                visitors.toLocaleString()
              )}
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-status-pulse" />
              <span className="text-[9px] text-white/20">live</span>
            </div>
          </div>

          {/* Clock */}
          <div className="glass rounded-2xl px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <Clock size={11} className="text-white/30" />
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Local Time</span>
            </div>
            <div className="text-xl font-semibold text-white/85 tabular-nums">{time}</div>
            <div className="text-[10px] font-mono text-white/25 mt-0.5">{offset}</div>
          </div>

          {/* Platform badges */}
          {(discord?.active_on_discord_desktop || discord?.active_on_discord_mobile) && (
            <div className="glass rounded-2xl px-4 py-3 text-right">
              <div className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-2">Active on</div>
              <div className="flex gap-1.5 justify-end">
                {discord.active_on_discord_desktop && (
                  <span className="glass-pill rounded-lg px-2 py-1 text-[10px] text-white/40">Desktop</span>
                )}
                {discord.active_on_discord_mobile && (
                  <span className="glass-pill rounded-lg px-2 py-1 text-[10px] text-white/40">Mobile</span>
                )}
              </div>
            </div>
          )}

          {/* Spotify live card */}
          {discord?.listening_to_spotify && discord.spotify && (
            <div className="glass rounded-2xl p-3">
              <div className="text-[10px] uppercase tracking-widest text-white/25 mb-2.5 font-medium flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-green-400 flex-shrink-0">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span>Spotify</span>
              </div>
              <div className="flex items-center gap-2.5">
                <img
                  src={discord.spotify.album_art_url}
                  alt={discord.spotify.album}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white/80 truncate">{discord.spotify.song}</div>
                  <div className="text-[10px] text-white/40 truncate">{discord.spotify.artist}</div>
                  <div className="mt-1.5 h-[2px] rounded-full overflow-hidden bg-white/10">
                    <div
                      className="h-full rounded-full bg-green-400 transition-all duration-1000"
                      style={{ width: `${spotifyPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
