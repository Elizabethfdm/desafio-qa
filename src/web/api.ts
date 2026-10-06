import { clearSession, getToken } from './auth';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fields: Record<string, string> = {},
  ) {
    super(code);
  }
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`/api${path}`, { ...options, headers: { ...headers, ...(options.headers as object) } });

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      location.hash = '#/login';
      location.reload();
    }
    let body: { error?: string; fields?: Record<string, string> } = {};
    try {
      body = await response.json();
    } catch {
      /* resposta sem corpo */
    }
    throw new ApiError(response.status, body.error ?? 'GENERIC', body.fields);
  }
  return response;
}

export const api = {
  async login(email: string, password: string): Promise<string> {
    const params = new URLSearchParams({ email, password });
    const response = await request(`/login?${params}`);
    return (await response.json()).token as string;
  },
  async get<T>(path: string): Promise<T> {
    return (await request(path)).json() as Promise<T>;
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    return (await request(path, { method: 'POST', body: JSON.stringify(body) })).json() as Promise<T>;
  },
  async blob(path: string): Promise<Blob> {
    return (await request(path)).blob();
  },
};
