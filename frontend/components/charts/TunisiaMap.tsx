"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const topojson = require("topojson-client") as {
  feature: (topology: any, object: any) => { type: string; features: any[] };
};

function getRawName(props: any): string {
  return (
    props?.name ||
    props?.NAME ||
    props?.NAME_1 ||
    props?.admin ||
    props?.shapeName ||
    ""
  );
}

const SHORT_NAMES: Record<string, string> = {
  "Ben Arous": "B.Arous",
  "Sidi Bouzid": "S.Bouzid",
  "Tataouine": "Tataoui.",
};

interface TunisiaMapProps {
  onGovernorateClick?: (governorateName: string) => void;
  selectedGovernorate?: string | null;
}

export default function TunisiaMap({ onGovernorateClick, selectedGovernorate }: TunisiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const W = 400;
  const H = 700;

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    fetch("https://cdn.jsdelivr.net/npm/datamaps@0.5.10/src/js/data/tun.topo.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((topo: any) => {
        const objectKey = Object.keys(topo.objects)[0];
        const geojson = topojson.feature(topo, topo.objects[objectKey]);
        const features: any[] = geojson.features;

        const projection = d3.geoMercator().fitSize([W, H], geojson as any);
        const pathGen = d3.geoPath().projection(projection);

        // Polygones
        svg.selectAll<SVGPathElement, any>("path.gov")
          .data(features)
          .join("path")
          .attr("class", "tunisia-map-gov")
          .attr("d", (d: any) => pathGen(d) ?? "")
          .attr("fill", "rgb(var(--primary-light))")
          .attr("stroke", "rgb(var(--surface))")
          .attr("stroke-width", 1.4)
          .style("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent, d: any) {
            const name = getRawName(d.properties);
            setHovered(name);
            d3.select(this)
              .attr("fill", "rgb(var(--primary))")
              .attr("stroke", "rgb(var(--accent))")
              .attr("stroke-width", 2.5);
          })
          .on("mouseleave", function () {
            setHovered(null);
            svg.selectAll<SVGPathElement, any>("path.gov")
              .attr("fill", "rgb(var(--primary-light))")
              .attr("stroke", "rgb(var(--surface))")
              .attr("stroke-width", 1.4);
          })
          .on("click", function (event: MouseEvent, d: any) {
            event.stopPropagation();
            const name = getRawName(d.properties);
            if (onGovernorateClick) {
              onGovernorateClick(name);
            }
          });

        // Labels
        svg.selectAll<SVGTextElement, any>("text.gov-label")
          .data(features)
          .join("text")
          .attr("class", "tunisia-map-label")
          .attr("transform", (d: any) => {
            const [cx, cy] = pathGen.centroid(d);
            return `translate(${cx},${cy})`;
          })
          .text((d: any) => {
            const name = getRawName(d.properties);
            return SHORT_NAMES[name] ?? (name.length > 12 ? name.substring(0, 10) + "..." : name);
          });

        // Mettre en surbrillance le gouvernorat sélectionné
        if (selectedGovernorate) {
          svg.selectAll<SVGPathElement, any>("path.gov")
            .attr("fill", (d: any) => {
              const name = getRawName(d.properties);
              return name === selectedGovernorate ? "rgb(var(--accent))" : "rgb(var(--primary-light))";
            })
            .attr("stroke", (d: any) => {
              const name = getRawName(d.properties);
              return name === selectedGovernorate ? "rgb(var(--primary))" : "rgb(var(--surface))";
            })
            .attr("stroke-width", (d: any) => {
              const name = getRawName(d.properties);
              return name === selectedGovernorate ? 3 : 1.4;
            });
        }
      })
      .catch((err) => {
        console.error("Erreur chargement carte Tunisie:", err);
        setError("Impossible de charger la carte.");
      });
  }, [W, H, onGovernorateClick, selectedGovernorate]);

  if (error) {
    return (
      <div className="tunisia-map-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="tunisia-map-container">
      <div className="tunisia-map-header">
        <h3>Carte des services — Tunisie</h3>
        <p>Cliquez sur un gouvernorat pour voir les services disponibles</p>
        {hovered && (
          <span className="tunisia-map-hover-info">{hovered}</span>
        )}
        {!hovered && selectedGovernorate && !hovered && (
          <span className="tunisia-map-hover-info">{selectedGovernorate}</span>
        )}
      </div>

      <div ref={containerRef} className="tunisia-map-wrapper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="tunisia-map-svg"
        />
      </div>
    </div>
  );
}