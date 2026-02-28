'use client';

/**
 * Candid Studios - Travel Fee Calculator Component
 * A comprehensive pricing calculator for photography services
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  MapPin,
  Clock,
  Camera,
  Video,
  UserPlus,
  Plane,
  Radio,
  Calculator,
  Copy,
  Mail,
  Share2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Location,
  StudioLocation,
  ServiceDuration,
  AddOns,
  CalculationResult,
  DistanceResult,
  QuoteData,
} from './calculator.types';
import {
  calculateTotalCost,
  formatCurrency,
  formatCurrencyPrecise,
  generateQuoteText,
  generateShareableUrl,
  DEFAULT_STUDIO_LOCATION,
} from './calculatePricing';
import {
  calculateRoundTripDistances,
  initAutocomplete,
  loadGoogleMapsScript,
  geocodeAddress,
} from './googleMapsUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TravelCalculatorProps {
  googleMapsApiKey?: string;
  defaultStudioLocation?: StudioLocation;
  onCalculate?: (result: CalculationResult) => void;
  className?: string;
}

interface LocationInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  onRemove?: () => void;
  error?: string;
  required?: boolean;
  googleMapsApiKey?: string;
  showRemove?: boolean;
  index: number;
}

interface AddOnCheckboxProps {
  id: string;
  label: string;
  description?: string;
  price: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  showQuantity?: boolean;
  icon?: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ADDONS: AddOns = {
  secondShooter: false,
  secondShooterQuantity: 1,
  drone: false,
  liveStreaming: false,
};

const DEFAULT_SERVICE_DURATION: ServiceDuration = {
  photoHours: 0,
  videoHours: 0,
};

// ============================================================================
// LOCATION INPUT COMPONENT
// ============================================================================

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder = 'Enter address...',
  value,
  onChange,
  onSelect,
  onRemove,
  error,
  required = false,
  googleMapsApiKey,
  showRemove = false,
  index,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!inputRef.current || !googleMapsApiKey) return;

    const setupAutocomplete = async () => {
      try {
        await loadGoogleMapsScript(googleMapsApiKey);
        
        if (inputRef.current) {
          autocompleteRef.current = initAutocomplete(inputRef.current, (place) => {
            if (place.formatted_address) {
              onChange(place.formatted_address);
              onSelect({
                id: `location-${index}-${Date.now()}`,
                address: place.formatted_address,
                placeId: place.place_id,
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
              });
            }
          });
        }
      } catch (error) {
        console.error('Error setting up autocomplete:', error);
      }
    };

    setupAutocomplete();

    return () => {
      // Cleanup autocomplete listeners if needed
    };
  }, [googleMapsApiKey, index, onChange, onSelect]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            type="button"
            aria-label="Remove location"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// ADD-ON CHECKBOX COMPONENT
// ============================================================================

const AddOnCheckbox: React.FC<AddOnCheckboxProps> = ({
  id,
  label,
  description,
  price,
  checked,
  onChange,
  quantity = 1,
  onQuantityChange,
  showQuantity = false,
  icon,
}) => {
  return (
    <div
      className={`relative flex items-start p-4 rounded-lg border-2 transition-all cursor-pointer ${
        checked
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-500">{icon}</span>}
            <label
              htmlFor={id}
              className="font-medium text-gray-900 cursor-pointer"
            >
              {label}
            </label>
          </div>
          <span className="text-blue-600 font-semibold">{price}</span>
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        {showQuantity && checked && onQuantityChange && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-gray-600">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange(Math.max(1, quantity - 1));
                }}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange(quantity + 1);
                }}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN CALCULATOR COMPONENT
// ============================================================================

const TravelCalculator: React.FC<TravelCalculatorProps> = ({
  googleMapsApiKey,
  defaultStudioLocation = DEFAULT_STUDIO_LOCATION,
  onCalculate,
  className = '',
}) => {
  // Form state
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationInputs, setLocationInputs] = useState<string[]>(['']);
  const [studioLocation, setStudioLocation] = useState<StudioLocation>(defaultStudioLocation);
  const [serviceDuration, setServiceDuration] = useState<ServiceDuration>(DEFAULT_SERVICE_DURATION);
  const [addOns, setAddOns] = useState<AddOns>(DEFAULT_ADDONS);
  
  // Results state
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [distances, setDistances] = useState<DistanceResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    locations: true,
    services: true,
    addons: true,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLocationChange = useCallback((index: number, value: string) => {
    setLocationInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
    
    // Clear error when user types
    if (errors[`location-${index}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`location-${index}`];
        return newErrors;
      });
    }
  }, [errors]);

  const handleLocationSelect = useCallback((index: number, location: Location) => {
    setLocations((prev) => {
      const newLocations = [...prev];
      newLocations[index] = location;
      return newLocations;
    });
  }, []);

  const addLocation = useCallback(() => {
    setLocationInputs((prev) => [...prev, '']);
    setLocations((prev) => [...prev, { id: `location-${prev.length}-${Date.now()}`, address: '' }]);
  }, []);

  const removeLocation = useCallback((index: number) => {
    setLocationInputs((prev) => prev.filter((_, i) => i !== index));
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate locations
    const hasValidLocation = locationInputs.some((input) => input.trim() !== '');
    if (!hasValidLocation) {
      newErrors['locations'] = 'At least one project location is required';
    }

    // Validate service duration
    if (serviceDuration.photoHours === 0 && serviceDuration.videoHours === 0) {
      newErrors['services'] = 'Please specify at least photo or video hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      setShowResults(false);
      return;
    }

    setIsCalculating(true);

    try {
      // Filter out empty locations
      const validLocations = locations.filter((loc) => loc.address.trim() !== '');

      // Calculate distances if API key is available
      let calculatedDistances: DistanceResult[] = [];
      if (googleMapsApiKey && validLocations.length > 0) {
        calculatedDistances = await calculateRoundTripDistances(
          studioLocation,
          validLocations,
          googleMapsApiKey
        );
      } else {
        // Mock distances for demo without API key
        calculatedDistances = validLocations.map(() => ({
          distanceMeters: 50000,
          distanceMiles: 31,
          durationSeconds: 3600,
          durationText: '1 hour',
        }));
      }

      setDistances(calculatedDistances);

      // Calculate total cost
      const result = calculateTotalCost(serviceDuration, addOns, calculatedDistances);
      setCalculationResult(result);
      setShowResults(true);

      if (onCalculate) {
        onCalculate(result);
      }
    } catch (error) {
      console.error('Error calculating:', error);
      setErrors({ general: 'Error calculating estimate. Please try again.' });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCopyQuote = async () => {
    if (!calculationResult) return;

    const validLocations = locations.filter((loc) => loc.address.trim() !== '');
    
    const quoteData: QuoteData = {
      locations: validLocations.map((loc) => loc.address),
      studioAddress: studioLocation.address,
      photoHours: serviceDuration.photoHours,
      videoHours: serviceDuration.videoHours,
      addOns,
      breakdown: calculationResult.breakdown,
      total: calculationResult.total,
      generatedAt: new Date().toISOString(),
    };

    const quoteText = generateQuoteText(quoteData);

    try {
      await navigator.clipboard.writeText(quoteText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleEmailQuote = () => {
    if (!calculationResult) return;

    const validLocations = locations.filter((loc) => loc.address.trim() !== '');
    
    const quoteData: QuoteData = {
      locations: validLocations.map((loc) => loc.address),
      studioAddress: studioLocation.address,
      photoHours: serviceDuration.photoHours,
      videoHours: serviceDuration.videoHours,
      addOns,
      breakdown: calculationResult.breakdown,
      total: calculationResult.total,
      generatedAt: new Date().toISOString(),
    };

    const quoteText = generateQuoteText(quoteData);
    const subject = encodeURIComponent('Candid Studios - Project Estimate');
    const body = encodeURIComponent(quoteText);
    
    window.open(`mailto:info@candidstudios.net?subject=${subject}&body=${body}`, '_blank');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="text-blue-400" size={28} />
            <h2 className="text-2xl md:text-3xl font-bold">Project Estimate Calculator</h2>
          </div>
          <p className="text-gray-300">
            Get an instant estimate for your photography or videography project.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Studio Location */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Info size={16} />
              <span className="text-sm">
                Estimates calculated from studio base: <strong>{studioLocation.address}</strong>
              </span>
            </div>
          </div>

          {/* Locations Section */}
          <section>
            <button
              onClick={() => toggleSection('locations')}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="text-blue-600" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Project Locations</h3>
              </div>
              {expandedSections.locations ? (
                <ChevronUp className="text-gray-400" size={24} />
              ) : (
                <ChevronDown className="text-gray-400" size={24} />
              )}
            </button>

            {expandedSections.locations && (
              <div className="space-y-4 pl-2">
                {errors.locations && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.locations}
                  </p>
                )}

                {locationInputs.map((input, index) => (
                  <LocationInput
                    key={index}
                    index={index}
                    label={index === 0 ? 'Primary Location' : `Additional Location ${index}`}
                    value={input}
                    onChange={(value) => handleLocationChange(index, value)}
                    onSelect={(location) => handleLocationSelect(index, location)}
                    onRemove={index > 0 ? () => removeLocation(index) : undefined}
                    error={errors[`location-${index}`]}
                    required={index === 0}
                    googleMapsApiKey={googleMapsApiKey}
                    showRemove={index > 0}
                  />
                ))}

                <button
                  onClick={addLocation}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  type="button"
                >
                  <Plus size={18} />
                  Add Another Location
                </button>
              </div>
            )}
          </section>

          <hr className="border-gray-200" />

          {/* Service Duration Section */}
          <section>
            <button
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="text-green-600" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Service Duration</h3>
              </div>
              {expandedSections.services ? (
                <ChevronUp className="text-gray-400" size={24} />
              ) : (
                <ChevronDown className="text-gray-400" size={24} />
              )}
            </button>

            {expandedSections.services && (
              <div className="grid md:grid-cols-2 gap-6 pl-2">
                {errors.services && (
                  <p className="text-red-500 text-sm flex items-center gap-1 md:col-span-2">
                    <AlertCircle size={14} />
                    {errors.services}
                  </p>
                )}

                {/* Photography Hours */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Camera size={16} />
                    Photography Hours
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setServiceDuration((prev) => ({
                          ...prev,
                          photoHours: Math.max(0, prev.photoHours - 1),
                        }))
                      }
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={serviceDuration.photoHours}
                      onChange={(e) =>
                        setServiceDuration((prev) => ({
                          ...prev,
                          photoHours: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-20 text-center py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setServiceDuration((prev) => ({
                          ...prev,
                          photoHours: prev.photoHours + 1,
                        }))
                      }
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">${350}/hour</p>
                </div>

                {/* Videography Hours */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Video size={16} />
                    Videography Hours
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setServiceDuration((prev) => ({
                          ...prev,
                          videoHours: Math.max(0, prev.videoHours - 1),
                        }))
                      }
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={serviceDuration.videoHours}
                      onChange={(e) =>
                        setServiceDuration((prev) => ({
                          ...prev,
                          videoHours: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-20 text-center py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setServiceDuration((prev) => ({
                          ...prev,
                          videoHours: prev.videoHours + 1,
                        }))
                      }
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">${350}/hour</p>
                </div>
              </div>
            )}
          </section>

          <hr className="border-gray-200" />

          {/* Add-ons Section */}
          <section>
            <button
              onClick={() => toggleSection('addons')}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Plus className="text-purple-600" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add-ons</h3>
              </div>
              {expandedSections.addons ? (
                <ChevronUp className="text-gray-400" size={24} />
              ) : (
                <ChevronDown className="text-gray-400" size={24} />
              )}
            </button>

            {expandedSections.addons && (
              <div className="space-y-4 pl-2">
                <AddOnCheckbox
                  id="second-shooter"
                  label="Second Shooter"
                  description="Additional photographer/videographer"
                  price="$150/hr"
                  checked={addOns.secondShooter}
                  onChange={(checked) =>
                    setAddOns((prev) => ({ ...prev, secondShooter: checked }))
                  }
                  quantity={addOns.secondShooterQuantity}
                  onQuantityChange={(quantity) =>
                    setAddOns((prev) => ({ ...prev, secondShooterQuantity: quantity }))
                  }
                  showQuantity={true}
                  icon={<UserPlus size={18} />}
                />

                <AddOnCheckbox
                  id="drone"
                  label="Drone Footage"
                  description="Aerial photography and video"
                  price="$400 flat"
                  checked={addOns.drone}
                  onChange={(checked) =>
                    setAddOns((prev) => ({ ...prev, drone: checked }))
                  }
                  icon={<Plane size={18} />}
                />

                <AddOnCheckbox
                  id="live-streaming"
                  label="Live Streaming"
                  description="Stream your event live online"
                  price="$800 flat"
                  checked={addOns.liveStreaming}
                  onChange={(checked) =>
                    setAddOns((prev) => ({ ...prev, liveStreaming: checked }))
                  }
                  icon={<Radio size={18} />}
                />
              </div>
            )}
          </section>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator size={20} />
                Calculate Estimate
              </>
            )}
          </button>

          {/* Results Section */}
          {showResults && calculationResult && (
            <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={24} />
                Your Estimate
              </h3>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                {/* Shooting Cost */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">
                    Shooting ({serviceDuration.photoHours + serviceDuration.videoHours} hours @ $350/hr)
                  </span>
                  <span className="font-medium">{formatCurrency(calculationResult.breakdown.shootingCost)}</span>
                </div>

                {/* Photo Editing */}
                {calculationResult.breakdown.photoEditingCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      Photo Editing (min 3 hrs @ $50/hr)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calculationResult.breakdown.photoEditingCost)}
                    </span>
                  </div>
                )}

                {/* Video Editing */}
                {calculationResult.breakdown.videoEditingCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      Video Editing (min 3 hrs @ $100/hr)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calculationResult.breakdown.videoEditingCost)}
                    </span>
                  </div>
                )}

                {/* Second Shooter */}
                {addOns.secondShooter && calculationResult.breakdown.secondShooterCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      Second Shooter ({addOns.secondShooterQuantity}x @ $150/hr)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calculationResult.breakdown.secondShooterCost)}
                    </span>
                  </div>
                )}

                {/* Drone */}
                {addOns.drone && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Drone Footage</span>
                    <span className="font-medium">{formatCurrency(calculationResult.breakdown.droneCost)}</span>
                  </div>
                )}

                {/* Live Streaming */}
                {addOns.liveStreaming && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Live Streaming</span>
                    <span className="font-medium">
                      {formatCurrency(calculationResult.breakdown.liveStreamingCost)}
                    </span>
                  </div>
                )}

                {/* Travel */}
                {calculationResult.breakdown.travelCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      Travel ({Math.round(calculationResult.breakdown.totalMiles)} miles @ $0.73/mile)
                    </span>
                    <span className="font-medium">{formatCurrency(calculationResult.breakdown.travelCost)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                  <span className="text-xl font-bold text-gray-900">Total Estimate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculationResult.total)}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-sm text-gray-500 mb-6 italic">
                <Info size={14} className="inline mr-1" />
                This is an estimate. Final pricing may vary based on project specifics.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopyQuote}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    copySuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Quote
                    </>
                  )}
                </button>

                <button
                  onClick={handleEmailQuote}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  <Mail size={18} />
                  Email Quote
                </button>

                <button
                  onClick={() => {
                    const validLocations = locations.filter((loc) => loc.address.trim() !== '');
                    const quoteData = {
                      locations: validLocations.map((loc) => loc.address),
                      studioAddress: studioLocation.address,
                      photoHours: serviceDuration.photoHours,
                      videoHours: serviceDuration.videoHours,
                      addOns,
                    };
                    const url = generateShareableUrl(window.location.origin, quoteData);
                    navigator.clipboard.writeText(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  <Share2 size={18} />
                  Share Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelCalculator;