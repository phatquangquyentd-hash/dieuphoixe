import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Search, CheckCircle2, LogIn, XCircle, Trash2, Loader2, Image as ImageIcon, Car } from 'lucide-react';
import type { ParkingTicket } from '@/lib/types';
import { genParkingTickets } from '@/lib/mockData';
import { genId, genMaVe, formatDateTime, timeAgo } from '@/lib/format';
import { compressImage, type CompressedImage } from '@/lib/imageCompress';
import { callApi, isDemoMode } from '@/lib/gasClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { Badge } from '@/components/Badge';
import { Spinner } from '@/components/Spinner';

type Tab = 'in' | 'out';

export function ParkingStation() {
  const { user, demoMode } = useAuth();
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>('in');
  const [tickets, setTickets] = useState<ParkingTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setTickets(genParkingTickets(10));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const active = useMemo(() => tickets.filter((t) => t.TrangThai === 'Đang gửi'), [tickets]);

  if (loading) return <Spinner label="Đang tải danh sách xe..." />;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Trạm Giữ Xe Thông Minh</h1>
        <p className="text-sm text-slate-500">Check-in chụp ảnh & Check-out đối chiếu nhanh</p>
      </div>

      {demoMode && <p className="text-center text-xs text-accent-700 bg-accent-50 rounded-lg py-2">Chế độ Demo — dữ liệu mẫu, ảnh không gửi lên máy chủ.</p>}

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setTab('in')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${tab === 'in' ? 'bg-primary-700 text-white shadow-soft' : 'text-slate-500 hover:bg-white'}`}
        >
          <LogIn className="w-5 h-5" /> XE VÀO
        </button>
        <button
          onClick={() => setTab('out')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${tab === 'out' ? 'bg-emerald-600 text-white shadow-soft' : 'text-slate-500 hover:bg-white'}`}
        >
          <Search className="w-5 h-5" /> XE RA
        </button>
      </div>

      {tab === 'in' ? (
        <CheckInForm
          guard={user?.HoTen || 'Bảo vệ'}
          onCheckIn={(t) => {
            setTickets((prev) => [t, ...prev]);
            notify(`Check-in thành công vé ${t.MaVe}`, 'success');
          }}
        />
      ) : (
        <CheckOutList
          tickets={active}
          guard={user?.HoTen || 'Bảo vệ'}
          onCheckOut={async (id) => {
            if (isDemoMode()) {
              setTickets((prev) => prev.map((t) => t.id === id ? { ...t, TrangThai: 'Đã lấy xe', ThoiGianRa: new Date().toISOString(), NguoiTrucRa: user?.HoTen } : t));
              notify('Đã xác nhận cho xe ra.', 'success');
              return;
            }
            const res = await callApi({ action: 'PARKING_CHECKOUT', payload: { id } });
            if (res.success) {
              setTickets((prev) => prev.map((t) => t.id === id ? { ...t, TrangThai: 'Đã lấy xe', ThoiGianRa: new Date().toISOString() } : t));
              notify('Đã xác nhận cho xe ra.', 'success');
            } else notify('Check-out thất bại: ' + (res.error || ''), 'error');
          }}
        />
      )}

      {active.length > 0 && tab === 'out' && (
        <p className="text-center text-xs text-slate-400">Có <span className="font-bold text-slate-600">{active.length}</span> xe đang gửi trong bãi.</p>
      )}
    </div>
  );
}

function CheckInForm({ guard, onCheckIn }: { guard: string; onCheckIn: (t: ParkingTicket) => void }) {
  const { notify } = useToast();
  const [bienSo, setBienSo] = useState('');
  const [loaiXe, setLoaiXe] = useState<ParkingTicket['LoaiXe']>('Xe máy');
  const [img, setImg] = useState<CompressedImage | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Vui lòng chọn file ảnh.', 'error'); return; }
    setCompressing(true);
    try {
      const c = await compressImage(file);
      setImg(c);
      notify(`Ảnh đã nén: ${c.sizeKB} KB`, 'success');
    } catch {
      notify('Nén ảnh thất bại.', 'error');
    } finally {
      setCompressing(false);
    }
  };

  const submit = async () => {
    if (!bienSo.trim()) { notify('Vui lòng nhập biển số xe.', 'error'); return; }
    setSubmitting(true);
    const ticket: ParkingTicket = {
      id: genId('pk_'),
      BienSo: bienSo.trim().toUpperCase(),
      LoaiXe: loaiXe,
      MaVe: genMaVe(),
      ThoiGianVao: new Date().toISOString(),
      TrangThai: 'Đang gửi',
      NguoiTrucVao: guard,
      AnhBase64: img?.base64,
    };
    if (!isDemoMode()) {
      const res = await callApi({ action: 'PARKING_CHECKIN', payload: ticket as unknown as Record<string, unknown> });
      if (!res.success) { notify('Check-in thất bại: ' + (res.error || ''), 'error'); setSubmitting(false); return; }
    }
    // Simulate small delay for UX
    setTimeout(() => {
      onCheckIn(ticket);
      setBienSo(''); setLoaiXe('Xe máy'); setImg(null);
      if (fileRef.current) fileRef.current.value = '';
      setSubmitting(false);
    }, 250);
  };

  return (
    <div className="card p-5 space-y-5">
      {/* Biển số */}
      <div>
        <label className="label">Biển số xe</label>
        <input
          className="input text-2xl font-bold tracking-wider text-center uppercase py-4"
          placeholder="59A1-123.45"
          value={bienSo}
          onChange={(e) => setBienSo(e.target.value.toUpperCase())}
          maxLength={20}
          autoCapitalize="characters"
        />
      </div>

      {/* Loại xe */}
      <div>
        <label className="label">Loại xe</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Xe máy', 'Ô tô', 'Xe đạp điện'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLoaiXe(l)}
              className={`py-3 rounded-xl font-semibold text-sm border-2 transition ${loaiXe === l ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Ảnh */}
      <div>
        <label className="label">Ảnh xe & người gửi</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {!img ? (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={compressing}
            className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-primary-400 hover:text-primary-600 transition"
          >
            {compressing ? <><Loader2 className="w-8 h-8 animate-spin" /> <span className="text-sm font-medium">Đang nén ảnh...</span></> : <><Camera className="w-8 h-8" /><span className="text-sm font-medium">Chụp / Tải ảnh lên</span></>}
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200">
            <img src={img.base64} alt="Xe" className="w-full max-h-64 object-cover" />
            <button onClick={() => setImg(null)} className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 text-rose-600 hover:bg-white shadow">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
              Đã nén: {img.sizeKB} KB
            </div>
          </div>
        )}
        {img && <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {img.width}×{img.height}px • Gốc: {img.originalSizeKB} KB</p>}
      </div>

      <button onClick={submit} disabled={submitting} className="btn-primary w-full py-4 text-base">
        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</> : <><CheckCircle2 className="w-5 h-5" /> Xác nhận Check-in</>}
      </button>
    </div>
  );
}

function CheckOutList({ tickets, guard, onCheckOut }: { tickets: ParkingTicket[]; guard: string; onCheckOut: (id: string) => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) => t.BienSo.toLowerCase().includes(q) || t.MaVe.toLowerCase().includes(q));
  }, [tickets, query]);

  const selected = tickets.find((t) => t.id === selectedId) || null;

  const confirm = async () => {
    if (!selected) return;
    setProcessing(true);
    await onCheckOut(selected.id);
    setSelectedId(null);
    setProcessing(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          className="input pl-11 text-lg py-3.5"
          placeholder="Tìm biển số hoặc mã vé..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <Car className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>{query ? 'Không tìm thấy xe nào.' : 'Không có xe đang gửi.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`card w-full p-3 flex items-center gap-3 text-left hover:shadow-soft transition ${selectedId === t.id ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {t.AnhBase64 ? <img src={t.AnhBase64} alt={t.BienSo} className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-lg tracking-wide">{t.BienSo}</p>
                <p className="text-xs text-slate-500">{t.LoaiXe} • {timeAgo(t.ThoiGianVao)}</p>
              </div>
              <Badge variant="amber">{t.MaVe}</Badge>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !processing && setSelectedId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto">
            <div className="p-5">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Xác nhận Check-out</h3>

              {selected.AnhBase64 ? (
                <img src={selected.AnhBase64} alt={selected.BienSo} className="w-full max-h-80 object-cover rounded-xl mb-3" />
              ) : (
                <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center mb-3"><Car className="w-10 h-10 text-slate-400" /></div>
              )}

              <div className="space-y-2 text-sm">
                <Row label="Biển số" value={selected.BienSo} bold />
                <Row label="Loại xe" value={selected.LoaiXe} />
                <Row label="Mã vé" value={selected.MaVe} />
                <Row label="Thời gian vào" value={formatDateTime(selected.ThoiGianVao)} />
                <Row label="Người trực vào" value={selected.NguoiTrucVao} />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Vui lòng đối chiếu <b>đúng người - đúng xe - đúng biển số</b> so với ảnh chụp lúc check-in trước khi cho xe ra.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => setSelectedId(null)} disabled={processing} className="btn-secondary py-3"><XCircle className="w-4 h-4" /> Hủy</button>
                <button onClick={confirm} disabled={processing} className="btn-success py-3">
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Cho xe ra
                </button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">Người trực ra: {guard}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-slate-50">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-slate-800 text-base' : 'text-slate-600'}`}>{value}</span>
    </div>
  );
}
