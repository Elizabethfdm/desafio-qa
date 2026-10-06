import { Binary, Db, MongoClient } from 'mongodb';
import { config } from './config';

export interface AuthorizedDoc {
  id: string;
  name: string;
  country: string;
  language: string;
  ownerId: string;
  createdAt: Date;
}

export interface EmployeeDoc {
  id: string;
  authorizedId: string | null;
  name: string;
  email: string;
  role: string;
  language: string;
  country: string;
  passwordHash: string;
  createdAt: Date;
}

export interface ContactDoc {
  id: string;
  authorizedId: string;
  name: string;
  email: string;
  phone: string;
  createdBy: string;
  createdAt: Date;
}

export interface ProductDoc {
  id: string;
  code: string;
  name: string;
  model: string;
  category: string;
  status: string;
  price: number;
  imageType: string;
  image: Binary;
  position: number;
}

let client: MongoClient | undefined;
let db: Db | undefined;

export async function connect(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(config.mongoUri);
  await client.connect();
  db = client.db(config.mongoDb);
  await ensureIndexes(db);
  return db;
}

export async function ensureIndexes(database: Db): Promise<void> {
  await database.collection<EmployeeDoc>('employees').createIndex({ email: 1 }, { unique: true });
  // Índice antigo (e-mail único global) de versões anteriores do projeto, se existir.
  await database.collection('contacts').dropIndex('email_1').catch(() => undefined);
  await database.collection<ContactDoc>('contacts').createIndex({ authorizedId: 1, email: 1 }, { unique: true });
}

export function getDb(): Db {
  if (!db) throw new Error('Banco não conectado. Chame connect() primeiro.');
  return db;
}

export async function disconnect(): Promise<void> {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}
