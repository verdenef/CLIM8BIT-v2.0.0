# Frontend UI System

**Purpose:** Manages the React-based user interface, weather particle animations, and retro pixel-art aesthetic.

## Architecture
- **Framework:** React 19 + TypeScript 5+ via Inertia.js (no traditional API calls needed for navigation).
- **Styling:** Tailwind CSS v4, custom CSS for GPU-accelerated particle animations (rain, snow, wind, fog).
- **Build Tool:** Vite 7.
- **Aesthetic:** 8-bit retro (Press Start 2P font, blur panels, pixel borders).

## Key Components
- `components/effects/`: Weather particle systems and interactive physics (`SlipperyCursor.tsx`).
- `components/ui/`: Reusable UI elements, `WeatherDisplay.tsx`, `SearchBar.tsx`.
- `Pages/`: Inertia routing page views.

## Behaviors
- **Animations:** CSS-driven to reduce JS overhead. `requestAnimationFrame` is strictly limited to physics calculations.
- **Demo Mode:** Allows manual toggling of weather types, moon phases, wind speed, and day/night.
