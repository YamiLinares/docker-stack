import { EmptyState } from "@/components/ui/states";

/** Se muestra cuando la sesión es válida pero Laravel indica que el usuario no es administrador. */
export function AdminForbidden() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        title="Acceso solo para administradores"
        message="Tu cuenta puede comprar en la tienda, pero no gestionar productos. Inicia sesión con una cuenta de administrador."
        action={{ href: "/productos", label: "Volver al catálogo" }}
      />
    </div>
  );
}
