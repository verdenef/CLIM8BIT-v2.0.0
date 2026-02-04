#!/bin/bash

# Vercel build script for Laravel application
set -e

echo "🚀 Starting Vercel build process..."

# Install PHP dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Install Node.js dependencies
echo "📦 Installing npm dependencies..."
npm ci

# Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

# Note: APP_KEY should be set as environment variable in Vercel dashboard
# If not set, generate one (but this should be done manually and added to env vars)
if [ -z "$APP_KEY" ]; then
    echo "⚠️  WARNING: APP_KEY is not set. Generating a temporary key..."
    echo "⚠️  Please set APP_KEY in Vercel environment variables for production!"
    php artisan key:generate --force || true
fi

# Optimize Laravel for production (only if we can write to bootstrap/cache)
# Note: On Vercel, some cache commands may fail due to read-only filesystem
# This is okay - Vercel will handle caching differently
echo "⚙️ Optimizing Laravel..."
php artisan config:cache 2>/dev/null || echo "⚠️  Config cache skipped (may be read-only filesystem)"
php artisan route:cache 2>/dev/null || echo "⚠️  Route cache skipped (may be read-only filesystem)"
php artisan view:cache 2>/dev/null || echo "⚠️  View cache skipped (may be read-only filesystem)"

# Note: Migrations should be run manually after first deployment
# They are NOT run automatically for security reasons

echo "✅ Build completed successfully!"
