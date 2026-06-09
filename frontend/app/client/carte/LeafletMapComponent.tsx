'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import {
  MapPinIcon,
  MapIcon,
  ClockIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  Loader2Icon,
  LocationIcon,
} from '@/components/ui/Icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LatLng { lat: number; lng: number }

export interface Service {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  avgRating: number;
  reviewCount: number;
  location: {
    coordinates: [number, number]; // GeoJSON [lng, lat]
    address: string;
    city: string;
    governorate: string;
  };
  images: string[];
  duration: number;
}

export interface Props {
  services: Service[];
  userLocation: [number, number] | null; // [lng, lat]
  selectedService: Service | null;
  onMarkerClick: (s: Service) => void;
  isProviderMode?: boolean;
  onMapClick?: (e: { lngLat: { lat: number; lng: number } }) => void;
}

// ─── Mode config ──────────────────────────────────────────────────────────────
//
// Each mode points to a different OSRM server.
// LRM builds the URL as:  serviceUrl + '/' + profile + '/' + waypoints
// For foot/bike, the profile is already baked into serviceUrl, so profile='driving'
// is just a placeholder that satisfies LRM's URL template.

const MODES = [
  {
    id: 'driving',
    label: 'Voiture',
    icon: '🚗',
    color: '#2563eb',
    serviceUrl: 'https://router.project-osrm.org/route/v1',
    profile: 'driving',
  },
  {
    id: 'walking',
    label: 'Piéton',
    icon: '🚶',
    color: '#16a34a',
    serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
    profile: 'driving',
  },
  {
    id: 'cycling',
    label: 'Vélo',
    icon: '🚲',
    color: '#ea580c',
    serviceUrl: 'https://routing.openstreetmap.de/routed-bike/route/v1',
    profile: 'driving',
  },
] as const;
type Mode = typeof MODES[number];

const THEMES = [
  { id: 'streets',   label: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '© OpenStreetMap contributors' },
  { id: 'dark',      label: 'Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '© CARTO' },
  { id: 'light',     label: 'Clair',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '© CARTO' },
  { id: 'satellite', label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '© Esri' },
];

// ─── Route data returned by LRM ───────────────────────────────────────────────

interface RouteSummary {
  totalDistance: number; // metres — directly from OSRM, no calculation
  totalTime: number;     // seconds — directly from OSRM, no calculation
}

interface RouteInfo {
  service: Service;
  summary: RouteSummary;
  instructions: Array<{ text: string; distance: number; time: number }>;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtDist(m: number): string {
  if (!m || isNaN(m)) return '—';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function fmtTime(sec: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return '—';
  const h   = Math.floor(sec / 3600);
  const min = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${min > 0 ? min + 'min' : ''}`.trim();
  return min < 1 ? '< 1 min' : `${min} min`;
}

function fmtArrival(sec: number): string {
  if (!sec || isNaN(sec)) return '—';
  return new Date(Date.now() + sec * 1000)
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Leaflet icons ────────────────────────────────────────────────────────────

const makeServiceIcon = (selected: boolean) => {
  const sz = selected ? 44 : 36;
  const bg = selected ? '#2563eb' : '#ef4444';
  return L.divIcon({
    html:
      `<div style="width:${sz}px;height:${sz}px;background:${bg};border:3px solid white;` +
      `border-radius:50%;display:flex;align-items:center;justify-content:center;` +
      `box-shadow:0 2px 8px rgba(0,0,0,.25)">` +
      `<span style="color:white;font-size:${selected ? 20 : 16}px">📍</span></div>`,
    className: '', iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz], popupAnchor: [0, -sz / 2],
  });
};

const userIcon = L.divIcon({
  html:
    '<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;' +
    'border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div>',
  className: '', iconSize: [20, 20], iconAnchor: [10, 10],
});

// ─── Map sub-components ───────────────────────────────────────────────────────

function MapReady() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 150); }, [map]);
  return null;
}

function MapClickHandler({ active, cb }: { active: boolean; cb?: (e: any) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!active || !cb) return;
    const h = (e: L.LeafletMouseEvent) =>
      cb({ lngLat: { lat: e.latlng.lat, lng: e.latlng.lng } });
    map.on('click', h);
    return () => { map.off('click', h); };
  }, [map, active, cb]);
  return null;
}

// ─── LRM routing controller ───────────────────────────────────────────────────
//
// Owns the L.Routing.control instance.
// Uses dynamic import() so LRM (which references `window`) never runs on the server.
// After the import, LRM patches L and L.Routing.* becomes available.
// LRM calls OSRM and fires `routesfound` with routes[0].summary containing
// totalDistance (metres) and totalTime (seconds) straight from OSRM.

interface LrmControllerProps {
  from: LatLng;
  to: LatLng;
  mode: Mode;
  color: string;
  onRouteFound: (summary: RouteSummary, instructions: RouteInfo['instructions']) => void;
  onRoutingError: (msg: string) => void;
  onLoading: (b: boolean) => void;
}

function LrmController({
  from, to, mode, color,
  onRouteFound, onRoutingError, onLoading,
}: LrmControllerProps) {
  const map = useMap();
  const controlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    // Remove any previous control
    if (controlRef.current) {
      try { map.removeControl(controlRef.current); } catch (_) {}
      controlRef.current = null;
    }

    onLoading(true);

    // Dynamic import — LRM patches L and registers L.Routing after this resolves
    import('leaflet-routing-machine').then(() => {
      const LR = (L as any).Routing;

      const routingPlan = LR.plan(
        [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        {
          createMarker: () => null,   // we render our own markers
          draggableWaypoints: false,
          addWaypoints: false,
        },
      );

      const control: L.Routing.Control = LR.control({
        plan: routingPlan,
        router: LR.osrmv1({
          serviceUrl: mode.serviceUrl,
          profile: mode.profile,
          language: 'fr',
        }),
        show: false,               // hide the default LRM sidebar
        collapsible: false,
        routeWhileDragging: false,
        lineOptions: {
          styles: [
            { color: 'rgba(0,0,0,.15)', weight: 9 },
            { color,                    weight: 5, opacity: 0.92 },
            { color: '#ffffff',         weight: 2, opacity: 0.35 },
          ],
          extendToWaypoints: false,
          missingRouteTolerance: 0,
        },
        waypointMode: 'connect',
      });

      control.on('routesfound', (e: any) => {
        onLoading(false);
        const route = e.routes[0];
        // totalDistance (metres) and totalTime (seconds) come from OSRM via LRM.
        // No calculation on our side.
        const summary: RouteSummary = {
          totalDistance: route.summary.totalDistance,
          totalTime:     route.summary.totalTime,
        };
        const instructions = (route.instructions ?? []).map((ins: any) => ({
          text:     ins.text,
          distance: ins.distance,  // metres, from OSRM
          time:     ins.time,      // seconds, from OSRM
        }));
        onRouteFound(summary, instructions);
      });

      control.on('routingerror', (e: any) => {
        onLoading(false);
        onRoutingError(e.error?.message ?? 'Erreur de routage');
      });

      control.addTo(map);
      controlRef.current = control;
    });

    return () => {
      if (controlRef.current) {
        try { map.removeControl(controlRef.current); } catch (_) {}
        controlRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.lat, from.lng, to.lat, to.lng, mode.id]);

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LeafletMapComponent({
  services,
  userLocation,
  selectedService,
  onMarkerClick,
  isProviderMode = false,
  onMapClick,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);

  const [theme,      setTheme]      = useState(THEMES[0]);
  const [themeOpen,  setThemeOpen]  = useState(false);
  const [mode,       setMode]       = useState<Mode>(MODES[0]);
  const [routeInfo,  setRouteInfo]  = useState<RouteInfo | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [stepsOpen,  setStepsOpen]  = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Holds the current routing target so LrmController knows what to route
  const [routingTarget, setRoutingTarget] = useState<{ service: Service; mode: Mode } | null>(null);

  const userPos: LatLng | null = userLocation
    ? { lat: userLocation[1], lng: userLocation[0] }
    : null;

  const center: [number, number] = userPos
    ? [userPos.lat, userPos.lng]
    : [36.8065, 10.1815]; // Tunis default

  // ── Start routing ─────────────────────────────────────────────────────
  const startRoute = useCallback((svc: Service, overrideMode?: Mode) => {
    if (!userPos) { setError('Position utilisateur non disponible'); return; }
    setError(null);
    setRouteInfo(null);
    setActiveStep(0);
    setStepsOpen(false);
    setRoutingTarget({ service: svc, mode: overrideMode ?? mode });
  }, [userPos, mode]);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    if (routingTarget) setRoutingTarget({ ...routingTarget, mode: m });
  }, [routingTarget]);

  const clearRoute = useCallback(() => {
    setRoutingTarget(null);
    setRouteInfo(null);
    setError(null);
    setStepsOpen(false);
    setActiveStep(0);
  }, []);

  const recenter = useCallback(() => {
    if (userPos && mapRef.current)
      mapRef.current.flyTo([userPos.lat, userPos.lng], 15, { duration: 1 });
  }, [userPos]);

  // ── LRM callbacks ─────────────────────────────────────────────────────
  const handleRouteFound = useCallback((
    summary: RouteSummary,
    instructions: RouteInfo['instructions'],
  ) => {
    if (!routingTarget) return;
    setRouteInfo({ service: routingTarget.service, summary, instructions });
  }, [routingTarget]);

  const handleRoutingError = useCallback((msg: string) => {
    setError(msg);
    setRoutingTarget(null);
  }, []);

  // Pan to selected service
  useEffect(() => {
    if (!selectedService || !mapRef.current) return;
    const [lng, lat] = selectedService.location.coordinates;
    mapRef.current.flyTo([lat, lng], 15, { duration: 1 });
  }, [selectedService]);

  const hasValidCoords = (s: Service) =>
    s.location?.coordinates?.length === 2 &&
    s.location.coordinates[0] !== 0 &&
    s.location.coordinates[1] !== 0;

  const activeMode = routingTarget?.mode ?? mode;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="lmap-root">

      {/* ═══════════════════════════ MAP ══════════════════════════════════ */}
      <MapContainer
        center={center}
        zoom={userPos ? 14 : 12}
        className="lmap-container"
        scrollWheelZoom
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer key={theme.id} url={theme.url} attribution={theme.attr} />
        <MapReady />
        <MapClickHandler active={isProviderMode} cb={onMapClick} />

        {/* LRM routing control — client mode only, when a target is selected */}
        {!isProviderMode && routingTarget && userPos && (
          <LrmController
            from={userPos}
            to={{
              lat: routingTarget.service.location.coordinates[1],
              lng: routingTarget.service.location.coordinates[0],
            }}
            mode={routingTarget.mode}
            color={routingTarget.mode.color}
            onRouteFound={handleRouteFound}
            onRoutingError={handleRoutingError}
            onLoading={setLoading}
          />
        )}

        {/* User dot */}
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup><span className="text-sm font-medium">Vous êtes ici</span></Popup>
          </Marker>
        )}

        {/* Service markers */}
        {services.map((s) => {
          if (!hasValidCoords(s)) return null;
          const [sLng, sLat] = s.location.coordinates;
          const selected = selectedService?._id === s._id;

          return (
            <Marker
              key={s._id}
              position={[sLat, sLng]}
              icon={makeServiceIcon(selected)}
              eventHandlers={{ click: () => onMarkerClick(s) }}
            >
              <Popup>
                <div className="lmap-popup-service">
                  <div className="lmap-popup-service-name">{s.name}</div>
                  <div className="lmap-popup-service-addr">{s.location.address}</div>

                  {isProviderMode ? (
                    <div className="text-xs text-muted mt-1">
                      {s.location.city}, {s.location.governorate}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-yellow-500">⭐ {s.avgRating}</span>
                        <span className="text-xs text-gray-400">({s.reviewCount} avis)</span>
                      </div>
                      <button
                        className="lmap-popup-btn mt-2"
                        disabled={loading}
                        onClick={() => startRoute(s)}
                      >
                        {loading
                          ? <><Loader2Icon className="w-3 h-3 animate-spin" /> Calcul…</>
                          : <><MapIcon className="w-3 h-3" /> Itinéraire</>}
                      </button>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ═════════════════════ THEME SELECTOR ════════════════════════════ */}
      <div className="lmap-theme-wrap">
        <button className="lmap-theme-trigger" onClick={() => setThemeOpen(o => !o)}>
          <MapIcon className="w-4 h-4" />
          <span>{theme.label}</span>
          <ChevronDownIcon
            className={`w-3 h-3 lmap-chevron${themeOpen ? ' lmap-chevron--open' : ''}`}
          />
        </button>
        {themeOpen && (
          <div className="lmap-theme-dropdown animate-scaleIn">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`lmap-theme-item${t.id === theme.id ? ' lmap-theme-item--active' : ''}`}
                onClick={() => { setTheme(t); setThemeOpen(false); }}
              >
                {t.id === theme.id && <CheckIcon className="w-3 h-3" />}
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═════════════════════ RECENTER ══════════════════════════════════ */}
      {userPos && (
        <button onClick={recenter} className="lmap-recenter-btn" aria-label="Recentrer">
          <LocationIcon className="w-5 h-5" />
        </button>
      )}

      {/* ═════════════════════ ERROR BANNER ══════════════════════════════ */}
      {error && (
        <div className="lmap-error-banner animate-fadeIn">
          <AlertTriangleIcon className="w-4 h-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═════════════════════ LOADING ═══════════════════════════════════ */}
      {loading && (
        <div className="lmap-loading animate-fadeIn">
          <Loader2Icon className="w-5 h-5 animate-spin text-primary" />
          <span>Calcul de l&apos;itinéraire…</span>
        </div>
      )}

      {/* ═════════════════════ ROUTE PANEL (client only) ═════════════════ */}
      {!isProviderMode && routeInfo && !loading && (
        <div className="lmap-route-panel animate-slideInRight">
          <div className="lmap-panel-handle" />

          {/* Destination */}
          <div className="lmap-route-header">
            <div className="lmap-route-dest-dot" style={{ background: activeMode.color }} />
            <div className="flex-1 min-w-0">
              <div className="lmap-route-dest-name">{routeInfo.service.name}</div>
              <div className="text-xs text-muted truncate">
                {routeInfo.service.location.address}
              </div>
            </div>
            <button onClick={clearRoute} className="lmap-close-route-btn" aria-label="Fermer">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mode selector */}
          <div className="lmap-mode-selector">
            {MODES.map(m => (
              <button
                key={m.id}
                disabled={loading}
                className={`lmap-mode-btn${activeMode.id === m.id ? ' lmap-mode-btn--active' : ''}`}
                style={activeMode.id === m.id
                  ? { borderColor: m.color, background: `${m.color}18`, color: m.color }
                  : {}}
                onClick={() => handleModeChange(m)}
              >
                <span className="text-base">{m.icon}</span>
                <span className="lmap-mode-label">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Stats — totalDistance and totalTime come straight from OSRM via LRM */}
          <div className="lmap-stats-row">
            <div className="lmap-stat-cell">
              <MapPinIcon className="w-4 h-4 text-muted" />
              <span className="lmap-stat-label">Distance</span>
              <span className="lmap-stat-value">
                {fmtDist(routeInfo.summary.totalDistance)}
              </span>
            </div>
            <div className="lmap-stat-divider" />
            <div className="lmap-stat-cell">
              <ClockIcon className="w-4 h-4 text-muted" />
              <span className="lmap-stat-label">Durée</span>
              <span className="lmap-stat-value">
                {fmtTime(routeInfo.summary.totalTime)}
              </span>
            </div>
            <div className="lmap-stat-divider" />
            <div className="lmap-stat-cell">
              <CheckIcon className="w-4 h-4 text-muted" />
              <span className="lmap-stat-label">Arrivée</span>
              <span className="lmap-stat-value">
                {fmtArrival(routeInfo.summary.totalTime)}
              </span>
            </div>
          </div>

          {/* Turn-by-turn instructions */}
          {routeInfo.instructions.length > 0 && (
            <div className="lmap-steps-wrap">
              <button className="lmap-steps-toggle" onClick={() => setStepsOpen(o => !o)}>
                <ArrowRightIcon
                  className={`w-4 h-4 transition-transform${stepsOpen ? ' rotate-90' : ''}`}
                />
                <span>
                  {stepsOpen ? 'Masquer' : 'Voir'} les instructions ({routeInfo.instructions.length})
                </span>
              </button>

              {stepsOpen && (
                <div className="lmap-steps-list animate-fadeIn">
                  {routeInfo.instructions.map((ins, i) => (
                    <div
                      key={i}
                      className={[
                        'lmap-step-item',
                        i === activeStep ? 'lmap-step-item--current' : '',
                        i  < activeStep  ? 'lmap-step-item--past'    : '',
                      ].join(' ')}
                      style={i === activeStep ? { borderLeftColor: activeMode.color } : {}}
                      onClick={() => setActiveStep(i)}
                    >
                      <div className="lmap-step-body">
                        <div className="lmap-step-instruction">{ins.text}</div>
                      </div>
                      <div className="lmap-step-meta">
                        <span className="lmap-step-dist">{fmtDist(ins.distance)}</span>
                        <span className="lmap-step-time">{fmtTime(ins.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Start navigation CTA */}
          <button
            className="lmap-start-btn"
            style={{ background: activeMode.color, boxShadow: `0 4px 14px ${activeMode.color}50` }}
            onClick={() => {
              if (userPos && mapRef.current)
                mapRef.current.flyTo([userPos.lat, userPos.lng], 17, { duration: 1.2 });
            }}
          >
            <ArrowRightIcon className="w-5 h-5" />
            Démarrer la navigation
          </button>
        </div>
      )}

      {/* ═════════════════════ PROVIDER BANNER ═══════════════════════════ */}
      {isProviderMode && (
        <div className="lmap-provider-banner animate-fadeIn">
          <MapPinIcon className="w-4 h-4" />
          <span>
            {onMapClick
              ? 'Cliquez sur la carte pour placer le marqueur de votre service'
              : 'Vos services — cliquez un marqueur pour les détails'}
          </span>
        </div>
      )}
    </div>
  );
}