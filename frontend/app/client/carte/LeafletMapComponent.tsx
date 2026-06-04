'use client';

/**
 * LeafletMapComponent — Navigation Google Maps-like
 * - Mode client : recherche de services et navigation
 * - Mode prestataire : affichage des services avec leurs localisations déjà définies
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  MapPinIcon,
  MapIcon,
  ClockIcon,
  CheckIcon,
  CloseIcon,
  SearchIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  Loader2Icon,
  LocationIcon,
} from '@/components/ui/Icons';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    coordinates: [number, number];
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
  userLocation: [number, number] | null;
  selectedService: Service | null;
  onMarkerClick: (s: Service) => void;
  isProviderMode?: boolean;
  onMapClick?: (e: { lngLat: { lat: number; lng: number } }) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OSRM_BASE = 'https://router.project-osrm.org/route/v1';
const OSRM_PROFILES: Record<string, string> = { driving: 'driving', walking: 'foot', cycling: 'bike' };
const FALLBACK_SPEED_MS: Record<string, number> = { driving: 13.9, walking: 1.4, cycling: 4.2 };
const MAX_SPEED_MS: Record<string, number> = { driving: 55.6, walking: 3.5, cycling: 16.7 };
const OFF_ROUTE_THRESHOLD_M  = 40;
const STEP_ADVANCE_M         = 20;
const ARRIVAL_M              = 15;
const REROUTE_COOLDOWN_MS    = 15_000;
const OSRM_TIMEOUT_MS        = 15_000;
const GPS_SMOOTH_ALPHA       = 0.25;

const THEMES = [
  { id: 'streets', label: 'Standard',  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                                                         attr: '&copy; OpenStreetMap' },
  { id: 'dark',    label: 'Sombre',    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',                                               attr: '&copy; CARTO' },
  { id: 'light',   label: 'Clair',     url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',                                              attr: '&copy; CARTO' },
  { id: 'satellite', label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',              attr: '&copy; Esri' },
];

const MODES = [
  { id: 'driving', label: 'Voiture', osrm: 'driving', color: '#1a73e8', lineWeight: 6 },
  { id: 'walking', label: 'À pied',  osrm: 'foot',    color: '#0f9d58', lineWeight: 5 },
  { id: 'cycling', label: 'Vélo',    osrm: 'bike',    color: '#f29900', lineWeight: 5 },
];

// ─── Geometry helpers ──────────────────────────────────────────────────────────

function haversine(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180, φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function calcBearing(from: LatLng, to: LatLng): number {
  const φ1 = (from.lat * Math.PI) / 180, φ2 = (to.lat * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const y  = Math.sin(Δλ) * Math.cos(φ2);
  const x  = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function toLeaflet(path: LatLng[]): LeafletPos[] {
  return path.map((p) => [p.lat, p.lng]);
}

function snapToRoute(pos: LatLng, path: LatLng[], fromIdx = 0): { segIdx: number; distM: number } {
  let best = { segIdx: fromIdx, distM: Infinity };
  const searchEnd = Math.min(path.length - 1, fromIdx + 300);
  for (let i = fromIdx; i < searchEnd; i++) {
    const a = path[i], b = path[i + 1] ?? path[i];
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
  if (speedMs > 0.5 && speedMs < maxSpeed)
    return Math.max(5, Math.round((remainM / speedMs) * 0.6 + ratioEst * 0.4));
  return Math.max(5, Math.round(ratioEst));
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function fmtDist(m: number): string {
  if (m < 50)   return `${Math.round(m)} m`;
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function fmtTime(sec: number): string {
  if (sec < 60) return '< 1 min';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function fmtArrival(sec: number): string {
  return new Date(Date.now() + sec * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Instructions ─────────────────────────────────────────────────────────────

function buildInstruction(type: string, modifier?: string, name?: string, exitNum?: number): string {
  const on = name?.trim() ? ` sur ${name}` : '';
  switch (type) {
    case 'depart':         return `Démarrez vers ${modifier ?? 'le nord'}${on}`;
    case 'arrive':         return 'Vous êtes arrivé à destination';
    case 'continue':
    case 'new name':       return `Continuez tout droit${on}`;
    case 'merge':          return `Rejoignez${on}`;
    case 'on ramp':        return `Prenez la bretelle d'entrée${on}`;
    case 'off ramp':       return `Prenez la bretelle de sortie${on}`;
    case 'end of road':    return modifier?.includes('left') ? `Tournez à gauche${on}` : `Tournez à droite${on}`;
    case 'roundabout':
    case 'rotary':         return `Prenez le rond-point${exitNum ? ` (${exitNum}e sortie)` : ''}${on}`;
    case 'exit roundabout':
    case 'exit rotary':    return `Quittez le rond-point${on}`;
    case 'fork':           return modifier?.includes('left') ? `Restez à gauche${on}` : `Restez à droite${on}`;
    case 'turn':
      switch (modifier) {
        case 'left':       return `Tournez à gauche${on}`;
        case 'right':      return `Tournez à droite${on}`;
        case 'sharp left': return `Virage serré à gauche${on}`;
        case 'sharp right':return `Virage serré à droite${on}`;
        case 'slight left':return `Légèrement à gauche${on}`;
        case 'slight right':return `Légèrement à droite${on}`;
        case 'uturn':      return `Faites demi-tour${on}`;
        default:           return `Tournez${on}`;
      }
    default: return `Continuez${on}`;
  }
}

function stepArrow(type: string, modifier?: string): string {
  if (type === 'depart')  return '↑';
  if (type === 'arrive')  return '⊙';
  if (type === 'roundabout' || type === 'rotary') return '↻';
  if (!modifier)          return '↑';
  if (modifier === 'uturn') return '↩';
  if (modifier.includes('sharp left'))  return '↰';
  if (modifier.includes('sharp right')) return '↱';
  if (modifier.includes('slight left')) return '↖';
  if (modifier.includes('slight right'))return '↗';
  if (modifier.includes('left'))  return '←';
  if (modifier.includes('right')) return '→';
  return '↑';
}

function buildVoiceAnnounce(step: NavStep, distM: number): string | null {
  if (step.maneuver === 'arrive') {
    if (distM < 50)  return 'Vous êtes arrivé à destination.';
    if (distM < 200) return `Dans ${fmtDist(distM)}, vous serez arrivé.`;
    return null;
  }
  if (distM < STEP_ADVANCE_M) return step.instruction;
  if (distM < 500)            return `Dans ${fmtDist(distM)}, ${step.instruction.toLowerCase()}`;
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

// ─── Leaflet icons ────────────────────────────────────────────────────────────

function serviceIcon(selected: boolean): L.DivIcon {
  const sz = selected ? 38 : 30, color = selected ? '#1a73e8' : '#ea4335';
  return L.divIcon({
    className: '',
    html: `<div class="lmap-marker-pin${selected ? ' lmap-marker-pin--selected' : ''}" style="width:${sz}px;height:${sz}px;background:${color}"></div>`,
    iconSize: [sz, sz], iconAnchor: [sz / 2, sz], popupAnchor: [0, -sz],
  });
}

// Icône pour le mode prestataire (affichage simple, pas d'édition)
function providerServiceIcon(hasLocation: boolean): L.DivIcon {
  const color = hasLocation ? '#0f9d58' : '#f29900';
  return L.divIcon({
    className: '',
    html: `<div class="lmap-provider-pin" style="background:${color};"><span class="lmap-provider-initial">📍</span></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
  });
}

const userDotIcon = L.divIcon({
  className: '',
  html: `<div class="lmap-user-dot"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

function navArrowIcon(bearing: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="lmap-nav-arrow" style="transform:rotate(${bearing}deg)"><svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="26" fill="${color}" stroke="white" stroke-width="4"/><polygon points="28,9 21,30 28,25 35,30" fill="white"/><circle cx="28" cy="28" r="4" fill="white" opacity="0.4"/></svg></div>`,
    iconSize: [56, 56], iconAnchor: [28, 28],
  });
}

function destinationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="lmap-marker-pin lmap-marker-pin--dest"></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MapReady() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 150); }, [map]);
  return null;
}

function MapClickHandler({ active, onMapClick }: { active: boolean; onMapClick?: (e: { lngLat: { lat: number; lng: number } }) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!active || !onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) => onMapClick({ lngLat: { lat: e.latlng.lat, lng: e.latlng.lng } });
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, active, onMapClick]);
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

  const [theme, setTheme]             = useState(THEMES[0]);
  const [themeOpen, setThemeOpen]     = useState(false);
  const [mode, setMode]               = useState(MODES[0]);
  const [route, setRoute]             = useState<Route | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [navActive, setNavActive]     = useState(false);
  const [stepIdx, setStepIdx]         = useState(0);
  const [gpsPos, setGpsPos]           = useState<LatLng | null>(null);
  const [bearing, setBearing]         = useState(0);
  const [following, setFollowing]     = useState(true);
  const [hudOpen, setHudOpen]         = useState(false);
  const [remainM, setRemainM]         = useState(0);
  const [remainSec, setRemainSec]     = useState(0);
  const [offRoute, setOffRoute]       = useState(false);
  const [rerouting, setRerouting]     = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [distToNextStep, setDistToNextStep] = useState(0);

  const userPos: LatLng | null = userLocation ? { lat: userLocation[1], lng: userLocation[0] } : null;
  const mapCenter: LeafletPos  = userPos ? [userPos.lat, userPos.lng] : [36.8065, 10.1815];

  const speak = useCallback((text: string, priority = false) => {
    if (!('speechSynthesis' in window) || !text) return;
    if (priority) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; u.rate = 1.0; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }, []);

  const computeAndSetRoute = useCallback(async (service: Service, m: typeof MODES[0], fromPos?: LatLng): Promise<Route | null> => {
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

  const handleModeChange = useCallback(async (m: typeof MODES[0]) => {
    setMode(m); modeRef.current = m;
    if (route?.service) await computeAndSetRoute(route.service, m, gpsPos ?? undefined);
  }, [route, gpsPos, computeAndSetRoute]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
  }, []);

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
          stopNav(); alert('Vous êtes arrivé à destination !'); return;
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

  const handleMapClick = useCallback((e: { lngLat: { lat: number; lng: number } }) => {
    if (isProviderMode) onMapClick?.(e);
  }, [isProviderMode, onMapClick]);

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

  const displayPath: LeafletPos[] = route
    ? toLeaflet(navActive && pathSegIdxRef.current > 0 ? route.path.slice(pathSegIdxRef.current) : route.path)
    : [];
  const navMarkerPos: LeafletPos | null = gpsPos
    ? [gpsPos.lat, gpsPos.lng]
    : userPos ? [userPos.lat, userPos.lng] : null;

  const currentStep = route?.steps[stepIdx] ?? null;
  const nextStep    = route?.steps[stepIdx + 1] ?? null;
  const modeColor   = mode.color;

  // Vérifie si un service a une localisation valide
  const hasValidLocation = (service: Service): boolean => {
    return service.location?.coordinates?.length === 2 &&
           service.location.coordinates[0] !== 0 &&
           service.location.coordinates[1] !== 0;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="lmap-root">

      {/* ═══ MAP ════════════════════════════════════════════════════════════ */}
      <MapContainer
        center={mapCenter}
        zoom={userPos ? 14 : 12}
        className="lmap-container"
        scrollWheelZoom
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer key={theme.id} url={theme.url} attribution={theme.attr} />
        <MapReady />
        <MapClickHandler active={isProviderMode} onMapClick={handleMapClick} />

        {/* Routes - uniquement pour le mode client */}
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

        {/* Navigation marker - uniquement pour le mode client */}
        {!isProviderMode && navActive && navMarkerPos && (
          <Marker position={navMarkerPos} icon={navArrowIcon(bearing, modeColor)} />
        )}

        {/* User location - uniquement pour le mode client */}
        {!isProviderMode && !navActive && userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userDotIcon}>
            <Popup>
              <div className="lmap-popup-content">
                <LocationIcon className="w-4 h-4" />
                <span>Vous êtes ici</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker - uniquement pour le mode client */}
        {!isProviderMode && route && navActive && (() => {
          const [lng, lat] = route.service.location.coordinates;
          return (
            <Marker position={[lat, lng]} icon={destinationIcon()}>
              <Popup>{route.service.name}</Popup>
            </Marker>
          );
        })()}

        {/* Affichage des services */}
        {services.map((s) => {
          // Vérifier si les coordonnées sont valides
          if (!hasValidLocation(s)) return null;
          
          const [sLng, sLat] = s.location.coordinates;
          const sel = selectedService?._id === s._id;
          
          // Mode prestataire : icône différente, pas d'itinéraire
          if (isProviderMode) {
            return (
              <Marker
                key={s._id}
                position={[sLat, sLng]}
                icon={providerServiceIcon(true)}
                eventHandlers={{ click: () => onMarkerClick(s) }}
              >
                <Popup>
                  <div className="lmap-popup-service">
                    <div className="lmap-popup-service-name">{s.name}</div>
                    <div className="lmap-popup-service-addr">{s.location.address}</div>
                    <div className="lmap-popup-service-row">
                      <span className="lmap-popup-price">{s.basePrice} DT</span>
                      <span className="lmap-popup-rating">
                        <CheckIcon className="w-3 h-3" />
                        {s.avgRating} ({s.reviewCount})
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          
          // Mode client : icône normale avec itinéraire
          return (
            <Marker
              key={s._id}
              position={[sLat, sLng]}
              icon={serviceIcon(sel)}
              eventHandlers={{ click: () => onMarkerClick(s) }}
            >
              <Popup>
                <div className="lmap-popup-service">
                  <div className="lmap-popup-service-name">{s.name}</div>
                  <div className="lmap-popup-service-addr">{s.location.address}</div>
                  <div className="lmap-popup-service-row">
                    <span className="lmap-popup-price">{s.basePrice} DT</span>
                    <span className="lmap-popup-rating">
                      <CheckIcon className="w-3 h-3" />
                      {s.avgRating} ({s.reviewCount})
                    </span>
                  </div>
                  <button
                    onClick={() => computeAndSetRoute(s, mode)}
                    disabled={loading}
                    className="lmap-popup-btn"
                  >
                    {loading
                      ? <><Loader2Icon className="w-3 h-3 animate-spin" /> Calcul…</>
                      : <><MapIcon className="w-3 h-3" /> Itinéraire</>}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ═══ THEME SELECTOR ══════════════════════════════════════════════ */}
      <div className="lmap-theme-wrap">
        <button
          className="lmap-theme-trigger"
          onClick={() => setThemeOpen((o) => !o)}
          aria-label="Changer le thème de la carte"
        >
          <MapIcon className="w-4 h-4" />
          <span>{theme.label}</span>
          <ChevronDownIcon className={`w-3 h-3 lmap-chevron${themeOpen ? ' lmap-chevron--open' : ''}`} />
        </button>

        {themeOpen && (
          <div className="lmap-theme-dropdown animate-scaleIn">
            {THEMES.map((t) => (
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

      {/* ═══ ERROR BANNER ════════════════════════════════════════════════ */}
      {error && !navActive && (
        <div className="lmap-error-banner animate-fadeIn">
          <AlertTriangleIcon className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* ═══ ROUTE PANEL (pre-navigation) - uniquement mode client ═══════ */}
      {!isProviderMode && route && !navActive && (
        <div className="lmap-route-panel animate-slideInRight">
          <div className="lmap-panel-handle" />

          <div className="lmap-route-header">
            <div className="lmap-route-dest-dot" />
            <span className="lmap-route-dest-name">{route.service.name}</span>
          </div>

          <div className="lmap-mode-selector">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`lmap-mode-btn${mode.id === m.id ? ' lmap-mode-btn--active' : ''}`}
                style={mode.id === m.id ? { borderColor: m.color, background: `${m.color}18`, color: m.color } : {}}
                onClick={() => handleModeChange(m)}
                disabled={loading}
              >
                <span className="lmap-mode-label">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="lmap-stats-row">
            <div className="lmap-stat-cell">
              <MapPinIcon className="w-4 h-4 text-muted" />
              <span className="lmap-stat-label">Distance</span>
              <span className="lmap-stat-value">{fmtDist(route.totalDistanceM)}</span>
            </div>
            <div className="lmap-stat-divider" />
            <div className="lmap-stat-cell">
              <ClockIcon className="w-4 h-4 text-muted" />
              <span className="lmap-stat-label">Durée</span>
              <span className="lmap-stat-value">{fmtTime(route.durationSec)}</span>
            </div>
            <div className="lmap-stat-divider" />
            <div className="lmap-stat-cell">
              <CheckIcon className="w-4 h-4 text-muted" />
              <span className="lmap-stat-label">Arrivée</span>
              <span className="lmap-stat-value">{fmtArrival(route.durationSec)}</span>
            </div>
          </div>

          <div className="lmap-route-actions">
            <button
              className="lmap-start-btn"
              style={{ background: modeColor, boxShadow: `0 4px 14px ${modeColor}50` }}
              onClick={startNav}
            >
              <ArrowRightIcon className="w-5 h-5" />
              Démarrer la navigation
            </button>
            <button
              className="lmap-close-route-btn"
              onClick={() => { setRoute(null); routeRef.current = null; setError(null); }}
              aria-label="Fermer l'itinéraire"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ NAV HUD - uniquement mode client ════════════════════════════ */}
      {!isProviderMode && navActive && route && (
        <>
          <div
            className="lmap-turn-card animate-fadeIn"
            style={{
              background: rerouting ? '#ea4335' : offRoute ? '#f97316' : modeColor,
            }}
          >
            <div className="lmap-turn-arrow">
              <span className="lmap-turn-arrow-symbol">
                {rerouting ? '↻' : stepArrow(currentStep?.maneuver ?? '', currentStep?.modifier)}
              </span>
            </div>

            <div className="lmap-turn-body">
              <div className="lmap-turn-dist">
                {rerouting ? '…' : fmtDist(distToNextStep || currentStep?.distanceM || 0)}
              </div>
              <div className="lmap-turn-instruction">
                {rerouting ? 'Recalcul en cours…' : offRoute ? 'Hors itinéraire' : (currentStep?.instruction ?? 'En route…')}
              </div>
              {currentStep?.streetName && !rerouting && (
                <div className="lmap-turn-street">{currentStep.streetName}</div>
              )}
            </div>

            {nextStep && !rerouting && (
              <div className="lmap-turn-next">
                <span className="lmap-turn-next-arrow">{stepArrow(nextStep.maneuver, nextStep.modifier)}</span>
                <span className="lmap-turn-next-dist">{fmtDist(nextStep.distanceM)}</span>
              </div>
            )}

            <button className="lmap-turn-stop" onClick={stopNav} aria-label="Arrêter la navigation">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            className={`lmap-recenter-btn${following ? ' lmap-recenter-btn--active' : ''}`}
            style={following ? { background: modeColor, borderColor: modeColor } : {}}
            onClick={() => setFollowing((f) => !f)}
            aria-label={following ? 'Libérer le suivi' : 'Recentrer'}
          >
            <LocationIcon className="w-5 h-5" />
          </button>

          <div className="lmap-eta-bar">
            <div className="lmap-eta-handle-row" onClick={() => setHudOpen((o) => !o)}>
              <div className="lmap-panel-handle" />
            </div>
            <div className="lmap-eta-content" onClick={() => setHudOpen((o) => !o)}>
              <div className="lmap-eta-left">
                <span className="lmap-eta-time">{fmtTime(remainSec)}</span>
                <span className="lmap-eta-sub">{fmtDist(remainM)} · Arrivée {fmtArrival(remainSec)}</span>
              </div>
              {currentSpeed > 0.5 && (
                <div className="lmap-speed-chip">
                  <span className="lmap-speed-val">{Math.round(currentSpeed * 3.6)}</span>
                  <span className="lmap-speed-unit">km/h</span>
                </div>
              )}
              <div className={`lmap-hud-chevron${hudOpen ? ' lmap-hud-chevron--open' : ''}`}>
                <ChevronDownIcon className="w-4 h-4 text-muted" />
              </div>
            </div>

            {hudOpen && (
              <div className="lmap-steps-list animate-fadeIn">
                {route.steps.map((s, i) => {
                  const isCur = i === stepIdx, isPast = i < stepIdx;
                  return (
                    <div
                      key={i}
                      className={`lmap-step-item${isCur ? ' lmap-step-item--current' : ''}${isPast ? ' lmap-step-item--past' : ''}`}
                      style={isCur ? { borderLeftColor: modeColor } : {}}
                    >
                      <div
                        className="lmap-step-icon"
                        style={isCur ? { background: modeColor, color: '#fff' } : {}}
                      >
                        {stepArrow(s.maneuver, s.modifier)}
                      </div>
                      <div className="lmap-step-body">
                        <div className="lmap-step-instruction">{s.instruction}</div>
                        {s.streetName && <div className="lmap-step-street">{s.streetName}</div>}
                      </div>
                      <div className="lmap-step-meta">
                        <span className="lmap-step-dist">{fmtDist(s.distanceM)}</span>
                        <span className="lmap-step-time">{fmtTime(s.durationSec)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ LOADING SPINNER ══════════════════════════════════════════════ */}
      {loading && (
        <div className="lmap-loading animate-fadeIn">
          <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
          <span>Calcul de l&apos;itinéraire…</span>
        </div>
      )}

      {/* ═══ PROVIDER BANNER (mode prestataire - affichage simple) ═══════ */}
      {isProviderMode && (
        <div className="lmap-provider-banner animate-fadeIn">
          <MapPinIcon className="w-4 h-4" />
          <span>Vos services sur la carte — cliquez sur un marqueur pour voir les détails</span>
        </div>
      )}
    </div>
  );
}