import { api } from '../api';
import { can } from '../auth';
import { t } from '../i18n';
import { loadPicklists, PicklistOption } from '../picklists';
import { clearFieldErrors, esc, field, showFieldErrors, showMessage } from '../util';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  roleToLabel: string;
}

const optionsHtml = (options: PicklistOption[]) =>
  options.map((o) => `<option value="${esc(o.value)}">${esc(o.toLabel)}</option>`).join('');

export async function renderEmployees(root: HTMLElement, options: { showForm?: boolean } = {}) {
  const canWrite = can('employees', 'write') || options.showForm === true;
  const picklists = await loadPicklists();

  root.innerHTML = `
    <h1 data-testid="employees-title">${t('employees.title')}</h1>
    ${
      canWrite
        ? `<form id="employee-form" class="card" novalidate data-testid="employee-form">
            <div class="grid">
              ${field('name', t('employees.name'), 'employee-name')}
              ${field('email', t('employees.email'), 'employee-email', 'type="email"')}
              <div class="field">
                <label for="employee-role">${t('employees.role')}</label>
                <select id="employee-role" name="role" data-testid="employee-role">
                  <option value="">${t('employees.select')}</option>
                  ${optionsHtml(picklists.assignableRole)}
                </select>
              </div>
            </div>
            <div class="actions"><button type="submit" data-testid="employee-save">${t('employees.save')}</button></div>
          </form>`
        : ''
    }
    <h2>${t('employees.listTitle')}</h2>
    <div class="field" style="max-width:260px;margin-bottom:12px">
      <label for="employee-filter-role">${t('employees.filterRole')}</label>
      <select id="employee-filter-role" data-testid="employee-filter-role">
        <option value="">${t('employees.all')}</option>
        ${optionsHtml(picklists.role)}
      </select>
    </div>
    <div id="employees-list" data-testid="employees-list"></div>`;

  const list = root.querySelector<HTMLElement>('#employees-list')!;
  const filter = root.querySelector<HTMLSelectElement>('#employee-filter-role')!;

  async function loadList() {
    const query = filter.value ? `?role=${encodeURIComponent(filter.value)}` : '';
    const { items } = await api.get<{ items: Employee[] }>(`/employees${query}`);
    list.innerHTML =
      items.length === 0
        ? `<div class="empty" data-testid="employees-empty">${t('employees.empty')}</div>`
        : `<table data-testid="employees-table">
            <thead><tr><th>${t('employees.columns.name')}</th><th>${t('employees.columns.email')}</th><th>${t('employees.columns.role')}</th></tr></thead>
            <tbody>${items
              .map(
                (item) => `<tr data-testid="employee-row">
                  <td data-testid="employee-row-name">${esc(item.name)}</td>
                  <td data-testid="employee-row-email">${esc(item.email)}</td>
                  <td data-testid="employee-row-role" data-role="${esc(item.role)}">${esc(item.roleToLabel)}</td>
                </tr>`,
              )
              .join('')}</tbody>
          </table>`;
  }

  filter.addEventListener('change', loadList);

  const form = root.querySelector<HTMLFormElement>('#employee-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const data = new FormData(form);
    try {
      await api.post('/employees', { name: data.get('name'), email: data.get('email'), role: data.get('role') });
      form.reset();
      showMessage(form, 'success', t('employees.success'), 'employee-success');
      await loadList();
    } catch (error) {
      showFieldErrors(form, error, { ignore: ['role'] });
    }
  });

  await loadList();
}
