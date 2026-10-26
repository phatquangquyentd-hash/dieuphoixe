import { useState } from 'react';
import { Settings as SettingsIcon, Link2, ShieldCheck, Save, Trash2, CheckCircle2, Server } from 'lucide-react';
import { getGasUrl, setGasUrl, isDemoMode } from '@/lib/gasClient';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/Badge';

export function SettingsPage() {
  const { demoMode } = useAuth();
  const { notify } = useToast();
  const [url, setUrl] = useState(getGasUrl());

  const save = () => {
    setGasUrl(url);
    notify('Đã lưu cấu hình. Làm mới trang để áp dụng.', 'success');
  };

  const clear = () => {
    setGasUrl('');
    setUrl('');
    notify('Đã xóa URL. Trở về chế độ Demo.', 'success');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-500">Cấu hình kết nối Google Apps Script backend.</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-slate-800">Kết nối Backend</h3>
          {demoMode ? <Badge variant="amber">Demo Mode</Badge> : <Badge variant="green">Đã kết nối</Badge>}
        </div>

        <div>
          <label className="label">URL Google Apps Script Web App</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              className="input pl-10 font-mono text-xs"
              placeholder="https://script.google.com/macros/s/AKfyc.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Dán URL Web App từ Google Apps Script. URL được lưu trong trình duyệt (localStorage), không gửi đi đâu.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Lưu cấu hình</button>
          {url && <button onClick={clear} className="btn-secondary text-rose-600"><Trash2 className="w-4 h-4" /> Xóa URL</button>}
        </div>

        {url && !demoMode && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4" /> Hệ thống sẽ gọi tới backend GAS khi có thao tác.
          </div>
        )}
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-slate-800">Bảo mật</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>Không hardcode API Key, Token hay URL nhạy cảm vào source code.</li>
          <li>URL GAS chỉ lưu trong <code className="text-xs bg-slate-100 px-1 rounded">localStorage</code> của trình duyệt.</li>
          <li>Mọi yêu cầu gọi GAS dùng <code className="text-xs bg-slate-100 px-1 rounded">POST text/plain</code> để tránh CORS preflight.</li>
          <li>Chế độ Demo tự bật khi chưa cấu hình URL — dùng dữ liệu mẫu an toàn.</li>
        </ul>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-slate-800">Biến môi trường</h3>
        </div>
        <p className="text-sm text-slate-600">
          Để deploy lên Vercel, đặt biến <code className="text-xs bg-slate-100 px-1 rounded">VITE_GAS_API_URL</code> trong Environment Variables.
          File <code className="text-xs bg-slate-100 px-1 rounded">.env.example</code> đã có sẵn trong dự án làm mẫu.
        </p>
      </div>
    </div>
  );
}
