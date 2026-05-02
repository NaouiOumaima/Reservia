'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { servicesApi } from '@/lib/api/services';
import { LocationIcon, CheckIcon } from '@/components/ui/Icons';
import { Service } from '@/lib/api/services/types';

const ServiceMap = dynamic(() => import('@/app/client/carte/ServiceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
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
  postalCode: string;
}

export default function ProviderLocationPage() {
  const [location, setLocation] = useState<LocationState>({
    lat: 36.8065,
    lng: 10.1815,
    address: '',
    city: '',
    governorate: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [hasExistingService, setHasExistingService] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      setLoading(true);
      try {
        const data = await servicesApi.getByProvider();
        console.log('Données reçues:', data);
        
        setServices(data);
        
        if (data && Array.isArray(data) && data.length > 0 && data[0].location) {
          setHasExistingService(true);
          const loc = data[0].location;
          
          if (loc.coordinates && loc.coordinates.length >= 2) {
            setLocation({
              lat: loc.coordinates[1],
              lng: loc.coordinates[0],
              address: loc.address || '',
              city: loc.city || '',
              governorate: loc.governorate || '',
              postalCode: loc.postalCode || '',
            });
          } else {
            console.warn('Coordonnées manquantes dans la localisation');
            setHasExistingService(false);
          }
        } else {
          console.log('Aucune localisation trouvée');
          setHasExistingService(false);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err);
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement');
        setHasExistingService(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadLocation();
  }, []);

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
          postalCode: data.address.postcode || '',
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

  const handleMapClick = useCallback((event: any) => {
    if (event && event.lngLat) {
      reverseGeocode(event.lngLat.lat, event.lngLat.lng);
    }
  }, [reverseGeocode]);

  const handleSave = async () => {
    if (!location.address || !location.city || !location.governorate) {
      setError('Veuillez remplir l\'adresse, la ville et le gouvernorat');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await servicesApi.upsertLocation({
        location: {
          coordinates: {
            lng: location.lng,
            lat: location.lat,
          },
          address: location.address,
          city: location.city,
          governorate: location.governorate,
          postalCode: location.postalCode,
        },
      });

      setHasExistingService(result.action === 'updated');
      
      if (result.action === 'created') {
        setServices([result.service]);
      } else if (result.action === 'updated' && services.length > 0) {
        setServices([result.service]);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la localisation');
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
          setError('Impossible d\'obtenir votre position. Vérifiez vos permissions.');
          setLoading(false);
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  const virtualService = {
    _id: 'provider-location',
    name: hasExistingService && services[0]?.name ? services[0].name : 'Votre établissement',
    category: location.address ? (hasExistingService ? services[0]?.category || 'Établissement' : 'Établissement') : 'Position à définir',
    basePrice: hasExistingService && services[0]?.basePrice ? services[0].basePrice : 0,
    avgRating: hasExistingService && services[0]?.avgRating ? services[0].avgRating : 0,
    reviewCount: hasExistingService && services[0]?.reviewCount ? services[0].reviewCount : 0,
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat],
      address: location.address,
      city: location.city,
      governorate: location.governorate,
      postalCode: location.postalCode,
    },
    images: hasExistingService && services[0]?.images ? services[0].images : [],
    duration: hasExistingService && services[0]?.duration ? services[0].duration : 60,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-foreground">Ma Localisation</h1>
          <p className="text-muted mt-1">
            {hasExistingService 
              ? 'Modifiez votre position sur la carte pour que vos clients puissent vous trouver' 
              : 'Définissez votre position pour que vos clients puissent vous trouver'}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6">
            <p className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {saved && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-success" />
            <p>Localisation enregistrée avec succès !</p>
          </div>
        )}

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LocationIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Position actuelle</h2>
                <p className="text-sm text-muted">
                  Coordonnées: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <button 
              onClick={handleUseCurrentLocation} 
              className="btn btn-ghost"
            >
              <LocationIcon className="w-4 h-4" /> 
              Utiliser ma position GPS
            </button>
          </div>

          <div className="h-96 rounded-lg overflow-hidden mb-4 border border-border">
            <ServiceMap
              services={[virtualService]}
              userLocation={[location.lng, location.lat]}
              selectedService={null}
              onMarkerClick={handleMarkerClick}
              isProviderMode={true}
              onMapClick={handleMapClick}
            />
          </div>

          <p className="text-sm text-muted mb-6 flex items-center gap-2">
            <span className="text-lg">💡</span> 
            Cliquez sur la carte pour placer ou déplacer votre marqueur
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                Adresse <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                className="input"
                placeholder="Ex: 12 Rue de la Liberté"
              />
            </div>
            <div>
              <label className="label">Code postal</label>
              <input
                type="text"
                value={location.postalCode}
                onChange={(e) => setLocation({ ...location, postalCode: e.target.value })}
                className="input"
                placeholder="Ex: 1000"
              />
            </div>
            <div>
              <label className="label">
                Ville <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                className="input"
                placeholder="Ex: Tunis"
              />
            </div>
            <div>
              <label className="label">
                Gouvernorat <span className="text-error">*</span>
              </label>
              <select
                value={location.governorate}
                onChange={(e) => setLocation({ ...location, governorate: e.target.value })}
                className="input"
              >
                <option value="">Sélectionner un gouvernorat</option>
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

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>{hasExistingService ? 'Mettre à jour ma position' : 'Enregistrer ma position'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
          <h3 className="font-semibold text-foreground mb-3">Pourquoi la localisation est-elle importante ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <span className="text-primary text-xl">✓</span>
              <span className="text-foreground-muted">Vos clients peuvent vous trouver facilement</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary text-xl">✓</span>
              <span className="text-foreground-muted">Apparaissez dans les recherches à proximité</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary text-xl">✓</span>
              <span className="text-foreground-muted">Calcul d'itinéraire précis pour vos clients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}