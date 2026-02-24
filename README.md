# Media Tracker

A native macOS/Linux desktop app for tracking movies and TV shows you've watched and building a personal watchlist. Built with **Tauri v2**, **React**, and **SQLite**.

![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-local-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Discover** — Browse trending, popular, and top-rated movies & TV shows powered by TMDB
- **Search** — Live search with media type filters
- **Library** — Your watched collection with ratings, notes, sorting, and filtering
- **Watchlist** — Track what you want to watch next, with a **"Surprise Me"** random picker
- **Stats** — Viewing analytics: genre breakdown, rating distribution, watched-by-year, and your top-rated favorites
- **Recommendations** — Personalized suggestions based on your highest-rated titles (excludes items already in your library or watchlist)
- **Ratings** — Click-to-save star ratings
- **Quick Actions** — Add to Watched or Watchlist directly from any poster
- **Dynamic Theming** — Upload any image as the app background; accent colors are automatically extracted to generate a matching palette
- **Export / Import** — Back up your entire library as JSON; restore on any device

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Tauri v2](https://v2.tauri.app/) (Rust backend, web frontend) |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS with CSS custom properties for dynamic theming |
| Database | SQLite via `tauri-plugin-sql` (local, zero-config) |
| API | [TMDB (The Movie Database)](https://www.themoviedb.org/documentation/api) via `tauri-plugin-http` |
| Icons | [Lucide React](https://lucide.dev/) |
| Build | Vite |

## Prerequisites

- **Node.js** ≥ 18
- **Rust** (latest stable) — [install via rustup](https://rustup.rs/)
- **TMDB API key** — [get one free](https://www.themoviedb.org/settings/api)
- **System dependencies** for Tauri — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/Movie-ShowTracker.git
cd Movie-ShowTracker

# Install dependencies
npm install

# Create a .env file with your TMDB API key
echo "VITE_TMDB_API_KEY=your_api_key_here" > .env

# Run in development mode
npm run tauri dev
```

## Building for Production

```bash
# Build a native app bundle (.app on macOS, .deb/.AppImage on Linux)
npm run tauri build
```

The compiled binary will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── MediaCard.tsx      # Poster card with quick-add buttons
│   │   ├── MediaDetail.tsx    # Detail modal with ratings & notes
│   │   ├── MediaRow.tsx       # Horizontal scrollable row
│   │   ├── RatingStars.tsx    # Half-star rating input
│   │   └── TopNav.tsx         # Top navigation bar
│   ├── pages/            # Full-page views
│   │   ├── DiscoverPage.tsx   # Trending, popular, top-rated, recommendations
│   │   ├── SearchPage.tsx     # Live search with filters
│   │   ├── LibraryPage.tsx    # Watched items collection
│   │   ├── WatchlistPage.tsx  # Watchlist with random picker
│   │   ├── StatsPage.tsx      # Viewing analytics dashboard
│   │   └── SettingsPage.tsx   # Theme customization & data export/import
│   ├── lib/              # Core logic
│   │   ├── database.ts        # SQLite queries (CRUD, stats)
│   │   ├── tmdb.ts            # TMDB API client
│   │   ├── theme.ts           # Dynamic theme engine (color extraction, palette generation)
│   │   └── types.ts           # TypeScript interfaces
│   ├── App.tsx           # Root component & routing
│   ├── index.css         # Global styles, CSS variables, glassmorphism
│   └── main.tsx          # Entry point
├── src-tauri/            # Rust backend
│   ├── src/lib.rs             # Plugin init, DB migrations
│   ├── tauri.conf.json        # App config, CSP, window settings
│   └── capabilities/          # Permission grants (SQL, HTTP)
├── public/bg.png         # Default background image
├── tailwind.config.js    # Tailwind config with CSS variable colors
└── package.json
```

## Configuration

| Environment Variable | Description |
|---------------------|-------------|
| `VITE_TMDB_API_KEY` | Your TMDB API key (required) |

## Data & Privacy

All data is stored **locally** in a SQLite database on your machine. No accounts, no cloud, no tracking. The TMDB API is only called to fetch public movie/show metadata.

Use **Settings → Export Library** to create a JSON backup at any time.

## License

MIT
