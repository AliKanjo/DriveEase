import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username && role) {
      setUser({ username, role });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { accessToken, username: userUsername, role } = response.data;
    
    if (accessToken === 'REQUIRE_2FA') {
      return response.data; // Return so Login.jsx can prompt for code
    }

    localStorage.setItem('token', accessToken);
    localStorage.setItem('username', userUsername);
    localStorage.setItem('role', role);
    setUser({ username: userUsername, role });
    return response.data;
  };

  const verify2fa = async (username, password, code) => {
    const response = await api.post('/auth/verify-2fa', { username, password, code });
    const { accessToken, username: userUsername, role } = response.data;
    
    localStorage.setItem('token', accessToken);
    localStorage.setItem('username', userUsername);
    localStorage.setItem('role', role);
    setUser({ username: userUsername, role });
    return response.data;
  };

  const register = async (username, email, password, role, gender) => {
    await api.post('/auth/register', { username, email, password, role, gender });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verify2fa, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
