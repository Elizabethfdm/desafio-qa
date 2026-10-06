import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não definida (veja o arquivo .env).`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017',
  mongoDb: process.env.MONGO_DB ?? 'desafio_qa',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  superAdminEmail: process.env.SUPERADMIN_EMAIL ?? 'superadmin@example.com',
  superAdminPassword: required('SUPERADMIN_PASSWORD'),
  defaultEmployeePassword: process.env.DEFAULT_EMPLOYEE_PASSWORD ?? 'Senha@123',
};
