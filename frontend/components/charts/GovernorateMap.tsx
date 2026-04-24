"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface GovernorateMapProps {
  governorateName: string;
  onBack?: () => void;
}

// Données fictives par délégation pour chaque gouvernorat
const delegationsData: Record<string, Record<string, number>> = {
  "Tunis": {
    "Bab Bhar": 450,
    "Bab Souika": 380,
    "Carthage": 320,
    "El Kabaria": 290,
    "El Menzah": 410,
    "El Ouardia": 350,
    "Ettahrir": 280,
    "Ezzouhour": 310,
    "Hraïria": 260,
    "Jebel Jelloud": 240,
  },
  "Sfax": {
    "Sfax Ville": 520,
    "Sakiet Ezzit": 380,
    "Sakiet Eddaïer": 340,
    "Thyna": 290,
    "El Ain": 310,
    "Bir Ali Ben Khalifa": 210,
    "El Hencha": 190,
    "Mahrès": 230,
    "Menzel Chaker": 180,
  },
  "Sousse": {
    "Sousse Ville": 480,
    "Sousse Jawhara": 390,
    "Sousse Riadh": 360,
    "Hammam Sousse": 310,
    "Kalâa Kebira": 270,
    "Kalâa Seghira": 240,
    "Msaken": 290,
  },
  // Ajoutez les autres gouvernorats selon vos besoins
};

// Coordonnées approximatives des gouvernorats pour le centre de la carte
const governorateCenters: Record<string, [number, number]> = {
  "Tunis": [10.1815, 36.8065],
  "Sfax": [10.7608, 34.7406],
  "Sousse": [10.6372, 35.8256],
  "Nabeul": [10.9927, 36.4473],
  "Monastir": [10.8245, 35.7681],
  "Bizerte": [9.8483, 37.2746],
  "Ariana": [10.1928, 36.8571],
  "Ben Arous": [10.2167, 36.7528],
  "Manouba": [10.0892, 36.7897],
  "Mahdia": [11.0639, 35.5084],
  "Kairouan": [10.0967, 35.6771],
  "Gabès": [10.1308, 33.8815],
  "Gafsa": [8.7842, 34.425],
  "Médenine": [10.5056, 33.3547],
  "Tataouine": [10.4508, 32.9306],
  "Tozeur": [8.1335, 33.9197],
  "Kébili": [8.9694, 33.7025],
  "Béja": [9.1819, 36.7226],
  "Jendouba": [8.7767, 36.4942],
  "Le Kef": [8.7047, 36.1823],
  "Siliana": [9.3708, 36.0847],
  "Zaghouan": [10.1452, 36.4014],
  "Kasserine": [8.8306, 35.1675],
  "Sidi Bouzid": [9.4847, 35.0381],
};

function getDelegations(govName: string): { name: string; value: number }[] {
  const data = delegationsData[govName];
  if (!data) {
    return [
      { name: "Données non disponibles", value: 100 },
    ];
  }
  return Object.entries(data).map(([name, value]) => ({ name, value }));
}

export default function GovernorateMap({ governorateName, onBack }: GovernorateMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const delegations = getDelegations(governorateName);
  const maxValue = Math.max(...delegations.map(d => d.value), 1);
  const center = governorateCenters[governorateName] || [10.1815, 36.8065];
  
  const colorScale = d3.scaleLinear<string>()
    .domain([0, maxValue / 2, maxValue])
    .range(["#B5D4F4", "#378ADD", "#042C53"]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = 500;
    const H = 400;
    
    const radius = Math.min(W, H) / 2.5;
    
    const pie = d3.pie<{ name: string; value: number }>()
      .value(d => d.value)
      .sort(null);
    
    const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);
    
    const labelArc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${W / 2}, ${H / 2})`);
    
    const pieData = pie(delegations);
    
    // Tronçons
    g.selectAll("path")
      .data(pieData)
      .join("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.value))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .append("title")
      .text(d => `${d.data.name}: ${d.data.value} livraisons`);
    
    // Labels
    g.selectAll("text")
      .data(pieData)
      .join("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "white")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.5)")
      .text(d => d.data.name.length > 12 ? d.data.name.slice(0, 10) + "..." : d.data.name);
    
    // Centre
    g.append("circle")
      .attr("r", radius * 0.45)
      .attr("fill", "rgba(255,255,255,0.95)")
      .attr("stroke", "#378ADD")
      .attr("stroke-width", 2);
    
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#1a3a6e")
      .text(governorateName);
    
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("dy", "1.5em")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(`Total: ${delegations.reduce((s, d) => s + d.value, 0)} livraisons`);

  }, [governorateName, delegations, colorScale]);

  if (!delegationsData[governorateName]) {
    return (
      <div className="content-card">
        <div className="card-header">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la carte nationale
          </button>
          <h3 className="card-title">{governorateName}</h3>
        </div>
        <div className="card-content text-center py-12">
          <p className="text-gray-500">
            Données détaillées pour {governorateName} non disponibles.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Cette fonctionnalité sera bientôt disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div>
            <h3 className="card-title">📊 {governorateName} — Délégations</h3>
            <p className="text-xs text-gray-500 mt-1">
              Répartition des livraisons par délégation
            </p>
          </div>
        </div>
      </div>
      <div className="card-content">
        <div ref={containerRef} className="flex justify-center">
          <svg
            ref={svgRef}
            width={500}
            height={400}
            viewBox="0 0 500 400"
            style={{ display: "block", maxWidth: "100%" }}
          />
        </div>
        
        {/* Liste des délégations */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {delegations.map((del) => (
            <div
              key={del.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {del.name}
              </span>
              <span className="text-sm font-bold text-orange-500">
                {del.value.toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}