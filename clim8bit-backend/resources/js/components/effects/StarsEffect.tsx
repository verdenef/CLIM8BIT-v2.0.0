import { useEffect, useState } from 'react';

interface StarsEffectProps {
  starCount?: number;
  opacity?: number;
  fadeOut?: boolean;
}

interface Star {
  id: number;
  left: number;
  top: number;
  delay: number;
  size: number;
  brightness: number;
}

export function StarsEffect({
  starCount = 30,
  opacity = 0.2,
  fadeOut = false,
}: StarsEffectProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate stars scattered across entire background
    const newStars = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Scattered across full width: 0-100%
      top: Math.random() * 100, // Scattered across full height: 0-100%
      delay: -(Math.random() * duration), // Negative delay so all stars are already moving
      size: 1 + Math.random() * 2, // Random size 1-3px
      brightness: 0.6 + Math.random() * 0.4, // Random brightness 0.6-1.0
    }));
    setStars(newStars);
  }, [starCount]);

  // All stars move at same speed - 20 seconds for diagonal drift
  const duration = 20;

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-[3000ms] ${fadeOut ? "opacity-0" : ""}`}
        style={{ opacity: fadeOut ? 0 : opacity }}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.brightness,
              animation: `starDrift ${duration}s linear ${star.delay}s infinite`,
              imageRendering: 'pixelated',
            }}
          />
        ))}
      </div>

      {/* CSS animation - diagonal drift (straight line, no zigzag) */}
      <style>{`
        @keyframes starDrift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100vw, 100vh);
          }
        }
      `}</style>
    </>
  );
}