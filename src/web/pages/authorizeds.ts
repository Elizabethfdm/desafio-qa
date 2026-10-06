import { api } from '../api';
import { t } from '../i18n';
import { loadPicklists } from '../picklists';
import { clearFieldErrors, esc, field, showFieldErrors, showMessage } from '../util';

interface Authorized {
  id: string;
  name: string;
  country: string;
  countryToLabel: string;
  owner: { name: string; email: string };
  employeesCount: number;
}

export async function renderAuthorizeds(root: HTMLElement) {
  const picklists = await loadPicklists();
  root.innerHTML = `
    <h1 data-testid="authorizeds-title">${t('authorizeds.title')}</h1>
    <form id="authorized-form" class="card" novalidate data-testid="authorized-form">
      <div class="grid">
        ${field('authorizedName', t('authorizeds.authorizedName'), 'authorized-name')}
        ${field('ownerName', t('authorizeds.ownerName'), 'owner-name')}
        ${field('ownerEmail', t('authorizeds.ownerEmail'), 'owner-email', 'type="email"')}
        <div class="field">
          <label for="authorized-country">${t('authorizeds.country')}</label>
          <select id="authorized-country" name="country" data-testid="authorized-country">
            <option value="">${t('authorizeds.select')}</option>
            ${picklists.country.map((c) => `<option value="${esc(c.value)}">${esc(c.toLabel)}</option>`).join('')}
          </select>
          <span class="error" data-error-for="country" data-testid="error-country"></span>
        </div>
      </div>
      <div class="actions"><button type="submit" data-testid="authorized-save">${t('authorizeds.save')}</button></div>
    </form>
    <h2>${t('authorizeds.listTitle')}</h2>
    <div id="authorizeds-list" data-testid="authorizeds-list"></div>`;

  const list = root.querySelector<HTMLElement>('#authorizeds-list')!;

  async function loadList() {
    const { items } = await api.get<{ items: Authorized[] }>('/authorizeds');
    list.innerHTML =
      items.length === 0
        ? `<div class="empty" data-testid="authorizeds-empty">${t('authorizeds.empty')}</div>`
        : `<table data-testid="authorizeds-table">
            <thead><tr>
              <th>${t('authorizeds.columns.name')}</th><th>${t('authorizeds.columns.country')}</th>
              <th>${t('authorizeds.columns.owner')}</th><th>${t('authorizeds.columns.employees')}</th>
            </tr></thead>
            <tbody>${items
              .map(
                (item) => `<tr data-testid="authorized-row">
                  <td data-testid="authorized-row-name">${esc(item.name)}</td>
                  <td data-testid="authorized-row-country" data-country="${esc(item.country)}">${esc(item.countryToLabel)}</td>
                  <td data-testid="authorized-row-owner">${esc(item.owner.name)} (${esc(item.owner.email)})</td>
                  <td data-testid="authorized-row-employees">${item.employeesCount}</td>
                </tr>`,
              )
              .join('')}</tbody>
          </table>`;
  }

  const form = root.querySelector<HTMLFormElement>('#authorized-form')!;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const data = new FormData(form);
    try {
      await api.post('/authorizeds', {
        authorizedName: data.get('authorizedName'),
        ownerName: data.get('ownerName'),
        ownerEmail: data.get('ownerEmail'),
        country: data.get('country'),
      });
      form.reset();
      showMessage(form, 'success', t('authorizeds.success'), 'authorized-success');
      await loadList();
    } catch (error) {
      showFieldErrors(form, error);
    }
  });

  await loadList();
}
