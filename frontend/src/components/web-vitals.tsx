"use client";

/**
 * Medición real de Core Web Vitals (LCP, INP, CLS, FCP, TTFB) en el navegador
 * del usuario con useReportWebVitals. Envía cada métrica a /api/vitals con
 * sendBeacon (no bloquea la interacción) y la deja en la consola en desarrollo.
 */
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value) / (metric.name === "CLS" ? 1000 : 1),
      rating: metric.rating,
      path: window.location.pathname,
    });
    if (process.env.NODE_ENV === "development") console.info(`[web-vitals] ${body}`);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/vitals", new Blob([body], { type: "application/json" }));
  });
  return null;
}
