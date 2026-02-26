import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { register, login, refresh } from './controllers/auth';
import { sendFriendRequest, acceptFriendRequest } from './controllers/friends';
import { createServer, createChannel } from './controllers/servers';
import { createMessage, listMessages } from './controllers/messages';
import { getTurnCredentials } from './controllers/media';
import { authRequired } from './auth-middleware';
import { configureSockets } from './ws/socket';
import { getRouter } from './rtc/mediasoup';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || '*' } });

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/refresh', refresh);

app.post('/api/friends/request', authRequired, sendFriendRequest);
app.post('/api/friends/accept', authRequired, acceptFriendRequest);

app.post('/api/servers', authRequired, createServer);
app.post('/api/channels', authRequired, createChannel);

app.post('/api/messages', authRequired, createMessage);
app.get('/api/messages/:channelId', authRequired, listMessages);

app.get('/api/media/turn-credentials', authRequired, getTurnCredentials);

configureSockets(io);
getRouter().catch((err) => {
  console.error('mediasoup init failed:', err);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`VoiceChats server listening on :${port}`);
});
