import { test, expect } from '@playwright/test';
import { SUPER_ADMIN } from '../helpers/api';

test.describe('RN14 - Sessão na interface', () => {
  test('usuário não autenticado deve ser direcionado ao login', async ({ page }) => {
    await page.goto('/#/products');
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('deve encerrar a sessão no logout', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByTestId('login-email').fill(SUPER_ADMIN.email);
    await page.getByTestId('login-password').fill(SUPER_ADMIN.password);
    await page.getByTestId('login-submit').click();
    await page.getByTestId('logout').click();
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
