import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7a80129e/health", (c) => {
  return c.json({ status: "ok" });
});

const MUSIC_SINGLES_KEY = "music_singles";
const MUSIC_ALBUMS_KEY = "music_albums";

function isMusic(value: any) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.tracks)
  );
}

function uniqueMusic(values: any[]) {
  const entries = values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter(isMusic);
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()];
}

async function loadCollection(keys: string[], prefixes: string[]) {
  const values: any[] = [];
  for (const key of keys) {
    const value = await kv.get(key);
    if (value) values.push(value);
  }
  for (const prefix of prefixes) {
    values.push(...await kv.getByPrefix(prefix));
  }
  return uniqueMusic(values);
}

const loadSingles = () => loadCollection(
  [MUSIC_SINGLES_KEY, "music:singles", "singles"],
  ["music:single:", "music_single_"],
);

const loadAlbums = () => loadCollection(
  [MUSIC_ALBUMS_KEY, "music:albums", "albums"],
  ["music:album:", "music_album_"],
);

app.get("/make-server-7a80129e/music", async (c) => {
  try {
    const [singles, albums] = await Promise.all([loadSingles(), loadAlbums()]);
    return c.json({ singles, albums });
  } catch (error) {
    console.log("Failed to load music library:", error);
    return c.json({ error: "Failed to load music library" }, 500);
  }
});

app.post("/make-server-7a80129e/music/singles", async (c) => {
  try {
    const entry = await c.req.json();
    if (!isMusic(entry)) return c.json({ error: "Invalid single" }, 400);
    const current = await loadSingles();
    await kv.set(
      MUSIC_SINGLES_KEY,
      [...current.filter((item) => item.id !== entry.id), entry],
    );
    return c.json({ success: true });
  } catch (error) {
    console.log("Failed to add single:", error);
    return c.json({ error: "Failed to add single" }, 500);
  }
});

app.post("/make-server-7a80129e/music/albums", async (c) => {
  try {
    const entry = await c.req.json();
    if (!isMusic(entry)) return c.json({ error: "Invalid album" }, 400);
    const current = await loadAlbums();
    await kv.set(
      MUSIC_ALBUMS_KEY,
      [...current.filter((item) => item.id !== entry.id), entry],
    );
    return c.json({ success: true });
  } catch (error) {
    console.log("Failed to add album:", error);
    return c.json({ error: "Failed to add album" }, 500);
  }
});

app.delete("/make-server-7a80129e/music/singles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.set(
      MUSIC_SINGLES_KEY,
      (await loadSingles()).filter((item) => item.id !== id),
    );
    return c.json({ success: true });
  } catch (error) {
    console.log("Failed to remove single:", error);
    return c.json({ error: "Failed to remove single" }, 500);
  }
});

app.delete("/make-server-7a80129e/music/albums/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.set(
      MUSIC_ALBUMS_KEY,
      (await loadAlbums()).filter((item) => item.id !== id),
    );
    return c.json({ success: true });
  } catch (error) {
    console.log("Failed to remove album:", error);
    return c.json({ error: "Failed to remove album" }, 500);
  }
});

const BACKGROUND_MUSIC_KEY = "background_music";

app.get("/make-server-7a80129e/background-music", async (c) => {
  try {
    return c.json(await kv.get(BACKGROUND_MUSIC_KEY) ?? null);
  } catch (error) {
    console.log("Failed to load background music:", error);
    return c.json({ error: "Failed to load background music" }, 500);
  }
});

app.put("/make-server-7a80129e/background-music", async (c) => {
  try {
    const entry = await c.req.json();
    const trackIndex = Number(entry?.trackIndex ?? 0);
    const track = entry?.music?.tracks?.[trackIndex];
    if (!isMusic(entry?.music) || !track?.audioUrl?.trim()) {
      return c.json({ error: "A valid background track is required" }, 400);
    }
    await kv.set(BACKGROUND_MUSIC_KEY, { music: entry.music, trackIndex });
    return c.json({ success: true });
  } catch (error) {
    console.log("Failed to save background music:", error);
    return c.json({ error: "Failed to save background music" }, 500);
  }
});

const VISITORS_KEY = "visitor_count";

app.get("/make-server-7a80129e/visitors", async (c) => {
  try {
    return c.json({ count: Number(await kv.get(VISITORS_KEY) ?? 0) });
  } catch (error) {
    console.log("Failed to load visitor count:", error);
    return c.json({ error: "Failed to load visitor count" }, 500);
  }
});

app.post("/make-server-7a80129e/visitors", async (c) => {
  try {
    const body = await c.req.json();
    const count = Math.max(0, Number(body?.count) || 0);
    await kv.set(VISITORS_KEY, count);
    return c.json({ count });
  } catch (error) {
    console.log("Failed to update visitor count:", error);
    return c.json({ error: "Failed to update visitor count" }, 500);
  }
});

Deno.serve(app.fetch);
