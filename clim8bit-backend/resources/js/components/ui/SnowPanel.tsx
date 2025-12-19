import { ReactNode, useState, useEffect } from "react";
import type { WeatherType } from "@/Pages/Weather/Index";

interface SnowPanelProps {
  children: ReactNode;
  className?: string;
  weather: WeatherType;
  temperature?: number; // Optional temperature prop
}

export function SnowPanel({
  children,
  className = "",
  weather,
  temperature,
}: SnowPanelProps) {
  // Animated snow accumulation state
  const [snowHeight, setSnowHeight] = useState(0);
  const maxSnowHeight = 16; // Maximum height in pixels

  useEffect(() => {
    const interval = setInterval(() => {
      // Weather-based snow accumulation and melting logic
      switch (weather) {
        case "snow":
          // Snow accumulates during snowing
          setSnowHeight((prev) => {
            if (prev >= maxSnowHeight) return maxSnowHeight;
            return prev + 0.5; // Slow accumulation
          });
          break;

        case "hot":
          // Hot weather melts snow quickly
          setSnowHeight((prev) => Math.max(0, prev - 1.2)); // Fast melt
          break;

        case "clear-day":
          // Clear day melts snow moderately
          setSnowHeight((prev) => Math.max(0, prev - 0.4));
          break;

        case "clear-night":
          // Clear night preserves snow (very slow melt if warm)
          if (temperature !== undefined && temperature > 5) {
            setSnowHeight((prev) => Math.max(0, prev - 0.1)); // Very slow melt
          }
          // Otherwise preserve snow (no change)
          break;

        case "rainy":
        case "thunderstorm":
          // Rain melts snow faster
          setSnowHeight((prev) => Math.max(0, prev - 0.8));
          break;

        case "foggy":
          // Foggy weather - accumulate snow if very cold, slow melt if warm, preserve if moderately cold
          if (temperature !== undefined && temperature < 0) {
            // Accumulate snow in freezing fog
            setSnowHeight((prev) => {
              if (prev >= maxSnowHeight) return maxSnowHeight;
              return prev + 0.3; // Slower than snow weather, but still accumulates
            });
          } else if (temperature !== undefined && temperature > 5) {
            setSnowHeight((prev) => Math.max(0, prev - 0.2));
          }
          break;

        case "cloudy":
          // Cloudy weather preserves snow if cold, slow melt if warm
          if (temperature !== undefined && temperature > 10) {
            setSnowHeight((prev) => Math.max(0, prev - 0.15));
          }
          break;

        default:
          // No change for other conditions
          break;
      }
    }, 300); // Update every 300ms

    return () => clearInterval(interval);
  }, [weather, temperature]);

  const shouldShowMoistPanel =
    weather === "snow" ||
    (temperature !== undefined && temperature <= 5) ||
    snowHeight > 0; // Keep moist appearance while snow is present

  // Determine if snow is actively melting
  const isMelting =
    snowHeight > 0 &&
    (weather === "hot" ||
      weather === "clear-day" ||
      weather === "rainy" ||
      weather === "thunderstorm" ||
      (weather === "foggy" &&
        temperature !== undefined &&
        temperature > 5) ||
      (weather === "cloudy" &&
        temperature !== undefined &&
        temperature > 10));

  return (
    <div
      className={`pixel-panel ${shouldShowMoistPanel ? "moist-panel" : ""} ${className}`}
    >
      {snowHeight > 0 && (
        <>
          {/* Animated snow pile on top - grows from bottom */}
          <div
            className="absolute left-3 right-3 bg-white/90 transition-all duration-300"
            style={{
              top: `-${snowHeight + 1}px`,
              height: `${snowHeight}px`,
              clipPath:
                "polygon(0% 100%, 5% 90%, 10% 80%, 15% 85%, 20% 75%, 25% 80%, 30% 70%, 35% 75%, 40% 65%, 45% 70%, 50% 60%, 55% 70%, 60% 65%, 65% 75%, 70% 70%, 75% 80%, 80% 75%, 85% 85%, 90% 80%, 95% 90%, 100% 100%)",
              imageRendering: "pixelated",
              boxShadow:
                "0 2px 8px rgba(255, 255, 255, 0.5), inset 0 -2px 4px rgba(200, 220, 255, 0.3)",
              filter:
                "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
            }}
          >
            {/* Melting drips when snow is melting */}
            {isMelting && snowHeight > 5 && (
              <>
                {[
                  ...Array(
                    Math.min(5, Math.floor(snowHeight / 3)),
                  ),
                ].map((_, i) => (
                  <div
                    key={`melt-drip-${i}`}
                    className="absolute w-0.5 h-3 bg-blue-400/60 rounded-full"
                    style={{
                      bottom: "-12px",
                      left: `${15 + i * 18}%`,
                      animation:
                        "snowMeltDrip 2s ease-in infinite",
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Snow pile on bottom left corner */}
          {snowHeight > 0 && (
            <div
              className="absolute bottom-0 left-1.5 bg-white/80 transition-all duration-300"
              style={{
                width: `${Math.min(snowHeight * 4, 64)}px`,
                height: `${Math.min(snowHeight / 2, 16)}px`,
                clipPath:
                  "polygon(5% 100%, 100% 100%, 50% 0, 20% 40%)",
                imageRendering: "pixelated",
                filter:
                  "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
                opacity: Math.min(snowHeight / 8, 1), // Fade in gradually
              }}
            />
          )}

          {/* Snow pile on bottom right corner */}
          {snowHeight > 0 && (
            <div
              className="absolute bottom-0 right-2 bg-white/80 transition-all duration-300"
              style={{
                width: `${Math.min(snowHeight * 4, 64)}px`,
                height: `${Math.min(snowHeight / 2, 16)}px`,
                clipPath:
                  "polygon(0% 100%, 100% 100%, 80% 40%, 10% 0)",
                imageRendering: "pixelated",
                filter:
                  "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
                opacity: Math.min(snowHeight / 8, 1), // Fade in gradually
              }}
            />
          )}
        </>
      )}
      {children}

      {/* Melting animation styles */}
      {isMelting && (
        <style>{`
          @keyframes snowMeltDrip {
            0% {
              transform: translateY(0) scaleY(1);
              opacity: 0.7;
            }
            100% {
              transform: translateY(30px) scaleY(1.5);
              opacity: 0;
            }
          }
        `}</style>
      )}
    </div>
  );
}