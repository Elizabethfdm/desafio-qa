import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Router } from 'express';
import { config } from '../config';
import { authenticate, requirePermission } from '../auth';
import { AuthorizedDoc, EmployeeDoc, getDb } from '../db';
import { COUNTRY_LANGUAGE, Country } from '../permissions';
import { toLabel } from '../picklists';
import { validateAuthorized } from '../validation';

export const authorizedsRouter = Router();
authorizedsRouter.use(authenticate);

async function toDto(doc: AuthorizedDoc, language: string) {
  const employees = getDb().collection<EmployeeDoc>('employees');
  const [owner, employeesCount] = await Promise.all([
    employees.findOne({ id: doc.ownerId }),
    employees.countDocuments({ authorizedId: doc.id }),
  ]);
  return {
    id: doc.id,
    name: doc.name,
    country: doc.country,
    countryToLabel: toLabel('country', doc.country, language),
    language: doc.language,
    owner: { name: owner?.name ?? '', email: owner?.email ?? '' },
    employeesCount,
  };
}

authorizedsRouter.get('/', requirePermission('authorizeds', 'read'), async (req, res) => {
  const docs = await getDb().collection<AuthorizedDoc>('authorizeds').find({}).sort({ createdAt: -1 }).toArray();
  const items = await Promise.all(docs.map((doc) => toDto(doc, req.user!.language)));
  res.json({ items, total: items.length });
});

/** Cria a autorizada e o seu proprietário (que depois cadastra os demais funcionários). */
authorizedsRouter.post('/', requirePermission('authorizeds', 'write'), async (req, res) => {
  const { errors, value } = validateAuthorized(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'VALIDATION', fields: errors });
  }

  const authorizedId = randomUUID();
  const language = COUNTRY_LANGUAGE[value.country as Country];
  const owner: EmployeeDoc = {
    id: randomUUID(),
    authorizedId,
    name: value.ownerName,
    email: value.ownerEmail,
    role: 'Proprietário',
    language,
    country: value.country,
    passwordHash: bcrypt.hashSync(config.defaultEmployeePassword, 10),
    createdAt: new Date(),
  };

  // O proprietário é criado primeiro: se o e-mail já existir, nada é gravado.
  try {
    await getDb().collection<EmployeeDoc>('employees').insertOne(owner);
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_EMAIL', fields: { ownerEmail: 'DUPLICATE_EMAIL' } });
    }
    throw error;
  }

  const authorized: AuthorizedDoc = {
    id: authorizedId,
    name: value.authorizedName,
    country: value.country,
    language,
    ownerId: owner.id,
    createdAt: new Date(),
  };
  await getDb().collection<AuthorizedDoc>('authorizeds').insertOne(authorized);
  return res.status(201).json(await toDto(authorized, req.user!.language));
});
