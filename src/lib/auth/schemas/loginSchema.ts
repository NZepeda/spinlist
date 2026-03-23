import { z } from "zod";
import { createAuthActionState } from "../actionState";
import type { AuthValidationResult } from "./authValidationResult";
import { mapAuthFieldErrors } from "./mapAuthFieldErrors";

/**
 * Captures the canonical login form values after normalization.
 */
export interface LoginActionInput {
  email: string;
  password: string;
}

const loginActionSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Validates normalized login values and returns typed input or action state.
 */
export function validateLoginActionInput(
  values: LoginActionInput,
): AuthValidationResult<LoginActionInput> {
  const parsedValues = loginActionSchema.safeParse(values);

  if (!parsedValues.success) {
    return {
      success: false,
      state: createAuthActionState(
        mapAuthFieldErrors(parsedValues.error.flatten().fieldErrors),
      ),
    };
  }

  return {
    success: true,
    data: parsedValues.data,
  };
}
