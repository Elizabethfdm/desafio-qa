export type Access = 'read' | 'read/write';
export type Resource = 'contacts' | 'products' | 'employees' | 'authorizeds';
export type Permissions = Partial<Record<Resource, Access>>;

export const ROLES = ['Super Admin', 'Proprietário', 'Atendente'] as const;
export type Role = (typeof ROLES)[number];

/** Roles que podem ser escolhidos no cadastro de funcionário (Super Admin só existe no seed). */
export const ASSIGNABLE_ROLES: Role[] = ['Atendente', 'Proprietário'];

export const COUNTRIES = ['brasil', 'argentina', 'colombia'] as const;
export type Country = (typeof COUNTRIES)[number];

export const LANGUAGES = ['pt', 'es', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Idioma da interface definido pelo país da autorizada. */
export const COUNTRY_LANGUAGE: Record<Country, Language> = {
  brasil: 'pt',
  argentina: 'es',
  colombia: 'es',
};

/** Proprietário da autorizada: gerencia contatos e funcionários da própria autorizada. */
const OWNER_ACCESS: Permissions = {
  contacts: 'read/write',
  products: 'read',
  employees: 'read/write',
};

/** Super Admin (administrador da plataforma): cria autorizadas e seus proprietários; não opera dados de uma autorizada. */
const SUPER_ADMIN_ACCESS: Permissions = {
  authorizeds: 'read/write',
  products: 'read',
};

const READ_ONLY: Permissions = {
  contacts: 'read',
  products: 'read',
  employees: 'read',
};

/**
 * Regra de exceção por país (inspirada no bloqueio do "Painel" para países Andinos no portal original):
 * o módulo de funcionários não está disponível para a Colômbia.
 * Como a permissão é removida do token, o menu some e a API responde 403.
 */
export const BLOCKED_COUNTRIES: Partial<Record<Resource, string[]>> = {
  employees: ['colombia'],
};

export function permissionsFor(role: Role, country: string): Permissions {
  const base = role === 'Super Admin' ? SUPER_ADMIN_ACCESS : role === 'Proprietário' ? OWNER_ACCESS : READ_ONLY;
  const result: Permissions = { ...base };
  (Object.keys(BLOCKED_COUNTRIES) as Resource[]).forEach((resource) => {
    if (BLOCKED_COUNTRIES[resource]?.includes(country)) {
      delete result[resource];
    }
  });
  return result;
}

export function hasAccess(
  permissions: Record<string, string> | undefined,
  resource: Resource,
  mode: 'read' | 'write',
): boolean {
  const access = permissions?.[resource];
  if (!access) return false;
  return mode === 'read' ? true : access === 'read/write';
}
