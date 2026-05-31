// app/client/carte/LeafletMapComponent.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import type {} from '@/types/leaflet-routing-machine';

// ─── Types ──────────────────────────────────────────────────────────────

interface Service {
  _id: string;
  name: string;
  category: string;
  basePrice?: number;
  avgRating: number;
  reviewCount: number;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
  };
  images: string[];
  duration: number;
}

interface Props {
  services: Service[];
  userLocation: [number, number] | null;
  selectedService: Service | null;
  onMarkerClick: (s: Service) => void;
  isProviderMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

// ─── Constantes ─────────────────────────────────────────────────────────

const OSRM_SERVICE_URL = 'https://router.project-osrm.org/route/v1';

const TRANSPORT_MODES = {
  driving: { label: 'Voiture', emoji: '🚗', color: '#1a73e8', profile: 'driving' },
  foot:    { label: 'À pied',  emoji: '🚶', color: '#0f9d58', profile: 'foot'    },
  bike:    { label: 'Vélo',    emoji: '🚲', color: '#f29900', profile: 'bike'    },
} as const;

type TransportMode = keyof typeof TRANSPORT_MODES;

// ─── Utilitaires ────────────────────────────────────────────────────────

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return '< 1 min';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// ─── Icônes ─────────────────────────────────────────────────────────────

function createServiceIcon(selected: boolean): L.DivIcon {
  const size  = selected ? 38 : 30;
  const color = selected ? '#1a73e8' : '#ea4335';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.45);"></div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Icône spéciale pour le mode provider (éditable, couleur verte)
function createProviderIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;background:#0f9d58;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 14px rgba(15,157,88,.6);"></div>`,
    iconSize:    [36, 36],
    iconAnchor:  [18, 36],
    popupAnchor: [0, -36],
  });
}

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#1a73e8;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(26,115,232,.2);"></div>',
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
});

// ─── MapReady ────────────────────────────────────────────────────────────

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => { map.invalidateSize(); onReady(map); }, 100);
    return () => clearTimeout(t);
  }, [map, onReady]);
  return null;
}

// ─── MapClickHandler ─────────────────────────────────────────────────────
// Écoute les clics sur la carte et remonte lat/lng au parent

function MapClickHandler({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// ─── MapFlyTo ────────────────────────────────────────────────────────────
// Se déplace vers les nouvelles coordonnées quand elles changent

function MapFlyTo({ lat, lng, enabled }: { lat: number; lng: number; enabled: boolean }) {
  const map = useMap();
  const prevRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const prev = prevRef.current;
    // Ne pas bouger si les coords n'ont pas changé significativement
    if (prev && Math.abs(prev.lat - lat) < 0.0001 && Math.abs(prev.lng - lng) < 0.0001) return;
    prevRef.current = { lat, lng };
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [lat, lng, enabled, map]);

  return null;
}

// ─── RoutingControl ───────────────────────────────────────────────────────

interface RoutingControlProps {
  map:          L.Map;
  from:         L.LatLng;
  to:           L.LatLng;
  mode:         TransportMode;
  onRouteFound: (s: { totalDistance: number; totalTime: number }) => void;
  onRouteError: () => void;
}

function RoutingControl({ map, from, to, mode, onRouteFound, onRouteError }: RoutingControlProps) {
  const controlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }

    const modeConfig = TRANSPORT_MODES[mode];

    const router = L.Routing.osrmv1({
      serviceUrl: OSRM_SERVICE_URL,
      profile:    modeConfig.profile,
    });

    const control = L.Routing.control({
      waypoints: [from, to],
      router,
      lineOptions: {
        styles: [{ color: modeConfig.color, opacity: 0.85, weight: 6 }],
        extendToWaypoints:     true,
        missingRouteTolerance: 0,
      },
      show:               false,
      addWaypoints:       false,
      routeWhileDragging: false,
      fitSelectedRoutes:  true,
      showAlternatives:   false,
    });

    control.on('routesfound', (e: L.Routing.RoutingResultEvent) => {
      const route = e.routes[0];
      onRouteFound({
        totalDistance: route.summary.totalDistance,
        totalTime:     route.summary.totalTime,
      });
    });

    control.on('routingerror', () => onRouteError());

    try {
      control.addTo(map);
      control.route();
      controlRef.current = control;
    } catch {
      onRouteError();
    }

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, from.lat, from.lng, to.lat, to.lng, mode]);

  return null;
}

// ─── Composant Principal ─────────────────────────────────────────────────

export default function LeafletMapComponent({
  services,
  userLocation,
  selectedService,
  onMarkerClick,
  isProviderMode = false,
  onMapClick,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);

  const [mode, setMode]                 = useState<TransportMode>('driving');
  const [routeTarget, setRouteTarget]   = useState<Service | null>(null);
  const [routeSummary, setRouteSummary] = useState<{ totalDistance: number; totalTime: number } | null>(null);
  const [routeError, setRouteError]     = useState(false);
  const [mapReady, setMapReady]         = useState(false);

  const userPos = userLocation
    ? { lat: userLocation[1], lng: userLocation[0] }
    : null;

  const mapCenter: [number, number] = userPos
    ? [userPos.lat, userPos.lng]
    : [36.8065, 10.1815];

  const selectedLatLng = selectedService
    ? L.latLng(selectedService.location.coordinates[1], selectedService.location.coordinates[0])
    : null;

  useEffect(() => {
    if (selectedLatLng && mapRef.current && !isProviderMode) {
      mapRef.current.flyTo(selectedLatLng, 14, { duration: 0.7 });
    }
  }, [selectedLatLng, isProviderMode]);

  useEffect(() => {
    if (routeTarget) {
      setRouteError(false);
      setRouteSummary(null);
    }
  }, [mode, routeTarget]);

  const startRoute = useCallback((service: Service) => {
    setRouteError(false);
    setRouteSummary(null);
    setRouteTarget(service);
  }, []);

  const stopRoute = useCallback(() => {
    setRouteTarget(null);
    setRouteSummary(null);
    setRouteError(false);
  }, []);

  // Coordonnées du marqueur provider (premier service passé en mode provider)
  const providerService = isProviderMode && services.length > 0 ? services[0] : null;
  const providerLat = providerService ? providerService.location.coordinates[1] : 36.8065;
  const providerLng = providerService ? providerService.location.coordinates[0] : 10.1815;

  const modeConfig = TRANSPORT_MODES[mode];
  const fromLatLng = userPos ? L.latLng(userPos.lat, userPos.lng) : null;
  const destLatLng = routeTarget
    ? L.latLng(routeTarget.location.coordinates[1], routeTarget.location.coordinates[0])
    : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      <MapContainer
        center={mapCenter}
        zoom={userPos ? 13 : 12}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        // Curseur crosshair en mode provider pour indiquer la cliquabilité
        className={isProviderMode ? 'provider-map-cursor' : ''}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapReady onReady={(map) => { mapRef.current = map; setMapReady(true); }} />

        {/* Écoute les clics en mode provider */}
        <MapClickHandler
          enabled={isProviderMode && !!onMapClick}
          onClick={(lat, lng) => onMapClick?.(lat, lng)}
        />

        {/* Déplace la carte quand les coords changent (mode provider) */}
        {isProviderMode && (
          <MapFlyTo
            lat={providerLat}
            lng={providerLng}
            enabled={isProviderMode}
          />
        )}

        {/* Position utilisateur (mode client uniquement) */}
        {!isProviderMode && userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup>📍 Votre position</Popup>
          </Marker>
        )}

        {/* Mode provider : marqueur unique et draggable */}
        {isProviderMode && providerService && (
          <Marker
            position={[providerLat, providerLng]}
            icon={createProviderIcon()}
            draggable={!!onMapClick}
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = (e.target as L.Marker).getLatLng();
                onMapClick?.(lat, lng);
              },
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <strong>{providerService.name}</strong>
                {providerService.location.address && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>
                    {providerService.location.address}
                  </p>
                )}
                {onMapClick && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#888' }}>
                    Glissez le marqueur ou cliquez sur la carte
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Mode client : marqueurs des services */}
        {!isProviderMode && services.map((service) => {
          const [lng, lat] = service.location.coordinates;
          const isSelected = selectedService?._id === service._id;
          return (
            <Marker
              key={service._id}
              position={[lat, lng]}
              icon={createServiceIcon(isSelected)}
              eventHandlers={{ click: () => onMarkerClick(service) }}
            >
              <Popup>
                <div className="route-popup-content">
                  <strong className="route-popup-title">{service.name}</strong>
                  <p className="route-popup-address">{service.location.address}</p>
                  {service.basePrice !== undefined && (
                    <div className="route-popup-meta">
                      <span className="route-popup-price">{service.basePrice} DT</span>
                      {' · '}
                      <span>⭐ {service.avgRating} ({service.reviewCount})</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="route-popup-button"
                    onClick={() => startRoute(service)}
                  >
                    🗺 Naviguer vers ce service
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Routing */}
        {mapReady && mapRef.current && fromLatLng && destLatLng && routeTarget && (
          <RoutingControl
            map={mapRef.current}
            from={fromLatLng}
            to={destLatLng}
            mode={mode}
            onRouteFound={setRouteSummary}
            onRouteError={() => setRouteError(true)}
          />
        )}
      </MapContainer>

      {/* Panneau itinéraire (mode client) */}
      {!isProviderMode && routeTarget && (
        <div className="route-panel">
          <div className="route-panel__header">
            <div>
              <div className="route-panel__title">{routeTarget.name}</div>
              <div className="route-panel__subtitle">{routeTarget.location.address}</div>
            </div>
            <button type="button" className="route-panel__close" onClick={stopRoute}>✕</button>
          </div>

          <div className="route-panel__modes">
            {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map((m) => {
              const cfg = TRANSPORT_MODES[m];
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  className={active ? 'route-mode-btn route-mode-btn--active' : 'route-mode-btn'}
                  onClick={() => setMode(m)}
                >
                  <span className="route-mode-btn__emoji">{cfg.emoji}</span>
                  <span className="route-mode-btn__label">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {routeError && (
            <div className="route-status route-status--error">
              ⚠️ Impossible de calculer l'itinéraire. Vérifiez votre connexion.
            </div>
          )}
          {!routeError && !routeSummary && (
            <div className="route-status route-status--loading">
              ⏳ Calcul de l'itinéraire en cours…
            </div>
          )}
          {routeSummary && !routeError && (
            <div className="route-stats">
              {[
                { label: '📏 Distance', value: formatDistance(routeSummary.totalDistance) },
                { label: '⏱ Durée',    value: formatDuration(routeSummary.totalTime)     },
              ].map(({ label, value }) => (
                <div key={label} className="route-stat" style={{ borderColor: `${modeConfig.color}30`, background: `${modeConfig.color}10` }}>
                  <div className="route-stat__label">{label}</div>
                  <div className="route-stat__value" style={{ color: modeConfig.color }}>{value}</div>
                </div>
              ))}
            </div>
          )}
          <p className="route-panel__disclaimer">Itinéraire fourni par OSRM · OpenStreetMap</p>
        </div>
      )}

      {/* Indicateur mode provider */}
      {isProviderMode && onMapClick && (
        <div className="provider-mode-note">
          ✏️ Cliquez sur la carte ou glissez le marqueur pour positionner votre service
        </div>
      )}
    </div>
  );
}