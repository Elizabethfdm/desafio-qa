import { ASSIGNABLE_ROLES } from './permissions';

export type Lang = 'pt' | 'es' | 'en';

interface PicklistItem {
  /** Valor que trafega entre front e back (sempre em português). */
  value: string;
  /** Texto de exibição por idioma (devolvido como `toLabel`). */
  labels: Record<Lang, string>;
}

const PICKLISTS: Record<string, PicklistItem[]> = {
  category: [
    { value: 'Peças', labels: { pt: 'Peças', es: 'Repuestos', en: 'Parts' } },
    {
      value: 'SKU (White Goods Mercado Nacional)',
      labels: {
        pt: 'SKU (White Goods Mercado Nacional)',
        es: 'SKU (Línea Blanca Mercado Nacional)',
        en: 'SKU (White Goods Domestic Market)',
      },
    },
    {
      value: 'Modelo Usual (White Goods Mercado Nacional)',
      labels: {
        pt: 'Modelo Usual (White Goods Mercado Nacional)',
        es: 'Modelo Habitual (Línea Blanca Mercado Nacional)',
        en: 'Usual Model (White Goods Domestic Market)',
      },
    },
  ],
  status: [
    { value: 'Ativo', labels: { pt: 'Ativo', es: 'Activo', en: 'Active' } },
    { value: 'Inativo', labels: { pt: 'Inativo', es: 'Inactivo', en: 'Inactive' } },
  ],
  role: [
    { value: 'Super Admin', labels: { pt: 'Super Admin', es: 'Super Admin', en: 'Super Admin' } },
    { value: 'Proprietário', labels: { pt: 'Proprietário', es: 'Propietario', en: 'Owner' } },
    { value: 'Atendente', labels: { pt: 'Atendente', es: 'Asistente', en: 'Attendant' } },
  ],
  country: [
    { value: 'brasil', labels: { pt: 'Brasil', es: 'Brasil', en: 'Brazil' } },
    { value: 'argentina', labels: { pt: 'Argentina', es: 'Argentina', en: 'Argentina' } },
    { value: 'colombia', labels: { pt: 'Colômbia', es: 'Colombia', en: 'Colombia' } },
  ],
};

function lang(language: string): Lang {
  return language === 'es' || language === 'en' ? language : 'pt';
}

/** Texto de exibição de um valor de picklist no idioma informado. */
export function toLabel(picklist: keyof typeof PICKLISTS, value: string, language: string): string {
  const item = PICKLISTS[picklist].find((entry) => entry.value === value);
  return item ? item.labels[lang(language)] : value;
}

/** Opções do picklist: `value` para enviar e `toLabel` para exibir. */
export function options(picklist: keyof typeof PICKLISTS, language: string, only?: string[]) {
  return PICKLISTS[picklist]
    .filter((entry) => !only || only.includes(entry.value))
    .map((entry) => ({ value: entry.value, toLabel: entry.labels[lang(language)] }));
}

export function allPicklists(language: string) {
  return {
    category: options('category', language),
    status: options('status', language),
    role: options('role', language),
    assignableRole: options('role', language, ASSIGNABLE_ROLES),
    country: options('country', language),
  };
}
