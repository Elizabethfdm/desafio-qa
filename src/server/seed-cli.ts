import { disconnect } from './db';
import { seed } from './seed';

seed()
  .then(() => console.log('Seed concluído: 1 Super Admin e 24 produtos fictícios.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnect());
