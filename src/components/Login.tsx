import { useState } from 'react';
import { SquareParking, LogIn, ShieldCheck, AlertTriangle, Loader2, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
  const { login, loading, demoMode } = useAuth();
  const [taikhoan, setTaikhoan] = useState('');
  const [matkhau, setMatkhau] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!taikhoan || !matkhau) { setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.'); return; }
    const res = await login(taikhoan.trim(), matkhau);
    if (!res.ok) setError(res.message || 'Đăng nhập thất bại.');
  };

  const fillDemo = (u: string, p: string) => { setTaikhoan(u); setMatkhau(p); setError(''); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-4">
            <SquareParking className="w-9 h-9 text-primary-200" />
          </div>
          <h1 className="text-2xl font-bold text-white">ERP & Quản lý Giữ Xe</h1>
          <p className="text-primary-200/80 text-sm mt-1">Hệ thống thông minh — Đăng nhập để tiếp tục</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-up">
          {demoMode && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-accent-50 border border-accent-200">
              <ShieldCheck className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
              <div className="text-xs text-accent-800">
                <p className="font-semibold mb-1">Chế độ Demo đang bật</p>
                <p>Chưa cấu hình URL Google Apps Script. Dùng tài khoản mẫu bên dưới để trải nghiệm.</p>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Tài khoản</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="Nhập tài khoản"
                  value={taikhoan}
                  onChange={(e) => setTaikhoan(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Nhập mật khẩu"
                  value={matkhau}
                  onChange={(e) => setMatkhau(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang đăng nhập...</> : <><LogIn className="w-5 h-5" /> Đăng nhập</>}
            </button>
          </form>

          {demoMode && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2.5">Tài khoản mẫu (nhấn để điền):</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => fillDemo('admin', 'admin123')} className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition">
                  <p className="text-sm font-bold text-slate-700">Admin</p>
                  <p className="text-xs text-slate-400">admin / admin123</p>
                </button>
                <button onClick={() => fillDemo('baove01', '123456')} className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition">
                  <p className="text-sm font-bold text-slate-700">Bảo vệ</p>
                  <p className="text-xs text-slate-400">baove01 / 123456</p>
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-primary-200/60 text-xs mt-6">© 2025 ERP & Giữ Xe Thông minh</p>
      </div>
    </div>
  );
}
