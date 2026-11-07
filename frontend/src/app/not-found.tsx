import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <EmptyState title="Página no encontrada" message="La dirección que buscas no existe." action={{ href: "/", label: "Ir al inicio" }} />
    </div>
  );
}
