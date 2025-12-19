import { useEffect, useState } from 'react';

interface WindStreak {
  id: number;
  top: string;
  left: string;
  width: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface WindEffectProps {
  windSpeed?: number; // km/h
}

export function WindEffect({ windSpeed = 30 }: WindEffectProps) {
  const [windStreaks, setWindStreaks] = useState<WindStreak[]>([]);

  // Calculate duration based on wind speed
  // Formula: baseDuration = 90 / windSpeed
  // At 15 km/h: 6s (slow)
  // At 30 km/h: 3s (moderate - default)
  // At 50 km/h: 1.8s (fast)
  // At 100 km/h: 0.9s (super fast!)
  const baseDuration = 90 / windSpeed;

  useEffect(() => {
    const streaks: WindStreak[] = [];
    
    // Create 15 wind streaks
    for (let i = 0; i < 15; i++) {
      streaks.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `-${Math.random() * 20 + 10}%`,
        width: Math.random() * 80 + 40, // 40-120px
        delay: Math.random() * (baseDuration * 0.8),
        duration: baseDuration + Math.random() * (baseDuration * 0.5), // Variation based on wind speed
        opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4
      });
    }
    
    setWindStreaks(streaks);
  }, [windSpeed, baseDuration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {windStreaks.map((streak) => (
        <div
          key={streak.id}
          className="absolute h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            top: streak.top,
            left: streak.left,
            width: `${streak.width}px`,
            opacity: streak.opacity,
            animation: `windStreak ${streak.duration}s linear ${streak.delay}s infinite`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes windStreak {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity);
          }
          90% {
            opacity: var(--opacity);
          }
          100% {
            transform: translateX(calc(100vw + 200px)) translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
