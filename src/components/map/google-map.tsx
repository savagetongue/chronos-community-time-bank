import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
interface GoogleMapProps {
  lat?: number | null;
  lng?: number | null;
  city?: string | null;
  zoom?: number;
  height?: string;
  className?: string;
}
const MapComponent: React.FC<{
  center: google.maps.LatLngLiteral;
  zoom: number;
  className?: string;
  height?: string;
}> = ({ center, zoom, className, height = '400px' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      }));
    }
  }, [ref, map, center, zoom]);
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
      // Add marker
      new window.google.maps.Marker({
        position: center,
        map: map,
      });
    }
  }, [map, center, zoom]);
  return <div ref={ref} className={className} style={{ width: '100%', height }} />;
};
export function GoogleMap({ lat, lng, city, zoom = 13, height = '400px', className }: GoogleMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key missing');
      return;
    }
    if (lat && lng) {
      setCenter({ lat, lng });
    } else if (city) {
      // We need the API loaded to geocode, so we handle this inside the wrapper render or via a separate effect if API is loaded
      // For simplicity in this wrapper structure, we'll let the inner component handle geocoding or just wait
      // But actually, we can't use google.maps.Geocoder until loaded.
      // So we pass the city to the inner component or handle it after load.
    }
  }, [lat, lng, city, apiKey]);
  if (!apiKey) {
    return (
      <div className={`bg-secondary/20 flex items-center justify-center rounded-lg border border-dashed ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Map unavailable (API Key missing)</p>
          {city && <p className="text-xs font-medium mt-1">{city}</p>}
        </div>
      </div>
    );
  }
  const render = (status: Status) => {
    if (status === Status.LOADING) {
      return (
        <div className={`bg-secondary/10 flex items-center justify-center rounded-lg ${className}`} style={{ height }}>
          <Loader2 className="h-8 w-8 animate-spin text-chronos-teal" />
        </div>
      );
    }
    if (status === Status.FAILURE) {
      return (
        <div className={`bg-destructive/10 flex items-center justify-center rounded-lg ${className}`} style={{ height }}>
          <p className="text-sm text-destructive">Failed to load map</p>
        </div>
      );
    }
    return <MapWithGeocoding lat={lat} lng={lng} city={city} zoom={zoom} height={height} className={className} />;
  };
  return <Wrapper apiKey={apiKey} render={render} />;
}
// Inner component that has access to window.google
const MapWithGeocoding: React.FC<GoogleMapProps> = ({ lat, lng, city, zoom = 13, height, className }) => {
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(
    lat && lng ? { lat, lng } : null
  );
  useEffect(() => {
    if (lat && lng) {
      setCenter({ lat, lng });
    } else if (city && !center) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: city }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setCenter({ lat: location.lat(), lng: location.lng() });
        } else {
          console.warn('Geocode failed:', status);
        }
      });
    }
  }, [lat, lng, city]);
  if (!center) {
    return (
      <div className={`bg-secondary/10 flex items-center justify-center rounded-lg ${className}`} style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-chronos-teal" />
      </div>
    );
  }
  return <MapComponent center={center} zoom={zoom} height={height} className={className} />;
};