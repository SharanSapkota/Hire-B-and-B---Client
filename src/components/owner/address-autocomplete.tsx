'use client';

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
  onLocationSelect: (location: { lat: number; lng: number } | null, address: string) => void;
}

export function AddressAutocomplete({ onLocationSelect }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (typeof window.google === "undefined" || !window.google.maps?.places) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 13,
      });
      setMap(mapInstance);
    };

    loadGoogleMaps();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setValue(text);

    if (text && window.google?.maps?.places) {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: text }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      });
    } else {
      setSuggestions([]);
      onLocationSelect(null, "");
    }
  };

  const handleSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    setValue(suggestion.description);
    setSuggestions([]);

    if (!map) return;
    const service = new google.maps.places.PlacesService(map);
    service.getDetails(
      { placeId: suggestion.place_id, fields: ["formatted_address", "geometry"] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const location = place.geometry?.location?.toJSON() ?? null;

          if (location) {
            map.setCenter(location);
            map.setZoom(15);
            if (marker) marker.setMap(null);
            const newMarker = new google.maps.Marker({ position: location, map });
            setMarker(newMarker);
          }

          onLocationSelect(location, place.formatted_address || suggestion.description);
        }
      }
    );
  };

  return (
    <div className="relative space-y-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Enter address"
        value={value}
        onChange={handleInputChange}
      />
      {suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSuggestionClick(s)}
            >
              {s.description}
            </div>
          ))}
        </div>
      )}
      <div ref={mapRef} className="w-full h-64 rounded-md border overflow-hidden" />
    </div>
  );
}
