// leaflet-routing-machine.d.ts
// Place this file in your project at: src/types/leaflet-routing-machine.d.ts
// (or anywhere TypeScript picks it up, e.g. next to tsconfig.json)

import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    // ── Waypoint ──────────────────────────────────────────────────────────
    interface Waypoint {
      latLng: L.LatLng;
      name?: string;
      options?: WaypointOptions;
    }
    interface WaypointOptions {
      allowUTurn?: boolean;
    }

    // ── Instruction ───────────────────────────────────────────────────────
    interface Instruction {
      type: string;
      text: string;
      distance: number;   // metres, from OSRM
      time: number;       // seconds, from OSRM
      index: number;
      mode?: string;
      modifier?: string;
      road?: string;
      direction?: string;
      exit?: number;
    }

    // ── Route summary — values come directly from OSRM, no calculation ───
    interface RouteSummary {
      totalDistance: number;  // metres
      totalTime: number;      // seconds
    }

    // ── IRoute ────────────────────────────────────────────────────────────
    interface IRoute {
      name: string;
      summary: RouteSummary;
      coordinates: L.LatLng[];
      waypoints: Waypoint[];
      instructions: Instruction[];
      inputWaypoints: Waypoint[];
      actualWaypoints: Waypoint[];
      waypointIndices: number[];
      properties?: Record<string, unknown>;
    }

    // ── IRouter ───────────────────────────────────────────────────────────
    interface IRouter {
      route(
        waypoints: Waypoint[],
        callback: (error: IError | null, routes: IRoute[]) => void,
        context?: unknown,
        options?: RouteOptions,
      ): void;
      abort?(): void;
    }

    interface RouteOptions {
      z?: number;
      allowUTurns?: boolean;
      geometryOnly?: boolean;
      fileFormat?: string;
      simplifyThreshold?: number;
    }

    // ── IError ────────────────────────────────────────────────────────────
    interface IError {
      status: number;
      message: string;
    }

    // ── OSRMv1 options ────────────────────────────────────────────────────
    interface OSRMv1Options {
      serviceUrl?: string;
      profile?: string;
      timeout?: number;
      routingOptions?: Record<string, unknown>;
      polylinePrecision?: number;
      useHints?: boolean;
      suppressDemoServerWarning?: boolean;
      language?: string;
    }

    function osrmv1(options?: OSRMv1Options): IRouter;

    // ── Line options ──────────────────────────────────────────────────────
    interface LineOptions {
      styles?: L.PathOptions[];
      missingRouteTolerance?: number;
      extendToWaypoints?: boolean;
      addWaypoints?: boolean;
    }

    // ── Plan ─────────────────────────────────────────────────────────────
    interface PlanOptions {
      waypoints?: Waypoint[] | L.LatLng[];
      geocoder?: unknown;
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      createMarker?: (
        i: number,
        wp: Waypoint,
        n: number,
      ) => L.Marker | false | null;
      routeWhileDragging?: boolean;
      reverseWaypoints?: boolean;
    }

    class Plan extends L.Layer {
      constructor(waypoints: L.LatLng[] | Waypoint[], options?: PlanOptions);
      setWaypoints(waypoints: L.LatLng[] | Waypoint[]): this;
      getWaypoints(): Waypoint[];
    }

    function plan(waypoints: L.LatLng[] | Waypoint[], options?: PlanOptions): Plan;

    // ── Control ───────────────────────────────────────────────────────────
    interface ControlOptions extends L.ControlOptions {
      waypoints?: L.LatLng[] | Waypoint[];
      router?: IRouter;
      plan?: Plan;
      geocoder?: unknown;
      show?: boolean;
      collapsible?: boolean;
      collapseBtn?: (control: Control) => void;
      routeWhileDragging?: boolean;
      routeDragInterval?: number;
      waypointMode?: 'connect' | 'snap';
      useZoomParameter?: boolean;
      showAlternatives?: boolean;
      altLineOptions?: LineOptions;
      lineOptions?: LineOptions;
      addWaypoints?: boolean;
      fitSelectedRoutes?: boolean | 'smart';
      createMarker?: (
        i: number,
        wp: Waypoint,
        n: number,
      ) => L.Marker | false | null;
      draggableWaypoints?: boolean;
      autoRoute?: boolean;
      language?: string;
      formatter?: unknown;
    }

    class Control extends L.Control {
      constructor(options?: ControlOptions);
      getRouter(): IRouter;
      getPlan(): Plan;
      getWaypoints(): Waypoint[];
      setWaypoints(waypoints: L.LatLng[] | Waypoint[]): this;
      spliceWaypoints(
        index: number,
        waypointsToRemove: number,
        ...waypoints: Waypoint[]
      ): Waypoint[];
      route(): void;
      on(type: 'routesfound',   fn: (e: RoutesFoundEvent)   => void): this;
      on(type: 'routingerror',  fn: (e: RoutingErrorEvent)  => void): this;
      on(type: 'routingstart',  fn: (e: RoutingStartEvent)  => void): this;
      on(type: string,          fn: (e: any)                => void): this;
    }

    function control(options?: ControlOptions): Control;

    // ── Events ────────────────────────────────────────────────────────────
    interface RoutesFoundEvent extends L.LeafletEvent {
      waypoints: Waypoint[];
      routes: IRoute[];
    }

    interface RoutingErrorEvent extends L.LeafletEvent {
      error: IError;
    }

    interface RoutingStartEvent extends L.LeafletEvent {
      waypoints: Waypoint[];
    }
  }
}