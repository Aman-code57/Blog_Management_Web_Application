import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import api from './utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/me')
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (username, password) => {
    setLoginLoading(true);
    try {
      const response = await api.post('/login', { username, password });
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      const userResponse = await api.get('/me');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUser(userResponse.data);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      localStorage.removeItem('access_token');
      await api.post('/logout');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUser(null);
      toast.success('Logout successful!');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loginLoading,
    logoutLoading,
  };

  const SpinnerOverlay = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <TailSpin height="50" width="50" color="#007bff" ariaLabel="loading" />
    </div>
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {(loginLoading || logoutLoading) && <SpinnerOverlay />}
    </AuthContext.Provider>
  );
};
