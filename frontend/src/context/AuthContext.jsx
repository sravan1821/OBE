import { createContext, useContext, useState, useEffect } from 'react';
import { DataStore } from '../lib/data';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('obe_react_session');
    if (session) {
      const parsed = JSON.parse(session);
      setUser(parsed.user);
      setRole(parsed.role);
    }
  }, []);

  const login = (username, password) => {
    const res = DataStore.authenticate(username, password);
    if (res.success) {
      setUser(res.user);
      setRole(res.role);
      localStorage.setItem('obe_react_session', JSON.stringify({ user: res.user, role: res.role }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('obe_react_session');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
