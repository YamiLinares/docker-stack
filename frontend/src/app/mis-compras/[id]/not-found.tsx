import { EmptyState } from "@/components/ui/states";

export default function OrderNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <EmptyState title="Orden no encontrada" message="Esta orden no existe o no pertenece a tu cuenta." action={{ href: "/mis-compras", label: "Ver mis compras" }} />
    </div>
  );
}
