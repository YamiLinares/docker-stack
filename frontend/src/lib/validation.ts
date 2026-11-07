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

export function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
