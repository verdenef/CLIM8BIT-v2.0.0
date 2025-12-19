import { useEffect, useState } from 'react';

interface RainEffectProps {
  intensity?: 'normal' | 'heavy';
  isWindy?: boolean;
  windSpeed?: number;
  fadeOut?: boolean; // For scene transitions
}

interface Raindrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export function RainEffect({ intensity = 'normal', isWindy = false, windSpeed = 15, fadeOut = false }: RainEffectProps) {
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);

  useEffect(() => {
    // Calculate intensity multiplier based on wind speed
    // Wind speed ranges: 0-25 km/h (calm), 25-50 km/h (moderate), 50+ km/h (strong)
    const windMultiplier = windSpeed > 50 ? 1.8 : windSpeed > 35 ? 1.5 : windSpeed > 25 ? 1.3 : 1.0;
    
    const baseCount = intensity === 'heavy' ? 150 : 100; // Increased from 120/80 for more intensity
    const count = Math.floor(baseCount * windMultiplier);
    
    // Fixed realistic fall speed for rain - wind speed only affects horizontal angle, not vertical speed
    // Normal rain: 1.5 seconds (realistic fall speed)
    // Heavy rain: 0.8 seconds (faster, more intense)
    const baseDuration = intensity === 'heavy' ? 0.8 : 1.5;
    
    const drops = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: baseDuration + Math.random() * (baseDuration * 0.2) // Add slight variation (20% instead of 30%)
    }));
    setRaindrops(drops);
  }, [intensity, isWindy, windSpeed]);

  // Calculate horizontal displacement based on wind speed
  // Formula: horizontalDisplacement = windSpeed * 1.5
  // At 1 km/h: 1.5px (barely noticeable)
  // At 15 km/h: 22.5px (light angle)
  // At 30 km/h: 45px (moderate angle)
  // At 50 km/h: 75px (strong angle)
  // At 100 km/h: 150px (extreme horizontal rain)
  const horizontalDisplacement = windSpeed * 1.5;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? 'opacity 2s ease-out' : 'none',
      }}
    >
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-[2px] h-5 top-[-20px]"
          style={{
            left: `${drop.left}%`,
            background: 'linear-gradient(transparent, rgba(200, 220, 255, 0.8))',
            animation: `rainDynamic ${drop.duration}s linear infinite`,
            animationDelay: `${drop.delay}s`,
            '--rain-horizontal': `${horizontalDisplacement}px`,
          } as React.CSSProperties}
        />
      ))}
      
      <style>{`
        @keyframes rainDynamic {
          0% {
            transform: translateY(0) translateX(0);
          }
          100% {
            transform: translateY(100vh) translateX(var(--rain-horizontal, 0px));
          }
        }
      `}</style>
    </div>
  );
}