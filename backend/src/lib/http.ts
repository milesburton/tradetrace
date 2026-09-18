export interface HttpOptions {
  status?: number;
  headers?: Record<string, string>;
}

export function jsonResponse<T>(data: T, options?: HttpOptions): Response {
  const status = options?.status ?? 200;
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, { status });
}

export function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location },
  });
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}
