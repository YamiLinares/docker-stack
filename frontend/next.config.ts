import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad. La CSP permite solo los orígenes necesarios
 * (este sitio y Stripe.js para el pago).
 *
 * Nota: 'unsafe-inline' en script-src es necesario porque el catálogo se sirve
 * estático/ISR (mejor TTFB y LCP) y una CSP con nonce obliga a renderizar cada
 * página de forma dinámica. Se compensa con el resto de directivas restrictivas.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.stripe.com",
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com https://m.stripe.network https://r.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: process.env.NODE_ENV === "development" ? csp.replace("script-src 'self'", "script-src 'self' 'unsafe-eval'") : csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Modelo de caché clásico de fetch (next.revalidate + tags) con ISR.
  cacheComponents: false,
  // Docker: genera .next/standalone (server.js + solo los módulos que se usan
  // en ejecución), así la imagen final no necesita el node_modules completo.
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Solo se optimizan las fotos locales de productos (sin parámetros extra):
    // nadie puede usar el optimizador del sitio con otras imágenes.
    localPatterns: [{ pathname: "/productos/**", search: "" }],
    // Pocos anchos: menos variantes que generar y guardar en caché.
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [96, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
