import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User, ModuleId } from '@/lib/types';
import { DEMO_USERS } from '@/lib/mockData';
import { callApi, isDemoMode, getGasUrl } from '@/lib/gasClient';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (taikhoan: string, matkhau: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  demoMode: boolean;
  canAccess: (m: ModuleId) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const SESSION_KEY = 'erp_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
    } catch { /* ignore */ }
  }, []);

  const persist = (u: User | null) => {
    if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(SESSION_KEY);
  };

  const login = useCallback(async (taikhoan: string, matkhau: string) => {
    setLoading(true);
    try {
      const demo = isDemoMode();
      if (demo) {
        const found = DEMO_USERS.find((u) => u.TaiKhoan === taikhoan && u.MatKhau === matkhau && u.KichHoat);
        if (!found) return { ok: false, message: 'Sai tài khoản, mật khẩu hoặc tài khoản đã bị khóa.' };
        setUser(found); persist(found);
        return { ok: true };
      }
      // Live GAS auth
      const res = await callApi<User>({ action: 'AUTH_LOGIN', payload: { TaiKhoan: taikhoan, MatKhau: matkhau } });
      if (res.success && res.data) {
        setUser(res.data); persist(res.data);
        return { ok: true };
      }
      return { ok: false, message: res.error === 'DEMO_MODE' ? 'Chưa cấu hình URL GAS.' : (res.message || res.error || 'Đăng nhập thất bại.') };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => { setUser(null); persist(null); }, []);

  const canAccess = useCallback((m: ModuleId) => !!user && user.QuyenModule.includes(m), [user]);

  const value = useMemo<AuthCtx>(() => ({
    user, loading, login, logout, demoMode: isDemoMode(), canAccess,
  }), [user, loading, login, logout, canAccess]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getGasUrlPub() { return getGasUrl(); }
