import { useEffect, useState, useRef } from "react";

/**
 * SlipperyCursor Component
 * 
 * Creates an interactive cursor with realistic physics that responds to weather:
 * 
 * 1. SLIPPERY MODE (Snow/Ice): Cursor has momentum and slides like on ice
 * 2. WIND MODE: Cursor is blown across screen, wraps around edges
 * 3. FLOOD MODE: Cursor floats and bobs on water surface
 * 
 * Physics concepts used:
 * - Velocity: Speed and direction of cursor movement
 * - Friction: Slows down cursor (less friction = more slippery)
 * - Gravity: Pulls cursor down when idle
 * - Buoyancy: Pushes cursor up when in water
 * - Easing: Smoothly follows mouse position
 * 
 * How it works:
 * - While mouse moves: Cursor follows with easing (delay effect)
 * - When mouse stops: Physics simulation takes over
 * - requestAnimationFrame: Updates position 60 times per second
 */

interface SlipperyCursorProps {
  isActive: boolean;        // Slippery physics when true (temp <= 5°C)
  floodLevel?: number;      // Water height from bottom (0-100)
  isWindy?: boolean;        // Wind effect active
  windSpeed?: number;       // Wind strength in km/h
  physicsEnabled?: boolean; // Master toggle for all physics
}

export function SlipperyCursor({
  isActive,
  floodLevel = 0,
  isWindy = false,
  windSpeed = 0,
  physicsEnabled = true,
}: SlipperyCursorProps) {
  // Mouse position (where user moved mouse to)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Actual cursor position (follows mouse with physics)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  // Use refs for values that update every frame (avoids re-renders)
  const velocityRef = useRef({ x: 0, y: 0 });           // Current speed/direction
  const isFloatingRef = useRef(false);                  // Is cursor on water?
  const wasIdleRef = useRef(false);                     // Was mouse idle last frame?
  const animationFrameRef = useRef<number | null>(null); // Animation loop ID
  const lastMouseMoveTime = useRef(Date.now());         // When mouse last moved
  const lastCursorPos = useRef({ x: 0, y: 0 });         // Previous cursor position

  /**
   * PHYSICS CONSTANTS
   * Adjust these to change how cursor behaves
   */
  const GRAVITY = 0.15;                  // How fast cursor falls (pixels per frame²)
  const WIND_FORCE_MULTIPLIER = 0.003;   // How much wind pushes cursor
  const WIND_VERTICAL_VARIATION = 0.4;   // Vertical bobbing in wind
  const WIND_TURBULENCE = 0.15;          // Random wind gusts
  const WIND_UPDRAFT = 0.15;             // Upward wind gusts
  const WIND_GRAVITY_REDUCTION = 0.05;   // Reduced gravity in wind (5%)
  const FLOOD_BUOYANCY = 0.12;          // Upward force in water (slightly more than gravity for slow float)
  const AIR_FRICTION = 0.98;             // Air resistance (2% slowdown per frame)
  const ICE_FRICTION = 0.985;            // Ice friction (1.5% slowdown - very slippery!)
  const WATER_FRICTION = 0.85;           // Water resistance (15% slowdown - very noticeable!)

  /**
   * MOUSE TRACKING
   * Updates when user moves mouse
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const timeSinceLastMove = now - lastMouseMoveTime.current;

      // Resume from idle: Sync mouse position to cursor position first
      // This prevents cursor "flying" back to old mouse position
      if (timeSinceLastMove > 500) {
        setMousePos({
          x: lastCursorPos.current.x,
          y: lastCursorPos.current.y,
        });
        lastMouseMoveTime.current = now;
        wasIdleRef.current = false;
        return;
      }

      // Calculate delta time (time since last frame)
      // Capped at 1 to prevent huge jumps on lag
      const dt = Math.min(
        (now - lastMouseMoveTime.current) / 16,
        1,
      );

      // Calculate mouse velocity (speed = distance / time)
      const vx = (e.clientX - mousePos.x) / (dt || 1);
      const vy = (e.clientY - mousePos.y) / (dt || 1);

      velocityRef.current = { x: vx, y: vy };
      setMousePos({ x: e.clientX, y: e.clientY });
      lastMouseMoveTime.current = now;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos]);

  /**
   * PHYSICS SIMULATION LOOP
   * Runs 60 times per second using requestAnimationFrame
   * 
   * Two modes:
   * 1. FOLLOWING: Cursor follows mouse with easing
   * 2. PHYSICS: Mouse idle, physics simulation active
   */
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const timeSinceLastMove = now - lastMouseMoveTime.current;
      const isIdle = timeSinceLastMove > 500; // Mouse hasn't moved for 500ms

      // Calculate flood water surface position
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const floodHeightPixels = (floodLevel / 100) * viewportHeight;
      const floodSurfaceY = viewportHeight - floodHeightPixels;

      setCursorPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        let newVelX = velocityRef.current.x;
        let newVelY = velocityRef.current.y;

        // Is cursor in water?
        const isInsideFlood = floodLevel > 1 && prev.y >= floodSurfaceY - 10;

        /**
         * TRANSITION: Idle to Active
         * When user moves mouse after idle, sync positions
         */
        if (wasIdleRef.current && !isIdle) {
          setMousePos({ x: prev.x, y: prev.y });
          wasIdleRef.current = false;
          return prev;
        }

        /**
         * MODE 1: ACTIVE MOUSE MOVEMENT
         * Cursor follows mouse with easing
         */
        if (!isIdle) {
          // Check if cursor is in water during active movement
          const isInWaterNow = floodLevel > 1 && prev.y >= floodSurfaceY - 10;
          isFloatingRef.current = isInWaterNow;

          // Easing factor: Lower = more slippery (slower following)
          // In water, make it much slower to feel the resistance
          let easing = (physicsEnabled && isActive) ? 0.12 : 0.3;
          if (isInWaterNow && physicsEnabled) {
            easing *= 0.4; // 60% slower in water - very noticeable drag!
          }

          // Wind offset during movement (smooth push)
          const smoothWindOffsetX =
            (physicsEnabled && windSpeed > 0)
              ? windSpeed * WIND_FORCE_MULTIPLIER * 10
              : 0;
          const smoothWindOffsetY = 0;

          // New position = current + (target - current) * easing + wind
          // Apply additional water drag directly to position calculation
          let dragX = (mousePos.x - prev.x) * easing;
          let dragY = (mousePos.y - prev.y) * easing;
          
          if (isInWaterNow && physicsEnabled) {
            // Apply extra drag in water - makes movement feel heavy
            dragX *= WATER_FRICTION;
            dragY *= WATER_FRICTION;
          }
          
          newX = prev.x + dragX + smoothWindOffsetX;
          newY = prev.y + dragY + smoothWindOffsetY;

          // Update velocity based on movement
          // Higher multiplier on ice = more momentum
          newVelX = (newX - prev.x) * ((physicsEnabled && isActive) ? 3 : 2);
          newVelY = (newY - prev.y) * ((physicsEnabled && isActive) ? 3 : 2);

          // Apply water friction to velocity during active movement
          if (isInWaterNow && physicsEnabled) {
            newVelX *= WATER_FRICTION;
            newVelY *= WATER_FRICTION;
          }

          velocityRef.current = { x: newVelX, y: newVelY };

          // Screen wrapping during movement (wind mode)
          if (physicsEnabled && windSpeed > 0 && newX > viewportWidth + 50) {
            newX = -20;
            setMousePos({ x: -20, y: mousePos.y });
          }
          if (physicsEnabled && newX < -50) {
            newX = viewportWidth + 20;
            setMousePos({ x: viewportWidth + 20, y: mousePos.y });
          }
          if (physicsEnabled && windSpeed > 0) {
            if (newY > viewportHeight + 50) {
              newY = -20;
              setMousePos({ x: mousePos.x, y: -20 });
            }
            if (newY < -50) {
              newY = viewportHeight + 20;
              setMousePos({ x: mousePos.x, y: viewportHeight + 20 });
            }
          }

          return { x: newX, y: newY };
        }

        // Mark as idle
        if (isIdle && !wasIdleRef.current) {
          wasIdleRef.current = true;
        }

        /**
         * MODE 2: PHYSICS SIMULATION (Mouse Idle)
         * Only runs if physicsEnabled is true
         */
        if (!physicsEnabled) {
          return { x: mousePos.x, y: mousePos.y };
        }

        /**
         * WIND FORCES
         * Pushes cursor horizontally and adds turbulence
         */
        if (windSpeed > 0) {
          const windForce = windSpeed * WIND_FORCE_MULTIPLIER;
          newVelX += windForce; // Push right

          // Vertical oscillation (bobbing)
          const verticalOscillation = Math.sin(now / 1000) * WIND_VERTICAL_VARIATION;
          newVelY += verticalOscillation * 0.05;

          // Random horizontal gusts
          const turbulence = (Math.random() * 2 - 1) * WIND_TURBULENCE;
          newVelX += turbulence;

          // Random vertical gusts (updrafts)
          const verticalGust = (Math.random() * 2 - 1) * WIND_UPDRAFT;
          newVelY += verticalGust;
        }

        /**
         * FLOOD PHYSICS
         * Buoyancy and bobbing on water
         */
        if (isInsideFlood) {
          isFloatingRef.current = true;

          const distanceUnderwater = prev.y - floodSurfaceY;

          // Reduce gravity when in water (water provides some support)
          newVelY += GRAVITY * 0.3; // Much weaker gravity in water

          // Gradual buoyancy - stronger when deeper, but still gentle
          if (distanceUnderwater > 20) {
            newVelY -= FLOOD_BUOYANCY * 1.5; // Moderate buoyancy when very deep
          } else if (distanceUnderwater > 10) {
            newVelY -= FLOOD_BUOYANCY * 1.2; // Slightly stronger when deep
          } else if (distanceUnderwater > 0) {
            newVelY -= FLOOD_BUOYANCY; // Gentle buoyancy near surface
          } else {
            // Near or above surface - reduce upward velocity
            newVelY *= 0.85; // Settle on surface
          }

          // Water friction slows movement
          newVelX *= WATER_FRICTION;
          newVelY *= WATER_FRICTION;

          // Update position based on velocity (gradual floating)
          newX = prev.x + newVelX;
          newY = prev.y + newVelY;

          // When near surface, apply gentle bobbing effect
          const bobAmount = Math.sin(now / 500) * 1.5;

          // If cursor is very close to surface (within 3px), lock to surface with bobbing
          if (Math.abs(distanceUnderwater) < 3 && Math.abs(newVelY) < 0.5) {
            newY = floodSurfaceY + bobAmount;
            newVelY = 0;
          } 
          // If cursor is slightly above surface, gently pull it back down
          else if (newY < floodSurfaceY - 2) {
            newY = floodSurfaceY - 2 + bobAmount * 0.5;
            newVelY *= 0.5; // Reduce upward velocity
          }
        } 
        /**
         * NORMAL PHYSICS (Not in water)
         */
        else {
          isFloatingRef.current = false;

          /**
           * GRAVITY
           * Pulls cursor downward (reduced in wind)
           */
          if (windSpeed > 0) {
            newVelY += GRAVITY * WIND_GRAVITY_REDUCTION; // Weak gravity in wind
          } else {
            newVelY += GRAVITY; // Normal gravity
          }
          isFloatingRef.current = false;

          // Apply friction based on surface
          if (isActive) {
            // Ice friction (very slippery)
            newVelX *= ICE_FRICTION;
            newVelY *= ICE_FRICTION;
          } else {
            // Air friction
            newVelX *= AIR_FRICTION;
            newVelY *= AIR_FRICTION;
          }

          // Update position
          newX = prev.x + newVelX;
          newY = prev.y + newVelY;

          // Ground collision (only when no wind)
          if (windSpeed === 0 && newY > viewportHeight - 20) {
            newY = viewportHeight - 20;
            newVelY = 0;
          }
        }

        /**
         * SCREEN WRAPPING (Wind Mode)
         * Cursor wraps around edges when blown off screen
         */
        if (windSpeed > 0 && newX > viewportWidth + 50) {
          newX = -20; // Wrap to left
        }
        if (newX < -50) {
          newX = viewportWidth + 20; // Wrap to right
        }
        if (windSpeed > 0) {
          if (newY > viewportHeight + 50) {
            newY = -20; // Wrap to top
          }
          if (newY < -50) {
            newY = viewportHeight + 20; // Wrap to bottom
          }
        } else {
          // Prevent going off top (no wind)
          if (newY < 0) {
            newY = 0;
            newVelY = 0;
          }
        }

        // Save velocity and position
        velocityRef.current = { x: newVelX, y: newVelY };
        lastCursorPos.current = { x: newX, y: newY };

        return { x: newX, y: newY };
      });

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, mousePos, floodLevel, isWindy, windSpeed, physicsEnabled]);

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`
        body {
          cursor: none !important;
        }
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Custom pixel cursor that follows physics */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-[99999]"
        style={{
          transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
          willChange: "transform", // Optimize for animation
        }}
      >
        {/* Gravity-off pixel cursor (apple icon) */}
        <img
          src="/assets/images/icons/gravityOff.png"
          alt="Gravity off cursor"
          style={{
            width: 24,
            height: 24,
            imageRendering: "pixelated",
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
          }}
        />
      </div>
    </>
  );
}