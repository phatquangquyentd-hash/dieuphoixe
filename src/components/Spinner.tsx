import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Đang tải dữ liệu...', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function InlineSpinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className}`} />;
}
