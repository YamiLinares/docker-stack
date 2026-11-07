import { EmptyState } from "@/components/ui/states";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <EmptyState
        title="Producto no encontrado"
        message="Este producto no existe o ya no está disponible en la tienda."
        action={{ href: "/productos", label: "Volver al catálogo" }}
      />
    </div>
  );
}
