import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TmdbSearchResult, MediaItem, SelectedMedia } from "../lib/types";
import MediaCard from "./MediaCard";

interface MediaRowProps {
  title: string;
  icon?: React.ReactNode;
  items: TmdbSearchResult[];
  libraryMap: Map<string, MediaItem>;
  onSelect: (media: SelectedMedia) => void;
  onQuickAdd: (
    item: TmdbSearchResult,
    status: "watched" | "watchlist"
  ) => void;
}

export default function MediaRow({
  title,
  icon,
  items,
  libraryMap,
  onSelect,
  onQuickAdd,
}: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    checkScroll();
  }, [items]);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-fr-light">{title}</h2>
          <span className="text-sm text-fr-subtle">({items.length})</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-lg transition-all ${
              canScrollLeft
                ? "bg-fr-elevated/60 text-fr-text-light hover:bg-accent/20 hover:text-accent-light"
                : "bg-fr-surface/40 text-fr-muted cursor-default"
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-lg transition-all ${
              canScrollRight
                ? "bg-fr-elevated/60 text-fr-text-light hover:bg-accent/20 hover:text-accent-light"
                : "bg-fr-surface/40 text-fr-muted cursor-default"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const key = `${item.id}-${item.media_type}`;
          const dbItem = libraryMap.get(key);
          return (
            <div key={key} className="flex-shrink-0 w-[154px]">
              <MediaCard
                tmdbId={item.id}
                title={item.title || item.name || "Unknown"}
                mediaType={item.media_type}
                posterPath={item.poster_path}
                releaseDate={item.release_date || item.first_air_date}
                voteAverage={item.vote_average}
                status={dbItem?.status ?? null}
                onClick={() =>
                  onSelect({
                    tmdbId: item.id,
                    mediaType: item.media_type,
                    title: item.title || item.name || "Unknown",
                    posterPath: item.poster_path,
                  })
                }
                onQuickAdd={(status) => onQuickAdd(item, status)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
