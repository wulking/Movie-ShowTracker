import { useState, useEffect } from "react";
import { Page, SelectedMedia } from "./lib/types";
import { getMediaByStatus } from "./lib/database";
import { ThemeData, getDefaultTheme, applyTheme, saveTheme, loadTheme } from "./lib/theme";
import TopNav from "./components/TopNav";
import MediaDetail from "./components/MediaDetail";
import DiscoverPage from "./pages/DiscoverPage";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import WatchlistPage from "./pages/WatchlistPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("discover");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ThemeData>(() => {
    return loadTheme() || getDefaultTheme();
  });

  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  useEffect(() => {
    loadCounts();
  }, [refreshKey]);

  async function loadCounts() {
    try {
      const [watched, watchlist] = await Promise.all([
        getMediaByStatus("watched"),
        getMediaByStatus("watchlist"),
      ]);
      setWatchedCount(watched.length);
      setWatchlistCount(watchlist.length);
    } catch (err) {
      console.error("Failed to load counts:", err);
    }
  }

  function handleSelect(media: SelectedMedia) {
    setSelectedMedia(media);
  }

  function handleSave() {
    setRefreshKey((k) => k + 1);
  }

  function handleThemeChange(theme: ThemeData) {
    setCurrentTheme(theme);
    applyTheme(theme);
    saveTheme(theme);
  }

  return (
    <div className="flex flex-col h-screen relative z-10">
      <TopNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        watchedCount={watchedCount}
        watchlistCount={watchlistCount}
      />

      <main className="flex-1 overflow-hidden">
        {currentPage === "discover" && (
          <DiscoverPage onSelect={handleSelect} onSave={handleSave} />
        )}
        {currentPage === "search" && (
          <SearchPage onSelect={handleSelect} onSave={handleSave} />
        )}
        {currentPage === "library" && (
          <LibraryPage
            onSelect={handleSelect}
            onSave={handleSave}
            refreshKey={refreshKey}
          />
        )}
        {currentPage === "watchlist" && (
          <WatchlistPage
            onSelect={handleSelect}
            onSave={handleSave}
            refreshKey={refreshKey}
          />
        )}
        {currentPage === "stats" && (
          <StatsPage refreshKey={refreshKey} />
        )}
        {currentPage === "settings" && (
          <SettingsPage
            theme={currentTheme}
            onThemeChange={handleThemeChange}
            onDataChange={handleSave}
          />
        )}
      </main>

      {selectedMedia && (
        <MediaDetail
          tmdbId={selectedMedia.tmdbId}
          mediaType={selectedMedia.mediaType}
          onClose={() => setSelectedMedia(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
