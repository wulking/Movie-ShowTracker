import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, Film, Tv, Library, X } from "lucide-react";
import { TmdbSearchResult, SelectedMedia, MediaItem } from "../lib/types";
import { searchMedia, getMediaDetails } from "../lib/tmdb";
import {
  getAllMedia,
  addMedia,
  updateMedia,
  getMediaByTmdbId,
} from "../lib/database";
import MediaCard from "../components/MediaCard";

interface SearchPageProps {
  onSelect: (media: SelectedMedia) => void;
  onSave: () => void;
}

type FilterType = "all" | "movie" | "tv";

export default function SearchPage({ onSelect, onSave }: SearchPageProps) {
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [libraryMap, setLibraryMap] = useState<Map<string, MediaItem>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    loadLibrary();
    inputRef.current?.focus();
  }, []);

  const loadLibrary = useCallback(async () => {
    try {
      const items = await getAllMedia();
      const map = new Map<string, MediaItem>();
      items.forEach((item) =>
        map.set(`${item.tmdb_id}-${item.media_type}`, item)
      );
      setLibraryMap(map);
    } catch (err) {
      console.error("Failed to load library:", err);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(value.trim()), 350);
  }

  async function doSearch(searchQuery: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await searchMedia(searchQuery);
      setResults(data.results);
    } catch (err) {
      setError("Search failed. Check your API key and connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(item: TmdbSearchResult) {
    onSelect({
      tmdbId: item.id,
      mediaType: item.media_type,
      title: item.title || item.name || "Unknown",
      posterPath: item.poster_path,
    });
  }

  async function handleQuickAdd(
    item: TmdbSearchResult,
    status: "watched" | "watchlist"
  ) {
    try {
      const existing = await getMediaByTmdbId(item.id, item.media_type);
      if (existing?.id) {
        await updateMedia(existing.id, {
          status,
          watched_date:
            status === "watched"
              ? new Date().toISOString().split("T")[0]
              : existing.watched_date,
        });
      } else {
        const details = await getMediaDetails(item.id, item.media_type);
        const genres = details.genres
          ? details.genres.map((g: { name: string }) => g.name).join(", ")
          : "";
        await addMedia({
          tmdb_id: item.id,
          media_type: item.media_type,
          title: item.title || item.name || "Unknown",
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          overview: item.overview,
          release_date: item.release_date || item.first_air_date || "",
          genres,
          vote_average: item.vote_average,
          status,
          user_rating: null,
          user_notes: null,
          watched_date:
            status === "watched"
              ? new Date().toISOString().split("T")[0]
              : null,
        });
      }
      await loadLibrary();
      onSave();
    } catch (err) {
      console.error("Quick add failed:", err);
    }
  }

  const filtered =
    filter === "all"
      ? results
      : results.filter((item) => item.media_type === filter);

  const filters: { key: FilterType; label: string; icon: typeof Film }[] = [
    { key: "all", label: "All", icon: Library },
    { key: "movie", label: "Movies", icon: Film },
    { key: "tv", label: "TV Shows", icon: Tv },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <div className="relative w-full max-w-2xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-fr-subtle"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search movies & TV shows..."
            className="w-full pl-12 pr-10 py-3.5 glass-light border border-fr-border/50 rounded-xl text-base text-fr-light placeholder-fr-muted focus:border-accent/50 focus:shadow-lg focus:shadow-accent/5 transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fr-subtle hover:text-fr-text-light transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {results.length > 0 && (
          <div className="flex gap-2 mt-4">
            {filters.map(({ key, label, icon: Icon }) => {
              const count =
                key === "all"
                  ? results.length
                  : results.filter((i) => i.media_type === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === key
                      ? "bg-accent/20 text-accent-light border border-accent/30 shadow-sm shadow-accent/10"
                      : "bg-fr-card/40 text-fr-text border border-fr-border/30 hover:bg-accent/10 hover:text-accent-light"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {error && (
          <div className="mt-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!query && !loading && (
          <div className="text-center py-24">
            <Search size={48} className="mx-auto text-fr-border mb-4" />
            <p className="text-fr-text text-lg font-medium">
              Search for anything
            </p>
            <p className="text-fr-subtle text-sm mt-1">
              Type a movie or TV show name to find it
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        )}

        {query && !loading && filtered.length === 0 && results.length > 0 && (
          <div className="text-center py-16">
            <p className="text-fr-text">
              No {filter === "movie" ? "movies" : "TV shows"} found — try "All"
            </p>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-fr-text">No results found for "{query}"</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-semibold text-fr-text-light">
                Top Matches
              </h2>
              <span className="text-sm text-fr-subtle">
                ({filtered.length})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {filtered.map((item) => {
                const key = `${item.id}-${item.media_type}`;
                const dbItem = libraryMap.get(key);
                return (
                  <MediaCard
                    key={key}
                    tmdbId={item.id}
                    title={item.title || item.name || "Unknown"}
                    mediaType={item.media_type}
                    posterPath={item.poster_path}
                    releaseDate={item.release_date || item.first_air_date}
                    voteAverage={item.vote_average}
                    status={dbItem?.status ?? null}
                    onClick={() => handleSelect(item)}
                    onQuickAdd={(status) => handleQuickAdd(item, status)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
