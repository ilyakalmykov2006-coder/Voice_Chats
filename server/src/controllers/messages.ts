import { Request, Response } from 'express';
import { getPool, sql } from '../db/sql';

export async function createMessage(req: Request, res: Response) {
  const authorUserId = (req as any).userId;
  const { channelId, content } = req.body;
  const pool = await getPool();

  const insert = await pool.request()
    .input('channelId', sql.UniqueIdentifier, channelId)
    .input('authorUserId', sql.UniqueIdentifier, authorUserId)
    .input('content', sql.NVarChar(sql.MAX), content)
    .query('INSERT INTO Messages (ChannelId, AuthorUserId, Content) OUTPUT INSERTED.Id VALUES (@channelId, @authorUserId, @content)');

  res.status(201).json({ id: insert.recordset[0].Id });
}

export async function listMessages(req: Request, res: Response) {
  const { channelId } = req.params;
  const pool = await getPool();

  const result = await pool.request()
    .input('channelId', sql.UniqueIdentifier, channelId)
    .query('SELECT TOP 50 * FROM Messages WHERE ChannelId=@channelId ORDER BY CreatedAt DESC');

  res.json(result.recordset);
}
