import { type FieldDef } from '@/lib/mockData';
import { formatVND } from '@/lib/format';

interface Props {
  field: FieldDef;
  value: string | number | boolean | null | undefined;
  onChange: (v: string | boolean | number) => void;
}

export function FieldInput({ field, value, onChange }: Props) {
  const base = 'input';
  const common = { id: field.key, required: field.required };

  if (field.type === 'textarea') {
    return <textarea {...common} className={base} rows={3} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'select') {
    return (
      <select {...common} className={base} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Chọn —</option>
        {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-3 cursor-pointer select-none py-1">
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          onClick={() => onChange(!value)}
          className={`relative w-11 h-6 rounded-full transition ${value ? 'bg-primary-600' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
        </button>
        <span className="text-sm text-slate-600">{value ? 'Có' : 'Không'}</span>
      </label>
    );
  }
  if (field.type === 'number') {
    return <input {...common} type="number" className={base} value={typeof value === 'number' ? value : ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
  }
  if (field.type === 'date') {
    return <input {...common} type="date" className={base} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === 'datetime') {
    const v = (value as string) || '';
    const local = v ? new Date(v).toISOString().slice(0, 16) : '';
    return <input {...common} type="datetime-local" className={base} value={local} onChange={(e) => onChange(e.target.value)} />;
  }
  return <input {...common} type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'} className={base} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />;
}

export function renderCell(field: FieldDef | undefined, value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  if (field?.type === 'boolean') return value ? 'Có' : 'Không';
  if (field?.money && typeof value === 'number') return formatVND(value);
  if (field?.type === 'date' || field?.type === 'datetime') {
    const d = new Date(value as string);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('vi-VN', field.type === 'datetime' ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' } : undefined);
  }
  return String(value);
}
