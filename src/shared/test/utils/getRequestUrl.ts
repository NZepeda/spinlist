/**
 * Normalizes a mocked fetch input into a comparable URL string.
 *
 * @param input - The fetch input value passed to the mock.
 * @returns The request URL string.
 */
export function getRequestUrl(input: string | URL | Request): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}
