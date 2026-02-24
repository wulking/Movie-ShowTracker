import { Star } from "lucide-react";
import { useState } from "react";

interface RatingStarsProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function RatingStars({
  rating,
  onChange,
  readonly = false,
  size = 24,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayRating = hovered ?? rating ?? 0;

  function getFillPercent(starIndex: number): number {
    const diff = displayRating - (starIndex - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return diff * 100;
  }

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => !readonly && setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = getFillPercent(star);
        return (
          <div
            key={star}
            className="relative"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="absolute inset-0 text-fr-border-light"
              fill="transparent"
            />

            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-400"
                  fill="currentColor"
                  style={{ minWidth: size }}
                />
              </div>
            )}

            {!readonly && (
              <div className="absolute inset-0 flex">
                <div
                  className="w-1/2 h-full cursor-pointer"
                  onMouseEnter={() => setHovered(star - 0.5)}
                  onClick={() => {
                    if (onChange) {
                      const val = star - 0.5;
                      onChange(val === rating ? 0 : val);
                    }
                  }}
                />
                <div
                  className="w-1/2 h-full cursor-pointer"
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => {
                    if (onChange) {
                      onChange(star === rating ? 0 : star);
                    }
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {displayRating > 0 && (
        <span className="ml-1.5 text-sm text-amber-300 font-medium self-center">
          {displayRating % 1 === 0 ? displayRating : displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
