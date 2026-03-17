import React, { useState, useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Plus, Trash2, Loader2, Search } from "lucide-react";
import * as turf from "@turf/turf";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYXltZW5iMTMiLCJhIjoiY21sNDBhbzg0MHU3ZTNlcXphNGRqcWp3NiJ9.PIUZWJh0QCV4RBEP24VTvA";

interface BakeryEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

interface StepBakeryProps {
  onNext: () => void;
  onBakeriesChange: (bakeries: BakeryEntry[]) => void;
  sessionId: string | null;
}

const WEBHOOK_POI = "https://n8n.beautifulflow.ai/webhook/adresse-poi";

const StepBakery: React.FC<StepBakeryProps> = ({ onNext, onBakeriesChange, sessionId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [bakeries, setBakeries] = useState<BakeryEntry[]>([]);
  const [currentBakery, setCurrentBakery] = useState({ name: "", address: "" });
  const [selectedCoords, setSelectedCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [radiusKm, setRadiusKm] = useState(1);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [2.3488, 46.8534], // France center
      zoom: 5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Source for radius circles
      map.addSource("radius-circles", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "radius-fill",
        type: "fill",
        source: "radius-circles",
        paint: {
          "fill-color": "hsl(229, 67%, 55%)",
          "fill-opacity": 0.1,
        },
      });
      map.addLayer({
        id: "radius-border",
        type: "line",
        source: "radius-circles",
        paint: {
          "line-color": "hsl(229, 67%, 55%)",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });

      // Source for bakery markers (symbol layer)
      map.addSource("bakery-markers", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "bakery-points",
        type: "circle",
        source: "bakery-markers",
        paint: {
          "circle-radius": 8,
          "circle-color": "hsl(229, 67%, 55%)",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Update map when bakeries / selection changes
  const updateMap = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const allPoints = [
      ...bakeries.map((b) => ({ lng: b.longitude, lat: b.latitude, radius: b.radiusKm })),
      ...(selectedCoords ? [{ lng: selectedCoords.lng, lat: selectedCoords.lat, radius: radiusKm }] : []),
    ];

    // Markers
    const markerFeatures = allPoints.map((p) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      properties: {},
    }));

    // Circles
    const circleFeatures = allPoints.map((p) =>
      turf.circle([p.lng, p.lat], p.radius, { steps: 64, units: "kilometers" })
    );

    (map.getSource("bakery-markers") as mapboxgl.GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: markerFeatures,
    });

    (map.getSource("radius-circles") as mapboxgl.GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features: circleFeatures,
    });

    // Fit bounds
    if (allPoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      circleFeatures.forEach((f) => {
        const coords = f.geometry.coordinates[0] as [number, number][];
        coords.forEach((c) => bounds.extend(c));
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
    }
  }, [bakeries, selectedCoords, radiusKm]);

  useEffect(() => { updateMap(); }, [updateMap]);

  // Geocoding search
  const searchAddress = async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=fr&types=address,place&limit=5&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch { setSuggestions([]); }
    setSearchLoading(false);
  };

  const onAddressInput = (value: string) => {
    setCurrentBakery({ ...currentBakery, address: value });
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(value), 300);
  };

  const selectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    const city = feature.context?.find((c: any) => c.id.startsWith("place"))?.text || feature.text;
    setSelectedCoords({ lng, lat });
    setSelectedCity(city);
    setCurrentBakery({ ...currentBakery, address: feature.place_name });
    setSuggestions([]);
  };

  const addBakery = () => {
    if (!currentBakery.name || !selectedCoords) return;
    const entry: BakeryEntry = {
      id: crypto.randomUUID(),
      name: currentBakery.name,
      address: currentBakery.address,
      city: selectedCity,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      radiusKm,
    };
    const updated = [...bakeries, entry];
    setBakeries(updated);
    onBakeriesChange(updated);

    // POST to webhook
    fetch(WEBHOOK_POI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        bakery_name: entry.name,
        bakery_address: entry.address,
        bakery_city: entry.city,
        latitude: entry.latitude,
        longitude: entry.longitude,
        radius_km: entry.radiusKm,
      }),
    }).catch(err => console.error("Webhook POI error:", err));

    setCurrentBakery({ name: "", address: "" });
    setSelectedCoords(null);
    setSelectedCity("");
    setRadiusKm(15);
  };

  const removeBakery = (id: string) => {
    const updated = bakeries.filter((b) => b.id !== id);
    setBakeries(updated);
    onBakeriesChange(updated);
  };

  const handleNext = () => {
    if (bakeries.length === 0) return;
    onNext();
  };


  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Ajoute ta boulangerie</h2>
        <p className="text-sm text-muted-foreground mt-1">Indique l'adresse et la zone de couverture de ton établissement.</p>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-64 rounded-xl border border-border overflow-hidden" />


      {/* Added bakeries */}
      {bakeries.length > 0 && (
        <div className="space-y-2">
          {bakeries.map((b) => (
            <div key={b.id} className="flex items-center gap-3 bg-card rounded-lg border border-border px-3 py-2.5">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                <p className="text-xs text-muted-foreground truncate">{b.address} — {b.radiusKm} km</p>
              </div>
              <button onClick={() => removeBakery(b.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form — only if no bakery added yet */}
      {bakeries.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div className="space-y-1">
            <Label>Nom de la boulangerie</Label>
            <Input placeholder="Ma Boulangerie" value={currentBakery.name}
              onChange={(e) => setCurrentBakery({ ...currentBakery, name: e.target.value })} />
          </div>

          <div className="space-y-1 relative">
            <Label>Adresse</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher une adresse…" className="pl-10"
                value={currentBakery.address}
                onChange={(e) => onAddressInput(e.target.value)} />
              {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-card border border-border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s: any) => (
                  <button key={s.id} onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                    {s.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCoords && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rayon de couverture</Label>
                <span className="text-sm font-medium text-primary">{radiusKm} km</span>
              </div>
              <Slider value={[radiusKm]} onValueChange={([v]) => setRadiusKm(v)} min={0} max={5} step={0.5} />
              
            </div>
          )}

          <Button variant="outline" onClick={addBakery} disabled={!currentBakery.name || !selectedCoords} fullWidth>
            <Plus className="h-4 w-4" />
            Valider ma boulangerie
          </Button>
        </div>
      )}

      {/* Next */}
      <Button onClick={handleNext} disabled={bakeries.length === 0} fullWidth size="lg">
        Continuer
      </Button>
    </div>
  );
};

export default StepBakery;
