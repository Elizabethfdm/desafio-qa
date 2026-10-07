import { test, expect } from '@playwright/test';
import { DEFAULT_PASSWORD, SUPER_ADMIN, auth, createAuthorized, login } from '../helpers/api';

test.describe('RN09/RN10/RN11 - Contatos', () => {
  test('deve normalizar telefone brasileiro', async ({ request }) => {
    const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, admin, 'brasil');
    const owner = await login(request, company.ownerEmail, DEFAULT_PASSWORD);
    const response = await request.post('/api/contacts', {
      headers: auth(owner),
      data: { name: 'Contato BR', email: `br.${Date.now()}@example.com`, phone: '62999999999' },
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).phone).toBe('+5562999999999');
  });

  test('deve validar e normalizar telefone argentino', async ({ request }) => {
    const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, admin, 'argentina');
    const owner = await login(request, company.ownerEmail, DEFAULT_PASSWORD);
    const response = await request.post('/api/contacts', {
      headers: auth(owner),
      data: { name: 'Contacto AR', email: `ar.${Date.now()}@example.com`, phone: '1123456789' },
    });
    expect(response.status()).toBe(201);
    // RN10: persistência deve usar +<código do país><número nacional>.
    expect((await response.json()).phone).toBe('+541123456789');
  });

  test('deve rejeitar telefone argentino fora do tamanho permitido', async ({ request }) => {
    const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, admin, 'argentina');
    const owner = await login(request, company.ownerEmail, DEFAULT_PASSWORD);
    const response = await request.post('/api/contacts', {
      headers: auth(owner),
      data: { name: 'Contacto inválido', email: `invalid.ar.${Date.now()}@example.com`, phone: '123' },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'VALIDATION', fields: { phone: 'INVALID_PHONE' } });
  });
    test('não deve permitir e-mail de contato duplicado na mesma autorizada', async ({
    request,
  }) => {
    const admin = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    const company = await createAuthorized(
      request,
      admin,
      'brasil',
    );

    const owner = await login(
      request,
      company.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const suffix = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const email = `contato.duplicado.${suffix}@example.com`;

    const firstResponse = await request.post('/api/contacts', {
      headers: auth(owner),
      data: {
        name: 'Contato A',
        email,
        phone: '62999999999',
      },
    });

    expect(firstResponse.status()).toBe(201);

    const secondResponse = await request.post('/api/contacts', {
      headers: auth(owner),
      data: {
        name: 'Contato B',
        email,
        phone: '62988888888',
      },
    });

    // RN11: dentro da mesma autorizada o e-mail do contato deve ser único.
    expect(secondResponse.status()).toBe(409);
  });

  test('deve permitir o mesmo e-mail de contato em autorizadas diferentes', async ({
    request,
  }) => {
    const admin = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    const companyA = await createAuthorized(
      request,
      admin,
      'brasil',
    );

    const companyB = await createAuthorized(
      request,
      admin,
      'brasil',
    );

    const ownerA = await login(
      request,
      companyA.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const ownerB = await login(
      request,
      companyB.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const suffix = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const email = `contato.compartilhado.${suffix}@example.com`;

    const responseA = await request.post('/api/contacts', {
      headers: auth(ownerA),
      data: {
        name: 'Contato Autorizada A',
        email,
        phone: '62999999999',
      },
    });

    expect(responseA.status()).toBe(201);

    const responseB = await request.post('/api/contacts', {
      headers: auth(ownerB),
      data: {
        name: 'Contato Autorizada B',
        email,
        phone: '62988888888',
      },
    });

    // RN11: a unicidade do contato é por autorizada, não global.
    expect(responseB.status()).toBe(201);
  });
});