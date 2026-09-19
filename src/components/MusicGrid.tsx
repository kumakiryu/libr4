import { Play, Disc3, Library, Plus, Trash2 } from "lucide-react";
import type { Music } from "../data/mockData";

// ── Singles grid ──────────────────────────────────────────────────────────────

type SinglesProps = {
  music: Music[];
  onMusicClick: (music: Music) => void;
  onAddClick?: () => void;
  onRemove?: (id: string) => void;
  removableIds?: Set<string>;
  // backward compat
  albums?: Music[];
  onAlbumClick?: (music: Music) => void;
};

export default function MusicGrid({ music, albums, onMusicClick, onAlbumClick, onAddClick, onRemove, removableIds }: SinglesProps) {
  const items = music ?? albums ?? [];
  const handler = onMusicClick ?? onAlbumClick ?? (() => {});

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-5">
        <Disc3 size={15} className="text-white/30" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Singles</h2>
        <span className="text-[10px] text-white/20 font-mono ml-1">{items.length}</span>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-white/40 hover:text-white/70 glass-pill transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-sm text-white/20">No singles yet</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <MusicCard
              key={item.id}
              music={item}
              onClick={() => handler(item)}
              delay={i * 55}
              showTrackCount={false}
              onRemove={removableIds?.has(item.id) ? () => onRemove?.(item.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Albums grid ───────────────────────────────────────────────────────────────

type AlbumsProps = {
  albums: Music[];
  onAlbumClick: (album: Music) => void;
  onAddClick?: () => void;
  onRemove?: (id: string) => void;
  removableIds?: Set<string>;
};

export function AlbumGrid({ albums, onAlbumClick, onAddClick, onRemove, removableIds }: AlbumsProps) {
  return (
    <section>
      <div className="h-px bg-white/[0.05] mb-8" />

      <div className="flex items-center gap-2.5 mb-5">
        <Library size={15} className="text-white/30" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Albums</h2>
        <span className="text-[10px] text-white/20 font-mono ml-1">{albums.length}</span>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] text-white/40 hover:text-white/70 glass-pill transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="py-10 text-center text-sm text-white/20">No albums yet — click Add to create one</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album, i) => (
            <AlbumRow
              key={album.id}
              album={album}
              onClick={() => onAlbumClick(album)}
              delay={i * 70}
              onRemove={removableIds?.has(album.id) ? () => onRemove?.(album.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Shared card component ─────────────────────────────────────────────────────

function MusicCard({
  music, onClick, delay, showTrackCount, onRemove,
}: {
  music: Music; onClick: () => void; delay: number; showTrackCount: boolean; onRemove?: () => void;
}) {
  return (
    <div
      className="group glass glass-card-hover rounded-2xl overflow-hidden text-left animate-fade-in-up relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Delete button — only rendered for user-added tracks */}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(239,68,68,0.85)", backdropFilter: "blur(4px)" }}
          title="Remove"
        >
          <Trash2 size={12} className="text-white" />
        </button>
      )}

      <button onClick={onClick} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          <img
            src={music.coverUrl || undefined}
            alt={music.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: music.accentColor + "ee", backdropFilter: "blur(8px)" }}
            >
              <Play size={18} fill="white" className="text-white ml-0.5" />
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <div className="p-3.5">
          <div className="text-sm font-semibold text-white truncate leading-tight" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{music.title}</div>
          <div className="text-xs text-white/55 mt-0.5 truncate">{music.artist}</div>
          {showTrackCount && music.tracks.length > 1 && (
            <div className="text-[10px] text-white/30 mt-1.5 font-mono">{music.tracks.length} tracks</div>
          )}
        </div>
      </button>
    </div>
  );
}

// ── Album row card (horizontal layout, shows track list preview) ──────────────

function AlbumRow({ album, onClick, delay, onRemove }: { album: Music; onClick: () => void; delay: number; onRemove?: () => void }) {
  const preview = album.tracks.slice(0, 3);

  return (
    <div
      className="group glass glass-card-hover rounded-2xl overflow-hidden text-left animate-fade-in-up relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(239,68,68,0.85)", backdropFilter: "blur(4px)" }}
          title="Remove"
        >
          <Trash2 size={12} className="text-white" />
        </button>
      )}
      <button onClick={onClick} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
      <div className="flex gap-0">
        {/* Square artwork */}
        <div className="relative w-[120px] flex-shrink-0 overflow-hidden bg-zinc-900">
          <img
            src={album.coverUrl || undefined}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: album.accentColor + "dd" }}
            >
              <Play size={15} fill="white" className="ml-0.5" />
            </div>
          </div>
          {/* Accent left border */}
          <div
            className="absolute inset-y-0 right-0 w-[2px]"
            style={{ background: `linear-gradient(to bottom, transparent, ${album.accentColor}88, transparent)` }}
          />
        </div>

        {/* Info + track list */}
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-white truncate leading-tight" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{album.title}</div>
            <div className="text-xs text-white/55 mt-0.5 truncate">{album.artist}</div>
            <div className="text-[10px] text-white/35 mt-1 font-mono">{album.tracks.length} tracks</div>
          </div>

          {/* Track preview */}
          <div className="mt-3 space-y-1">
            {preview.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] font-mono text-white/20 w-3 flex-shrink-0 text-right">
                  {i + 1}
                </span>
                <span className="text-[11px] text-white/45 truncate flex-1">{t.title}</span>
                <span className="text-[9px] font-mono text-white/20 flex-shrink-0">{t.duration}</span>
              </div>
            ))}
            {album.tracks.length > 3 && (
              <div className="text-[10px] text-white/20 pl-5">
                +{album.tracks.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>
      </button>
    </div>
  );
}
