import { Server } from 'socket.io';

export function configureSockets(io: Server) {
  io.on('connection', (socket) => {
    socket.on('presence:update', (payload) => {
      socket.broadcast.emit('presence:update', payload);
    });

    socket.on('message:new', (payload) => {
      io.emit('message:new', payload);
    });

    socket.on('typing:start', (payload) => socket.broadcast.emit('typing:start', payload));
    socket.on('typing:stop', (payload) => socket.broadcast.emit('typing:stop', payload));

    socket.on('voice:join', (payload) => socket.join(`voice:${payload.channelId}`));
    socket.on('voice:mute', (payload) => socket.broadcast.emit('voice:mute', payload));

    socket.on('rtc:transport-create', (payload, cb) => cb?.({ ok: true, payload }));
    socket.on('rtc:produce', (payload, cb) => cb?.({ ok: true, payload }));
    socket.on('rtc:consume', (payload, cb) => cb?.({ ok: true, payload }));

    socket.on('screen:start', () => socket.broadcast.emit('screen:start'));
    socket.on('screen:stop', () => socket.broadcast.emit('screen:stop'));
  });
}
