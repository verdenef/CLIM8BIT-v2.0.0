import { X } from 'lucide-react';
import type { WeatherType } from '@/Pages/Weather/Index';
import { MOON_PHASE_NAMES } from './effects/MoonPhaseEffect';

interface DemoControlsProps {
  currentWeather: WeatherType;
  onWeatherChange: (weather: WeatherType) => void;
  isNight: boolean;
  moonPhase: number | null;
  onMoonPhaseChange: (phase: number | null) => void;
  demoIsNight: boolean;
  onDemoNightToggle: () => void;
  demoWindy: boolean;
  onDemoWindyToggle: () => void;
  demoLeaves: boolean;
  onDemoLeavesToggle: () => void;
  demoSnow: boolean;
  onDemoSnowToggle: () => void;
  demoClouds: boolean;
  onDemoCloudsToggle: () => void;
  demoWindSpeed: number;
  onDemoWindSpeedChange: (speed: number) => void;
  onClearEffects: () => void;
}

export function DemoControls({ 
  currentWeather, 
  onWeatherChange, 
  isNight,
  moonPhase,
  onMoonPhaseChange,
  demoIsNight,
  onDemoNightToggle,
  demoWindy,
  onDemoWindyToggle,
  demoLeaves,
  onDemoLeavesToggle,
  demoSnow,
  onDemoSnowToggle,
  demoClouds,
  onDemoCloudsToggle,
  demoWindSpeed,
  onDemoWindSpeedChange,
  onClearEffects
}: DemoControlsProps) {
  // Get weather icon path for pixel art icons
  const getWeatherIconPath = (weatherType: WeatherType): string => {
    switch (weatherType) {
      case 'clear-day':
        return '/assets/images/icons/weatherIcons/weatherClearDay.png';
      case 'clear-night':
        return '/assets/images/icons/weatherIcons/weatherClearNight.png';
      case 'rainy':
        return '/assets/images/icons/weatherIcons/weatherRain.png';
      case 'thunderstorm':
        return '/assets/images/icons/weatherIcons/weatherStorm.png';
      case 'snow':
        return '/assets/images/icons/weatherIcons/weatherCold.png';
      case 'hot':
        return '/assets/images/icons/weatherIcons/weatherClearDay.png';
      case 'foggy':
        return '/assets/images/icons/weatherIcons/weatherFog.png';
      case 'cloudy':
        return '/assets/images/icons/weatherIcons/weatherCloudy.png';
      default:
        return '/assets/images/icons/weatherIcons/weatherClearDay.png';
    }
  };

  const weatherOptions: { type: WeatherType; label: string }[] = [
    { type: isNight ? 'clear-night' : 'clear-day', label: 'CLEAR' },
    { type: 'rainy', label: 'RAIN' },
    { type: 'thunderstorm', label: 'STORM' },
    { type: 'snow', label: 'SNOW' },
    { type: 'hot', label: 'HOT' },
    { type: 'foggy', label: 'FOG' },
    { type: 'cloudy', label: 'CLOUDY' }
  ];

  return (
    <div className="relative z-50 p-4 md:p-8 pt-0">
      <div className="max-w-6xl mx-auto">
        <div className="pixel-panel p-4 md:p-6">
          <div className="pixel-text-xs text-yellow-300 mb-4" style={{ animation: 'gentlePulse 3s ease-in-out infinite' }}>
            ⚡ DEMO MODE - {isNight ? 'NIGHT' : 'DAY'} MODE - TEST WEATHER EFFECTS
          </div>
          
          {/* Weather Type Selector */}
          <div className="pixel-text-xs text-white/70 mb-3">
            WEATHER TYPE
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            {weatherOptions.map(({ type, label }) => {
              // Check if this is the active weather (accounting for clear-day/clear-night variations)
              const isActive = currentWeather === type || 
                ((currentWeather === 'clear-day' || currentWeather === 'clear-night') && 
                 (type === 'clear-day' || type === 'clear-night'));
              
              const iconPath = getWeatherIconPath(type);
              
              return (
                <button
                  key={type}
                  onClick={() => onWeatherChange(type)}
                  className={`pixel-button flex-1 min-w-[120px] ${isActive ? 'pixel-button-active' : ''}`}
                >
                  <img 
                    src={iconPath} 
                    alt={label}
                    className="w-5 h-5 object-contain pixel-icon"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="pixel-text-xs">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Moon Phase Selector - Only show during clear night */}
          {currentWeather === 'clear-night' && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="pixel-text-xs text-white mb-3 flex items-center justify-between">
                <span>🌙 MOON PHASE</span>
                <button
                  onClick={() => onMoonPhaseChange(null)}
                  className="pixel-text-xs text-cyan-300 hover:text-cyan-100 transition-colors"
                >
                  [RESET TO AUTO]
                </button>
              </div>
              
              {/* Moon Phase Dropdown */}
              <select
                value={moonPhase ?? -1}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  onMoonPhaseChange(value === -1 ? null : value);
                }}
                className="w-full pixel-panel p-3 pixel-text-xs text-white bg-black/30 border-2 border-white/20 hover:border-white/40 focus:border-cyan-300 focus:outline-none transition-colors cursor-pointer"
                style={{ imageRendering: 'pixelated' }}
              >
                <option value={-1} className="bg-gray-900">AUTO (Real Moon Phase)</option>
                {MOON_PHASE_NAMES.map((name, index) => (
                  <option key={index} value={index} className="bg-gray-900">
                    {index} - {name}
                  </option>
                ))}
              </select>
              
              {moonPhase !== null && (
                <div className="mt-3 pixel-text-xs text-cyan-200">
                  Selected: {MOON_PHASE_NAMES[moonPhase]}
                </div>
              )}
            </div>
          )}
          
          {/* Additional Demo Controls */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="pixel-text-xs text-white/70 mb-4">
              WEATHER EFFECTS TOGGLE
            </div>
            
            {/* Toggle Buttons - Horizontal Layout */}
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Day/Night Toggle */}
              <button
                type="button"
                onClick={onDemoNightToggle}
                className={`pixel-button flex-1 min-w-[120px] flex items-center justify-center gap-2 ${demoIsNight ? "bg-blue-900/30 border-blue-400/50" : "bg-yellow-500/20 border-yellow-400/50"}`}
              >
                <img 
                  src={demoIsNight ? "/assets/images/icons/weatherIcons/weatherClearNight.png" : "/assets/images/icons/weatherIcons/weatherClearDay.png"}
                  alt={demoIsNight ? "Night" : "Day"}
                  className="w-5 h-5 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="pixel-text-xs">
                  {demoIsNight ? "NIGHT" : "DAY"}
                </span>
              </button>

              {/* Windy Toggle */}
              <button
                type="button"
                onClick={onDemoWindyToggle}
                className={`pixel-button flex-1 min-w-[120px] flex items-center justify-center gap-2 ${demoWindy ? "pixel-button-active bg-green-500/20 border-green-400/50" : ""}`}
              >
                <img 
                  src="/assets/images/icons/windSpeed.png"
                  alt="Windy"
                  className="w-5 h-5 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="pixel-text-xs">
                  WINDY
                </span>
              </button>

              {/* Leaves Toggle */}
              <button
                type="button"
                onClick={onDemoLeavesToggle}
                className={`pixel-button flex-1 min-w-[120px] flex items-center justify-center gap-2 ${demoLeaves ? "pixel-button-active bg-green-600/20 border-green-500/50" : ""}`}
                disabled={demoIsNight}
              >
                <img 
                  src="/assets/images/leaves/leaf02.png"
                  alt="Leaves"
                  className="w-5 h-5 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="pixel-text-xs">
                  LEAVES
                </span>
              </button>

              {/* Snow Toggle */}
              <button
                type="button"
                onClick={onDemoSnowToggle}
                className={`pixel-button flex-1 min-w-[120px] flex items-center justify-center gap-2 ${demoSnow ? "pixel-button-active bg-blue-400/20 border-blue-300/50" : ""}`}
              >
                <img 
                  src="/assets/images/snowflakes/snowflake04.png"
                  alt="Snow"
                  className="w-5 h-5 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="pixel-text-xs">
                  SNOW
                </span>
              </button>

              {/* Clouds Toggle */}
              <button
                type="button"
                onClick={onDemoCloudsToggle}
                className={`pixel-button flex-1 min-w-[120px] flex items-center justify-center gap-2 ${demoClouds ? "pixel-button-active bg-gray-500/20 border-gray-400/50" : ""}`}
              >
                <img 
                  src="/assets/images/icons/weatherIcons/weatherCloudy.png"
                  alt="Clouds"
                  className="w-5 h-5 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="pixel-text-xs">
                  CLOUDS
                </span>
              </button>

              {/* Clear All Effects Button */}
              {(demoWindy || demoLeaves || demoSnow || demoClouds) && (
                <button
                  type="button"
                  onClick={onClearEffects}
                  className="pixel-button flex-1 min-w-[120px] bg-red-500/20 border-red-400/50 hover:bg-red-500/30"
                >
                  <X size={16} className="pixel-icon" />
                  <span className="pixel-text-xs">
                    CLEAR
                  </span>
                </button>
              )}
            </div>

            {/* Wind Speed Slider - Only when Windy is active */}
            {demoWindy && (
              <div className="mt-4 pt-4 border-t-2 border-white/10">
                <div className="flex items-center gap-4">
                  <span className="pixel-text-xs text-white/70 whitespace-nowrap">
                    💨 WIND SPEED:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={demoWindSpeed}
                    onChange={(e) => onDemoWindSpeedChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <span className="pixel-text-xs text-white font-bold min-w-[60px] text-right">
                    {demoWindSpeed} KM/H
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}