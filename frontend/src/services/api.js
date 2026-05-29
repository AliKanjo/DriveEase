import axios from 'react';

// Wait, I should import axios from 'axios', not 'react'. My mistake.
import axiosInstance from 'axios';

const api = axiosInstance.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
