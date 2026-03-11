import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";

export interface AuthUser {
  _id: string; fullName: string; email: string; phone: string;
  role: "user" | "dealer" | "admin"; referralCode: string; dealerCode?: string | null;
}

interface AuthCtx {
  user: AuthUser | null; loading: boolean;
  signIn:  (e: string, p: string) => Promise<{ error: Error | null }>;
  signUp:  (e: string, p: string, name: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

const getMsg = (d: any, fb: string) => d.message || (d.errors?.[0]?.msg) || fb;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    (async () => {
      const token  = localStorage.getItem("token");
      const cached = localStorage.getItem("user");
      if (!token) { setLoad(false); return; }
      if (cached) { try { setUser(JSON.parse(cached)); } catch {} }
      try {
        const d = await api.get("/api/auth/me");
        if (d.success && d.user) { setUser(d.user); localStorage.setItem("user", JSON.stringify(d.user)); }
        else { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); }
      } catch {}
      finally { setLoad(false); }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const d = await api.post("/api/auth/login", { email, password });
      if (!d.success) return { error: new Error(getMsg(d, "Login failed")) };
      localStorage.setItem("token", d.token);
      localStorage.setItem("user",  JSON.stringify(d.user));
      setUser(d.user);
      return { error: null };
    } catch { return { error: new Error("Cannot connect to server") }; }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const d = await api.post("/api/auth/signup", { email, password, fullName, phone });
      if (!d.success) return { error: new Error(getMsg(d, "Signup failed")) };
      localStorage.setItem("token", d.token);
      localStorage.setItem("user",  JSON.stringify(d.user));
      setUser(d.user);
      return { error: null };
    } catch { return { error: new Error("Cannot connect to server") }; }
  };

  const signOut = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside <AuthProvider>");
  return c;
};
