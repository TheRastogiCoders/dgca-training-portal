# How to Add Your Logo Image

## Steps to Add Your Logo:

1. **Place your logo file** in the `client/public/` folder
2. **Name it exactly** `logo.png` (or update the src path in HomePage.js)
3. **Supported formats**: PNG, JPG, SVG, WebP
4. **Recommended size**: 120px width × 60px height (or similar ratio)

## Current Setup:
- The logo is set to load from `/logo.png` in the public folder
- Maximum size: 120px width × 60px height
- The image will automatically scale to fit
- Hover effects and animations are already applied

## To Change the Logo:
1. Replace the file `client/public/logo.png` with your logo
2. Or update the `src` attribute in `HomePage.js` to point to your file

## Example:
If your logo is named `vimaanna-logo.png`, update this line in HomePage.js:
```jsx
<img 
  src="/vimaanna-logo.png" 
  alt="VIMAANNA Logo" 
  className="logo-image"
/>
```

The logo will automatically have:
- Floating animation
- Hover scale effect
- Drop shadow
- Responsive sizing
