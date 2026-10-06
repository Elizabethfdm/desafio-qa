import { ApiError, api } from '../api';
import { getClaims, setToken } from '../auth';
import { setLanguage, t } from '../i18n';
import { clearFieldErrors, field, showFieldErrors, showMessage } from '../util';

export function renderLogin(root: HTMLElement, onLogin: () => void) {
  setLanguage('pt');
  root.innerHTML = `
    <div class="login card">
      <h1 data-testid="login-title">${t('login.title')}</h1>
      <form id="login-form" novalidate data-testid="login-form">
        ${field('email', t('login.email'), 'login-email', 'type="email" autocomplete="username"')}
        ${field('password', t('login.password'), 'login-password', 'type="password" autocomplete="current-password"')}
        <div class="actions"><button type="submit" data-testid="login-submit">${t('login.submit')}</button></div>
      </form>
    </div>`;

  const form = root.querySelector<HTMLFormElement>('#login-form')!;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    const data = new FormData(form);
    try {
      const token = await api.login(String(data.get('email')), String(data.get('password')));
      setToken(token);
      setLanguage(getClaims()?.language);
      onLogin();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        showMessage(form, 'danger', t('errors.INVALID_CREDENTIALS'), 'login-error');
      } else {
        showFieldErrors(form, error);
      }
    }
  });
}
