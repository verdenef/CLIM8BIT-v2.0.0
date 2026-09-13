# ⛈️ CLIM8BIT

An 8-bit retro-styled weather web application featuring real-time meteorological data, procedural canvas physics, and a serverless Laravel backend with cloud persistence.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-clim8bit.vercel.app-22c55e?style=for-the-badge&logo=vercel)](https://clim8bit.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Firebase](https://img.shields.io/badge/Firestore-NoSQL-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=for-the-badge)](https://inertiajs.com/)

---

## 🔗 Live Application

**Production URL:** [https://clim8bit.vercel.app](https://clim8bit.vercel.app)  
**System Status:** `HTTP 200 OK` (Health Endpoint: `/up`)

---

## 🎮 Overview

CLIM8BIT translates live weather data into an authentic 8-bit retro gaming experience. It pairs real-time metrics from the OpenWeather API with custom HTML5 Canvas particle systems, interactive cursor physics, and celestial calculations—rendered using the retro *Press Start 2P* pixel typography.

### Key Features

* **Real-Time Weather & Forecasts**: Search across 120+ global cities with autocomplete or use browser geolocation to view current conditions and 5-day / 3-hour forecast intervals.
* **Atmospheric Particle Engine**:
  * **Dynamic Rain**: Variable drop density, wind-angled streaks, and puddle splashes.
  * **Temperature-Aware Snow**: Procedural flakes that stick and accumulate atop UI panels at temperatures ≤5°C.
  * **Thunderstorms**: Randomized screen-wide lightning flashes.
  * **Parallax Fog & Wind**: Multi-layered drifting mist and daytime autumn leaves.
* **Interactive Cursor Physics**:
  * **Ice Mode (≤5°C)**: Momentum-based sliding with reduced friction.
  * **Wind Mode**: Continuous directional push with edge-to-edge screen wrapping.
  * **Flood Mode**: Floating buoyancy and wave bobbing along the footer water line.
* **Astronomical Night Sky**:
  * Accurate 32-phase lunar calculator derived from the current calendar date.
  * Twinkling starfields and animated meteor showers on clear nights.
* **Demo / Sandbox Mode**: Manual override controls to toggle weather types, adjust wind velocity (0–100 km/h), select moon phases, or hide UI elements.
* **User Accounts & Cloud Sync**:
  * Session-based authentication via Laravel Sanctum.
  * Encrypted cookie session handling and user preferences (°C / °F).
  * Favorite cities bookmarking (backend-enforced limit of 3) and recent search history synced to Google Cloud Firestore.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Inertia.js 2.0, TypeScript, Tailwind CSS v4, HTML5 Canvas API |
| **Backend** | Laravel 12, PHP 8.2+, Laravel Sanctum, Guzzle HTTP |
| **Database & Cloud** | Google Cloud Firestore (Cloud REST CRUD), SQLite (Local Fallback) |
| **Deployment** | Vercel Serverless (`vercel-php@0.7.3`), Vite 7 |
| **External APIs** | OpenWeather Current Weather & 5-Day Forecast APIs |

---

## 🏗️ Architecture & Project Structure

```
CLIM8BIT/
├── api/
│   └── index.php             # Vercel serverless entrypoint (/tmp storage & env bootstrap)
├── clim8bit-backend/
│   ├── app/
│   │   ├── Http/Controllers/ # Weather, Auth, Favorites, Profile, RecentSearches
│   │   ├── Models/           # User, Favorite, RecentSearch
│   │   └── Services/         # OpenWeather proxy (key rotation) & FirebaseService
│   ├── database/
│   │   ├── migrations/       # Schema definitions
│   │   └── database.sqlite   # Local SQLite database
│   ├── resources/
│   │   ├── css/              # Retro pixel stylesheets & animations
│   │   ├── js/
│   │   │   ├── components/   # Weather effects, canvas physics, and UI modals
│   │   │   ├── Pages/        # Inertia React views (Weather/Index)
│   │   │   └── app.tsx       # Application bootstrapping
│   │   └── views/
│   │       └── app.blade.php # Root HTML layout
│   ├── routes/
│   │   ├── web.php           # Inertia routes & public API proxies
│   │   └── api.php           # Protected API endpoints
│   └── public/
│       └── build/            # Compiled Vite assets (manifest.json, bundles)
├── vercel.json               # Serverless runtime & static routing configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* **PHP 8.2+** with `pdo_sqlite`, `sodium`, `openssl`, `mbstring`, `fileinfo`
* **Node.js 18+** & npm
* **Composer**
* **OpenWeather API Key** ([openweathermap.org](https://openweathermap.org/api))

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/verdenef/CLIM8BIT-v2.0.0.git
   cd CLIM8BIT-v2.0.0/clim8bit-backend
   ```

2. **Install dependencies:**
   ```bash
   composer install
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Set up database:**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

5. **Configure API Keys in `.env`:**
   ```env
   OPENWEATHER_API_KEY_1=your_openweather_api_key
   # Optional: add up to 4 keys for automatic round-robin rotation
   OPENWEATHER_API_KEY_2=
   OPENWEATHER_API_KEY_3=
   OPENWEATHER_API_KEY_4=

   # Database
   DB_CONNECTION=sqlite

   # Firebase / Firestore (Optional for local development)
   FIREBASE_PROJECT_ID=clim8bit
   FIREBASE_CREDENTIALS=/path/to/service-account.json
   ```

6. **Build assets and start development:**
   ```bash
   # Terminal 1: Laravel backend
   php artisan serve

   # Terminal 2: Vite development server
   npm run dev
   ```

---

## ⚙️ Backend Services

* **API Key Rotation & Resiliency**: The backend maintains a round-robin rotation service supporting up to 4 OpenWeather API keys with fallback error recovery, increasing throughput capacity up to 240 requests/minute.
* **Server-Side Cache**: Successful weather responses are cached (10-minute TTL) to minimize third-party API latency and preserve rate limits.
* **Serverless Compatibility**: Optimized for AWS Lambda / Vercel Serverless by routing views, sessions, and SQLite cache into writable `/tmp` paths and decoupling dependencies from read-only filesystem layers.

---

## 👥 Authors

**Caraga State University** — College of Computing and Information Sciences  
*Course:* IT-112 Systems Integration and Architecture 1 (Section: BRFV1)

* **Van Renfred M. Otacan** — Frontend Lead & Physics Engine
* **Angela Lois A. Calo** — Backend Architect & API Security
* **Eian Gabriel Aguilar** — Database Specialist & DevOps Lead

---

## 📄 License

Academic project — developed for course evaluation and educational purposes.
