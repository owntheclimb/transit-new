"use client";

import { useState, useEffect, useCallback } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
}

// Mount Vernon, NY coordinates
const LAT = 40.9126;
const LON = -73.8370;

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      // Using Open-Meteo API - free, no API key required
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York`,
        { cache: "no-store" }
      );
      
      if (!response.ok) {
        throw new Error("Weather API error");
      }
      
      const data = await response.json();
      
      const weatherCode = data.current.weather_code;
      const { condition, icon } = getWeatherInfo(weatherCode);
      
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition,
        icon,
        humidity: data.current.relative_humidity_2m,
      });
      setError(null);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Weather unavailable");
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Weather code mapping (WMO codes)
  function getWeatherInfo(code: number): { condition: string; icon: string } {
    if (code === 0) return { condition: "Clear", icon: "☀️" };
    if (code === 1) return { condition: "Mostly Clear", icon: "🌤️" };
    if (code === 2) return { condition: "Partly Cloudy", icon: "⛅" };
    if (code === 3) return { condition: "Overcast", icon: "☁️" };
    if (code >= 45 && code <= 48) return { condition: "Foggy", icon: "🌫️" };
    if (code >= 51 && code <= 55) return { condition: "Drizzle", icon: "🌧️" };
    if (code >= 56 && code <= 57) return { condition: "Freezing Drizzle", icon: "🌧️" };
    if (code >= 61 && code <= 65) return { condition: "Rain", icon: "🌧️" };
    if (code >= 66 && code <= 67) return { condition: "Freezing Rain", icon: "🌨️" };
    if (code >= 71 && code <= 77) return { condition: "Snow", icon: "❄️" };
    if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "🌦️" };
    if (code >= 85 && code <= 86) return { condition: "Snow Showers", icon: "🌨️" };
    if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: "⛈️" };
    return { condition: "Unknown", icon: "🌡️" };
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
        <span>🌡️</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
        <span>🌡️</span>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{weather.icon}</span>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[var(--color-text)]">
            {weather.temp}°
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">F</span>
        </div>
        <div className="text-xs text-[var(--color-text-secondary)]">
          {weather.condition}
        </div>
      </div>
    </div>
  );
}

