import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Film,
  Tv,
  Star,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { MediaItem } from "../lib/types";
import { getAllMedia } from "../lib/database";

interface StatsPageProps {
  refreshKey: number;
}

export default function StatsPage({ refreshKey }: StatsPageProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllMedia();
        setItems(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const watched = items.filter((i) => i.status === "watched");
    const watchlist = items.filter((i) => i.status === "watchlist");
    const movies = watched.filter((i) => i.media_type === "movie");
    const shows = watched.filter((i) => i.media_type === "tv");
    const rated = watched.filter(
      (i) => i.user_rating != null && i.user_rating > 0
    );
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, i) => sum + (i.user_rating || 0), 0) /
          rated.length
        : 0;

    const genreCounts: Record<string, number> = {};
    for (const item of watched) {
      if (item.genres) {
        for (const g of item.genres
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)) {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      }
    }
    const genreEntries = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const maxGenreCount = genreEntries.length > 0 ? genreEntries[0][1] : 1;

    const ratingDist: Record<number, number> = {};
    for (let r = 0.5; r <= 5; r += 0.5) ratingDist[r] = 0;
    for (const item of rated) {
      const r = item.user_rating!;
      if (ratingDist[r] !== undefined) ratingDist[r]++;
    }
    const maxRatingCount = Math.max(...Object.values(ratingDist), 1);

    const yearCounts: Record<string, number> = {};
    for (const item of watched) {
      if (item.watched_date) {
        const year = item.watched_date.substring(0, 4);
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    }
    const yearEntries = Object.entries(yearCounts)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 5);
    const maxYearCount = yearEntries.length > 0
      ? Math.max(...yearEntries.map(([, c]) => c), 1)
      : 1;

    const topRated = [...watched]
      .filter((i) => i.user_rating != null && i.user_rating > 0)
      .sort((a, b) => (b.user_rating || 0) - (a.user_rating || 0))
      .slice(0, 5);

    return {
      totalWatched: watched.length,
      totalWatchlist: watchlist.length,
      movieCount: movies.length,
      showCount: shows.length,
      avgRating,
      ratedCount: rated.length,
      genreEntries,
      maxGenreCount,
      ratingDist,
      maxRatingCount,
      yearEntries,
      maxYearCount,
      topRated,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <BarChart3 size={24} className="text-accent" />
          Stats
        </h1>
        <p className="text-sm text-fr-text">Your viewing habits at a glance</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Watched",
              value: stats.totalWatched,
              icon: TrendingUp,
              color: "text-accent",
            },
            {
              label: "Movies",
              value: stats.movieCount,
              icon: Film,
              color: "text-sky-400",
            },
            {
              label: "TV Shows",
              value: stats.showCount,
              icon: Tv,
              color: "text-accent",
            },
            {
              label: "Avg Rating",
              value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
              icon: Star,
              color: "text-amber-400",
            },
            {
              label: "Watchlist",
              value: stats.totalWatchlist,
              icon: Clock,
              color: "text-fr-text-light",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="glass rounded-xl p-5 border border-fr-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={16} className={card.color} />
                <span className="text-xs font-medium text-fr-subtle uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <div className="text-3xl font-bold text-white">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-xl p-6 border border-fr-border/30">
            <h3 className="text-sm font-semibold text-fr-light mb-5 uppercase tracking-wider">
              Top Genres
            </h3>
            {stats.genreEntries.length === 0 ? (
              <p className="text-fr-subtle text-sm py-4">
                Watch some titles to see genre stats
              </p>
            ) : (
              <div className="space-y-3">
                {stats.genreEntries.map(([genre, count]) => (
                  <div key={genre}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-fr-text-light">{genre}</span>
                      <span className="text-fr-subtle">{count}</span>
                    </div>
                    <div className="h-2 bg-fr-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/60 rounded-full transition-all duration-700"
                        style={{
                          width: `${(count / stats.maxGenreCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-6 border border-fr-border/30">
            <h3 className="text-sm font-semibold text-fr-light mb-5 uppercase tracking-wider">
              Rating Distribution
            </h3>
            {stats.ratedCount === 0 ? (
              <p className="text-fr-subtle text-sm py-4">
                Rate some titles to see distribution
              </p>
            ) : (
              <div className="flex items-end gap-1.5 h-44">
                {Object.entries(stats.ratingDist).map(([rating, count]) => (
                  <div
                    key={rating}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-fr-subtle font-medium">
                      {count > 0 ? count : ""}
                    </span>
                    <div className="w-full bg-fr-surface rounded-t overflow-hidden flex-1 flex items-end">
                      <div
                        className="w-full bg-amber-500/50 rounded-t transition-all duration-700"
                        style={{
                          height: `${(count / stats.maxRatingCount) * 100}%`,
                          minHeight: count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-fr-muted">
                      {parseFloat(rating) % 1 === 0
                        ? parseFloat(rating)
                        : parseFloat(rating).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.yearEntries.length > 0 && (
            <div className="glass rounded-xl p-6 border border-fr-border/30">
              <h3 className="text-sm font-semibold text-fr-light mb-5 uppercase tracking-wider">
                Watched by Year
              </h3>
              <div className="space-y-3">
                {stats.yearEntries.map(([year, count]) => (
                  <div key={year}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-fr-text-light">{year}</span>
                      <span className="text-fr-subtle">{count}</span>
                    </div>
                    <div className="h-2 bg-fr-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400/50 rounded-full transition-all duration-700"
                        style={{
                          width: `${(count / stats.maxYearCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topRated.length > 0 && (
            <div className="glass rounded-xl p-6 border border-fr-border/30">
              <h3 className="text-sm font-semibold text-fr-light mb-5 uppercase tracking-wider">
                Your Favorites
              </h3>
              <div className="space-y-3">
                {stats.topRated.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-1.5"
                  >
                    <span className="text-sm font-bold text-fr-subtle w-5 text-right">
                      {idx + 1}
                    </span>
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt=""
                        className="w-8 h-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-12 rounded bg-fr-surface flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-fr-light font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-fr-subtle">
                        {item.media_type === "movie" ? "Movie" : "TV Show"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star
                        size={12}
                        className="text-amber-400"
                        fill="currentColor"
                      />
                      <span className="text-sm font-semibold text-amber-400">
                        {item.user_rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
