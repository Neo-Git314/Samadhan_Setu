import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const SEEDED_CREDENTIALS = {
  admin: {
    email: 'admin@samadhan.gov.in',
    password: 'password123',
    fallbackUser: {
      _id: 'seed_admin_1',
      name: 'Nodal Officer Rajesh Varma',
      email: 'admin@samadhan.gov.in',
      role: 'admin',
      phone: '+91 9000000000',
      organization: 'Department of IT & e-Governance, Govt. of Jharkhand'
    }
  },
  citizen: {
    email: 'rahul.kumar@gmail.com',
    password: 'password123',
    fallbackUser: {
      _id: 'seed_citizen_1',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@gmail.com',
      role: 'citizen',
      phone: '+91 9876543210',
      organization: 'Angara Gram Panchayat, Ranchi'
    }
  },
  university: {
    email: 'university@bitmesra.ac.in',
    password: 'password123',
    fallbackUser: {
      _id: 'seed_uni_1',
      name: 'Dr. Anita Sharma (PI)',
      email: 'university@bitmesra.ac.in',
      role: 'university',
      phone: '+91 9123456780',
      organization: 'Birla Institute of Technology (BIT), Mesra, Ranchi'
    }
  },
  industry: {
    email: 'contact@ecosolve.in',
    password: 'password123',
    fallbackUser: {
      _id: 'seed_ind_1',
      name: 'Suresh Patel (CSR Lead)',
      email: 'contact@ecosolve.in',
      role: 'industry',
      phone: '+91 9988776655',
      organization: 'EcoSolve Technologies Pvt Ltd'
    }
  }
};

export const DEFAULT_USERS_BY_ROLE = {
  citizen: SEEDED_CREDENTIALS.citizen.fallbackUser,
  university: SEEDED_CREDENTIALS.university.fallbackUser,
  industry: SEEDED_CREDENTIALS.industry.fallbackUser,
  admin: SEEDED_CREDENTIALS.admin.fallbackUser
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || localStorage.getItem('samadhan_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('samadhan_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (_e) {}
    return SEEDED_CREDENTIALS.citizen.fallbackUser;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user profile on initial mount via GET /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      const currentToken = localStorage.getItem('token') || localStorage.getItem('samadhan_token');
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (isMounted && res && res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('samadhan_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('[AuthContext] Session hydration error, using cached session:', err.message);
        // If 401, client interceptor already handled redirect/clear
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('samadhan_token', res.token);
        localStorage.setItem('samadhan_user', JSON.stringify(res.user));
        return res.user;
      }
      throw new Error('Login failed: Invalid server response');
    } catch (err) {
      console.error('[AuthContext] Login error:', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('samadhan_token', res.token);
        localStorage.setItem('samadhan_user', JSON.stringify(res.user));
        return res.user;
      }
      throw new Error('Registration failed');
    } catch (err) {
      console.error('[AuthContext] Register error:', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('samadhan_token');
    localStorage.removeItem('samadhan_user');
  };

  // Evaluation persona switcher: auto-authenticates against /api/auth/login
  const switchPersona = useCallback(async (roleKey) => {
    const creds = SEEDED_CREDENTIALS[roleKey];
    if (!creds) return null;

    setIsLoading(true);
    try {
      const res = await authApi.login(creds.email, creds.password);
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('samadhan_token', res.token);
        localStorage.setItem('samadhan_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn(`[AuthContext] Live login failed for ${roleKey}, using seeded fallback:`, err.message);
      // Fallback for offline demo safety
      const fallback = creds.fallbackUser;
      const dummyToken = `demo_token_${roleKey}_${Date.now()}`;
      setToken(dummyToken);
      setUser(fallback);
      localStorage.setItem('token', dummyToken);
      localStorage.setItem('samadhan_token', dummyToken);
      localStorage.setItem('samadhan_user', JSON.stringify(fallback));
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Backwards compatibility alias
  const switchRoleDev = switchPersona;

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      switchPersona,
      switchRoleDev,
      setUser
    }),
    [user, token, isLoading, switchPersona]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
