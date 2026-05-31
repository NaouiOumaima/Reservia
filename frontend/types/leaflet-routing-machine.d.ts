// types/leaflet-routing-machine.d.ts
// Déclaration de types manuelle pour leaflet-routing-machine

import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface RouteSummary {
      totalDistance: number;
      totalTime: number;
    }

    interface IRoute {
      name: string;
      summary: RouteSummary;
      coordinates: L.LatLng[];
      waypoints: Waypoint[];
      inputWaypoints: Waypoint[];
      instructions: IInstruction[];
    }

    interface IInstruction {
      type: string;
      text: string;
      distance: number;
      time: number;
      index: number;
      mode: string;
      modifier?: string;
    }

    interface Waypoint {
      latLng: L.LatLng;
      name?: string;
      options?: WaypointOptions;
    }

    interface WaypointOptions {
      allowUTurn?: boolean;
    }

    interface RoutingResultEvent {
      waypoints: Waypoint[];
      routes: IRoute[];
    }

    interface RoutingErrorEvent {
      error: {
        status: number;
        message: string;
      };
    }

    interface LineOptions {
      styles?: L.PathOptions[];
      extendToWaypoints?: boolean;
      missingRouteTolerance?: number;
    }

    interface ControlOptions {
      waypoints?: L.LatLng[] | Waypoint[];
      router?: IRouter;
      plan?: Plan;
      show?: boolean;
      collapsible?: boolean;
      collapseBtn?: (itinerary: Itinerary) => void;
      collapseBtnClass?: string;
      autoRoute?: boolean;
      routeWhileDragging?: boolean;
      routeDragInterval?: number;
      waypointMode?: string;
      useZoomParameter?: boolean;
      showAlternatives?: boolean;
      altLineOptions?: LineOptions;
      lineOptions?: LineOptions;
      addWaypoints?: boolean;
      fitSelectedRoutes?: boolean | string;
      language?: string;
    }

    interface OSRMv1Options {
      serviceUrl?: string;
      profile?: string;
      timeout?: number;
      routingOptions?: object;
      polylinePrecision?: number;
      useHints?: boolean;
      suppressDemoServerWarning?: boolean;
      language?: string;
    }

    interface IRouter {
      route(
        waypoints: Waypoint[],
        callback: (error?: Error, routes?: IRoute[]) => void,
        context?: object,
        options?: object,
      ): void;
    }

    class Plan extends L.Layer {
      constructor(waypoints: L.LatLng[] | Waypoint[], options?: object);
    }

    class Itinerary extends L.Control {
      constructor(options?: object);
    }

    class Control extends L.Control {
      constructor(options?: ControlOptions);
      getWaypoints(): Waypoint[];
      setWaypoints(waypoints: L.LatLng[] | Waypoint[]): this;
      spliceWaypoints(index: number, waypointsToRemove: number, ...waypoints: L.LatLng[]): Waypoint[];
      getPlan(): Plan;
      getRouter(): IRouter;
      route(): void;
      on(type: 'routesfound', fn: (e: RoutingResultEvent) => void): this;
      on(type: 'routingerror', fn: (e: RoutingErrorEvent) => void): this;
      on(type: string, fn: (e: any) => void): this;
    }

    function control(options?: ControlOptions): Control;
    function osrmv1(options?: OSRMv1Options): IRouter;
    function waypoint(latLng: L.LatLng, name?: string, options?: WaypointOptions): Waypoint;
  }
}