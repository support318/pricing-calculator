/**
 * Candid Studios - Travel Fee Calculator Types
 */

// Location data structure
export interface Location {
  id: string;
  address: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

// Studio base location
export interface StudioLocation {
  address: string;
  lat: number;
  lng: number;
}

// Service duration inputs
export interface ServiceDuration {
  photoHours: number;
  videoHours: number;
}

// Add-ons selection
export interface AddOns {
  secondShooter: boolean;
  secondShooterQuantity: number;
  drone: boolean;
  liveStreaming: boolean;
}

// Complete calculator form state
export interface CalculatorFormState {
  locations: Location[];
  serviceDuration: ServiceDuration;
  addOns: AddOns;
  studioLocation: StudioLocation;
}

// Pricing constants
export interface PricingConfig {
  shootingRate: number;        // $350/hr
  photoEditingRate: number;    // $50/hr
  videoEditingRate: number;    // $100/hr
  minEditingHours: number;     // 3 hours minimum
  travelRatePerMile: number;   // $0.73/mile
  secondShooterRate: number;   // $150/hr
  droneFee: number;            // $400 flat
  liveStreamingFee: number;    // $800 flat
}

// Individual cost breakdown items
export interface CostBreakdown {
  shootingCost: number;
  photoEditingCost: number;
  videoEditingCost: number;
  secondShooterCost: number;
  droneCost: number;
  liveStreamingCost: number;
  travelCost: number;
  totalMiles: number;
}

// Complete calculation result
export interface CalculationResult {
  breakdown: CostBreakdown;
  total: number;
  isValid: boolean;
  errors?: string[];
}

// Google Maps Distance Matrix response
export interface DistanceMatrixResponse {
  rows: {
    elements: {
      distance: {
        value: number;  // meters
        text: string;
      };
      duration: {
        value: number;  // seconds
        text: string;
      };
      status: string;
    }[];
  }[];
  status: string;
}

// Distance calculation result
export interface DistanceResult {
  distanceMeters: number;
  distanceMiles: number;
  durationSeconds: number;
  durationText: string;
}

// Props for the main calculator component
export interface TravelCalculatorProps {
  defaultStudioLocation?: StudioLocation;
  googleMapsApiKey?: string;
  onCalculate?: (result: CalculationResult) => void;
  className?: string;
}

// Props for location input component
export interface LocationInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (address: string, placeId?: string) => void;
  onSelect: (location: Location) => void;
  error?: string;
  required?: boolean;
  googleMapsApiKey?: string;
}

// Props for add-on checkbox component
export interface AddOnCheckboxProps {
  id: string;
  label: string;
  description?: string;
  price: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  showQuantity?: boolean;
}

// Quote data for copying/emailing
export interface QuoteData {
  locations: string[];
  studioAddress: string;
  photoHours: number;
  videoHours: number;
  addOns: AddOns;
  breakdown: CostBreakdown;
  total: number;
  generatedAt: string;
}