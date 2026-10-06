import { api } from './api';

/** `value` (português) é o que o front envia; `toLabel` é o texto exibido no idioma do usuário. */
export interface PicklistOption {
  value: string;
  toLabel: string;
}

export interface Picklists {
  category: PicklistOption[];
  status: PicklistOption[];
  role: PicklistOption[];
  assignableRole: PicklistOption[];
  country: PicklistOption[];
}

export function loadPicklists(): Promise<Picklists> {
  return api.get<Picklists>('/picklists');
}
