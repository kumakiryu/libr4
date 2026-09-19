// Fetches user-added music from Supabase (shared across all visitors).
// Optimistic updates + localStorage cache for instant feel.

import { useState, useEffect, useCallback, useRef } from "react";
import type { Music } from "../data/mockData";
import * as api from "../lib/musicApi";

const CACHE_KEY = "libr4_music_cache_v2";

function loadCache(): { singles: Music[]; albums: Music[] } {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null") ?? { singles: [], albums: [] }; }
  catch { return { singles: [], albums: [] }; }
}

function saveCache(singles: Music[], albums: Music[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ singles, albums }));
}

export function useLocalMusic(baseSingles: Music[], baseAlbums: Music[]) {
  const cache = loadCache();
  const [userSingles, setUserSingles] = useState<Music[]>(cache.singles);
  const [userAlbums,  setUserAlbums]  = useState<Music[]>(cache.albums);
  const singlesRef = useRef(userSingles);
  const albumsRef  = useRef(userAlbums);
  singlesRef.current = userSingles;
  albumsRef.current  = userAlbums;

  useEffect(() => {
    api.fetchMusic().then(({ singles, albums }) => {
      setUserSingles(singles);
      setUserAlbums(albums);
      saveCache(singles, albums);
    }).catch(() => {/* use cached */});
  }, []);

  const addSingle = useCallback(async (entry: Music) => {
    const next = [...singlesRef.current.filter(m => m.id !== entry.id), entry];
    setUserSingles(next);
    saveCache(next, albumsRef.current);
    await api.addSingle(entry).catch(console.error);
  }, []);

  const addAlbum = useCallback(async (entry: Music) => {
    const next = [...albumsRef.current.filter(m => m.id !== entry.id), entry];
    setUserAlbums(next);
    saveCache(singlesRef.current, next);
    await api.addAlbum(entry).catch(console.error);
  }, []);

  const removeSingle = useCallback(async (id: string) => {
    const next = singlesRef.current.filter(m => m.id !== id);
    setUserSingles(next);
    saveCache(next, albumsRef.current);
    await api.removeSingle(id).catch(console.error);
  }, []);

  const removeAlbum = useCallback(async (id: string) => {
    const next = albumsRef.current.filter(m => m.id !== id);
    setUserAlbums(next);
    saveCache(singlesRef.current, next);
    await api.removeAlbum(id).catch(console.error);
  }, []);

  return {
    singles: [...baseSingles, ...userSingles],
    albums:  [...baseAlbums,  ...userAlbums],
    userSingleIds: new Set(userSingles.map(m => m.id)),
    userAlbumIds:  new Set(userAlbums.map(m => m.id)),
    addSingle,
    addAlbum,
    removeSingle,
    removeAlbum,
  };
}

export function makeId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);
}

export const ACCENT_PRESETS = [
  { accent: "#7c3aed", label: "#4c1d95" },
  { accent: "#db2777", label: "#831843" },
  { accent: "#2563eb", label: "#1e3a8a" },
  { accent: "#dc2626", label: "#7f1d1d" },
  { accent: "#059669", label: "#064e3b" },
  { accent: "#d97706", label: "#78350f" },
  { accent: "#0891b2", label: "#164e63" },
  { accent: "#9333ea", label: "#581c87" },
];
