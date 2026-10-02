import { projectId, publicAnonKey } from "../../utils/supabase/info";
import type { Music } from "../data/mockData";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7a80129e`;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${publicAnonKey}`,
};

export async function fetchMusic(): Promise<{ singles: Music[]; albums: Music[] }> {
  const res = await fetch(`${BASE}/music`, { headers });
  if (!res.ok) {
    throw new Error(`Music library request failed (${res.status}).`);
  }
  const data = await res.json();
  return {
    singles: Array.isArray(data?.singles) ? data.singles : [],
    albums: Array.isArray(data?.albums) ? data.albums : [],
  };
}

export async function addSingle(entry: Music): Promise<void> {
  await request(`${BASE}/music/singles`, {
    method: "POST",
    headers,
    body: JSON.stringify(entry),
  });
}

export async function addAlbum(entry: Music): Promise<void> {
  await request(`${BASE}/music/albums`, {
    method: "POST",
    headers,
    body: JSON.stringify(entry),
  });
}

export async function removeSingle(id: string): Promise<void> {
  await request(`${BASE}/music/singles/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
}

export async function removeAlbum(id: string): Promise<void> {
  await request(`${BASE}/music/albums/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
}

export type BackgroundMusic = {
  music: Music;
  trackIndex: number;
};

export async function fetchBackgroundMusic(): Promise<BackgroundMusic | null> {
  const res = await fetch(`${BASE}/background-music`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.music ? data : null;
}

export async function setBackgroundMusic(entry: BackgroundMusic): Promise<void> {
  const res = await fetch(`${BASE}/background-music`, {
    method: "PUT",
    headers,
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    throw new Error("The background music could not be saved globally.");
  }
}

async function request(url: string, init: RequestInit): Promise<void> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Music library update failed (${res.status}).`);
  }
}
