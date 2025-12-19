import { useEffect, useState } from 'react';

interface RainEffectContainedProps {
  intensity?: 'normal' | 'heavy';
  windSpeed?: number;
}

interface Raindrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export function RainEffectContained({ intensity = 'normal', windSpeed = 15 }: RainEffectContainedProps) {
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);

  useEffect(() => {
    const windMultiplier = windSpeed > 50 ? 1.8 : windSpeed > 35 ? 1.5 : windSpeed > 25 ? 1.3 : 1.0;
    
    const baseCount = intensity === 'heavy' ? 100 : 50;
    const count = Math.floor(baseCount * windMultiplier);
    
    const baseDuration = (intensity === 'heavy' ? 30 : 60) / windSpeed;
    
    const drops = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: baseDuration + Math.random() * (baseDuration * 0.3)
    }));
    setRaindrops(drops);
  }, [intensity, windSpeed]);

  const horizontalDisplacement = windSpeed * 1.5;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-[2px] h-5 top-[-20px]"
          style={{
            left: `${drop.left}%`,
            background: 'linear-gradient(transparent, rgba(200, 220, 255, 0.8))',
            animation: `rainContained ${drop.duration}s linear infinite`,
            animationDelay: `${drop.delay}s`,
            '--rain-horizontal': `${horizontalDisplacement}px`,
          } as React.CSSProperties}
        />
      ))}
      
      <style>{`
        @keyframes rainContained {
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
