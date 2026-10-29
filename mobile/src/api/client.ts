import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator can't see "localhost" of your computer - it uses 10.0.2.2 instead.
// Testing on a real phone? Put your laptop's LAN IP here (e.g. http://192.168.1.5:5000/api).
export const BASE_URL = 'http://10.0.2.2:5000/api';

export const TOKEN_KEY = 'todo_token';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// Attach the saved JWT to every outgoing request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Turn any axios error into a plain readable message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === 'ECONNABORTED' || !error.response) {
      return "Can't reach the server. Is the backend running?";
    }
  }
  return 'Something went wrong. Please try again.';
}

export default api;
