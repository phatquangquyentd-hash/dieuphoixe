import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Sparkles } from 'lucide-react';
import type { ModuleId, RowData } from '@/lib/types';
import { MODULES } from '@/lib/modules';
import { MODULE_FIELDS } from '@/lib/mockData';
import { useModuleData } from '@/hooks/useModuleData';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { Badge, variantFromText } from '@/components/Badge';
import { FieldInput, renderCell } from '@/components/FieldInput';
import { useToast } from '@/components/Toast';

export function CrudModule({ module }: { module: ModuleId }) {
  const def = MODULES[module];
  const { rows, loading, saving, fields, save, remove } = useModuleData(module);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RowData | null>(null);
  const [confirmDel, setConfirmDel] = useState<RowData | null>(null);
  const { notify } = useToast();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [rows, search]);

  const openNew = () => { setEditing({}); setModalOpen(true); };
  const openEdit = (r: RowData) => { setEditing({ ...r }); setModalOpen(true); };

  const onSave = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const ok = await save(editing, isNew);
    if (ok) { setModalOpen(false); notify(isNew ? 'Đã thêm mới thành công.' : 'Đã cập nhật thành công.', 'success'); }
  };

  const onDelete = async () => {
    if (!confirmDel) return;
    const ok = await remove(String(confirmDel.id));
    if (ok) { notify('Đã xóa thành công.', 'success'); setConfirmDel(null); }
  };

  const visibleFields = fields.filter((f) => f.key !== 'id');
  const automation = def.automation;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{def.name}</h1>
          <p className="text-sm text-slate-500">Quản lý dữ liệu {def.name.toLowerCase()}</p>
        </div>
        <div className="flex gap-2">
          {automation && (
            <button onClick={() => notify(`Đã bật tự động hóa: ${automation}`, 'success')} className="btn-secondary">
              <Sparkles className="w-4 h-4 text-accent-500" /> Tự động hóa
            </button>
          )}
          <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Thêm mới</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>Chưa có dữ liệu nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 font-semibold">STT</th>
                  {visibleFields.slice(0, 5).map((f) => (
                    <th key={f.key} className="py-3 px-3 font-semibold whitespace-nowrap">{f.label}</th>
                  ))}
                  <th className="py-3 px-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={String(r.id)} className="border-b border-slate-100 table-row-hover">
                    <td className="py-3 px-3 text-slate-400">{i + 1}</td>
                    {visibleFields.slice(0, 5).map((f) => {
                      const v = r[f.key];
                      const isStatus = f.type === 'select' || f.type === 'boolean';
                      return (
                        <td key={f.key} className="py-3 px-3 whitespace-nowrap">
                          {isStatus ? <Badge variant={variantFromText(String(v))}>{renderCell(f, v)}</Badge> : renderCell(f, v)}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 transition" title="Sửa"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDel(r)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing?.id ? `Sửa ${def.name}` : `Thêm ${def.name}`}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Hủy</button>
            <button className="btn-primary" onClick={onSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.filter((f) => f.key !== 'id').map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="label" htmlFor={f.key}>{f.label}{f.required && <span className="text-rose-500"> *</span>}</label>
                <FieldInput field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmDel(null)}>Hủy</button>
            <button className="btn-danger" onClick={onDelete}>Xóa</button>
          </>
        }
      >
        <p className="text-slate-600">Bạn có chắc muốn xóa mục này? Hành động không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}


