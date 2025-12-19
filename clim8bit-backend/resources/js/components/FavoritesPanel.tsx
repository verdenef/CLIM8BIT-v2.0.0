import { useState, useEffect, useMemo } from "react";
import {
  Star,
  Trash2,
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { getWeather } from "@/Utils/weatherAPI";

interface FavoritesPanelProps {
  onCitySelect: (city: string) => void;
  demoMode: boolean;
  tempUnit?: 'C' | 'F';
}

interface WeatherWidgetData {
  id: string;
  city: string;
  country: string;
  temp: number;
  weatherMain: string;
  description: string;
  icon: string;
  timezone: number; // Timezone offset in seconds
  sunrise: number;
  sunset: number;
  windSpeed: number; // Wind speed in km/h
  loading: boolean;
  error: boolean;
}

// Mini weather animations for panels
const MiniRainEffect = ({ count = 15 }: { count?: number }) => {
  const [raindrops] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.8 + Math.random() * 0.4,
    })),
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="raindrop"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

type MiniSnowflakeType = 'particle' | 'flake';

interface MiniSnowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  swayAmount: number;
  kind: MiniSnowflakeType;
  spriteIndex?: number;
}

const MiniSnowEffect = ({ count = 15 }: { count?: number }) => {
  const [snowflakes] = useState(() => {
    const total = count;
    const spriteCount = Math.floor(total * 0.2); // 20% are sprite flakes, rest are particles
    const flakes: MiniSnowflake[] = [];

    for (let i = 0; i < total; i++) {
      const isSprite = i < spriteCount;
      flakes.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 3,
        size: isSprite ? 6 + Math.random() * 4 : 2 + Math.random() * 2,
        swayAmount: 20 + Math.random() * 30,
        kind: isSprite ? 'flake' : 'particle',
        spriteIndex: isSprite ? Math.floor(Math.random() * 5) : undefined,
      });
    }
    return flakes;
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {snowflakes.map((flake) => {
        const commonStyle = {
          position: 'absolute' as const,
          left: `${flake.left}%`,
          top: '-10px',
          animation: `miniSnowFall ${flake.duration}s linear ${flake.delay}s infinite`,
          '--sway-amount': `${flake.swayAmount}px`,
          imageRendering: 'pixelated' as const,
        } as React.CSSProperties;

        if (flake.kind === 'flake' && flake.spriteIndex !== undefined) {
          const src = `/assets/images/snowflakes/snowflake0${flake.spriteIndex}.png`;
          return (
            <img
              key={flake.id}
              src={src}
              alt="Snowflake"
              style={{
                ...commonStyle,
                width: `${flake.size}px`,
                height: 'auto',
                opacity: 0.9,
              }}
            />
          );
        } else {
          // Particle (small circle)
          return (
            <div
              key={flake.id}
              style={{
                ...commonStyle,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                background: 'white',
                borderRadius: '50%',
                opacity: 0.9,
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              }}
            />
          );
        }
      })}
      
      <style>{`
        @keyframes miniSnowFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--sway-amount, 0px))) rotate(180deg);
          }
          100% {
            transform: translateY(100vh) translateX(calc(var(--sway-amount, 0px) * 2)) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

const MiniFogEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="fog-layer"
          style={{
            animationDelay: `${i * 3}s`,
            opacity: 0.25 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
};

interface MiniLightningBolt {
  id: number;
  position: number; // 0-100 percentage
  visible: boolean;
}

const MiniThunderstormEffect = () => {
  const [flash, setFlash] = useState(false);
  const [lightningBolts, setLightningBolts] = useState<MiniLightningBolt[]>([]);

  useEffect(() => {
    let boltIdCounter = 0;

    const triggerLightning = () => {
      // Flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 100);
      
      // Create single lightning bolt at random position
      const newBolt: MiniLightningBolt = {
        id: boltIdCounter++,
        position: Math.random() * 80 + 10, // 10% to 90% to keep it visible
        visible: true,
      };
      
      setLightningBolts(prev => [...prev, newBolt]);
      
      // Remove bolt after GIF animation completes (assuming ~500ms for the GIF)
      setTimeout(() => {
        setLightningBolts(prev => prev.filter(bolt => bolt.id !== newBolt.id));
      }, 500);
    };

    // Trigger lightning every 3-7 seconds
    const interval = setInterval(triggerLightning, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {flash && (
        <div className="absolute inset-0 bg-white/40 pointer-events-none lightning-flash" />
      )}
      
      {/* Lightning bolts using GIF */}
      {lightningBolts.map(bolt => (
        <img
          key={bolt.id}
          src="/assets/images/clouds/lightning.gif"
          alt="Lightning"
          className="absolute top-0 pointer-events-none z-5"
          style={{ 
            left: `${bolt.position}%`,
            transform: 'translateX(-50%)',
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 15px rgba(135, 206, 250, 0.8)) drop-shadow(0 0 20px rgba(135, 206, 250, 0.6))',
          }}
        />
      ))}
      
      <MiniRainEffect count={20} />
    </>
  );
};

// Cloud asset definitions (matching CloudsEffect)
interface CloudAsset {
  type: 'Normal' | 'Rain' | 'Heavy';
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  variant: number;
}

const cloudAssets = {
  Normal: {
    xs: [0, 1, 2],
    s: [0, 1],
    m: [0, 1, 2],
    l: [0, 1, 2],
    xl: [0],
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

const sizeWeights = {
  xs: 0.3,
  s: 0.25,
  m: 0.25,
  l: 0.15,
  xl: 0.05,
};

function getCloudType(weatherMain: string): 'Normal' | 'Rain' | 'Heavy' {
  if (weatherMain.toLowerCase() === "thunderstorm") {
    return 'Heavy';
  }
  if (weatherMain.toLowerCase() === "rain" || weatherMain.toLowerCase() === "drizzle") {
    return 'Rain';
  }
  return 'Normal';
}

function getRandomCloudAsset(type: 'Normal' | 'Rain' | 'Heavy', excludeXS: boolean = false): CloudAsset {
  const rand = Math.random();
  let cumulative = 0;
  let selectedSize: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';
  
  if (excludeXS) {
    // Adjusted weights when excluding xs (redistribute xs weight to other sizes)
    const adjustedWeights = {
      s: 0.35,  // 25% + 10% from xs
      m: 0.35,  // 25% + 10% from xs
      l: 0.20,  // 15% + 5% from xs
      xl: 0.10, // 5% + 5% from xs
    };
    
    for (const [size, weight] of Object.entries(adjustedWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedSize = size as 's' | 'm' | 'l' | 'xl';
        break;
      }
    }
  } else {
    for (const [size, weight] of Object.entries(sizeWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedSize = size as 'xs' | 's' | 'm' | 'l' | 'xl';
        break;
      }
    }
  }
  
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

const MiniCloudsEffect = ({
  weatherMain,
  isNight,
  windSpeed = 15,
}: {
  weatherMain: string;
  isNight?: boolean;
  windSpeed?: number;
}) => {
  const cloudCount = weatherMain.toLowerCase() === "thunderstorm" ? 5 : 6;
  const cloudType = getCloudType(weatherMain);
  
  // Faster duration for small panels: 8-15 seconds
  const baseDuration = 300 / windSpeed; // Faster than main page
  
  // Memoize clouds to prevent regeneration on every render
  const clouds = useMemo(() => {
      // Size mapping for mini clouds (smaller scale, no xs)
      const sizeMap = {
        s: { width: '40px', height: 'auto' },
        m: { width: '50px', height: 'auto' },
        l: { width: '60px', height: 'auto' },
        xl: { width: '70px', height: 'auto' },
      };
    
    return Array.from({ length: cloudCount }, (_, i) => {
      const asset = getRandomCloudAsset(cloudType, true); // Exclude xs clouds in watchlist
      const duration = baseDuration + Math.random() * (baseDuration * 0.3);
      
      return {
        id: i,
        asset,
        path: getCloudImagePath(asset),
        top: `${5 + i * 15}%`,
        left: `${-10 + Math.random() * 20}%`,
        duration,
        delay: i * -2,
        size: sizeMap[asset.size as 's' | 'm' | 'l' | 'xl'], // xs is excluded in watchlist
        opacity: isNight && cloudType === 'Normal' ? 0.4 : 0.6,
      };
    });
  }, [cloudCount, cloudType, baseDuration, isNight]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {clouds.map((cloud) => (
        <img
          key={cloud.id}
          src={cloud.path}
          alt="Cloud"
          className="absolute"
          style={{
            top: cloud.top,
            left: cloud.left,
            width: cloud.size.width,
            height: cloud.size.height,
            opacity: cloud.opacity,
            animation: `miniCloudMove ${cloud.duration}s linear ${cloud.delay}s infinite`,
            imageRendering: 'pixelated',
          }}
        />
      ))}
      
      <style>{`
        @keyframes miniCloudMove {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(calc(100vw + 100px));
          }
        }
      `}</style>
    </div>
  );
};

interface MiniLeaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotationSpeed: number;
  swayAmount: number;
  variant: number;
  initialY: number;
}

const MiniLeavesEffect = ({
  isWindy,
  windSpeed = 15,
}: {
  isWindy?: boolean;
  windSpeed?: number;
}) => {
  const effectiveWindSpeed = isWindy ? Math.max(windSpeed, 25) : windSpeed;
  const leafCount = Math.min(Math.max(Math.floor(effectiveWindSpeed * 0.8), 5), 12); // Fewer leaves for panels (5-12)
  const baseDuration = 80 / effectiveWindSpeed;
  
  const leafVariants = [0, 1, 2];

  const [leaves] = useState<MiniLeaf[]>(() =>
    Array.from({ length: leafCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      // Random delay (0-2 seconds) so leaves don't all start in a straight line
      delay: Math.random() * 2,
      duration: baseDuration + Math.random() * (baseDuration * 0.4),
      size: 3 + Math.random() * 3, // 3-6px for panels
      rotationSpeed: 2 + Math.random() * 4,
      swayAmount: 30 + Math.random() * 50, // Less sway for panels
      variant: leafVariants[Math.floor(Math.random() * leafVariants.length)],
      // Random initial Y position (-10% to -30%) to scatter leaves vertically
      initialY: -10 - Math.random() * 20,
    })),
  );

  // Calculate horizontal drift based on wind speed
  const horizontalDrift = effectiveWindSpeed * 2; // Less drift for panels

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
              width: `${leaf.size * 3}px`, // Smaller for panels
              height: 'auto',
              animation: `miniLeafFall ${leaf.duration}s linear ${leaf.delay}s infinite`,
              '--sway-amount': `${leaf.swayAmount}px`,
              '--horizontal-drift': `${horizontalDrift}px`,
              imageRendering: 'pixelated',
              opacity: 1,
            } as React.CSSProperties}
          />
        );
      })}
      
      <style>{`
        @keyframes miniLeafFall {
          0% {
            transform: translateY(calc(0vh - var(--initial-y, 0%))) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(calc(25vh - var(--initial-y, 0%))) translateX(calc(var(--sway-amount, 0px) / 2 + var(--horizontal-drift, 0px))) rotate(90deg);
          }
          50% {
            transform: translateY(calc(50vh - var(--initial-y, 0%))) translateX(calc(var(--horizontal-drift, 0px))) rotate(180deg);
          }
          75% {
            transform: translateY(calc(75vh - var(--initial-y, 0%))) translateX(calc(var(--sway-amount, 0px) / 2 + var(--horizontal-drift, 0px))) rotate(270deg);
          }
          100% {
            transform: translateY(calc(120vh - var(--initial-y, 0%))) translateX(calc(var(--horizontal-drift, 0px))) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

const MiniWindEffect = ({
  windSpeed = 30,
}: {
  windSpeed?: number;
}) => {
  const baseDuration = 90 / windSpeed;

  const [windStreaks] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: -(Math.random() * 20 + 10),
      width: Math.random() * 60 + 30, // Smaller streaks for panels (30-90px)
      delay: Math.random() * (baseDuration * 0.8),
      duration:
        baseDuration + Math.random() * (baseDuration * 0.5),
      opacity: Math.random() * 0.3 + 0.1,
    })),
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {windStreaks.map((streak) => (
        <div
          key={streak.id}
          className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            top: `${streak.top}%`,
            left: `${streak.left}%`,
            width: `${streak.width}px`,
            opacity: streak.opacity,
            animation: `miniWindStreak ${streak.duration}s linear ${streak.delay}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes miniWindStreak {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100% + 400px)) translateY(-10px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Map weather to background gradient
const getWeatherBackground = (
  main: string,
  icon: string,
  sunrise: number,
  sunset: number,
  timezone: number,
) => {
  const currentUnixTime = Math.floor(Date.now() / 1000);
  const cityTime = new Date(
    (currentUnixTime + timezone) * 1000,
  );

  // Check if it's night time in the city
  let isNight = icon.includes("n");
  if (!isNight && sunrise && sunset) {
    isNight =
      currentUnixTime < sunrise || currentUnixTime > sunset;
  }

  switch (main.toLowerCase()) {
    case "clear":
      return isNight
        ? "linear-gradient(135deg, rgba(15, 15, 30, 0.8) 0%, rgba(30, 30, 63, 0.8) 100%)" // Clear night
        : "linear-gradient(135deg, rgba(135, 206, 235, 0.6) 0%, rgba(176, 212, 241, 0.6) 100%)"; // Clear day
    case "clouds":
      return isNight
        ? "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(55, 65, 81, 0.8) 100%)" // Cloudy night
        : "linear-gradient(135deg, rgba(74, 85, 104, 0.7) 0%, rgba(113, 128, 150, 0.7) 100%)"; // Cloudy day
    case "rain":
    case "drizzle":
      return isNight
        ? "linear-gradient(135deg, rgba(10, 10, 20, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%)" // Rainy night
        : "linear-gradient(135deg, rgba(26, 26, 46, 0.75) 0%, rgba(45, 53, 97, 0.75) 100%)"; // Rainy day
    case "thunderstorm":
      return isNight
        ? "linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(15, 15, 30, 0.9) 100%)" // Storm night
        : "linear-gradient(135deg, rgba(15, 15, 30, 0.85) 0%, rgba(26, 26, 46, 0.85) 100%)"; // Storm day
    case "snow":
      return isNight
        ? "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)" // Snowy night
        : "linear-gradient(135deg, rgba(203, 213, 225, 0.7) 0%, rgba(226, 232, 240, 0.7) 100%)"; // Snowy day
    case "mist":
    case "fog":
    case "haze":
      return isNight
        ? "linear-gradient(135deg, rgba(55, 65, 81, 0.8) 0%, rgba(75, 85, 99, 0.8) 100%)" // Foggy night
        : "linear-gradient(135deg, rgba(156, 163, 175, 0.7) 0%, rgba(209, 213, 219, 0.7) 100%)"; // Foggy day
    default:
      return "linear-gradient(135deg, rgba(75, 85, 99, 0.6) 0%, rgba(107, 114, 128, 0.6) 100%)";
  }
};

// Get weather icon path for pixel art icons
const getWeatherIconPath = (
  weatherMain: string,
  iconCode: string,
  temp?: number,
): string => {
  const isNight = iconCode.includes("n");

  switch (weatherMain.toLowerCase()) {
    case "thunderstorm":
      return "/assets/images/icons/weatherIcons/weatherStorm.png";
    case "drizzle":
    case "rain":
      return "/assets/images/icons/weatherIcons/weatherRain.png";
    case "snow":
      return "/assets/images/icons/weatherIcons/weatherCold.png";
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
    case "fog":
      return "/assets/images/icons/weatherIcons/weatherFog.png";
    case "clear":
      return isNight
        ? "/assets/images/icons/weatherIcons/weatherClearNight.png"
        : "/assets/images/icons/weatherIcons/weatherClearDay.png";
    case "clouds":
      return "/assets/images/icons/weatherIcons/weatherCloudy.png";
    default:
      return "/assets/images/icons/weatherIcons/weatherClearDay.png";
  }
};

// Weather icon mapping - returns pixel art image
const getWeatherIcon = (main: string, icon: string, temp?: number) => {
  const iconPath = getWeatherIconPath(main, icon, temp);
  return (
    <img
      src={iconPath}
      alt={main}
      className="w-8 h-8 object-contain"
    />
  );
};

// Mock weather data for demo purposes (when WiFi is slow or demo mode)
const MOCK_WATCHLIST_DATA: WeatherWidgetData[] = [
  {
    id: 'mock-1',
    city: 'Manila',
    country: 'PH',
    temp: 32,
    weatherMain: 'Clear',
    description: 'clear sky',
    icon: '01d',
    timezone: 28800, // UTC+8
    sunrise: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    sunset: Math.floor(Date.now() / 1000) + 21600, // 6 hours from now
    windSpeed: 15,
    loading: false,
    error: false,
  },
  {
    id: 'mock-2',
    city: 'Tokyo',
    country: 'JP',
    temp: 18,
    weatherMain: 'Thunderstorm',
    description: 'thunderstorm with heavy rain',
    icon: '11d',
    timezone: 32400, // UTC+9
    sunrise: Math.floor(Date.now() / 1000) - 18000, // 5 hours ago
    sunset: Math.floor(Date.now() / 1000) + 25200, // 7 hours from now
    windSpeed: 35,
    loading: false,
    error: false,
  },
  {
    id: 'mock-3',
    city: 'New York',
    country: 'US',
    temp: 8,
    weatherMain: 'Snow',
    description: 'light snow',
    icon: '13d',
    timezone: -18000, // UTC-5
    sunrise: Math.floor(Date.now() / 1000) - 36000, // 10 hours ago
    sunset: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    windSpeed: 15, // Reduced to prevent leaves effect
    loading: false,
    error: false,
  },
];

export function FavoritesPanel({
  onCitySelect,
  demoMode,
  tempUnit = 'C',
}: FavoritesPanelProps) {
  const { user } = useAuth();
  
  // Convert Celsius to Fahrenheit
  const convertTemp = (celsius: number): number => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };
  const { favorites, removeFavorite } = useFavorites();
  const [weatherData, setWeatherData] = useState<
    WeatherWidgetData[]
  >([]);

  // Fetch weather for all favorites
  useEffect(() => {
    // Use mock data in demo mode or when no user
    if (demoMode || !user) {
      setWeatherData(MOCK_WATCHLIST_DATA);
      return;
    }

    if (favorites.length === 0) {
      setWeatherData([]);
      return;
    }

    const fetchWeatherForFavorites = async () => {
      // First, set loading state for newly added favorites so they appear immediately
      setWeatherData(prev => {
        const existingIds = new Set(prev.map(w => w.id));
        const newFavorites = favorites.filter(fav => !existingIds.has(fav.id));
        
        // Keep existing data, add loading placeholders for new favorites
        return [
          ...prev.filter(w => favorites.some(fav => fav.id === w.id)),
          ...newFavorites.map(fav => ({
            id: fav.id,
            city: fav.name,
            country: fav.country,
            temp: 0,
            weatherMain: "",
            description: "",
            icon: "",
            timezone: 0,
            sunrise: 0,
            sunset: 0,
            windSpeed: 0,
            loading: true,
            error: false,
          }))
        ];
      });

      // Then fetch weather for all favorites with timeout
      const weatherPromises = favorites.map(async (fav) => {
        try {
          // Add timeout to prevent slow API from blocking demo
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          );
          
          const data = await Promise.race([
            getWeather(fav.name),
            timeoutPromise
          ]) as any;
          
          return {
            id: fav.id,
            city: data.name,
            country: data.sys.country,
            temp: data.main.temp,
            weatherMain: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            timezone: data.timezone,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            loading: false,
            error: false,
          };
        } catch (err) {
          // Fallback to mock data if API fails or times out
          // Find matching mock data or use first mock as fallback
          const mockMatch = MOCK_WATCHLIST_DATA.find(m => 
            m.city.toLowerCase() === fav.name.toLowerCase()
          ) || MOCK_WATCHLIST_DATA[0];
          
          return {
            id: fav.id,
            city: fav.name,
            country: fav.country,
            temp: mockMatch.temp,
            weatherMain: mockMatch.weatherMain,
            description: mockMatch.description,
            icon: mockMatch.icon,
            timezone: mockMatch.timezone,
            sunrise: mockMatch.sunrise,
            sunset: mockMatch.sunset,
            windSpeed: mockMatch.windSpeed,
            loading: false,
            error: false, // Don't show error, use mock data instead
          };
        }
      });

      const results = await Promise.all(weatherPromises);
      setWeatherData(results);
    };

    fetchWeatherForFavorites();

    // Refresh every 5 minutes
    const interval = setInterval(
      fetchWeatherForFavorites,
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [favorites, user, demoMode]); // This should trigger when favorites change or demo mode

  // Calculate local time for a city based on timezone offset
  const getLocalTime = (timezoneOffset: number) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + timezoneOffset * 1000);

    return cityTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Update local times every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show mock data in demo mode even without user
  const displayFavorites = demoMode ? MOCK_WATCHLIST_DATA.map((_, i) => ({
    id: `mock-${i + 1}`,
    name: MOCK_WATCHLIST_DATA[i].city,
    country: MOCK_WATCHLIST_DATA[i].country,
    addedAt: Date.now() - (i * 86400000), // Different dates for each
  })) : favorites;

  const displayWeatherData = demoMode ? MOCK_WATCHLIST_DATA : weatherData;

  if ((!user || favorites.length === 0) && !demoMode) {
    return null;
  }

  if (demoMode && displayWeatherData.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Star
          size={16}
          className="text-yellow-400 pixel-icon"
          fill="currentColor"
        />
        <h3 className="pixel-text-xs text-white">
          WATCHLIST ({displayFavorites.length}/3)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayWeatherData.map((widget) => {
          // Calculate if it's night time for this city
          const currentUnixTime = Math.floor(Date.now() / 1000);
          let isNight = widget.icon.includes("n");
          if (!isNight && widget.sunrise && widget.sunset) {
            isNight =
              currentUnixTime < widget.sunrise ||
              currentUnixTime > widget.sunset;
          }

          // Calculate if we should show leaves (same logic as main app)
          // Leaves appear when: daytime + (clear OR cloudy OR windy)
          const isWindy = widget.windSpeed > 25; // Wind speed > 25 km/h
          const shouldShowLeaves =
            !isNight &&
            (widget.weatherMain.toLowerCase() === "clear" ||
              widget.weatherMain.toLowerCase() === "clouds" ||
              isWindy);

          // Determine if we should show clouds (same logic as main app)
          // Clouds show with: rain, thunderstorm, snow, or cloudy weather
          const showClouds = 
            widget.weatherMain.toLowerCase() === "rain" ||
            widget.weatherMain.toLowerCase() === "drizzle" ||
            widget.weatherMain.toLowerCase() === "thunderstorm" ||
            widget.weatherMain.toLowerCase() === "snow" ||
            widget.weatherMain.toLowerCase() === "clouds";

          const showSnow = widget.weatherMain.toLowerCase() === "snow";

          return (
            <div
              key={widget.id}
              className="pixel-panel p-4 relative group hover:border-white/40 transition-colors overflow-hidden"
              style={{
                background: getWeatherBackground(
                  widget.weatherMain,
                  widget.icon,
                  widget.sunrise,
                  widget.sunset,
                  widget.timezone,
                ),
              }}
            >
              {/* Remove button - hidden in demo mode */}
              {!demoMode && (
                <button
                  onClick={() => removeFavorite(widget.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 z-10"
                  title="Remove from tracked cities"
                >
                  <Trash2 size={16} className="pixel-icon" />
                </button>
              )}

              {/* City name */}
              <div className="mb-3">
                <button
                  onClick={() =>
                    !demoMode && onCitySelect(widget.city)
                  }
                  disabled={demoMode}
                  className="pixel-text-xs text-white hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {widget.city}, {widget.country}
                </button>
              </div>

              {widget.loading ? (
                <div className="text-center py-4">
                  <p className="pixel-text-xs text-white/70 animate-pulse">
                    Loading...
                  </p>
                </div>
              ) : widget.error ? (
                <div className="text-center py-4">
                  <p className="pixel-text-xs text-red-400">
                    Failed to load
                  </p>
                </div>
              ) : (
                <>
                  {/* Weather display */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(
                        widget.weatherMain,
                        widget.icon,
                        widget.temp,
                      )}
                      <div>
                        <div className="text-white text-3xl">
                          {convertTemp(widget.temp)}°
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pixel-text-xs text-white/70 mb-3 capitalize">
                    {widget.description}
                  </div>

                  {/* Local time */}
                  <div className="pt-3 border-t-2 border-white/10">
                    <div className="pixel-text-xs text-white/50">
                      LOCAL TIME:{" "}
                      <span className="text-white">
                        {getLocalTime(widget.timezone)}
                      </span>
                    </div>
                  </div>

                  {/* Mini weather effects */}
                  
                  {/* Rain & Drizzle effects */}
                  {(widget.weatherMain.toLowerCase() === "rain" ||
                    widget.weatherMain.toLowerCase() === "drizzle") && (
                    <>
                      {showClouds && (
                        <MiniCloudsEffect
                          weatherMain={widget.weatherMain}
                          isNight={isNight}
                          windSpeed={widget.windSpeed}
                        />
                      )}
                      <MiniRainEffect />
                    </>
                  )}
                  
                  {/* Snow effects */}
                  {showSnow && (
                    <>
                      {showClouds && (
                        <MiniCloudsEffect
                          weatherMain={widget.weatherMain}
                          isNight={isNight}
                          windSpeed={widget.windSpeed}
                        />
                      )}
                      <MiniSnowEffect />
                    </>
                  )}
                  
                  {/* Thunderstorm effects */}
                  {widget.weatherMain.toLowerCase() === "thunderstorm" && (
                    <>
                      {showClouds && (
                        <MiniCloudsEffect
                          weatherMain={widget.weatherMain}
                          isNight={isNight}
                          windSpeed={widget.windSpeed}
                        />
                      )}
                      <MiniThunderstormEffect />
                    </>
                  )}
                  
                  {/* Fog/Mist/Haze effects */}
                  {(widget.weatherMain.toLowerCase() === "mist" ||
                    widget.weatherMain.toLowerCase() === "fog" ||
                    widget.weatherMain.toLowerCase() === "haze") && (
                    <>
                      <MiniFogEffect />
                      {/* Show snow effect if temperature is very cold (below 5°C) */}
                      {widget.temp < 5 && <MiniSnowEffect />}
                    </>
                  )}

                  {/* Leaves + Clouds combination (when daytime + clear/cloudy/windy) */}
                  {shouldShowLeaves && (
                    <>
                      {showClouds && widget.weatherMain.toLowerCase() === "clouds" && (
                        <MiniCloudsEffect
                          weatherMain={widget.weatherMain}
                          isNight={isNight}
                          windSpeed={widget.windSpeed}
                        />
                      )}
                      <MiniLeavesEffect isWindy={isWindy} windSpeed={widget.windSpeed} />
                    </>
                  )}

                  {/* Clouds alone (when NOT showing leaves and weatherMain is clouds) */}
                  {!shouldShowLeaves &&
                    widget.weatherMain.toLowerCase() === "clouds" &&
                    showClouds && (
                      <MiniCloudsEffect
                        weatherMain={widget.weatherMain}
                        isNight={isNight}
                        windSpeed={widget.windSpeed}
                      />
                    )}

                  {/* Wind effect - can appear with any weather when windy */}
                  {isWindy && (
                    <MiniWindEffect windSpeed={widget.windSpeed} />
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Add placeholder slots */}
        {Array.from({ length: 3 - displayFavorites.length }).map(
          (_, index) => (
            <div
              key={`placeholder-${index}`}
              className="pixel-panel p-4 border-dashed flex items-center justify-center"
            >
              <div className="text-center">
                <Star
                  size={24}
                  className="text-white/20 mx-auto mb-2 pixel-icon"
                />
                <p className="pixel-text-xs text-white/40">
                  Empty Slot
                </p>
                <p className="pixel-text-xs text-white/30 text-[10px] mt-1">
                  Click ⭐ to track a city
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}