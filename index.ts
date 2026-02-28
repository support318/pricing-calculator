/**
 * Candid Studios - Pricing Calculator Module
 * Export all components and utilities for the travel fee calculator
 */

// Components
export { default as TravelCalculator } from './TravelCalculator';

// Types
export type {
  Location,
  StudioLocation,
  ServiceDuration,
  AddOns,
  CalculatorFormState,
  PricingConfig,
  CostBreakdown,
  CalculationResult,
  DistanceMatrixResponse,
  DistanceResult,
  TravelCalculatorProps,
  LocationInputProps,
  AddOnCheckboxProps,
  QuoteData,
} from './calculator.types';

// Utilities
export {
  calculateTotalCost,
  calculateShootingCost,
  calculateEditingCost,
  calculateAddOnsCost,
  calculateTravelCost,
  calculateEditingHours,
  formatCurrency,
  formatCurrencyPrecise,
  generateQuoteText,
  generateShareableUrl,
  DEFAULT_PRICING_CONFIG,
  DEFAULT_STUDIO_LOCATION,
} from './calculatePricing';

// Google Maps utilities
export {
  loadGoogleMapsScript,
  calculateDistance,
  calculateRoundTripDistances,
  initAutocomplete,
  geocodeAddress,
  formatTravelTime,
  clearDistanceCache,
} from './googleMapsUtils';