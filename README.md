# Candid Studios - Travel Fee Calculator

A comprehensive React-based pricing calculator for photography and videography services with Google Maps integration for accurate travel cost calculation.

## Features

- **Location Management**: Add multiple project locations with Google Places autocomplete
- **Service Duration**: Specify photography and videography hours
- **Add-ons Selection**: Second shooter, drone footage, live streaming
- **Automatic Calculations**:
  - Shooting costs ($350/hr for photo & video)
  - Editing costs ($50/hr photo, $100/hr video, minimum 3 hours)
  - Travel fees ($0.73/mile round trip from Denver, CO)
  - Add-on pricing
- **Results Display**: Itemized breakdown with copy-to-clipboard and email functionality
- **Responsive Design**: Mobile-friendly interface styled with Tailwind CSS

## File Structure

```
pricing-calculator/
├── TravelCalculator.tsx      # Main calculator component
├── calculator.types.ts       # TypeScript type definitions
├── calculatePricing.ts       # Pricing calculation logic
├── googleMapsUtils.ts        # Google Maps API integration
├── index.ts                  # Module exports
├── example-usage.tsx         # Integration example
└── README.md                 # This file
```

## Installation

### 1. Install Dependencies

```bash
npm install lucide-react
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
4. Create credentials (API Key)
5. Restrict the key to your domain for security

### 3. Set Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Copy Files

Copy all calculator files to your project:

```bash
mkdir -p components/pricing-calculator
cp candid-studios/pricing-calculator/* components/pricing-calculator/
```

## Usage

### Basic Usage

```tsx
import { TravelCalculator } from '@/components/pricing-calculator';

export default function PricingPage() {
  return (
    <TravelCalculator 
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
    />
  );
}
```

### With Custom Studio Location

```tsx
<TravelCalculator
  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
  defaultStudioLocation={{
    address: 'Los Angeles, CA',
    lat: 34.0522,
    lng: -118.2437,
  }}
/>
```

### With Calculation Callback

```tsx
<TravelCalculator
  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
  onCalculate={(result) => {
    console.log('Total:', result.total);
    console.log('Breakdown:', result.breakdown);
    
    // Send to analytics
    gtag('event', 'quote_generated', {
      value: result.total,
      currency: 'USD',
    });
  }}
/>
```

### Dynamic Import (Recommended for Next.js)

```tsx
import dynamic from 'next/dynamic';

const TravelCalculator = dynamic(
  () => import('@/components/pricing-calculator/TravelCalculator'),
  { ssr: false }
);
```

## Pricing Structure

| Service | Rate | Minimum |
|---------|------|---------|
| Photography | $350/hr | - |
| Videography | $350/hr | - |
| Photo Editing | $50/hr | 3 hours |
| Video Editing | $100/hr | 3 hours |
| Second Shooter | $150/hr | - |
| Drone Footage | $400 | Flat fee |
| Live Streaming | $800 | Flat fee |
| Travel | $0.73/mile | Round trip |

### Editing Time Calculation

Editing hours are calculated as: **MAX(3, shooting_hours / 2)**

Examples:
- 4 hours shooting → 3 hours editing (minimum)
- 6 hours shooting → 3 hours editing
- 8 hours shooting → 4 hours editing
- 10 hours shooting → 5 hours editing

## API Reference

### TravelCalculator Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `googleMapsApiKey` | `string` | No | Google Maps API key for distance calculation |
| `defaultStudioLocation` | `StudioLocation` | No | Default studio location (defaults to Denver, CO) |
| `onCalculate` | `(result: CalculationResult) => void` | No | Callback when estimate is calculated |
| `className` | `string` | No | Additional CSS classes |

### Types

```typescript
interface CalculationResult {
  breakdown: {
    shootingCost: number;
    photoEditingCost: number;
    videoEditingCost: number;
    secondShooterCost: number;
    droneCost: number;
    liveStreamingCost: number;
    travelCost: number;
    totalMiles: number;
  };
  total: number;
  isValid: boolean;
  errors?: string[];
}

interface StudioLocation {
  address: string;
  lat: number;
  lng: number;
}
```

## Customization

### Change Pricing Rates

Edit `calculatePricing.ts`:

```typescript
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
```

### Styling

The calculator uses Tailwind CSS classes. Override styles by:

1. Passing a custom className:
   ```tsx
   <TravelCalculator className="my-custom-calculator" />
   ```

2. Using CSS modules or global CSS to target calculator elements

## Troubleshooting

### Google Maps not loading
- Check that API key is correct
- Verify APIs are enabled in Google Cloud Console
- Check browser console for errors
- Ensure domain restrictions allow your site

### Distance calculation fails
- Verify Distance Matrix API is enabled
- Check that billing is enabled on Google Cloud project
- Some remote locations may not be routable

### Component SSR issues
- Use dynamic import with `ssr: false` as shown above
- This prevents server-side rendering of Google Maps components

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

Requires JavaScript enabled.

## License

Private - For Candid Studios use only.

## Support

For questions or issues:
- Email: info@candidstudios.net
- Website: candidstudios.net