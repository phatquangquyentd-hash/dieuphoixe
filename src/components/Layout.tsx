import { useState, type ReactNode } from 'react';
import { Menu, X, LogOut, ChevronDown, Settings as SettingsIcon, SquareParking, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GROUPS, MODULES } from '@/lib/modules';
import type { ModuleId } from '@/lib/types';

interface LayoutProps {
  active: ModuleId | 'settings';
  onNavigate: (m: ModuleId | 'settings') => void;
  children: ReactNode;
}

export function Layout({ active, onNavigate, children }: LayoutProps) {
  const { user, logout, demoMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const allowed = (id: ModuleId) => user?.QuyenModule.includes(id);

  const NavContent = () => (
    <nav className="space-y-5">
      {GROUPS.map((g) => {
        const mods = g.modules.filter((m) => allowed(m.id));
        if (mods.length === 0) return null;
        return (
          <div key={g.id}>
            <p className={`px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '•' : g.label}
            </p>
            <div className="space-y-0.5">
              {mods.map((m) => {
                const Icon = m.icon;
                const isActive = active === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { onNavigate(m.id); setSidebarOpen(false); }}
                    title={collapsed ? m.name : ''}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group
                      ${isActive ? 'bg-primary-700 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100'}
                      ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-slate-400 group-hover:text-primary-600'}`} />
                    {!collapsed && <span className="truncate">{m.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => { onNavigate('settings'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-600 hover:bg-slate-100 ${collapsed ? 'justify-center' : ''}`}
        >
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          {!collapsed && <span>Cài đặt</span>}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 flex flex-col transition-all
        ${collapsed ? 'w-[68px]' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className={`flex items-center gap-2 px-4 h-16 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-primary-700 text-white flex items-center justify-center shrink-0">
            <SquareParking className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm leading-tight truncate">ERP & Giữ Xe</p>
              <p className="text-[11px] text-slate-400 truncate">Hệ thống thông minh</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <NavContent />
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center gap-2 py-3 border-t border-slate-100 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-90' : '-rotate-90'}`} />
          {!collapsed && 'Thu gọn'}
        </button>
      </aside>

      {/* Main */}
      <div className={`lg:transition-all ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h2 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                {active === 'settings' ? 'Cài đặt' : MODULES[active as ModuleId]?.name}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 badge bg-accent-100 text-accent-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Demo
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {user?.HoTen?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.HoTen}</p>
                <p className="text-xs text-slate-400">{user?.VaiTro}</p>
              </div>
              <button onClick={logout} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition" title="Đăng xuất">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">{children}</main>
      </div>

      {/* Mobile sidebar close btn */}
      {sidebarOpen && (
        <button onClick={() => setSidebarOpen(false)} className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
