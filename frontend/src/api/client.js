import axios from 'axios';

const SERVER_IP = window.location.hostname;
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${SERVER_IP}:8000/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('weaving_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});