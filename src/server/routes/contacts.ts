import { randomUUID } from 'crypto';
import { Router } from 'express';
import { authenticate, requireAuthorized, requirePermission } from '../auth';
import { ContactDoc, getDb } from '../db';
import { validateContact } from '../validation';

export const contactsRouter = Router();
contactsRouter.use(authenticate, requireAuthorized);

function toDto(doc: ContactDoc) {
  return { id: doc.id, name: doc.name, email: doc.email, phone: doc.phone, createdAt: doc.createdAt };
}

contactsRouter.get('/', requirePermission('contacts', 'read'), async (req, res) => {
  const docs = await getDb()
    .collection<ContactDoc>('contacts')
    .find({ authorizedId: req.user!.authorizedId! })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  res.json({ items: docs.map(toDto), total: docs.length });
});

contactsRouter.post('/', requirePermission('contacts', 'write'), async (req, res) => {
  const user = req.user!;
  const { errors, value } = validateContact(req.body, user.country);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'VALIDATION', fields: errors });
  }

  const doc: ContactDoc = {
    id: randomUUID(),
    authorizedId: user.authorizedId!,
    ...value,
    createdBy: user.sub,
    createdAt: new Date(),
  };
  try {
    await getDb().collection<ContactDoc>('contacts').insertOne(doc);
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_EMAIL', fields: { email: 'DUPLICATE_EMAIL' } });
    }
    throw error;
  }
  return res.status(201).json(toDto(doc));
});
