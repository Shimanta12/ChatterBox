import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import { setIO, onlineMap, emitToUser } from './registry.js';

export const initSocket = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, { cors: { origin: corsOrigin, credentials: true } });
  setIO(io);

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('No token'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = String(payload.id);
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    onlineMap.set(socket.userId, socket.id);
    io.emit('presence:update', { userId: socket.userId, online: true });

    socket.on('message:send', async ({ to, body }) => {
      try {
        if (!to || !body) return;
        const msg = await Message.create({ from: socket.userId, to, body, delivered: false });

        const toSid = onlineMap.get(String(to));
        if (toSid) {
          io.to(toSid).emit('message:new', msg);
          msg.delivered = true;
          await msg.save();
        }

        socket.emit('message:ack', { _id: msg._id, delivered: msg.delivered, createdAt: msg.createdAt });
      } catch (err) {
        console.error('socket message:send error', err);
      }
    });

    socket.on('message:read', async ({ withUserId }) => {
      try {
        if (!withUserId) return;
        await Message.updateMany({ from: withUserId, to: socket.userId, read: false }, { $set: { read: true } });
        emitToUser(withUserId, 'message:read', { by: socket.userId });
      } catch (err) {
        console.error('socket message:read error', err);
      }
    });

    socket.on('typing:start', ({ to }) => {
      if (!to) return;
      emitToUser(to, 'typing:start', { from: socket.userId });
    });

    socket.on('typing:stop', ({ to }) => {
      if (!to) return;
      emitToUser(to, 'typing:stop', { from: socket.userId });
    });


    socket.on('disconnect', () => {
      onlineMap.delete(socket.userId);
      io.emit('presence:update', { userId: socket.userId, online: false });
    });
  });

  return io;
};
