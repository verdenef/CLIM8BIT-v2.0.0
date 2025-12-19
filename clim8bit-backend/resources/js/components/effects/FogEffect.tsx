interface FogEffectProps {
  windSpeed?: number; // km/h
}

export function FogEffect({ windSpeed = 15 }: FogEffectProps) {
  // Calculate fog animation duration based on wind speed
  // Ensure minimum wind speed of 1 to prevent division by zero
  // Formula: baseDuration = 1200 / windSpeed
  // At 1 km/h: 1200s (very slow, almost imperceptible)
  // At 15 km/h: 80s (moderate drift)
  // At 30 km/h: 40s (noticeable movement)
  // At 50 km/h: 24s (faster drift)
  const effectiveWindSpeed = Math.max(windSpeed, 1);
  const baseDuration = 1200 / effectiveWindSpeed;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(200, 200, 200, 0.6) 50%, transparent 100%)',
            filter: 'blur(40px)',
            animationName: 'fogDrift',
            animationDuration: `${baseDuration + i * 10}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${i * 2}s`,
            opacity: 0.3 - i * 0.08
          }}
        />
      ))}
      
      <style>{`
        @keyframes fogDrift {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}