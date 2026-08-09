"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Dynamic import for Leaflet to prevent SSR issues
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;
let L: any = null;

// Load Leaflet only on client side
if (typeof window !== 'undefined') {
  const reactLeaflet = require('react-leaflet');
  MapContainer = reactLeaflet.MapContainer;
  TileLayer = reactLeaflet.TileLayer;
  Marker = reactLeaflet.Marker;
  Popup = reactLeaflet.Popup;
  
  const leaflet = require('leaflet');
  L = leaflet.default || leaflet;
  
  // Set up Leaflet default icon (same as in MapInner.tsx)
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Set up Leaflet default icon (same as in MapInner.tsx)
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MALAYSIA_CENTER: [number, number] = [4.2105, 101.9778];

interface LocationSelectorProps {
  value?: { lat: number; lng: number; address: string } | null;
  onChange: (location: { lat: number; lng: number; address: string } | null) => void;
  disabled?: boolean;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export default function LocationSelector({
  value,
  onChange,
  disabled = false,
}: LocationSelectorProps) {
const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
  value || null
);
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; display_name: string }>>(
  []
);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [geoLoading, setGeoLoading] = useState(false);
  const mapRef = useRef<HTMLElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Initialize selected location from props on mount
  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
    }
  }, [value]);

  // Debounced search to prevent excessive API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Forward geocoding - search for address
  const handleSearch = useCallback(async () => {
    if (!debouncedSearchQuery.trim() || disabled) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          debouncedSearchQuery
        )}`,
        {
          headers: { "User-Agent": "leish.my/1.0 (contact@leish.my)" },
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setSearchResults(
          data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            display_name: item.display_name,
          }))
        );
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to search location. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, disabled]);

  // Reverse geocoding - get address from coordinates
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      
       try {
         const response = await fetch(
           `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
           {
             headers: { "User-Agent": "leish.my/1.0 (contact@leish.my)" },
           }
         );

        if (!response.ok) {
          throw new Error("Reverse geocode failed");
        }

        const data = await response.json();
        if (data && data.display_name) {
          return {
            lat,
            lng,
            address: data.display_name,
          };
        } else {
          throw new Error("No address found");
        }
      } catch (err) {
        setError("Failed to get address for selected location.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Handle map click to select location
  const handleMapClick = useCallback(
    async (e: L.LeafletMouseEvent) => {
      if (disabled) return;
      
      const { lat, lng } = e.latlng;
      const locationData = await reverseGeocode(lat, lng);
      
      if (locationData) {
        setSelectedLocation(locationData);
        onChange(locationData);
        
        // Update map view to center on selected location
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 13);
        }
      }
    },
    [disabled, onChange, reverseGeocode]
  );

   // Map callbacks with useCallback to prevent recreation on every render
   const mapCallbacks = useCallback((map: L.Map | null) => {
     if (!disabled && map) {
       // Enable map click handling for location selection
       map.on('click', handleMapClick);
       // Return cleanup function
       return () => {
         map.off('click', handleMapClick);
       };
     } else if (map) {
       // Disable all interactions when disabled
       map.dragging.disable();
       map.touchZoom.disable();
       map.doubleClickZoom.disable();
       map.scrollWheelZoom.disable();
       map.boxZoom.disable();
       map.keyboard.disable();
     }
   }, [disabled, handleMapClick]);

  // Handle selecting a search result
  const handleSelectSearchResult = useCallback(
    async (result: { lat: number; lng: number; display_name: string }) => {
      const locationData = await reverseGeocode(result.lat, result.lng);
      
      if (locationData) {
        setSelectedLocation(locationData);
        setSearchResults([]);
        onChange(locationData);
        
        // Update map view
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([result.lat, result.lng], 13);
        }
        
        // Clear search input
        setSearchQuery("");
      }
    },
    [onChange, reverseGeocode]
  );

  // Handle clearing selection
  const handleClearSelection = useCallback(() => {
    setSelectedLocation(null);
    onChange(null);
  }, [onChange]);

  // Handle geolocation detection
  const handleGeolocate = useCallback(async () => {
    if (!navigator.geolocation || disabled) return;

    setGeoLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      const locationData = await reverseGeocode(latitude, longitude);

      if (locationData) {
        setSelectedLocation(locationData);
        onChange(locationData);

        // Update map view to center on the geolocated position
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([latitude, longitude], 13);
        }
      } else {
        throw new Error("Unable to determine address from your location");
      }
    } catch (err: any) {
      setError(
        err.message || 
        "Failed to get your location. Please ensure location services are enabled and try again."
      );
    } finally {
      setGeoLoading(false);
    }
  }, [disabled, leafletMapRef, onChange, reverseGeocode]);

  // Handle Enter key in search input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  // Update map when selected location changes (to keep marker in view)
  useEffect(() => {
    if (selectedLocation && leafletMapRef.current) {
      leafletMapRef.current.setView(
        [selectedLocation.lat, selectedLocation.lng],
        13
      );
    }
  }, [selectedLocation]);

  if (disabled && !selectedLocation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Location selection disabled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for a location (e.g. Kuala Lumpur, Petaling Jaya)"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none ${
                loading ? "opacity-70" : ""
              }`}
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {error && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>
          
          {searchResults.length > 0 && !loading && (
            <div className="mt-2 max-h-[200px] overflow-y-auto border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Location
                </span>
                <div className="flex items-center gap-2">
                  {selectedLocation && !disabled && (
                    <button
                      onClick={handleClearSelection}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  )}
                  {!disabled && (
                    <button
                      onClick={handleGeolocate}
                      disabled={geoLoading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      {geoLoading ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-xs">Use My Location</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
             <div className="min-h-[200px]">
              {MapContainer && TileLayer && Marker && Popup && L ? (
                <MapContainer
                  ref={leafletMapRef}
                  center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : MALAYSIA_CENTER}
                   zoom={selectedLocation ? 13 : 8}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={!disabled}
                    doubleClickZoom={!disabled}
                    dragging={!disabled}
                    whenReady={mapCallbacks}
                  >
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                   {selectedLocation && (
                     <Marker key={`${selectedLocation.lat}-${selectedLocation.lng}`} position={[selectedLocation.lat, selectedLocation.lng]}>
                       {selectedLocation.address && (
                         <Popup>
                           <span className="text-sm">{selectedLocation.address}</span>
                         </Popup>
                       )}
                     </Marker>
                   )}
                 </MapContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
                </div>
              )}
             </div>
        </div>
        
        {selectedLocation && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-1"><strong>Address:</strong> {selectedLocation.address}</p>
            <p><strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
          </div>
        )}
        
        {!selectedLocation && !disabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click on the map or search for a location to select it
          </p>
        )}
      </div>
    </div>
  );
}