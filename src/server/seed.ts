import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Binary } from 'mongodb';
import { config } from './config';
import { AuthorizedDoc, ContactDoc, EmployeeDoc, ProductDoc, connect } from './db';
import { CATALOG } from './catalog';
import { generatePng } from './png';

const PALETTE: [number, number, number][] = [
  [66, 133, 244], [219, 68, 55], [244, 180, 0], [15, 157, 88], [171, 71, 188], [0, 172, 193],
];

export async function seed(): Promise<void> {
  const db = await connect();
  await Promise.all([
    db.collection('employees').deleteMany({}),
    db.collection('authorizeds').deleteMany({}),
    db.collection('contacts').deleteMany({}),
    db.collection('products').deleteMany({}),
  ]);

  const superAdmin: EmployeeDoc = {
    id: randomUUID(),
    authorizedId: null,
    name: 'Super Admin Demo',
    email: config.superAdminEmail,
    role: 'Super Admin',
    language: 'pt',
    country: 'brasil',
    passwordHash: bcrypt.hashSync(config.superAdminPassword, 10),
    createdAt: new Date(),
  };
  await db.collection<EmployeeDoc>('employees').insertOne(superAdmin);

  const products: ProductDoc[] = CATALOG.map((item, index) => ({
    id: randomUUID(),
    code: item.code,
    name: item.name,
    category: item.category,
    model: item.model,
    status: item.status,
    price: item.price,
    imageType: 'image/png',
    image: new Binary(generatePng(96, PALETTE[index % PALETTE.length])),
    position: index,
  }));
  await db.collection<ProductDoc>('products').insertMany(products);
}

export async function ensureSeed(): Promise<void> {
  const db = await connect();
  const employees = await db.collection<EmployeeDoc>('employees').countDocuments();
  if (employees === 0) await seed();
}

export type { AuthorizedDoc, ContactDoc };
