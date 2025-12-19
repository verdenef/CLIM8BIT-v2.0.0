import { AlertTriangle, Info } from 'lucide-react';
import type { WeatherType } from '@/Pages/Weather/Index';
import { SnowPanel } from './ui/SnowPanel';

interface WeatherAlertProps {
  weather: WeatherType;
  temp: number;
  windSpeed: number;
  humidity: number;
}

export function WeatherAlert({ weather, temp, windSpeed, humidity }: WeatherAlertProps) {
  const getAlerts = () => {
    const alerts: { type: 'warning' | 'info'; message: string; tip: string }[] = [];

    // Temperature alerts - Reorganized to show HOT weather properly
    if (temp > 35) {
      alerts.push({
        type: 'warning',
        message: 'EXTREME HEAT WARNING',
        tip: 'Stay hydrated, avoid prolonged sun exposure, and stay in air-conditioned areas.'
      });
    } else if (temp > 30 && temp <= 35) {
      alerts.push({
        type: 'warning',
        message: 'HIGH TEMPERATURE WARNING',
        tip: 'Drink plenty of water and limit outdoor activities during peak hours.'
      });
    } else if (temp >= 28 && temp <= 30) {
      alerts.push({
        type: 'info',
        message: 'HOT WEATHER ADVISORY',
        tip: 'Stay cool, drink water regularly, and avoid strenuous outdoor activities.'
      });
    }
    
    if (temp < 0) {
      alerts.push({
        type: 'warning',
        message: 'FREEZING CONDITIONS',
        tip: 'Dress in layers, protect exposed skin, and watch for icy surfaces.'
      });
    } else if (temp >= 0 && temp < 5) {
      alerts.push({
        type: 'info',
        message: 'COLD WEATHER ADVISORY',
        tip: 'Wear warm clothing and be careful of slippery roads.'
      });
    }

    // Weather-specific alerts
    if (weather === 'thunderstorm') {
      alerts.push({
        type: 'warning',
        message: 'THUNDERSTORM WARNING',
        tip: 'Stay indoors, avoid open areas, and unplug electronics. Do not use corded phones.'
      });
    } else if (weather === 'rainy') {
      alerts.push({
        type: 'info',
        message: 'RAINY CONDITIONS',
        tip: 'Drive carefully with headlights on. Allow extra time for travel and avoid flooded areas.'
      });
    } else if (weather === 'snow') {
      alerts.push({
        type: 'warning',
        message: 'SNOW CONDITIONS',
        tip: 'Drive slowly, maintain safe distance from other vehicles, and keep emergency supplies in your car.'
      });
    } else if (weather === 'foggy') {
      alerts.push({
        type: 'warning',
        message: 'LOW VISIBILITY',
        tip: 'Use low-beam headlights and fog lights. Drive slowly and increase following distance.'
      });
    } else if (weather === 'hot') {
      // Additional alert for hot weather type
      if (temp < 28) {
        // If demo shows "hot" weather but temp isn't high enough
        alerts.push({
          type: 'info',
          message: 'SUNNY CONDITIONS',
          tip: 'Wear sunscreen, sunglasses, and stay hydrated when outdoors.'
        });
      }
    }

    // Wind alerts
    if (windSpeed > 40) {
      alerts.push({
        type: 'warning',
        message: 'HIGH WIND WARNING',
        tip: 'Secure loose objects outdoors. Avoid parking under trees and be cautious while driving.'
      });
    } else if (windSpeed > 25) {
      alerts.push({
        type: 'info',
        message: 'WINDY CONDITIONS',
        tip: 'Be aware of flying debris and exercise caution when driving high-profile vehicles.'
      });
    }

    return alerts;
  };

  const alerts = getAlerts();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <SnowPanel 
        weather={weather} 
        temperature={temp}
        className="p-6"
      >
        <div className="pixel-text-sm text-white/70 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="pixel-icon" />
          WEATHER ALERTS {alerts.length > 1 && <span className="text-yellow-300">({alerts.length})</span>}
        </div>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div 
              key={index}
              className={`p-4 border-2 ${
                alert.type === 'warning' 
                  ? 'bg-red-500/10 border-red-500/50' 
                  : 'bg-blue-500/10 border-blue-500/50'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                {alert.type === 'warning' ? (
                  <AlertTriangle size={16} className="text-red-400 pixel-icon flex-shrink-0 mt-1" />
                ) : (
                  <Info size={16} className="text-blue-400 pixel-icon flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <div className={`pixel-text-xs mb-2 ${
                    alert.type === 'warning' ? 'text-red-300' : 'text-blue-300'
                  }`}>
                    {alert.message}
                  </div>
                  <div className="pixel-text-xs text-white/70 leading-relaxed">
                    💡 {alert.tip}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SnowPanel>
    </div>
  );
}