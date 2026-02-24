import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Film,
  Tv,
  Loader2,
  Library,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";
import { MediaItem, SelectedMedia } from "../lib/types";
import { getMediaByStatus, updateMedia } from "../lib/database";
import MediaCard from "../components/MediaCard";

interface LibraryPageProps {
  onSelect: (media: SelectedMedia) => void;
  onSave: () => void;
  refreshKey: number;
}

type FilterType = "all" | "movie" | "tv";
type SortType = "recent" | "title" | "rating" | "year";

export default function LibraryPage({
  onSelect,
  onSave,
  refreshKey,
}: LibraryPageProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMediaByStatus("watched");
      setItems(data);
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  const displayed = useMemo(() => {
    let result = items;
    if (filter !== "all") {
      result = result.filter((item) => item.media_type === filter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(q));
    }
    switch (sort) {
      case "title":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "rating":
        result = [...result].sort(
          (a, b) => (b.user_rating ?? 0) - (a.user_rating ?? 0)
        );
        break;
      case "year":
        result = [...result].sort((a, b) =>
          (b.release_date || "").localeCompare(a.release_date || "")
        );
        break;
    }
    return result;
  }, [items, filter, sort, searchQuery]);

  const filters: { key: FilterType; label: string; icon: typeof Film }[] = [
    { key: "all", label: "All", icon: Library },
    { key: "movie", label: "Movies", icon: Film },
    { key: "tv", label: "TV Shows", icon: Tv },
  ];

  const sorts: { key: SortType; label: string }[] = [
    { key: "recent", label: "Recent" },
    { key: "title", label: "A\u2013Z" },
    { key: "rating", label: "Rating" },
    { key: "year", label: "Year" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-8 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Watched</h1>
            <p className="text-sm text-fr-text">
              {items.length} {items.length === 1 ? "title" : "titles"} in your
              library
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-shrink-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fr-subtle"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter library..."
              className="pl-8 pr-8 py-1.5 w-48 bg-fr-card/40 border border-fr-border/40 rounded-lg text-sm text-fr-light placeholder-fr-muted focus:border-accent/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-fr-subtle hover:text-fr-text-light"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            {filters.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === key
                    ? "bg-accent/20 text-accent-light border border-accent/30"
                    : "bg-fr-card/40 text-fr-text border border-fr-border/30 hover:bg-accent/10 hover:text-accent-light"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown size={14} className="text-fr-subtle" />
            {sorts.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sort === key
                    ? "bg-fr-elevated/70 text-fr-light"
                    : "text-fr-subtle hover:text-fr-text-light"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <Film size={48} className="mx-auto text-fr-border mb-4" />
            <p className="text-fr-text text-lg font-medium">
              {items.length === 0
                ? "No watched items yet"
                : "No items match your filters"}
            </p>
            <p className="text-fr-subtle text-sm mt-1">
              {items.length === 0
                ? "Search for movies and shows to add to your library"
                : "Try different filters or clear your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 mt-4">
            {displayed.map((item) => (
              <MediaCard
                key={item.id}
                tmdbId={item.tmdb_id}
                title={item.title}
                mediaType={item.media_type}
                posterPath={item.poster_path}
                releaseDate={item.release_date}
                voteAverage={item.vote_average}
                userRating={item.user_rating}
                status="watched"
                onClick={() =>
                  onSelect({
                    tmdbId: item.tmdb_id,
                    mediaType: item.media_type,
                    title: item.title,
                    posterPath: item.poster_path,
                  })
                }
                onQuickAdd={async (status) => {
                  if (item.id && status !== "watched") {
                    await updateMedia(item.id, { status });
                    loadItems();
                    onSave();
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
