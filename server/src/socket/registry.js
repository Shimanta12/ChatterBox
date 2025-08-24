let ioInstance = null;
export const onlineMap = new Map(); 

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitToUser = (userId, event, payload) => {
  const sid = onlineMap.get(String(userId));
  if (sid && ioInstance) {
    ioInstance.to(sid).emit(event, payload);
  }
};
