'use client';

/**
 * LeafletMapComponent — Navigation Google Maps-like
 * ✅ CORRECTIONS :
 *   - onMapClick transmet { lngLat: { lat, lng } } (signature unifiée)
 *   - Mode provider : marqueur se déplace immédiatement au clic
 *   - MapClickHandler via useMap (react-leaflet v4, pas d'effet impératif)
 *   - curseur crosshair en mode édition
 *   - icône provider pulsante quand édition active
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LatLng { lat: number; lng: number }
type LeafletPos = [number, number];

interface Service {
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

interface NavStep {
  instruction: string;
  distanceM: number;
  durationSec: number;
  point: LatLng;
  maneuver: string;
  modifier?: string;
  streetName?: string;
  exitNumber?: number;
}

interface Route {
  path: LatLng[];
  totalDistanceM: number;
  durationSec: number;
  service: Service;
  steps: NavStep[];
  legs: RouteLeg[];
}

interface RouteLeg {
  distanceM: number;
  durationSec: number;
  steps: NavStep[];
}

interface Props {
  services: Service[];
  userLocation: [number, number] | null; // [lng, lat]
  selectedService: Service | null;
  onMarkerClick: (s: Service) => void;
  isProviderMode?: boolean;
  /** Appelé avec { lngLat: { lat, lng } } au clic sur la carte */
  onMapClick?: (e: { lngLat: { lat: number; lng: number } }) => void;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

const OSRM_PROFILES: Record<string, string> = {
  driving: 'driving',
  walking: 'foot',
  cycling: 'bike',
};

const FALLBACK_SPEED_MS: Record<string, number> = {
  driving: 13.9,
  walking: 1.4,
  cycling: 4.2,
};

const MAX_SPEED_MS: Record<string, number> = {
  driving: 55.6,
  walking: 3.5,
  cycling: 16.7,
};

const THEMES = [
  {
    id: 'streets', label: 'Standard', icon: '🗺',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenStreetMap contributors',
  },
  {
    id: 'dark', label: 'Sombre', icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO',
  },
  {
    id: 'light', label: 'Clair', icon: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO',
  },
  {
    id: 'satellite', label: 'Satellite', icon: '🛰',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri',
  },
];

const MODES = [
  { id: 'driving', label: 'Voiture', emoji: '🚗', osrm: 'driving', color: '#1a73e8', lineWeight: 6 },
  { id: 'walking', label: 'À pied',  emoji: '🚶', osrm: 'foot',    color: '#0f9d58', lineWeight: 5 },
  { id: 'cycling', label: 'Vélo',    emoji: '🚲', osrm: 'bike',    color: '#f29900', lineWeight: 5 },
];

const OFF_ROUTE_THRESHOLD_M  = 40;
const STEP_ADVANCE_M         = 20;
const ARRIVAL_M              = 15;
const REROUTE_COOLDOWN_MS    = 15_000;
const OSRM_TIMEOUT_MS        = 15_000;
const GPS_SMOOTH_ALPHA       = 0.25;

// ─── Géométrie ─────────────────────────────────────────────────────────────────

function haversine(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function calcBearing(from: LatLng, to: LatLng): number {
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat   * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const y  = Math.sin(Δλ) * Math.cos(φ2);
  const x  = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function toLeaflet(path: LatLng[]): LeafletPos[] {
  return path.map((p) => [p.lat, p.lng]);
}

function snapToRoute(
  pos: LatLng,
  path: LatLng[],
  fromIdx = 0,
): { segIdx: number; distM: number } {
  let best = { segIdx: fromIdx, distM: Infinity };
  const searchEnd = Math.min(path.length - 1, fromIdx + 300);
  for (let i = fromIdx; i < searchEnd; i++) {
    const a = path[i];
    const b = path[i + 1] ?? path[i];
    const dx = b.lng - a.lng, dy = b.lat - a.lat;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) t = Math.max(0, Math.min(1, ((pos.lng - a.lng) * dx + (pos.lat - a.lat) * dy) / lenSq));
    const proj: LatLng = { lat: a.lat + t * dy, lng: a.lng + t * dx };
    const d = haversine(pos, proj);
    if (d < best.distM) best = { segIdx: i, distM: d };
  }
  return best;
}

function remainingDistance(path: LatLng[], fromIdx: number): number {
  let d = 0;
  for (let i = fromIdx; i < path.length - 1; i++) d += haversine(path[i], path[i + 1]);
  return d;
}

function calcETA(remainM: number, totalM: number, totalSec: number, speedMs: number, modeId: string): number {
  if (totalM <= 0) return 0;
  const ratioEst = (remainM / totalM) * totalSec;
  const maxSpeed = MAX_SPEED_MS[modeId] ?? MAX_SPEED_MS.driving;
  if (speedMs > 0.5 && speedMs < maxSpeed) {
    return Math.max(5, Math.round((remainM / speedMs) * 0.6 + ratioEst * 0.4));
  }
  return Math.max(5, Math.round(ratioEst));
}

// ─── Formatage ─────────────────────────────────────────────────────────────────

function fmtDist(m: number): string {
  if (m < 50)   return `${Math.round(m)} m`;
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function fmtTime(sec: number): string {
  if (sec < 60)  return '< 1 min';
  const min = Math.round(sec / 60);
  if (min < 60)  return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function fmtArrival(sec: number): string {
  return new Date(Date.now() + sec * 1000)
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Instructions ──────────────────────────────────────────────────────────────

function buildInstruction(type: string, modifier?: string, name?: string, exitNum?: number): string {
  const on = name?.trim() ? ` sur ${name}` : '';
  switch (type) {
    case 'depart':            return `Démarrez vers ${modifier ?? 'le nord'}${on}`;
    case 'arrive':            return 'Vous êtes arrivé à destination';
    case 'continue':
    case 'new name':          return `Continuez tout droit${on}`;
    case 'merge':             return `Rejoignez${on}`;
    case 'on ramp':           return `Prenez la bretelle d'entrée${on}`;
    case 'off ramp':          return `Prenez la bretelle de sortie${on}`;
    case 'end of road':       return modifier?.includes('left') ? `Tournez à gauche${on}` : `Tournez à droite${on}`;
    case 'use lane':          return `Utilisez la bonne voie${on}`;
    case 'roundabout':
    case 'rotary':            return `Prenez le rond-point${exitNum ? ` (${exitNum}e sortie)` : ''}${on}`;
    case 'exit roundabout':
    case 'exit rotary':       return `Quittez le rond-point${on}`;
    case 'fork':              return modifier?.includes('left') ? `Restez à gauche${on}` : `Restez à droite${on}`;
    case 'turn':
      switch (modifier) {
        case 'left':          return `Tournez à gauche${on}`;
        case 'right':         return `Tournez à droite${on}`;
        case 'sharp left':    return `Virage serré à gauche${on}`;
        case 'sharp right':   return `Virage serré à droite${on}`;
        case 'slight left':   return `Légèrement à gauche${on}`;
        case 'slight right':  return `Légèrement à droite${on}`;
        case 'uturn':         return `Faites demi-tour${on}`;
        default:              return `Tournez${on}`;
      }
    case 'push bike':         return `Poussez le vélo${on}`;
    default:                  return `Continuez${on}`;
  }
}

function stepArrow(type: string, modifier?: string): string {
  if (type === 'depart')                           return '▶';
  if (type === 'arrive')                           return '🏁';
  if (type === 'roundabout' || type === 'rotary')  return '↻';
  if (type === 'exit roundabout')                  return '↗';
  if (!modifier)                                   return '↑';
  if (modifier === 'uturn')                        return '↩';
  if (modifier.includes('sharp left'))             return '↰';
  if (modifier.includes('sharp right'))            return '↱';
  if (modifier.includes('slight left'))            return '↖';
  if (modifier.includes('slight right'))           return '↗';
  if (modifier.includes('left'))                   return '←';
  if (modifier.includes('right'))                  return '→';
  return '↑';
}

function buildVoiceAnnounce(step: NavStep, distM: number): string | null {
  if (step.maneuver === 'arrive') {
    if (distM < 50)  return 'Vous êtes arrivé à destination.';
    if (distM < 200) return `Dans ${fmtDist(distM)}, vous serez arrivé.`;
    return null;
  }
  if (distM < STEP_ADVANCE_M) return step.instruction;
  if (distM < 500)             return `Dans ${fmtDist(distM)}, ${step.instruction.toLowerCase()}`;
  return null;
}

// ─── OSRM ─────────────────────────────────────────────────────────────────────

async function fetchOsrmRoute(from: LatLng, to: LatLng, profile: string) {
  try {
    const p   = OSRM_PROFILES[profile] ?? profile;
    const url = `${OSRM_BASE}/${p}/${from.lng.toFixed(6)},${from.lat.toFixed(6)};${to.lng.toFixed(6)},${to.lat.toFixed(6)}?overview=full&geometries=geojson&steps=true&annotations=duration,distance&alternatives=false`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), OSRM_TIMEOUT_MS);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.[0]) return null;
    const r    = data.routes[0];
    const path = (r.geometry.coordinates as [number, number][]).map(([lng, lat]) => ({ lat, lng }));
    const legs: RouteLeg[] = [];
    const allSteps: NavStep[] = [];
    for (const leg of r.legs ?? []) {
      const legSteps: NavStep[] = [];
      for (const s of leg.steps ?? []) {
        const [mLng, mLat] = s.maneuver.location;
        const step: NavStep = {
          instruction: buildInstruction(s.maneuver.type, s.maneuver.modifier, s.name, s.maneuver.exit),
          distanceM: Math.round(s.distance), durationSec: Math.round(s.duration),
          point: { lat: mLat, lng: mLng }, maneuver: s.maneuver.type,
          modifier: s.maneuver.modifier, streetName: s.name || undefined, exitNumber: s.maneuver.exit,
        };
        legSteps.push(step); allSteps.push(step);
      }
      legs.push({ distanceM: Math.round(leg.distance), durationSec: Math.round(leg.duration), steps: legSteps });
    }
    return { path, distM: Math.round(r.distance), durationSec: Math.round(r.duration), steps: allSteps, legs };
  } catch (e) {
    if ((e as Error).name !== 'AbortError') console.error('OSRM error:', e);
    return null;
  }
}

function buildFallbackRoute(from: LatLng, to: LatLng, service: Service, modeId: string): Route {
  const d = haversine(from, to);
  const sec = Math.round(d / (FALLBACK_SPEED_MS[modeId] ?? FALLBACK_SPEED_MS.driving));
  const steps: NavStep[] = [
    { instruction: 'Démarrez le trajet (itinéraire approx.)', distanceM: d, durationSec: sec, point: from, maneuver: 'depart' },
    { instruction: 'Vous êtes arrivé à destination', distanceM: 0, durationSec: 0, point: to, maneuver: 'arrive' },
  ];
  return { path: [from, to], totalDistanceM: d, durationSec: sec, service, steps, legs: [{ distanceM: d, durationSec: sec, steps }] };
}

// ─── Icônes ────────────────────────────────────────────────────────────────────

function serviceIcon(selected: boolean): L.DivIcon {
  const sz = selected ? 38 : 30, color = selected ? '#1a73e8' : '#ea4335';
  return L.divIcon({
    className: '',
    html: `<div style="width:${sz}px;height:${sz}px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.45);"></div>`,
    iconSize: [sz, sz], iconAnchor: [sz / 2, sz], popupAnchor: [0, -sz],
  });
}

const userDotIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#1a73e8;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(26,115,232,.2),0 2px 8px rgba(0,0,0,.3);"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

/** Icône provider : pulsation animée en mode édition */
function providerMarkerIcon(isEditing: boolean): L.DivIcon {
  const color = '#1a73e8';
  return L.divIcon({
    className: '',
    html: `
      <style>
        @keyframes prov-pulse {
          0%   { transform: scale(0.8); opacity: 0.5; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(0.8); opacity: 0;   }
        }
      </style>
      <div style="position:relative;width:34px;height:34px;">
        ${isEditing ? `<div style="position:absolute;top:0;left:0;width:34px;height:34px;border-radius:50%;background:${color};opacity:0.25;animation:prov-pulse 1.8s ease-out infinite;"></div>` : ''}
        <div style="position:absolute;top:0;left:0;width:28px;height:28px;margin:3px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.45);"></div>
      </div>`,
    iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -34],
  });
}

function navArrowIcon(bearing: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:56px;height:56px;transform:rotate(${bearing}deg);filter:drop-shadow(0 3px 10px rgba(0,0,0,.5));"><svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="26" fill="${color}" stroke="white" stroke-width="4"/><polygon points="28,9 21,30 28,25 35,30" fill="white"/><circle cx="28" cy="28" r="4" fill="white" opacity="0.4"/></svg></div>`,
    iconSize: [56, 56], iconAnchor: [28, 28],
  });
}

function destinationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;background:#ea4335;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(0,0,0,.4);"></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
  });
}

// ─── Sous-composants ───────────────────────────────────────────────────────────

function MapReady() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 150); }, [map]);
  return null;
}

/**
 * MapClickHandler — enregistre/supprime le listener Leaflet via useMap.
 * Méthode recommandée avec react-leaflet v4 (évite les effets impératifs sur mapRef).
 */
function MapClickHandler({
  active,
  onMapClick,
}: {
  active: boolean;
  onMapClick?: (e: { lngLat: { lat: number; lng: number } }) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!active || !onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) =>
      onMapClick({ lngLat: { lat: e.latlng.lat, lng: e.latlng.lng } });
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, active, onMapClick]);
  return null;
}

// ─── Composant principal ───────────────────────────────────────────────────────

export default function LeafletMapComponent({
  services,
  userLocation,
  selectedService,
  onMarkerClick,
  isProviderMode = false,
  onMapClick,
}: Props) {

  // ── Refs ──────────────────────────────────────────────────────────────────
  const mapRef             = useRef<L.Map | null>(null);
  const watchIdRef         = useRef<number | null>(null);
  const routeRef           = useRef<Route | null>(null);
  const modeRef            = useRef(MODES[0]);
  const pathSegIdxRef      = useRef(0);
  const stepIdxRef         = useRef(0);
  const lastRerouteRef     = useRef(0);
  const prevGpsRef         = useRef<(LatLng & { t: number }) | null>(null);
  const smoothSpeedRef     = useRef(0);
  const announcedStepRef   = useRef(-1);
  const isReroutingRef     = useRef(false);

  // ── State ─────────────────────────────────────────────────────────────────
  const [theme, setTheme]           = useState(THEMES[0]);
  const [themeOpen, setThemeOpen]   = useState(false);
  const [mode, setMode]             = useState(MODES[0]);
  const [route, setRoute]           = useState<Route | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [navActive, setNavActive]         = useState(false);
  const [stepIdx, setStepIdx]             = useState(0);
  const [gpsPos, setGpsPos]               = useState<LatLng | null>(null);
  const [bearing, setBearing]             = useState(0);
  const [following, setFollowing]         = useState(true);
  const [hudOpen, setHudOpen]             = useState(false);
  const [remainM, setRemainM]             = useState(0);
  const [remainSec, setRemainSec]         = useState(0);
  const [offRoute, setOffRoute]           = useState(false);
  const [rerouting, setRerouting]         = useState(false);
  const [currentSpeed, setCurrentSpeed]   = useState(0);
  const [distToNextStep, setDistToNextStep] = useState(0);

  // ── État marqueur provider (mise à jour immédiate au clic) ────────────────
  const [providerPos, setProviderPos] = useState<LatLng | null>(
    userLocation ? { lat: userLocation[1], lng: userLocation[0] } : null,
  );

  // Sync avec la prop userLocation (chargement initial ou changement de service)
  useEffect(() => {
    if (isProviderMode && userLocation) {
      setProviderPos({ lat: userLocation[1], lng: userLocation[0] });
      // Recentrer la carte sur le marqueur mis à jour
      if (mapRef.current) {
        mapRef.current.setView([userLocation[1], userLocation[0]], mapRef.current.getZoom(), { animate: true });
      }
    }
  }, [isProviderMode, userLocation]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const userPos: LatLng | null = userLocation
    ? { lat: userLocation[1], lng: userLocation[0] }
    : null;

  const mapCenter: LeafletPos = userPos ? [userPos.lat, userPos.lng] : [36.8065, 10.1815];

  // ── Voix ──────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, priority = false) => {
    if (!('speechSynthesis' in window) || !text) return;
    if (priority) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; u.rate = 1.0; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }, []);

  // ── Calcul de route ───────────────────────────────────────────────────────
  const computeAndSetRoute = useCallback(async (
    service: Service,
    m: typeof MODES[0],
    fromPos?: LatLng,
  ): Promise<Route | null> => {
    const start = fromPos ?? userPos;
    if (!start) { setError('Position utilisateur non disponible.'); return null; }
    const [destLng, destLat] = service.location.coordinates;
    const dest: LatLng = { lat: destLat, lng: destLng };
    setLoading(true); setError(null);
    const osrm = await fetchOsrmRoute(start, dest, m.id);
    setLoading(false);
    let r: Route;
    if (osrm) {
      r = { path: osrm.path, totalDistanceM: osrm.distM, durationSec: osrm.durationSec, service, steps: osrm.steps, legs: osrm.legs };
    } else {
      r = buildFallbackRoute(start, dest, service, m.id);
      setError('OSRM indisponible – itinéraire approximatif affiché.');
    }
    setRoute(r); routeRef.current = r;
    stepIdxRef.current = 0; pathSegIdxRef.current = 0;
    setStepIdx(0); setRemainM(r.totalDistanceM); setRemainSec(r.durationSec);
    return r;
  }, [userPos]);

  // ── Changement de mode ────────────────────────────────────────────────────
  const handleModeChange = useCallback(async (m: typeof MODES[0]) => {
    setMode(m); modeRef.current = m;
    if (route?.service) await computeAndSetRoute(route.service, m, gpsPos ?? undefined);
  }, [route, gpsPos, computeAndSetRoute]);

  // ── Stop tracking GPS ─────────────────────────────────────────────────────
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // ── Arrêt navigation ──────────────────────────────────────────────────────
  const stopNav = useCallback(() => {
    stopTracking();
    window.speechSynthesis?.cancel();
    setNavActive(false); setGpsPos(null); setStepIdx(0);
    setFollowing(true); setHudOpen(false); setRemainM(0); setRemainSec(0);
    setOffRoute(false); setRerouting(false); setCurrentSpeed(0);
    pathSegIdxRef.current = 0; stepIdxRef.current = 0;
    prevGpsRef.current = null; smoothSpeedRef.current = 0;
    announcedStepRef.current = -1; isReroutingRef.current = false;
  }, [stopTracking]);

  // ── Recalcul itinéraire ───────────────────────────────────────────────────
  const doReroute = useCallback(async (cur: LatLng) => {
    if (isReroutingRef.current) return;
    const r = routeRef.current, m = modeRef.current;
    if (!r) return;
    isReroutingRef.current = true; setRerouting(true);
    speak('Recalcul de l\'itinéraire.', true);
    const [destLng, destLat] = r.service.location.coordinates;
    const osrm = await fetchOsrmRoute(cur, { lat: destLat, lng: destLng }, m.id);
    if (osrm) {
      const nr: Route = { path: osrm.path, totalDistanceM: osrm.distM, durationSec: osrm.durationSec, service: r.service, steps: osrm.steps, legs: osrm.legs };
      setRoute(nr); routeRef.current = nr;
      stepIdxRef.current = 0; pathSegIdxRef.current = 0;
      setStepIdx(0); setRemainM(nr.totalDistanceM); setRemainSec(nr.durationSec);
      announcedStepRef.current = -1;
      setTimeout(() => speak(nr.steps[0]?.instruction ?? 'Continuez.'), 500);
    }
    setRerouting(false); setOffRoute(false);
    isReroutingRef.current = false; lastRerouteRef.current = Date.now();
  }, [speak]);

  // ── Démarrage navigation ──────────────────────────────────────────────────
  const startNav = useCallback(async () => {
    if (!route) { alert("Calculez d'abord un itinéraire."); return; }
    const initPos: LatLng | null = await new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        ()  => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    });
    const start = initPos ?? userPos;
    if (!start) { alert('Position GPS indisponible.'); return; }
    let activeRoute = route;
    if (initPos) {
      setLoading(true);
      const fresh = await computeAndSetRoute(route.service, mode, initPos);
      setLoading(false);
      if (fresh) activeRoute = fresh;
    }
    prevGpsRef.current = { ...start, t: Date.now() };
    smoothSpeedRef.current = 0; pathSegIdxRef.current = 0;
    stepIdxRef.current = 0; announcedStepRef.current = -1;
    lastRerouteRef.current = 0; isReroutingRef.current = false;
    setGpsPos(start); setNavActive(true); setFollowing(true);
    setStepIdx(0); setOffRoute(false); setRerouting(false);
    setRemainM(activeRoute.totalDistanceM); setRemainSec(activeRoute.durationSec);
    speak(activeRoute.steps[0]?.instruction ?? 'Navigation démarrée. Bonne route !', true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const cur: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const now = Date.now();
        const r = routeRef.current, m = modeRef.current;
        if (!r || isReroutingRef.current) return;

        // Calcul vitesse
        if (prevGpsRef.current) {
          const prev = prevGpsRef.current;
          const moved = haversine(prev, cur), dtSec = (now - prev.t) / 1000;
          if (moved > 0.3 && dtSec > 0.1) {
            const raw = moved / dtSec, max = MAX_SPEED_MS[m.id] ?? MAX_SPEED_MS.driving;
            if (raw < max) {
              smoothSpeedRef.current = smoothSpeedRef.current === 0 ? raw : smoothSpeedRef.current * (1 - GPS_SMOOTH_ALPHA) + raw * GPS_SMOOTH_ALPHA;
              setBearing(calcBearing(prev, cur));
            }
          }
        }
        prevGpsRef.current = { ...cur, t: now };
        setGpsPos(cur); setCurrentSpeed(smoothSpeedRef.current);

        const { segIdx, distM } = snapToRoute(cur, r.path, pathSegIdxRef.current);
        if (distM > OFF_ROUTE_THRESHOLD_M) {
          setOffRoute(true);
          if (now - lastRerouteRef.current > REROUTE_COOLDOWN_MS) await doReroute(cur);
          return;
        }
        setOffRoute(false);
        if (segIdx > pathSegIdxRef.current) pathSegIdxRef.current = segIdx;

        const remM = remainingDistance(r.path, pathSegIdxRef.current);
        setRemainM(remM);
        setRemainSec(calcETA(remM, r.totalDistanceM, r.durationSec, smoothSpeedRef.current, m.id));

        const dest: LatLng = { lat: r.service.location.coordinates[1], lng: r.service.location.coordinates[0] };
        if (haversine(cur, dest) < ARRIVAL_M) {
          speak('Vous êtes arrivé à destination. Bonne journée !', true);
          stopNav(); alert('🏁 Vous êtes arrivé à destination !'); return;
        }

        const si = stepIdxRef.current, step = r.steps[si];
        if (!step) return;
        const distToStep = haversine(cur, step.point);
        setDistToNextStep(distToStep);
        if (si !== announcedStepRef.current) {
          const voice = buildVoiceAnnounce(step, distToStep);
          if (voice) { announcedStepRef.current = si; speak(voice); }
        }
        if (distToStep < STEP_ADVANCE_M && r.steps[si + 1]) {
          const next = si + 1;
          stepIdxRef.current = next; setStepIdx(next); announcedStepRef.current = -1;
          const ns = r.steps[next];
          if (ns && ns.maneuver !== 'arrive') speak(ns.instruction, true);
        }
      },
      (err) => console.warn(`GPS error (${err.code}): ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
  }, [route, userPos, mode, computeAndSetRoute, speak, stopNav, doReroute]);

  // ── Callback onMapClick unifié ────────────────────────────────────────────
  // Met à jour le marqueur provider immédiatement PUIS notifie le parent
  const handleMapClick = useCallback((e: { lngLat: { lat: number; lng: number } }) => {
    if (isProviderMode) {
      // ✅ Déplace le marqueur instantanément (sans attendre reverseGeocode du parent)
      setProviderPos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    }
    // ✅ Transmet au parent avec la signature { lngLat: { lat, lng } }
    onMapClick?.(e);
  }, [isProviderMode, onMapClick]);

  // ── Effets ────────────────────────────────────────────────────────────────
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    if (!navActive || !following || !mapRef.current || !gpsPos) return;
    mapRef.current.flyTo([gpsPos.lat, gpsPos.lng], 18, { animate: true, duration: 0.6 });
  }, [gpsPos, navActive, following]);

  useEffect(() => {
    if (!selectedService || !mapRef.current || navActive || loading) return;
    const [lng, lat] = selectedService.location.coordinates;
    mapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1 });
  }, [selectedService, navActive, loading]);

  useEffect(() => () => { stopTracking(); window.speechSynthesis?.cancel(); }, [stopTracking]);

  // ── Polyline affiché ──────────────────────────────────────────────────────
  const displayPath: LeafletPos[] = route
    ? toLeaflet(navActive && pathSegIdxRef.current > 0 ? route.path.slice(pathSegIdxRef.current) : route.path)
    : [];

  const navMarkerPos: LeafletPos | null = gpsPos
    ? [gpsPos.lat, gpsPos.lng]
    : userPos ? [userPos.lat, userPos.lng] : null;

  const currentStep = route?.steps[stepIdx] ?? null;
  const nextStep    = route?.steps[stepIdx + 1] ?? null;
  const modeColor   = mode.color;

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'system-ui, sans-serif' }}>

      {/* ═══ CARTE ════════════════════════════════════════════════════════ */}
      <MapContainer
        center={mapCenter}
        zoom={userPos ? 14 : 12}
        style={{ width: '100%', height: '100%', zIndex: 1, cursor: isProviderMode ? 'crosshair' : undefined }}
        scrollWheelZoom
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer key={theme.id} url={theme.url} attribution={theme.attr} />
        <MapReady />

        {/* ✅ Gestionnaire de clic unifié (react-leaflet v4) */}
        <MapClickHandler active={isProviderMode} onMapClick={handleMapClick} />

        {/* Polyline itinéraire */}
        {!isProviderMode && displayPath.length > 1 && (
          <>
            <Polyline positions={displayPath} color="rgba(0,0,0,.12)" weight={mode.lineWeight + 5} />
            <Polyline
              positions={displayPath}
              color={offRoute ? '#ea4335' : modeColor}
              weight={mode.lineWeight} opacity={0.9}
              dashArray={mode.id === 'walking' ? '8,6' : undefined}
            />
            <Polyline positions={displayPath} color="white" weight={mode.lineWeight - 2} opacity={0.2} />
          </>
        )}

        {/* Marqueur navigation (flèche) */}
        {navActive && navMarkerPos && (
          <Marker position={navMarkerPos} icon={navArrowIcon(bearing, modeColor)} />
        )}

        {/* Marqueur utilisateur (point bleu) - mode client */}
        {!navActive && userPos && !isProviderMode && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userDotIcon}>
            <Popup>📍 Vous êtes ici</Popup>
          </Marker>
        )}

        {/* ✅ Marqueur provider éditable — suit providerPos mis à jour au clic */}
        {isProviderMode && providerPos && (
          <Marker position={[providerPos.lat, providerPos.lng]} icon={providerMarkerIcon(true)}>
            <Popup>
              <div style={{ fontSize: 13, fontWeight: 600, minWidth: 180 }}>
                <div style={{ marginBottom: 4 }}>📍 Position sélectionnée</div>
                <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                  {providerPos.lat.toFixed(5)}, {providerPos.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueur destination - navigation active */}
        {route && navActive && (() => {
          const [lng, lat] = route.service.location.coordinates;
          return (
            <Marker position={[lat, lng]} icon={destinationIcon()}>
              <Popup>{route.service.name}</Popup>
            </Marker>
          );
        })()}

        {/* Marqueurs services - mode client */}
        {!isProviderMode && services.map((s) => {
          const [sLng, sLat] = s.location.coordinates;
          const sel = selectedService?._id === s._id;
          return (
            <Marker
              key={s._id}
              position={[sLat, sLng]}
              icon={serviceIcon(sel)}
              eventHandlers={{ click: () => onMarkerClick(s) }}
            >
              <Popup>
                <div style={{ minWidth: 210 }}>
                  <strong style={{ fontSize: 14, color: '#111' }}>{s.name}</strong>
                  <p style={{ margin: '4px 0 6px', fontSize: 12, color: '#666' }}>{s.location.address}</p>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 10 }}>
                    <span style={{ color: '#1a73e8', fontWeight: 700 }}>{s.basePrice} DT</span>
                    <span>⭐ {s.avgRating} ({s.reviewCount})</span>
                  </div>
                  <button
                    onClick={() => computeAndSetRoute(s, mode)}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '9px 0',
                      background: loading ? '#93c5fd' : '#1a73e8',
                      color: 'white', border: 'none', borderRadius: 10,
                      fontSize: 13, fontWeight: 700,
                      cursor: loading ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {loading ? '⏳ Calcul…' : '🗺 Itinéraire'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ═══ SÉLECTEUR THÈME ══════════════════════════════════════════════ */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000 }}>
        <button
          onClick={() => setThemeOpen((o) => !o)}
          style={{
            padding: '7px 12px', background: 'white', border: 'none', borderRadius: 8,
            fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600,
          }}
        >
          {theme.icon} {theme.label} ▾
        </button>
        {themeOpen && (
          <div style={{ marginTop: 4, background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,.18)' }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t); setThemeOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '10px 16px',
                  background: t.id === theme.id ? '#e8f0fe' : 'white',
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  fontSize: 13, fontWeight: t.id === theme.id ? 700 : 400,
                  color: t.id === theme.id ? '#1a73e8' : '#374151',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ERREUR ═══════════════════════════════════════════════════════ */}
      {error && !navActive && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#fef3c7', border: '1px solid #f59e0b',
          borderRadius: 10, padding: '8px 16px', fontSize: 12, color: '#92400e',
          maxWidth: 320, textAlign: 'center',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ═══ PANNEAU ITINÉRAIRE (avant navigation) ════════════════════════ */}
      {!isProviderMode && route && !navActive && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: 'white', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -6px 28px rgba(0,0,0,.15)', padding: '0 16px 32px',
        }}>
          <div style={{ width: 44, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '12px auto 18px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ea4335', flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#111827', flex: 1 }}>{route.service.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {MODES.map((m) => (
              <button
                key={m.id} onClick={() => handleModeChange(m)} disabled={loading}
                style={{
                  flex: 1, padding: '10px 4px',
                  border: `2px solid ${mode.id === m.id ? m.color : '#e5e7eb'}`,
                  borderRadius: 14, background: mode.id === m.id ? `${m.color}15` : 'white',
                  cursor: loading ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all .15s', opacity: loading ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: mode.id === m.id ? m.color : '#6b7280' }}>{m.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', background: '#f9fafb', borderRadius: 14, border: '1px solid #f3f4f6', marginBottom: 16, overflow: 'hidden' }}>
            {[
              { label: 'Distance', value: fmtDist(route.totalDistanceM), icon: '📍' },
              { label: 'Durée',    value: fmtTime(route.durationSec),    icon: '⏱' },
              { label: 'Arrivée', value: fmtArrival(route.durationSec),  icon: '🎯' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '13px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={startNav}
              style={{
                flex: 1, padding: '15px', background: modeColor, color: 'white',
                border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 14px ${modeColor}50`,
              }}
            >
              ▶ Démarrer la navigation
            </button>
            <button
              onClick={() => { setRoute(null); routeRef.current = null; setError(null); }}
              style={{ padding: '15px 18px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 14, fontSize: 18, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ═══ HUD NAVIGATION ACTIVE ════════════════════════════════════════ */}
      {!isProviderMode && navActive && route && (
        <>
          {/* Carte de virage */}
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1001, width: 'min(380px, calc(100vw - 24px))',
            background: rerouting ? '#ea4335' : offRoute ? '#f97316' : modeColor,
            color: 'white', borderRadius: 20, padding: '14px',
            boxShadow: '0 6px 28px rgba(0,0,0,.35)',
            display: 'flex', alignItems: 'center', gap: 12, transition: 'background .3s',
          }}>
            <div style={{ width: 58, height: 58, flexShrink: 0, background: 'rgba(255,255,255,.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900 }}>
              {rerouting ? '↺' : stepArrow(currentStep?.maneuver ?? '', currentStep?.modifier)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                {rerouting ? '…' : fmtDist(distToNextStep || currentStep?.distanceM || 0)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, opacity: 0.95 }}>
                {rerouting ? 'Recalcul en cours…' : offRoute ? '⚠️ Hors itinéraire' : currentStep?.instruction ?? 'En route…'}
              </div>
              {currentStep?.streetName && !rerouting && (
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{currentStep.streetName}</div>
              )}
            </div>
            {nextStep && !rerouting && (
              <div title={nextStep.instruction} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {stepArrow(nextStep.maneuver, nextStep.modifier)}
                </div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>{fmtDist(nextStep.distanceM)}</div>
              </div>
            )}
            <button onClick={stopNav} style={{ flexShrink: 0, width: 36, height: 36, background: 'rgba(255,255,255,.25)', border: 'none', borderRadius: 10, color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>

          {/* Bouton recentrage */}
          <button
            onClick={() => setFollowing((f) => !f)}
            style={{
              position: 'absolute', top: 88, right: 12, zIndex: 1001,
              width: 46, height: 46,
              background: following ? modeColor : 'white',
              border: `2px solid ${following ? modeColor : '#e5e7eb'}`,
              borderRadius: 13, cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,.2)',
              color: following ? 'white' : '#374151', fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {following ? '🔒' : '📍'}
          </button>

          {/* Barre inférieure ETA */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1001, background: 'white', borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 22px rgba(0,0,0,.14)' }}>
            <div onClick={() => setHudOpen((o) => !o)} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ width: 44, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '10px auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px 14px', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{fmtTime(remainSec)}</span>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{fmtDist(remainM)} · Arrivée {fmtArrival(remainSec)}</div>
                </div>
                {currentSpeed > 0.5 && (
                  <div style={{ background: '#f3f4f6', borderRadius: 12, padding: '8px 12px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{Math.round(currentSpeed * 3.6)}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>km/h</div>
                  </div>
                )}
                <div style={{ fontSize: 28, flexShrink: 0, opacity: 0.7 }}>{mode.emoji}</div>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{hudOpen ? '▼' : '▲'} Étapes</span>
              </div>
            </div>
            {hudOpen && (
              <div style={{ borderTop: '1px solid #f3f4f6', maxHeight: 260, overflowY: 'auto', padding: '6px 0 20px' }}>
                {route.steps.map((s, i) => {
                  const isCur = i === stepIdx, isPast = i < stepIdx;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', background: isCur ? '#e8f0fe' : 'transparent', borderLeft: `3px solid ${isCur ? modeColor : 'transparent'}`, opacity: isPast ? 0.4 : 1, transition: 'all .2s' }}>
                      <div style={{ width: 34, height: 34, flexShrink: 0, background: isCur ? modeColor : '#f3f4f6', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: isCur ? 'white' : '#6b7280' }}>
                        {stepArrow(s.maneuver, s.modifier)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isCur ? 700 : 400, color: isCur ? '#111827' : '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.instruction}</div>
                        {s.streetName && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{s.streetName}</div>}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{fmtDist(s.distanceM)}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtTime(s.durationSec)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ SPINNER ══════════════════════════════════════════════════════ */}
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 1002, background: 'white', borderRadius: 16, padding: '18px 28px',
          boxShadow: '0 6px 28px rgba(0,0,0,.22)', display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 14, fontWeight: 600, color: '#374151',
        }}>
          <span style={{ display: 'inline-block', animation: 'spin .8s linear infinite' }}>⏳</span>
          Calcul de l&apos;itinéraire…
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ═══ BANNIÈRE MODE PROVIDER ═══════════════════════════════════════ */}
      {isProviderMode && (
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 10, padding: '8px 18px', fontSize: 12, color: '#4b5563',
          boxShadow: '0 2px 8px rgba(0,0,0,.1)', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ✏️ Mode édition — cliquez sur la carte pour repositionner
        </div>
      )}
    </div>
  );
}