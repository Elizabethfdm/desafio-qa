import { test, expect } from '@playwright/test';
import { DEFAULT_PASSWORD, SUPER_ADMIN, auth, createAuthorized, createEmployee, login } from '../helpers/api';

async function uiLogin(page: any, email: string, password: string) {
  await page.goto('/#/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
}

test.describe('RN01/RN02/RN06 - Permissões na interface', () => {
  test('Atendente não deve visualizar formulário de funcionário nem por URL direta', async ({ page, request }) => {
    const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, admin, 'brasil');
    const owner = await login(request, company.ownerEmail, DEFAULT_PASSWORD);
    const attendant = await createEmployee(request, owner, 'Atendente');

    await uiLogin(page, attendant.email, DEFAULT_PASSWORD);
    await expect(page.getByTestId('menu-employees')).toBeVisible();
    await page.getByTestId('menu-employees').click();
    await expect(page.getByTestId('employee-form')).toHaveCount(0);

    await page.goto('/#/employees/create');
    // RN06: acesso direto não pode elevar uma permissão apenas de leitura.
    await expect(page.getByTestId('employee-form')).toHaveCount(0);
  });

  test('usuário colombiano não deve visualizar Funcionários no menu', async ({ page, request }) => {
    const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const company = await createAuthorized(request, admin, 'colombia');
    await uiLogin(page, company.ownerEmail, DEFAULT_PASSWORD);
    await expect(page.getByTestId('menu-employees')).toHaveCount(0);
  });
});
