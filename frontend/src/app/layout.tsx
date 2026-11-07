import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WebVitals } from "@/components/web-vitals";
import "./globals.css";

// next/font descarga la fuente en la compilación y la sirve desde el propio
// dominio (con precarga), display "swap" y métricas de respaldo ajustadas (menos CLS).
// Una sola familia variable para textos y títulos: menos bytes antes del LCP.
const body = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "NovaShop — Tecnología, hogar y más", template: "%s · NovaShop" },
  description: "Tienda en línea de demostración: catálogo, carrito y pagos con Stripe sobre una API REST en Laravel 12.",
  openGraph: { type: "website", locale: "es_ES", siteName: "NovaShop" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-lg bg-ink px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Saltar al contenido
        </a>
        <WebVitals />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
