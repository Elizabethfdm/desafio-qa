export interface Claims {
  sub: string;
  email: string;
  name: string;
  role: string;
  roleToLabel: string;
  language: string;
  country: string;
  authorizedId: string | null;
  authorizedName: string | null;
  permissions: Record<string, string>;
}

const TOKEN_KEY = 'desafio_qa_token';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Decodifica o payload do JWT (a assinatura é validada somente pelo backend). */
export function getClaims(): Claims | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Claims;
  } catch {
    return null;
  }
}

/** Leitura vale para qualquer acesso; escrita exige "read/write". */
export function can(resource: string, mode: 'read' | 'write'): boolean {
  const access = getClaims()?.permissions?.[resource];
  if (!access) return false;
  return mode === 'read' ? true : access === 'read/write';
}
