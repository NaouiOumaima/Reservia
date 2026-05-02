'use client';

/**
 * LeafletMapComponent — Navigation style Google Maps (version corrigée)
 *
 * CONVENTION (stricte, jamais mélanger) :
 *   • Leaflet / Haversine / état interne  →  {lat, lng}  ou  [lat, lng]
 *   • OSRM API / MongoDB coords           →  [lng, lat]   (GeoJSON order)
 *   • userLocation prop (depuis le parent) → [lng, lat]  (GeoJSON)
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
    coordinates: [number, number]; // GeoJSON : [lng, lat]
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
}

interface Route {
  path: LatLng[];
  totalDistanceM: number;
  /** Durée OSRM réelle en secondes (source de vérité) */
  durationSec: number;
  service: Service;
  steps: NavStep[];
}

interface Props {
  services: Service[];
  userLocation: [number, number] | null; // GeoJSON [lng, lat]
  selectedService: Service | null;
  onMarkerClick: (s: Service) => void;
  isProviderMode?: boolean;
  onMapClick?: (e: { lngLat: { lat: number; lng: number } }) => void;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const THEMES = [
  {
    id: 'streets', label: 'Standard', emoji: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenStreetMap',
  },
  {
    id: 'dark', label: 'Sombre', emoji: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO',
  },
  {
    id: 'light', label: 'Clair', emoji: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO',
  },
  {
    id: 'satellite', label: 'Satellite', emoji: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri',
  },
];

const MODES = [
  { id: 'driving', label: 'Voiture', emoji: '🚗', osrm: 'driving', color: '#1a73e8' },
  { id: 'walking', label: 'À pied',  emoji: '🚶', osrm: 'walking', color: '#188038' },
  { id: 'cycling', label: 'Vélo',    emoji: '🚲', osrm: 'cycling', color: '#e37400' },
];

// Vitesses de repli (m/s) utilisées UNIQUEMENT si OSRM échoue
const FALLBACK_SPEED: Record<string, number> = {
  driving: 13.9, // ~50 km/h en ville
  walking:  1.4, // ~5 km/h
  cycling:  4.2, // ~15 km/h
};

const OFF_ROUTE_M       = 50;   // Distance hors-route avant recalcul (m)
const STEP_TRIGGER_M    = 30;   // Distance au waypoint pour passer à l'étape suivante
const ARRIVAL_M         = 20;   // Distance destination pour signaler l'arrivée
const REROUTE_COOLDOWN  = 12_000; // ms entre deux recalculs
const OSRM_TIMEOUT      = 12_000; // ms timeout OSRM

// ─── Géométrie ─────────────────────────────────────────────────────────────────

function haversine(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function calcBearing(from: LatLng, to: LatLng): number {
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function toLeaflet(path: LatLng[]): LeafletPos[] {
  return path.map((p) => [p.lat, p.lng]);
}

/**
 * Projette `pos` sur le segment [a, b] et retourne la distance à ce segment.
 * Utilisé pour une détection hors-route précise.
 */
function distToSegment(pos: LatLng, a: LatLng, b: LatLng): number {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return haversine(pos, a);
  let t = ((pos.lng - a.lng) * dx + (pos.lat - a.lat) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return haversine(pos, { lat: a.lat + t * dy, lng: a.lng + t * dx });
}

/**
 * Trouve le segment du tracé le plus proche de pos et retourne l'index de début.
 */
function nearestSegmentIdx(pos: LatLng, path: LatLng[], fromIdx = 0): { idx: number; distM: number } {
  let best = { idx: fromIdx, distM: Infinity };
  // On cherche dans une fenêtre de 200 points devant pour éviter les retours en arrière
  const end = Math.min(path.length - 1, fromIdx + 200);
  for (let i = fromIdx; i < end; i++) {
    const d = distToSegment(pos, path[i], path[i + 1] ?? path[i]);
    if (d < best.distM) best = { idx: i, distM: d };
  }
  return best;
}

/**
 * Distance cumulée du tracé depuis fromIdx jusqu'à la fin.
 */
function distanceFromIdx(path: LatLng[], fromIdx: number): number {
  let d = 0;
  for (let i = fromIdx; i < path.length - 1; i++) {
    d += haversine(path[i], path[i + 1]);
  }
  return d;
}

/**
 * Temps restant estimé :
 * - On utilise le ratio distance_restante / distance_totale × durée_totale_OSRM
 * - Si la vitesse GPS mesurée est disponible et cohérente, on la combine
 */
function estimateRemainSec(
  remainM: number,
  totalM: number,
  totalSec: number,
  measuredSpeedMs: number,
  modeId: string,
): number {
  if (totalM <= 0) return 0;
  // Estimation basée sur le ratio OSRM (plus précise)
  const ratioEst = (remainM / totalM) * totalSec;

  if (measuredSpeedMs > 0.3) {
    // Combiner avec vitesse mesurée (30% vitesse mesurée, 70% ratio OSRM)
    const speedEst = remainM / measuredSpeedMs;
    return Math.max(5, Math.round(ratioEst * 0.7 + speedEst * 0.3));
  }
  return Math.max(5, Math.round(ratioEst));
}

// ─── Formatage ─────────────────────────────────────────────────────────────────

function fmtDist(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function fmtTime(sec: number): string {
  const min = Math.round(sec / 60);
  if (min < 1)  return '< 1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function fmtArrival(sec: number): string {
  const d = new Date(Date.now() + sec * 1000);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Instructions de virage ────────────────────────────────────────────────────

function buildInstruction(type: string, modifier?: string, name?: string): string {
  const on = name?.trim() ? ` sur ${name}` : '';
  switch (type) {
    case 'depart':               return `Démarrez${on}`;
    case 'arrive':               return 'Vous êtes arrivé à destination';
    case 'continue':
    case 'new name':             return `Continuez tout droit${on}`;
    case 'merge':                return `Rejoignez${on}`;
    case 'on ramp':              return `Prenez la bretelle d'accès${on}`;
    case 'off ramp':             return `Prenez la sortie${on}`;
    case 'roundabout':
    case 'rotary':               return `Prenez le rond-point${on}`;
    case 'exit roundabout':
    case 'exit rotary':          return `Quittez le rond-point${on}`;
    case 'fork':
      return modifier?.includes('left') ? `Restez à gauche${on}` : `Restez à droite${on}`;
    case 'turn': {
      switch (modifier) {
        case 'left':         return `Tournez à gauche${on}`;
        case 'right':        return `Tournez à droite${on}`;
        case 'sharp left':   return `Virage serré à gauche${on}`;
        case 'sharp right':  return `Virage serré à droite${on}`;
        case 'slight left':  return `Légèrement à gauche${on}`;
        case 'slight right': return `Légèrement à droite${on}`;
        case 'uturn':        return `Faites demi-tour${on}`;
        default:             return `Tournez${on}`;
      }
    }
    default: return `Continuez${on}`;
  }
}

function stepArrow(type: string, modifier?: string): string {
  if (type === 'depart')                          return '▶';
  if (type === 'arrive')                          return '🏁';
  if (type === 'roundabout' || type === 'rotary') return '↻';
  if (!modifier)                                  return '↑';
  if (modifier.includes('sharp left'))            return '↰';
  if (modifier.includes('sharp right'))           return '↱';
  if (modifier.includes('slight left'))           return '↖';
  if (modifier.includes('slight right'))          return '↗';
  if (modifier.includes('left'))                  return '←';
  if (modifier.includes('right'))                 return '→';
  if (modifier === 'uturn')                       return '↩';
  return '↑';
}

// ─── OSRM ─────────────────────────────────────────────────────────────────────

async function fetchOsrmRoute(
  from: LatLng,
  to: LatLng,
  profile: string,
): Promise<{ path: LatLng[]; distM: number; durationSec: number; steps: NavStep[] } | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/${profile}/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=true&alternatives=false`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(OSRM_TIMEOUT),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.routes?.[0]) return null;

    const r = data.routes[0];

    // GeoJSON coords = [lng, lat] → convertir en {lat, lng}
    const path: LatLng[] = (r.geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => ({ lat, lng }),
    );

    const steps: NavStep[] = [];
    for (const leg of r.legs ?? []) {
      // Durée par étape = proportionnelle à la distance de chaque step / distance totale × durée totale
      for (const s of leg.steps ?? []) {
        const [mLng, mLat] = s.maneuver.location as [number, number];
        steps.push({
          instruction: buildInstruction(s.maneuver.type, s.maneuver.modifier, s.name),
          distanceM:   s.distance,
          // FIX: utiliser la vraie durée OSRM par étape (pas recalculée)
          durationSec: s.duration,
          point:       { lat: mLat, lng: mLng },
          maneuver:    s.maneuver.type,
          modifier:    s.maneuver.modifier,
          streetName:  s.name || undefined,
        });
      }
    }

    return {
      path,
      distM:       r.distance,
      // FIX: utiliser directement la durée OSRM (en secondes, source de vérité)
      durationSec: Math.round(r.duration),
      steps,
    };
  } catch {
    return null;
  }
}

// ─── Icônes Leaflet ────────────────────────────────────────────────────────────

function serviceIcon(selected: boolean): L.DivIcon {
  const size  = selected ? 36 : 28;
  const color = selected ? '#1a73e8' : '#ea4335';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border:3px solid white;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,.4);
    "></div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const userDotIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;background:#1a73e8;
    border:3px solid white;border-radius:50%;
    box-shadow:0 0 0 6px rgba(26,115,232,.2);
  "></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const providerEditIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:40px;height:40px;background:#f59e0b;
    border:3px solid white;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.3);
  ">✏️</div>`,
  iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
});

function navArrowIcon(brg: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="width:54px;height:54px;transform:rotate(${brg}deg);
                  filter:drop-shadow(0 2px 8px rgba(0,0,0,.45));">
        <svg viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
          <circle cx="27" cy="27" r="25" fill="${color}" stroke="white" stroke-width="3.5"/>
          <polygon points="27,8 20,28 27,23 34,28" fill="white"/>
        </svg>
      </div>`,
    iconSize: [54, 54], iconAnchor: [27, 27],
  });
}

// ─── Sous-composant MapReady ───────────────────────────────────────────────────

function MapReady() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 150); }, [map]);
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
  const mapRef           = useRef<L.Map | null>(null);
  const watchRef         = useRef<number | null>(null);
  const prevGpsRef       = useRef<(LatLng & { t: number }) | null>(null);
  const smoothSpeedRef   = useRef<number>(0);
  /** Index du segment courant sur path (avance, jamais en arrière) */
  const pathIdxRef       = useRef<number>(0);
  const lastRerouteRef   = useRef<number>(0);
  /** Toujours à jour — utilisé dans les callbacks GPS asynchrones */
  const routeRef         = useRef<Route | null>(null);
  const modeRef          = useRef(MODES[0]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return THEMES[0];
    return THEMES.find((t) => t.id === localStorage.getItem('mapTheme')) ?? THEMES[0];
  });
  const [themeOpen, setThemeOpen] = useState(false);
  const [mode,      setMode]      = useState(MODES[0]);
  const [route,     setRoute]     = useState<Route | null>(null);
  const [loading,   setLoading]   = useState(false);

  // Navigation
  const [navActive,  setNavActive]  = useState(false);
  const [stepIdx,    setStepIdx]    = useState(0);
  const [gpsPos,     setGpsPos]     = useState<LatLng | null>(null);
  const [bearing,    setBearing]    = useState(0);
  const [following,  setFollowing]  = useState(true);
  const [hudOpen,    setHudOpen]    = useState(false);
  const [remainM,    setRemainM]    = useState(0);
  const [remainSec,  setRemainSec]  = useState(0);
  const [offRoute,   setOffRoute]   = useState(false);
  const [rerouting,  setRerouting]  = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const userPos: LatLng | null = userLocation
    ? { lat: userLocation[1], lng: userLocation[0] }
    : null;

  const mapCenter: LeafletPos = userPos
    ? [userPos.lat, userPos.lng]
    : [36.8065, 10.1815];

  const currentStep = route?.steps[stepIdx] ?? null;
  const nextStep    = route?.steps[stepIdx + 1] ?? null;

  // ── TTS ───────────────────────────────────────────────────────────────────

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = 'fr-FR';
    u.rate  = 1.05;
    window.speechSynthesis.speak(u);
  }, []);

  // ── Appliquer un itinéraire calculé ──────────────────────────────────────

  const applyRoute = useCallback((r: Route) => {
    setRoute(r);
    routeRef.current  = r;
    setStepIdx(0);
    pathIdxRef.current = 0;
  }, []);

  // ── Calcul d'itinéraire (CORRIGÉ) ─────────────────────────────────────────

  const computeRoute = useCallback(async (
    service: Service,
    m: typeof MODES[0],
    fromPos?: LatLng,
  ): Promise<Route | null> => {
    const start = fromPos ?? userPos;
    if (!start) { alert('Position utilisateur non disponible.'); return null; }

    const [destLng, destLat] = service.location.coordinates;
    const dest: LatLng = { lat: destLat, lng: destLng };

    setLoading(true);
    const osrm = await fetchOsrmRoute(start, dest, m.osrm);
    setLoading(false);

    if (osrm) {
      return {
        path:           osrm.path,
        totalDistanceM: osrm.distM,
        // FIX : durée directement depuis OSRM, pas recalculée avec des vitesses fixes
        durationSec:    osrm.durationSec,
        service,
        steps:          osrm.steps,
      };
    }

    // Fallback ligne droite avec vitesses réalistes
    const d   = haversine(start, dest);
    const spd = FALLBACK_SPEED[m.id] ?? FALLBACK_SPEED.driving;
    const sec = Math.round(d / spd);
    return {
      path:           [start, dest],
      totalDistanceM: d,
      durationSec:    sec,
      service,
      steps: [
        { instruction: 'Démarrez le trajet', distanceM: d, durationSec: sec,  point: start, maneuver: 'depart' },
        { instruction: 'Vous êtes arrivé à destination', distanceM: 0, durationSec: 0, point: dest, maneuver: 'arrive' },
      ],
    };
  }, [userPos]);

  const handleCalculate = useCallback(async (
    service: Service,
    m: typeof MODES[0],
    fromPos?: LatLng,
  ) => {
    const r = await computeRoute(service, m, fromPos);
    if (r) applyRoute(r);
  }, [computeRoute, applyRoute]);

  const handleModeChange = useCallback(async (m: typeof MODES[0]) => {
    setMode(m);
    modeRef.current = m;
    if (route?.service) {
      const r = await computeRoute(route.service, m, gpsPos ?? undefined);
      if (r) applyRoute(r);
    }
  }, [route, gpsPos, computeRoute, applyRoute]);

  // ── GPS tracking ──────────────────────────────────────────────────────────

  const stopTracking = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  // ── Navigation stop ───────────────────────────────────────────────────────

  const stopNav = useCallback(() => {
    stopTracking();
    setNavActive(false);
    setGpsPos(null);
    setStepIdx(0);
    setFollowing(true);
    setHudOpen(false);
    setRemainM(0);
    setRemainSec(0);
    setOffRoute(false);
    setRerouting(false);
    pathIdxRef.current    = 0;
    prevGpsRef.current    = null;
    smoothSpeedRef.current = 0;
  }, [stopTracking]);

  // ── Navigation start (CORRIGÉ) ────────────────────────────────────────────

  const startNav = useCallback(async () => {
    if (!route) { alert("Calculez d'abord un itinéraire."); return; }

    // 1. Obtenir la position GPS réelle
    const initPos: LatLng | null = await new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        ()  => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
      );
    });

    const start = initPos ?? userPos;
    if (!start) { alert('Position GPS indisponible. Vérifiez les permissions.'); return; }

    // 2. Recalculer depuis la position GPS réelle si elle diffère de userPos
    let activeRoute = route;
    if (initPos) {
      setLoading(true);
      const fresh = await computeRoute(route.service, mode, initPos);
      setLoading(false);
      if (fresh) {
        activeRoute = fresh;
        applyRoute(fresh);
      }
    }

    // 3. Initialiser l'état de navigation
    prevGpsRef.current     = { ...start, t: Date.now() };
    smoothSpeedRef.current  = 0;
    pathIdxRef.current     = 0;

    setGpsPos(start);
    setNavActive(true);
    setFollowing(true);
    setStepIdx(0);
    setOffRoute(false);
    setRerouting(false);
    setRemainM(activeRoute.totalDistanceM);
    setRemainSec(activeRoute.durationSec);

    speak(activeRoute.steps[0]?.instruction ?? 'Navigation démarrée. Bonne route !');

    // 4. Démarrer le suivi GPS temps réel
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const cur: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const now = Date.now();
        const r   = routeRef.current;
        const m   = modeRef.current;
        if (!r) return;

        setGpsPos(cur);

        // ── Vitesse & cap ─────────────────────────────────────────────────
        if (prevGpsRef.current) {
          const prev  = prevGpsRef.current;
          const moved = haversine(prev, cur);
          const dt    = (now - prev.t) / 1000;
          if (moved > 0.5 && dt > 0) {
            const raw = moved / dt;
            // Lissage exponentiel : 70% ancienne valeur, 30% nouvelle
            smoothSpeedRef.current = smoothSpeedRef.current * 0.7 + raw * 0.3;
            setBearing(calcBearing(prev, cur));
          }
        }
        prevGpsRef.current = { ...cur, t: now };

        // ── Position sur le tracé (segment le plus proche, jamais en arrière) ──
        const { idx, distM } = nearestSegmentIdx(cur, r.path, pathIdxRef.current);

        // ── Détection hors-route ──────────────────────────────────────────
        if (distM > OFF_ROUTE_M) {
          setOffRoute(true);
          const elapsed = now - lastRerouteRef.current;
          if (elapsed > REROUTE_COOLDOWN && !rerouting) {
            lastRerouteRef.current = now;
            setRerouting(true);
            speak("Recalcul de l'itinéraire en cours.");

            const dest: LatLng = {
              lat: r.service.location.coordinates[1],
              lng: r.service.location.coordinates[0],
            };
            const newOsrm = await fetchOsrmRoute(cur, dest, m.osrm);
            if (newOsrm) {
              const nr: Route = {
                path:           newOsrm.path,
                totalDistanceM: newOsrm.distM,
                durationSec:    newOsrm.durationSec,
                service:        r.service,
                steps:          newOsrm.steps,
              };
              setRoute(nr);
              routeRef.current   = nr;
              setStepIdx(0);
              pathIdxRef.current = 0;
              setRemainM(nr.totalDistanceM);
              setRemainSec(nr.durationSec);
              speak(nr.steps[0]?.instruction ?? 'Continuez.');
            }
            setRerouting(false);
            setOffRoute(false);
          }
          return;
        }
        setOffRoute(false);

        // ── Avancer l'index sur le tracé (jamais en arrière) ─────────────
        if (idx > pathIdxRef.current) pathIdxRef.current = idx;

        // ── Distance & temps restants (CORRIGÉ) ──────────────────────────
        const remM   = distanceFromIdx(r.path, pathIdxRef.current);
        // FIX : estimation basée sur ratio OSRM + vitesse mesurée
        const remSec = estimateRemainSec(
          remM,
          r.totalDistanceM,
          r.durationSec,
          smoothSpeedRef.current,
          m.id,
        );
        setRemainM(remM);
        setRemainSec(remSec);

        // ── Détection arrivée ─────────────────────────────────────────────
        const dest: LatLng = {
          lat: r.service.location.coordinates[1],
          lng: r.service.location.coordinates[0],
        };
        if (haversine(cur, dest) < ARRIVAL_M) {
          speak('Vous êtes arrivé à destination. Bonne journée !');
          stopNav();
          alert('🏁 Vous êtes arrivé à destination !');
          return;
        }

        // ── Progression des étapes (CORRIGÉ) ─────────────────────────────
        // FIX: on compare la distance entre la pos GPS et le POINT de début de chaque étape
        setStepIdx((prev) => {
          if (!r.steps[prev + 1]) return prev;
          // Distance jusqu'au prochain waypoint de virage
          const distToNext = haversine(cur, r.steps[prev].point);
          if (distToNext < STEP_TRIGGER_M) {
            const next = prev + 1;
            // Ne pas parler si c'est la dernière étape (arrive)
            if (next < r.steps.length) {
              speak(r.steps[next].instruction);
            }
            return next;
          }
          return prev;
        });
      },
      (err) => console.warn('GPS error:', err.code, err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );
  }, [route, userPos, mode, computeRoute, applyRoute, speak, stopNav, rerouting]);

  // ── Sync modeRef ─────────────────────────────────────────────────────────

  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ── Suivi carte ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!navActive || !following || !mapRef.current || !gpsPos) return;
    mapRef.current.flyTo([gpsPos.lat, gpsPos.lng], 18, { animate: true, duration: 0.4 });
  }, [gpsPos, navActive, following]);

  // ── Centrer sur service sélectionné (hors navigation) ────────────────────

  useEffect(() => {
    if (!selectedService || !mapRef.current || navActive || loading) return;
    const [lng, lat] = selectedService.location.coordinates;
    mapRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1 });
  }, [selectedService, navActive, loading]);

  // ── Mode provider : clic sur la carte ────────────────────────────────────

  useEffect(() => {
    if (!isProviderMode || !onMapClick) return;
    const id = setInterval(() => {
      if (!mapRef.current) return;
      clearInterval(id);
      mapRef.current.on('click', (e: L.LeafletMouseEvent) =>
        onMapClick({ lngLat: { lat: e.latlng.lat, lng: e.latlng.lng } }),
      );
    }, 150);
    return () => clearInterval(id);
  }, [isProviderMode, onMapClick]);

  // Nettoyage
  useEffect(() => () => stopTracking(), [stopTracking]);

  // ── Tracé affiché ─────────────────────────────────────────────────────────

  const displayPath: LeafletPos[] = (() => {
    if (!route) return [];
    if (navActive && pathIdxRef.current > 0) {
      return toLeaflet(route.path.slice(pathIdxRef.current));
    }
    return toLeaflet(route.path);
  })();

  const navMarkerPos: LeafletPos | null = gpsPos
    ? [gpsPos.lat, gpsPos.lng]
    : userPos
    ? [userPos.lat, userPos.lng]
    : null;

  const modeColor = mode.color;

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: 'system-ui, sans-serif' }}>

      {/* ════ CARTE ════ */}
      <MapContainer
        center={mapCenter}
        zoom={userPos ? 14 : 12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
        ref={mapRef}
      >
        <TileLayer key={theme.id} url={theme.url} attribution={theme.attr} />
        <MapReady />

        {/* Tracé */}
        {!isProviderMode && displayPath.length > 1 && (
          <>
            {/* Ombre du tracé */}
            <Polyline positions={displayPath} color="rgba(0,0,0,.15)" weight={11} />
            {/* Tracé principal */}
            <Polyline
              positions={displayPath}
              color={offRoute ? '#ea4335' : modeColor}
              weight={6}
              opacity={0.92}
              dashArray={mode.id === 'walking' ? '10,8' : undefined}
            />
          </>
        )}

        {/* Marqueur navigation (flèche orientée) */}
        {navActive && navMarkerPos && (
          <Marker position={navMarkerPos} icon={navArrowIcon(bearing, modeColor)}>
            <Popup>📍 Position actuelle</Popup>
          </Marker>
        )}

        {/* Point utilisateur statique */}
        {!navActive && userPos && (
          <Marker
            position={[userPos.lat, userPos.lng]}
            icon={isProviderMode ? providerEditIcon : userDotIcon}
          >
            <Popup>{isProviderMode ? '✏️ Votre établissement' : '📍 Vous êtes ici'}</Popup>
          </Marker>
        )}

        {/* Marqueurs services */}
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
                <div style={{ minWidth: 200, fontFamily: 'system-ui,sans-serif' }}>
                  <strong style={{ fontSize: 14 }}>{s.name}</strong>
                  <p style={{ margin: '4px 0 6px', fontSize: 12, color: '#555' }}>
                    {s.location.address}
                  </p>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: '#1a73e8', fontWeight: 600 }}>{s.basePrice} DT</span>
                    <span>⭐ {s.avgRating} ({s.reviewCount} avis)</span>
                  </div>
                  <button
                    onClick={() => handleCalculate(s, mode)}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '8px 0',
                      background: loading ? '#93c5fd' : '#1a73e8',
                      color: '#fff', border: 'none', borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {loading ? '⏳ Calcul…' : '🗺️ Itinéraire'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ════ SÉLECTEUR DE THÈME ════ */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000 }}>
        <button
          onClick={() => setThemeOpen((o) => !o)}
          style={{
            padding: '7px 12px', background: 'white', border: 'none',
            borderRadius: 8, fontSize: 12, cursor: 'pointer',
            boxShadow: '0 1px 6px rgba(0,0,0,.18)',
            display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500,
          }}
        >
          {theme.emoji} {theme.label} ▾
        </button>
        {themeOpen && (
          <div style={{
            marginTop: 4, background: 'white', borderRadius: 8,
            overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,.18)',
          }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t);
                  localStorage.setItem('mapTheme', t.id);
                  setThemeOpen(false);
                }}
                style={{
                  display: 'block', width: '100%', padding: '9px 14px',
                  background: t.id === theme.id ? '#e8f0fe' : 'white',
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  fontSize: 13, fontWeight: t.id === theme.id ? 600 : 400,
                  color: t.id === theme.id ? '#1a73e8' : '#374151',
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ════ PANNEAU ITINÉRAIRE (avant navigation) ════ */}
      {!isProviderMode && route && !navActive && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: 'white', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,.13)',
          padding: '0 16px 28px',
        }}>
          <div style={{
            width: 40, height: 4, background: '#e5e7eb',
            borderRadius: 2, margin: '12px auto 16px',
          }} />

          {/* Nom du service */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea4335', flexShrink: 0 }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', flex: 1 }}>
              {route.service.name}
            </span>
          </div>

          {/* Modes de transport */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m)}
                disabled={loading}
                style={{
                  flex: 1, padding: '9px 4px',
                  border: `2px solid ${mode.id === m.id ? m.color : '#e5e7eb'}`,
                  borderRadius: 12,
                  background: mode.id === m.id ? `${m.color}18` : 'white',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: mode.id === m.id ? m.color : '#6b7280' }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Résumé distance / durée / arrivée */}
          <div style={{
            display: 'flex', background: '#f9fafb', borderRadius: 14,
            border: '1px solid #f3f4f6', marginBottom: 16, overflow: 'hidden',
          }}>
            {[
              { label: 'Distance',     value: fmtDist(route.totalDistanceM) },
              { label: 'Durée',        value: fmtTime(route.durationSec)    },
              { label: 'Arrivée est.', value: fmtArrival(route.durationSec) },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1, padding: '11px 6px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={startNav}
              style={{
                flex: 1, padding: '14px',
                background: '#1a73e8', color: 'white',
                border: 'none', borderRadius: 14,
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ▶ Démarrer la navigation
            </button>
            <button
              onClick={() => { setRoute(null); routeRef.current = null; }}
              style={{
                padding: '14px 18px', background: '#f3f4f6', color: '#6b7280',
                border: 'none', borderRadius: 14, fontSize: 16, cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ════ HUD NAVIGATION ACTIVE ════ */}
      {!isProviderMode && navActive && route && (
        <>
          {/* Bandeau instruction haut */}
          <div style={{
            position: 'absolute',
            top: 12, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1001,
            width: 'min(360px, calc(100vw - 24px))',
            background: rerouting ? '#ea4335' : offRoute ? '#f97316' : '#1a73e8',
            color: 'white', borderRadius: 18,
            padding: '13px 14px',
            boxShadow: '0 4px 22px rgba(0,0,0,.3)',
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'background .3s',
          }}>
            {/* Flèche manœuvre */}
            <div style={{
              width: 50, height: 50, flexShrink: 0,
              background: 'rgba(255,255,255,.18)', borderRadius: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800,
            }}>
              {rerouting ? '🔄' : stepArrow(currentStep?.maneuver ?? '', currentStep?.modifier)}
            </div>

            {/* Instruction */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>
                {rerouting ? 'Recalcul en cours…' : currentStep?.instruction ?? 'En route…'}
              </div>
              {!rerouting && currentStep && currentStep.distanceM > 10 && (
                <div style={{ fontSize: 12, opacity: .8, marginTop: 3 }}>
                  dans {fmtDist(currentStep.distanceM)}
                </div>
              )}
              {offRoute && !rerouting && (
                <div style={{ fontSize: 11, marginTop: 2, opacity: .9 }}>
                  ⚠️ Hors itinéraire — recalcul…
                </div>
              )}
            </div>

            {/* Prochaine manœuvre */}
            {!rerouting && nextStep && (
              <div
                title={nextStep.instruction}
                style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: 'rgba(255,255,255,.15)', borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                {stepArrow(nextStep.maneuver, nextStep.modifier)}
              </div>
            )}

            {/* Bouton stop */}
            <button
              onClick={stopNav}
              style={{
                width: 34, height: 34, flexShrink: 0,
                background: 'rgba(255,255,255,.22)',
                border: 'none', borderRadius: 8,
                color: 'white', fontSize: 15, cursor: 'pointer',
              }}
            >✕</button>
          </div>

          {/* Bouton lock/unlock suivi carte */}
          <button
            onClick={() => setFollowing((f) => !f)}
            style={{
              position: 'absolute', top: 80, right: 12, zIndex: 1001,
              width: 44, height: 44,
              background: following ? '#1a73e8' : 'white',
              border: `2px solid ${following ? '#1a73e8' : '#e5e7eb'}`,
              borderRadius: 12, fontSize: 18, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,.18)',
              color: following ? 'white' : '#374151',
            }}
            title={following ? 'Suivi activé' : 'Suivi désactivé'}
          >
            {following ? '🔒' : '🔓'}
          </button>

          {/* HUD bas */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1001,
            background: 'white', borderRadius: '20px 20px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,.12)',
          }}>
            {/* Résumé cliquable */}
            <div onClick={() => setHudOpen((o) => !o)} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 2, margin: '10px auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px 14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 30, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                      {fmtTime(remainSec)}
                    </span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                      {fmtDist(remainM)} · {fmtArrival(remainSec)}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {hudOpen ? '▼ Fermer' : '▲ Étapes'}
                </span>
              </div>
            </div>

            {/* Liste des étapes */}
            {hudOpen && (
              <div style={{
                borderTop: '1px solid #f3f4f6',
                maxHeight: 240, overflowY: 'auto',
                padding: '6px 0 18px',
              }}>
                {route.steps.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 18px',
                      background: i === stepIdx ? '#e8f0fe' : 'transparent',
                      borderLeft: `3px solid ${i === stepIdx ? '#1a73e8' : 'transparent'}`,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, flexShrink: 0,
                      background: i === stepIdx ? '#1a73e8' : '#f3f4f6',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700,
                      color: i === stepIdx ? 'white' : '#6b7280',
                    }}>
                      {stepArrow(s.maneuver, s.modifier)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: i === stepIdx ? 700 : 400,
                        color: i === stepIdx ? '#111827' : '#4b5563',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.instruction}
                      </div>
                      {s.streetName && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                          {s.streetName}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>
                      {fmtDist(s.distanceM)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════ SPINNER CHARGEMENT ════ */}
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 1002,
          background: 'white', borderRadius: 14, padding: '16px 24px',
          boxShadow: '0 4px 24px rgba(0,0,0,.2)',
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 14, color: '#374151',
        }}>
          <div style={{
            width: 20, height: 20,
            border: '2.5px solid #e5e7eb',
            borderTop: `2.5px solid ${modeColor}`,
            borderRadius: '50%',
            animation: 'lmc-spin .7s linear infinite',
          }} />
          Calcul de l'itinéraire…
        </div>
      )}

      {/* ════ INDICE MODE PROVIDER ════ */}
      {isProviderMode && (
        <div style={{
          position: 'absolute', bottom: 14, left: '50%',
          transform: 'translateX(-50%)', zIndex: 1000,
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 10, padding: '8px 18px',
          fontSize: 12, color: '#4b5563',
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          whiteSpace: 'nowrap',
        }}>
          ✏️ Mode édition — cliquez pour repositionner
        </div>
      )}

      <style>{`
        @keyframes lmc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}