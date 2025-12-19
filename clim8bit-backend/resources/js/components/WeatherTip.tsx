import { Umbrella, Snowflake, Sun, Shirt, CloudFog, Wind } from 'lucide-react';
import type { WeatherType } from '@/Pages/Weather/Index';
import { SnowPanel } from './ui/SnowPanel';

interface WeatherTipProps {
  weather: WeatherType;
  temp: number;
  windSpeed: number;
  isWindy?: boolean;
}

export function WeatherTip({ weather, temp, windSpeed, isWindy }: WeatherTipProps) {
  // Get weather tips based on current conditions
  const getWeatherTips = () => {
    // Use weatherType (from weather prop) for conditions
    if (weather === 'rainy') {
      return { icon: 'umbrella', text: 'BRING UMBRELLA' };
    } else if (weather === 'thunderstorm') {
      return { icon: 'umbrella', text: 'STAY INDOORS • BRING UMBRELLA' };
    } else if (weather === 'snow') {
      return { icon: 'jacket', text: 'WEAR WARM COAT • BOOTS' };
    } else if (temp >= 30) {
      return { icon: 'sunglasses', text: 'SUNSCREEN • STAY HYDRATED' };
    } else if (temp >= 25) {
      return { icon: 'shirt', text: 'LIGHT CLOTHING • SUNGLASSES' };
    } else if (temp <= 5) {
      return { icon: 'jacket', text: 'BUNDLE UP • GLOVES & SCARF' };
    } else if (temp <= 15) {
      return { icon: 'jacket', text: 'WEAR JACKET' };
    } else if (weather === 'foggy') {
      return { icon: CloudFog, text: 'DRIVE CAREFULLY • VISIBILITY LOW' };
    } else if (isWindy || windSpeed > 30) {
      return { icon: 'windSpeed', text: 'WINDY • SECURE LOOSE ITEMS' };
    }
    
    return null;
  };

  const weatherTip = getWeatherTips();

  if (!weatherTip) return null;

  return (
    <div className="px-4 md:px-8 mb-4">
      <div className="max-w-6xl mx-auto">
        <SnowPanel weather={weather} temperature={temp} className="p-6">
          <div className="flex items-center gap-4">
            {weatherTip.icon === 'umbrella' ? (
              <img
                src="/assets/images/icons/umbrella.png"
                alt="Umbrella"
                className="w-8 h-8 object-contain flex-shrink-0"
              />
            ) : weatherTip.icon === 'sunglasses' ? (
              <img
                src="/assets/images/icons/sunglasses.png"
                alt="Sunglasses"
                className="w-8 h-8 object-contain flex-shrink-0 pixel-icon"
              />
            ) : weatherTip.icon === 'shirt' ? (
              <img
                src="/assets/images/icons/shirt.png"
                alt="Shirt"
                className="w-12 h-12 object-contain flex-shrink-0 pixel-icon"
              />
            ) : weatherTip.icon === 'jacket' ? (
              <img
                src="/assets/images/icons/jacket.png"
                alt="Jacket"
                className="w-8 h-8 object-contain flex-shrink-0 pixel-icon"
              />
            ) : weatherTip.icon === 'windSpeed' ? (
              <img
                src="/assets/images/icons/windSpeed.png"
                alt="Windy"
                className="w-8 h-8 object-contain flex-shrink-0 pixel-icon"
              />
            ) : (
              <weatherTip.icon size={32} className="text-white pixel-icon flex-shrink-0" />
            )}
            <div>
              <div className="pixel-text-xs text-white/70 mb-2">WEATHER TIP</div>
              <div className="pixel-text-sm text-white">
                {weatherTip.text}
              </div>
            </div>
          </div>
        </SnowPanel>
      </div>
    </div>
  );
}
