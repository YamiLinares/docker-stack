/**
 * GET /api/session — estado de sesión para el encabezado.
 * Permite que las páginas del catálogo sean estáticas (no leen cookies en el
 * servidor) y que solo esta pequeña respuesta privada dependa del usuario.
 * Nunca devuelve el token.
 */
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json(
    user ? { authenticated: true, name: user.name } : { authenticated: false },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
