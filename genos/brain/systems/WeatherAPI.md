# Weather API & Backend System

**Purpose:** Manages external OpenWeather API integrations, performance caching, and API routing.

## Architecture
- **Framework:** Laravel 12.
- **Integration:** OpenWeather API and Geolocation API.

## Key Features
- **Key Rotation:** Uses a round-robin algorithm across 4 `.env` API keys (e.g., `OPENWEATHER_KEY_1` to `4`) to quadruple capacity (240 calls/min).
- **Caching:** 10-minute TTL server-side cache via Laravel Cache, drastically reducing external calls.
- **Error Handling:** Graceful failovers and categorized HTTP error responses (404, 401, 429, 500).
- **Controllers:** `WeatherController`, `FavoriteController`, `RecentSearchController`.
- **Services:** `WeatherService.php` contains the business logic for rotation and caching.
