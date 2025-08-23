// src/socket/registry.js
let ioInstance = null;
export const onlineMap = new Map(); // userId -> socketId

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

/**
 * Emit an event to a specific userId if they are online.
 * userId can be ObjectId string.
 */
export const emitToUser = (userId, event, payload) => {
  const sid = onlineMap.get(String(userId));
  if (sid && ioInstance) {
    ioInstance.to(sid).emit(event, payload);
  }
};
