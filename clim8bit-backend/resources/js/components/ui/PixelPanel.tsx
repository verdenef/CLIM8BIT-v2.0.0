import type { ReactNode } from "react";
import type { WeatherType } from "@/Pages/Weather/Index";

interface PixelPanelProps {
  children: ReactNode;
  className?: string;
  weather: WeatherType;
}

export function PixelPanel({ children, className = "", weather }: PixelPanelProps) {
  const isWet = weather === "rainy" || weather === "thunderstorm";

  return (
    <div className={`pixel-panel ${isWet ? "wet-panel" : ""} ${className}`}>
      {children}
    </div>
  );
}