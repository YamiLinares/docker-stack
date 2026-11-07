#!/bin/sh
# Punto de entrada de la imagen de Laravel.
#
# Las cachés de configuración, rutas, vistas y eventos se generan al ARRANCAR,
# no durante el build: así usan las variables de entorno reales del contenedor
# y la imagen no guarda ningún secreto. Solo se hace al iniciar PHP-FPM; los
# comandos puntuales (migraciones, seeders) leen el entorno directamente.
set -e

if [ "$1" = "php-fpm" ]; then
    php artisan optimize --no-ansi
fi

exec "$@"
