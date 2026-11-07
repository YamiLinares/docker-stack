/** Resultado tipado de las Server Actions (nunca incluye tokens ni secretos). */
export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]>; fields?: Record<string, string> }
  | { status: "success"; message: string };

export const IDLE: ActionState = { status: "idle" };
