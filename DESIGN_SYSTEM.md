# AskToddy Design System

## 🎨 Brand Integration Guide

### Current Setup
I've created a foundational design system that's ready for your brand customization:

- ✅ **Tailwind config** with custom color palette
- ✅ **Design tokens** file for consistent values
- ✅ **Component library** (Button, Card, Input) 
- ✅ **Utility functions** for styling
- ✅ **TypeScript** integration

## 📝 What You Need to Provide

### 1. Brand Colors (HEX codes)
Update `/styles/design-tokens.js` and `/tailwind.config.ts` with your colors:

```javascript
// Example - replace with your actual colors
colors: {
  primary: {
    500: '#YOUR_PRIMARY_COLOR', // Main brand color
    // ... other shades
  },
  secondary: {
    500: '#YOUR_SECONDARY_COLOR',
  },
  accent: {
    500: '#YOUR_ACCENT_COLOR', // Call-to-action color
  }
}
```

### 2. Typography
Update font families in the same files:
- **Heading font**: For titles and headers
- **Body font**: For general text
- **Mono font**: For code/technical content

### 3. Logo & Assets
Place your logo files in `/public/`:
- `logo.svg` - Main logo (SVG preferred)
- `logo-dark.svg` - Dark theme version (optional)
- `favicon.ico` - Browser tab icon
- `icon-192.png` & `icon-512.png` - PWA icons

### 4. Brand Voice
Let me know:
- Tone (professional, friendly, expert, etc.)
- Any specific terminology preferences
- Industry-specific language to use

## 🚀 Next Steps

1. **Share your brand colors** - I'll update the entire system
2. **Font preferences** - Google Fonts or custom fonts?
3. **Logo files** - SVG format is best for web
4. **Inspiration** - Any design references you like?

## 📁 File Structure

```
/components/ui/          # Reusable UI components
/styles/design-tokens.js # Single source of truth for design values
/tailwind.config.ts      # Tailwind customization
/public/                 # Static assets (logos, icons)
```

## 🎯 Benefits of This Approach

- **Consistent styling** across all components
- **Easy theme updates** by changing token values
- **Type-safe** component props
- **Scalable** - easy to add new components
- **Developer-friendly** with clear naming conventions

Ready to customize with your brand! Share your colors and assets when you're ready. 🎨