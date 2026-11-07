/**
 * GET /api/health — comprobación de vida del servidor Next.js para el
 * HEALTHCHECK de Docker. No depende de Laravel: si la API cae, el frontend
 * sigue sano y muestra el problema al usuario en lugar de reiniciarse.
 */
import { connection } from "next/server";

export async function GET() {
  await connection();
  return Response.json({ status: "ok", service: "frontend" }, { headers: { "Cache-Control": "no-store" } });
}
