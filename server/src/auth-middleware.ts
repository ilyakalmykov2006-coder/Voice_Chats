import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = header.slice('Bearer '.length);
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string };
    (req as any).userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
