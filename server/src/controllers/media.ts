import crypto from 'node:crypto';
import { Request, Response } from 'express';

export function getTurnCredentials(_req: Request, res: Response) {
  const ttl = Number(process.env.TURN_TTL_SECONDS || 600);
  const expiry = Math.floor(Date.now() / 1000) + ttl;
  const user = `${expiry}:user`;
  const secret = process.env.TURN_STATIC_AUTH_SECRET || 'secret';
  const credential = crypto.createHmac('sha1', secret).update(user).digest('base64');

  res.json({
    username: user,
    credential,
    ttl,
    urls: [
      process.env.TURN_UDP_URL,
      process.env.TURN_TCP_URL,
      process.env.TURN_TLS_URL
    ].filter(Boolean)
  });
}
