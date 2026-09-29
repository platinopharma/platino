/**
 * Platino Location Provider Abstraction
 * Decouples business logic from specific mapping vendors (Google Maps, etc.)
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationPrediction {
  id: string; // Place ID or unique result identifier
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

export interface LocationDetails {
  coordinates: LocationCoordinates;
  formattedAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  placeId?: string;
}

export interface LocationProvider {
  searchPlaces(query: string, options?: { country?: string }): Promise<LocationPrediction[]>;
  getPlaceDetails(placeId: string): Promise<LocationDetails>;
  reverseGeocode(lat: number, lng: number): Promise<LocationDetails>;
  geocode(address: string): Promise<LocationDetails>;
}

/**
 * Google Maps Platform Adapter
 * Implements the LocationProvider contract using Google Places and Geocoding APIs.
 */
export class GoogleLocationProvider implements LocationProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      "";
  }

  /**
   * Search address/places autocomplete using Google Places API
   */
  async searchPlaces(query: string, options?: { country?: string }): Promise<LocationPrediction[]> {
    if (!query.trim() || query.length < 3) return [];

    // Browser-side Google Maps JS SDK AutocompleteService if loaded
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      try {
        const service = new (window as any).google.maps.places.AutocompleteService();
        const request = {
          input: query,
          componentRestrictions: { country: options?.country || "in" },
        };
        const predictions = await new Promise<any[]>((resolve) => {
          service.getPlacePredictions(request, (res: any[], status: string) => {
            if (status === "OK" && Array.isArray(res)) resolve(res);
            else resolve([]);
          });
        });

        return predictions.map((p) => ({
          id: p.place_id,
          primaryText: p.structured_formatting?.main_text || p.description?.split(",")[0] || p.description,
          secondaryText: p.structured_formatting?.secondary_text || "",
          fullText: p.description,
        }));
      } catch (err) {
        console.warn("Google Maps JS AutocompleteService error, falling back to HTTP proxy:", err);
      }
    }

    // Fallback or Server-Side HTTP Places Search
    try {
      const url = `/api/geocode?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.place_id || item.id || String(Math.random()),
          primaryText: item.primaryText || item.formattedAddress?.split(",")[0] || query,
          secondaryText: item.secondaryText || item.formattedAddress || "",
          fullText: item.formattedAddress || query,
        }));
      }
      return [];
    } catch (e) {
      console.error("GoogleLocationProvider searchPlaces error:", e);
      return [];
    }
  }

  /**
   * Get Place Details from Place ID
   */
  async getPlaceDetails(placeId: string): Promise<LocationDetails> {
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      try {
        const div = document.createElement("div");
        const service = new (window as any).google.maps.places.PlacesService(div);
        const result = await new Promise<any>((resolve, reject) => {
          service.getDetails(
            { placeId, fields: ["geometry", "formatted_address", "address_components", "name"] },
            (place: any, status: string) => {
              if (status === "OK" && place) resolve(place);
              else reject(new Error(`Place details status: ${status}`));
            }
          );
        });

        return this.parseGooglePlaceResult(result, placeId);
      } catch (err) {
        console.warn("Google PlacesService details error:", err);
      }
    }

    // Fallback via Geocoding API by place_id or query
    return this.geocode(placeId);
  }

  /**
   * Reverse Geocode (lat, lng) to human-readable address details
   */
  async reverseGeocode(lat: number, lng: number): Promise<LocationDetails> {
    if (typeof window !== "undefined" && (window as any).google?.maps?.Geocoder) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        const response = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === "OK" && results && results[0]) resolve(results[0]);
            else reject(new Error(`Geocoder status: ${status}`));
          });
        });

        return this.parseGooglePlaceResult(response);
      } catch (err) {
        console.warn("Google JS Geocoder error, falling back to edge route:", err);
      }
    }

    // Edge Route Proxy reverse geocode fallback
    try {
      const url = `/api/geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();

      return {
        coordinates: { lat, lng },
        formattedAddress: data.formattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        addressLine1: data.formattedAddress?.split(",")[0] || data.route || "Selected Location",
        city: data.locality || "",
        state: data.administrativeAreaLevel1 || "",
        pincode: data.postalCode || "",
      };
    } catch (e) {
      return {
        coordinates: { lat, lng },
        formattedAddress: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    }
  }

  /**
   * Geocode address string to coordinates and details
   */
  async geocode(address: string): Promise<LocationDetails> {
    if (typeof window !== "undefined" && (window as any).google?.maps?.Geocoder) {
      try {
        const geocoder = new (window as any).google.maps.Geocoder();
        const response = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address }, (results: any[], status: string) => {
            if (status === "OK" && results && results[0]) resolve(results[0]);
            else reject(new Error(`Geocoder status: ${status}`));
          });
        });

        return this.parseGooglePlaceResult(response);
      } catch (err) {
        console.warn("Google JS Geocoder address error:", err);
      }
    }

    return {
      coordinates: { lat: 17.3850, lng: 78.4867 },
      formattedAddress: address,
    };
  }

  private parseGooglePlaceResult(result: any, placeId?: string): LocationDetails {
    const lat = result.geometry?.location?.lat
      ? typeof result.geometry.location.lat === "function"
        ? result.geometry.location.lat()
        : result.geometry.location.lat
      : 17.3850;
    const lng = result.geometry?.location?.lng
      ? typeof result.geometry.location.lng === "function"
        ? result.geometry.location.lng()
        : result.geometry.location.lng
      : 78.4867;

    const components = result.address_components || [];
    let streetNumber = "";
    let route = "";
    let city = "";
    let state = "";
    let pincode = "";
    let landmark = "";

    for (const c of components) {
      const types: string[] = c.types || [];
      if (types.includes("street_number")) streetNumber = c.long_name;
      if (types.includes("route")) route = c.long_name;
      if (types.includes("locality") || types.includes("sublocality")) city = c.long_name;
      if (types.includes("administrative_area_level_1")) state = c.long_name;
      if (types.includes("postal_code")) pincode = c.long_name;
      if (types.includes("landmark") || types.includes("point_of_interest")) landmark = c.long_name;
    }

    const line1 = [streetNumber, route].filter(Boolean).join(" ") || result.name || result.formatted_address?.split(",")[0] || "Selected Location";

    return {
      coordinates: { lat, lng },
      formattedAddress: result.formatted_address || line1,
      addressLine1: line1,
      landmark,
      city,
      state,
      pincode,
      placeId: placeId || result.place_id,
    };
  }
}

// Global Singleton Export
export const defaultLocationProvider: LocationProvider = new GoogleLocationProvider();
