import bcrypt from 'bcryptjs';
import { Response, Router } from 'express';
import { AuthorizedDoc, EmployeeDoc, getDb } from '../db';
import { Role, permissionsFor } from '../permissions';
import { toLabel } from '../picklists';
import { signToken } from '../auth';

export const authRouter = Router();

async function handleLogin(emailInput: unknown, passwordInput: unknown, res: Response) {
  const email = typeof emailInput === 'string' ? emailInput.trim().toLowerCase() : '';
  const password = typeof passwordInput === 'string' ? passwordInput : '';
  const fields: Record<string, string> = {};
  if (!email) fields.email = 'REQUIRED';
  if (!password) fields.password = 'REQUIRED';
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: 'VALIDATION', fields });
  }

  const employee = await getDb().collection<EmployeeDoc>('employees').findOne({ email });
  if (!employee || !bcrypt.compareSync(password, employee.passwordHash)) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  let authorizedName: string | null = null;
  if (employee.authorizedId) {
    const authorized = await getDb().collection<AuthorizedDoc>('authorizeds').findOne({ id: employee.authorizedId });
    authorizedName = authorized?.name ?? null;
  }

  const token = signToken({
    sub: employee.id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
    roleToLabel: toLabel('role', employee.role, employee.language),
    language: employee.language,
    country: employee.country,
    authorizedId: employee.authorizedId ?? null,
    authorizedName,
    permissions: permissionsFor(employee.role as Role, employee.country) as Record<string, string>,
  });
  return res.json({ token });
}

authRouter.post('/login', (req, res) => handleLogin(req.body?.email, req.body?.password, res));

authRouter.get('/login', (req, res) => handleLogin(req.query.email, req.query.password, res));

