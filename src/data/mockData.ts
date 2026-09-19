// ── Types ─────────────────────────────────────────────────────────────────────

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;   // "3:42"
  durationSec: number;
  audioUrl: string;   // GitHub raw URL: https://raw.githubusercontent.com/USER/REPO/main/songs/file.mp3
  coverUrl?: string;  // per-track cover override
};

export type Music = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  accentColor: string;
  labelColor: string;
  tracks: Track[];
};

// ── Singles Library ────────────────────────────────────────────────────────────
// Add an entry per song. Clicking the card plays it immediately.
//
// audioUrl format — GitHub raw:
//   1. Upload your .mp3 to a GitHub repo (e.g. github.com/LIBR4xx/music)
//   2. Open the file → click "Raw" → copy the URL
//   Example: https://raw.githubusercontent.com/LIBR4xx/music/main/crave-you.mp3

export const MUSIC_LIBRARY: Music[] = [
  {
    id: "crave-you",
    title: "Crave You",
    artist: "LIBR4 ft. SLXME",
    coverUrl: "https://kumakiryu.github.io/musics-formikaelson/assets/CRAVE_YOU.png",
    accentColor: "#c084fc",
    labelColor: "#7e22ce",
    tracks: [
      {
        id: "crave-you-1",
        title: "Crave You",
        artist: "LIBR4 ft. SLXME",
        duration: "2:48",
        durationSec: 168,
        audioUrl: "https://raw.githubusercontent.com/kizuaron23/musicsforiwxs/main/assets/musics/cy.mp3",
      },
    ],
  },
  {
    id: "echoes",
    title: "ECHOES",
    artist: "LIBR4 ft. SLXME",
    coverUrl: "https://raw.githubusercontent.com/kizuaron23/musicsforiwxs/main/assets/thumbnail/echoes.jpg",
    accentColor: "#d97706",
    labelColor: "#78350f",
    tracks: [
      {
        id: "echoes-1",
        title: "ECHOES",
        artist: "LIBR4 ft. SLXME",
        duration: "3:20",
        durationSec: 200,
        audioUrl: "https://raw.githubusercontent.com/kizuaron23/musicsforiwxs/main/assets/musics/echoes.mp3",
      },
    ],
  },
];

// ── Album Library ──────────────────────────────────────────────────────────────
// Albums open a full tracklist player when clicked.
// Each track needs its own audioUrl.

export const ALBUM_LIBRARY: Music[] = [
];

export const VISITOR_COUNT_BASE = 0;

// Backward-compat aliases
export const VISITOR_COUNT = VISITOR_COUNT_BASE;
export const MOCK_ALBUMS = MUSIC_LIBRARY;
export const ALBUMS = MUSIC_LIBRARY;
