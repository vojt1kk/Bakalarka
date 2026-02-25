FROM php:8.2-cli-alpine

# Install PHP extensions + Node.js (Wayfinder needs php during npm build)
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd zip bcmath opcache pcntl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# PHP dependencies (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Node dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Minimal .env so Wayfinder artisan command works during npm build
RUN cp .env.example .env && php artisan key:generate --force

# Build frontend (Wayfinder Vite plugin calls php artisan wayfinder:generate)
RUN npm run build

# Post-install scripts, storage link, permissions
RUN composer run-script post-autoload-dump \
    && php artisan storage:link \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Remove build-time .env — runtime uses Render environment variables
RUN rm .env

USER www-data

EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
