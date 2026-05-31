// app/provider/location/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/lib/api/services/types';
import { TUNISIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '@/lib/api/constants/governorates';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  MapPinIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  SaveIcon,
  XMarkIcon,
  LocationIcon,
  CheckIcon,
} from '@/components/ui/Icons';

const ServiceMap = dynamic(() => import('@/app/client/carte/ServiceMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'rgb(var(--surface-raised))' }}>
      <div className="spinner" />
      <p style={{ fontSize: '0.875rem', color: 'rgb(var(--foreground-muted))' }}>Chargement de la carte…</p>
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

const normalizeGovernorateName = (name: string): string => {
  if (!name) return '';
  const cleanName = name.replace(/Gouvernorat\s+/i, '').trim();
  for (const gov of TUNISIAN_GOVERNORATES) {
    if (
      cleanName.toLowerCase() === gov.toLowerCase() ||
      cleanName.toLowerCase().includes(gov.toLowerCase()) ||
      gov.toLowerCase().includes(cleanName.toLowerCase())
    ) return gov;
  }
  return cleanName;
};

const findNearestGovernorate = (lat: number, lng: number): string => {
  let minDistance = Infinity;
  let nearest = '';
  for (const gov of TUNISIAN_GOVERNORATES) {
    const coords = GOVERNORATE_COORDINATES[gov as keyof typeof GOVERNORATE_COORDINATES];
    if (coords) {
      const d = Math.sqrt(Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2));
      if (d < minDistance) { minDistance = d; nearest = gov; }
    }
  }
  return nearest;
};

export default function ProviderLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get('serviceId');

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(serviceIdFromUrl);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const geocodeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [location, setLocation] = useState<LocationState>({
    lat: 36.8065,
    lng: 10.1815,
    address: '',
    city: '',
    governorate: '',
    postalCode: '',
  });

  const showNotice = (type: 'success' | 'error' | 'warning', text: string) => {
    setNotice({ type, text });
    if (type !== 'warning') setTimeout(() => setNotice(null), 3500);
  };

  // Charger tous les services du provider
  const loadServices = useCallback(async () => {
    try {
      const data = await servicesApi.getByProvider();
      setServices(data);
      
      if (!selectedServiceId && data.length > 0) {
        setSelectedServiceId(data[0]._id);
      }
    } catch (err) {
      showNotice('error', 'Erreur lors du chargement des services');
    }
  }, [selectedServiceId]);

  // Charger le service sélectionné
  const loadService = useCallback(async () => {
    if (!selectedServiceId) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await servicesApi.getById(selectedServiceId);
      setService(data);

      if (data.location?.coordinates?.length >= 2 && data.location.address) {
        setLocation({
          lat: Number(data.location.coordinates[1]),
          lng: Number(data.location.coordinates[0]),
          address: data.location.address || '',
          city: data.location.city || '',
          governorate: normalizeGovernorateName(data.location.governorate || ''),
          postalCode: data.location.postalCode || '',
        });
      } else {
        setLocation({ lat: 36.8065, lng: 10.1815, address: '', city: '', governorate: '', postalCode: '' });
        setIsEditing(true);
      }
    } catch {
      showNotice('error', 'Erreur lors du chargement du service');
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId]);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      setLoading(true);
      loadService();
    }
  }, [selectedServiceId, loadService]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    router.replace(`/provider/location?serviceId=${serviceId}`);
    setIsEditing(false);
  };

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&language=fr`
      );
      const data = await res.json();
      if (data.address) {
        const road = data.address.road || '';
        const hn   = data.address.house_number || '';
        const sub  = data.address.suburb || '';
        const address = [hn, road, sub].filter(Boolean).join(' ') ||
          data.display_name?.split(',').slice(0, 2).join(',') || '';
        const city  = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || data.address.region || '';
        let governorate = '';
        for (const gov of TUNISIAN_GOVERNORATES) {
          if (
            state.toLowerCase().includes(gov.toLowerCase()) ||
            gov.toLowerCase().includes(state.toLowerCase())
          ) {
            governorate = gov;
            break;
          }
        }
        if (!governorate) governorate = findNearestGovernorate(lat, lng);
        setLocation({ lat, lng, address, city, governorate, postalCode: data.address.postcode || '' });
      } else {
        setLocation(prev => ({ ...prev, lat, lng }));
      }
    } catch {
      setLocation(prev => ({ ...prev, lat, lng }));
    }
  }, []);

  const forwardGeocode = useCallback(async (address: string, city: string, governorate: string) => {
    const query = [address, city, governorate, 'Tunisie'].filter(Boolean).join(', ');
    if (query.replace(/,\s*/g, '').trim().length < 3) return;

    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=tn`
      );
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        setLocation(prev => ({
          ...prev,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        }));
      }
    } catch {
      // Silencieux
    } finally {
      setGeocoding(false);
    }
  }, []);

  const scheduleForwardGeocode = useCallback(
    (address: string, city: string, governorate: string) => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => {
        forwardGeocode(address, city, governorate);
      }, 900);
    },
    [forwardGeocode],
  );

  useEffect(() => {
    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, []);

  const handleFieldChange = (field: keyof LocationState, value: string) => {
    if (!isEditing) return;
    const next = { ...location, [field]: value };
    setLocation(next);
    if (next.address || next.city || next.governorate) {
      scheduleForwardGeocode(next.address, next.city, next.governorate);
    }
  };

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (isEditing) reverseGeocode(lat, lng);
    },
    [isEditing, reverseGeocode],
  );

  const handleGPS = () => {
    if (!isEditing) return;
    if (!navigator.geolocation) { showNotice('error', 'Géolocalisation non supportée'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
      () => showNotice('error', "Impossible d'obtenir votre position"),
    );
  };

  const isFormValid = () =>
    location.address.trim() !== '' &&
    location.city.trim() !== '' &&
    location.governorate !== '';

  const saveLocation = async () => {
    if (!selectedServiceId) { showNotice('error', 'Aucun service sélectionné'); return; }
    if (!isFormValid()) { showNotice('error', 'Remplissez tous les champs obligatoires'); return; }
    setSaving(true);
    try {
      await servicesApi.updateLocation(selectedServiceId, {
        location: {
          coordinates: { lng: location.lng, lat: location.lat },
          address: location.address,
          city: location.city,
          governorate: location.governorate,
          postalCode: location.postalCode,
        },
      });
      showNotice('success', 'Localisation enregistrée avec succès');
      setIsEditing(false);
      await loadService();
    } catch {
      showNotice('error', "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { loadService(); setIsEditing(false); };

  if (loading && !service) {
    return (
      <div className="prov-location-loading">
        <div className="spinner" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="prov-location-loading">
        <p>Aucun service trouvé.</p>
        <Link href="/provider/services" className="prov-location-back">← Créer un service</Link>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="prov-location-loading">
        <p>Service introuvable.</p>
        <Link href="/provider/services" className="prov-location-back">← Retour aux services</Link>
      </div>
    );
  }

  const hasExistingLocation = !!(service?.location?.address);

  const virtualService = {
    ...service,
    location: {
      type: 'Point' as const,
      coordinates: [location.lng, location.lat] as [number, number],
      address: location.address,
      city: location.city,
      governorate: location.governorate,
      postalCode: location.postalCode,
    },
  };

  return (
    <div className="prov-location-page">
      <div className="prov-location-container">

        <div className="prov-location-header">
          <div>
            <Link href="/provider/services" className="prov-location-back">
              <ChevronLeftIcon className="w-4 h-4" /> Retour aux services
            </Link>
            <h1 className="prov-location-title">
              <MapPinIcon className="w-6 h-6" /> Localisation
            </h1>
            <p className="prov-location-subtitle">
              Gérez la localisation de vos services
            </p>
          </div>

          <div className="prov-location-header-actions">
            {isEditing && (
              <button className="prov-location-cancel-btn" onClick={handleCancel}>
                <XMarkIcon className="w-4 h-4" /> Annuler
              </button>
            )}
            <button
              className={`prov-location-edit-btn ${isEditing ? 'editing' : 'primary'}`}
              onClick={() => setIsEditing(e => !e)}
            >
              <PencilIcon className="w-4 h-4" />
              {isEditing ? 'En cours de modification' : 'Modifier'}
            </button>
          </div>
        </div>

        {/* Sélecteur de service */}
        <div className="prov-location-service-selector">
          <label className="prov-location-service-label">Service :</label>
          <select
            value={selectedServiceId || ''}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="prov-location-service-select"
          >
            {services.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} {!s.isActive ? '(inactif)' : s.isPendingApproval ? '(en attente)' : ''}
              </option>
            ))}
          </select>
        </div>

        {notice && (
          <div className={`prov-location-notice ${notice.type}`}>
            {notice.type === 'success' && <CheckCircleIcon className="w-4 h-4" />}
            {notice.type === 'error'   && <XCircleIcon className="w-4 h-4" />}
            {notice.type === 'warning' && <AlertTriangleIcon className="w-4 h-4" />}
            {notice.text}
          </div>
        )}

        {!hasExistingLocation && !isEditing && !notice && (
          <div className="prov-location-notice warning">
            <AlertTriangleIcon className="w-4 h-4" />
            Ce service n'a pas encore de localisation. Cliquez sur "Modifier" pour en ajouter une.
          </div>
        )}

        <div className="prov-location-panel">
          <div className="prov-location-panel-top">
            <div>
              <p className="prov-location-service-name">{service.name}</p>
              <p className="prov-location-coords">
                <LocationIcon className="w-3 h-3" />
                {hasExistingLocation || (location.address && location.lat !== 36.8065)
                  ? `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`
                  : 'Aucune position définie'}
                {geocoding && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'rgb(var(--foreground-muted))' }}>
                    🔍 Recherche…
                  </span>
                )}
              </p>
            </div>
            {isEditing && (
              <button className="prov-location-gps-btn" onClick={handleGPS}>
                <MapPinIcon className="w-4 h-4" /> Ma position
              </button>
            )}
          </div>

          <div className="prov-location-map-wrapper">
            <ServiceMap
              services={[virtualService]}
              userLocation={[location.lng, location.lat]}
              selectedService={null}
              onMarkerClick={() => {}}
              isProviderMode={true}
              onMapClick={handleMapClick}
            />
          </div>

          <p className="prov-location-map-hint">
            <MapPinIcon className="w-3 h-3" />
            {isEditing
              ? 'Cliquez sur la carte OU remplissez les champs — la carte se met à jour automatiquement'
              : 'Position actuelle du service sur la carte'}
          </p>

          <div className="prov-location-form-grid">
            <div className="prov-location-field prov-location-form-full">
              <label className="prov-location-field-label">
                Adresse {isEditing && <span className="required">*</span>}
              </label>
              <input
                type="text"
                className="prov-location-field-input"
                value={location.address}
                onChange={e => handleFieldChange('address', e.target.value)}
                placeholder="Ex : 12 Rue de la Liberté"
                disabled={!isEditing}
              />
            </div>

            <div className="prov-location-field">
              <label className="prov-location-field-label">
                Ville {isEditing && <span className="required">*</span>}
              </label>
              <input
                type="text"
                className="prov-location-field-input"
                value={location.city}
                onChange={e => handleFieldChange('city', e.target.value)}
                placeholder="Ex : Tunis"
                disabled={!isEditing}
              />
            </div>

            <div className="prov-location-field">
              <label className="prov-location-field-label">Code postal</label>
              <input
                type="text"
                className="prov-location-field-input"
                value={location.postalCode}
                onChange={e => handleFieldChange('postalCode', e.target.value)}
                placeholder="Ex : 1000"
                disabled={!isEditing}
              />
            </div>

            <div className="prov-location-field prov-location-form-full">
              <label className="prov-location-field-label">
                Gouvernorat {isEditing && <span className="required">*</span>}
              </label>
              <select
                className="prov-location-field-select"
                value={location.governorate}
                onChange={e => handleFieldChange('governorate', e.target.value)}
                disabled={!isEditing}
              >
                <option value="">Sélectionner un gouvernorat</option>
                {TUNISIAN_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              {isEditing && location.governorate && (
                <span className="prov-location-field-hint">
                  <CheckIcon className="w-3 h-3" />
                  {geocoding ? 'Mise à jour de la carte…' : 'Détecté automatiquement'}
                </span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className={`prov-location-validation ${isFormValid() ? 'valid' : 'invalid'}`}>
              {isFormValid()
                ? <><CheckCircleIcon className="w-4 h-4" /> Tous les champs obligatoires sont remplis</>
                : <><AlertTriangleIcon className="w-4 h-4" /> Veuillez remplir les champs marqués *</>}
            </div>
          )}

          {isEditing && (
            <div className="prov-location-save-actions">
              <button className="prov-location-cancel-btn" onClick={handleCancel}>
                <XMarkIcon className="w-4 h-4" /> Annuler
              </button>
              <button
                className="prov-location-save-btn"
                onClick={saveLocation}
                disabled={saving || !isFormValid() || geocoding}
              >
                <SaveIcon className="w-4 h-4" />
                {saving ? 'Enregistrement…' : geocoding ? 'Localisation…' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}