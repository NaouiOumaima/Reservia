'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { servicesApi } from '@/lib/api/services';
import { LocationIcon, CheckIcon } from '@/components/ui/Icons';

// 🔥 Import dynamique du ServiceMap (existant)
const ServiceMap = dynamic(() => import('@/app/client/carte/ServiceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface LocationState {
  lat: number;
  lng: number;
  address: string;
  city: string;
  governorate: string;
}

export default function ProviderLocationPage() {
  const [location, setLocation] = useState<LocationState>({
    lat: 36.8065,
    lng: 10.1815,
    address: '',
    city: '',
    governorate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const data = await servicesApi.getByProvider();
        setServices(data);
        if (data && data.length > 0 && data[0].location) {
          const loc = data[0].location;
          setLocation({
            lat: loc.coordinates[1],
            lng: loc.coordinates[0],
            address: loc.address || '',
            city: loc.city || '',
            governorate: loc.governorate || '',
          });
        }
      } catch (err) {
        console.log('Aucune localisation trouvée, utilisation des coordonnées par défaut');
      } finally {
        setLoading(false);
      }
    };
    loadLocation();
  }, []);

  // Géocodage inversé
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&language=fr`
      );
      const data = await response.json();
      if (data.address) {
        const addressParts = [data.address.road, data.address.house_number, data.address.suburb].filter(Boolean);
        const address = addressParts.join(', ');
        setLocation((prev) => ({
          ...prev,
          lat,
          lng,
          address: address || data.display_name?.split(',').slice(0, 2).join(',') || '',
          city: data.address.city || data.address.town || data.address.village || '',
          governorate: data.address.state || '',
        }));
      } else {
        setLocation((prev) => ({ ...prev, lat, lng }));
      }
    } catch (err) {
      console.error('Erreur de géocodage inversé', err);
      setLocation((prev) => ({ ...prev, lat, lng }));
    }
  }, []);

  const handleMarkerClick = useCallback((service: any) => {
    if (service?.location) {
      reverseGeocode(service.location.coordinates[1], service.location.coordinates[0]);
    }
  }, [reverseGeocode]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = await servicesApi.getByProvider();
      if (data && data.length > 0) {
        await servicesApi.update(data[0]._id, {
          location: {
            coordinates: [location.lng, location.lat],
            address: location.address,
            city: location.city,
            governorate: location.governorate,
          },
        });
      } else {
        await servicesApi.create({
          name: 'Mon Service',
          category: 'other',
          description: 'Service créé via la localisation',
          basePrice: 0,
          duration: 60,
          location: {
            coordinates: [location.lng, location.lat],
            address: location.address,
            city: location.city,
            governorate: location.governorate,
          },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Erreur lors de l’enregistrement');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          reverseGeocode(position.coords.latitude, position.coords.longitude);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError('Impossible d’obtenir votre position');
          setLoading(false);
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  // Créer un service virtuel pour l'affichage sur la carte
  const virtualService = {
    _id: 'provider-location',
    name: 'Votre établissement',
    category: location.address ? 'Établissement' : 'Position à définir',
    basePrice: 0,
    avgRating: 0,
    reviewCount: 0,
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat],
      address: location.address,
      city: location.city,
      governorate: location.governorate,
    },
    images: [],
    duration: 0,
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Ma Localisation</h1>
          <p className="text-muted mt-1">Fixez et modifiez votre position sur la carte</p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <LocationIcon className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Position actuelle</h2>
                <p className="text-sm text-muted">
                  Coordonnées: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <button onClick={handleUseCurrentLocation} className="btn btn-accent">
              <LocationIcon className="w-4 h-4" /> Ma position GPS
            </button>
          </div>

          <div className="h-96 rounded-lg overflow-hidden mb-4">
            <ServiceMap
              services={[virtualService]}
              userLocation={[location.lng, location.lat]}
              selectedService={null}
              onMarkerClick={handleMarkerClick}
            />
          </div>

          <p className="text-sm text-muted mb-4">
            Cliquez sur la carte pour placer ou déplacer votre marqueur
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Adresse</label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                className="input"
                placeholder="Adresse complète"
              />
            </div>
            <div>
              <label className="label">Ville</label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                className="input"
                placeholder="Ville"
              />
            </div>
            <div>
              <label className="label">Gouvernorat</label>
              <select
                value={location.governorate}
                onChange={(e) => setLocation({ ...location, governorate: e.target.value })}
                className="input"
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

          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : saved ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <span>Enregistrer la position</span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-primary-soft rounded-lg p-6">
          <h3 className="font-semibold mb-2">Pourquoi la localisation est-elle obligatoire ?</h3>
          <ul className="text-muted space-y-1">
            <li>✓ Vos clients doivent pouvoir vous trouver facilement</li>
            <li>✓ La carte interactive affiche les services à proximité</li>
            <li>✓ Le calcul d'itinéraire fonctionne correctement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}