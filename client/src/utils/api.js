import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'http://10.0.2.2:5000/api'; 
const SERVER_BASE = 'http://10.0.2.2:5000';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // error handlers will be added here with fallbacks.
    console.log(e)
  }
  return config;
});

// Helper function to get full audio URL
export const getAudioUrl = (audioPath) => {
  if (!audioPath) return null;
  if (audioPath.startsWith('http')) return audioPath;
  return `${SERVER_BASE}${audioPath}`;
};

export default api;
