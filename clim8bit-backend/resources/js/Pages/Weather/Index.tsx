import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { getWeather, getWeatherByCoords, getForecast, getCurrentLocation } from '@/Utils/weatherAPI';

import { AuthModal } from '@/components/AuthModal';
import { AccountSettingsModal } from '@/components/AccountSettingsModal';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { Toaster } from '@/components/ui/sonner';
import { SearchBar } from '@/components/SearchBar';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { WeatherAlert } from '@/components/WeatherAlert';
import { WeatherTip } from '@/components/WeatherTip';
import { DemoControls } from '@/components/DemoControls';
import { RainEffect } from '@/components/effects/RainEffect';
import { ThunderstormEffect } from '@/components/effects/ThunderstormEffect';
import { SnowEffect } from '@/components/effects/SnowEffect';
import { SunEffect } from '@/components/effects/SunEffect';
import { LeavesEffect } from '@/components/effects/LeavesEffect';
import { FogEffect } from '@/components/effects/FogEffect';
import { CloudsEffect } from '@/components/effects/CloudsEffect';
import { WindEffect } from '@/components/effects/WindEffect';
import { FloodEffect } from '@/components/effects/FloodEffect';
import { SlipperyCursor } from '@/components/effects/SlipperyCursor';
import { IntroPage } from '@/components/IntroPage';
import { MoonPhaseEffect } from '@/components/effects/MoonPhaseEffect';
import { MeteorShowerEffect } from '@/components/effects/MeteorShowerEffect';
import { ErrorBanner } from '@/components/ErrorBanner';

export type WeatherType = 'rainy' | 'thunderstorm' | 'snow' | 'hot' | 'clear-day' | 'clear-night' | 'foggy' | 'cloudy';

interface WeatherData {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  city: string;
  country: string;
  icon: string;
  weatherMain: string;
  timezone: number; // Timezone offset in seconds
  sunrise: number; // Unix timestamp
  sunset: number; // Unix timestamp
}

interface ForecastData {
  day: string;
  temp: number;
  icon: string;
  weatherMain: string;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, setTemperatureUnit } = useAuth();
  const { addRecentSearch } = useRecentSearches();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [demoMode, setDemoMode] = useState(false);
  const [demoWeather, setDemoWeather] = useState<WeatherType>('clear-day');
  const [demoIsNight, setDemoIsNight] = useState(false);
  const [demoWindy, setDemoWindy] = useState(false);
  const [demoLeaves, setDemoLeaves] = useState(false);
  const [demoSnow, setDemoSnow] = useState(false);
  const [demoWindSpeed, setDemoWindSpeed] = useState(0); // km/h - default to 0
  const [demoClouds, setDemoClouds] = useState(false);
  const [demoMoonPhase, setDemoMoonPhase] = useState<number | null>(null); // 0-31, null = auto
  const [floodLevel, setFloodLevel] = useState(0); // Track flood water level for cursor floating
  const [hideUI, setHideUI] = useState(false);
  const [cursorPhysicsEnabled, setCursorPhysicsEnabled] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    // Load from localStorage or default to Celsius
    const saved = localStorage.getItem('tempUnit');
    return (saved === 'F' ? 'F' : 'C') as 'C' | 'F';
  });

  // When a user is logged in, prefer their saved backend preference
  useEffect(() => {
    if (user && user.temperature_unit) {
      setTempUnit(user.temperature_unit === 'F' ? 'F' : 'C');
    }
  }, [user]);

  // Toggle temperature unit and save preference
  const toggleTempUnit = async () => {
    setTempUnit(prev => {
      const newUnit = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('tempUnit', newUnit);

      // If user is logged in, also persist preference to backend
      if (user) {
        // Fire and forget; errors will be surfaced via console
        setTemperatureUnit(newUnit).catch(console.error);
      }

      return newUnit;
    });
  };

  // Handler for day/night toggle that also updates clear weather types
  const handleDemoNightToggle = () => {
    const newIsNight = !demoIsNight;
    setDemoIsNight(newIsNight);
    
    // If current weather is clear, update it to match day/night
    if (demoWeather === 'clear-day' && newIsNight) {
      setDemoWeather('clear-night');
    } else if (demoWeather === 'clear-night' && !newIsNight) {
      setDemoWeather('clear-day');
    }
  };

  // Handler to clear all demo effects
  const handleClearEffects = () => {
    setDemoWindy(false);
    setDemoLeaves(false);
    setDemoSnow(false);
    setDemoClouds(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load weather for user's location on initial load
    loadInitialWeather();
  }, []);

  const loadInitialWeather = async () => {
    try {
      setLoading(true);
      const { lat, lon } = await getCurrentLocation();
      const data = await getWeatherByCoords(lat, lon);
      processWeatherData(data);
      
      // Get forecast
      const forecastResult = await getForecast(data.name);
      processForecastData(forecastResult);
      setLoading(false);
    } catch (err) {
      console.log('Geolocation not available, loading default city');
      // Silently fallback to default city on initial load
      try {
        const data = await getWeather('New York');
        processWeatherData(data);
        
        const forecastResult = await getForecast('New York');
        processForecastData(forecastResult);
      } catch (apiErr) {
        console.error(apiErr);
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadWeatherByLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const { lat, lon } = await getCurrentLocation();
      const data = await getWeatherByCoords(lat, lon);
      processWeatherData(data);
      
      // Get forecast
      const forecastResult = await getForecast(data.name);
      processForecastData(forecastResult);
    } catch (err: any) {
      // Show error when user explicitly clicks location button
      setError(err.message || 'Unable to get your location. Please enable location permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherByCity = async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeather(city);
      processWeatherData(data);
      
      // Add to recent searches if user is logged in
      if (user) {
        addRecentSearch(data.name, data.sys.country);
      }
      
      // Get forecast
      const forecastResult = await getForecast(city);
      processForecastData(forecastResult);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processWeatherData = (data: any) => {
    setWeatherData({
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      city: data.name,
      country: data.sys.country,
      icon: data.weather[0].icon,
      weatherMain: data.weather[0].main,
      timezone: data.timezone,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    });
  };

  const processForecastData = (data: any) => {
    // Get one forecast per day (at noon)
    const dailyForecasts: ForecastData[] = [];
    const processedDays = new Set<string>();

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString();
      
      // Take the forecast closest to noon for each day
      if (!processedDays.has(dayKey) && dailyForecasts.length < 5) {
        const hour = date.getHours();
        if (hour >= 11 && hour <= 14) {
          processedDays.add(dayKey);
          dailyForecasts.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            weatherMain: item.weather[0].main
          });
        }
      }
    });

    setForecastData(dailyForecasts);
  };

  const mapWeatherToType = (weatherMain: string, icon: string, isNightTime: boolean): WeatherType => {
    switch (weatherMain.toLowerCase()) {
      case 'thunderstorm':
        return 'thunderstorm';
      case 'drizzle':
      case 'rain':
        return 'rainy';
      case 'snow':
        return 'snow';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
        return 'foggy';
      case 'clear':
        return isNightTime ? 'clear-night' : weatherData && weatherData.temp > 30 ? 'hot' : 'clear-day';
      case 'clouds':
        return isNightTime ? 'clear-night' : 'cloudy';
      default:
        return isNightTime ? 'clear-night' : 'clear-day';
    }
  };

  // Improved day/night detection using timezone and sunrise/sunset
  const isNight = demoMode ? demoIsNight : (() => {
    if (!weatherData) return false;
    
    // Method 1: Check icon (most reliable from API)
    if (weatherData.icon.includes('n')) return true;
    if (weatherData.icon.includes('d')) return false;
    
    // Method 2: Check against sunrise/sunset times
    const currentUnixTime = Math.floor(Date.now() / 1000);
    if (weatherData.sunrise && weatherData.sunset) {
      if (currentUnixTime < weatherData.sunrise || currentUnixTime > weatherData.sunset) {
        return true;
      }
      return false;
    }
    
    // Method 3: Fallback to local time in city's timezone
    const localTime = new Date((currentUnixTime + weatherData.timezone) * 1000);
    const hour = localTime.getUTCHours();
    return hour >= 19 || hour < 6;
  })();

  const weather = weatherData ? mapWeatherToType(weatherData.weatherMain, weatherData.icon, isNight) : 'clear-day';
  const activeWeather = demoMode ? demoWeather : weather;
  
  const isWindy = demoMode ? demoWindy : (weatherData ? weatherData.windSpeed > 25 : false);
  const currentWindSpeed = demoMode ? demoWindSpeed : (weatherData ? weatherData.windSpeed : 15);
  
  // Leaves should ONLY show during day (never at night)
  const shouldShowLeaves = demoMode 
    ? (demoLeaves && !demoIsNight) 
    : (!isNight && (activeWeather === 'clear-day' || activeWeather === 'cloudy' || isWindy));
  
  const showSnow = demoMode ? demoSnow : (activeWeather === 'snow');
  
  // In demo mode, only show clouds if explicitly toggled
  const showClouds = demoMode ? demoClouds : (activeWeather === 'rainy' || activeWeather === 'thunderstorm' || activeWeather === 'snow' || activeWeather === 'cloudy');

  const getBackgroundGradient = () => {
    switch (activeWeather) {
      case 'rainy':
        return isNight 
          ? 'linear-gradient(180deg, #0a0a14 0%, #1a1a2e 100%)' // Rainy night - very dark blue
          : 'linear-gradient(180deg, #1a1a2e 0%, #2d3561 100%)'; // Rainy day - dark blue
      case 'thunderstorm':
        return isNight
          ? 'linear-gradient(180deg, #000000 0%, #0f0f1e 100%)' // Storm night - almost black
          : 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 100%)'; // Storm day - very dark
      case 'snow':
        return isNight 
          ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)' // Snowy night - dark blue-gray
          : 'linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 100%)'; // Snowy day - light gray
      case 'hot':
        return 'linear-gradient(180deg, #ff6b35 0%, #f7931e 50%, #ffd700 100%)';
      case 'clear-day':
        return 'linear-gradient(180deg, #87ceeb 0%, #b0d4f1 100%)';
      case 'clear-night':
        return 'linear-gradient(180deg, #0f0f1e 0%, #1e1e3f 100%)';
      case 'foggy':
        return isNight
          ? 'linear-gradient(180deg, #374151 0%, #4b5563 100%)' // Foggy night - dark gray
          : 'linear-gradient(180deg, #9ca3af 0%, #d1d5db 100%)'; // Foggy day - light gray
      case 'cloudy':
        return isNight
          ? 'linear-gradient(180deg, #1f2937 0%, #374151 100%)' // Cloudy night - dark gray
          : 'linear-gradient(180deg, #4a5568 0%, #718096 100%)'; // Cloudy day - medium gray
      default:
        return 'linear-gradient(180deg, #87ceeb 0%, #b0d4f1 100%)';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="pixel-panel p-8">
          <div className="pixel-text-lg text-white animate-pulse">LOADING...</div>
        </div>
      </div>
    );
  }

  // Show intro page first
  if (showIntro) {
    return (
      <>
        <IntroPage onStart={() => {
          setIsTransitioning(true);
          // Switch to main page at 50% of flash (when it's brightest) - 500ms
          setTimeout(() => {
            setShowIntro(false);
          }, 500);
          // Remove flash overlay after animation completes - 1000ms
          setTimeout(() => {
            setIsTransitioning(false);
          }, 1000);
        }} isExiting={isTransitioning} />
        {isTransitioning && (
          <div className="fixed inset-0 z-[10000] pointer-events-none animate-whiteFlash" />
        )}
      </>
    );
  }

  // Handler to go back to intro
  const handleBackToIntro = () => {
    setIsTransitioning(true);
    // Switch to intro page at 50% of flash (when it's brightest) - 500ms
    setTimeout(() => {
      setShowIntro(true);
    }, 500);
    // Remove flash overlay after animation completes - 1000ms
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  return (
    <>
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{ background: getBackgroundGradient() }}
      >
      {/* Weather Effects */}
      {(activeWeather === 'rainy' || activeWeather === 'thunderstorm') && (
        <>
          {showClouds && <CloudsEffect weather={activeWeather} isNight={isNight} windSpeed={currentWindSpeed} />}
          <RainEffect intensity={activeWeather === 'thunderstorm' ? 'heavy' : 'normal'} isWindy={isWindy} windSpeed={currentWindSpeed} />
        </>
      )}
      
      {activeWeather === 'thunderstorm' && <ThunderstormEffect />}
      
      {showSnow && (
        <>
          {(showClouds || (activeWeather === 'snow' && !demoMode)) && (
            <CloudsEffect weather={activeWeather} isNight={isNight} windSpeed={currentWindSpeed} />
          )}
          <SnowEffect windSpeed={currentWindSpeed} />
        </>
      )}
      
      {activeWeather === 'hot' && <SunEffect />}
      
      {/* Show moon during clear nights */}
      {activeWeather === 'clear-night' && (
        <>
          <MoonPhaseEffect overridePhase={demoMode ? demoMoonPhase ?? undefined : undefined} />
          <MeteorShowerEffect />
        </>
      )}
      
      {shouldShowLeaves && (
        <>
          {(showClouds || (activeWeather === 'cloudy' && !demoMode)) && (
            <CloudsEffect weather={activeWeather} isNight={isNight} windSpeed={currentWindSpeed} />
          )}
          <LeavesEffect windSpeed={currentWindSpeed} />
        </>
      )}
      
      {activeWeather === 'foggy' && (
        <>
          <FogEffect windSpeed={currentWindSpeed} />
          {/* Show cold effects if temperature is low - only in real weather mode */}
          {!demoMode && weatherData && weatherData.temp < 5 && (
            <SnowEffect windSpeed={currentWindSpeed} />
          )}
        </>
      )}
      
      {/* Clouds in demo mode - independent of weather */}
      {demoMode && showClouds && activeWeather !== 'rainy' && activeWeather !== 'thunderstorm' && !shouldShowLeaves && !showSnow && (
        <CloudsEffect weather="cloudy" isNight={isNight} windSpeed={currentWindSpeed} />
      )}
      
      {/* Wind Effect - show when windy AND wind speed > 0 */}
      {isWindy && currentWindSpeed > 0 && <WindEffect windSpeed={currentWindSpeed} />}
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <SearchBar 
          onSearch={loadWeatherByCity} onLocationClick={loadWeatherByLocation}
          demoMode={demoMode}
          onDemoModeToggle={() => setDemoMode(!demoMode)}
          demoIsNight={demoIsNight}
          onDemoNightToggle={handleDemoNightToggle}
          demoWindy={demoWindy}
          onDemoWindyToggle={() => setDemoWindy(!demoWindy)}
          demoLeaves={demoLeaves}
          onDemoLeavesToggle={() => setDemoLeaves(!demoLeaves)}
          demoSnow={demoSnow}
          onDemoSnowToggle={() => setDemoSnow(!demoSnow)}
          demoWindSpeed={demoWindSpeed}
          onDemoWindSpeedChange={setDemoWindSpeed}
          demoClouds={demoClouds}
          onDemoCloudsToggle={() => setDemoClouds(!demoClouds)}
          onClearEffects={handleClearEffects}
          currentCity={weatherData?.city}
          currentCountry={weatherData?.country}
          onLoginClick={() => setShowAuthModal(true)}
          onSettingsClick={() => setShowAccountSettingsModal(true)}
          hideUI={hideUI}
          onHideUIToggle={() => setHideUI(!hideUI)}
          cursorPhysicsEnabled={cursorPhysicsEnabled}
          onCursorPhysicsToggle={() => setCursorPhysicsEnabled(!cursorPhysicsEnabled)}
          onTitleClick={handleBackToIntro}
          weather={weatherData ? activeWeather : undefined}
          temperature={weatherData ? (demoMode ? getDemoTemp(demoWeather) : weatherData.temp) : undefined}
          tempUnit={tempUnit}
          onTempUnitToggle={toggleTempUnit}
        />
        
        {/* Demo Controls - Right below search panel */}
        {demoMode && !hideUI && (
          <DemoControls 
            currentWeather={demoWeather}
            onWeatherChange={setDemoWeather}
            isNight={demoIsNight}
            moonPhase={demoMoonPhase}
            onMoonPhaseChange={setDemoMoonPhase}
            demoIsNight={demoIsNight}
            onDemoNightToggle={handleDemoNightToggle}
            demoWindy={demoWindy}
            onDemoWindyToggle={() => setDemoWindy(!demoWindy)}
            demoLeaves={demoLeaves}
            onDemoLeavesToggle={() => setDemoLeaves(!demoLeaves)}
            demoSnow={demoSnow}
            onDemoSnowToggle={() => setDemoSnow(!demoSnow)}
            demoClouds={demoClouds}
            onDemoCloudsToggle={() => setDemoClouds(!demoClouds)}
            demoWindSpeed={demoWindSpeed}
            onDemoWindSpeedChange={setDemoWindSpeed}
            onClearEffects={handleClearEffects}
          />
        )}
        
        {/* Weather Alerts - Moved to top for visibility */}
        {weatherData && !hideUI && (
          <div className="px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
              <WeatherAlert 
                weather={activeWeather}
                temp={demoMode ? getDemoTemp(demoWeather) : weatherData.temp}
                windSpeed={demoMode && demoWindy ? demoWindSpeed : demoMode ? 10 : weatherData.windSpeed}
                humidity={weatherData.humidity}
              />
            </div>
          </div>
        )}
        
        {/* Weather Tips - Below alerts */}
        {weatherData && !hideUI && (
          <WeatherTip
            weather={activeWeather}
            temp={demoMode ? getDemoTemp(demoWeather) : weatherData.temp}
            windSpeed={demoMode && demoWindy ? demoWindSpeed : demoMode ? 10 : weatherData.windSpeed}
            isWindy={isWindy}
          />
        )}
        
        {/* Error Banner */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        
        {weatherData ? (
          <>
            {!hideUI && (
              <WeatherDisplay 
                weather={activeWeather} 
                currentTime={currentTime}
                weatherData={weatherData}
                forecastData={forecastData}
                demoMode={demoMode}
                isNight={isNight}
                isWindy={isWindy}
                tempUnit={tempUnit}
                onTempUnitToggle={toggleTempUnit}
              />
            )}
            
            {/* Tracked Cities - Show below forecast when user is logged in */}
            {user && !hideUI && (
              <div className="px-4 md:px-8 mb-8">
                <FavoritesPanel 
                  onCitySelect={loadWeatherByCity}
                  demoMode={demoMode}
                  tempUnit={tempUnit}
                />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Flood Effect at Footer */}
      <FloodEffect weatherType={activeWeather} onWaterLevelChange={setFloodLevel} />
      
      {/* Custom Cursor - Always visible, slippery physics active during snow/cold, floats with flood */}
      <SlipperyCursor 
        isActive={
          cursorPhysicsEnabled && (
            activeWeather === 'snow' || 
            (demoMode ? getDemoTemp(demoWeather) <= 5 : (weatherData !== null && weatherData.temp <= 5))
          )
        }
        floodLevel={floodLevel}
        isWindy={isWindy}
        windSpeed={currentWindSpeed}
        physicsEnabled={cursorPhysicsEnabled}
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      
      {/* Account Settings Modal */}
      <AccountSettingsModal 
        isOpen={showAccountSettingsModal}
        onClose={() => setShowAccountSettingsModal(false)}
      />
      
      {/* Toast Notifications */}
      <Toaster />
      </div>
      {isTransitioning && (
        <div className="fixed inset-0 z-[10000] pointer-events-none animate-whiteFlash" />
      )}
    </>
  );
}

// Helper function to get demo temperatures based on weather type
function getDemoTemp(weather: WeatherType): number {
  switch (weather) {
    case 'hot':
      return 38;
    case 'snow':
      return -5;
    case 'foggy':
      return 8;
    case 'rainy':
      return 15;
    case 'thunderstorm':
      return 18;
    case 'clear-day':
      return 22;
    case 'clear-night':
      return 16;
    case 'cloudy':
      return 20;
    default:
      return 20;
  }
}