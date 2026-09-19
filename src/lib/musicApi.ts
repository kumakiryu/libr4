import { projectId, publicAnonKey } from "../../utils/supabase/info";
import type { Music } from "../data/mockData";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7a80129e`;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${publicAnonKey}`,
};

export async function fetchMusic(): Promise<{ singles: Music[]; albums: Music[] }> {
  const res = await fetch(`${BASE}/music`, { headers });
  if (!res.ok) return { singles: [], albums: [] };
  return res.json();
}

export async function addSingle(entry: Music): Promise<void> {
  await fetch(`${BASE}/music/singles`, { method: "POST", headers, body: JSON.stringify(entry) });
}

export async function addAlbum(entry: Music): Promise<void> {
  await fetch(`${BASE}/music/albums`, { method: "POST", headers, body: JSON.stringify(entry) });
}

export async function removeSingle(id: string): Promise<void> {
  await fetch(`${BASE}/music/singles/${id}`, { method: "DELETE", headers });
}

export async function removeAlbum(id: string): Promise<void> {
  await fetch(`${BASE}/music/albums/${id}`, { method: "DELETE", headers });
}
