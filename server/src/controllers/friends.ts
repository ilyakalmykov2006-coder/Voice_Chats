import { Request, Response } from 'express';
import { getPool, sql } from '../db/sql';

export async function sendFriendRequest(req: Request, res: Response) {
  const requesterId = (req as any).userId;
  const { addresseeId } = req.body;
  const pool = await getPool();

  await pool.request()
    .input('requesterId', sql.UniqueIdentifier, requesterId)
    .input('addresseeId', sql.UniqueIdentifier, addresseeId)
    .query("INSERT INTO Friends (RequesterId, AddresseeId, Status) VALUES (@requesterId, @addresseeId, 'pending')");

  res.status(201).json({ ok: true });
}

export async function acceptFriendRequest(req: Request, res: Response) {
  const addresseeId = (req as any).userId;
  const { requesterId } = req.body;
  const pool = await getPool();

  await pool.request()
    .input('requesterId', sql.UniqueIdentifier, requesterId)
    .input('addresseeId', sql.UniqueIdentifier, addresseeId)
    .query("UPDATE Friends SET Status='accepted', UpdatedAt=SYSUTCDATETIME() WHERE RequesterId=@requesterId AND AddresseeId=@addresseeId");

  res.json({ ok: true });
}
