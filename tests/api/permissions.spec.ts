import { test, expect } from '@playwright/test';
import { DEFAULT_PASSWORD, SUPER_ADMIN, auth, createAuthorized, createEmployee, login } from '../helpers/api';

test.describe('RN01/RN06/RN13 - Permissões', () => {
  test('Atendente deve consultar funcionários, mas não deve cadastrá-los', async ({ request }) => {
    const adminToken = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, adminToken, 'brasil');
    const ownerToken = await login(request, company.ownerEmail, DEFAULT_PASSWORD);
    const attendant = await createEmployee(request, ownerToken, 'Atendente');
    const attendantToken = await login(request, attendant.email, DEFAULT_PASSWORD);

    const list = await request.get('/api/employees', { headers: auth(attendantToken) });
    expect(list.status()).toBe(200);

    const create = await request.post('/api/employees', {
      headers: auth(attendantToken),
      data: { name: 'Não autorizado', email: `forbidden.${Date.now()}@example.com`, role: 'Atendente' },
    });

    // RN06: perfil de consulta não pode criar dados. Atualmente expõe o defeito de autorização do backend.
    expect(create.status()).toBe(403);
  });

  test('Colômbia não deve ter acesso ao módulo Funcionários', async ({ request }) => {
    const adminToken = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, adminToken, 'colombia');
    const ownerToken = await login(request, company.ownerEmail, DEFAULT_PASSWORD);

    const list = await request.get('/api/employees', { headers: auth(ownerToken) });
    expect(list.status()).toBe(403);

    const create = await request.post('/api/employees', {
      headers: auth(ownerToken),
      data: { name: 'Empleado', email: `co.${Date.now()}@example.com`, role: 'Atendente' },
    });
    expect(create.status()).toBe(403);
  });
});
