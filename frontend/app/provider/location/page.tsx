// app/provider/location/page.tsx
'use client';

/**
 * ProviderLocationPage
 * ✅ CORRECTIONS :
 *   - handleMapClick reçoit { lngLat: { lat, lng } } (signature unifiée avec LeafletMapComponent)
 *   - La carte et les champs se mettent à jour en même temps au clic
 *   - reverseGeocode met à jour location.lat/lng → la carte suit via userLocation prop
 */

import { useEffect, useState, useCallback, useRef } from 'react';
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
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
      background: 'rgb(var(--surface-raised))',
    }}>
      <div className="spinner" />
      <p style={{ fontSize: '0.875rem', color: 'rgb(var(--foreground-muted))' }}>
        Chargement de la carte…
      </p>
    </div>
  ),
});

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LocationState {
  lat: number;
  lng: number;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
}

// ─── Helpers gouvernorat ──────────────────────────────────────────────────────

const normalizeGovernorateName = (name: string): string => {
  if (!name) return '';
  const clean = name.replace(/Gouvernorat\s+/i, '').trim();
  for (const gov of TUNISIAN_GOVERNORATES) {
    if (
      clean.toLowerCase() === gov.toLowerCase() ||
      clean.toLowerCase().includes(gov.toLowerCase()) ||
      gov.toLowerCase().includes(clean.toLowerCase())
    ) return gov;
  }
  return clean;
};

const findNearestGovernorate = (lat: number, lng: number): string => {
  let minDist = Infinity, nearest = '';
  for (const gov of TUNISIAN_GOVERNORATES) {
    const coords = GOVERNORATE_COORDINATES[gov as keyof typeof GOVERNORATE_COORDINATES];
    if (coords) {
      const d = Math.sqrt((lat - coords.lat) ** 2 + (lng - coords.lng) ** 2);
      if (d < minDist) { minDist = d; nearest = gov; }
    }
  }
  return nearest;
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ProviderLocationPage() {
  const [services, setServices]             = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [isEditing, setIsEditing]           = useState(false);
  const [geocoding, setGeocoding]           = useState(false);
  const [notice, setNotice]                 = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const hasLoadedRef = useRef(false);

  const [location, setLocation] = useState<LocationState>({
    lat: 36.8065, lng: 10.1815,
    address: '', city: '', governorate: '', postalCode: '',
  });

  // ── Notices ───────────────────────────────────────────────────────────────
  const showNotice = useCallback((type: 'success' | 'error' | 'warning', text: string) => {
    setNotice({ type, text });
    if (type !== 'warning') setTimeout(() => setNotice(null), 3500);
  }, []);

  // ── Chargement des services ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await servicesApi.getByProvider();
        setServices(data);
        if (data?.length && !hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setSelectedServiceId(data[0]._id);
          if (data[0].location?.coordinates?.length >= 2 && data[0].location.address) {
            setLocation({
              lat:         Number(data[0].location.coordinates[1]),
              lng:         Number(data[0].location.coordinates[0]),
              address:     data[0].location.address      || '',
              city:        data[0].location.city         || '',
              governorate: normalizeGovernorateName(data[0].location.governorate || ''),
              postalCode:  data[0].location.postalCode   || '',
            });
          }
        }
      } catch {
        showNotice('error', 'Erreur lors du chargement des services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showNotice]);

  // ── Chargement d'un service sélectionné ──────────────────────────────────
  const loadServiceLocation = useCallback(async (serviceId: string) => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const service = await servicesApi.getById(serviceId);
      if (service.location?.coordinates?.length >= 2 && service.location.address) {
        setLocation({
          lat:         Number(service.location.coordinates[1]),
          lng:         Number(service.location.coordinates[0]),
          address:     service.location.address      || '',
          city:        service.location.city         || '',
          governorate: normalizeGovernorateName(service.location.governorate || ''),
          postalCode:  service.location.postalCode   || '',
        });
      } else {
        setLocation({ lat: 36.8065, lng: 10.1815, address: '', city: '', governorate: '', postalCode: '' });
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      loadServiceLocation(selectedServiceId);
      setIsEditing(false);
    }
  }, [selectedServiceId, loadServiceLocation]);

  // ── Géocodage inverse ─────────────────────────────────────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // Met à jour lat/lng immédiatement (la carte suit via la prop userLocation)
    setLocation(prev => ({ ...prev, lat, lng }));
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&language=fr`,
      );
      const data = await res.json();
      if (data.address) {
        const road    = data.address.road || '';
        const hn      = data.address.house_number || '';
        const sub     = data.address.suburb || '';
        const address = [hn, road, sub].filter(Boolean).join(' ')
          || data.display_name?.split(',').slice(0, 2).join(',')
          || '';
        const city  = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || data.address.region || '';
        let governorate = '';
        for (const gov of TUNISIAN_GOVERNORATES) {
          if (state.toLowerCase().includes(gov.toLowerCase()) || gov.toLowerCase().includes(state.toLowerCase())) {
            governorate = gov; break;
          }
        }
        if (!governorate) governorate = findNearestGovernorate(lat, lng);
        // ✅ Met à jour tous les champs (lat/lng déjà mis à jour ci-dessus)
        setLocation({ lat, lng, address, city, governorate, postalCode: data.address.postcode || '' });
      }
    } catch {
      // lat/lng déjà à jour, on garde les autres champs
    } finally {
      setGeocoding(false);
    }
  }, []);

  // ── ✅ Handler clic carte — signature { lngLat: { lat, lng } } ─────────────
  // Correspond exactement à ce que LeafletMapComponent transmet via onMapClick
  const handleMapClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (!isEditing) return;
      reverseGeocode(e.lngLat.lat, e.lngLat.lng);
    },
    [isEditing, reverseGeocode],
  );

  // ── Géolocalisation GPS ───────────────────────────────────────────────────
  const handleGPS = useCallback(() => {
    if (!isEditing) return;
    if (!navigator.geolocation) { showNotice('error', 'Géolocalisation non supportée'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
      ()    => showNotice('error', "Impossible d'obtenir votre position"),
    );
  }, [isEditing, reverseGeocode, showNotice]);

  // ── Validation ────────────────────────────────────────────────────────────
  const isFormValid = () =>
    location.address.trim() !== '' &&
    location.city.trim()    !== '' &&
    location.governorate    !== '';

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const saveLocation = async () => {
    if (!selectedServiceId) { showNotice('error', 'Sélectionnez un service'); return; }
    if (!isFormValid())     { showNotice('error', 'Remplissez tous les champs obligatoires'); return; }
    setSaving(true);
    try {
      await servicesApi.update(selectedServiceId, {
        location: {
          coordinates: [location.lng, location.lat] satisfies [number, number],
          address:     location.address,
          city:        location.city,
          governorate: location.governorate,
          postalCode:  location.postalCode,
        },
      });
      showNotice('success', 'Localisation enregistrée avec succès');
      setIsEditing(false);
      await loadServiceLocation(selectedServiceId);
    } catch {
      showNotice('error', "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadServiceLocation(selectedServiceId);
    setIsEditing(false);
  };

  // ── Loading initial ───────────────────────────────────────────────────────
  if (loading && services.length === 0) {
    return (
      <div className="prov-location-loading">
        <div className="spinner" />
        <p style={{ fontSize: '0.875rem', color: 'rgb(var(--foreground-muted))' }}>Chargement…</p>
      </div>
    );
  }

  const selectedService      = services.find((s) => s._id === selectedServiceId);
  const hasExistingLocation  = !!selectedService?.location?.address;

  /**
   * Service virtuel transmis à la carte :
   * On injecte location.lat/lng issus de l'état local (mis à jour au clic)
   * pour que la carte reflète immédiatement la nouvelle position.
   */
// Remplacer cette ligne (vers la ligne 210-215 environ) :
const virtualService = selectedService
  ? {
      ...selectedService,
      location: {
        type: 'Point' as const,
        coordinates: [location.lng, location.lat] as [number, number],  // ✅ Correction ici
        address:     location.address,
        city:        location.city,
        governorate: location.governorate,
        postalCode:  location.postalCode,
      },
    }
  : null;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="prov-location-page">
      <div className="prov-location-container">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="prov-location-header">
          <div>
            <Link href="/provider/services" className="prov-location-back">
              <ChevronLeftIcon className="w-4 h-4" /> Retour aux services
            </Link>
            <h1 className="prov-location-title">
              <MapPinIcon className="w-6 h-6" /> Localisation
            </h1>
            <p className="prov-location-subtitle">Définissez l&apos;emplacement de vos services</p>
          </div>

          <div className="prov-location-header-actions">
            {isEditing && (
              <button className="prov-location-cancel-btn" onClick={handleCancel}>
                <XMarkIcon className="w-4 h-4" /> Annuler
              </button>
            )}
            <button
              className={`prov-location-edit-btn ${isEditing ? 'editing' : 'primary'}`}
              onClick={() => setIsEditing((e) => !e)}
            >
              <PencilIcon className="w-4 h-4" />
              {isEditing ? 'En cours de modification' : 'Modifier'}
            </button>
          </div>
        </div>

        {/* ── Sélecteur de service ─────────────────────────────────────── */}
        {services.length > 0 && (
          <div className="prov-location-service-selector">
            <label>Sélectionner un service</label>
            <select
              className="prov-location-service-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={isEditing}
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.location?.address ? '📍' : '⚠️'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Notices ──────────────────────────────────────────────────── */}
        {notice && (
          <div className={`prov-location-notice ${notice.type}`}>
            {notice.type === 'success' && <CheckCircleIcon className="w-4 h-4" />}
            {notice.type === 'error'   && <XCircleIcon     className="w-4 h-4" />}
            {notice.type === 'warning' && <AlertTriangleIcon className="w-4 h-4" />}
            {notice.text}
          </div>
        )}

        {!hasExistingLocation && !isEditing && !notice && (
          <div className="prov-location-notice warning">
            <AlertTriangleIcon className="w-4 h-4" />
            Ce service n&apos;a pas encore de localisation. Cliquez sur &ldquo;Modifier&rdquo; pour en ajouter une.
          </div>
        )}

        {/* ── Panneau principal ────────────────────────────────────────── */}
        {virtualService && (
          <div className="prov-location-panel">

            {/* Top bar */}
            <div className="prov-location-panel-top">
              <div>
                <p className="prov-location-service-name">{selectedService?.name}</p>
                <p className="prov-location-coords">
                  <LocationIcon className="w-3 h-3" />
                  {hasExistingLocation || isEditing
                    ? `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`
                    : 'Aucune position définie'}
                  {geocoding && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#6b7280' }}>
                      ⏳ Géocodage…
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

            {/* ✅ Carte :
                - userLocation = [lng, lat] depuis l'état local (mis à jour immédiatement au clic)
                - onMapClick   = handleMapClick qui reçoit { lngLat: { lat, lng } }
            */}
            <div className="prov-location-map-wrapper">
              <ServiceMap
                services={[virtualService]}
                userLocation={[location.lng, location.lat]}
                selectedService={null}
                onMarkerClick={() => {}}
                isProviderMode={isEditing}
                onMapClick={handleMapClick}
              />
            </div>

            <p className="prov-location-map-hint">
              <MapPinIcon className="w-3 h-3" />
              {isEditing
                ? 'Cliquez sur la carte pour placer le marqueur — les champs se mettent à jour automatiquement'
                : 'Position actuelle du service sur la carte'}
            </p>

            {/* ── Champs formulaire ─────────────────────────────────── */}
            <div className="prov-location-form-grid">

              {/* Adresse */}
              <div className="prov-location-field prov-location-form-full">
                <label className="prov-location-field-label">
                  Adresse {isEditing && <span className="required">*</span>}
                </label>
                <input
                  type="text"
                  className="prov-location-field-input"
                  value={location.address}
                  onChange={(e) => isEditing && setLocation({ ...location, address: e.target.value })}
                  placeholder="Ex : 12 Rue de la Liberté"
                  disabled={!isEditing}
                />
              </div>

              {/* Ville */}
              <div className="prov-location-field">
                <label className="prov-location-field-label">
                  Ville {isEditing && <span className="required">*</span>}
                </label>
                <input
                  type="text"
                  className="prov-location-field-input"
                  value={location.city}
                  onChange={(e) => isEditing && setLocation({ ...location, city: e.target.value })}
                  placeholder="Ex : Tunis"
                  disabled={!isEditing}
                />
              </div>

              {/* Code postal */}
              <div className="prov-location-field">
                <label className="prov-location-field-label">Code postal</label>
                <input
                  type="text"
                  className="prov-location-field-input"
                  value={location.postalCode}
                  onChange={(e) => isEditing && setLocation({ ...location, postalCode: e.target.value })}
                  placeholder="Ex : 1000"
                  disabled={!isEditing}
                />
              </div>

              {/* Gouvernorat */}
              <div className="prov-location-field prov-location-form-full">
                <label className="prov-location-field-label">
                  Gouvernorat {isEditing && <span className="required">*</span>}
                </label>
                <select
                  className="prov-location-field-select"
                  value={location.governorate}
                  onChange={(e) => isEditing && setLocation({ ...location, governorate: e.target.value })}
                  disabled={!isEditing}
                >
                  <option value="">Sélectionner un gouvernorat</option>
                  {TUNISIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
                {isEditing && location.governorate && (
                  <span className="prov-location-field-hint">
                    <CheckIcon className="w-3 h-3" /> Détecté automatiquement
                  </span>
                )}
              </div>

            </div>

            {/* ── Validation ──────────────────────────────────────────── */}
            {isEditing && (
              <div className={`prov-location-validation ${isFormValid() ? 'valid' : 'invalid'}`}>
                {isFormValid()
                  ? <><CheckCircleIcon  className="w-4 h-4" /> Tous les champs obligatoires sont remplis</>
                  : <><AlertTriangleIcon className="w-4 h-4" /> Veuillez remplir les champs marqués *</>}
              </div>
            )}

            {/* ── Actions sauvegarde ───────────────────────────────────── */}
            {isEditing && (
              <div className="prov-location-save-actions">
                <button className="prov-location-cancel-btn" onClick={handleCancel}>
                  <XMarkIcon className="w-4 h-4" /> Annuler
                </button>
                <button
                  className="prov-location-save-btn"
                  onClick={saveLocation}
                  disabled={saving || !isFormValid()}
                >
                  <SaveIcon className="w-4 h-4" />
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}