# Roadmap

Authoritative long-term development roadmap and **sole source of truth for milestone definitions**.
AI-owned. See `AGENTS.md` → Ownership.

**This file owns:** milestone IDs, objectives, deliverables, completion criteria, dependencies, and lifecycle status.  
**This file does not own:** live session execution state (that is `20_PROGRESS.yaml` only).

Do not copy milestone criteria into Progress or Backlog. Progress stores only `current_milestone` (ID) plus execution RAM.

**Status values:** `planned` | `active` | `done` | `cancelled`

**ID conventions:**
- Program milestones: `M1`, `M2`, … (or named phases: `EVAL`, `RC`, etc.)
- Child milestones: `M1.1`, `M1.2`, … under a parent

---

## Index

| ID | Parent | Status | Title |
|----|--------|--------|-------|
| M0 | — | done | Project Scaffolding & Setup |
| M1 | — | done | Database & Models |
| M2 | — | done | Authentication System |
| M3 | — | done | Weather API Integration |
| M4 | — | done | UI & Weather Effects Engine (Core Features) |
| M5 | — | done | Database Migration to Firebase |
| M6 | — | done | Production Deployment & Polish |
| M7 | — | active | Additional Features |

---

## Suggested sequence

All core milestones M0 through M6 are complete. M7 remains for future feature additions.

---

## M5 — Database Migration to Firebase

- **Status:** done
- **Objective:** Migrate existing FreeDB MySQL structure to Firebase (Firestore/Realtime Database).
- **Success criteria:**
  - Firebase SDK integrated (`kreait/firebase-php`).
  - Users, Favorites, and RecentSearches are stored and retrieved from Firebase.
  - Authentication flow continues to work seamlessly.
- **Children:** None
- **Done when:** The application can run locally without the expired MySQL database, reading/writing to Firebase instead.

---

## M6 — Production Deployment & Polish

- **Status:** done
- **Objective:** Configure production environment variables and deploy to Vercel/VPS.
- **Success criteria:**
  - Production build succeeds without errors.
  - Vercel/VPS environment configuration verified.
  - End-to-end smoke test passes on production server.
- **Children:** None
- **Done when:** The application is live and accessible in production.

---

## M7 — Additional Features

- **Status:** active
- **Objective:** Email verification, rate limiting, API documentation, and performance monitoring.
- **Notes:** Optional/stretch goals after the core requirements are met.
