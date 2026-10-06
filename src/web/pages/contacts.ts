import { api } from '../api';
import { can, getClaims } from '../auth';
import { t } from '../i18n';
import { attachPhoneMask } from '../phone';
import { clearFieldErrors, esc, field, showFieldErrors, showMessage } from '../util';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export async function renderContacts(root: HTMLElement) {
  const country = getClaims()?.country ?? 'brasil';
  const placeholder = t(`contacts.phonePlaceholder.${country}`);
  const canWrite = can('contacts', 'write');
  const label = (key: string) => t(`contacts.${key}`, {}, country === 'argentina' ? 'pt' : undefined);

  root.innerHTML = `
    <h1 data-testid="contacts-title">${t('contacts.title')}</h1>
    ${
      canWrite
        ? `<form id="contact-form" class="card" novalidate data-testid="contact-form">
            <div class="grid">
              ${field('name', label('name'), 'contact-name')}
              ${field('email', label('email'), 'contact-email', 'type="email"')}
              ${field('phone', label('phone'), 'contact-phone', `placeholder="${esc(placeholder)}"`)}
            </div>
            <div class="actions"><button type="submit" data-testid="contact-save">${t('contacts.save')}</button></div>
          </form>`
        : ''
    }
    <h2>${t('contacts.listTitle')}</h2>
    <div id="contacts-list" data-testid="contacts-list"></div>`;

  const list = root.querySelector<HTMLElement>('#contacts-list')!;

  async function loadList() {
    const { items } = await api.get<{ items: Contact[] }>('/contacts');
    list.innerHTML =
      items.length === 0
        ? `<div class="empty" data-testid="contacts-empty">${t('contacts.empty')}</div>`
        : `<table data-testid="contacts-table">
            <thead><tr><th>${t('contacts.name')}</th><th>${t('contacts.email')}</th><th>${t('contacts.phone')}</th></tr></thead>
            <tbody>${items
              .map(
                (item) =>
                  `<tr data-testid="contact-row"><td>${esc(item.name)}</td><td>${esc(item.email)}</td><td>${esc(item.phone)}</td></tr>`,
              )
              .join('')}</tbody>
          </table>`;
  }

  const form = root.querySelector<HTMLFormElement>('#contact-form');
  const phoneInput = root.querySelector<HTMLInputElement>('#contact-phone');
  if (phoneInput && country !== 'argentina') attachPhoneMask(phoneInput, country);
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const data = new FormData(form);
    try {
      await api.post('/contacts', {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
      });
      form.reset();
      showMessage(form, 'success', t('contacts.success'), 'contact-success');
      await loadList();
    } catch (error) {
      showFieldErrors(form, error);
    }
  });

  await loadList();
}
