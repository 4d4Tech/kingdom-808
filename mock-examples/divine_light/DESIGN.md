---
name: Divine Light
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#404850'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#707881'
  outline-variant: '#bfc7d1'
  surface-tint: '#006399'
  primary: '#005d90'
  on-primary: '#ffffff'
  primary-container: '#0077b6'
  on-primary-container: '#f3f7ff'
  inverse-primary: '#94ccff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#515a5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a7278'
  on-tertiary-container: '#f0f8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#dbe4ea'
  tertiary-fixed-dim: '#bfc8ce'
  on-tertiary-fixed: '#151d22'
  on-tertiary-fixed-variant: '#40484d'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1440px
---

## Brand & Style
The design system is built upon the "Divine Light" aesthetic, aiming to evoke feelings of transcendence, peace, and spiritual uplift. The target audience includes a global community of believers and music enthusiasts seeking high-quality worship and contemporary Christian music. 

The visual style is a blend of **Minimalism** and **Glassmorphism**. It prioritizes clarity and breathability through heavy whitespace, while utilizing translucent, frosted layers to represent the ethereal nature of light. The interface should feel weightless and serene, avoiding heavy visual anchors in favor of soft gradients and glowing accents that suggest a sacred, modern space for communal listening.

## Colors
This design system utilizes a palette rooted in celestial and sacred symbolism. 

- **Primary (Serene Sky Blue):** Used for navigation, active states, and core UI signals, representing tranquility and the heavens.
- **Secondary (Warm Gold):** Reserved for high-value actions, such as "Support Artist," premium features, or celebratory spiritual highlights.
- **Tertiary (Alice Blue):** A soft, cool-toned surface color used for background layering to prevent visual fatigue from pure white.
- **Neutral (Pure White):** The foundation of the system, providing the "Light" that defines the brand.

Interaction states should use subtle opacity shifts rather than aggressive dark overlays to maintain the luminous quality of the interface.

## Typography
The typography strategy employs a dual-personality approach. **Playfair Display** is utilized for editorial headers, spiritual quotes, and artist names, bringing a sense of tradition, authority, and elegance. **Geist** provides a modern, high-precision contrast for functional UI elements, track listings, and metadata, ensuring maximum legibility and a developer-grade cleanliness.

Headlines should utilize generous top-margin spacing to create a sense of "aspiration" and verticality within the layout. Label styles are frequently uppercased with slight tracking to provide a technical, organized feel amidst the more fluid serif headings.

## Layout & Spacing
The layout follows a **Fixed Grid** model for content discovery, centered within the viewport with a maximum width of 1440px. However, the interactive audio elements—specifically the persistent player and audio waveforms—utilize a **Fluid** model to span the entire width of the browser, echoing the expansive nature of sound.

Spacing is governed by an 8px rhythmic scale. On desktop, large "Hero" sections for featured worship albums utilize `xl` (80px) padding to create a cinematic impact. On mobile, the grid collapses to a single column with `margin-mobile` (16px) to maintain clarity. All interactive elements (buttons, inputs) should maintain a minimum touch target height of 48px.

## Elevation & Depth
Depth in the design system is achieved through **Glassmorphism** and **Ambient Shadows**. Instead of traditional grey shadows, this system uses low-opacity Sky Blue (#0077B6) or Gold (#D4AF37) tints in the drop shadows to create a "glow" effect rather than a "weight" effect.

Surfaces are categorized by three levels:
1. **Base:** Pure White (#FFFFFF) or Alice Blue (#F0F8FF).
2. **Floating:** Surfaces with a 16px blur backdrop and 60% white opacity, used for the persistent music player and navigation sidebars.
3. **Elevated:** Elements like cards or modals that use a very soft, diffused shadow (Blur: 30px, Y: 10px, Opacity: 8% Primary Color) to appear as if they are floating in light.

## Shapes
The shape language is **Rounded**, conveying a sense of softness, approachability, and organic flow. Strict 90-degree corners are avoided to ensure the UI feels welcoming and "human." 

- Standard components (buttons, input fields) use a 0.5rem (8px) radius.
- Feature containers and album art use a 1rem (16px) radius to create a distinct, modern silhouette.
- Interactive icons and small tags may use "pill-shaped" (full-round) geometry to differentiate them from structural content.

## Components
### Buttons
Primary buttons use the Warm Gold (#D4AF37) fill with white text for "Donate" or "Premium" actions. Secondary buttons use a Sky Blue outline or a ghost style with Geist Medium typography.

### Waveforms
Inspired by early SoundCloud, waveforms are high-detail and fluid. They should use a dual-tone gradient (Sky Blue to Transparent) to indicate play progress, appearing as "active energy" moving across the screen.

### Cards
Album and playlist cards feature high-quality imagery with a subtle 1px inner border in Alice Blue to ensure they pop against white backgrounds. Hover states should trigger a slight scale-up and a soft blue glow.

### Input Fields
Inputs are minimalist, utilizing a bottom-border-only style for a clean look, or a light Alice Blue background with no border, focusing on Geist for the user's input.

### The Player Bar
A fixed bottom component using a Glassmorphism effect (backdrop-blur). Controls are centered, utilizing the Primary Sky Blue for the play/pause state. The typography for the "Now Playing" track is Geist for the title and Playfair Display (Italic) for the artist to maintain the spiritual/editorial vibe.

### Chips & Tags
Used for "Genres" or "Moods" (e.g., *Reflective, Joyful, Praise*). These should be pill-shaped with a light Alice Blue fill and Sky Blue text.