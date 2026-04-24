// app/provider/location/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';

export default function ProviderLocationPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState({
    lat: 36.8065,
    lng: 10.1815,
    address: '',
    city: '',
    governorate: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing location
  useEffect(() => {
    // Simulated - replace with API call
    setLoading(false);
  }, []);

  const handleSave = () => {
    // API call to save location
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ma Localisation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Fixez et modifiez votre position sur la carte (OBLIGATOIRE)
          </p>
        </div>

        {/* Location Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">📍</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Position actuelle
              </h2>
              <p className="text-sm text-gray-500">
                Coordonnées: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div
            ref={mapRef}
            className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4"
          >
            <div className="text-center">
              <p className="text-gray-500 mb-2">Carte interactive</p>
              <p className="text-sm text-gray-400">
                Cliquez pour placer votre marqueur
              </p>
            </div>
          </div>

          {/* Address Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Adresse complète"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ville"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gouvernorat
              </label>
              <select
                value={location.governorate}
                onChange={(e) => setLocation({ ...location, governorate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner</option>
                <option value="Ariana">Ariana</option>
                <option value="Béja">Béja</option>
                <option value="Ben Arous">Ben Arous</option>
                <option value="Bizerte">Bizerte</option>
                <option value="Gabès">Gabès</option>
                <option value="Gafsa">Gafsa</option>
                <option value="Jendouba">Jendouba</option>
                <option value="Kairouan">Kairouan</option>
                <option value="Kasserine">Kasserine</option>
                <option value="Kébili">Kébili</option>
                <option value="Le Kef">Le Kef</option>
                <option value="Mahdia">Mahdia</option>
                <option value="Manouba">Manouba</option>
                <option value="Médenine">Médenine</option>
                <option value="Monastir">Monastir</option>
                <option value="Nabeul">Nabeul</option>
                <option value="Sfax">Sfax</option>
                <option value="Sidi Bouzid">Sidi Bouzid</option>
                <option value="Siliana">Siliana</option>
                <option value="Sousse">Sousse</option>
                <option value="Tunis">Tunis</option>
                <option value="Zaghouan">Zaghouan</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {saved ? '✓ Enregistré !' : 'Enregistrer la position'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Pourquoi la localisation est-elle obligatoire ?
          </h3>
          <ul className="text-gray-600 dark:text-gray-300 space-y-2">
            <li>✓ Vos clients doivent pouvoir vous trouver facilement</li>
            <li>✓ La carte interactive affiche les services à proximité</li>
            <li>✓ Le calcul d'itinéraire fonctionne correctement</li>
            <li>✓ Votre service apparaît dans les recherches géolocalisées</li>
          </ul>
        </div>
      </div>
    </div>
  );
}