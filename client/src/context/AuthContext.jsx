import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { initSocket, disconnectSocket } from '../socket/socket';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const login = async (token, userObj) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userId', userObj?.id || userObj?._id || '');
    setUser(userObj);
    try { await initSocket(); } catch (e) { console.warn('socket init failed', e.message || e); }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    setUser(null);
    disconnectSocket();
  };

  const restore = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoadingInitial(false);
        return;
      }
      const { data } = await api.get('/users/me');
      setUser(data);
      try { await initSocket(); } catch (e) { console.warn('socket init', e.message || e); }
    } catch (err) {
      console.warn('Auth restore failed', err?.message || err);
      await AsyncStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => { restore(); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loadingInitial }}>
      {children}
    </AuthContext.Provider>
  );
};
