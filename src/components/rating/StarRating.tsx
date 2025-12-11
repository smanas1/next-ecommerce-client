import React from 'react';
import { StarIcon } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  readonly = false,
  className = ''
}) => {
  const handleStarClick = (index: number) => {
    if (interactive && !readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className={`flex ${className}`}>
      {Array.from({ length: totalStars }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleStarClick(index)}
          disabled={readonly || !interactive}
          className={`${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                      ${interactive && !readonly ? 'cursor-pointer hover:text-yellow-500' : 'cursor-default'}
                      focus:outline-none`}
          style={{ width: size, height: size }}
        >
          <StarIcon className="w-full h-full" />
        </button>
      ))}
    </div>
  );
};

export default StarRating;