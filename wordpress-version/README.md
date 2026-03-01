# WordPress Integration Guide

## Option 1: Embed as HTML (Easiest)

1. Copy the contents of `calculator-standalone.html`
2. Replace `GOOGLE_MAPS_API_KEY` with your actual Google Maps API key
3. In WordPress, edit your pricing page
4. Add a "Custom HTML" block
5. Paste the HTML code
6. Save and publish

## Option 2: WordPress Plugin

1. Upload the `candid-pricing-calculator` folder to `/wp-content/plugins/`
2. Activate the plugin in WordPress admin
3. Use shortcode `[candid_pricing_calculator]` on any page

## Option 3: Embed via iFrame

Upload `calculator-standalone.html` to your server and embed:
```html
<iframe src="https://yoursite.com/calculator-standalone.html" width="100%" height="800" frameborder="0"></iframe>
```

## Google Maps API Key Setup

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
4. Create credentials (API Key)
5. Restrict the key to your domain

## Pricing Configuration

Edit the `CONFIG` object in the JavaScript to change rates:
- `shootingRate`: $350/hr
- `photoEditingRate`: $50/hr
- `videoEditingRate`: $100/hr
- `travelRate`: $0.73/mile

## Files

- `calculator-standalone.html` - Self-contained HTML file
- `candid-pricing-calculator.php` - WordPress plugin file
- `README.md` - This file