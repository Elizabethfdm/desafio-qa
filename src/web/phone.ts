import { t } from './i18n';

/** Mesmas regras do backend: código do país e quantidade de dígitos do número nacional. */
export interface PhoneRule {
  prefix: string;
  minLength: number;
  maxLength: number;
  format: (digits: string) => string;
}

function group(digits: string, sizes: number[]): string {
  const parts: string[] = [];
  let index = 0;
  for (const size of sizes) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + size));
    index += size;
  }
  return parts.join(' ');
}

// Brasil: (00) 0000-0000 (fixo, 10 dígitos) ou (00) 00000-0000 (celular, 11 dígitos).
function formatBrasil(digits: string): string {
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  const split = digits.length > 10 ? 5 : 4;
  return `(${area}) ${rest.slice(0, split)}${rest.length > split ? `-${rest.slice(split)}` : ''}`;
}

export const PHONE_RULES: Record<string, PhoneRule> = {
  brasil: { prefix: '55', minLength: 10, maxLength: 11, format: formatBrasil },
  argentina: { prefix: '54', minLength: 10, maxLength: 10, format: (digits) => digits },
  colombia: { prefix: '57', minLength: 10, maxLength: 10, format: (digits) => group(digits, [3, 3, 4]) },
};

export function getRule(country: string): PhoneRule {
  return PHONE_RULES[country] ?? PHONE_RULES.brasil;
}

/** Extrai só os dígitos do número nacional, aceitando colagem com ou sem o código do país. */
export function extractDigits(raw: string, rule: PhoneRule): string {
  const text = raw.trim();
  const hasPlusPrefix = text.startsWith(`+${rule.prefix}`);
  let digits = (hasPlusPrefix ? text.slice(rule.prefix.length + 1) : text).replace(/\D/g, '');
  if (!hasPlusPrefix && digits.startsWith(rule.prefix) && digits.length > rule.maxLength) {
    digits = digits.slice(rule.prefix.length);
  }
  return digits.slice(0, rule.maxLength);
}

/** Retorna o código de erro (traduzido pelo front) ou null quando o telefone é válido. */
export function validatePhone(raw: string, country: string): 'REQUIRED' | 'INVALID_PHONE' | null {
  const rule = getRule(country);
  const digits = extractDigits(raw, rule);
  if (!digits) return 'REQUIRED';
  return digits.length < rule.minLength ? 'INVALID_PHONE' : null;
}

/**
 * Aplica ao campo: bloqueio de letras e símbolos, prefixo do país, máscara por país,
 * limite de dígitos e validação ao sair do campo.
 */
export function attachPhoneMask(input: HTMLInputElement, country: string) {
  const rule = getRule(country);
  const errorHolder = input.closest('.field')?.querySelector<HTMLElement>('[data-error-for]');

  const setError = (message: string) => {
    if (errorHolder) errorHolder.textContent = message;
    input.classList.toggle('invalid', message !== '');
  };

  input.setAttribute('inputmode', 'tel');
  input.setAttribute('autocomplete', 'off');

  input.addEventListener('input', () => {
    const digits = extractDigits(input.value, rule);
    input.value = digits ? `+${rule.prefix} ${rule.format(digits)}` : '';
    setError('');
  });

  input.addEventListener('blur', () => {
    if (input.value === '') return;
    setError(validatePhone(input.value, country) === 'INVALID_PHONE' ? t('errors.INVALID_PHONE') : '');
  });
}
