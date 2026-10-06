import { can, clearSession, getClaims } from './auth';
import { setLanguage, t } from './i18n';
import { renderAuthorizeds } from './pages/authorizeds';
import { renderContacts } from './pages/contacts';
import { renderEmployees } from './pages/employees';
import { renderLogin } from './pages/login';
import { renderProducts } from './pages/products';
import { esc } from './util';

interface Route {
  path: string;
  resource: string;
  menuKey: string;
  render: (root: HTMLElement) => Promise<void>;
  hidden?: boolean;
}

const ROUTES: Route[] = [
  { path: '#/authorizeds', resource: 'authorizeds', menuKey: 'menu.authorizeds', render: renderAuthorizeds },
  { path: '#/contacts', resource: 'contacts', menuKey: 'menu.contacts', render: renderContacts },
  { path: '#/products', resource: 'products', menuKey: 'menu.products', render: renderProducts },
  { path: '#/employees', resource: 'employees', menuKey: 'menu.employees', render: (root) => renderEmployees(root) },
  {
    path: '#/employees/create',
    resource: 'employees',
    menuKey: 'menu.employees',
    render: (root) => renderEmployees(root, { showForm: true }),
    hidden: true,
  },
];

const app = document.getElementById('app')!;

function renderShell(allowed: Route[], current: Route | undefined) {
  const menuRoutes = allowed.filter((route) => !route.hidden);
  const claims = getClaims()!;
  app.innerHTML = `
    <header class="top">
      <span class="brand">${t('app.brand')}</span>
      <nav data-testid="menu" aria-label="menu">
        ${menuRoutes
          .map(
            (route) =>
              `<a href="${route.path}" data-testid="menu-${route.resource}" class="${route === current || (current?.hidden && route.resource === current.resource) ? 'active' : ''}">${t(route.menuKey)}</a>`,
          )
          .join('')}
      </nav>
      <div class="user">
        ${claims.authorizedName ? `<span class="badge" data-testid="company-name">${esc(claims.authorizedName)}</span>` : ''}
        <span data-testid="user-info"><span data-testid="user-name">${esc(claims.name)}</span> · <span data-testid="user-role">${esc(claims.roleToLabel)}</span></span>
        <button type="button" class="secondary" data-testid="logout">${t('header.logout')}</button>
      </div>
    </header>
    <main id="content" data-testid="content"></main>`;

  app.querySelector('[data-testid="logout"]')!.addEventListener('click', () => {
    clearSession();
    location.hash = '#/login';
    start();
  });
}

async function start() {
  const claims = getClaims();
  if (!claims) {
    if (location.hash !== '#/login') location.hash = '#/login';
    renderLogin(app, () => {
      location.hash = '';
      start();
    });
    return;
  }

  setLanguage(claims.language);
  const allowed = ROUTES.filter((route) => can(route.resource, 'read'));
  const requested = ROUTES.find((route) => route.path === location.hash);
  const current = requested && allowed.includes(requested) ? requested : allowed.find((route) => !route.hidden);

  if (!current) {
    renderShell(allowed, undefined);
    document.getElementById('content')!.innerHTML = `<div class="empty" data-testid="no-access">${t('noAccess')}</div>`;
    return;
  }

  if (location.hash !== current.path) {
    // Mantém a URL coerente com a tela exibida (também cobre acesso direto a telas sem permissão).
    history.replaceState(null, '', current.path);
  }
  renderShell(allowed, current);
  await current.render(document.getElementById('content')!);
}

window.addEventListener('hashchange', () => {
  if (getClaims()) start();
});

start();
