// app/client/preferences/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { UserPreferences } from '@/types';
import { getAllCategoryLabels } from '@/lib/api/constants/categories.';

export default function ClientPreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteCategories: [],
    maxPrice: undefined,
    maxDistance: undefined,
    preferredDays: [],
    preferredHours: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load preferences from user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.preferences) {
        setPreferences(user.preferences);
      }
    }
    setLoading(false);
  }, []);

  // Utiliser les catégories depuis le fichier constants
  const categories = getAllCategoryLabels();
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleCategoryToggle = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter((c) => c !== category)
        : [...prev.favoriteCategories, category],
    }));
  };

  const handleDayToggle = (day: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays?.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...(prev.preferredDays || []), day],
    }));
  };

  const handleSave = () => {
    // API call to save preferences
    console.log('Saving preferences:', preferences);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes Préférences
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Personnalisez votre expérience de recherche
          </p>
        </div>

        {/* Preferences Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Catégories favorites
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    preferences.favoriteCategories?.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Budget maximum
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={preferences.maxPrice || 0}
                onChange={(e) =>
                  setPreferences({ ...preferences, maxPrice: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="text-gray-900 dark:text-white font-medium">
                {preferences.maxPrice || 0} DT
              </span>
            </div>
          </div>

          {/* Distance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Distance maximale
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={preferences.maxDistance || 10}
                onChange={(e) =>
                  setPreferences({ ...preferences, maxDistance: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="text-gray-900 dark:text-white font-medium">
                {preferences.maxDistance || 10} km
              </span>
            </div>
          </div>

          {/* Preferred Days */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Jours préférés
            </h3>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    preferences.preferredDays?.includes(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Horaires préférés
            </h3>
            <select
              value={preferences.preferredHours || ''}
              onChange={(e) =>
                setPreferences({ ...preferences, preferredHours: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous les horaires</option>
              <option value="morning">Matin (6h-12h)</option>
              <option value="afternoon">Après-midi (12h-18h)</option>
              <option value="evening">Soir (18h-22h)</option>
              <option value="night">Nuit (22h-6h)</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Enregistrer les préférences
          </button>
        </div>
      </div>
    </div>
  );
}