import { Film, Tv, Star, Check, Bookmark, Eye } from "lucide-react";
import { getPosterUrl } from "../lib/tmdb";

interface MediaCardProps {
  tmdbId: number;
  title: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  releaseDate?: string;
  voteAverage?: number;
  userRating?: number | null;
  status?: "watched" | "watchlist" | null;
  onClick: () => void;
  onQuickAdd?: (status: "watched" | "watchlist") => void;
}

export default function MediaCard({
  title,
  mediaType,
  posterPath,
  releaseDate,
  voteAverage,
  userRating,
  status,
  onClick,
  onQuickAdd,
}: MediaCardProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const posterUrl = getPosterUrl(posterPath, "w342");

  return (
    <div className="group text-left w-full rounded-xl overflow-hidden bg-fr-card/40 border border-fr-border/40 hover:border-accent/30 hover:bg-fr-card/60 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/10">
      <div
        className="relative aspect-[2/3] bg-fr-surface overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-fr-surface">
            {mediaType === "movie" ? (
              <Film size={40} className="text-fr-muted" />
            ) : (
              <Tv size={40} className="text-fr-muted" />
            )}
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase backdrop-blur-sm ${
              mediaType === "movie"
                ? "bg-sky-500/80 text-white"
                : "bg-accent/80 text-white"
            }`}
          >
            {mediaType === "movie" ? "Movie" : "TV"}
          </span>
        </div>

        {status && (
          <div className="absolute top-2 right-2">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm ${
                status === "watched"
                  ? "bg-teal-500/80 text-white"
                  : "bg-amber-500/80 text-white"
              }`}
            >
              {status === "watched" ? (
                <Check size={10} />
              ) : (
                <Bookmark size={10} />
              )}
              {status === "watched" ? "Watched" : "Watchlist"}
            </span>
          </div>
        )}

        {voteAverage !== undefined && voteAverage > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-fr-midnight/80 backdrop-blur-sm transition-opacity group-hover:opacity-0">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-white">
              {voteAverage.toFixed(1)}
            </span>
          </div>
        )}

        {onQuickAdd && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              title="Mark as Watched"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd("watched");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold backdrop-blur-md transition-colors ${
                status === "watched"
                  ? "bg-teal-600/90 text-white"
                  : "bg-fr-midnight/70 text-teal-400 hover:bg-teal-600/90 hover:text-white"
              }`}
            >
              <Eye size={14} />
              Watched
            </button>
            <button
              type="button"
              title="Add to Watchlist"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd("watchlist");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold backdrop-blur-md transition-colors ${
                status === "watchlist"
                  ? "bg-amber-600/90 text-white"
                  : "bg-fr-midnight/70 text-amber-400 hover:bg-amber-600/90 hover:text-white"
              }`}
            >
              <Bookmark size={14} />
              To Watch
            </button>
          </div>
        )}
      </div>

      <div className="p-3 cursor-pointer" onClick={onClick}>
        <h3 className="text-sm font-medium text-fr-text-light leading-tight line-clamp-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          {year && <span className="text-xs text-fr-subtle">{year}</span>}
          {userRating !== undefined &&
            userRating !== null &&
            userRating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-[11px] text-amber-400 font-medium">
                  {userRating % 1 === 0 ? userRating : userRating.toFixed(1)}
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
