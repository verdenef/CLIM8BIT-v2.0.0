import { useState, useEffect } from 'react';

type WeatherType = 'rainy' | 'thunderstorm' | 'clear-day' | 'clear-night' | 'hot' | 'snow' | 'cloudy' | 'foggy';

interface FloodEffectProps {
  weatherType: WeatherType;
  onWaterLevelChange?: (level: number) => void; // Callback to expose water level
}

export function FloodEffect({ weatherType, onWaterLevelChange }: FloodEffectProps) {
  const [waterLevel, setWaterLevel] = useState(0); // Percentage of viewport height (0-100)
  const [iceLevel, setIceLevel] = useState(0); // Ice percentage (0-100, represents how much water is frozen)
  const [isDraining, setIsDraining] = useState(false);
  
  // Different flood heights for rain vs storm
  const maxFloodPercent = weatherType === 'thunderstorm' ? 100 : weatherType === 'rainy' ? 15 : 0;
  
  // Notify parent component of water level changes
  useEffect(() => {
    if (onWaterLevelChange) {
      onWaterLevelChange(waterLevel);
    }
  }, [waterLevel, onWaterLevelChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDraining) {
        // Manual drain - only works on liquid water (not ice)
        if (iceLevel < 30) { // Can only drain if mostly liquid
          setWaterLevel((prev) => {
            const newLevel = prev - 0.5; // Drain speed
            if (newLevel <= 0) {
              setIsDraining(false);
              setIceLevel(0); // Reset ice when fully drained
              return 0;
            }
            return newLevel;
          });
          // Also reduce any remaining ice
          setIceLevel((prev) => Math.max(0, prev - 0.5));
        } else {
          // Can't drain ice - stop draining
          setIsDraining(false);
        }
      } else {
        // Weather-based effects
        switch (weatherType) {
          case 'rainy':
            // Rain fills water slowly
            setWaterLevel((prev) => {
              if (prev < maxFloodPercent) {
                return prev + 0.05; // Slow rise
              }
              return prev;
            });
            // Unfreeze any ice during rain
            setIceLevel((prev) => Math.max(0, prev - 0.3));
            break;
            
          case 'thunderstorm':
            // Storm fills water quickly
            setWaterLevel((prev) => {
              if (prev < maxFloodPercent) {
                return prev + 0.15; // Fast rise
              }
              return prev;
            });
            // Unfreeze any ice during storm
            setIceLevel((prev) => Math.max(0, prev - 0.5));
            break;
            
          case 'clear-day':
            // Clear day evaporates water slowly
            if (iceLevel < 30) { // Only evaporate if mostly liquid
              setWaterLevel((prev) => Math.max(0, prev - 0.02));
            }
            // Melt ice slowly during clear day
            if (iceLevel > 0) {
              setIceLevel((prev) => {
                const newIce = prev - 0.15;
                if (newIce <= 0) return 0;
                return newIce;
              });
            }
            break;
            
          case 'clear-night':
            // Clear night - no evaporation, but ice might melt very slowly
            if (iceLevel > 0) {
              setIceLevel((prev) => Math.max(0, prev - 0.02)); // Very slow melt
            }
            break;
            
          case 'hot':
            // Hot weather evaporates water quickly
            if (iceLevel < 30) {
              setWaterLevel((prev) => Math.max(0, prev - 0.1));
            }
            // Melt ice fast during hot weather
            if (iceLevel > 0) {
              setIceLevel((prev) => {
                const newIce = prev - 0.4;
                if (newIce <= 0) return 0;
                return newIce;
              });
            }
            break;
            
          case 'snow':
            // Snow gradually freezes water into ice - FASTER
            if (waterLevel > 0 && iceLevel < 100) {
              setIceLevel((prev) => {
                const freezeRate = 0.6; // Faster freeze rate
                const newIce = prev + freezeRate;
                return Math.min(100, newIce);
              });
            }
            break;
            
          case 'cloudy':
          case 'foggy':
            // Cloudy/foggy - slow evaporation
            if (iceLevel < 30) {
              setWaterLevel((prev) => Math.max(0, prev - 0.01));
            }
            // Slow ice melt
            if (iceLevel > 0) {
              setIceLevel((prev) => Math.max(0, prev - 0.05));
            }
            break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isDraining, weatherType, maxFloodPercent, iceLevel, waterLevel]);

  const toggleDrain = () => {
    setIsDraining(!isDraining);
  };

  // Don't show anything if no flood
  if (waterLevel < 1) {
    return null;
  }

  // Calculate ice opacity for gradual transition (0 = all liquid, 1 = all ice)
  const iceOpacity = iceLevel / 100;

  // Only show drain button for liquid water (not ice)
  const canDrain = iceLevel < 30;

  return (
    <>
      {/* Drain Button - Only show when water is mostly liquid (not frozen) */}
      {canDrain && (waterLevel > 5 || isDraining) && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={toggleDrain}
            className={`pixel-button px-6 py-3 ${isDraining ? 'bg-blue-500/30 border-blue-400/70' : 'bg-red-500/30 border-red-400/70'}`}
          >
            <span className="pixel-text-xs">
              {isDraining ? '🔓 DRAINING...' : '🚰 DRAIN WATER'}
            </span>
          </button>
        </div>
      )}

      {/* Flood Water/Ice - Rises from bottom to cover screen */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none transition-all duration-100"
        style={{ 
          height: `${waterLevel}vh`,
          willChange: 'height'
        }}
      >
        {/* Base water layer */}
        <div 
          className="w-full h-full relative overflow-hidden"
          style={{
            background: `linear-gradient(
              to top,
              rgba(30, 80, 180, ${0.7 * (1 - iceOpacity * 0.5)}) 0%,
              rgba(50, 100, 200, ${0.5 * (1 - iceOpacity * 0.5)}) 40%,
              rgba(70, 120, 220, ${0.3 * (1 - iceOpacity * 0.5)}) 70%,
              rgba(100, 150, 255, ${0.1 * (1 - iceOpacity * 0.5)}) 100%
            )`,
            willChange: 'auto'
          }}
        >
          {/* Gradual ice overlay - transitions from transparent to opaque ice */}
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: iceOpacity,
              background: `linear-gradient(
                to top,
                rgba(200, 230, 250, 0.85) 0%,
                rgba(220, 240, 255, 0.75) 40%,
                rgba(230, 245, 255, 0.6) 70%,
                rgba(240, 250, 255, 0.4) 100%
              )`
            }}
          >
            {/* Realistic ice surface texture - horizontal cracks and lines */}
            {iceOpacity > 0.2 && (
              <div className="absolute inset-0" style={{ opacity: iceOpacity * 0.3 }}>
                {/* Irregular ice cracks - not uniform */}
                {[...Array(Math.min(5, Math.floor(waterLevel / 15)))].map((_, i) => {
                  const randomOffset = Math.random() * 30;
                  const randomWidth = 40 + Math.random() * 50;
                  const randomLeft = Math.random() * 30;
                  return (
                    <div
                      key={`crack-${i}`}
                      className="absolute h-px bg-white/30"
                      style={{
                        top: `${15 + i * 18 + randomOffset}%`,
                        left: `${randomLeft}%`,
                        width: `${randomWidth}%`,
                        transform: `rotate(${-3 + Math.random() * 6}deg)`,
                        opacity: 0.3 + Math.random() * 0.4
                      }}
                    />
                  );
                })}
              </div>
            )}
            
            {/* Frosted surface effect at top of ice */}
            {iceOpacity > 0.5 && (
              <div 
                className="absolute top-0 left-0 right-0 h-12"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0))',
                  opacity: iceOpacity
                }}
              />
            )}
          </div>
          
          {/* Animated waves at the top of water - fade out as it freezes */}
          {iceOpacity < 0.7 && (
            <div className="absolute top-0 left-0 right-0 h-8" style={{ opacity: 1 - iceOpacity }}>
              <div className="flood-wave" style={{ animationDelay: '0s' }} />
              <div className="flood-wave" style={{ animationDelay: '1s' }} />
              <div className="flood-wave" style={{ animationDelay: '2s' }} />
            </div>
          )}
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
      `}</style>
    </>
  );
}