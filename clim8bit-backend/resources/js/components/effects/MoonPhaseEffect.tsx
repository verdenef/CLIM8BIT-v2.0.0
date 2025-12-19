// All 32 moon phase frames from public/assets/images/moonFrames
const moonFrames: string[] = Array.from({ length: 32 }, (_, i) => {
  const index = i.toString().padStart(2, '0');
  return `/assets/images/moonFrames/moonPhase${index}.png`;
});
import { StarsEffect } from "./StarsEffect";


/**
 * 32 Moon Phase Names (for demo mode selection)
 * Each represents a specific point in the 29.53-day lunar cycle
 */
export const MOON_PHASE_NAMES = [
  "New Moon",              // 0
  "Waxing Crescent 1",     // 1
  "Waxing Crescent 2",     // 2
  "Waxing Crescent 3",     // 3
  "Waxing Crescent 4",     // 4
  "Waxing Crescent 5",     // 5
  "Waxing Crescent 6",     // 6
  "Waxing Crescent 7",     // 7
  "First Quarter",         // 8
  "Waxing Gibbous 1",      // 9
  "Waxing Gibbous 2",      // 10
  "Waxing Gibbous 3",      // 11
  "Waxing Gibbous 4",      // 12
  "Waxing Gibbous 5",      // 13
  "Waxing Gibbous 6",      // 14
  "Waxing Gibbous 7",      // 15
  "Full Moon",             // 16
  "Waning Gibbous 1",      // 17
  "Waning Gibbous 2",      // 18
  "Waning Gibbous 3",      // 19
  "Waning Gibbous 4",      // 20
  "Waning Gibbous 5",      // 21
  "Waning Gibbous 6",      // 22
  "Waning Gibbous 7",      // 23
  "Last Quarter",          // 24
  "Waning Crescent 1",     // 25
  "Waning Crescent 2",     // 26
  "Waning Crescent 3",     // 27
  "Waning Crescent 4",     // 28
  "Waning Crescent 5",     // 29
  "Waning Crescent 6",     // 30
  "Waning Crescent 7",     // 31
];

/**
 * Get the appropriate moon image for any phase (0-31)
 * Directly maps 32 phases to 32 sprite frames
 */
function getMoonImageForPhase(phase: number): string {
  const clamped = ((phase % 32) + 32) % 32;
  return moonFrames[clamped];
}

/**
 * Calculate current moon phase based on date
 * Returns a value from 0-31 representing the moon's position in its cycle
 */
function getMoonPhase(): number {
  const date = new Date();
  
  // Calculate days since known new moon (Jan 6, 2000)
  const knownNewMoon = new Date(2000, 0, 6);
  const daysSinceKnownNewMoon = Math.floor(
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Lunar cycle is approximately 29.53 days
  const lunarCycle = 29.53;
  const phase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;

  // Convert to 0-31 index (32 phases for more granular control)
  const phaseIndex = Math.floor(phase * 32) % 32;
  
  return phaseIndex;
}

interface MoonPhaseEffectProps {
  fadeOut?: boolean;
  overridePhase?: number; // Override for demo mode (0-31)
}

export function MoonPhaseEffect({ fadeOut, overridePhase }: MoonPhaseEffectProps) {
  // Use override phase if provided (demo mode), otherwise calculate real phase
  const phaseIndex = overridePhase !== undefined ? overridePhase : getMoonPhase();
  
  // Get the appropriate image for this phase
  const currentMoonImage = getMoonImageForPhase(phaseIndex);
  
  // Get the phase name for accessibility
  const phaseName = MOON_PHASE_NAMES[phaseIndex];

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Moon */}
      <div className="absolute top-20 right-20 w-64 h-64 flex items-center justify-center">
        {/* Pixel art moon with subtle glow */}
        <div className="relative w-64 h-64">
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(200, 220, 255, 0.6) 0%, transparent 70%)',
            }}
          />
          
          {/* Moon image */}
          <img
            src={currentMoonImage}
            alt={phaseName}
            className="relative w-full h-full"
            style={{
              imageRendering: "pixelated",
              filter: 'drop-shadow(0 0 20px rgba(200, 220, 255, 0.5))',
            }}
          />
        </div>
      </div>

      {/* Stars background */}
      <StarsEffect starCount={30} opacity={0.2} fadeOut={fadeOut} />
    </div>
  );
}

// Export the calculation function for use in other components
export { getMoonPhase };