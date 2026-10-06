import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';

const dictionaries = { pt, es, en } as const;
export type Lang = keyof typeof dictionaries;

const LOCALES: Record<Lang, string> = { pt: 'pt-BR', es: 'es-AR', en: 'en-US' };

let current: Lang = 'pt';

export function setLanguage(language: string | undefined) {
  current = language && language in dictionaries ? (language as Lang) : 'pt';
  document.documentElement.lang = current;
}

export function getLanguage(): Lang {
  return current;
}

export function locale(): string {
  return LOCALES[current];
}

function resolve(dictionary: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') return (node as Record<string, unknown>)[part];
    return undefined;
  }, dictionary);
  return typeof value === 'string' ? value : undefined;
}

export function t(key: string, vars: Record<string, string | number> = {}, language?: Lang): string {
  const text = resolve(dictionaries[language ?? current], key) ?? resolve(dictionaries.pt, key) ?? key;
  return Object.entries(vars).reduce((result, [name, value]) => result.replace(`{${name}}`, String(value)), text);
}
