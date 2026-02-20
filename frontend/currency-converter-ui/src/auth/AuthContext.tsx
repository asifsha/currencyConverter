// AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  initialToken?: string; // for tests
}

export const AuthProvider = ({ children, initialToken }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(
    initialToken ?? localStorage.getItem("token")
  );

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
