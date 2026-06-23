#!/bin/bash
set -e

# Ignore SIGWINCH — Render sends this during deploys and it kills Apache prematurely
trap '' SIGWINCH

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Start Apache
exec "$@"
