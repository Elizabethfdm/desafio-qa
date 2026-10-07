import { test, expect } from '@playwright/test';
import {
  DEFAULT_PASSWORD,
  SUPER_ADMIN,
  auth,
  createAuthorized,
  login,
} from '../helpers/api';

test.describe('RN08 - Listas de valores', () => {
  test('deve manter os mesmos valores e traduzir os labels conforme o idioma do usuário', async ({
    request,
  }) => {
    const admin = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    // Cria autorizadas de países diferentes
    const brasil = await createAuthorized(request, admin, 'brasil');
    const argentina = await createAuthorized(request, admin, 'argentina');

    const tokenBrasil = await login(
      request,
      brasil.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const tokenArgentina = await login(
      request,
      argentina.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const responseBrasil = await request.get('/api/picklists', {
      headers: auth(tokenBrasil),
    });

    const responseArgentina = await request.get('/api/picklists', {
      headers: auth(tokenArgentina),
    });

    expect(responseBrasil.status()).toBe(200);
    expect(responseArgentina.status()).toBe(200);

    const bodyBrasil = await responseBrasil.json();
    const bodyArgentina = await responseArgentina.json();

    // Os valores internos devem permanecer iguais,
    // independentemente do idioma do usuário.
    expect(bodyBrasil.status.map((item: any) => item.value)).toEqual(
      bodyArgentina.status.map((item: any) => item.value),
    );

    expect(bodyBrasil.role.map((item: any) => item.value)).toEqual(
      bodyArgentina.role.map((item: any) => item.value),
    );

    expect(bodyBrasil.country.map((item: any) => item.value)).toEqual(
      bodyArgentina.country.map((item: any) => item.value),
    );

    expect(bodyBrasil.category.map((item: any) => item.value)).toEqual(
      bodyArgentina.category.map((item: any) => item.value),
    );

    // O texto apresentado deve respeitar o idioma.
    const activeBrasil = bodyBrasil.status.find(
      (item: any) => item.value === 'Ativo',
    );

    const activeArgentina = bodyArgentina.status.find(
      (item: any) => item.value === 'Ativo',
    );

    expect(activeBrasil.toLabel).toBe('Ativo');
    expect(activeArgentina.toLabel).toBe('Activo');

    const ownerBrasil = bodyBrasil.role.find(
      (item: any) => item.value === 'Proprietário',
    );

    const ownerArgentina = bodyArgentina.role.find(
      (item: any) => item.value === 'Proprietário',
    );

    expect(ownerBrasil.toLabel).toBe('Proprietário');
    expect(ownerArgentina.toLabel).toBe('Propietario');
  });
});