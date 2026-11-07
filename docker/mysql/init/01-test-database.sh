#!/bin/bash
# Se ejecuta UNA sola vez, cuando el volumen de MySQL está vacío (primer arranque).
# Crea la base de datos de pruebas que usa phpunit.xml del backend y da acceso
# al usuario de la aplicación solo sobre ella.
#
# No contiene credenciales: usa las variables que ya recibe el contenedor
# (MYSQL_ROOT_PASSWORD, MYSQL_USER). La contraseña se pasa por MYSQL_PWD
# para que no aparezca en la lista de procesos.
set -euo pipefail

MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --protocol=socket -uroot <<-EOSQL
    CREATE DATABASE IF NOT EXISTS \`ecommerce_api_laravel12_test\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    GRANT ALL PRIVILEGES ON \`ecommerce_api_laravel12_test\`.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "Base de datos de pruebas lista para ${MYSQL_USER}."
