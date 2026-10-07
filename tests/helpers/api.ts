import { APIRequestContext, expect } from '@playwright/test';

export const SUPER_ADMIN = {
  email: process.env.SUPERADMIN_EMAIL ?? 'superadmin@example.com',
  password: process.env.SUPERADMIN_PASSWORD ?? 'Admin@123',
};

export const DEFAULT_PASSWORD = process.env.DEFAULT_EMPLOYEE_PASSWORD ?? 'Senha@123';

export async function login(request: APIRequestContext, email: string, password: string): Promise<string> {
  const response = await request.post('/api/login', { data: { email, password } });
  expect(response.status(), `Falha no login de ${email}`).toBe(200);
  const body = await response.json();
  return body.token;
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createAuthorized(
  request: APIRequestContext,
  token: string,
  country: 'brasil' | 'argentina' | 'colombia',
  suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`,
) {
  const ownerEmail = `owner.${country}.${suffix}@example.com`;
  const response = await request.post('/api/authorizeds', {
    headers: auth(token),
    data: {
      authorizedName: `Autorizada ${country} ${suffix}`,
      ownerName: `Owner ${country}`,
      ownerEmail,
      country,
    },
  });
  expect(response.status()).toBe(201);
  return { ...(await response.json()), ownerEmail };
}

export async function createEmployee(
  request: APIRequestContext,
  token: string,
  role: 'Atendente' | 'Proprietário' = 'Atendente',
  suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`,
) {
  const email = `employee.${suffix}@example.com`;
  const response = await request.post('/api/employees', {
    headers: auth(token),
    data: { name: `Employee ${suffix}`, email, role },
  });
  expect(response.status()).toBe(201);
  return { ...(await response.json()), email };
}
