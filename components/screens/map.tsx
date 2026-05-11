"use client";
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { usePace } from "@/lib/store";
import { type EnrichedBusiness } from "@/lib/data";
import { StageTag } from "@/components/ui";
import Link from "next/link";
import { IconLocation, IconSearch, IconPlus, IconShop } from "@/components/icons";

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

const OSM_CATEGORIES: Record<string, string> = {
  "Restaurants & Cafes": '["amenity"~"restaurant|cafe|fast_food|ice_cream"]',
  "Bars & Pubs": '["amenity"~"bar|pub|nightclub"]',
  "Shops & Retail": '["shop"~"convenience|supermarket|clothes|beauty|hairdresser|bakery|butcher|florist|gift|jewelry|optician|shoes"]',
  "Health & Fitness": '["amenity"~"dentist|doctors|pharmacy|veterinary"]["name"]',
  "Services": '["shop"~"dry_cleaning|laundry|travel_agency|estate_agent|electronics|mobile_phone"]',
};

interface OsmPlace {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  address?: string;
}

async function searchOverpass(lat: number, lon: number, radius: number, category: string): Promise<OsmPlace[]> {
  const filter = OSM_CATEGORIES[category] || '["amenity"~"restaurant|cafe"]';
  const query = `[out:json][timeout:15];(node${filter}["name"](around:${radius},${lat},${lon}););out body;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error("Overpass API error");
  const data = await res.json();
  return (data.elements || [])
    .filter((el: Record<string, unknown>) => el.tags && (el.tags as Record<string, string>).name)
    .map((el: Record<string, unknown>) => {
      const tags = el.tags as Record<string, string>;
      const amenity = tags.amenity || tags.shop || "";
      return {
        id: el.id as number,
        lat: el.lat as number,
        lon: el.lon as number,
        name: tags.name,
        type: amenity.charAt(0).toUpperCase() + amenity.slice(1).replace(/_/g, " "),
        address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || undefined,
      };
    });
}

// Fly to a coordinate when a business is clicked from area cards
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 14, { duration: 0.8 });
  }, [center, map]);
  return null;
}

// Track map center for Overpass queries
function MapCenterTracker({ onMove }: { onMove: (center: [number, number]) => void }) {
  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter();
      onMove([c.lat, c.lng]);
    },
  });
  return null;
}

export function MapScreen({ openBiz }: {
  openBiz: (id: string) => void;
}) {
  const { areas, businessesById, addBusiness } = usePace();
  const [flyTarget, setFlyTarget] = React.useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([51.535, -0.1]);

  // OSM discovery state
  const [osmPlaces, setOsmPlaces] = React.useState<OsmPlace[]>([]);
  const [osmLoading, setOsmLoading] = React.useState(false);
  const [osmError, setOsmError] = React.useState<string | null>(null);
  const [osmCategory, setOsmCategory] = React.useState("Restaurants & Cafes");
  const [showDiscover, setShowDiscover] = React.useState(false);
  const [addedIds, setAddedIds] = React.useState<Set<number>>(new Set());

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

  const handleDiscover = async () => {
    setOsmLoading(true);
    setOsmError(null);
    try {
      const places = await searchOverpass(mapCenter[0], mapCenter[1], 1000, osmCategory);
      setOsmPlaces(places);
      if (places.length === 0) setOsmError("No places found in this area. Try panning the map or changing category.");
    } catch {
      setOsmError("Failed to query OpenStreetMap. Try again in a moment.");
    } finally {
      setOsmLoading(false);
    }
  };

  // Find the closest known area name for a lat/lon
  const closestArea = (lat: number, lon: number): string => {
    let best = areas[0] || "Unknown";
    let bestDist = Infinity;
    for (const [name, coords] of Object.entries(AREA_COORDS)) {
      const d = Math.hypot(coords[0] - lat, coords[1] - lon);
      if (d < bestDist) { bestDist = d; best = name; }
    }
    return best;
  };

  const handleAddPlace = (place: OsmPlace) => {
    const bizId = `b-osm-${place.id}`;
    const area = closestArea(place.lat, place.lon);
    addBusiness({
      id: bizId,
      name: place.name,
      type: place.type || "Business",
      area,
      contact: "Unknown",
      role: "Owner",
    });
    setAddedIds((prev) => new Set(prev).add(place.id));
  };

  // Check if an OSM place is already in CRM (by name match)
  const isInCrm = (place: OsmPlace) => {
    const lcName = place.name.toLowerCase();
    return addedIds.has(place.id) || businesses.some((b) => b.name.toLowerCase() === lcName);
  };

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Map</h1>
          <p className="view-sub">Coverage view · pins coloured by stage · OpenStreetMap</p>
        </div>
        <div className="view-h-actions">
          <button
            className={"btn sm " + (showDiscover ? "accent" : "secondary")}
            onClick={() => setShowDiscover((v) => !v)}
          >
            <IconShop size={13} /> Discover nearby
          </button>
        </div>
      </div>

      {showDiscover && (
        <div className="card" style={{ marginBottom: 16, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IconSearch size={14} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Find businesses from OpenStreetMap</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="select"
              style={{ flex: "1 1 200px", maxWidth: 260 }}
              value={osmCategory}
              onChange={(e) => setOsmCategory(e.target.value)}
            >
              {Object.keys(OSM_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="btn accent sm" onClick={handleDiscover} disabled={osmLoading}>
              {osmLoading ? "Searching..." : "Search this area"}
            </button>
            <span className="muted" style={{ fontSize: 11 }}>
              Searches 1 km around map centre
            </span>
          </div>
          {osmError && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--danger)" }}>{osmError}</div>
          )}
          {osmPlaces.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>
                {osmPlaces.length} places found
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {osmPlaces.map((p) => {
                  const already = isInCrm(p);
                  return (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                      background: "var(--surface-2)", borderRadius: 8, fontSize: 12.5,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: "#E8A317", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div className="muted" style={{ fontSize: 11 }}>
                          {p.type}{p.address ? ` · ${p.address}` : ""}
                        </div>
                      </div>
                      {already ? (
                        <span style={{ fontSize: 11, color: "var(--success)", whiteSpace: "nowrap" }}>In CRM</span>
                      ) : (
                        <button
                          className="btn ghost sm"
                          style={{ fontSize: 11, padding: "2px 8px", whiteSpace: "nowrap" }}
                          onClick={() => handleAddPlace(p)}
                        >
                          <IconPlus size={11} /> Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
          <MapCenterTracker onMove={setMapCenter} />
          {flyTarget && <FlyTo center={flyTarget} />}
          {/* CRM businesses */}
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
          {/* OSM discovered places */}
          {osmPlaces.map((p) => (
            <CircleMarker
              key={`osm-${p.id}`}
              center={[p.lat, p.lon]}
              radius={5}
              pathOptions={{
                color: "#E8A317",
                weight: 2,
                fillColor: isInCrm(p) ? "#E8A317" : "transparent",
                fillOpacity: isInCrm(p) ? 0.6 : 0,
              }}
            >
              <Popup>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.4 }}>
                  <strong>{p.name}</strong>
                  <br />
                  {p.type}
                  {p.address && <><br />{p.address}</>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
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
          {osmPlaces.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, border: "2px solid #E8A317", background: "transparent" }} />
              OSM discovered
            </span>
          )}
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
