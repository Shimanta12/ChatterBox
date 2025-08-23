// src/socket/socket.js
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER = 'http://10.0.2.2:5000';

let socket = null;

export const initSocket = async () => {
  if (socket && socket.connected) return socket;
  const token = await AsyncStorage.getItem('token');
  socket = io(SERVER, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  // Optional debugging
  socket.on('connect', () => console.log('socket connected', socket.id));
  socket.on('disconnect', (reason) => console.log('socket disconnected', reason));
  socket.on('connect_error', (err) => console.warn('socket connect_error', err.message || err));

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
