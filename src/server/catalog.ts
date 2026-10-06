// Catálogo inicial 100% fictício (códigos e modelos inventados), no formato de uma lista de produtos de parceiros.
export const RECORD_TYPE_PARTS = 'Peças';
export const RECORD_TYPE_SKU = 'SKU (White Goods Mercado Nacional)';
export const RECORD_TYPE_MODEL = 'Modelo Usual (White Goods Mercado Nacional)';

export interface CatalogItem {
  code: string;
  name: string;
  category: string;
  model: string;
  status: 'Ativo' | 'Inativo';
  price: number;
}

const part = (code: string, name: string, price: number): CatalogItem => ({
  code,
  name,
  category: RECORD_TYPE_PARTS,
  model: '',
  status: 'Ativo',
  price,
});

const sku = (code: string, name: string, model: string, price: number, status: 'Ativo' | 'Inativo' = 'Ativo'): CatalogItem => ({
  code,
  name,
  category: RECORD_TYPE_SKU,
  model,
  status,
  price,
});

const usualModel = (code: string, name: string, price: number): CatalogItem => ({
  code,
  name,
  category: RECORD_TYPE_MODEL,
  model: '',
  status: 'Ativo',
  price,
});

export const CATALOG: CatalogItem[] = [
  part('K51720601', 'ETIQUETA ENCE QZ7K 127V', 14.9),
  part('K51720602', 'ETIQUETA ENCE QZ7K 220V', 14.9),
  part('K50816403', 'GUIA RAPIDO QZ7K', 9.5),
  sku('318440_old', 'QZ7K', 'QZ7K', 3290, 'Inativo'),
  part('K50816201', 'MANUAL INSTRUCOES IM3/QZ7K', 18.5),
  sku('R7305FBA230', 'REFRIGERADOR FROST FREE QZ7K', 'QZ7K', 3490),
  sku('R7305FBA130', 'REFRIGERADOR FROST FREE QZ7K', 'QZ7K', 3490),
  usualModel('QZ7K', 'REFRIGERADOR FROST FREE QZ7K', 3490),

  part('K51730101', 'ETIQUETA ENCE LV2P 127V', 14.9),
  part('K51730102', 'ETIQUETA ENCE LV2P 220V', 14.9),
  part('K50826403', 'GUIA RAPIDO LV2P', 9.5),
  part('K50826201', 'MANUAL INSTRUCOES LV2/LV2P', 18.5),
  sku('W2210LVA110', 'LAVADORA DE ROUPAS LV2P', 'LV2P', 2190, 'Inativo'),
  sku('W2210LVA220', 'LAVADORA DE ROUPAS LV2P', 'LV2P', 2190),
  usualModel('LV2P', 'LAVADORA DE ROUPAS LV2P', 2190),

  part('K51740101', 'ETIQUETA ENCE RM4T 127V', 14.9),
  part('K51740102', 'ETIQUETA ENCE RM4T 220V', 14.9),
  part('K50836403', 'GUIA RAPIDO RM4T', 9.5),
  sku('M4401MOA110', 'MICRO-ONDAS 30L RM4T', 'RM4T', 690, 'Inativo'),
  sku('M4401MOA220', 'MICRO-ONDAS 30L RM4T', 'RM4T', 690),
  usualModel('RM4T', 'MICRO-ONDAS 30L RM4T', 690),

  part('K51750101', 'ETIQUETA ENCE CF9X 127V', 14.9),
  part('K50846403', 'GUIA RAPIDO CF9X', 9.5),
  sku('C9100CFA110', 'COIFA DE PAREDE CF9X', 'CF9X', 1290, 'Inativo'),
];
