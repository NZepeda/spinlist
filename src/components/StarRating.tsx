"use client";

import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

type StarFillState = "empty" | "half" | "full";
type StarColorVariant = "selected" | "hover";

const COLOR_CLASSES: Record<StarColorVariant, string> = {
  selected: "text-brand fill-brand",
  hover: "text-brand fill-brand opacity-50",
};

/**
 * Determines the fill state of a star based on the current display value.
 */
function getStarFillState(
  starIndex: number,
  displayValue: number,
): StarFillState {
  if (displayValue >= starIndex) {
    return "full";
  }
  if (displayValue >= starIndex - 0.5) {
    return "half";
  }
  return "empty";
}

/**
 * Renders a star icon with the appropriate fill state and color variant.
 * Uses CSS clip-path for half-star rendering.
 */
function StarIcon({
  fillState,
  sizeClass,
  colorVariant = "selected",
}: {
  fillState: StarFillState;
  sizeClass: string;
  colorVariant?: StarColorVariant;
}) {
  const colorClass = COLOR_CLASSES[colorVariant];

  if (fillState === "empty") {
    return (
      <Star
        className={cn(sizeClass, "text-muted-foreground fill-muted-foreground")}
      />
    );
  }
  if (fillState === "full") {
    return <Star className={cn(sizeClass, colorClass)} />;
  }
  // Half: overlay a clipped filled star on top of empty star
  return (
    <span className="relative inline-flex">
      <Star
        className={cn(sizeClass, "text-muted-foreground fill-muted-foreground")}
      />
      <Star
        className={cn(sizeClass, "absolute left-0 top-0", colorClass)}
        style={{ clipPath: "inset(0 50% 0 0)" }}
      />
    </span>
  );
}

/**
 * Reusable star rating component for rating items from 0.5-5.
 * Supports half-star increments with toggle behavior:
 * - First click on a star sets a full rating (e.g., click star 3 = rating 3)
 * - Click same star again toggles to half (e.g., click star 3 again = rating 2.5)
 */
export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const isInteractive = Boolean(onChange) && !readonly;
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const handleClick = useCallback(
    (starValue: number) => {
      if (!isInteractive || !onChange) {
        return;
      }

      // When hovering, commit the exact hovered value (half or full)
      if (hoveredValue !== null) {
        onChange(hoveredValue);
        return;
      }

      const currentStarValue = Math.ceil(value);

      if (starValue === currentStarValue) {
        const isCurrentlyHalf = value === starValue - 0.5;
        onChange(isCurrentlyHalf ? starValue : starValue - 0.5);
      } else {
        onChange(starValue);
      }

      setHoveredValue(null);
    },
    [isInteractive, onChange, value, hoveredValue],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, starValue: number) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      setHoveredValue(relativeX < 0.5 ? starValue - 0.5 : starValue);
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredValue(null);
  }, []);

  const displayValue = hoveredValue ?? value;
  const colorVariant: StarColorVariant =
    hoveredValue !== null ? "hover" : "selected";

  return (
    <div
      className={cn("flex gap-1", !isInteractive && "pointer-events-none")}
      role="group"
      aria-label="Star rating"
      onMouseLeave={isInteractive ? handleMouseLeave : undefined}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const fillState = getStarFillState(starValue, displayValue);

        if (isInteractive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseMove={(e) => handleMouseMove(e, starValue)}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm max-h-[32px]"
              aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
              aria-pressed={starValue <= value}
            >
              <StarIcon
                fillState={fillState}
                sizeClass={SIZE_CLASSES[size]}
                colorVariant={colorVariant}
              />
            </button>
          );
        }

        return (
          <span key={starValue}>
            <StarIcon fillState={fillState} sizeClass={SIZE_CLASSES[size]} />
          </span>
        );
      })}
    </div>
  );
}
