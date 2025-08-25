import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const BASE = 'http://10.0.2.2:5000/api'; 

const api = axios.create({ baseURL: BASE });

// Automatic auth token send handling to satisy auth middleware on the backend.
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.log(e)
  }
  return config;
});

export default api;
