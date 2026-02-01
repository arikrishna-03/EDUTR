import React, { createContext, useState, useEffect } from "react";
import { me } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("edu_token");
      if (token) {
        try {
          const res = await me();
          setUser(res.user || res);
        } catch (err) {
          console.warn("auth/me failed:", err);
          localStorage.removeItem("edu_token");
          setUser(null);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
