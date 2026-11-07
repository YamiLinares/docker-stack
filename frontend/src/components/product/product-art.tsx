/**
 * Ilustración local del producto. La API no ofrece imágenes, así que se usa
 * un SVG en línea según la familia del SKU: no hay peticiones de red ni
 * servicios externos, el tamaño está reservado (sin CLS) y no se presenta
 * como una fotografía real del producto.
 */
import { productFamily } from "@/lib/catalog";

const PALETTES: Record<string, { bg: string; fg: string; accent: string }> = {
  tech: { bg: "#e8eeff", fg: "#2b50d6", accent: "#9fb4ff" },
  home: { bg: "#fdf1e4", fg: "#b45309", accent: "#f6c48d" },
  sport: { bg: "#e7f6ee", fg: "#12784a", accent: "#8fd3b0" },
  books: { bg: "#f3ecfb", fg: "#6d3fb4", accent: "#c9b0ec" },
  accessories: { bg: "#e9f5f7", fg: "#0e7490", accent: "#93d2de" },
  general: { bg: "#efefec", fg: "#4b5563", accent: "#c8c9c4" },
};

const SHAPES: Record<string, React.ReactNode> = {
  tech: (
    <>
      <rect x="28" y="30" width="64" height="42" rx="4" />
      <path d="M20 80h80l-6 8H26z" />
    </>
  ),
  home: (
    <>
      <path d="M30 56 60 32l30 24v34H30z" />
      <path d="M52 90V70h16v20" />
    </>
  ),
  sport: (
    <>
      <circle cx="60" cy="60" r="28" />
      <path d="M36 50c14 6 34 6 48 0M36 70c14-6 34-6 48 0M60 32v56" />
    </>
  ),
  books: (
    <>
      <path d="M30 34h26a6 6 0 0 1 6 6v50a6 6 0 0 0-6-6H30z" />
      <path d="M90 34H68a6 6 0 0 0-6 6v50a6 6 0 0 1 6-6h22z" />
    </>
  ),
  accessories: (
    <>
      <rect x="40" y="26" width="40" height="68" rx="8" />
      <path d="M52 38h16M60 82v.01" />
    </>
  ),
  general: (
    <>
      <path d="M32 44 60 30l28 14v32L60 90 32 76z" />
      <path d="M32 44l28 14 28-14M60 58v32" />
    </>
  ),
};

export function ProductArt({ sku, name, className = "" }: { sku: string; name: string; className?: string }) {
  const { tone, label } = productFamily(sku);
  const palette = PALETTES[tone] ?? PALETTES.general;

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Ilustración de la categoría ${label} para ${name}`}
      className={`aspect-square w-full ${className}`}
      style={{ backgroundColor: palette.bg }}
    >
      <circle cx="96" cy="22" r="30" fill={palette.accent} opacity="0.45" />
      <g fill="none" stroke={palette.fg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {SHAPES[tone] ?? SHAPES.general}
      </g>
    </svg>
  );
}
