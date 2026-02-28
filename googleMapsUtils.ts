/**
 * Candid Studios - Google Maps Integration Utilities
 */

import { DistanceResult, StudioLocation, Location } from './calculator.types';

// Google Maps type declarations
declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    initGoogleMapsCallback?: () => void;
  }
}

interface GoogleMapsNamespace {
  maps: {
    DistanceMatrixService: new () => GoogleDistanceMatrixService;
    DistanceMatrixStatus: {
      OK: string;
    };
    TravelMode: {
      DRIVING: string;
    };
    UnitSystem: {
      IMPERIAL: number;
    };
    Geocoder: new () => GoogleGeocoder;
    GeocoderStatus: {
      OK: string;
    };
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options?: GoogleAutocompleteOptions
      ) => GoogleAutocomplete;
    };
  };
}

interface GoogleDistanceMatrixService {
  getDistanceMatrix(
    request: GoogleDistanceMatrixRequest,
    callback: (
      result: GoogleDistanceMatrixResponse | null,
      status: string
    ) => void
  ): void;
}

interface GoogleDistanceMatrixRequest {
  origins: (string | { lat: number; lng: number })[];
  destinations: (string | { lat: number; lng: number })[];
  travelMode: string;
  unitSystem: number;
}

interface GoogleDistanceMatrixResponse {
  rows: {
    elements: {
      distance: {
        value: number;
        text: string;
      };
      duration: {
        value: number;
        text: string;
      };
      status: string;
    }[];
  }[];
}

interface GoogleGeocoder {
  geocode(
    request: { address: string },
    callback: (
      results: GoogleGeocoderResult[] | null,
      status: string
    ) => void
  ): void;
}

interface GoogleGeocoderResult {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
}

interface GoogleAutocompleteOptions {
  types?: string[];
  fields?: string[];
}

interface GoogleAutocomplete {
  addListener(event: string, handler: () => void): void;
  getPlace(): GooglePlaceResult;
}

interface GooglePlaceResult {
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
}

// Cache for distance calculations to avoid repeated API calls
const distanceCache: Map<string, DistanceResult> = new Map();

/**
 * Generate a cache key for a distance calculation
 */
function getCacheKey(origin: string, destination: string): string {
  return `${origin}|||${destination}`;
}

/**
 * Load Google Maps JavaScript API
 */
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.google?.maps) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    // Create new script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
}

/**
 * Calculate distance between two points using Distance Matrix API
 */
export async function calculateDistance(
  origin: string | { lat: number; lng: number },
  destination: string | { lat: number; lng: number },
  apiKey: string
): Promise<DistanceResult> {
  const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
  const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
  
  const cacheKey = getCacheKey(originStr, destStr);
  
  // Check cache
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey)!;
  }

  try {
    // Load Google Maps if not already loaded
    await loadGoogleMapsScript(apiKey);

    if (!window.google?.maps) {
      throw new Error('Google Maps not available');
    }

    const service = new window.google.maps.DistanceMatrixService();
    
    const request: GoogleDistanceMatrixRequest = {
      origins: [origin],
      destinations: [destination],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.IMPERIAL,
    };

    const response = await new Promise<GoogleDistanceMatrixResponse>((resolve, reject) => {
      service.getDistanceMatrix(request, (result, status) => {
        if (status === window.google!.maps.DistanceMatrixStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Distance Matrix request failed: ${status}`));
        }
      });
    });

    const element = response.rows[0]?.elements[0];
    
    if (!element || element.status !== window.google.maps.DistanceMatrixStatus.OK) {
      throw new Error('Unable to calculate distance');
    }

    const distanceMeters = element.distance.value;
    const distanceMiles = distanceMeters / 1609.344; // Convert meters to miles
    const durationSeconds = element.duration.value;
    const durationText = element.duration.text;

    const result: DistanceResult = {
      distanceMeters,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationSeconds,
      durationText,
    };

    // Cache the result
    distanceCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

/**
 * Calculate round-trip distances from studio to all locations
 * Returns distances for each leg of the journey
 */
export async function calculateRoundTripDistances(
  studioLocation: StudioLocation,
  projectLocations: Location[],
  apiKey: string
): Promise<DistanceResult[]> {
  if (projectLocations.length === 0) {
    return [];
  }

  const distances: DistanceResult[] = [];

  for (const location of projectLocations) {
    try {
      // Calculate one-way distance from studio to location
      const oneWayDistance = await calculateDistance(
        { lat: studioLocation.lat, lng: studioLocation.lng },
        location.address,
        apiKey
      );

      // Round trip = one way × 2
      const roundTripDistance: DistanceResult = {
        distanceMeters: oneWayDistance.distanceMeters * 2,
        distanceMiles: Math.round(oneWayDistance.distanceMiles * 2 * 100) / 100,
        durationSeconds: oneWayDistance.durationSeconds * 2,
        durationText: oneWayDistance.durationText, // Keep original text for reference
      };

      distances.push(roundTripDistance);
    } catch (error) {
      console.error(`Error calculating distance to ${location.address}:`, error);
      // Continue with other locations even if one fails
    }
  }

  return distances;
}

/**
 * Initialize Google Places Autocomplete on an input element
 */
export function initAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelect: (place: GooglePlaceResult) => void
): GoogleAutocomplete | null {
  if (!window.google?.maps?.places) {
    console.error('Google Places API not loaded');
    return null;
  }

  const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
    types: ['address'],
    fields: ['formatted_address', 'place_id', 'geometry'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.formatted_address) {
      onPlaceSelect(place);
    }
  });

  return autocomplete;
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    await loadGoogleMapsScript(apiKey);

    if (!window.google?.maps) {
      throw new Error('Google Maps not available');
    }

    const geocoder = new window.google.maps.Geocoder();
    
    const result = await new Promise<GoogleGeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google!.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    if (result.length > 0 && result[0].geometry?.location) {
      return {
        lat: result[0].geometry.location.lat(),
        lng: result[0].geometry.location.lng(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Calculate travel time estimate text
 */
export function formatTravelTime(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${Math.round(durationMinutes)} min`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const minutes = Math.round(durationMinutes % 60);
  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

/**
 * Clear the distance cache
 */
export function clearDistanceCache(): void {
  distanceCache.clear();
}