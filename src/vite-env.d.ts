/// <reference types="vite/client" />
declare global {
  interface Window {
    google: typeof google;
  }
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: MapOptions);
        setCenter(latLng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
      }
      class Marker {
        constructor(opts?: MarkerOptions);
        setMap(map: Map | null): void;
      }
      class Geocoder {
        geocode(
          request: GeocoderRequest,
          callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
        ): void;
      }
      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        streetViewControl?: boolean;
        mapTypeControl?: boolean;
      }
      interface MarkerOptions {
        position: LatLng | LatLngLiteral;
        map: Map;
      }
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      interface LatLng {
        lat(): number;
        lng(): number;
      }
      interface GeocoderRequest {
        address: string;
      }
      interface GeocoderResult {
        geometry: {
          location: LatLng;
        };
      }
      enum GeocoderStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        // Add other statuses as needed
      }
    }
  }
}
export {};