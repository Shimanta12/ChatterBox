import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'http://10.0.2.2:5000/api'; 

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

export default api;
