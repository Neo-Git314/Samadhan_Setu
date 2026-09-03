import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// TODO: Connect auth context to backend login/logout endpoints.
export function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: 'Demo User', role: 'citizen' });

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
