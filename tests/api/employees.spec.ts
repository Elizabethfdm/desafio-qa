import { test, expect } from '@playwright/test';
import {
  SUPER_ADMIN,
  DEFAULT_PASSWORD,
  auth,
  createAuthorized,
  createEmployee,
  login,
} from '../helpers/api';

test.describe('RN05/RN11 - Funcionários', () => {
  test('Proprietário deve cadastrar funcionário Atendente em sua autorizada', async ({
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

    const employee = await createEmployee(
      request,
      ownerToken,
      'Atendente',
    );

    expect(employee.email).toBeTruthy();

    // O funcionário criado deve conseguir autenticar.
    const employeeToken = await login(
      request,
      employee.email,
      DEFAULT_PASSWORD,
    );

    expect(employeeToken).toBeTruthy();
  });

  test('funcionário criado em uma autorizada não deve aparecer em outra', async ({
    request,
  }) => {
    const adminToken = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    const authorizedA = await createAuthorized(
      request,
      adminToken,
      'brasil',
    );

    const authorizedB = await createAuthorized(
      request,
      adminToken,
      'brasil',
    );

    const tokenA = await login(
      request,
      authorizedA.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const tokenB = await login(
      request,
      authorizedB.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const employeeA = await createEmployee(
      request,
      tokenA,
      'Atendente',
    );

    const responseB = await request.get('/api/employees', {
      headers: auth(tokenB),
    });

    expect(responseB.status()).toBe(200);

    const bodyB = await responseB.json();

    expect(
      bodyB.items.map((item: { email: string }) => item.email),
    ).not.toContain(employeeA.email);
  });

  test('não deve permitir e-mail de funcionário duplicado globalmente', async ({
    request,
  }) => {
    const adminToken = await login(
      request,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password,
    );

    const authorizedA = await createAuthorized(
      request,
      adminToken,
      'brasil',
    );

    const authorizedB = await createAuthorized(
      request,
      adminToken,
      'argentina',
    );

    const tokenA = await login(
      request,
      authorizedA.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const tokenB = await login(
      request,
      authorizedB.ownerEmail,
      DEFAULT_PASSWORD,
    );

    const suffix = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

    const duplicatedEmail = `employee.duplicate.${suffix}@example.com`;

    const firstResponse = await request.post('/api/employees', {
      headers: auth(tokenA),
      data: {
        name: 'Funcionário A',
        email: duplicatedEmail,
        role: 'Atendente',
      },
    });

    expect(firstResponse.status()).toBe(201);

    const secondResponse = await request.post('/api/employees', {
      headers: auth(tokenB),
      data: {
        name: 'Funcionário B',
        email: duplicatedEmail,
        role: 'Atendente',
      },
    });

    // RN11: e-mail de funcionário é único globalmente.
    expect(secondResponse.status()).toBe(409);
  });
});