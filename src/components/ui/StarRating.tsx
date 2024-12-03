import { Star, StarHalf } from "lucide-react";

export const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const handleStarClick = (starValue: number) => {
    if (value === starValue) {
      onChange(starValue - 0.5);
    } else {
      onChange(starValue);
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
          {value >= starValue ? (
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
          ) : value >= starValue - 0.5 ? (
            <StarHalf className="w-6 h-6 text-yellow-400 fill-current" />
          ) : (
            <Star className="w-6 h-6 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
};
