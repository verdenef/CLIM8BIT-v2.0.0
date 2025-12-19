import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  CloudFog,
  CloudLightning,
  Wind,
  Umbrella,
  Snowflake,
  Flame,
} from "lucide-react";
import type { WeatherType } from "@/Pages/Weather/Index";
import { SnowPanel } from "./ui/SnowPanel";
import { PixelPanel } from "./ui/PixelPanel";

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
  timezone?: number; // Timezone offset in seconds
}

interface ForecastData {
  day: string;
  temp: number;
  icon: string;
  weatherMain: string;
}

interface WeatherDisplayProps {
  weather: WeatherType;
  currentTime: Date;
  weatherData: WeatherData;
  forecastData: ForecastData[];
  demoMode?: boolean;
  isNight?: boolean;
  isWindy?: boolean;
  tempUnit?: "C" | "F";
  onTempUnitToggle?: () => void;
}

export function WeatherDisplay({
  weather,
  currentTime,
  weatherData,
  forecastData,
  demoMode = false,
  isNight,
  isWindy,
  tempUnit = "C",
  onTempUnitToggle,
}: WeatherDisplayProps) {
  // Convert Celsius to Fahrenheit
  const convertTemp = (celsius: number): number => {
    if (tempUnit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

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

  // Calculate city's local time using timezone offset
  const getCityTime = () => {
    if (!weatherData.timezone && weatherData.timezone !== 0) {
      // Fallback to user's local time if timezone not available
      return currentTime;
    }

    // Get current UTC time
    const now = new Date();
    const utcTime =
      now.getTime() + now.getTimezoneOffset() * 60000;

    // Add the city's timezone offset (in milliseconds)
    const cityTime = new Date(
      utcTime + weatherData.timezone * 1000,
    );
    return cityTime;
  };

  // Get timezone display string (e.g., "UTC+5" or "UTC-8")
  const getTimezoneDisplay = () => {
    if (!weatherData.timezone && weatherData.timezone !== 0) {
      return "";
    }

    const offsetHours = weatherData.timezone / 3600;
    const sign = offsetHours >= 0 ? "+" : "";
    return `UTC${sign}${offsetHours}`;
  };

  const cityTime = getCityTime();
  const timezoneStr = getTimezoneDisplay();

  // Get pixel art icon path for main display
  const mainWeatherIconPath = getWeatherIconPath(
    weatherData.weatherMain,
    weatherData.icon,
    weatherData.temp,
  );
  // Always use SnowPanel to support temperature-based snow piles
  const PanelComponent = SnowPanel;

  // Get weather tips based on current conditions
  const getWeatherTips = () => {
    // In demo mode, use the weather prop directly, otherwise use weatherData
    let temp = weatherData.temp;
    let weatherType = weather; // Use the active weather prop instead of weatherData.weatherMain

    // Map weather type to conditions for demo mode
    if (demoMode) {
      // Get demo temperature based on weather type
      switch (weather) {
        case "hot":
          temp = 38;
          break;
        case "snow":
          temp = -5;
          break;
        case "foggy":
          temp = 8;
          break;
        case "rainy":
          temp = 15;
          break;
        case "thunderstorm":
          temp = 18;
          break;
        case "clear-day":
          temp = 22;
          break;
        case "clear-night":
          temp = 16;
          break;
        case "cloudy":
          temp = 20;
          break;
      }
    }

    // Use weatherType (from weather prop) for conditions
    if (weatherType === "rainy") {
      return { icon: "umbrella", text: "BRING UMBRELLA" };
    } else if (weatherType === "thunderstorm") {
      return {
        icon: "umbrella",
        text: "STAY INDOORS • BRING UMBRELLA",
      };
    } else if (weatherType === "snow") {
      return {
        icon: Snowflake,
        text: "WEAR WARM COAT • BOOTS",
      };
    } else if (temp >= 30) {
      return {
        icon: "sunglasses",
        text: "SUNSCREEN • STAY HYDRATED",
      };
    } else if (temp >= 25) {
      return { icon: "shirt", text: "LIGHT CLOTHING • SUNGLASSES" };
    } else if (temp <= 5) {
      return {
        icon: Snowflake,
        text: "BUNDLE UP • GLOVES & SCARF",
      };
    } else if (temp <= 15) {
      return { icon: "jacket", text: "WEAR JACKET" };
    } else if (weatherType === "foggy") {
      return {
        icon: CloudFog,
        text: "DRIVE CAREFULLY • VISIBILITY LOW",
      };
    } else if (isWindy || weatherData.windSpeed > 30) {
      return { icon: Wind, text: "WINDY • SECURE LOOSE ITEMS" };
    }

    return null;
  };

  const weatherTip = getWeatherTips();

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 pb-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Temperature Display */}
        <div className="md:col-span-2">
          <PanelComponent
            weather={weather}
            temperature={weatherData.temp}
            className="p-[48px] px-[48px] pt-[70px] pb-[32px] md:px-12 md:pt-12 md:pb-15"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="pixel-text-sm text-white/70 mb-2">
                  {cityTime
                    .toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })
                    .toUpperCase()}
                </div>
                <div className="pixel-text-sm text-white/70">
                  {cityTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {timezoneStr && (
                  <div className="pixel-text-xs text-white/60">
                    {timezoneStr}
                  </div>
                )}
              </div>

              <div className="pixel-icon-wrapper">
                <img
                  src={mainWeatherIconPath}
                  alt={weatherData.weatherMain}
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="pixel-text-huge text-white mb-2 flex items-center gap-0.5">
                {convertTemp(weatherData.temp)}°
                {onTempUnitToggle && (
                  <span
                    onClick={onTempUnitToggle}
                    className="cursor-pointer hover:text-yellow-300 transition-colors duration-200 select-none"
                    title={`Switch to ${tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                  >
                    {tempUnit}
                  </span>
                )}
                <img
                  src={convertTemp(weatherData.temp) >= (tempUnit === 'F' ? 86 : 30) 
                    ? "/assets/images/icons/hotTemp.png" 
                    : "/assets/images/icons/coldTemp.png"}
                  alt="Temperature"
                  className="w-12 h-12 mt-2 object-contain"
                />
              </div>
              <div className="pixel-text-lg text-white/90 mb-2">
                {weatherData.description.toUpperCase()}
              </div>
              <div className="pixel-text-xs text-white/60">
                FEELS LIKE {convertTemp(weatherData.feelsLike)}° • HIGH{" "}
                {convertTemp(weatherData.tempMax)}° • LOW{" "}
                {convertTemp(weatherData.tempMin)}°
              </div>
            </div>

            <div className="pixel-text-sm text-white/70">
              {weatherData.city}, {weatherData.country}
            </div>
          </PanelComponent>
        </div>

        {/* Weather Details */}
        <div className="flex flex-col gap-4">
          <PanelComponent
            weather={weather}
            temperature={weatherData.temp}
            className="p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/images/icons/humidity.png"
                alt="Humidity"
                className="w-5 h-5 object-contain"
              />
              <div className="pixel-text-xs text-white/70">
                HUMIDITY
              </div>
            </div>
            <div className="pixel-text-xl text-white">
              {weatherData.humidity}%
            </div>
          </PanelComponent>

          <PanelComponent
            weather={weather}
            temperature={weatherData.temp}
            className="p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/images/icons/windSpeed.png"
                alt="Wind Speed"
                className="w-5 h-5 object-contain"
              />
              <div className="pixel-text-xs text-white/70">
                WIND SPEED
              </div>
            </div>
            <div className="pixel-text-xl text-white">
              {weatherData.windSpeed} KM/H
            </div>
          </PanelComponent>

          <PanelComponent
            weather={weather}
            temperature={weatherData.temp}
            className="p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/images/icons/pressure.png"
                alt="Pressure"
                className="w-5 h-5 object-contain"
              />
              <div className="pixel-text-xs text-white/70">
                PRESSURE
              </div>
            </div>
            <div className="pixel-text-xl text-white">
              {weatherData.pressure} hPa
            </div>
          </PanelComponent>
        </div>

        {/* Forecast */}
        {forecastData.length > 0 && (
          <div className="md:col-span-3">
            <PanelComponent
              weather={weather}
              temperature={weatherData.temp}
              className="p-6"
            >
              <div className="pixel-text-sm text-white/70 mb-6">
                5-DAY FORECAST
              </div>
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                {forecastData.map((forecast, i) => {
                  const weatherIconPath = getWeatherIconPath(
                    forecast.weatherMain,
                    forecast.icon,
                    forecast.temp,
                  );

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="pixel-text-xs text-white/70">
                        {forecast.day}
                      </div>
                      <img
                        src={weatherIconPath}
                        alt={forecast.weatherMain}
                        className="w-6 h-6 object-contain"
                      />
                      <div className="pixel-text-xs text-white">
                        {convertTemp(forecast.temp)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </PanelComponent>
          </div>
        )}
      </div>
    </div>
  );
}