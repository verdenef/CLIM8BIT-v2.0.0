import { useEffect, useState } from "react";
import { RainEffect } from "./effects/RainEffect";
import { RainEffectContained } from "./effects/RainEffectContained";
import { SnowEffect } from "./effects/SnowEffect";
import { CloudsEffect } from "./effects/CloudsEffect";
import { LeavesEffect } from "./effects/LeavesEffect";
import { WindEffect } from "./effects/WindEffect";
import { ThunderstormEffect } from "./effects/ThunderstormEffect";
import { MeteorShowerEffect } from "./effects/MeteorShowerEffect";
import { StarsEffect } from "./effects/StarsEffect";

const moonPhase16 = "/assets/images/moonFrames/moonPhase16.png";
const sunImage = "/assets/images/icons/sun.png";

interface IntroPageProps {
  onStart: () => void;
  isExiting?: boolean;
}

export function IntroPage({
  onStart,
  isExiting = false,
}: IntroPageProps) {
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [cycleProgress, setCycleProgress] = useState(0); // 0-100, represents full 100-second cycle

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Animate the 100-second cycle (5 scenes × 20 seconds each)
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setCycleProgress((prev) => (prev + 0.1) % 100); // Complete cycle every 100 seconds (100 / 0.1 = 1000 updates * 100ms = 100000ms)
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(cycleInterval);
  }, []);

  // Calculate sun/moon positions (arc motion from left to right)
  const calculateCelestialPosition = (progress: number) => {
    // Convert progress to radians (0 to PI for half circle)
    const angle = (progress / 100) * Math.PI;
    
    // X position: 0% (left) to 100% (right)
    const x = progress;
    
    // Y position: Arc motion using sine (peak at middle)
    // Offset so it starts/ends below screen (-15%) and peaks at top (85%)
    const y = Math.sin(angle) * 100 - 15; // Goes from -15% (below screen) to 85% at peak, back to -15%
    
    return { x, y };
  };

  // Determine background gradient based on cycle progress
  const getBackgroundGradient = () => {
    // Helper function to interpolate between two RGB colors
    const interpolateColor = (color1: number[], color2: number[], t: number) => {
      return [
        Math.floor(color1[0] + (color2[0] - color1[0]) * t),
        Math.floor(color1[1] + (color2[1] - color1[1]) * t),
        Math.floor(color1[2] + (color2[2] - color1[2]) * t),
      ];
    };

    // Define color stops for each 20-second phase
    const clearDayTop = [135, 206, 235]; // #87ceeb - Clear day
    const clearDayBottom = [176, 212, 241]; // #b0d4f1
    
    const windyTop = [75, 115, 144]; // Darker blue-gray - Windy
    const windyBottom = [74, 81, 81]; // Dark gray
    
    const stormTop = [15, 15, 30]; // #0f0f1e - Storm
    const stormBottom = [26, 26, 46]; // #1a1a2e
    
    const snowTop = [203, 213, 225]; // #cbd5e1 - Snow (light gray)
    const snowBottom = [226, 232, 240]; // #e2e8f0
    
    const nightTop = [15, 15, 30]; // #0f0f1e - Night
    const nightBottom = [30, 30, 63]; // #1e1e3f

    let topColor: number[];
    let bottomColor: number[];

    // 0-20%: Clear Day with Sun (20 seconds)
    if (cycleProgress < 20) {
      if (cycleProgress < 17) {
        topColor = clearDayTop;
        bottomColor = clearDayBottom;
      } else {
        // Transition to windy in last 3 seconds
        const t = (cycleProgress - 17) / 3;
        topColor = interpolateColor(clearDayTop, windyTop, t);
        bottomColor = interpolateColor(clearDayBottom, windyBottom, t);
      }
    }
    // 20-40%: Strong Wind (20 seconds)
    else if (cycleProgress < 40) {
      if (cycleProgress < 37) {
        topColor = windyTop;
        bottomColor = windyBottom;
      } else {
        // Transition to storm in last 3 seconds
        const t = (cycleProgress - 37) / 3;
        topColor = interpolateColor(windyTop, stormTop, t);
        bottomColor = interpolateColor(windyBottom, stormBottom, t);
      }
    }
    // 40-60%: Heavy Storm (20 seconds)
    else if (cycleProgress < 60) {
      if (cycleProgress < 57) {
        topColor = stormTop;
        bottomColor = stormBottom;
      } else {
        // Transition to snow in last 3 seconds
        const t = (cycleProgress - 57) / 3;
        topColor = interpolateColor(stormTop, snowTop, t);
        bottomColor = interpolateColor(stormBottom, snowBottom, t);
      }
    }
    // 60-80%: Snow (20 seconds)
    else if (cycleProgress < 80) {
      if (cycleProgress < 77) {
        topColor = snowTop;
        bottomColor = snowBottom;
      } else {
        // Transition to night in last 3 seconds
        const t = (cycleProgress - 77) / 3;
        topColor = interpolateColor(snowTop, nightTop, t);
        bottomColor = interpolateColor(snowBottom, nightBottom, t);
      }
    }
    // 80-100%: Night with Moon (20 seconds)
    else {
      if (cycleProgress < 97) {
        topColor = nightTop;
        bottomColor = nightBottom;
      } else {
        // Transition back to clear day in last 3 seconds
        const t = (cycleProgress - 97) / 3;
        topColor = interpolateColor(nightTop, clearDayTop, t);
        bottomColor = interpolateColor(nightBottom, clearDayBottom, t);
      }
    }

    return `linear-gradient(to bottom, rgb(${topColor[0]}, ${topColor[1]}, ${topColor[2]}), rgb(${bottomColor[0]}, ${bottomColor[1]}, ${bottomColor[2]}))`;
  };

  // Determine which weather effects to show
  const getWeatherEffects = () => {
    // 0-20%: Clear day with sun - light leaves
    if (cycleProgress < 20) {
      // Use full opacity for leaves in the first scene so they aren't faint
      return { type: "clear", intensity: 1.0 };
    }
    // 20-40%: Strong wind with heavy leaves + wind effect
    else if (cycleProgress < 40) {
      return { type: "windy", intensity: 1.0 };
    }
    // 40-60%: Heavy Storm with rain and lightning
    else if (cycleProgress < 60) {
      return { type: "storm", intensity: 1.0 };
    }
    // 60-80%: Snow
    else if (cycleProgress < 80) {
      return { type: "snow", intensity: 1.0 };
    }
    // 80-100%: Night with moon
    else {
      return { type: "night", intensity: 0.5 };
    }
  };

  // Check if we're in a transition period (last 3 seconds of each scene)
  const isInTransition = () => {
    const sceneProgress = cycleProgress % 20;
    return sceneProgress >= 17; // Last 3 seconds of any 20-second scene
  };

  // Sun appears during first scene only (0-20%), normalize to 0-100 for full arc
  const sunProgress = cycleProgress < 20 ? Math.min((cycleProgress / 20) * 100, 98) : 100;
  const sunPos = calculateCelestialPosition(sunProgress);
  
  // Moon appears during last phase (80-100%), normalize to 0-100 for full arc
  const moonProgress = cycleProgress >= 80 ? Math.min(((cycleProgress - 80) / 20) * 100, 98) : 0;
  const moonPos = calculateCelestialPosition(moonProgress);
  
  const weatherEffect = getWeatherEffects();
  const showSun = cycleProgress < 20;
  const showMoon = cycleProgress >= 80;

  // Calculate opacity for smooth fade out
  const sunOpacity = cycleProgress < 18 ? 1 : cycleProgress < 20 ? (20 - cycleProgress) / 2 : 0;
  const moonOpacity = cycleProgress < 98 ? 1 : (100 - cycleProgress) / 2;

  return (
    <div
      onClick={onStart}
      className="fixed inset-0 flex items-center justify-center cursor-pointer z-[9999] overflow-hidden"
      style={{
        imageRendering: "pixelated",
        background: getBackgroundGradient(),
        // No CSS transition - relying on 100ms updates with interpolation for smoothness
      }}
    >
      {/* Weather Effects Mix */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Day time - occasional leaves */}
        {weatherEffect.type === "clear" && (
          <div className="absolute inset-0 overflow-hidden" style={{ opacity: weatherEffect.intensity }}>
            <LeavesEffect windSpeed={8} fadeOut={isInTransition()} />
          </div>
        )}

        {/* Strong wind with heavy leaves + wind effect */}
        {weatherEffect.type === "windy" && (
          <>
            <div className="absolute inset-0 overflow-hidden" style={{ opacity: weatherEffect.intensity }}>
              {/* Slightly lower windSpeed here so intro leaves aren't too fast */}
              <LeavesEffect windSpeed={15} fadeOut={isInTransition()} />
            </div>
            <WindEffect windSpeed={35} fadeOut={isInTransition()} />
          </>
        )}

        {/* Storm with rain and lightning */}
        {weatherEffect.type === "storm" && (
          <>
            <div className="absolute inset-0 overflow-hidden" style={{ opacity: weatherEffect.intensity }}>
              <RainEffect intensity="heavy" fadeOut={isInTransition()} />
            </div>
            <ThunderstormEffect />
          </>
        )}

        {/* Snow */}
        {weatherEffect.type === "snow" && (
          <div className="absolute inset-0 overflow-hidden" style={{ opacity: weatherEffect.intensity }}>
            <SnowEffect windSpeed={12} fadeOut={isInTransition()} />
          </div>
        )}

        {/* Twinkling stars - only during night */}
        {cycleProgress >= 80 && (
          <>
            <StarsEffect starCount={50} opacity={0.3} fadeOut={isInTransition()} />
            {/* Meteor shower during night */}
            <MeteorShowerEffect fadeOut={isInTransition()} />
          </>
        )}

        {/* Clouds moving across - behind sun */}
        <div className="absolute inset-0 opacity-30">
          <CloudsEffect cloudCount={3} zIndex={2} />
        </div>
      </div>

      {/* Animated Sun */}
      {showSun && (
        <div
          className="absolute z-[10] pointer-events-none"
          style={{
            left: `${sunPos.x}%`,
            bottom: `${sunPos.y}%`,
            transform: "translate(-50%, 50%)",
            transition: "left 0.3s linear, bottom 0.3s linear", // Smooth linear transition
            width: "250px", // Fixed container dimensions
            height: "250px",
          }}
        >
          <img
            src={sunImage}
            alt="Sun"
            style={{
              width: "250px", // Fixed image dimensions
              height: "250px",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))",
              opacity: sunOpacity,
              transition: "opacity 1s ease-out",
              animation: "sunRayRotate 20s linear infinite", // Rotating sun rays
              display: "block", // Prevent inline spacing issues
            }}
          />
        </div>
      )}

      {/* Animated Moon */}
      {showMoon && (
        <div
          className="absolute z-[5] pointer-events-none"
          style={{
            left: `${moonPos.x}%`,
            bottom: `${moonPos.y}%`,
            transform: "translate(-50%, 50%)",
            transition: "left 0.3s linear, bottom 0.3s linear", // Smooth linear transition
          }}
        >
          <div className="relative w-48 h-48">
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(200, 220, 255, 0.6) 0%, transparent 70%)",
              }}
            />

            {/* Moon image */}
            <img
              src={moonPhase16}
              alt="Moon"
              className="relative w-full h-full"
              style={{
                imageRendering: "pixelated",
                filter: "drop-shadow(0 0 20px rgba(200, 220, 255, 0.5))",
                opacity: moonOpacity,
                transition: "opacity 1s ease-out",
              }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Title */}
        <h1 className="pixel-title text-white mb-2 text-4xl md:text-6xl drop-shadow-lg animate-pulse-slow">
          CLIM8BIT
        </h1>

        <div className="pixel-text-xs text-cyan-300 mb-8 tracking-wider">
          RETRO WEATHER FORECAST
        </div>

        {/* Feature list */}
        <div className="mb-12 space-y-2 max-w-md mx-auto">
          <div className="pixel-text-xs text-white/80 flex items-center justify-center gap-2">
            DYNAMIC WEATHER EFFECTS
          </div>
          <div className="pixel-text-xs text-white/80 flex items-center justify-center gap-2 text-center">
            PIXEL-PERFECT RETRO UI
          </div>
          <div className="pixel-text-xs text-white/80 flex items-center justify-center gap-2">
            REAL-TIME WEATHER DATA
          </div>
          <div className="pixel-text-xs text-white/80 flex items-center justify-center gap-2 text-center">
            5-DAY FORECAST
          </div>
        </div>

        {/* Click to start */}
        <div
          className={`pixel-text-xs text-white transition-opacity duration-300 ${blinkVisible ? "opacity-100" : "opacity-0"}`}
        >
          [ CLICK TO START ]
        </div>

        {/* Version */}
        <div className="mt-8 pixel-text-xs text-white/30 text-[10px]">
          v2.0.0 • POWERED BY OPENWEATHER API
        </div>
      </div>

      {/* CSS animation for sun rays rotation */}
      <style>{`
        @keyframes sunRayRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}