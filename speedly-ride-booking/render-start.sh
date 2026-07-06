#!/bin/bash
# Speedly - Render startup script
# Use as Render Start Command: chmod +x start.sh && ./start.sh

set -e

echo "[Speedly] Creating required directories..."
mkdir -p storage/app/public/profile-pictures
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views

echo "[Speedly] Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "[Speedly] Optimizing..."
php artisan config:cache
php artisan route:cache

echo "[Speedly] Running migrations..."
php artisan migrate --force

echo "[Speedly] Starting..."
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
