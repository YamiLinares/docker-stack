# syntax=docker/dockerfile:1

# PHP 8.4: el composer.lock de la API incluye paquetes de Symfony 8 que exigen
# PHP >= 8.4.1, por lo que php:8.2-fpm-alpine no puede instalar las dependencias.
ARG PHP_IMAGE=php:8.4-fpm-alpine
ARG NGINX_IMAGE=nginx:1.28-alpine

# ---------- base: PHP-FPM + extensiones que faltan en la imagen oficial ----------
# La imagen oficial ya trae mbstring, openssl, tokenizer, xml, ctype, json y OPcache.
# Solo se compilan pdo_mysql (MySQL) y bcmath (cálculo de importes en App\Support\Money).
# Las herramientas de compilación se instalan y se eliminan en la misma capa.
FROM ${PHP_IMAGE} AS base
RUN set -eux; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS; \
    docker-php-ext-install -j"$(nproc)" pdo_mysql bcmath; \
    apk del --no-network .build-deps; \
    rm -rf /tmp/pear
WORKDIR /var/www/html

# ---------- vendor: dependencias de producción ----------
# Composer se copia de su imagen oficial solo en esta etapa. Se usa el PHP de
# "base" (8.4) para que la resolución coincida con el runtime. Al copiar
# primero composer.json y composer.lock, esta capa se reutiliza mientras no
# cambien las dependencias, aunque cambie el código.
FROM base AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-progress

# ---------- build: código + autoloader optimizado ----------
FROM vendor AS build
COPY . .
# --classmap-authoritative: el autoloader solo consulta el mapa de clases generado
# (sin buscar archivos en disco). package:discover se ejecuta como script de Composer.
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative \
    && rm -rf tests docker phpunit.xml .env.example .env.testing.example

# ---------- test: misma base + dependencias de desarrollo para PHPUnit ----------
# Solo se usa para ejecutar las pruebas contra el MySQL del ecosistema
# (docker compose --profile test run --rm backend-tests). No llega a producción.
FROM vendor AS test
RUN --mount=type=cache,target=/tmp/composer-cache \
    composer install --prefer-dist --no-progress --no-scripts --no-autoloader
COPY . .
# .env vacío: la configuración llega por variables de entorno. Sin el archivo,
# phpdotenv intenta leerlo y PHPUnit 11 reporta el aviso en cada prueba.
RUN composer dump-autoload --optimize && touch .env
CMD ["php", "artisan", "test"]

# ---------- web: Nginx con los archivos públicos de Laravel ----------
FROM ${NGINX_IMAGE} AS web
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /var/www/html/public /var/www/html/public
USER nginx
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8000/up || exit 1

# ---------- runtime: PHP-FPM de producción (etapa por defecto) ----------
FROM base AS runtime
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php/app.ini $PHP_INI_DIR/conf.d/zz-app.ini
COPY docker/php/fpm-pool.conf /usr/local/etc/php-fpm.d/zz-app.conf
COPY --chmod=755 docker/php/entrypoint.sh /usr/local/bin/app-entrypoint

# El código pertenece a root (solo lectura para PHP); únicamente storage/ y
# bootstrap/cache/ pertenecen a www-data, que es quien ejecuta PHP-FPM.
COPY --from=build /var/www/html /var/www/html
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R u=rwX,g=rX,o= storage bootstrap/cache

USER www-data
EXPOSE 9000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD php -r "exit(@fsockopen('127.0.0.1', 9000) ? 0 : 1);"
ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]
