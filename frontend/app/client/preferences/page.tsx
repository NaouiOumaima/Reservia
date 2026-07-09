'use client';

import { useEffect, useState } from 'react';
import { UserPreferences } from '@/types';
import { getAllCategoryLabels } from '@/lib/api/constants/categories.';

export default function ClientPreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteCategories: [],
    maxDistance: undefined,
    preferredDays: [],
    preferredHours: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.preferences) {
        setPreferences(user.preferences);
      }
    }
    setLoading(false);
  }, []);

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
    console.log('Saving preferences:', preferences);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Mes Préférences</h1>
          <p className="text-muted mt-1">Personnalisez votre expérience de recherche</p>
        </div>

        <div className="card space-y-6">
          {/* Catégories favorites */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Catégories favorites</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`btn btn-sm ${preferences.favoriteCategories?.includes(category) ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Distance maximale */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Distance maximale</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={preferences.maxDistance || 10}
                onChange={(e) =>
                  setPreferences({ ...preferences, maxDistance: Number(e.target.value) })
                }
                className="flex-1 accent-primary"
              />
              <span className="font-medium text-foreground">{preferences.maxDistance || 10} km</span>
            </div>
          </div>

          {/* Jours préférés */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Jours préférés</h3>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`btn btn-sm ${preferences.preferredDays?.includes(day) ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Horaires préférés */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Horaires préférés</h3>
            <select
              value={preferences.preferredHours || ''}
              onChange={(e) =>
                setPreferences({ ...preferences, preferredHours: e.target.value })
              }
              className="input max-w-xs"
            >
              <option value="">Tous les horaires</option>
              <option value="morning">Matin (6h-12h)</option>
              <option value="afternoon">Après-midi (12h-18h)</option>
              <option value="evening">Soir (18h-22h)</option>
              <option value="night">Nuit (22h-6h)</option>
            </select>
          </div>

          <button onClick={handleSave} className="btn btn-primary w-full">
            Enregistrer les préférences
          </button>
        </div>
      </div>
    </div>
  );
}