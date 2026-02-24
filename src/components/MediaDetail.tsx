import { useState, useEffect } from "react";
import {
  X,
  Star,
  Calendar,
  Clock,
  Eye,
  Bookmark,
  Trash2,
  Check,
  Film,
  Tv,
  Loader2,
} from "lucide-react";
import { TmdbDetails, MediaItem } from "../lib/types";
import { getMediaDetails, getPosterUrl, getBackdropUrl } from "../lib/tmdb";
import {
  addMedia,
  updateMedia,
  deleteMedia,
  getMediaByTmdbId,
} from "../lib/database";
import RatingStars from "./RatingStars";

interface MediaDetailProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  onClose: () => void;
  onSave: () => void;
}

export default function MediaDetail({
  tmdbId,
  mediaType,
  onClose,
  onSave,
}: MediaDetailProps) {
  const [details, setDetails] = useState<TmdbDetails | null>(null);
  const [dbItem, setDbItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [userNotes, setUserNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tmdbId, mediaType]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [tmdbDetails, existing] = await Promise.all([
        getMediaDetails(tmdbId, mediaType),
        getMediaByTmdbId(tmdbId, mediaType),
      ]);
      setDetails(tmdbDetails);
      setDbItem(existing);
      if (existing) {
        setUserRating(existing.user_rating ?? 0);
        setUserNotes(existing.user_notes ?? "");
      }
    } catch (err) {
      setError("Failed to load details. Check your internet connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(status: "watched" | "watchlist") {
    if (!details) return;
    try {
      setSaving(true);
      setError(null);

      const title = details.title || details.name || "Unknown";
      const releaseDate =
        details.release_date || details.first_air_date || "";
      const genres = details.genres.map((g) => g.name).join(", ");

      if (dbItem?.id) {
        await updateMedia(dbItem.id, {
          status,
          user_rating: userRating || null,
          user_notes: userNotes || null,
          watched_date:
            status === "watched"
              ? new Date().toISOString().split("T")[0]
              : dbItem.watched_date,
        });
      } else {
        await addMedia({
          tmdb_id: tmdbId,
          media_type: mediaType,
          title,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          overview: details.overview,
          release_date: releaseDate,
          genres,
          vote_average: details.vote_average,
          status,
          user_rating: userRating || null,
          user_notes: userNotes || null,
          watched_date:
            status === "watched"
              ? new Date().toISOString().split("T")[0]
              : null,
        });
      }

      const updated = await getMediaByTmdbId(tmdbId, mediaType);
      setDbItem(updated);
      onSave();
      setSaveSuccess(
        status === "watched" ? "Marked as watched!" : "Added to watchlist!"
      );
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleRatingChange(newRating: number) {
    setUserRating(newRating);
    if (dbItem?.id) {
      try {
        await updateMedia(dbItem.id, { user_rating: newRating || null });
        const updated = await getMediaByTmdbId(tmdbId, mediaType);
        setDbItem(updated);
        onSave();
        setSaveSuccess(
          newRating > 0
            ? `Rated ${newRating % 1 === 0 ? newRating : newRating.toFixed(1)} / 5`
            : "Rating cleared"
        );
        setTimeout(() => setSaveSuccess(null), 1500);
      } catch (err) {
        console.error("Failed to save rating:", err);
      }
    }
  }

  async function handleDelete() {
    if (!dbItem?.id) return;
    try {
      setSaving(true);
      await deleteMedia(dbItem.id);
      setDbItem(null);
      setUserRating(0);
      setUserNotes("");
      onSave();
      setSaveSuccess("Removed from library!");
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setError("Failed to delete.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const title = details?.title || details?.name || "Loading...";
  const releaseDate = details?.release_date || details?.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const genres = details?.genres.map((g) => g.name).join(", ");
  const backdropUrl = getBackdropUrl(details?.backdrop_path ?? null);
  const posterUrl = getPosterUrl(details?.poster_path ?? null, "w500");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fr-midnight/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] glass rounded-2xl overflow-hidden shadow-2xl shadow-accent/10 border border-fr-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-fr-midnight/60 text-white hover:bg-fr-midnight/80 transition-colors backdrop-blur-sm"
        >
          <X size={16} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        ) : error && !details ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[90vh]">
            <div className="relative h-56 bg-fr-surface">
              {backdropUrl ? (
                <img
                  src={backdropUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-35"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-fr-dark via-accent/5 to-fr-surface" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-fr-card via-fr-card/60 to-transparent" />
            </div>

            <div className="px-8 pb-8 -mt-32 relative z-10">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-40">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-accent/10 border-2 border-fr-border-light/40 bg-fr-surface">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {mediaType === "movie" ? (
                          <Film size={48} className="text-fr-muted" />
                        ) : (
                          <Tv size={48} className="text-fr-muted" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 pt-24">
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                        mediaType === "movie"
                          ? "bg-sky-500/20 text-sky-300"
                          : "bg-accent/20 text-accent-light"
                      }`}
                    >
                      {mediaType === "movie" ? "Movie" : "TV Show"}
                    </span>
                    {dbItem && (
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          dbItem.status === "watched"
                            ? "bg-teal-500/20 text-teal-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {dbItem.status === "watched" ? (
                          <Check size={12} />
                        ) : (
                          <Bookmark size={12} />
                        )}
                        {dbItem.status === "watched" ? "Watched" : "Watchlist"}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mt-3">
                    {title}
                    {year && (
                      <span className="text-fr-text font-normal ml-2 text-xl">
                        ({year})
                      </span>
                    )}
                  </h2>

                  <div className="flex items-center gap-4 mt-3 text-sm text-fr-text">
                    {details?.vote_average !== undefined &&
                      details.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star
                            size={14}
                            className="fill-amber-400 text-amber-400"
                          />
                          <span className="text-amber-300 font-medium">
                            {details.vote_average.toFixed(1)}
                          </span>
                          <span className="text-fr-subtle">/10</span>
                        </div>
                      )}
                    {details?.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{details.runtime} min</span>
                      </div>
                    )}
                    {details?.number_of_seasons && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {details.number_of_seasons} season
                          {details.number_of_seasons > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {genres && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {details?.genres.map((g) => (
                        <span
                          key={g.id}
                          className="px-2.5 py-1 rounded-full bg-fr-surface/80 text-xs text-fr-text border border-fr-border/50"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {details?.overview && (
                <div className="mt-6">
                  <p className="text-sm text-fr-text-light leading-relaxed">
                    {details.overview}
                  </p>
                </div>
              )}

              <div className="mt-8 p-5 rounded-xl bg-fr-surface/50 border border-fr-border/30">
                <div>
                  <h3 className="text-sm font-semibold text-fr-light mb-2">
                    Your Rating
                  </h3>
                  <RatingStars
                    rating={userRating}
                    onChange={handleRatingChange}
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-fr-light mb-2">
                    Notes
                  </h3>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="w-full h-20 px-3 py-2 bg-fr-dark/80 border border-fr-border/50 rounded-lg text-sm text-fr-light placeholder-fr-muted resize-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => handleSave("watched")}
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    dbItem?.status === "watched"
                      ? "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20"
                      : "bg-fr-elevated text-fr-text-light hover:bg-teal-600 hover:text-white border border-fr-border/50 hover:border-transparent hover:shadow-lg hover:shadow-teal-500/20"
                  }`}
                >
                  <Eye size={16} />
                  {dbItem?.status === "watched" ? "Update" : "Mark as Watched"}
                </button>

                <button
                  onClick={() => handleSave("watchlist")}
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    dbItem?.status === "watchlist"
                      ? "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-500/20"
                      : "bg-fr-elevated text-fr-text-light hover:bg-amber-600 hover:text-white border border-fr-border/50 hover:border-transparent hover:shadow-lg hover:shadow-amber-500/20"
                  }`}
                >
                  <Bookmark size={16} />
                  {dbItem?.status === "watchlist"
                    ? "Update"
                    : "Add to Watchlist"}
                </button>

                {dbItem && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-fr-elevated text-red-400 hover:bg-red-600 hover:text-white border border-fr-border/50 hover:border-transparent transition-all ml-auto"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="mt-4 px-4 py-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <p className="text-sm text-teal-400 flex items-center gap-2">
                    <Check size={14} />
                    {saveSuccess}
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
