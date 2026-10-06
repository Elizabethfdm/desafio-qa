import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { authRouter } from './routes/auth';
import { authorizedsRouter } from './routes/authorizeds';
import { contactsRouter } from './routes/contacts';
import { employeesRouter } from './routes/employees';
import { picklistsRouter } from './routes/picklists';
import { productsRouter } from './routes/products';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', (req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', authRouter);
  app.use('/api/contacts', contactsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/employees', employeesRouter);
  app.use('/api/authorizeds', authorizedsRouter);
  app.use('/api/picklists', picklistsRouter);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

  app.use(express.static(path.join(__dirname, '..', '..', 'public')));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  });

  return app;
}
