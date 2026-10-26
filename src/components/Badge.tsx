import { type ReactNode } from 'react';

type Variant = 'gray' | 'green' | 'amber' | 'red' | 'blue' | 'primary';
const styles: Record<Variant, string> = {
  gray: 'bg-slate-100 text-slate-600',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-rose-100 text-rose-700',
  blue: 'bg-sky-100 text-sky-700',
  primary: 'bg-primary-100 text-primary-700',
};

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: Variant }) {
  return <span className={`badge ${styles[variant]}`}>{children}</span>;
}

export function variantFromText(text?: string): Variant {
  const t = (text || '').toLowerCase();
  if (['đang gửi', 'đang làm', 'đang đi', 'đang xử lý', 'mới', 'chưa đi', 'chưa bắt đầu', 'đang mượn', 'nháp', 'chờ duyệt', 'lên kế hoạch', 'chờ duyệt'].some(s => t.includes(s))) return 'amber';
  if (['đã lấy xe', 'hoàn thành', 'đã duyệt', 'đã gửi', 'đã xác nhận', 'đã diễn ra', 'đã giải quyết', 'đã trả', 'đã về', 'tốt', 'thành công', 'kích hoạt', 'đang dùng'].some(s => t.includes(s))) return 'green';
  if (['hủy', 'hư hỏng', 'từ chối', 'thất bại', 'quá hạn', 'hỏng', 'thanh lý', 'đã đóng'].some(s => t.includes(s))) return 'red';
  if (['vip', 'thử việc', 'đang bảo hành'].some(s => t.includes(s))) return 'blue';
  return 'gray';
}
