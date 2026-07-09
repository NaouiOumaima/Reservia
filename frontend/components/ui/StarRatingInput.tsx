'use client';

import { useState } from 'react';
import { StarIcon } from './Icons';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: string;
  disabled?: boolean;
}

export default function StarRatingInput({
  value,
  onChange,
  size = 'w-8 h-8',
  disabled = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Note">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <StarIcon
            className={`${size} transition-colors ${
              star <= active
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
