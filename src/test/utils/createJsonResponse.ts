/**
 * Creates a JSON response for mocked fetch calls.
 *
 * @param body - The JSON payload to return.
 * @param init - Optional response metadata.
 * @returns A Response instance with a JSON body.
 */
export function createJsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}
