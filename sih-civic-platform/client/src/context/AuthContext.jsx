import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_USERS_BY_ROLE = {
  citizen: {
    _id: 'u1001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar.civic@jharkhand.gov.in',
    role: 'citizen',
    phone: '+91 98765 43210',
    district: 'Ranchi',
    state: 'Jharkhand'
  },
  university: {
    _id: 'u1002',
    name: 'Dr. Anita Sharma',
    email: 'anita@bitmesra.ac.in',
    role: 'university',
    phone: '+91 91234 56780',
    organization: 'Birla Institute of Technology (BIT), Mesra, Ranchi',
    aisheCode: 'U-0120'
  },
  industry: {
    _id: 'u1003',
    name: 'Suresh Singh',
    email: 'partnerships@ecosolve.in',
    role: 'industry',
    phone: '+91 99887 76655',
    organization: 'EcoSolve Technologies Pvt Ltd (Jharkhand CSR Partner)',
    cin: 'L29100JH1980PLC023456'
  },
  admin: {
    _id: 'u1004',
    name: 'Officer Rajesh Varma',
    email: 'nodal.director@jharkhand.gov.in',
    role: 'admin',
    phone: '+91 90000 00000',
    organization: 'Government of Jharkhand',
    department: 'Department of IT & e-Governance (JAP-IT)'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('samadhan_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
    return DEFAULT_USERS_BY_ROLE.citizen;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('samadhan_token') || 'demo_jwt_token_auth_valid';
  });

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    if (user) {
      localStorage.setItem('samadhan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('samadhan_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('samadhan_token', token);
    } else {
      localStorage.removeItem('samadhan_token');
    }
  }, [token]);

  const login = (role, customData = {}) => {
    const roleUser = DEFAULT_USERS_BY_ROLE[role] || DEFAULT_USERS_BY_ROLE.citizen;
    const finalUser = { ...roleUser, ...customData, role };
    const newToken = `jwt_token_${role}_${Date.now()}`;

    setUser(finalUser);
    setToken(newToken);
    localStorage.setItem('samadhan_user', JSON.stringify(finalUser));
    localStorage.setItem('samadhan_token', newToken);

    return finalUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('samadhan_user');
    localStorage.removeItem('samadhan_token');
  };

  const switchRoleDev = (newRole) => {
    if (DEFAULT_USERS_BY_ROLE[newRole]) {
      const switchedUser = DEFAULT_USERS_BY_ROLE[newRole];
      const newToken = `jwt_token_${newRole}_${Date.now()}`;
      setUser(switchedUser);
      setToken(newToken);
      localStorage.setItem('samadhan_user', JSON.stringify(switchedUser));
      localStorage.setItem('samadhan_token', newToken);
      return switchedUser;
    }
    return user;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
      switchRoleDev,
      setUser
    }),
    [user, token, isAuthenticated]
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
