import { createContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  user: null | any;
  isSignedIn: boolean;
  setUser: React.Dispatch<React.SetStateAction<null | any>>;
  setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/`, {
          method: "GET",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsSignedIn(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn, setUser, setIsSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
