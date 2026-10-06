import { api } from '../api';
import { locale, t } from '../i18n';
import { loadPicklists } from '../picklists';
import { esc } from '../util';

interface Product {
  id: string;
  code: string;
  name: string;
  model: string;
  category: string;
  categoryToLabel: string;
  status: string;
  statusToLabel: string;
  price: number;
  imageUrl: string;
}
interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export async function renderProducts(root: HTMLElement) {
  let page = 1;
  const picklists = await loadPicklists();

  root.innerHTML = `
    <h1 data-testid="products-title">${t('products.title')}</h1>
    <form id="product-filters" class="card" data-testid="product-filters">
      <div class="grid">
        <div class="field">
          <label for="product-filter-name">${t('products.filterName')}</label>
          <input id="product-filter-name" name="name" data-testid="product-filter-name" />
        </div>
        <div class="field">
          <label for="product-filter-category">${t('products.filterCategory')}</label>
          <select id="product-filter-category" name="category" data-testid="product-filter-category">
            <option value="">${t('products.all')}</option>
            ${picklists.category.map((c) => `<option value="${esc(c.value)}">${esc(c.toLabel)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="product-filter-status">${t('products.filterStatus')}</label>
          <select id="product-filter-status" name="status" data-testid="product-filter-status">
            <option value="">${t('products.all')}</option>
            ${picklists.status.map((s) => `<option value="${esc(s.value)}">${esc(s.toLabel)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="actions"><button type="submit" data-testid="product-search">${t('products.search')}</button></div>
    </form>
    <div id="products-result" style="margin-top:16px"></div>`;

  const form = root.querySelector<HTMLFormElement>('#product-filters')!;
  const result = root.querySelector<HTMLElement>('#products-result')!;

  async function load() {
    const data = new FormData(form);
    const params = new URLSearchParams({ page: String(page) });
    ['name', 'category', 'status'].forEach((key) => {
      const value = String(data.get(key) ?? '').trim();
      if (value) params.set(key, value);
    });
    const response = await api.get<ProductPage>(`/products?${params}`);
    const pages = Math.max(1, Math.ceil(response.total / response.pageSize));

    if (response.items.length === 0) {
      result.innerHTML = `<div class="empty" data-testid="products-empty">${t('products.empty')}</div>`;
      return;
    }

    const money = new Intl.NumberFormat(locale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    result.innerHTML = `
      <table data-testid="products-table">
        <thead><tr>
          <th>${t('products.columns.image')}</th><th>${t('products.columns.code')}</th>
          <th>${t('products.columns.name')}</th><th>${t('products.columns.category')}</th>
          <th>${t('products.columns.model')}</th><th>${t('products.columns.status')}</th>
          <th>${t('products.columns.price')}</th>
        </tr></thead>
        <tbody>${response.items
          .map(
            (item) => `
          <tr data-testid="product-row">
            <td><img alt="${esc(item.name)}" data-testid="product-image" data-src="${esc(item.imageUrl)}" /></td>
            <td data-testid="product-code"><strong>${esc(item.code)}</strong></td>
            <td data-testid="product-name">${esc(item.name)}</td>
            <td data-testid="product-category">${esc(item.category)}</td>
            <td data-testid="product-model">${esc(item.model)}</td>
            <td><span class="badge ${item.status === 'Inativo' ? 'inactive' : 'active'}" data-testid="product-status">${esc(item.statusToLabel)}</span></td>
            <td>${money.format(item.price)}</td>
          </tr>`,
          )
          .join('')}</tbody>
      </table>
      <div class="pager">
        <button type="button" class="secondary" data-testid="page-prev" ${page <= 1 ? 'disabled' : ''}>${t('products.previous')}</button>
        <span data-testid="page-info">${t('products.pageInfo', { page, pages, total: response.total })}</span>
        <button type="button" class="secondary" data-testid="page-next" ${page >= pages ? 'disabled' : ''}>${t('products.next')}</button>
      </div>`;

    result.querySelector('[data-testid="page-prev"]')?.addEventListener('click', () => {
      page -= 1;
      load();
    });
    result.querySelector('[data-testid="page-next"]')?.addEventListener('click', () => {
      page += 1;
      load();
    });

    // A imagem exige o token, então é baixada via fetch e exibida como blob.
    result.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(async (img) => {
      try {
        const blob = await api.blob(img.dataset.src!.replace('/api', ''));
        img.src = URL.createObjectURL(blob);
      } catch {
        img.removeAttribute('src');
      }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    page = 1;
    load();
  });

  await load();
}
