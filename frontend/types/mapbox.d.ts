// frontend/src/types/mapbox.d.ts
declare module '@mapbox/mapbox-gl-directions' {
  import { IControl } from 'mapbox-gl';
  
  interface MapboxDirectionsOptions {
    accessToken: string;
    unit?: 'metric' | 'imperial';
    profile?: 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling';
    alternatives?: boolean;
    geometries?: 'geojson' | 'polyline';
    controls?: {
      instructions?: boolean;
      profileSwitcher?: boolean;
    };
  }
  
  export default class MapboxDirections implements IControl {
    constructor(options: MapboxDirectionsOptions);
    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(): void;
    setOrigin(coordinates: [number, number] | string): void;
    setDestination(coordinates: [number, number] | string): void;
    remove(): void;
  }
}