/**
 * Normalizes a form-data entry into a string for auth validation.
 */
export function getFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value === "string") {
    return value;
  }

  return "";
}
