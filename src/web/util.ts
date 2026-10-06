import { ApiError } from './api';
import { t } from './i18n';

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function clearFieldErrors(form: HTMLElement) {
  form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  form.querySelectorAll('[data-form-message]').forEach((el) => el.remove());
}

export function showFieldErrors(form: HTMLElement, error: unknown, options: { ignore?: string[] } = {}) {
  const ignore = options.ignore ?? [];
  if (error instanceof ApiError) {
    const entries = Object.entries(error.fields).filter(([name]) => !ignore.includes(name));
    if (entries.length > 0) {
      entries.forEach(([name, code]) => {
        const holder = form.querySelector(`[data-error-for="${name}"]`);
        if (holder) holder.textContent = t(`errors.${code}`);
        form.querySelector(`[name="${name}"]`)?.classList.add('invalid');
      });
      return;
    }
  }
  const code = error instanceof ApiError && error.status === 403 ? 'FORBIDDEN' : 'GENERIC';
  showMessage(form, 'danger', t(`errors.${code}`), 'form-error');
}

export function showMessage(form: HTMLElement, kind: 'success' | 'danger', text: string, testId: string) {
  const box = document.createElement('div');
  box.className = `alert ${kind}`;
  box.setAttribute('role', kind === 'danger' ? 'alert' : 'status');
  box.setAttribute('data-testid', testId);
  box.setAttribute('data-form-message', '');
  box.textContent = text;
  form.appendChild(box);
}

export function field(name: string, label: string, testId: string, attrs = ''): string {
  return `
    <div class="field">
      <label for="${testId}">${esc(label)}</label>
      <input id="${testId}" name="${name}" data-testid="${testId}" ${attrs} />
      <span class="error" data-error-for="${name}" data-testid="error-${name}"></span>
    </div>`;
}
