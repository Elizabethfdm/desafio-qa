import { test, expect } from '@playwright/test';
import { SUPER_ADMIN, auth, login } from '../helpers/api';

test.describe('RN14 - Autenticação e sessão', () => {
  test('deve autenticar o Super Admin com credenciais válidas', async ({ request }) => {
    const response = await request.post('/api/login', { data: SUPER_ADMIN });
    expect(response.status()).toBe(200);
    expect((await response.json()).token).toBeTruthy();
  });

  test('deve rejeitar credenciais inválidas', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { email: SUPER_ADMIN.email, password: 'senha-incorreta' },
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'INVALID_CREDENTIALS' });
  });

  test('deve exigir token em rota protegida', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'UNAUTHORIZED' });
  });

  test('deve rejeitar token inválido', async ({ request }) => {
    const response = await request.get('/api/products', { headers: auth('token-invalido') });
    expect(response.status()).toBe(401);
  });

  test('Super Admin não deve acessar dados de uma autorizada', async ({ request }) => {
    const token = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const response = await request.get('/api/contacts', { headers: auth(token) });
    expect(response.status()).toBe(403);
  });
});
