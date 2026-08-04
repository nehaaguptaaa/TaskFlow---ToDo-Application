import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    return fullName || email ? { fullName, email } : null;
  });

  const login = (newToken, userInfo = {}) => {
    localStorage.setItem("token", newToken);
    if (userInfo.fullName) localStorage.setItem("fullName", userInfo.fullName);
    if (userInfo.email) localStorage.setItem("email", userInfo.email);
    setToken(newToken);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);