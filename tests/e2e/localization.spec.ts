import { test, expect } from '@playwright/test';
import { DEFAULT_PASSWORD, SUPER_ADMIN, createAuthorized, login } from '../helpers/api';

test('RN07 - formulário de Contatos da Argentina deve ser exibido em espanhol', async ({ page, request }) => {
  const admin = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
  const company = await createAuthorized(request, admin, 'argentina');

  await page.goto('/#/login');
  await page.getByTestId('login-email').fill(company.ownerEmail);
  await page.getByTestId('login-password').fill(DEFAULT_PASSWORD);
  await page.getByTestId('login-submit').click();
  await page.getByTestId('menu-contacts').click();

  const form = page.getByTestId('contact-form');
  await expect(form.locator('label[for="contact-name"]')).toHaveText('Nombre');
  await expect(form.locator('label[for="contact-phone"]')).toHaveText('Teléfono');
});
