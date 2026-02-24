import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Loader2,
  Film,
  Tv,
  Star,
  Sparkles,
  Library,
} from "lucide-react";
import { TmdbSearchResult, SelectedMedia, MediaItem } from "../lib/types";
import {
  getTrending,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
  getRecommendations,
  getMediaDetails,
} from "../lib/tmdb";
import {
  getAllMedia,
  addMedia,
  updateMedia,
  getMediaByTmdbId,
  getTopRatedMedia,
} from "../lib/database";
import MediaRow from "../components/MediaRow";

interface DiscoverPageProps {
  onSelect: (media: SelectedMedia) => void;
  onSave: () => void;
}

type FilterType = "all" | "movie" | "tv";

interface BrowseSections {
  trending: TmdbSearchResult[];
  popularMovies: TmdbSearchResult[];
  popularTv: TmdbSearchResult[];
  topRatedMovies: TmdbSearchResult[];
  topRatedTv: TmdbSearchResult[];
  recommendations: TmdbSearchResult[];
}

export default function DiscoverPage({ onSelect, onSave }: DiscoverPageProps) {
  const [sections, setSections] = useState<BrowseSections>({
    trending: [],
    popularMovies: [],
    popularTv: [],
    topRatedMovies: [],
    topRatedTv: [],
    recommendations: [],
  });
  const [libraryMap, setLibraryMap] = useState<Map<string, MediaItem>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

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

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);

      const [
        allMedia,
        trending,
        popularMovies,
        popularTv,
        topRatedMovies,
        topRatedTv,
      ] = await Promise.all([
        getAllMedia(),
        getTrending(),
        getPopularMovies(),
        getPopularTv(),
        getTopRatedMovies(),
        getTopRatedTv(),
      ]);

      const libraryKeys = new Set(
        allMedia.map((item) => `${item.tmdb_id}-${item.media_type}`)
      );

      let recommendations: TmdbSearchResult[] = [];
      try {
        const topRated = await getTopRatedMedia(5);
        if (topRated.length > 0) {
          const recResults = await Promise.all(
            topRated.map((item) =>
              getRecommendations(item.tmdb_id, item.media_type)
            )
          );
          const seen = new Set<string>();
          const allRecs: TmdbSearchResult[] = [];
          for (const recs of recResults) {
            for (const rec of recs) {
              const key = `${rec.id}-${rec.media_type}`;
              if (!seen.has(key) && !libraryKeys.has(key)) {
                seen.add(key);
                allRecs.push(rec);
              }
            }
          }
          recommendations = allRecs
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 20);
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      }

      setSections({
        trending,
        popularMovies,
        popularTv,
        topRatedMovies,
        topRatedTv,
        recommendations,
      });
    } catch (err) {
      console.error("Failed to load browse sections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
    loadSections();
  }, [loadLibrary, loadSections]);

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

  function filterItems(items: TmdbSearchResult[]): TmdbSearchResult[] {
    if (filter === "all") return items;
    return items.filter((item) => item.media_type === filter);
  }

  const filters: { key: FilterType; label: string; icon: typeof Film }[] = [
    { key: "all", label: "All", icon: Library },
    { key: "movie", label: "Movies", icon: Film },
    { key: "tv", label: "TV Shows", icon: Tv },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-8 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Discover</h1>
            <p className="text-sm text-fr-text">
              Browse trending, popular, and recommended titles
            </p>
          </div>
          <div className="flex gap-1.5">
            {filters.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === key
                    ? "bg-accent/20 text-accent-light border border-accent/30 shadow-sm shadow-accent/10"
                    : "bg-fr-card/40 text-fr-text border border-fr-border/30 hover:bg-accent/10 hover:text-accent-light"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : (
          <>
            {filterItems(sections.recommendations).length > 0 && (
              <MediaRow
                title="Recommended For You"
                icon={<Sparkles size={18} className="text-amber-400" />}
                items={filterItems(sections.recommendations)}
                libraryMap={libraryMap}
                onSelect={onSelect}
                onQuickAdd={handleQuickAdd}
              />
            )}

            <MediaRow
              title="Trending This Week"
              icon={<TrendingUp size={18} className="text-accent" />}
              items={filterItems(sections.trending)}
              libraryMap={libraryMap}
              onSelect={onSelect}
              onQuickAdd={handleQuickAdd}
            />

            {(filter === "all" || filter === "movie") && (
              <MediaRow
                title="Popular Movies"
                icon={<Film size={18} className="text-sky-400" />}
                items={sections.popularMovies}
                libraryMap={libraryMap}
                onSelect={onSelect}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {(filter === "all" || filter === "tv") && (
              <MediaRow
                title="Popular TV Shows"
                icon={<Tv size={18} className="text-accent" />}
                items={sections.popularTv}
                libraryMap={libraryMap}
                onSelect={onSelect}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {(filter === "all" || filter === "movie") && (
              <MediaRow
                title="Top Rated Movies"
                icon={<Star size={18} className="text-amber-400" />}
                items={sections.topRatedMovies}
                libraryMap={libraryMap}
                onSelect={onSelect}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {(filter === "all" || filter === "tv") && (
              <MediaRow
                title="Top Rated TV Shows"
                icon={<Star size={18} className="text-amber-400" />}
                items={sections.topRatedTv}
                libraryMap={libraryMap}
                onSelect={onSelect}
                onQuickAdd={handleQuickAdd}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
