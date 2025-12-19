import { useMemo } from 'react';
import type { WeatherType } from '@/Pages/Weather/Index';

interface CloudsEffectProps {
  weather?: WeatherType;
  isNight?: boolean;
  windSpeed?: number;   // km/h
  cloudCount?: number;  // optional override for number of clouds
  zIndex?: number;      // optional z-index override
}

interface CloudAsset {
  type: 'Normal' | 'Rain' | 'Heavy';
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  variant: number;
}

// Cloud asset definitions
const cloudAssets = {
  Normal: {
    xs: [0, 1, 2],  // 3 variants
    s: [0, 1],      // 2 variants
    m: [0, 1, 2],   // 3 variants
    l: [0, 1, 2],   // 3 variants
    xl: [0],        // 1 variant
  },
  Rain: {
    xs: [0, 1, 2],
    s: [0, 1],
    m: [0, 1, 2],
    l: [0, 1, 2],
    xl: [0],
  },
  Heavy: {
    xs: [0, 1, 2],
    s: [0, 1],
    m: [0, 1, 2],
    l: [0, 1, 2],
    xl: [0],
  },
};

// Size weights for distribution (larger clouds are rarer)
const sizeWeights = {
  xs: 0.3,  // 30% chance
  s: 0.25,  // 25% chance
  m: 0.25,  // 25% chance
  l: 0.15,  // 15% chance
  xl: 0.05, // 5% chance
};

function getCloudType(weather: WeatherType): 'Normal' | 'Rain' | 'Heavy' {
  if (weather === 'thunderstorm') {
    return 'Heavy';
  }
  if (weather === 'rainy') {
    return 'Rain';
  }
  return 'Normal';
}

function getRandomCloudAsset(type: 'Normal' | 'Rain' | 'Heavy'): CloudAsset {
  // Select size based on weights
  const rand = Math.random();
  let cumulative = 0;
  let selectedSize: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';
  
  for (const [size, weight] of Object.entries(sizeWeights)) {
    cumulative += weight;
    if (rand <= cumulative) {
      selectedSize = size as 'xs' | 's' | 'm' | 'l' | 'xl';
      break;
    }
  }
  
  // Select random variant for the chosen size
  const variants = cloudAssets[type][selectedSize];
  const variant = variants[Math.floor(Math.random() * variants.length)];
  
  return { type, size: selectedSize, variant };
}

function getCloudImagePath(asset: CloudAsset): string {
  const typeMap = {
    Normal: 'Normal',
    Rain: 'Rain',
    Heavy: 'Heavy',
  };
  
  const typeFolder = typeMap[asset.type];
  const variantStr = asset.variant.toString().padStart(2, '0');
  
  return `/assets/images/clouds/${typeFolder}/cloud${asset.type}${asset.size === 'xl' ? '-xl' : `-${asset.size}`}${variantStr}.png`;
}

export function CloudsEffect({
  weather = 'clear-day',
  isNight = false,
  windSpeed = 15,
  cloudCount,
  zIndex = 5, // Default z-index for main page (above panels which are z-10, but below modals)
}: CloudsEffectProps) {
  const computedCloudCount =
    weather === 'thunderstorm'
      ? 5
      : weather === 'snow'
      ? 4
      : weather === 'cloudy'
      ? 6
      : 3;
  const effectiveCloudCount = cloudCount ?? computedCloudCount;
  
  const cloudType = getCloudType(weather);

  // Calculate cloud speed based on wind speed
  // Formula: duration = 600 / windSpeed
  // At 15 km/h: 40s
  // At 30 km/h: 20s (default demo speed)
  // At 50 km/h: 12s (fast!)
  // At 100 km/h: 6s (super fast!)
  const baseDuration = 600 / windSpeed;

  // Generate cloud assets for each cloud
  const clouds = useMemo(() => {
    return Array.from({ length: effectiveCloudCount }, (_, i) => ({
      id: i,
      asset: getRandomCloudAsset(cloudType),
      top: 10 + i * 15,
      duration: baseDuration + i * 10,
      delay: i * -10,
    }));
  }, [effectiveCloudCount, cloudType, baseDuration]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex }}>
      {clouds.map((cloud) => {
        const imagePath = getCloudImagePath(cloud.asset);
        return (
          <img
            key={cloud.id}
            src={imagePath}
            alt="Cloud"
            className="absolute"
            style={{
              top: `${cloud.top}%`,
              left: '-200px', // Start off-screen to the left
              animationDelay: `${cloud.delay}s`,
              animationDuration: `${cloud.duration}s`,
              animationName: 'cloudMove',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              imageRendering: 'pixelated',
              opacity: isNight && cloudType === 'Normal' ? 0.6 : 1,
            }}
          />
        );
      })}
      
      <style>{`
        @keyframes cloudMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw + 400px));
          }
        }
      `}</style>
    </div>
  );
}
