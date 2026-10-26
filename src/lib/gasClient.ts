// Google Apps Script API client with CORS-bypass (POST text/plain) and demo fallback.
import type { ApiRequest, ApiResponse } from './types';

const STORAGE_KEY = 'erp_gas_url';
const ENV_URL = (import.meta.env.VITE_GAS_API_URL as string | undefined)?.trim();

export function getGasUrl(): string {
  if (typeof window !== 'undefined') {
    const local = window.localStorage.getItem(STORAGE_KEY);
    if (local && local.trim()) return local.trim();
  }
  return ENV_URL || '';
}

export function setGasUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const v = url.trim();
  if (v) window.localStorage.setItem(STORAGE_KEY, v);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function isDemoMode(): boolean {
  return !getGasUrl();
}

export async function callApi<T = unknown>(req: ApiRequest, timeoutMs = 20000): Promise<ApiResponse<T>> {
  const url = getGasUrl();
  if (!url) {
    // Demo mode: caller should handle locally; return a sentinel.
    return { success: false, error: 'DEMO_MODE' };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Lỗi mạng không xác định';
    return { success: false, error: msg };
  }
}
