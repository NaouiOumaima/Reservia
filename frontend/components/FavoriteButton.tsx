'use client';

import { useFavorite } from '@/hooks/useFavorite';
import { HeartIconFilled } from '@/components/ui/Icons';

interface FavoriteButtonProps {
  serviceId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };
const iconSizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

export default function FavoriteButton({ serviceId, size = 'md', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggle, loading } = useFavorite(serviceId);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`fav-heart-btn ${sizeMap[size]} ${isFavorite ? 'fav-heart-btn-active' : ''} ${loading ? 'fav-heart-btn-loading' : ''} ${className}`}
    >
      <HeartIconFilled className={iconSizeMap[size]} filled={isFavorite} />
    </button>
  );
}