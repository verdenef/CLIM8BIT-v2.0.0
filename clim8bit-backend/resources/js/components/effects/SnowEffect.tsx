import { useEffect, useState } from 'react';

/**
 * SnowEffect Component
 * 
 * Creates animated falling snowflakes with:
 * - Wind-based horizontal drift
 * - Swaying motion (side-to-side movement)
 * - Varying sizes for depth perception
 * - Random delays for natural appearance
 * 
 * Used when: Temperature <= 5°C or snow weather condition
 */

interface SnowEffectProps {
  windSpeed?: number;  // Wind speed affects horizontal drift
  fadeOut?: boolean;   // Smooth fade for demo mode transitions
}

/**
 * Each snowflake has these properties:
 * - left: Starting horizontal position (0-100%)
 * - delay: When it starts falling (stagger effect)
 * - duration: How long one fall cycle takes (8-15 seconds)
 * - size: Diameter in pixels (2-5px)
 * - swayAmount: How far it moves left/right (30-70px)
 */
type SnowflakeType = 'particle' | 'flake';

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  swayAmount: number;
  kind: SnowflakeType;
  spriteIndex?: number;
}

export function SnowEffect({ windSpeed = 0, fadeOut = false }: SnowEffectProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate 60 snow items: majority are simple particles, a few are sprite flakes
    const total = 60;
    const spriteCount = 12; // 12 decorative sprite flakes (rest are particles)
    const flakes: Snowflake[] = [];

    for (let i = 0; i < total; i++) {
      const isSprite = i < spriteCount;
      flakes.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 7,
        size: isSprite ? 8 + Math.random() * 6 : 2 + Math.random() * 3,
        swayAmount: 30 + Math.random() * 40,
        kind: isSprite ? 'flake' : 'particle',
        spriteIndex: isSprite ? Math.floor(Math.random() * 5) : undefined,
      });
    }
    setSnowflakes(flakes);
  }, []);

  // Wind pushes snow horizontally
  // windSpeed in km/h, multiplied by 2 for visible effect
  const horizontalDrift = windSpeed * 2;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? 'opacity 2s ease-out' : 'none',
      }}
    >
      {/* Render particles (small circles) and a few sprite snowflakes */}
      {snowflakes.map((flake) => {
        const commonStyle = {
          left: `${flake.left}%`,
          animation: `snowFall ${flake.duration}s linear ${flake.delay}s infinite`,
          '--sway-amount': `${flake.swayAmount}px`,
          '--horizontal-drift': `${horizontalDrift}px`,
          imageRendering: 'pixelated',
        } as React.CSSProperties;

        if (flake.kind === 'flake' && flake.spriteIndex !== undefined) {
          const src = `/assets/images/snowflakes/snowflake0${flake.spriteIndex}.png`;
          return (
            <img
              key={flake.id}
              src={src}
              alt="Snowflake"
              className="absolute top-[-10px]"
              style={{
                ...commonStyle,
                width: `${flake.size}px`,
                height: 'auto',
                opacity: 0.9,
                // Add a gentle spin in addition to falling
                animation: `snowFallSprite ${flake.duration}s linear ${flake.delay}s infinite`,
              }}
            />
          );
        }

        // Default: simple snow particle
        return (
          <div
            key={flake.id}
            className="absolute rounded-full bg-white top-[-10px]"
            style={{
              ...commonStyle,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: 0.9,
            }}
          />
        );
      })}
      
      <style>{`
        @keyframes snowFall {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(25vh) translateX(calc(var(--sway-amount) / 2 + var(--horizontal-drift, 0px)));
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--horizontal-drift, 0px)));
          }
          75% {
            transform: translateY(75vh) translateX(calc(var(--sway-amount) / 2 + var(--horizontal-drift, 0px)));
          }
          100% {
            transform: translateY(100vh) translateX(calc(var(--horizontal-drift, 0px)));
          }
        }

        /* Sprite flakes: fall + rotate */
        @keyframes snowFallSprite {
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
            transform: translateY(100vh) translateX(calc(var(--horizontal-drift, 0px))) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}