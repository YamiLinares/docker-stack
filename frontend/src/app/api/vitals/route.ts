/**
 * POST /api/vitals — recibe métricas Web Vitals del navegador.
 * Valida el formato y solo registra nombre, valor, calificación y ruta
 * (nada de datos personales). En un proyecto real se enviarían a un servicio
 * de analítica; aquí quedan en los logs del servidor.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const metricSchema = z.object({
  name: z.enum(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]),
  value: z.number().finite().min(0).max(600_000),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  path: z.string().max(200).regex(/^\/[\w\-/[\]]*$/),
});

export async function POST(request: NextRequest) {
  const text = await request.text();
  if (text.length > 1_000) return new NextResponse(null, { status: 413 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const result = metricSchema.safeParse(parsed);
  if (!result.success) return new NextResponse(null, { status: 400 });

  const { name, value, rating, path } = result.data;
  console.info(`[web-vitals] ${name}=${value} (${rating}) ${path}`);
  return new NextResponse(null, { status: 204 });
}
