/**
 * Proxy (Next.js 16): comprobación PRELIMINAR de las rutas privadas.
 * Sin cookie de sesión, /checkout y /mis-compras redirigen al login sin
 * renderizar nada. La autorización real la hacen la página (requireToken) y,
 * sobre todo, Laravel al validar el JWT en cada petición.
 */
import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth/session-cookie";

const PRIVATE = ["/checkout", "/mis-compras"];
const GUEST_ONLY = ["/login", "/registro"];

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(`${p}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(TOKEN_COOKIE);

  if (!hasSession && matches(pathname, PRIVATE)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  if (hasSession && matches(pathname, GUEST_ONLY)) {
    return NextResponse.redirect(new URL("/mis-compras", request.url));
  }

  const response = NextResponse.next();
  if (matches(pathname, PRIVATE)) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/checkout/:path*", "/mis-compras/:path*", "/login", "/registro"],
};
