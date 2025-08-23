// src/socket/index.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import { setIO, onlineMap, emitToUser } from './registry.js';

export const initSocket = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, { cors: { origin: corsOrigin, credentials: true } });
  setIO(io);

  // Authenticate sockets using JWT presented in handshake auth or query
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
    // Register online
    onlineMap.set(socket.userId, socket.id);
    io.emit('presence:update', { userId: socket.userId, online: true });

    // message send
    socket.on('message:send', async ({ to, body }) => {
      try {
        if (!to || !body) return;
        const msg = await Message.create({ from: socket.userId, to, body, delivered: false });

        // deliver if recipient online
        const toSid = onlineMap.get(String(to));
        if (toSid) {
          io.to(toSid).emit('message:new', msg);
          msg.delivered = true;
          await msg.save();
        }

        // ack back to sender (delivered flag may be false)
        socket.emit('message:ack', { _id: msg._id, delivered: msg.delivered, createdAt: msg.createdAt });
      } catch (err) {
        console.error('socket message:send error', err);
      }
    });

    // mark messages read (real-time)
    socket.on('message:read', async ({ withUserId }) => {
      try {
        if (!withUserId) return;
        await Message.updateMany({ from: withUserId, to: socket.userId, read: false }, { $set: { read: true } });
        emitToUser(withUserId, 'message:read', { by: socket.userId });
      } catch (err) {
        console.error('socket message:read error', err);
      }
    });

    // typing indicators
    socket.on('typing:start', ({ to }) => {
      if (!to) return;
      emitToUser(to, 'typing:start', { from: socket.userId });
    });

    socket.on('typing:stop', ({ to }) => {
      if (!to) return;
      emitToUser(to, 'typing:stop', { from: socket.userId });
    });

    // friend request events are emitted from friendController via registry.emitToUser

    socket.on('disconnect', () => {
      onlineMap.delete(socket.userId);
      io.emit('presence:update', { userId: socket.userId, online: false });
    });
  });

  return io;
};
