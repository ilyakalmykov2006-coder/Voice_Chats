import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../db/sql';

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body;
  const hash = await argon2.hash(password);

  const pool = await getPool();
  await pool.request()
    .input('email', sql.NVarChar(255), email)
    .input('username', sql.NVarChar(64), username)
    .input('passwordHash', sql.NVarChar(255), hash)
    .query('INSERT INTO Users (Email, Username, PasswordHash) VALUES (@email, @username, @passwordHash)');

  return res.status(201).json({ ok: true });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const pool = await getPool();
  const user = await pool.request()
    .input('email', sql.NVarChar(255), email)
    .query('SELECT TOP 1 Id, Email, PasswordHash FROM Users WHERE Email = @email');

  const row = user.recordset[0];
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await argon2.verify(row.PasswordHash, password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = jwt.sign({ sub: row.Id, email: row.Email }, process.env.JWT_ACCESS_SECRET!, { expiresIn: process.env.JWT_ACCESS_TTL || '15m' });
  const refreshToken = jwt.sign({ sub: row.Id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_TTL || '7d' });

  return res.json({ accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string };
    const accessToken = jwt.sign({ sub: decoded.sub }, process.env.JWT_ACCESS_SECRET!, { expiresIn: process.env.JWT_ACCESS_TTL || '15m' });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}
