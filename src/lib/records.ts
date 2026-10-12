/** Accept the native list response and the paginated response used by some API providers. */
export function recordsFromResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)) {
    return payload.data as T[];
  }
  throw new Error("The records API returned an unexpected response. Please retry or check the service.");
}

export async function loadRecords<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The records API returned ${response.status}. Please retry or check the service.`);
  return recordsFromResponse<T>(await response.json());
}
