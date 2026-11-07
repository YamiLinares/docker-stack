/**
 * Foto del producto con next/image: el navegador recibe una versión WebP del
 * tamaño justo (según `sizes`), con carga diferida salvo en las imágenes
 * marcadas como prioritarias (las que pueden ser el LCP). El contenedor
 * cuadrado reserva el espacio, así que la imagen no provoca saltos (CLS).
 * Si el SKU no tiene foto, se usa la ilustración SVG.
 */
import Image from "next/image";
import { ProductArt } from "@/components/product/product-art";
import { productImage } from "@/lib/product-images";

type Props = {
  sku: string;
  name: string;
  /** Ancho que ocupa la imagen en cada tamaño de pantalla (atributo sizes). */
  sizes: string;
  /** true para la imagen principal visible al cargar (posible LCP). */
  priority?: boolean;
  className?: string;
};

export function ProductPhoto({ sku, name, sizes, priority = false, className = "" }: Props) {
  const image = productImage(sku);
  if (!image) return <ProductArt sku={sku} name={name} className={className} />;

  return (
    <div className={`relative aspect-square w-full overflow-hidden bg-white ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-cover"
      />
    </div>
  );
}
