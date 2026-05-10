---
colors:
  primary:
    light-green:
      0: "#ebfbee"
      1: "#d3f9d8"
      2: "#b2f2bb"
      3: "#8ce99a"
      4: "#69db7c"
      5: "#51cf66"
      6: "#40c057"
      7: "#37b24d"
      8: "#2f9e44"
      9: "#2b8a3e"
  accent:
    forest-green:
      0: "#eaf2ea"
      1: "#cbdccb"
      2: "#aac5aa"
      3: "#89af89"
      4: "#689868"
      5: "#517c51"
      6: "#3f603f"
      7: "#2d452d"
      8: "#1c2b1c"
      9: "#0a110a"
  system:
    background: "#ffffff"
    foreground: "#1c2b1c"
    muted: "#89af89"

typography:
  font-family:
    base: "var(--font-geist-sans), sans-serif"
    headings: "var(--font-geist-sans), sans-serif"
  size:
    xs: "12px"
    sm: "14px"
    md: "16px"
    lg: "18px"
    xl: "20px"
  weight:
    regular: 400
    medium: 500
    bold: 700

spacing:
  xs: "10px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"

radii:
  sm: "4px"
  md: "8px"
  lg: "16px"

shadows:
  sm: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
  md: "0 4px 6px rgba(0,0,0,0.1)"
---

# Villahvitfelt Design System

Villahvitfelt is a "Cottage Management" application designed with a **Forestry/Nature-inspired aesthetic**. The design goal is to create a serene, functional, and approachable environment that feels like an extension of the natural surroundings of a cottage.

## Visual Identity

### Look & Feel
The interface uses a "Soft Tech" approach, blending clean modern layouts with an earthy, organic color palette. It avoids the harshness of pure black and white, opting instead for deep charcoal greens and soft minty accents. The experience should feel sturdy and reliable, mirroring the durability of cottage architecture.

### Color Strategy
- **Light Green (Primary):** Used for primary actions, buttons, and highlights. It represents new growth and vitality.
- **Forest Green (Secondary/Accent):** Used for deep backgrounds, text, and structural elements. It provides the grounding "earthy" feel of the system.
- **High Contrast:** While the palette is natural, contrast is maintained for readability, particularly for elderly users who may be interacting with guest guides and instructions.

## Component Design

### Surface & Elevation
Surfaces are primarily white or very light green-tinted neutrals. Elevation is used sparingly to differentiate between flat content (like guides) and interactive cards or modal dialogs. Shadows are soft and naturalistic rather than sharp and digital.

### Typography & Spacing
- **Geist Sans:** The choice of a clean, geometric sans-serif ensures that even in a rustic theme, the application feels modern and highly legible.
- **Generous Spacing:** A spacious layout (using `xl` padding for containers) prevents the UI from feeling cluttered, reducing cognitive load for users looking for quick information like sauna instructions or boat safety.

### Iconography
Icons (provided via Lucide) should use the medium shades of the `lightGreen` scale to maintain a consistent visual weight without being overly distracting.

## Design Intent
The application serves as a bridge between the physical world of property management and the digital convenience of modern apps. Every design choice is made to ensure that "getting the job done"—whether that's checking a reservation or following an arrival guide—feels peaceful rather than stressful.
