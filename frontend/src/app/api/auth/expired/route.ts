/**
 * GET /api/auth/expired?next=/ruta — la API respondió 401 (token caducado o
 * invalidado). Borra las cookies de sesión y lleva al login con un aviso.
 * Es GET porque llega desde un redirect(); solo elimina la sesión local, así
 * que no puede usarse para dañar al usuario.
 */
import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/security/redirect";

export function GET(request: NextRequest) {
  const login = new URL("/login", request.url);
  login.searchParams.set("sesion", "expirada");
  login.searchParams.set("next", safeNextPath(request.nextUrl.searchParams.get("next")));

  const response = NextResponse.redirect(login);
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(USER_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
