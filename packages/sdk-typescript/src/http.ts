const RETRY_DELAYS_MS = [200, 400, 800];
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export interface HttpResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function post<T = unknown>(
  url: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<HttpResponse<T>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]!);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
    } catch (err) {
      lastError = err;
      // Network error — retry
      continue;
    }

    let data: T;
    try {
      data = await response.json() as T;
    } catch {
      data = {} as T;
    }

    if (response.ok || !RETRYABLE_STATUSES.has(response.status)) {
      return { ok: response.ok, status: response.status, data };
    }

    lastError = new Error(`HTTP ${response.status}`);
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
