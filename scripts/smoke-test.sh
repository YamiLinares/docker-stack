#!/usr/bin/env bash
# Prueba de integración del ecosistema en ejecución (docker compose up -d).
# Recorre el camino real: host → Nginx → Laravel → MySQL y host → Next.js → Nginx.
#
#   bash scripts/smoke-test.sh
#
# Lee los puertos y las credenciales de demostración de .env sin mostrarlas.
# Crea un producto de prueba (SKU SMOKE-<fecha>) y lo elimina al final.
set -uo pipefail
cd "$(dirname "$0")/.."

env_value() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | sed 's/[[:space:]]*#.*$//'; }
FRONT="http://127.0.0.1:$(env_value FRONTEND_PORT)"
API="http://127.0.0.1:$(env_value BACKEND_PORT)/api"
ADMIN_EMAIL="$(env_value SEED_ADMIN_EMAIL)"
ADMIN_PASSWORD="$(env_value SEED_ADMIN_PASSWORD)"
CUSTOMER_EMAIL="$(env_value SEED_CUSTOMER_EMAIL)"
CUSTOMER_PASSWORD="$(env_value SEED_CUSTOMER_PASSWORD)"

PASS=0; FAIL=0
ok()   { PASS=$((PASS + 1)); printf '  \033[32mOK\033[0m    %s\n' "$1"; }
fail() { FAIL=$((FAIL + 1)); printf '  \033[31mFALLA\033[0m %s\n' "$1"; }
check() { if [ "$2" = "$3" ]; then ok "$1 ($2)"; else fail "$1: se esperaba $3 y se obtuvo $2"; fi; }
contains() { if printf '%s' "$2" | grep -q -- "$3"; then ok "$1"; else fail "$1: no contiene «$3»"; fi; }

# request MÉTODO URL [TOKEN] [JSON] → deja el código en $CODE y el cuerpo en $BODY
request() {
  local args=(-s -o /tmp/smoke-body -w '%{http_code}' -X "$1" -H 'Accept: application/json')
  [ -n "${3:-}" ] && args+=(-H "Authorization: Bearer $3")
  [ -n "${4:-}" ] && args+=(-H 'Content-Type: application/json' --data "$4")
  CODE=$(curl "${args[@]}" "$2"); BODY=$(cat /tmp/smoke-body)
}
token_of() { printf '%s' "$1" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p'; }
id_of() { printf '%s' "$1" | sed -n 's/^{"data":{"id":\([0-9]*\).*/\1/p'; }

echo "1. Contenedores"
for service in mysql backend nginx frontend; do
  health=$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q "$service")" 2>/dev/null)
  check "$service healthy" "$health" "healthy"
done
check "migrate terminó correctamente" "$(docker compose ps -a migrate --format '{{.ExitCode}}')" "0"

echo "2. API (Nginx → Laravel → MySQL)"
request GET "$API/health"; check "GET /api/health" "$CODE" 200
contains "Laravel consulta MySQL" "$BODY" '"database":{"status":"ok","driver":"mysql"'
request GET "$API/products?per_page=5"; check "GET /api/products" "$CODE" 200
request GET "$API/products/999999"; check "Producto inexistente" "$CODE" 404
request GET "http://127.0.0.1:$(env_value BACKEND_PORT)/.env"; check "Nginx no sirve .env" "$CODE" 404
request GET "http://127.0.0.1:$(env_value BACKEND_PORT)/../composer.json"; check "Nginx no sirve archivos fuera de public/" "$CODE" 404

echo "3. CRUD de productos (administrador)"
request POST "$API/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"
check "Login de administrador" "$CODE" 200
ADMIN_TOKEN=$(token_of "$BODY")
SKU="SMOKE-$(date +%s)"
request POST "$API/products" "" "{\"sku\":\"$SKU\",\"name\":\"Producto de prueba\",\"price\":\"10.00\",\"stock\":3}"
check "Crear sin token" "$CODE" 401
request POST "$API/products" "$ADMIN_TOKEN" "{\"sku\":\"$SKU\",\"name\":\"Producto\",\"price\":\"0.10\",\"stock\":-1}"
check "Crear con datos no válidos" "$CODE" 422
contains "Errores por campo" "$BODY" '"price"'
request POST "$API/products" "$ADMIN_TOKEN" "{\"sku\":\"$SKU\",\"name\":\"Producto de prueba\",\"description\":\"Creado por smoke-test\",\"price\":\"10.00\",\"stock\":3,\"is_active\":true}"
check "Crear producto" "$CODE" 201
ID=$(id_of "$BODY")
request GET "$API/products/$ID"; check "Leer producto creado" "$CODE" 200
request PUT "$API/products/$ID" "$ADMIN_TOKEN" '{"name":"Producto de prueba editado","price":"12.50","stock":7}'
check "Actualizar producto" "$CODE" 200
contains "Cambio guardado" "$BODY" '"price":"12.50"'
ROW=$(docker compose exec -T mysql sh -c "MYSQL_PWD=\"\$MYSQL_PASSWORD\" mysql -N -u\"\$MYSQL_USER\" \"\$MYSQL_DATABASE\" -e \"select concat(name,'|',price,'|',stock) from products where id=$ID\"" 2>/dev/null | tr -d '\r')
check "Fila en MySQL" "$ROW" "Producto de prueba editado|12.50|7"

request POST "$API/auth/login" "" "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASSWORD\"}"
CUSTOMER_TOKEN=$(token_of "$BODY")
request DELETE "$API/products/$ID" "$CUSTOMER_TOKEN"; check "Cliente no puede eliminar" "$CODE" 403

request DELETE "$API/products/$ID" "$ADMIN_TOKEN"; check "Eliminar producto" "$CODE" 204
request GET "$API/products/$ID"; check "Producto eliminado ya no se ve" "$CODE" 404

echo "4. Frontend (Next.js → Nginx por la red interna)"
request GET "$FRONT/api/health"; check "GET /api/health del frontend" "$CODE" 200
request GET "$FRONT/"; check "Portada" "$CODE" 200
contains "Portada con productos de la API" "$BODY" 'Productos destacados'
request GET "$FRONT/productos"; check "Catálogo" "$CODE" 200
request GET "$FRONT/estado"; check "Página de estado" "$CODE" 200
contains "Todos los servicios responden" "$BODY" 'Todos los servicios responden'
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$FRONT/admin/productos")
check "Panel sin sesión redirige al login" "$CODE" 307

echo "5. Seguridad de las imágenes"
check "MySQL sin puertos publicados en el host" "$(docker port "$(docker compose ps -q mysql)")" ""
check "Backend (PHP-FPM) sin puertos publicados" "$(docker port "$(docker compose ps -q backend)")" ""
check "Usuario del backend" "$(docker compose exec -T backend whoami | tr -d '\r')" "www-data"
check "Usuario de nginx" "$(docker compose exec -T nginx whoami | tr -d '\r')" "nginx"
check "Usuario del frontend" "$(docker compose exec -T frontend whoami | tr -d '\r')" "node"
check ".env fuera de la imagen backend" "$(docker compose exec -T backend sh -c 'test -e .env && echo existe || echo no')" "no"
check ".env fuera de la imagen frontend" "$(docker compose exec -T frontend sh -c 'test -e .env && echo existe || echo no')" "no"
check "Sin Composer en runtime" "$(docker compose exec -T backend sh -c 'command -v composer || echo no')" "no"
check "Sin Node.js en runtime de Laravel" "$(docker compose exec -T backend sh -c 'command -v node || echo no')" "no"
check "Sin compilador en runtime de Laravel" "$(docker compose exec -T backend sh -c 'command -v gcc || echo no')" "no"
check "Sin código fuente en el frontend" "$(docker compose exec -T frontend sh -c 'test -d src && echo existe || echo no')" "no"
check "Sin pruebas en la imagen de Laravel" "$(docker compose exec -T backend sh -c 'test -d tests && echo existe || echo no')" "no"
check "Sin dependencias de desarrollo (PHPUnit)" "$(docker compose exec -T backend sh -c 'test -d vendor/phpunit && echo existe || echo no')" "no"

echo
echo "Resultado: $PASS correctas, $FAIL fallidas"
[ "$FAIL" -eq 0 ]
