import { useEffect, useState } from 'react';

interface LeavesEffectProps {
  windSpeed?: number;
  fadeOut?: boolean; // For scene transitions
}

interface Leaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotationSpeed: number;
  swayAmount: number;
  variant: number; // which leaf sprite (0-2)
  initialY: number; // initial Y position offset (%)
}

export function LeavesEffect({ windSpeed = 15, fadeOut = false }: LeavesEffectProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    // Calculate number of leaves based on wind speed
    // Use a softer curve and a lower cap now that we're using real sprites
    // At 1 km/h: ~8 leaves, at 15 km/h: ~18, capped at 35
    const leafCount = Math.min(Math.max(Math.floor(windSpeed * 1.2), 8), 35);
    
    // Calculate duration based on wind speed
    // Formula: baseDuration = 80 / windSpeed
    // At 1 km/h: 80s (very slow)
    // At 8 km/h: 10s
    // At 15 km/h: 5.3s
    // At 25 km/h: 3.2s
    // At 50 km/h: 1.6s (very fast)
    const baseDuration = 80 / windSpeed;

    const leafVariants = [0, 1, 2];
    const leafImages = leafVariants.map(
      (i) => `/assets/images/leaves/leaf0${i}.png`
    );

    const leafElements = Array.from({ length: leafCount }, (_, i) => {
      const duration = baseDuration + Math.random() * (baseDuration * 0.4); // Add variation
      return {
        id: i,
        left: Math.random() * 100,
        // Random delay (0-2 seconds) so leaves don't all start in a straight line
        delay: Math.random() * 2,
        duration,
        size: 4 + Math.random() * 6, // 4-10px
        rotationSpeed: 2 + Math.random() * 4, // 2-6 seconds per rotation
        swayAmount: 50 + Math.random() * 100, // 50-150px horizontal movement
        variant: leafVariants[Math.floor(Math.random() * leafVariants.length)],
        // Random initial Y position (-10% to -30%) to scatter leaves vertically
        initialY: -10 - Math.random() * 20,
      };
    });
    setLeaves(leafElements);
  }, [windSpeed]);

  // Calculate horizontal drift based on wind speed
  // Formula: horizontalDrift = windSpeed * 3
  // At 1 km/h: 3px (barely noticeable)
  // At 8 km/h: 24px (light drift)
  // At 15 km/h: 45px (moderate)
  // At 25 km/h: 75px (strong)
  // At 50 km/h: 150px (extreme)
  const horizontalDrift = windSpeed * 3;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? 'opacity 2s ease-out' : 'none',
      }}
    >
      {leaves.map((leaf) => {
        const leafSrc = `/assets/images/leaves/leaf0${leaf.variant}.png`;
        return (
          <img
            key={leaf.id}
            src={leafSrc}
            alt="Falling leaf"
            className="absolute"
            style={{
              left: `${leaf.left}%`,
              top: `${leaf.initialY}%`,
              width: `${leaf.size * 4}px`,
              height: 'auto',
              // Only use leafFall for transform to avoid conflicts with a second animation
              animation: `leafFall ${leaf.duration}s linear ${leaf.delay}s infinite`,
              // custom properties consumed by keyframes
              '--sway-amount': `${leaf.swayAmount}px`,
              '--horizontal-drift': `${horizontalDrift}px`,
              imageRendering: 'pixelated',
              opacity: 1,
            } as React.CSSProperties}
          />
        );
      })}
      
      <style>{`
        @keyframes leafFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(25vh) translateX(calc(var(--sway-amount) / 2 + var(--horizontal-drift, 0px))) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--horizontal-drift, 0px))) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(calc(var(--sway-amount) / 2 + var(--horizontal-drift, 0px))) rotate(270deg);
          }
          100% {
            transform: translateY(120vh) translateX(calc(var(--horizontal-drift, 0px))) rotate(360deg);
          }
        }
        
        @keyframes leafRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}