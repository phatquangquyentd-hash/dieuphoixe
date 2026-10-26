import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Filter, Loader2 } from 'lucide-react';
import type { RowData } from '@/lib/types';
import { isDemoMode } from '@/lib/gasClient';
import { callApi } from '@/lib/gasClient';
import { genId, formatDateTime } from '@/lib/format';
import { Badge, variantFromText } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { useToast } from '@/components/Toast';

interface Task extends RowData {
  id: string;
  TieuDe: string;
  NguoiGiao?: string;
  NguoiNhan?: string;
  HanHoanThanh?: string;
  TienDo: string;
  GhiChu?: string;
  NgayTao?: string;
}

const STATUSES = ['Chưa bắt đầu', 'Đang làm', 'Hoàn thành', 'Hủy', 'Quá hạn'];
const SEED: Task[] = [
  { id: 't1', TieuDe: 'Duyệt phiếu chi mua vật tư', NguoiGiao: 'Kế toán', NguoiNhan: 'Admin', HanHoanThanh: new Date(Date.now() + 86400000).toISOString(), TienDo: 'Đang làm', NgayTao: new Date(Date.now() - 86400000).toISOString() },
  { id: 't2', TieuDe: 'Kiểm kê kho vật tư tháng 10', NguoiGiao: 'Admin', NguoiNhan: 'Thủ kho', HanHoanThanh: new Date(Date.now() - 3600000).toISOString(), TienDo: 'Quá hạn', NgayTao: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 't3', TieuDe: 'Phê duyệt thư mời sự kiện Vu Lan', NguoiGiao: 'Ban tổ chức', NguoiNhan: 'Admin', HanHoanThanh: new Date(Date.now() + 2 * 86400000).toISOString(), TienDo: 'Chưa bắt đầu', NgayTao: new Date().toISOString() },
  { id: 't4', TieuDe: 'Báo cáo thu chi tuần', NguoiGiao: 'Admin', NguoiNhan: 'Kế toán', HanHoanThanh: new Date(Date.now() + 43200000).toISOString(), TienDo: 'Đang làm', NgayTao: new Date(Date.now() - 43200000).toISOString() },
];

const store: { tasks: Task[] } = { tasks: SEED };

export function TasksToProcess() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [detail, setDetail] = useState<Task | null>(null);
  const [acting, setActing] = useState(false);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    if (isDemoMode()) { setTasks(store.tasks); setLoading(false); return; }
    const res = await callApi<Task[]>({ action: 'LIST', module: '2_ViecCanXuLy' });
    if (res.success && res.data) setTasks(res.data); else setTasks(store.tasks);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of STATUSES) c[s] = tasks.filter((t) => t.TienDo === s).length;
    return c;
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks;
    if (filter === 'overdue') return tasks.filter((t) => t.TienDo === 'Quá hạn');
    if (filter === 'pending') return tasks.filter((t) => t.TienDo === 'Chưa bắt đầu' || t.TienDo === 'Đang làm');
    return tasks.filter((t) => t.TienDo === filter);
  }, [tasks, filter]);

  const act = async (task: Task, action: 'approve' | 'complete') => {
    setActing(true);
    const newStatus = action === 'complete' ? 'Hoàn thành' : 'Hoàn thành';
    const updated = { ...task, TienDo: newStatus };
    if (isDemoMode()) {
      store.tasks = store.tasks.map((t) => t.id === task.id ? updated : t);
      setTasks(store.tasks);
    } else {
      await callApi({ action: 'UPDATE', module: '2_ViecCanXuLy', payload: updated });
      await load();
    }
    setActing(false);
    setDetail(null);
    notify(action === 'approve' ? 'Đã phê duyệt.' : 'Đã đánh dấu hoàn thành.', 'success');
  };

  const chips = [
    { key: 'all', label: 'Tất cả', count: tasks.length },
    { key: 'pending', label: 'Chờ xử lý', count: (counts['Chưa bắt đầu'] || 0) + (counts['Đang làm'] || 0) },
    { key: 'overdue', label: 'Quá hạn', count: counts['Quá hạn'] || 0 },
    { key: 'Hoàn thành', label: 'Hoàn thành', count: counts['Hoàn thành'] || 0 },
  ];

  if (loading) return <Spinner label="Đang tải danh sách việc..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Việc cần xử lý</h1>
        <p className="text-sm text-slate-500">Tác vụ và phiếu chờ duyệt hoặc quá hạn — nhấp để xử lý ngay.</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`badge px-3 py-1.5 cursor-pointer transition ${filter === c.key ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {c.label} <span className="opacity-70">({c.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <Filter className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Không có việc nào trong mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((t) => {
            const overdue = t.TienDo === 'Quá hạn' || (t.HanHoanThanh && new Date(t.HanHoanThanh) < new Date() && t.TienDo !== 'Hoàn thành');
            return (
              <button key={t.id} onClick={() => setDetail(t)} className="card p-4 text-left hover:shadow-soft transition group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 leading-snug">{t.TieuDe}</h3>
                  <Badge variant={variantFromText(t.TienDo)}>{t.TienDo}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {t.NguoiGiao && <span>Từ: {t.NguoiGiao}</span>}
                  {t.NguoiNhan && <span>• Phụ trách: {t.NguoiNhan}</span>}
                </div>
                <div className={`flex items-center gap-1.5 text-xs mt-2 ${overdue ? 'text-rose-600' : 'text-slate-400'}`}>
                  {overdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  Hạn: {formatDateTime(t.HanHoanThanh)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Chi tiết việc"
        footer={detail && detail.TienDo !== 'Hoàn thành' ? (
          <>
            <button className="btn-secondary" onClick={() => setDetail(null)}>Đóng</button>
            <button className="btn-success" onClick={() => detail && act(detail, 'complete')} disabled={acting}>
              {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Đánh dấu hoàn thành
            </button>
          </>
        ) : <button className="btn-secondary" onClick={() => setDetail(null)}>Đóng</button>}
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <h3 className="text-lg font-bold text-slate-800">{detail.TieuDe}</h3>
            <Row label="Người giao" value={detail.NguoiGiao || '—'} />
            <Row label="Người nhận" value={detail.NguoiNhan || '—'} />
            <Row label="Hạn hoàn thành" value={formatDateTime(detail.HanHoanThanh)} />
            <Row label="Tiến độ" value={detail.TienDo} />
            <Row label="Ngày tạo" value={formatDateTime(detail.NgayTao)} />
            {detail.GhiChu && <p className="text-slate-600 bg-slate-50 rounded-xl p-3">{detail.GhiChu}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-slate-50">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className="text-slate-700 text-right">{value}</span>
    </div>
  );
}

void genId;
