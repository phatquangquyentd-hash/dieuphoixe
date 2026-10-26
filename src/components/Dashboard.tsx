import { useEffect, useMemo, useState } from 'react';
import { Car, Wallet, AlertTriangle, PackageX, TrendingUp, CalendarClock, Send, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode } from '@/lib/gasClient';
import { genParkingTickets } from '@/lib/mockData';
import { formatVND, formatNumber, timeAgo } from '@/lib/format';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';

export function Dashboard({ onGoModule }: { onGoModule: (m: '19_LuotGiuXe' | '2_ViecCanXuLy' | '10_VatTu') => void }) {
  const { user, demoMode } = useAuth();
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const tickets = genParkingTickets(14);
    const active = tickets.filter((t) => t.TrangThai === 'Đang gửi').length;
    return {
      activeCars: active,
      revenue: 48_750_000,
      expense: 12_300_000,
      overdue: 4,
      lowStock: 3,
      weeklyCheckins: [12, 18, 9, 22, 16, 25, 19],
      recent: tickets.slice(0, 5),
    };
  }, []);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, []);

  if (loading) return <Spinner label="Đang tải dữ liệu tổng quan..." />;

  const kpis = [
    { label: 'Xe đang gửi', value: formatNumber(stats.activeCars), icon: Car, color: 'primary', action: () => onGoModule('19_LuotGiuXe') },
    { label: 'Tổng thu', value: formatVND(stats.revenue), icon: Wallet, color: 'green', },
    { label: 'Việc quá hạn', value: formatNumber(stats.overdue), icon: AlertTriangle, color: 'amber', action: () => onGoModule('2_ViecCanXuLy') },
    { label: 'Vật tư sắp hết', value: formatNumber(stats.lowStock), icon: PackageX, color: 'red', action: () => onGoModule('10_VatTu') },
  ];
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Xin chào, {user?.HoTen}!</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan hoạt động hôm nay • {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={k.action}
              className="card p-4 sm:p-5 text-left hover:shadow-soft transition group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${colorMap[k.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{k.value}</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{k.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-600" /> Lượt check-in 7 ngày qua</h3>
              <p className="text-xs text-slate-400">Thống kê lượt xe vào bãi</p>
            </div>
            <Badge variant="green"><Activity className="w-3.5 h-3.5" /> Đang theo dõi</Badge>
          </div>
          <BarChart data={stats.weeklyCheckins} />
        </div>

        {/* Quick info */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-primary-600" /> Sự kiện sắp tới</h3>
          <ul className="space-y-3">
            {[
              { t: 'Họp tổng kết tháng', d: '28/10', c: 'primary' },
              { t: 'Đại lễ Vu Lan', d: '02/11', c: 'amber' },
              { t: 'Kiểm kê vật tư', d: '05/11', c: 'green' },
            ].map((e) => (
              <li key={e.t} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Th11</span>
                  <span className="text-lg font-bold text-slate-700 leading-none">{e.d.split('/')[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{e.t}</p>
                  <p className="text-xs text-slate-400">{e.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <button className="btn-secondary w-full mt-4 text-sm"><Send className="w-4 h-4" /> Gửi báo cáo định kỳ</button>
        </div>
      </div>

      {/* Recent parking */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Lượt giữ xe gần đây</h3>
          <button onClick={() => onGoModule('19_LuotGiuXe')} className="text-sm text-primary-600 font-semibold hover:underline">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 px-2 font-semibold">Biển số</th>
                <th className="py-2 px-2 font-semibold">Loại xe</th>
                <th className="py-2 px-2 font-semibold">Người trực</th>
                <th className="py-2 px-2 font-semibold">Thời gian vào</th>
                <th className="py-2 px-2 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2.5 px-2 font-semibold text-slate-800">{t.BienSo}</td>
                  <td className="py-2.5 px-2 text-slate-600">{t.LoaiXe}</td>
                  <td className="py-2.5 px-2 text-slate-600">{t.NguoiTrucVao}</td>
                  <td className="py-2.5 px-2 text-slate-500">{timeAgo(t.ThoiGianVao)}</td>
                  <td className="py-2.5 px-2"><Badge variant={t.TrangThai === 'Đang gửi' ? 'amber' : 'green'}>{t.TrangThai}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {demoMode && (
        <p className="text-center text-xs text-slate-400">Đang chạy ở chế độ Demo. Cấu hình URL GAS trong Cài đặt để kết nối dữ liệu thật.</p>
      )}
    </div>
  );
}

function BarChart({ data }: { data: number[] }) {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between gap-2 h-44">
      {data.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full flex-1 flex items-end">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300 group-hover:from-primary-600 group-hover:to-primary-400 transition-all relative" style={{ height: `${h}%` }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">{v}</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">{days[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
