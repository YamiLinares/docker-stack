"use server";

/**
 * Server Actions de autenticación contra Laravel (JWT).
 * Next.js solo las acepta por POST y comprueba que Origin coincida con Host
 * (protección CSRF). El token se guarda en una cookie httpOnly y nunca se
 * devuelve al navegador. No se registran contraseñas ni tokens.
 */
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { ApiError, userMessage } from "@/lib/api/errors";
import { clearSession, getToken, setSession } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/security/redirect";
import { fieldErrorsOf, loginSchema, registerSchema } from "@/lib/validation";
import type { ActionState } from "@/types/action-state";
import type { AuthTokenResponse } from "@/types/api";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
};

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: text(formData, "email"), password: text(formData, "password") });
  const fields = { email: text(formData, "email") ?? "" };
  if (!parsed.success) return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error), fields };

  let response: AuthTokenResponse;
  try {
    response = await apiFetch<AuthTokenResponse>("/auth/login", { method: "POST", body: parsed.data });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "error", message: "Correo o contraseña incorrectos.", fields };
    }
    return { status: "error", message: userMessage(error), fieldErrors: error instanceof ApiError ? error.fieldErrors : undefined, fields };
  }

  await setSession(response.data.access_token, response.data.expires_in, response.data.user);
  redirect(safeNextPath(text(formData, "next"), "/productos"));
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone") ?? "",
    password: text(formData, "password"),
    password_confirmation: text(formData, "password_confirmation"),
  };
  const fields = { name: input.name ?? "", email: input.email ?? "", phone: input.phone };
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error), fields };

  const { phone, ...rest } = parsed.data;
  let response: AuthTokenResponse;
  try {
    response = await apiFetch<AuthTokenResponse>("/auth/register", { method: "POST", body: phone ? { ...rest, phone } : rest });
  } catch (error) {
    // 422 de Laravel (p. ej. correo ya registrado) → errores por campo.
    return { status: "error", message: userMessage(error), fieldErrors: error instanceof ApiError ? error.fieldErrors : undefined, fields };
  }

  await setSession(response.data.access_token, response.data.expires_in, response.data.user);
  redirect(safeNextPath(text(formData, "next"), "/productos"));
}

export async function logoutAction(): Promise<void> {
  const token = await getToken();
  if (token) {
    // Invalida el JWT en Laravel (lista negra); si falla, igualmente se borra la sesión local.
    await apiFetch("/auth/logout", { method: "POST", token }).catch(() => undefined);
  }
  await clearSession();
  redirect("/?sesion=cerrada");
}
