// Global cumulative visitor counter stored in Supabase KV.
// Falls back to countapi.xyz, then local simulation.

import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { VISITOR_COUNT_BASE } from "../data/mockData";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7a80129e`;
const HEADERS = { "Content-Type": "application/json", "Authorization": `Bearer ${publicAnonKey}` };

async function incrementSupabase(): Promise<number | null> {
  try {
    // GET current count
    const getRes = await fetch(`${BASE}/visitors`, { headers: HEADERS });
    if (!getRes.ok) return null;
    const { count } = await getRes.json();
    // POST increment
    const postRes = await fetch(`${BASE}/visitors`, { method: "POST", headers: HEADERS, body: JSON.stringify({ count: (count ?? 0) + 1 }) });
    if (!postRes.ok) return null;
    const { count: next } = await postRes.json();
    return (next ?? 0) + VISITOR_COUNT_BASE;
  } catch {
    return null;
  }
}

async function getSupabase(): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/visitors`, { headers: HEADERS });
    if (!res.ok) return null;
    const { count } = await res.json();
    return (count ?? 0) + VISITOR_COUNT_BASE;
  } catch {
    return null;
  }
}

function isNewSession(): boolean {
  if (sessionStorage.getItem("v_counted")) return false;
  sessionStorage.setItem("v_counted", "1");
  return true;
}

export function useVisitors() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const newVisit = isNewSession();

    (async () => {
      // Try Supabase first
      const val = newVisit ? await incrementSupabase() : await getSupabase();
      if (val !== null) { setCount(val); return; }

      // Fallback: countapi.xyz
      try {
        const endpoint = newVisit
          ? "https://api.countapi.xyz/hit/libr4xx.site/visits"
          : "https://api.countapi.xyz/get/libr4xx.site/visits";
        const d = await fetch(endpoint, { mode: "cors" }).then(r => r.json());
        setCount(VISITOR_COUNT_BASE + (d.value ?? 0));
        return;
      } catch {}

      // Last resort: localStorage
      const stored = parseInt(localStorage.getItem("v_local") || "0", 10);
      const next = stored + (newVisit ? 1 : 0);
      localStorage.setItem("v_local", String(next));
      setCount(VISITOR_COUNT_BASE + next);
    })();
  }, []);

  return count;
}
