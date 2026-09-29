import { defaultLocationProvider } from "./locationProvider";

export interface GeocodedAddress {
  formattedAddress: string;
  streetNumber?: string;
  route?: string;
  locality?: string;
  administrativeAreaLevel1?: string;
  administrativeAreaLevel2?: string;
  country?: string;
  postalCode?: string;
}

export class GeocodingError extends Error {
  constructor(message: string, public status?: string) {
    super(message);
    this.name = "GeocodingError";
  }
}

/**
 * Reverse geocodes latitude and longitude into a human-readable address
 * using Platino Location Provider (Google Maps Platform).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
  try {
    const details = await defaultLocationProvider.reverseGeocode(lat, lng);
    return {
      formattedAddress: details.formattedAddress,
      route: details.addressLine1,
      locality: details.city,
      administrativeAreaLevel1: details.state,
      postalCode: details.pincode,
    };
  } catch (error) {
    console.error("🚨 Google Reverse Geocoding Failed:", error);
    if (error instanceof GeocodingError) {
      throw error;
    }
    throw new GeocodingError(error instanceof Error ? error.message : "Unknown geocoding error");
  }
}
