import { useCallback, useEffect, useState } from 'react';
import type { ModuleId, RowData } from '@/lib/types';
import { MODULE_FIELDS, seedRows } from '@/lib/mockData';
import { callApi, isDemoMode } from '@/lib/gasClient';
import { genId } from '@/lib/format';
import { useToast } from '@/components/Toast';

const cache: Record<string, RowData[]> = {};

export function useModuleData(module: ModuleId) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    if (isDemoMode()) {
      if (!cache[module]) cache[module] = seedRows(module, 6);
      setRows(cache[module]);
      setLoading(false);
      return;
    }
    const res = await callApi<RowData[]>({ action: 'LIST', module });
    if (res.success && res.data) setRows(res.data);
    else notify('Không tải được dữ liệu: ' + (res.error || ''), 'error');
    setLoading(false);
  }, [module, notify]);

  useEffect(() => { load(); }, [load]);

  const save = async (row: RowData, isNew: boolean): Promise<boolean> => {
    setSaving(true);
    if (isDemoMode()) {
      if (isNew) {
        const r = { ...row, id: genId('r_') };
        cache[module] = [r, ...(cache[module] || [])];
      } else {
        cache[module] = (cache[module] || []).map((r) => r.id === row.id ? row : r);
      }
      setRows(cache[module]);
      setSaving(false);
      return true;
    }
    const res = await callApi({ action: isNew ? 'CREATE' : 'UPDATE', module, payload: row });
    setSaving(false);
    if (!res.success) { notify('Lưu thất bại: ' + (res.error || ''), 'error'); return false; }
    await load();
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    if (isDemoMode()) {
      cache[module] = (cache[module] || []).filter((r) => r.id !== id);
      setRows(cache[module]);
      return true;
    }
    const res = await callApi({ action: 'DELETE', module, payload: { id } });
    if (!res.success) { notify('Xóa thất bại: ' + (res.error || ''), 'error'); return false; }
    await load();
    return true;
  };

  return { rows, loading, saving, fields: MODULE_FIELDS[module] || [], reload: load, save, remove };
}
