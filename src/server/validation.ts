import { ASSIGNABLE_ROLES, COUNTRIES } from './permissions';

export type FieldErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Regras de telefone por país (código do país + tamanho do número nacional). */
export const PHONE_RULES: Record<string, { prefix: string; minLength: number; maxLength: number }> = {
  brasil: { prefix: '55', minLength: 10, maxLength: 11 },
  argentina: { prefix: '54', minLength: 10, maxLength: 10 },
  colombia: { prefix: '57', minLength: 10, maxLength: 10 },
};

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

/** Retorna o telefone normalizado (+<país><número>) ou null se for inválido para o país. */
export function normalizePhone(value: unknown, country: string): string | null {
  if (typeof value !== 'string') return null;
  const rule = PHONE_RULES[country] ?? PHONE_RULES.brasil;
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith(rule.prefix) && digits.length > rule.maxLength) {
    digits = digits.slice(rule.prefix.length);
  }
  if (digits.length < rule.minLength || digits.length > rule.maxLength) return null;
  return `+${rule.prefix}${digits}`;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateContact(body: any, country: string) {
  const errors: FieldErrors = {};
  const name = text(body?.name);
  const email = text(body?.email);
  const phoneRaw = text(body?.phone);

  if (!name) errors.name = 'REQUIRED';
  else if (name.length < 2) errors.name = 'MIN_LENGTH';

  if (!email) errors.email = 'REQUIRED';
  else if (!isValidEmail(email)) errors.email = 'INVALID_EMAIL';

  let phone: string | null = null;
  if (!phoneRaw) errors.phone = 'REQUIRED';
  else {
    phone = country === 'argentina' ? phoneRaw : normalizePhone(phoneRaw, country);
    if (!phone) errors.phone = 'INVALID_PHONE';
  }

  return { errors, value: { name, email: email.toLowerCase(), phone: phone ?? '' } };
}

export function validateEmployee(body: any) {
  const errors: FieldErrors = {};
  const name = text(body?.name);
  const email = text(body?.email);
  const role = text(body?.role);

  if (!name) errors.name = 'REQUIRED';
  else if (name.length < 2) errors.name = 'MIN_LENGTH';

  if (!email) errors.email = 'REQUIRED';
  else if (!isValidEmail(email)) errors.email = 'INVALID_EMAIL';

  if (!role) errors.role = 'REQUIRED';
  else if (!(ASSIGNABLE_ROLES as string[]).includes(role)) errors.role = 'INVALID_ROLE';

  return { errors, value: { name, email: email.toLowerCase(), role } };
}

export function validateAuthorized(body: any) {
  const errors: FieldErrors = {};
  const authorizedName = text(body?.authorizedName);
  const ownerName = text(body?.ownerName);
  const ownerEmail = text(body?.ownerEmail);
  const country = text(body?.country);

  if (!authorizedName) errors.authorizedName = 'REQUIRED';
  else if (authorizedName.length < 2) errors.authorizedName = 'MIN_LENGTH';

  if (!ownerName) errors.ownerName = 'REQUIRED';
  else if (ownerName.length < 2) errors.ownerName = 'MIN_LENGTH';

  if (!ownerEmail) errors.ownerEmail = 'REQUIRED';
  else if (!isValidEmail(ownerEmail)) errors.ownerEmail = 'INVALID_EMAIL';

  if (!country) errors.country = 'REQUIRED';
  else if (!(COUNTRIES as readonly string[]).includes(country)) errors.country = 'INVALID_COUNTRY';

  return { errors, value: { authorizedName, ownerName, ownerEmail: ownerEmail.toLowerCase(), country } };
}
