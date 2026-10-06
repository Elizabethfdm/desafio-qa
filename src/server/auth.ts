import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { config } from './config';
import { Resource, hasAccess } from './permissions';

export interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  role: string;
  roleToLabel: string;
  language: string;
  country: string;
  authorizedId: string | null;
  authorizedName: string | null;
  permissions: Record<string, string>;
  iat?: number;
  exp?: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenClaims;
    }
  }
}

export function signToken(claims: Omit<TokenClaims, 'iat' | 'exp'>): string {
  return jwt.sign(claims, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

/** Valida assinatura e expiração. As permissões vêm do próprio token (sem consultar o banco). */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret) as TokenClaims;
    return next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
}

export function requirePermission(resource: Resource, mode: 'read' | 'write') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasAccess(req.user?.permissions, resource, mode)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    return next();
  };
}

/** Garante que o usuário pertence a uma autorizada (os dados são sempre filtrados por ela). */
export function requireAuthorized(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.authorizedId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  return next();
}
