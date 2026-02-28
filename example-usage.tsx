/**
 * Candid Studios - Travel Fee Calculator Integration Example
 * 
 * This file demonstrates how to integrate the TravelCalculator component
 * into a Next.js page at candidstudios.net/pricing
 */

// ============================================================================
// PAGE: app/pricing/page.tsx (or pages/pricing.tsx)
// ============================================================================

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the calculator to avoid SSR issues with Google Maps
const TravelCalculator = dynamic(
  () => import('@/components/pricing-calculator/TravelCalculator'),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
  }
);

// Loading fallback component
function CalculatorLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-gray-600">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span>Loading calculator...</span>
      </div>
    </div>
  );
}

// Main pricing page component
export default function PricingPage() {
  // Handle calculation result
  const handleCalculate = (result: any) => {
    // Optional: Send analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'price_estimate_generated', {
        value: result.total,
        currency: 'USD',
      });
    }
    
    console.log('Estimate generated:', result);
  };

  // Custom studio location (optional)
  const studioLocation = {
    address: 'Denver, CO 80202',
    lat: 39.7392,
    lng: -104.9903,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get an instant estimate for your photography or videography project.
            No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Calculate Your Project Cost
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Fill in the details below to get a detailed estimate including 
              shooting time, editing, add-ons, and travel fees.
            </p>
          </div>

          <Suspense fallback={<CalculatorLoading />}>
            <TravelCalculator
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              defaultStudioLocation={studioLocation}
              onCalculate={handleCalculate}
            />
          </Suspense>
        </div>
      </section>

      {/* Pricing Info Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Shooting Rate */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shooting</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">$350</p>
              <p className="text-gray-600">per hour<br/>(Photo & Video)</p>
            </div>

            {/* Photo Editing */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Editing</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">$50</p>
              <p className="text-gray-600">per hour<br/>(3 hour minimum)</p>
            </div>

            {/* Video Editing */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Editing</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">$100</p>
              <p className="text-gray-600">per hour<br/>(3 hour minimum)</p>
            </div>

            {/* Travel */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Travel</h3>
              <p className="text-3xl font-bold text-orange-600 mb-2">$0.73</p>
              <p className="text-gray-600">per mile<br/>(round trip)</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                How is the editing time calculated?
              </h3>
              <p className="text-gray-600">
                Editing time is calculated as half of your shooting time, with a minimum 
                of 3 hours. For example, a 6-hour shoot includes 3 hours of editing time included.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What's included in the shooting rate?
              </h3>
              <p className="text-gray-600">
                The shooting rate includes professional photography or videography services, 
                equipment, and the expertise of our experienced team. Both photo and video 
                are billed at the same hourly rate.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                How is travel calculated?
              </h3>
              <p className="text-gray-600">
                Travel is calculated from our studio in Denver, CO to your project location(s) 
                and back (round trip). We use Google Maps for accurate distance calculation 
                at $0.73 per mile.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is this estimate binding?
              </h3>
              <p className="text-gray-600">
                No, this is an estimate only. Final pricing may vary based on project specifics, 
                special requirements, or additional services. Contact us for a detailed quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Have questions about your estimate? Let's discuss your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-slate-900 bg-white hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="tel:+13035551234"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-slate-900 transition-colors"
            >
              Call (303) 555-1234
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// LAYOUT: app/layout.tsx (add to head)
// ============================================================================

/*
For the Google Maps API to work, you need to add your API key to your environment:

1. Create a .env.local file in your project root:
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

2. Enable these APIs in your Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API

3. Restrict your API key to your domain for security.
*/

// ============================================================================
// COMPONENT SETUP
// ============================================================================

/*
File structure for integration:

app/
├── pricing/
│   └── page.tsx          <- Main pricing page (this example)
├── layout.tsx            <- Root layout with fonts, metadata
└── globals.css           <- Global styles including Tailwind

components/
└── pricing-calculator/
    ├── TravelCalculator.tsx      <- Main calculator component
    ├── calculator.types.ts       <- Type definitions
    ├── calculatePricing.ts       <- Pricing calculation logic
    ├── googleMapsUtils.ts        <- Google Maps integration
    └── index.ts                  <- Module exports

public/
└── (static assets)

// ============================================================================
// INSTALLATION REQUIREMENTS
// ============================================================================

Required dependencies:
- react ^18.0.0
- react-dom ^18.0.0
- next ^14.0.0
- lucide-react (for icons)
- tailwindcss (for styling)
- typescript (for type safety)

Install command:
npm install lucide-react

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

Create .env.local:

# Google Maps API Key (required for distance calculation)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional: Custom studio location
NEXT_PUBLIC_STUDIO_ADDRESS=Denver, CO
NEXT_PUBLIC_STUDIO_LAT=39.7392
NEXT_PUBLIC_STUDIO_LNG=-104.9903

// ============================================================================
// USAGE WITHOUT GOOGLE MAPS API KEY
// ============================================================================

The calculator works without an API key but will use estimated distances 
(31 miles default). For accurate travel calculations, a Google Maps API key 
is recommended.

To use without API key:
<TravelCalculator />

To use with API key:
<TravelCalculator googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} />

// ============================================================================
// CUSTOMIZATION OPTIONS
// ============================================================================

1. Change default studio location:
<TravelCalculator 
  defaultStudioLocation={{
    address: 'Los Angeles, CA',
    lat: 34.0522,
    lng: -118.2437
  }}
/>

2. Handle calculation results:
<TravelCalculator 
  onCalculate={(result) => {
    console.log('Total:', result.total);
    console.log('Breakdown:', result.breakdown);
  }}
/>

3. Apply custom styling:
<TravelCalculator className="my-custom-class" />

// ============================================================================
*/