import { useState, useCallback } from "react";
import { MUSIC_LIBRARY, ALBUM_LIBRARY } from "./data/mockData";
import type { Music } from "./data/mockData";
import { usePlayer } from "./hooks/usePlayer";
import { useLocalMusic } from "./hooks/useLocalMusic";
import ProfileHero from "./components/ProfileHero";
import MusicGrid, { AlbumGrid } from "./components/MusicGrid";
import AlbumPlayer from "./components/AlbumPlayer";
import MiniPlayer from "./components/MiniPlayer";
import AddMusicPanel from "./components/AddMusicPanel";
import PasswordModal from "./components/PasswordModal";
import { isAuthenticated, setAuthenticated as markAuth } from "./lib/adminAuth";

export default function App() {
  const player = usePlayer();
  const { state } = player;

  const lib = useLocalMusic(MUSIC_LIBRARY, ALBUM_LIBRARY);

  const [addingFor, setAddingFor]   = useState<"single" | "album" | null>(null);
  const [authGate,  setAuthGate]    = useState<"single" | "album" | null>(null);
  const [isOwner,   setIsOwner]     = useState(() => isAuthenticated());

  const requestAdd = useCallback((type: "single" | "album") => {
    if (isAuthenticated()) setAddingFor(type);
    else setAuthGate(type);
  }, []);

  const handleMusicClick = useCallback((music: Music) => {
    player.selectTrack(music, 0);
  }, [player]);

  const handleAlbumClick = useCallback((album: Music) => {
    player.openMusic(album);
  }, [player]);

  const handleReopen = useCallback(() => {
    if (!state.music) return;
    player.openMusic(state.music);
  }, [state.music, player]);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: "#09090b", color: "#fafafa" }}
    >
      {/* ── Animated gradient background (always visible, even without video) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, background: "#08060f" }}>
        {/* Large purple blob — top-left */}
        <div
          className="animate-bg-1 absolute rounded-full"
          style={{
            width: "90vw", height: "90vw",
            top: "-30%", left: "-20%",
            background: "radial-gradient(ellipse at center, rgba(130,50,220,0.55) 0%, rgba(90,25,160,0.28) 45%, transparent 70%)",
          }}
        />
        {/* Magenta blob — bottom-right */}
        <div
          className="animate-bg-2 absolute rounded-full"
          style={{
            width: "70vw", height: "70vw",
            bottom: "-20%", right: "-15%",
            background: "radial-gradient(ellipse at center, rgba(200,50,160,0.45) 0%, rgba(140,25,110,0.22) 50%, transparent 75%)",
          }}
        />
        {/* Blue-violet highlight — center */}
        <div
          className="animate-bg-3 absolute rounded-full"
          style={{
            width: "55vw", height: "55vw",
            top: "20%", left: "28%",
            background: "radial-gradient(ellipse at center, rgba(90,70,240,0.30) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* ── Video background (loads on top of gradient when available) ── */}
      <video
        autoPlay muted loop playsInline
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <source src="https://kumakiryu.github.io/musics-formikaelson/assets/iwxsbg.mp4" type="video/mp4" />
      </video>

      {/* Dark scrim for readability */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.75) 100%)" }}
      />

      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8"
        style={{ zIndex: 1, paddingBottom: state.music ? "100px" : undefined }}
      >
        <ProfileHero singlesCount={lib.singles.length} albumsCount={lib.albums.length} />

        <MusicGrid
          music={lib.singles}
          onMusicClick={handleMusicClick}
          onAddClick={() => requestAdd("single")}
          onRemove={isOwner ? id => lib.removeSingle(id) : undefined}
          removableIds={isOwner ? lib.userSingleIds : undefined}
        />

        <AlbumGrid
          albums={lib.albums}
          onAlbumClick={handleAlbumClick}
          onAddClick={() => requestAdd("album")}
          onRemove={isOwner ? id => lib.removeAlbum(id) : undefined}
          removableIds={isOwner ? lib.userAlbumIds : undefined}
        />
      </div>

      {/* Player modal */}
      {state.isOpen && (
        <AlbumPlayer
          state={state}
          onClose={player.closePlayer}
          onTogglePlay={player.togglePlay}
          onNext={player.nextTrack}
          onPrev={player.prevTrack}
          onSeek={player.seek}
          onVolume={player.setVolume}
          onShuffle={player.toggleShuffle}
          onRepeat={player.cycleRepeat}
          onSelectTrack={player.selectTrack}
        />
      )}

      {/* Mini player */}
      {state.music && !state.isOpen && (
        <MiniPlayer
          state={state}
          onTogglePlay={player.togglePlay}
          onNext={player.nextTrack}
          onOpenPlayer={handleReopen}
        />
      )}

      {/* Password gate */}
      {authGate && (
        <PasswordModal
          onSuccess={() => { markAuth(); setIsOwner(true); setAuthGate(null); setAddingFor(authGate); }}
          onClose={() => setAuthGate(null)}
        />
      )}

      {/* Add music panel */}
      {addingFor && (
        <AddMusicPanel
          onClose={() => setAddingFor(null)}
          onAddSingle={m => { lib.addSingle(m); setAddingFor(null); }}
          onAddAlbum={m  => { lib.addAlbum(m);  setAddingFor(null); }}
        />
      )}
    </div>
  );
}
