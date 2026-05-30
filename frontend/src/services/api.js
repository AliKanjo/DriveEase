import axiosInstance from 'axios';

const api = axiosInstance.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Never send REQUIRE_2FA as a bearer token - it is not a real JWT
  if (token && token !== 'REQUIRE_2FA') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 Unauthorized, clear stale session data and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
