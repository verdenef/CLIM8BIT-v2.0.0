# Authentication System

**Purpose:** Handles user identity, session management, registration, and profile settings.

## Architecture
- **Framework:** Laravel 12.
- **Mechanism:** Session-based authentication via Laravel Sanctum (HttpOnly cookies) with file-based driver.
- **Persistence:** Cloud Firestore Native `users` collection synchronized on register, update, and delete.
- **Security:** CSRF Protection, bcrypt password hashing.

## Key Features
- Login, Registration, Logout (seamless restoration from Firestore on device switch or cold starts).
- Profile Management: Email, username, password updates, temperature preferences (°C/°F) synced to Firestore.
- Account Deletion: Requires password verification; purges user document and cascades to Firestore favorites and searches.
