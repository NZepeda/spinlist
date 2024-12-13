import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (value: number) => void;
}

/**
 * A star rating component that allows the user to select a rating from 1 to 5, allowing increments of 0.5.
 */
export const StarRating = ({ rating, onRatingChange }: StarRatingProps) => {
  const handleStarClick = (starValue: number) => {
    if (rating === starValue) {
      onRatingChange(starValue - 0.5);
    } else {
      onRatingChange(starValue);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => handleStarClick(starValue)}
          className="text-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`Rate ${starValue} stars`}
        >
          {rating >= starValue ? (
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
          ) : rating >= starValue - 0.5 ? (
            <StarHalf className="w-6 h-6 text-yellow-400 fill-current" />
          ) : (
            <Star className="w-6 h-6 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
};
