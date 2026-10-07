import { test, expect } from '@playwright/test';
import {
  SUPER_ADMIN,
  DEFAULT_PASSWORD,
  auth,
  createAuthorized,
  login,
} from '../helpers/api';

test.describe('RN03 - Cadastro de Autorizadas', () => {
  test('Super Admin deve criar uma autorizada com proprietário', async ({ request }) => {
    const adminToken = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    const authorized = await createAuthorized(
      request,
      adminToken,
      'brasil',
    );

    expect(authorized).toMatchObject({
      country: 'brasil',
    });

    expect(authorized.ownerEmail).toBeTruthy();

    // O proprietário criado junto com a autorizada deve conseguir autenticar.
    const ownerToken = await login(
      request,
      authorized.ownerEmail,
      DEFAULT_PASSWORD,
    );

    expect(ownerToken).toBeTruthy();
  });

  test('usuário sem perfil Super Admin não deve criar autorizada', async ({
    request,
  }) => {
    const adminToken = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    const authorized = await createAuthorized(
      request,
      adminToken,
      'brasil',
    );

    const ownerToken = await login(
      request,
      authorized.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const suffix = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const response = await request.post('/api/authorizeds', {
      headers: auth(ownerToken),
      data: {
        authorizedName: `Autorizada indevida ${suffix}`,
        ownerName: 'Owner indevido',
        ownerEmail: `owner.indevido.${suffix}@example.com`,
        country: 'brasil',
      },
    });

    expect(response.status()).toBe(403);
  });
});