import { test, expect } from '@playwright/test';
import { DEFAULT_PASSWORD, SUPER_ADMIN, auth, createAuthorized, login } from '../helpers/api';

test('RN04 - contatos devem ser isolados por autorizada', async ({ request }) => {
  const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
  const a = await createAuthorized(request, admin, 'brasil');
  const b = await createAuthorized(request, admin, 'brasil');
  const tokenA = await login(request, a.ownerEmail, DEFAULT_PASSWORD);
  const tokenB = await login(request, b.ownerEmail, DEFAULT_PASSWORD);
  const emailA = `isolamento.a.${Date.now()}@example.com`;

  expect((await request.post('/api/contacts', {
    headers: auth(tokenA),
    data: { name: 'Contato A', email: emailA, phone: '62999999999' },
  })).status()).toBe(201);

  const responseB = await request.get('/api/contacts', { headers: auth(tokenB) });
  expect(responseB.status()).toBe(200);
  const bodyB = await responseB.json();
  expect(bodyB.items.map((item: { email: string }) => item.email)).not.toContain(emailA);
});
