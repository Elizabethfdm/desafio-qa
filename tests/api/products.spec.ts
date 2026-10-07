import { test, expect } from '@playwright/test';
import { SUPER_ADMIN, auth, login } from '../helpers/api';

test.describe('RN12 - Produtos', () => {
  test('deve paginar os 24 produtos em páginas de 10 itens', async ({ request }) => {
    const token = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const headers = auth(token);
    const p1 = await (await request.get('/api/products?page=1', { headers })).json();
    const p2 = await (await request.get('/api/products?page=2', { headers })).json();
    const p3 = await (await request.get('/api/products?page=3', { headers })).json();
    expect(p1).toMatchObject({ total: 24, page: 1, pageSize: 10 });
    expect(p1.items).toHaveLength(10);
    expect(p2.items).toHaveLength(10);
    expect(p3.items).toHaveLength(4);
  });

  test('cada produto deve disponibilizar imagem PNG', async ({ request }) => {
    const token = await login(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    const headers = auth(token);
    const products = await (await request.get('/api/products?pageSize=1', { headers })).json();
    const image = await request.get(products.items[0].imageUrl, { headers });
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
    expect((await image.body()).length).toBeGreaterThan(0);
  });
  test('deve filtrar produtos na consulta', async ({ request }) => {
  const token = await login(
    request,
    SUPER_ADMIN.email,
    SUPER_ADMIN.password,
  );

  const headers = auth(token);

  // Busca um produto existente para não depender de massa fixa
  const initialResponse = await request.get(
    '/api/products?page=1&pageSize=1',
    { headers },
  );

  expect(initialResponse.status()).toBe(200);

  const initialBody = await initialResponse.json();
  expect(initialBody.items.length).toBeGreaterThan(0);

  const existingProduct = initialBody.items[0];
  const searchTerm = existingProduct.name.substring(0, 5);

  // Executa o filtro utilizando parte do nome encontrado
  const response = await request.get(
    `/api/products?name=${encodeURIComponent(searchTerm)}`,
    { headers },
  );

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.items.length).toBeGreaterThan(0);

  for (const product of body.items) {
    const name = product.name.toLowerCase();
    const code = product.code.toLowerCase();

    expect(
      name.includes(searchTerm.toLowerCase()) ||
        code.includes(searchTerm.toLowerCase()),
    ).toBeTruthy();
  }
});
});
