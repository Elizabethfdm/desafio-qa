import { Router } from 'express';
import { Binary } from 'mongodb';
import { authenticate, requirePermission } from '../auth';
import { ProductDoc, getDb } from '../db';
import { options, toLabel } from '../picklists';

export const productsRouter = Router();
productsRouter.use(authenticate, requirePermission('products', 'read'));

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toDto(doc: ProductDoc, language: string) {
  return {
    id: doc.id,
    code: doc.code,
    name: doc.name,
    model: doc.model,
    category: doc.category,
    categoryToLabel: toLabel('category', doc.category, language),
    status: doc.status,
    statusToLabel: toLabel('status', doc.status, language),
    price: doc.price,
    imageUrl: `/api/products/${doc.id}/image`,
  };
}

productsRouter.get('/', async (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));

  const fields: Record<string, string> = {};
  if (category && !options('category', 'pt').some((o) => o.value === category)) fields.category = 'INVALID';
  if (status && !options('status', 'pt').some((o) => o.value === status)) fields.status = 'INVALID';
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: 'VALIDATION', fields });
  }

  const filter: Record<string, unknown> = {};
  if (name) {
    const pattern = { $regex: escapeRegex(name), $options: 'i' };
    filter.$or = [{ name: pattern }, { code: pattern }];
  }
  if (category) filter.category = category;
  if (status) filter.status = status;

  const collection = getDb().collection<ProductDoc>('products');
  const [total, docs] = await Promise.all([
    collection.countDocuments(filter),
    collection
      .find(filter, { projection: { image: 0 } })
      .sort({ position: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
  ]);

  res.json({ items: docs.map((doc) => toDto(doc as ProductDoc, req.user!.language)), total, page, pageSize });
});

productsRouter.get('/:id/image', async (req, res) => {
  const doc = await getDb().collection<ProductDoc>('products').findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'NOT_FOUND' });
  const image = doc.image as Binary;
  res.setHeader('Content-Type', doc.imageType);
  res.setHeader('Cache-Control', 'private, max-age=60');
  return res.send(Buffer.from(image.buffer));
});
