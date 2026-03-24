import { z } from "zod";
import { createAuthActionState } from "../actionState";
import type { AuthValidationResult } from "./authValidationResult";
import { mapAuthFieldErrors } from "./mapAuthFieldErrors";

/**
 * Captures the canonical signup form values after normalization.
 */
export interface SignUpActionInput {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const signUpActionSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .regex(/^[a-zA-Z0-9_]{3,20}$/, {
        message:
          "Username must be 3-20 characters (letters, numbers, underscores only)",
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((values, context) => {
    if (
      values.confirmPassword.length > 0 &&
      values.password !== values.confirmPassword
    ) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

/**
 * Validates normalized signup values and returns typed input or action state.
 */
export function validateSignUpActionInput(
  values: SignUpActionInput,
): AuthValidationResult<SignUpActionInput> {
  const parsedValues = signUpActionSchema.safeParse(values);

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
