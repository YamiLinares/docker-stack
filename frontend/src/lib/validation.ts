/**
 * Validación en el servidor (Server Actions). Replica las reglas reales de
 * Laravel (RegisterRequest, LoginRequest, StoreOrderRequest) para dar errores
 * claros antes de llamar a la API; la API vuelve a validar siempre.
 */
import { z } from "zod";

const email = z
  .string({ error: "Escribe tu correo electrónico." })
  .trim()
  .toLowerCase()
  .min(1, "Escribe tu correo electrónico.")
  .max(191, "El correo es demasiado largo.")
  .pipe(z.email({ error: "Escribe un correo electrónico válido." }));

export const PASSWORD_RULES = [
  { id: "len", label: "Al menos 8 caracteres", test: (v: string) => v.length >= 8 && v.length <= 72 },
  { id: "lower", label: "Una minúscula", test: (v: string) => /[a-z]/.test(v) },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "digit", label: "Un número", test: (v: string) => /\d/.test(v) },
] as const;

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Escribe tu contraseña." }).min(1, "Escribe tu contraseña.").max(72, "Contraseña no válida."),
});

export const registerSchema = z
  .object({
    name: z
      .string({ error: "Escribe tu nombre." })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120, "El nombre es demasiado largo.")
      .regex(/^[\p{L}\p{M}\s'.-]+$/u, "Usa solo letras, espacios y los signos ' . -"),
    email,
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((v) => v === "" || /^\+?[0-9\s-]{7,20}$/.test(v), "Teléfono no válido (7 a 20 dígitos).")
      .optional(),
    password: z.string({ error: "Escribe una contraseña." }).superRefine((value, ctx) => {
      const failed = PASSWORD_RULES.filter((rule) => !rule.test(value));
      if (failed.length > 0) ctx.addIssue({ code: "custom", message: `La contraseña necesita: ${failed.map((r) => r.label.toLowerCase()).join(", ")}.` });
    }),
    password_confirmation: z.string({ error: "Repite la contraseña." }),
  })
  .refine((data) => data.password === data.password_confirmation, { path: ["password_confirmation"], message: "Las contraseñas no coinciden." });

/** Ítems de la orden: solo id y cantidad (nunca precios: los fija Laravel). */
export const orderItemsSchema = z
  .array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().min(1, "Cantidad mínima: 1.").max(100, "Cantidad máxima por producto: 100."),
    }),
  )
  .min(1, "Tu carrito está vacío.")
  .max(50, "Máximo 50 productos distintos por orden.")
  .refine((items) => new Set(items.map((i) => i.product_id)).size === items.length, "Hay productos repetidos en el carrito.");

export const checkoutIdSchema = z.uuid();

/** Producto (panel de administración). Mismas reglas que StoreProductRequest de Laravel. */
export const productSchema = z.object({
  sku: z
    .string({ error: "Escribe el SKU." })
    .trim()
    .toUpperCase()
    .min(1, "Escribe el SKU.")
    .max(64, "Máximo 64 caracteres.")
    .regex(/^[A-Z0-9-]+$/, "Usa solo letras, números y guiones (por ejemplo TEC-010)."),
  name: z.string({ error: "Escribe el nombre." }).trim().min(2, "Mínimo 2 caracteres.").max(150, "Máximo 150 caracteres."),
  description: z
    .string()
    .trim()
    .max(5000, "Máximo 5000 caracteres.")
    .transform((v) => (v === "" ? null : v)),
  price: z
    .string({ error: "Escribe el precio." })
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Precio no válido: usa punto decimal y hasta 2 decimales (por ejemplo 49.90).")
    .refine((v) => Number(v) >= 0.5, "El precio mínimo es 0.50."),
  stock: z.coerce
    .number({ error: "Escribe el stock." })
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser negativo.")
    .max(1_000_000, "Máximo 1 000 000 unidades."),
  is_active: z.boolean(),
});

export type ProductInput = z.output<typeof productSchema>;

export function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
