import { Router } from 'express';
import { authenticate } from '../auth';
import { allPicklists } from '../picklists';

export const picklistsRouter = Router();
picklistsRouter.use(authenticate);

/** Opções dos picklists no idioma do usuário: `value` (português) para enviar e `toLabel` para exibir. */
picklistsRouter.get('/', (req, res) => {
  res.json(allPicklists(req.user!.language));
});
