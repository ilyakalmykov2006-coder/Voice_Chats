import { Request, Response } from 'express';
import { getPool, sql } from '../db/sql';

export async function createServer(req: Request, res: Response) {
  const ownerUserId = (req as any).userId;
  const { name, description } = req.body;
  const pool = await getPool();

  const insert = await pool.request()
    .input('ownerUserId', sql.UniqueIdentifier, ownerUserId)
    .input('name', sql.NVarChar(100), name)
    .input('description', sql.NVarChar(500), description || null)
    .query('INSERT INTO Servers (OwnerUserId, Name, Description) OUTPUT INSERTED.Id VALUES (@ownerUserId, @name, @description)');

  res.status(201).json({ id: insert.recordset[0].Id });
}

export async function createChannel(req: Request, res: Response) {
  const { serverId, type, name } = req.body;
  const pool = await getPool();

  const insert = await pool.request()
    .input('serverId', sql.UniqueIdentifier, serverId)
    .input('type', sql.NVarChar(10), type)
    .input('name', sql.NVarChar(100), name)
    .query('INSERT INTO Channels (ServerId, Type, Name) OUTPUT INSERTED.Id VALUES (@serverId, @type, @name)');

  res.status(201).json({ id: insert.recordset[0].Id });
}
