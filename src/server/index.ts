import { createApp } from './app';
import { config } from './config';
import { connect } from './db';
import { ensureSeed } from './seed';

async function main() {
  await connect();
  await ensureSeed();
  createApp().listen(config.port, () => {
    console.log(`Desafio QA rodando em http://localhost:${config.port} (banco: ${config.mongoDb})`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
