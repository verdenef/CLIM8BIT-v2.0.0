# Database System

**Purpose:** Schema management, data models, and persistence.

## Architecture
- **Primary Cloud Datastore:** Google Cloud Firestore Native (`asia-southeast1`).
- **Local Application Cache:** SQLite 3 (replacing expired FreeSQLDatabase MySQL).
- **Client Integration:** `kreait/firebase-php` 7.24 + `App\Services\FirebaseService` utilizing Google Auth OAuth2 service account tokens over Firestore REST API (zero C-extension dependencies).

## Schema & Collections
- **`users`:** User documents containing `id`, `name`, `email`, `password` (bcrypt hash), `temperature_unit` ('C' or 'F'), `created_at`, `updated_at`.
- **`favorites`:** Saved cities containing `id`, `user_id`, `city`, `country`, `nickname`, `created_at`, `updated_at` (max 3 per user).
- **`recent_searches`:** Recent search documents containing `id`, `user_id`, `city`, `country`, `searched_at` (max 10 retained per user).

## Design & Invariants
- Dual-layer Cloud-First Cache-Local Pattern: Writes immediately commit to Firestore and local model. Reads restore from Firestore on cache misses.
- Max 3 favorites per user invariant enforced at controller and database level.
- Cascade deletions: deleting a user purges documents from Firestore.
