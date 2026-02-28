/**
 * Candid Studios - Pricing Calculation Utilities
 */

import {
  PricingConfig,
  CostBreakdown,
  CalculationResult,
  ServiceDuration,
  AddOns,
  DistanceResult,
  QuoteData,
} from './calculator.types';

// Default pricing configuration
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  shootingRate: 350,
  photoEditingRate: 50,
  videoEditingRate: 100,
  minEditingHours: 3,
  travelRatePerMile: 0.73,
  secondShooterRate: 150,
  droneFee: 400,
  liveStreamingFee: 800,
};

// Default studio location (Denver, CO)
export const DEFAULT_STUDIO_LOCATION = {
  address: 'Denver, CO',
  lat: 39.7392,
  lng: -104.9903,
};

/**
 * Calculate editing hours based on shooting hours
 * Rule: Half of shooting time, with minimum of 3 hours
 */
export function calculateEditingHours(shootingHours: number, minHours: number = 3): number {
  const halfShootingTime = shootingHours / 2;
  return Math.max(minHours, halfShootingTime);
}

/**
 * Calculate shooting costs
 */
export function calculateShootingCost(
  photoHours: number,
  videoHours: number,
  config: PricingConfig
): number {
  const totalHours = photoHours + videoHours;
  return totalHours * config.shootingRate;
}

/**
 * Calculate editing costs
 */
export function calculateEditingCost(
  photoHours: number,
  videoHours: number,
  config: PricingConfig
): { photoEditingCost: number; videoEditingCost: number } {
  const photoEditingHours = calculateEditingHours(photoHours, config.minEditingHours);
  const videoEditingHours = calculateEditingHours(videoHours, config.minEditingHours);

  return {
    photoEditingCost: photoEditingHours * config.photoEditingRate,
    videoEditingCost: videoEditingHours * config.videoEditingRate,
  };
}

/**
 * Calculate add-ons costs
 */
export function calculateAddOnsCost(
  addOns: AddOns,
  totalShootingHours: number,
  config: PricingConfig
): {
  secondShooterCost: number;
  droneCost: number;
  liveStreamingCost: number;
} {
  return {
    secondShooterCost: addOns.secondShooter
      ? config.secondShooterRate * totalShootingHours * addOns.secondShooterQuantity
      : 0,
    droneCost: addOns.drone ? config.droneFee : 0,
    liveStreamingCost: addOns.liveStreaming ? config.liveStreamingFee : 0,
  };
}

/**
 * Calculate travel cost based on total miles
 */
export function calculateTravelCost(
  totalMiles: number,
  config: PricingConfig
): number {
  // Round trip multiplier is already applied in distance calculation
  return Math.round(totalMiles * config.travelRatePerMile * 100) / 100;
}

/**
 * Calculate total distance from studio to all locations (round trip)
 * Returns total miles for the entire route
 */
export function calculateTotalDistance(
  distances: DistanceResult[]
): number {
  return distances.reduce((total, distance) => total + distance.distanceMiles, 0);
}

/**
 * Main calculation function
 */
export function calculateTotalCost(
  serviceDuration: ServiceDuration,
  addOns: AddOns,
  distances: DistanceResult[],
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): CalculationResult {
  const errors: string[] = [];

  // Validation
  if (serviceDuration.photoHours < 0 || serviceDuration.videoHours < 0) {
    errors.push('Hours cannot be negative');
  }

  if (distances.length === 0) {
    errors.push('At least one location is required');
  }

  if (errors.length > 0) {
    return {
      breakdown: {
        shootingCost: 0,
        photoEditingCost: 0,
        videoEditingCost: 0,
        secondShooterCost: 0,
        droneCost: 0,
        liveStreamingCost: 0,
        travelCost: 0,
        totalMiles: 0,
      },
      total: 0,
      isValid: false,
      errors,
    };
  }

  // Calculate shooting cost
  const shootingCost = calculateShootingCost(
    serviceDuration.photoHours,
    serviceDuration.videoHours,
    config
  );

  // Calculate editing costs
  const { photoEditingCost, videoEditingCost } = calculateEditingCost(
    serviceDuration.photoHours,
    serviceDuration.videoHours,
    config
  );

  // Calculate add-ons
  const totalShootingHours = serviceDuration.photoHours + serviceDuration.videoHours;
  const { secondShooterCost, droneCost, liveStreamingCost } = calculateAddOnsCost(
    addOns,
    totalShootingHours,
    config
  );

  // Calculate travel
  const totalMiles = calculateTotalDistance(distances);
  const travelCost = calculateTravelCost(totalMiles, config);

  // Build breakdown
  const breakdown: CostBreakdown = {
    shootingCost,
    photoEditingCost,
    videoEditingCost,
    secondShooterCost,
    droneCost,
    liveStreamingCost,
    travelCost,
    totalMiles,
  };

  // Calculate total
  const total =
    shootingCost +
    photoEditingCost +
    videoEditingCost +
    secondShooterCost +
    droneCost +
    liveStreamingCost +
    travelCost;

  return {
    breakdown,
    total: Math.round(total * 100) / 100,
    isValid: true,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with cents for display
 */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate quote text for copying/emailing
 */
export function generateQuoteText(
  quoteData: QuoteData
): string {
  const {
    locations,
    studioAddress,
    photoHours,
    videoHours,
    addOns,
    breakdown,
    total,
    generatedAt,
  } = quoteData;

  const lines: string[] = [
    'CANDID STUDIOS - PROJECT ESTIMATE',
    '================================',
    '',
    `Generated: ${new Date(generatedAt).toLocaleDateString()}`,
    '',
    'PROJECT DETAILS',
    '----------------',
    `Studio Location: ${studioAddress}`,
    `Project Location(s): ${locations.join(', ')}`,
    '',
    'SERVICES',
    '--------',
  ];

  if (photoHours > 0) {
    lines.push(`Photography: ${photoHours} hour(s)`);
  }
  if (videoHours > 0) {
    lines.push(`Videography: ${videoHours} hour(s)`);
  }

  lines.push(
    '',
    'COST BREAKDOWN',
    '--------------',
    `Shooting Cost: ${formatCurrency(breakdown.shootingCost)}`
  );

  if (breakdown.photoEditingCost > 0) {
    lines.push(`Photo Editing: ${formatCurrency(breakdown.photoEditingCost)}`);
  }
  if (breakdown.videoEditingCost > 0) {
    lines.push(`Video Editing: ${formatCurrency(breakdown.videoEditingCost)}`);
  }

  if (addOns.secondShooter) {
    lines.push(`Second Shooter (${addOns.secondShooterQuantity}): ${formatCurrency(breakdown.secondShooterCost)}`);
  }
  if (addOns.drone) {
    lines.push(`Drone Footage: ${formatCurrency(breakdown.droneCost)}`);
  }
  if (addOns.liveStreaming) {
    lines.push(`Live Streaming: ${formatCurrency(breakdown.liveStreamingCost)}`);
  }

  lines.push(
    `Travel (${Math.round(breakdown.totalMiles)} miles round trip): ${formatCurrency(breakdown.travelCost)}`,
    '',
    '--------------',
    `TOTAL ESTIMATE: ${formatCurrency(total)}`,
    '',
    '================================',
    'This is an estimate. Final pricing may vary based on project specifics.',
    'Contact us at candidstudios.net to discuss your project in detail.',
    ''
  );

  return lines.join('\n');
}

/**
 * Generate a shareable URL with quote parameters
 */
export function generateShareableUrl(
  baseUrl: string,
  quoteData: Omit<QuoteData, 'breakdown' | 'total' | 'generatedAt'>
): string {
  const params = new URLSearchParams({
    studio: quoteData.studioAddress,
    locations: quoteData.locations.join('|'),
    photoHours: quoteData.photoHours.toString(),
    videoHours: quoteData.videoHours.toString(),
    secondShooter: quoteData.addOns.secondShooter.toString(),
    secondShooterQty: quoteData.addOns.secondShooterQuantity.toString(),
    drone: quoteData.addOns.drone.toString(),
    liveStreaming: quoteData.addOns.liveStreaming.toString(),
  });

  return `${baseUrl}?${params.toString()}`;
}