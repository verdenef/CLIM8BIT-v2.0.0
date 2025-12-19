import { X } from 'lucide-react';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      category: "🌨️ ADVANCED WEATHER EFFECTS",
      items: [
        "Pixel art cloud system (Normal, Rain, Heavy types)",
        "5 cloud sizes (xs, s, m, l, xl) with variants",
        "Snow piling on ALL UI panels (≤5°C)",
        "Snowflake sprites + particle system",
        "Dynamic rain with fixed speed (realistic fall)",
        "Lightning GIF with glow effects",
        "Realistic fog & mist layers",
        "Windy leaf animations with sprite images",
        "Flood water rising at footer",
        "Wind streaks visualization"
      ]
    },
    {
      category: "🌙 NIGHT SKY FEATURES",
      items: [
        "Accurate moon phase tracking (astronomical calculation)",
        "32 lunar phases mapped from 8 images",
        "Manual moon phase selector in demo (0-31)",
        "Real-time phase calculation",
        "Meteor shower effects",
        "Twinkling stars effect",
        "Dynamic night sky gradients"
      ]
    },
    {
      category: "🎮 INTERACTIVE PHYSICS",
      items: [
        "Slippery cursor during snow/ice (≤5°C)",
        "Wind-blown cursor mechanics",
        "Floating cursor on flood water with gradual buoyancy",
        "Water friction during movement (15% slowdown - noticeable drag)",
        "Water friction applied during active mouse movement",
        "Gradual floating from submerged to surface (no snapping)",
        "Momentum & drift physics (60fps)",
        "Temperature-based physics activation",
        "Toggle cursor physics on/off"
      ]
    },
    {
      category: "🎨 VISUAL & UI DESIGN",
      items: [
        "Pixel art icons throughout (weather, temperature, etc.)",
        "All icons pixelated with CSS (image-rendering)",
        "Drop shadows & glow effects",
        "White flash transition (flashback effect)",
        "Dynamic day/night transitions",
        "Weather-responsive backgrounds",
        "Transparent blur panels",
        "Press Start 2P font throughout",
        "Hide UI toggle for screenshots",
        "Animated intro sequence (100s cycle)"
      ]
    },
    {
      category: "📊 DATA & CORE FEATURES",
      items: [
        "Real-time OpenWeather API integration",
        "5-day weather forecast with pixel icons",
        "City search with autocomplete (120+ cities)",
        "Geolocation support",
        "Weather alerts & safety tips",
        "City favorites/watchlist (max 3 cities)",
        "Recent searches history",
        "API key rotation system (4 keys)",
        "Temperature unit conversion (°C/°F)",
        "Comprehensive error handling with categorized messages"
      ]
    },
    {
      category: "👤 USER FEATURES",
      items: [
        "Laravel + Inertia.js authentication",
        "Session-based auth with CSRF protection",
        "User profile management (name, email)",
        "Password change functionality",
        "Account deletion",
        "Account settings modal",
        "Favorites management (add/remove)",
        "Search history tracking",
        "User preferences (temperature unit)",
        "Toast notifications (pixel-themed)"
      ]
    },
    {
      category: "🕹️ DEMO MODE CONTROLS",
      items: [
        "Manual weather type selection",
        "Day/night toggle",
        "Moon phase selector (32 phases)",
        "Independent effect toggles (windy, leaves, snow, clouds)",
        "Wind speed slider (0-100 km/h)",
        "Temperature slider",
        "Test all weather combinations",
        "Clear all effects button"
      ]
    },
    {
      category: "🖼️ PIXEL ART ASSETS",
      items: [
        "36 cloud images (3 types × 5 sizes × variants)",
        "32 moon phase images",
        "3 leaf sprite images",
        "5 snowflake sprite images",
        "Weather icons (clear day/night, cloudy, rain, storm, fog, cold)",
        "Temperature icons (hot/cold)",
        "UI icons (humidity, pressure, wind speed, umbrella)",
        "Lightning GIF with glow effect"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-4 border-white/20 rounded-lg shadow-2xl pixel-borders">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 border-b-4 border-white/30 p-6 flex items-center justify-between backdrop-blur-sm z-10">
          <div>
            <h2 className="text-white mb-2">CLIM8BIT FEATURES</h2>
            <p className="pixel-text-xs text-blue-100">
              PIXEL-PERFECT RETRO WEATHER EXPERIENCE
            </p>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-3 hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white pixel-icon" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Intro */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-400/30 rounded p-4">
            <p className="pixel-text-xs text-blue-100 leading-relaxed">
              CLIM8BIT is a pixel-perfect retro weather app featuring advanced 
              weather-responsive animations, interactive physics, and dynamic UI changes 
              based on real weather data from OpenWeather API.
            </p>
          </div>

          {/* Feature Categories */}
          {features.map((category, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="pixel-text-sm text-yellow-300 border-b-2 border-yellow-400/30 pb-2">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {category.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-start gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded p-3 transition-colors"
                  >
                    <span className="pixel-text-xs text-green-400 mt-0.5">▸</span>
                    <span className="pixel-text-xs text-gray-100 flex-1">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tech Stack */}
          <div className="border-t-2 border-white/10 pt-6 mt-8">
            <h3 className="pixel-text-sm text-cyan-300 mb-4">
              ⚡ TECH STACK
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Laravel', 'Inertia.js', 'OpenWeather API', 'Press Start 2P', 'MySQL', 'Vite'].map((tech) => (
                <span
                  key={tech}
                  className="pixel-text-xs bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 px-3 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Ready for Backend */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-400/30 rounded p-4">
            <h3 className="pixel-text-sm text-purple-300 mb-2">
              🔌 BACKEND READY
            </h3>
            <p className="pixel-text-xs text-purple-100 leading-relaxed">
              Fully integrated with Laravel backend using Inertia.js. Features session-based 
              authentication, CSRF protection, MySQL database, and RESTful API endpoints 
              for weather data, favorites, and user management.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-slate-800/95 to-slate-900/95 border-t-4 border-white/20 p-4 text-center backdrop-blur-sm">
          <p className="pixel-text-xs text-gray-400">
            CLIM8BIT © 2025 • PIXEL WEATHER EXPERIENCE
          </p>
        </div>
      </div>
    </div>
  );
}