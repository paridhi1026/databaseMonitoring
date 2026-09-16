/**
 * CERN DBS REST API Client
 * Encapsulates HTTP communications with CERN DBS / dbs2go services.
 */

export class DBSApiError extends Error {
  public status?: number;
  public endpoint?: string;

  constructor(message: string, status?: number, endpoint?: string) {
    super(message);
    this.name = 'DBSApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchFromDBS<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  overrideBaseUrl?: string
): Promise<T> {
  const baseUrl = overrideBaseUrl || import.meta.env.VITE_API_BASE_URL || localStorage.getItem('cern_dbs_api_base_url') || '';

  if (!baseUrl || baseUrl.trim() === '') {
    throw new DBSApiError('No API base URL configured. Connect a CERN data service to proceed.');
  }

  const url = new URL(endpoint, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CERN-Data-Management-Web/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new DBSApiError(
        `CERN DBS API Error (${response.status} ${response.statusText}): ${errorText || 'Server error'}`,
        response.status,
        endpoint
      );
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof DBSApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new DBSApiError(`Request to CERN DBS API timed out after ${DEFAULT_TIMEOUT_MS}ms.`, 408, endpoint);
    }
    const message = err instanceof Error ? err.message : 'Network error connecting to CERN DBS backend';
    throw new DBSApiError(message, 0, endpoint);
  }
}
