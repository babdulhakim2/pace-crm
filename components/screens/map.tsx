"use client";
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { usePace } from "@/lib/store";
import { type EnrichedBusiness } from "@/lib/data";
import { StageTag } from "@/components/ui";
import Link from "next/link";
import { IconLocation } from "@/components/icons";

// Centre coordinates for each London area
const AREA_COORDS: Record<string, [number, number]> = {
  Shoreditch:        [51.5235, -0.0771],
  Hackney:           [51.5450, -0.0553],
  Islington:         [51.5362, -0.1033],
  Camden:            [51.5390, -0.1426],
  Hampstead:         [51.5565, -0.1781],
  Soho:              [51.5133, -0.1360],
  Marylebone:        [51.5195, -0.1487],
  "Stoke Newington": [51.5633, -0.0762],
};

// Deterministic pseudo-random offset from business id
function bizOffset(id: string): [number, number] {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const latOff = ((Math.sin(seed) + 1) / 2 - 0.5) * 0.008;
  const lngOff = ((Math.cos(seed * 1.7) + 1) / 2 - 0.5) * 0.012;
  return [latOff, lngOff];
}

function bizCoords(biz: EnrichedBusiness): [number, number] {
  const centre = AREA_COORDS[biz.area] || [51.52, -0.1];
  const [latOff, lngOff] = bizOffset(biz.id);
  return [centre[0] + latOff, centre[1] + lngOff];
}

const STAGE_COLOR: Record<string, string> = {
  cold:   "#9A9A9A",
  active: "#2D5BFF",
  won:    "#1B7A3D",
  lost:   "#B23A3A",
};

// Fly to a coordinate when a business is clicked from area cards
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 14, { duration: 0.8 });
  }, [center, map]);
  return null;
}

export function MapScreen({ openBiz }: {
  openBiz: (id: string) => void;
}) {
  const { areas, businessesById } = usePace();
  const [flyTarget, setFlyTarget] = React.useState<[number, number] | null>(null);

  const areaStats = areas.map((a) => {
    const items = Object.values(businessesById).filter((b) => b.area === a);
    return {
      name: a,
      total: items.length,
      won: items.filter((b) => b.stage === "won").length,
      coords: AREA_COORDS[a] || [51.52, -0.1],
    };
  });

  const businesses = Object.values(businessesById);

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Map</h1>
          <p className="view-sub">Coverage view · pins coloured by stage · OpenStreetMap</p>
        </div>
        <div className="view-h-actions">
          <button className="btn secondary sm" disabled title="GPS coming v1.5">
            <IconLocation size={13} /> Near me
            <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: 4, padding: "1px 5px", border: "1px solid var(--border)", borderRadius: 999 }}>v1.5</span>
          </button>
        </div>
      </div>

      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 16, height: 460 }}
           className="map-container-wrap">
        <MapContainer
          center={[51.535, -0.1]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {flyTarget && <FlyTo center={flyTarget} />}
          {businesses.map((b) => {
            const [lat, lng] = bizCoords(b);
            const color = STAGE_COLOR[b.stage] || STAGE_COLOR.cold;
            return (
              <CircleMarker
                key={b.id}
                center={[lat, lng]}
                radius={7}
                pathOptions={{
                  color: "#fff",
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 1,
                }}
                eventHandlers={{
                  click: () => openBiz(b.id),
                }}
              >
                <Popup>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.4 }}>
                    <strong>{b.name}</strong>
                    <br />
                    {b.type} · {b.area}
                    <br />
                    {b.contact} ({b.role})
                    <br />
                    <span style={{ marginTop: 4, display: "inline-block" }}>
                      <StageTag stage={b.stage} />
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 12.5, flexWrap: "wrap" }}>
          <span style={{ color: "var(--text-3)", fontWeight: 500, textTransform: "uppercase", fontSize: 10.5, letterSpacing: "0.05em" }}>Stages</span>
          {Object.entries(STAGE_COLOR).map(([stage, color]) => (
            <span key={stage} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: color, border: "2px solid #fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.1)" }} />
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Area cards */}
      <div className="card">
        <div className="card-h">
          <div>
            <h3 className="card-title">Areas</h3>
            <p className="card-sub">Click to filter audit trail, or zoom the map</p>
          </div>
        </div>
        <div className="grid grid-4" style={{ gap: 10 }}>
          {areaStats.map((a) => (
            <div key={a.name} className="area-card"
                 onClick={() => {
                   setFlyTarget(a.coords as [number, number]);
                 }}>
              <div className="name">{a.name}</div>
              <div className="stats">
                <span>{a.total} businesses</span>
                <span><b>{a.won}</b> won</span>
              </div>
              <Link
                href={`/trail?area=${encodeURIComponent(a.name)}`}
                className="btn ghost sm"
                style={{ alignSelf: "flex-start", marginTop: 4, padding: "3px 8px", fontSize: 11 }}
                onClick={(e) => e.stopPropagation()}
              >
                Filter trail
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
