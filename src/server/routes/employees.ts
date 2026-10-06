import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Router } from 'express';
import { config } from '../config';
import { authenticate, requireAuthorized, requirePermission } from '../auth';
import { EmployeeDoc, getDb } from '../db';
import { ROLES } from '../permissions';
import { toLabel } from '../picklists';
import { validateEmployee } from '../validation';

export const employeesRouter = Router();
employeesRouter.use(authenticate, requireAuthorized);

function toDto(doc: EmployeeDoc, language: string) {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    roleToLabel: toLabel('role', doc.role, language),
    language: doc.language,
    country: doc.country,
  };
}

/** Lista apenas os funcionários da autorizada do usuário logado. */
employeesRouter.get('/', requirePermission('employees', 'read'), async (req, res) => {
  const role = typeof req.query.role === 'string' ? req.query.role : '';
  if (role && !(ROLES as readonly string[]).includes(role)) {
    return res.status(400).json({ error: 'VALIDATION', fields: { role: 'INVALID_ROLE' } });
  }
  const filter: Record<string, unknown> = { authorizedId: req.user!.authorizedId };
  if (role) filter.role = role;
  const docs = await getDb().collection<EmployeeDoc>('employees').find(filter).sort({ createdAt: 1 }).toArray();
  return res.json({ items: docs.map((doc) => toDto(doc, req.user!.language)), total: docs.length });
});

/** Cria funcionário na autorizada do usuário logado; país e idioma são os da autorizada. */
employeesRouter.post('/', requirePermission('employees', 'read'), async (req, res) => {
  const creator = req.user!;
  const { errors, value } = validateEmployee(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'VALIDATION', fields: errors });
  }

  const doc: EmployeeDoc = {
    id: randomUUID(),
    authorizedId: creator.authorizedId,
    name: value.name,
    email: value.email,
    role: value.role,
    language: creator.language,
    country: creator.country,
    passwordHash: bcrypt.hashSync(config.defaultEmployeePassword, 10),
    createdAt: new Date(),
  };

  try {
    await getDb().collection<EmployeeDoc>('employees').insertOne(doc);
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_EMAIL', fields: { email: 'DUPLICATE_EMAIL' } });
    }
    throw error;
  }
  return res.status(201).json(toDto(doc, creator.language));
});
