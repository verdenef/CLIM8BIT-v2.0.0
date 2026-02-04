#!/bin/bash
# Vercel build script for Laravel. Install (composer + npm) is done by Vercel installCommand.
set -e

echo "Starting Vercel build..."

# Build frontend assets (vendor and node_modules already from installCommand)
npm run build

# Generate APP_KEY only if not set (set APP_KEY in Vercel env for production)
if [ -z "$APP_KEY" ]; then
  echo "WARNING: APP_KEY not set. Set it in Vercel Environment Variables."
  php artisan key:generate --force || true
fi

# Optional Laravel optimizations (may be read-only on Vercel)
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

echo "Build completed."
