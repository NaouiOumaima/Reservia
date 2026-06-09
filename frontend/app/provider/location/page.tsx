'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { servicesApi } from '@/lib/api/services';
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

// Dynamic import — map must not SSR
const ServiceMap = dynamic(() => import('@/app/client/carte/ServiceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-surface-raised">
      <div className="spinner" />
      <p className="text-sm text-muted">Chargement de la carte…</p>
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Loc {
  lat: number;
  lng: number;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_LOC: Loc = {
  lat: 36.8065, lng: 10.1815,
  address: '', city: '', governorate: '', postalCode: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeGov(name: string): string {
  if (!name) return '';
  const clean = name.replace(/Gouvernorat\s+/i, '').trim();
  return (
    TUNISIAN_GOVERNORATES.find(
      (g) =>
        clean.toLowerCase() === g.toLowerCase() ||
        clean.toLowerCase().includes(g.toLowerCase()) ||
        g.toLowerCase().includes(clean.toLowerCase()),
    ) ?? clean
  );
}

function nearestGov(lat: number, lng: number): string {
  let min = Infinity;
  let found = '';
  for (const g of TUNISIAN_GOVERNORATES) {
    const c = (GOVERNORATE_COORDINATES as Record<string, { lat: number; lng: number }>)[g];
    if (c) {
      const d = Math.hypot(lat - c.lat, lng - c.lng);
      if (d < min) { min = d; found = g; }
    }
  }
  return found;
}

function isValidService(s: any): boolean {
  return (
    s?.location?.coordinates?.length === 2 &&
    !!s.location.address?.trim() &&
    !!s.location.city?.trim() &&
    !!s.location.governorate?.trim()
  );
}

function serviceToLoc(s: any): Loc {
  return {
    lat:         +s.location.coordinates[1],
    lng:         +s.location.coordinates[0],
    address:     s.location.address     ?? '',
    city:        s.location.city        ?? '',
    governorate: normalizeGov(s.location.governorate ?? ''),
    postalCode:  s.location.postalCode  ?? '',
  };
}

// ─── Page content ─────────────────────────────────────────────────────────────

function ProviderLocationContent() {
  const sp    = useSearchParams();
  const urlId = sp.get('serviceId');

  const [services,  setServices]  = useState<any[]>([]);
  const [selId,     setSelId]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [notice,    setNotice]    = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [loc, setLoc] = useState<Loc>(EMPTY_LOC);

  // ── Flash ──────────────────────────────────────────────────────────────
  const flash = useCallback(
    (type: 'success' | 'error' | 'warning', text: string) => {
      setNotice({ type, text });
      if (type !== 'warning') setTimeout(() => setNotice(null), 3500);
    },
    [],
  );

  // ── Load provider services ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await servicesApi.getByProvider();
        const list = Array.isArray(data) ? data : [];
        setServices(list);
        if (list.length) {
          const id  = urlId ?? list[0]._id;
          const svc = list.find((s: any) => s._id === id);
          setSelId(id);
          setLoc(svc && isValidService(svc) ? serviceToLoc(svc) : EMPTY_LOC);
        }
      } catch {
        flash('error', 'Erreur lors du chargement des services');
      } finally {
        setLoading(false);
      }
    })();
  }, [urlId, flash]);

  // ── Reload a single service's location ────────────────────────────────
  const reloadLoc = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const s = await servicesApi.getById(id);
      setLoc(isValidService(s) ? serviceToLoc(s) : EMPTY_LOC);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // When selected service changes, reload its loc and exit edit mode
  useEffect(() => {
    if (selId) { reloadLoc(selId); setEditing(false); }
  }, [selId, reloadLoc]);

  // ── Reverse geocoding via Nominatim (free, OSM-based) ────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoc((prev) => ({ ...prev, lat, lng }));
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse` +
        `?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`,
      );
      const d = await res.json();
      if (d?.address) {
        const address = [
          d.address.house_number,
          d.address.road,
          d.address.suburb,
        ]
          .filter(Boolean)
          .join(' ')
          || d.display_name?.split(',').slice(0, 2).join(',')
          || '';

        const city        = d.address.city ?? d.address.town ?? d.address.village ?? '';
        const state       = d.address.state ?? d.address.region ?? '';
        const governorate =
          TUNISIAN_GOVERNORATES.find(
            (g) =>
              state.toLowerCase().includes(g.toLowerCase()) ||
              g.toLowerCase().includes(state.toLowerCase()),
          ) ?? nearestGov(lat, lng);

        setLoc({
          lat,
          lng,
          address,
          city,
          governorate,
          postalCode: d.address.postcode ?? '',
        });
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setGeocoding(false);
    }
  }, []);

  // ── Map click handler (only when editing) ─────────────────────────────
  const onMapClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (editing) reverseGeocode(e.lngLat.lat, e.lngLat.lng);
    },
    [editing, reverseGeocode],
  );

  // ── GPS button ────────────────────────────────────────────────────────
  const onGPS = useCallback(() => {
    if (!editing) return;
    if (!navigator.geolocation) {
      flash('error', 'Géolocalisation non supportée par ce navigateur');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => reverseGeocode(p.coords.latitude, p.coords.longitude),
      () => flash('error', "Impossible d'obtenir votre position"),
    );
  }, [editing, reverseGeocode, flash]);

  // ── Form validation ───────────────────────────────────────────────────
  const formValid = () =>
    !!loc.address.trim() && !!loc.city.trim() && !!loc.governorate;

  // ── Save ──────────────────────────────────────────────────────────────
  const save = async () => {
    if (!selId)      { flash('error', 'Sélectionnez un service');                  return; }
    if (!formValid()) { flash('error', 'Remplissez tous les champs obligatoires'); return; }

    setSaving(true);
    try {
      await servicesApi.update(selId, {
        location: {
          coordinates: [loc.lng, loc.lat] as [number, number],
          address:     loc.address,
          city:        loc.city,
          governorate: loc.governorate,
          postalCode:  loc.postalCode,
        },
      });
      flash('success', 'Localisation enregistrée avec succès');
      setEditing(false);
      await reloadLoc(selId);
    } catch {
      flash('error', "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => { reloadLoc(selId); setEditing(false); };

  // ─── Derived values ───────────────────────────────────────────────────

  if (loading && !services.length) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface">
        <div className="spinner" />
      </div>
    );
  }

  const selSvc = services.find((s) => s._id === selId);
  const hasLoc = selSvc ? isValidService(selSvc) : false;

  // Build a virtual service object so the map renders the pin at the current loc
  const virtualService = selSvc
    ? {
        ...selSvc,
        location: {
          type:        'Point' as const,
          coordinates: [loc.lng, loc.lat] as [number, number],
          address:     loc.address,
          city:        loc.city,
          governorate: loc.governorate,
          postalCode:  loc.postalCode,
        },
      }
    : null;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-app py-8">

        {/* ── Page header ── */}
        <div className="animate-fadeIn mb-8 flex flex-wrap gap-4 items-start justify-between">
          <div>
            <Link
              href="/provider/services"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary
                         transition-colors rounded-pill px-3 py-1 bg-surface-raised
                         border border-border hover-lift mb-3"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Retour aux services
            </Link>

            <h1 className="flex items-center gap-3 mt-1">
              <span className="inline-flex p-2 rounded-app bg-primary-soft text-primary animate-bounce-in">
                <MapPinIcon className="w-6 h-6" />
              </span>
              <span className="font-display text-foreground">Localisation</span>
            </h1>
            <p className="text-muted text-sm mt-1 pl-1">
              Définissez l&apos;emplacement exact de votre service sur la carte
            </p>
          </div>

          <div className="flex gap-2">
            {editing && (
              <button className="btn btn-ghost animate-fadeIn" onClick={cancel}>
                <XMarkIcon className="w-4 h-4" /> Annuler
              </button>
            )}
            <button
              className={`btn ${editing ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => setEditing((e) => !e)}
            >
              <PencilIcon className="w-4 h-4" />
              {editing ? 'En modification…' : 'Modifier'}
            </button>
          </div>
        </div>

        {/* ── Service selector ── */}
        {services.length > 0 && (
          <div className="card mb-6 animate-fadeInUp p-4">
            <label className="label">Service concerné</label>
            <select
              className="input"
              style={{ maxWidth: '28rem' }}
              value={selId}
              onChange={(e) => setSelId(e.target.value)}
              disabled={editing}
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {isValidService(s) ? '📍' : '⚠️'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Notice banner ── */}
        {notice && (
          <div
            className={[
              'alert animate-slideInRight mb-6',
              notice.type === 'success' ? 'alert-success' :
              notice.type === 'error'   ? 'alert-error'   : 'alert-warning',
            ].join(' ')}
          >
            {notice.type === 'success' && <CheckCircleIcon   className="w-5 h-5 flex-shrink-0" />}
            {notice.type === 'error'   && <XCircleIcon       className="w-5 h-5 flex-shrink-0" />}
            {notice.type === 'warning' && <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />}
            <span>{notice.text}</span>
          </div>
        )}

        {/* No location yet warning */}
        {!hasLoc && !editing && !notice && (
          <div className="alert alert-warning mb-6 animate-fadeIn">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <span>
              Ce service n&apos;a pas encore de localisation.
              Cliquez sur <strong>Modifier</strong> pour en ajouter une.
            </span>
          </div>
        )}

        {/* ── Main panel ── */}
        {virtualService && (
          <div className="card p-0 overflow-hidden animate-scaleIn">

            {/* Panel top bar */}
            <div className="flex items-start justify-between flex-wrap gap-3 px-6 py-4 border-b border-border bg-surface-raised">
              <div>
                <p className="font-sans font-semibold text-foreground text-lg">
                  {selSvc?.name}
                </p>
                <p className="text-muted text-sm flex items-center gap-1 mt-1">
                  <LocationIcon className="w-3 h-3" />
                  {hasLoc || editing
                    ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`
                    : 'Aucune position définie'}
                  {geocoding && (
                    <span className="ml-2 text-xs animate-pulse-soft">
                      ⏳ Géocodage inverse…
                    </span>
                  )}
                </p>
              </div>

              {editing && (
                <button className="btn btn-ghost btn-sm" onClick={onGPS}>
                  <MapPinIcon className="w-4 h-4" /> Utiliser ma position GPS
                </button>
              )}
            </div>

            {/* Map */}
            <div style={{ height: '22rem' }} className="w-full">
              <ServiceMap
                services={[virtualService]}
                userLocation={[loc.lng, loc.lat]}
                selectedService={null}
                onMarkerClick={() => {}}
                isProviderMode={editing}   // click-to-place only when editing
                onMapClick={onMapClick}
              />
            </div>

            {/* Hint below map */}
            {editing && (
              <p className="text-muted text-xs px-6 py-2 bg-surface-raised border-b border-border flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" />
                Cliquez sur la carte pour repositionner le marqueur —
                l&apos;adresse se met à jour automatiquement
              </p>
            )}

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">

              {/* Address */}
              <div className="md:col-span-2">
                <label className="label">
                  Adresse {editing && <span className="text-error ml-1">*</span>}
                </label>
                <input
                  type="text"
                  className="input"
                  value={loc.address}
                  onChange={(e) => editing && setLoc({ ...loc, address: e.target.value })}
                  placeholder="Ex : 12 Rue de la Liberté, Tunis"
                  disabled={!editing}
                />
              </div>

              {/* City */}
              <div>
                <label className="label">
                  Ville {editing && <span className="text-error ml-1">*</span>}
                </label>
                <input
                  type="text"
                  className="input"
                  value={loc.city}
                  onChange={(e) => editing && setLoc({ ...loc, city: e.target.value })}
                  placeholder="Ex : Sousse"
                  disabled={!editing}
                />
              </div>

              {/* Postal code */}
              <div>
                <label className="label">Code postal</label>
                <input
                  type="text"
                  className="input"
                  value={loc.postalCode}
                  onChange={(e) => editing && setLoc({ ...loc, postalCode: e.target.value })}
                  placeholder="Ex : 4000"
                  disabled={!editing}
                />
              </div>

              {/* Governorate */}
              <div className="md:col-span-2">
                <label className="label">
                  Gouvernorat {editing && <span className="text-error ml-1">*</span>}
                </label>
                <select
                  className="input"
                  value={loc.governorate}
                  onChange={(e) => editing && setLoc({ ...loc, governorate: e.target.value })}
                  disabled={!editing}
                >
                  <option value="">Sélectionner un gouvernorat</option>
                  {TUNISIAN_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {editing && loc.governorate && (
                  <p className="text-success text-xs mt-1 flex items-center gap-1 animate-fadeIn">
                    <CheckIcon className="w-3 h-3" /> Détecté automatiquement depuis la carte
                  </p>
                )}
              </div>

              {/* Validation banner */}
              {editing && (
                <div
                  className={[
                    'md:col-span-2 alert animate-fadeIn',
                    formValid() ? 'alert-success' : 'alert-warning',
                  ].join(' ')}
                >
                  {formValid() ? (
                    <><CheckCircleIcon   className="w-4 h-4" /> Tous les champs obligatoires sont remplis</>
                  ) : (
                    <><AlertTriangleIcon className="w-4 h-4" /> Veuillez remplir les champs marqués *</>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            {editing && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-surface-raised animate-fadeIn">
                <button className="btn btn-ghost" onClick={cancel}>
                  <XMarkIcon className="w-4 h-4" /> Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={save}
                  disabled={saving || !formValid()}
                >
                  <SaveIcon className="w-4 h-4" />
                  {saving ? 'Enregistrement…' : 'Enregistrer la localisation'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state: no services */}
        {!loading && services.length === 0 && (
          <div className="card p-8 text-center animate-fadeIn">
            <div className="text-4xl mb-4">📍</div>
            <h2 className="font-display text-lg mb-2">Aucun service trouvé</h2>
            <p className="text-muted text-sm mb-4">
              Créez d&apos;abord un service pour pouvoir définir sa localisation.
            </p>
            <Link href="/provider/services/new" className="btn btn-primary">
              Créer un service
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Suspense wrapper (useSearchParams needs it) ──────────────────────────────

export default function ProviderLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-surface">
          <div className="spinner" />
        </div>
      }
    >
      <ProviderLocationContent />
    </Suspense>
  );
}