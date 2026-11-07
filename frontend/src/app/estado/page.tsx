/**
 * Estado del ecosistema. Se genera en cada visita (connection()) y muestra
 * datos medidos en ese momento: si este servidor Next.js alcanza a Laravel
 * por la red interna de Docker y si Laravel alcanza a MySQL.
 */
import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeading } from "@/components/ui/states";
import { checkBackend, internalApiHost, type HealthCheck } from "@/lib/api/health";

export const metadata: Metadata = {
  title: "Estado del sistema",
  description: "Estado en tiempo real del frontend, la API de Laravel y la base de datos MySQL.",
};

type Level = "ok" | "warn" | "down";

interface ServiceRow {
  name: string;
  role: string;
  level: Level;
  status: string;
  detail: string;
}

function rows(check: HealthCheck, apiHost: string | null): ServiceRow[] {
  const frontend: ServiceRow = {
    name: "frontend",
    role: "Next.js 16 · servidor standalone",
    level: "ok",
    status: "Operativo",
    detail: `Esta página se generó ahora mismo con Node.js ${process.version}.`,
  };

  if (!check.reachable) {
    return [
      frontend,
      { name: "nginx + backend", role: "Nginx → PHP-FPM (Laravel 12)", level: "down", status: "Sin conexión", detail: check.reason },
      { name: "mysql", role: "MySQL 8.4", level: "down", status: "Desconocido", detail: "No se puede comprobar sin la API." },
    ];
  }

  const db = check.body?.database;
  const api: ServiceRow = {
    name: "nginx + backend",
    role: "Nginx → PHP-FPM (Laravel 12)",
    level: check.httpStatus === 200 ? "ok" : "warn",
    status: check.httpStatus === 200 ? "Operativo" : `Responde con HTTP ${check.httpStatus}`,
    detail: `GET ${apiHost ?? "API"}/api/health respondió en ${check.latencyMs} ms.`,
  };
  const mysql: ServiceRow =
    db?.status === "ok"
      ? {
          name: "mysql",
          role: "MySQL 8.4 · volumen persistente",
          level: "ok",
          status: "Operativo",
          detail: `Consulta desde Laravel en ${db.latency_ms ?? "?"} ms · ${db.products ?? 0} productos almacenados.`,
        }
      : { name: "mysql", role: "MySQL 8.4 · volumen persistente", level: "down", status: "No disponible", detail: "Laravel responde, pero no logra consultar la base de datos." };

  return [frontend, api, mysql];
}

const LEVEL_STYLES: Record<Level, { dot: string; text: string }> = {
  ok: { dot: "bg-emerald-500", text: "text-success" },
  warn: { dot: "bg-amber-500", text: "text-warning" },
  down: { dot: "bg-red-500", text: "text-danger" },
};

export default async function StatusPage() {
  await connection();
  const check = await checkBackend();
  const apiHost = internalApiHost();
  const services = rows(check, apiHost);
  const allOk = services.every((s) => s.level === "ok");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeading
        eyebrow="Ecosistema Docker"
        title="Estado del sistema"
        description="Comprobación en vivo de los servicios que componen la tienda. Recarga la página para medir de nuevo."
      />

      <p className={`mb-6 text-sm font-semibold ${allOk ? "text-success" : "text-danger"}`} role="status">
        {allOk ? "Todos los servicios responden." : "Hay servicios con problemas."}
      </p>

      <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {services.map((service) => (
          <li key={service.name} className="grid gap-1 px-5 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
            <div>
              <p className="font-mono text-sm font-semibold text-ink">{service.name}</p>
              <p className="text-xs text-ink-muted">{service.role}</p>
            </div>
            <div>
              <p className={`flex items-center gap-2 text-sm font-semibold ${LEVEL_STYLES[service.level].text}`}>
                <span className={`h-2 w-2 rounded-full ${LEVEL_STYLES[service.level].dot}`} aria-hidden="true" />
                {service.status}
              </p>
              <p className="mt-0.5 text-sm text-ink-muted">{service.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="flujo" className="mt-10">
        <h2 id="flujo" className="font-display text-lg font-bold text-ink">Cómo viaja una petición</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink-muted">
          <li><span className="font-semibold text-ink">1. Navegador → frontend:</span> el navegador solo habla con Next.js (puerto publicado en el equipo).</li>
          <li><span className="font-semibold text-ink">2. frontend → nginx:</span> el servidor Next.js llama a <code className="font-mono text-ink">{apiHost ?? "la API"}</code> por la red interna de Docker. El token JWT viaja en una cookie httpOnly y nunca llega al JavaScript del navegador.</li>
          <li><span className="font-semibold text-ink">3. nginx → backend:</span> Nginx sirve los archivos de <code className="font-mono text-ink">public/</code> y pasa el resto a PHP-FPM por FastCGI.</li>
          <li><span className="font-semibold text-ink">4. backend → mysql:</span> Laravel consulta MySQL, que no tiene ningún puerto publicado fuera de Docker.</li>
        </ol>
      </section>
    </div>
  );
}
