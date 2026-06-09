// components/CategoryFilter.tsx
'use client';

import { AllCategoriesIcon } from '@/components/ui/Icons';
import { CATEGORIES } from '@/lib/api/constants/categories.';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const allCategories = [
    { id: '', name: 'Toutes catégories', icon: <AllCategoriesIcon className="w-5 h-5" /> },
    ...CATEGORIES.map(cat => ({
      id: cat.key,
      name: cat.frenchLabel,
      icon: cat.icon,
    }))
  ];

  return (
    <div className="search-categories">
      <div className="search-categories-wrapper">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`search-category-btn ${
              selectedCategory === category.id
                ? 'search-category-btn-active'
                : 'search-category-btn-inactive'
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}