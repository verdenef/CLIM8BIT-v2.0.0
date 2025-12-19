<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WeatherService
{
    protected array $apiKeys;
    protected int $currentKeyIndex = 0;
    protected string $baseUrl = 'https://api.openweathermap.org/data/2.5';
    protected int $cacheTTL;

    public function __construct()
    {
        $this->apiKeys = array_filter([
            config('services.openweather.key_1'),
            config('services.openweather.key_2'),
            config('services.openweather.key_3'),
            config('services.openweather.key_4'),
        ]);

        $this->cacheTTL = config('cache.weather_ttl', 600);
    }

    protected function getApiKey(): string
    {
        if (empty($this->apiKeys)) {
            throw new \RuntimeException('No OpenWeather API keys configured.');
        }

        $key = $this->apiKeys[$this->currentKeyIndex];
        $this->currentKeyIndex = ($this->currentKeyIndex + 1) % count($this->apiKeys);

        return $key;
    }

    public function getWeatherByCity(string $city): array
    {
        $cacheKey = "weather_city_{$city}";

        return Cache::remember($cacheKey, $this->cacheTTL, function () use ($city) {
            $response = Http::get("{$this->baseUrl}/weather", [
                'q' => $city,
                'appid' => $this->getApiKey(),
                'units' => 'metric',
            ]);

            if (!$response || $response->failed()) {
                $statusCode = $response ? $response->status() : 0;
                $errorData = $response ? ($response->json() ?? []) : [];
                
                // OpenWeather API specific error codes
                if ($statusCode === 404) {
                    throw new \Exception("City not found: {$city}");
                } elseif ($statusCode === 401) {
                    throw new \Exception('Invalid API key. Please contact support.');
                } elseif ($statusCode === 429) {
                    throw new \Exception('API rate limit exceeded. Please try again later.');
                } elseif (isset($errorData['message']) && is_string($errorData['message'])) {
                    throw new \Exception($errorData['message']);
                } else {
                    throw new \Exception("Failed to fetch weather data for {$city}");
                }
            }

            $data = $response->json();
            if (!$data) {
                throw new \Exception("Invalid response from weather service for {$city}");
            }
            return $data;
        });
    }

    public function getWeatherByCoords(float $lat, float $lon): array
    {
        $cacheKey = "weather_coords_{$lat}_{$lon}";

        return Cache::remember($cacheKey, $this->cacheTTL, function () use ($lat, $lon) {
            $response = Http::get("{$this->baseUrl}/weather", [
                'lat' => $lat,
                'lon' => $lon,
                'appid' => $this->getApiKey(),
                'units' => 'metric',
            ]);

            if (!$response || $response->failed()) {
                $statusCode = $response ? $response->status() : 0;
                if ($statusCode === 0) {
                    throw new \Exception('Network connection error. Please check your internet connection.');
                } elseif ($statusCode >= 500) {
                    throw new \Exception('Weather service unavailable. Please try again later.');
                } else {
                    throw new \Exception('Failed to fetch weather data from OpenWeather API');
                }
            }

            $data = $response->json();
            if (!$data) {
                throw new \Exception('Invalid response from weather service');
            }
            return $data;
        });
    }

    public function getForecast(string $city): array
    {
        $cacheKey = "forecast_city_{$city}";

        return Cache::remember($cacheKey, $this->cacheTTL, function () use ($city) {
            $response = Http::get("{$this->baseUrl}/forecast", [
                'q' => $city,
                'appid' => $this->getApiKey(),
                'units' => 'metric',
            ]);

            if ($response->failed()) {
                $statusCode = $response->status();
                $errorData = $response->json() ?? [];
                
                // OpenWeather API specific error codes
                if ($statusCode === 404) {
                    throw new \Exception("City not found: {$city}");
                } elseif ($statusCode === 401) {
                    throw new \Exception('Invalid API key. Please contact support.');
                } elseif ($statusCode === 429) {
                    throw new \Exception('API rate limit exceeded. Please try again later.');
                } elseif (isset($errorData['message']) && is_string($errorData['message'])) {
                    throw new \Exception($errorData['message']);
                } else {
                    throw new \Exception("Failed to fetch forecast data for {$city}");
                }
            }

            $data = $response->json();
            if (!$data) {
                throw new \Exception("Invalid response from forecast service for {$city}");
            }
            return $data;
        });
    }
}


