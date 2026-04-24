"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const topojson = require("topojson-client") as {
  feature: (topology: any, object: any) => { type: string; features: any[] };
};

// Données de livraisons pour chaque gouvernorat
const deliveries: Record<string, number> = {
  "Tunis": 2850,
  "Ariana": 1850,
  "Ben Arous": 1650,
  "Manouba": 1200,
  "Nabeul": 2100,
  "Zaghouan": 450,
  "Bizerte": 980,
  "Béja": 380,
  "Jendouba": 320,
  "Le Kef": 280,
  "Siliana": 250,
  "Sousse": 2350,
  "Monastir": 1950,
  "Mahdia": 1250,
  "Sfax": 2850,
  "Kairouan": 890,
  "Kasserine": 420,
  "Sidi Bouzid": 350,
  "Gabès": 780,
  "Médenine": 650,
  "Tataouine": 180,
  "Gafsa": 520,
  "Tozeur": 290,
  "Kébili": 310,
};

// Correspondance des noms
const NAME_ALIASES: Record<string, string> = {
  "beja": "Béja",
  "béja": "Béja",
  "gabes": "Gabès",
  "gabès": "Gabès",
  "gafsa": "Gafsa",
  "jendouba": "Jendouba",
  "kairouan": "Kairouan",
  "kasserine": "Kasserine",
  "kebili": "Kébili",
  "kébili": "Kébili",
  "le kef": "Le Kef",
  "kef": "Le Kef",
  "mahdia": "Mahdia",
  "medenine": "Médenine",
  "médenine": "Médenine",
  "monastir": "Monastir",
  "nabeul": "Nabeul",
  "sfax": "Sfax",
  "sidi bouzid": "Sidi Bouzid",
  "siliana": "Siliana",
  "sousse": "Sousse",
  "tataouine": "Tataouine",
  "tozeur": "Tozeur",
  "tunis": "Tunis",
  "zaghouan": "Zaghouan",
  "bizerte": "Bizerte",
  "ariana": "Ariana",
  "manouba": "Manouba",
  "ben arous": "Ben Arous",
  "benarous": "Ben Arous",
};

const SHORT_NAMES: Record<string, string> = {
  "Ben Arous": "B.Arous",
  "Sidi Bouzid": "S.Bouzid",
  "Tataouine": "Tataoui.",
  "Médenine": "Médenine",
};

function matchGovName(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const n = raw.toLowerCase().trim();
  for (const key of Object.keys(deliveries)) {
    if (key.toLowerCase() === n) return key;
  }
  for (const [alias, key] of Object.entries(NAME_ALIASES)) {
    if (n === alias || n.includes(alias) || alias.includes(n)) return key;
  }
  for (const key of Object.keys(deliveries)) {
    if (n.includes(key.toLowerCase()) || key.toLowerCase().includes(n)) return key;
  }
  return null;
}

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

// Palette de couleurs
const colorScale = d3.scaleThreshold<number, string>()
  .domain([500, 1000, 1500, 2000])
  .range(["#B5D4F4", "#85B7EB", "#378ADD", "#185FA5", "#042C53"]);

const legendItems = [
  { label: "< 500", color: "#B5D4F4" },
  { label: "500 – 999", color: "#85B7EB" },
  { label: "1 000 – 1 499", color: "#378ADD" },
  { label: "1 500 – 1 999", color: "#185FA5" },
  { label: "≥ 2 000", color: "#042C53" },
];

interface TunisiaMapProps {
  onGovernorateClick?: (governorateName: string) => void;
  selectedGovernorate?: string | null;
}

export default function TunisiaMap({ onGovernorateClick, selectedGovernorate }: TunisiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string; value: number; x: number; y: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const W = 450;
  const H = 750;
  const maxDel = Math.max(...Object.values(deliveries));

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Charger le GeoJSON local
    fetch("/tunisia.geojson")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((geojson: any) => {
        const features: any[] = geojson.features;

        const projection = d3.geoMercator().fitSize([W, H], geojson as any);
        const pathGen = d3.geoPath().projection(projection);

        // Polygones
        svg.selectAll<SVGPathElement, any>("path.gov")
          .data(features)
          .join("path")
          .attr("class", "gov")
          .attr("d", (d: any) => pathGen(d) ?? "")
          .attr("fill", (d: any) => {
            const key = matchGovName(getRawName(d.properties));
            return key ? colorScale(deliveries[key]) : "#ccc";
          })
          .attr("stroke", "rgba(255,255,255,0.85)")
          .attr("stroke-width", 1.4)
          .style("cursor", "pointer")
          .attr("data-gov", (d: any) => matchGovName(getRawName(d.properties)) || "")
          .on("mouseenter", function (event: MouseEvent, d: any) {
            const name = matchGovName(getRawName(d.properties));
            const value = name ? deliveries[name] : 0;
            const rect = containerRef.current!.getBoundingClientRect();

            setHovered(name);
            setTooltip({
              name: name ?? getRawName(d.properties),
              value,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });

            svg.selectAll<SVGPathElement, any>("path.gov")
              .attr("opacity", (f: any) => {
                const fn = matchGovName(getRawName(f.properties));
                return fn === name ? 1 : 0.42;
              });

            d3.select(this)
              .attr("stroke", "#ff8c00")
              .attr("stroke-width", 2.5)
              .attr("opacity", 1);
          })
          .on("mousemove", function (event: MouseEvent) {
            const rect = containerRef.current!.getBoundingClientRect();
            setTooltip((prev) =>
              prev
                ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top }
                : prev
            );
          })
          .on("mouseleave", function () {
            setHovered(null);
            setTooltip(null);
            svg.selectAll<SVGPathElement, any>("path.gov")
              .attr("opacity", 1)
              .attr("stroke", "rgba(255,255,255,0.85)")
              .attr("stroke-width", 1.4);
          })
          .on("click", function (event: MouseEvent, d: any) {
            event.stopPropagation();
            const govName = matchGovName(getRawName(d.properties));
            if (govName && onGovernorateClick) {
              onGovernorateClick(govName);
            }
          });

        // Labels
        svg.selectAll<SVGTextElement, any>("text.gov-label")
          .data(features)
          .join("text")
          .attr("class", "gov-label")
          .attr("transform", (d: any) => {
            const [cx, cy] = pathGen.centroid(d);
            return `translate(${cx},${cy})`;
          })
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .style("font-size", "7.5px")
          .style("font-weight", "600")
          .style("fill", "rgba(255,255,255,0.95)")
          .style("pointer-events", "none")
          .style("text-shadow", "0 1px 3px rgba(0,0,0,0.55)")
          .text((d: any) => {
            const key = matchGovName(getRawName(d.properties)) ?? getRawName(d.properties);
            return SHORT_NAMES[key] ?? key;
          });

        // Mettre en surbrillance le gouvernorat sélectionné
        if (selectedGovernorate) {
          svg.selectAll<SVGPathElement, any>("path.gov")
            .attr("stroke", (d: any) => {
              const name = matchGovName(getRawName(d.properties));
              return name === selectedGovernorate ? "#ff8c00" : "rgba(255,255,255,0.85)";
            })
            .attr("stroke-width", (d: any) => {
              const name = matchGovName(getRawName(d.properties));
              return name === selectedGovernorate ? 3 : 1.4;
            });
        }
      })
      .catch((err) => {
        console.error("Erreur chargement carte Tunisie:", err);
        setError("Impossible de charger la carte. Vérifiez votre connexion.");
      });
  }, [W, H, onGovernorateClick, selectedGovernorate]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Livraisons par gouvernorat — Tunisie
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cliquez sur un gouvernorat pour voir sa carte détaillée
          </p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
          24 gouvernorats
        </span>
      </div>

      <div className="flex gap-6 items-start flex-wrap">
        <div ref={containerRef} className="relative flex-shrink-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            style={{ display: "block", maxWidth: "100%" }}
          />

          {tooltip && (
            <div
              className="absolute z-50 pointer-events-none rounded-xl px-3 py-2 shadow-xl"
              style={{
                left: tooltip.x + 14,
                top: tooltip.y - 56,
                minWidth: 148,
                background: "#0f1923",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="font-semibold text-white text-sm mb-0.5">{tooltip.name}</p>
              <p className="font-bold text-orange-400 text-lg leading-tight">
                {tooltip.value.toLocaleString("fr-FR")}
              </p>
              <p className="text-gray-400 text-xs">livraisons</p>
              <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${Math.round((tooltip.value / maxDel) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 min-w-[170px] flex-1">
          <div
            className="rounded-xl p-4"
            style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs text-gray-400 mb-1">Gouvernorat sélectionné</p>
            <p className="font-semibold text-white text-sm mb-1 truncate">
              {hovered ?? selectedGovernorate ?? "—"}
            </p>
            <p className="text-2xl font-bold text-white leading-tight">
              {hovered
                ? deliveries[hovered]?.toLocaleString("fr-FR") ?? "—"
                : selectedGovernorate
                ? deliveries[selectedGovernorate]?.toLocaleString("fr-FR") ?? "—"
                : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">livraisons</p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs font-semibold text-gray-300 mb-3">Volume livraisons</p>
            <div className="flex flex-col gap-2.5">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs font-semibold text-gray-300 mb-3">Top 5 gouvernorats</p>
            <div className="flex flex-col gap-3">
              {Object.entries(deliveries)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, val], i) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-4 text-center">
                          {i + 1}
                        </span>
                        <span className="text-xs text-gray-300 truncate max-w-[90px]">
                          {name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white">
                        {val.toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-1 overflow-hidden ml-6">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.round((val / maxDel) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}