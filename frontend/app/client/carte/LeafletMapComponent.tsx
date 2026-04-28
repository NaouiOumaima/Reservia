'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LatLngTuple = [number, number];

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

interface LeafletMapComponentProps {
  services: Service[];
  userLocation: [number, number] | null;
  selectedService: Service | null;
  onMarkerClick: (service: Service) => void;
}

const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapUpdater() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function LeafletMapComponent({
  services: initialServices,
  userLocation,
  selectedService,
  onMarkerClick,
}: LeafletMapComponentProps) {
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);
  const [routeInfo, setRouteInfo] = useState<{
    coordinates: LatLngTuple[];
    distance: string;
    duration: string;
  } | null>(null);

  const defaultCenter: LatLngTuple = [36.8065, 10.1815];
  const userLatLng: LatLngTuple | null = userLocation ? [userLocation[1], userLocation[0]] : null;
  const mapCenter: LatLngTuple = userLatLng ?? defaultCenter;
  const zoom = userLatLng ? 13 : 12;

  // Fetch services from backend if not provided
  useEffect(() => {
    if (!initialServices || initialServices.length === 0) {
      const fetchServices = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/services`);
          const data = await response.json();
          if (Array.isArray(data)) {
            setServices(data);
          }
        } catch (err) {
          console.error('Error fetching services:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    }
  }, [initialServices]);

  // Get provider location for additional markers
  useEffect(() => {
    const fetchProviderLocation = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/services/provider`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Add provider services to the map if not already included
          const providerServices = data.filter(
            (ps: Service) => !services.some(s => s._id === ps._id)
          );
          if (providerServices.length > 0) {
            setServices(prev => [...prev, ...providerServices]);
          }
        }
      } catch (err) {
        console.error('Error fetching provider services:', err);
      }
    };
    fetchProviderLocation();
  }, []);

  const handleRoute = async (service: Service) => {
    if (!userLatLng) return;
    const [startLat, startLng] = userLatLng;
    const [endLat, endLng] = [service.location.coordinates[1], service.location.coordinates[0]];

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]) {
        const route = data.routes[0];
        const coordsGeo = route.geometry.coordinates as [number, number][];
        const coordsLatLng: LatLngTuple[] = coordsGeo.map(([lng, lat]) => [lat, lng]);
        setRouteInfo({
          coordinates: coordsLatLng,
          distance: `${(route.distance / 1000).toFixed(1)} km`,
          duration: `${Math.round(route.duration / 60)} min`,
        });
      }
    } catch (err) {
      console.error('Erreur itinéraire', err);
    }
  };

  const closeRoute = () => setRouteInfo(null);

  return (
    <div className="service-map-wrapper">
      <MapContainer center={mapCenter} zoom={zoom} className="service-map" scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapUpdater />

        {userLatLng && (
          <Marker position={userLatLng}>
            <Popup>📍 Vous êtes ici</Popup>
          </Marker>
        )}

        {services.map((service) => {
          const [lng, lat] = service.location.coordinates;
          return (
            <Marker
              key={service._id}
              position={[lat, lng]}
              eventHandlers={{ click: () => onMarkerClick(service) }}
            >
              <Popup>
                <div className="service-popup-content">
                  <h3>{service.name}</h3>
                  <p>{service.location.address}</p>
                  <div className="service-popup-info">
                    <span className="price">{service.basePrice} DT</span>
                    <div className="rating">★ {service.avgRating}</div>
                  </div>
                  <button onClick={() => handleRoute(service)} className="itineraire-btn">
                    🗺️ Itinéraire
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {routeInfo && (
          <>
            <Polyline positions={routeInfo.coordinates} color="#3b82f6" weight={5} />
            <div className="service-map-directions-panel">
              <div className="service-map-travel-info">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📏</span>
                    <span className="font-semibold">{routeInfo.distance}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⏱️</span>
                    <span className="font-semibold">{routeInfo.duration}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    // Open in Google Maps or Apple Maps
                    const dest = services.find(s => routeInfo.coordinates.some(
                      c => c[0] === s.location.coordinates[1] && c[1] === s.location.coordinates[0]
                    ));
                    if (dest && userLatLng) {
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLatLng[0]},${userLatLng[1]}&destination=${dest.location.coordinates[1]},${dest.location.coordinates[0]}`;
                      window.open(url, '_blank');
                    }
                  }}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
                >
                  <span>🧭</span>
                  <span>Naviguer avec Google Maps</span>
                </button>
              </div>
              <button onClick={closeRoute} className="service-map-close-directions">
                ✕ Fermer
              </button>
            </div>
          </>
        )}
      </MapContainer>

      {selectedService && (
        <ChangeView
          center={[selectedService.location.coordinates[1], selectedService.location.coordinates[0]]}
          zoom={15}
        />
      )}
    </div>
  );
}