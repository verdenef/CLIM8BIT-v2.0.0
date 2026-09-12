# Project

Authoritative file for project intent. See `AGENTS.md` → Ownership.

**Ownership:** Humans own vision and intent. AI may reorganize, summarize, clarify, and maintain this document. AI must never change intent without explicit human approval.

Fill sections when decided. Use `_TBD_` until then. `_TBD_` means unknown — do not invent content.

If Vision is still `_TBD_`, Empty Brain Protocol in `AGENTS.md` applies.

---

## Vision

A full-stack weather application featuring advanced weather-responsive animations, interactive physics, pixel-art aesthetics, and a robust Laravel backend with API key rotation and caching.

<!-- What the project is trying to achieve at a high level. -->

## Research Goal

_TBD_

<!-- What is being explored or proven (if applicable). -->

## Scope

- In scope: Real-time weather data integration (OpenWeather API), CSS/GPU-accelerated weather particle effects, Session-based authentication via Laravel Sanctum, 5-Day Forecast, City Search, Geolocation, Demo Mode.
- Out of scope: Mobile native applications.

<!-- In scope / out of scope. Keep concise. -->

## Target Environment & Stack

- Web (React 19 + Tailwind CSS + Inertia.js)
- Backend: Laravel 12 (PHP 8.2+)
- Database: Firebase (Migrating from MySQL)
- Hosted Environments: Vercel for Frontend, custom/VPS for Backend

<!-- e.g. Web (Next.js/Node), Cloud/Docker (Go/Postgres), Mobile (Flutter), Game Engine (Unity 6), etc. -->

## Core User Workflow / Domain Loop

Users search for a city or use geolocation to fetch real-time weather and forecasts. The UI dynamically changes weather effects (snow, rain, etc.) based on current conditions, and allows users to save favorites or view recent searches.

<!-- The primary end-to-end user workflow or domain loop that this system powers. -->

## Constraints

- Retro 8-bit aesthetic (Press Start 2P font).
- Must migrate to Firebase to replace the expired 30-day FreeDB MySQL trial.
- **Deadline**: September 14, 2026 (for the IT112 Activity Kanban lab submission).

<!-- Hard limits: tech, time, design, research, platform. -->

## Success Criteria

- The application is functional and accessible, with a working Firebase database backend, allowing successful grading for the IT112 Kanban Lab Activity.

<!-- How we know the project (or milestone) succeeded. -->
