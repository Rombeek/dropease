const API_BASE = import.meta.env.DEV ? '' : '';

function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': getInitData(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

export function fetchDashboard() {
  return apiFetch('/api/dashboard');
}

export function triggerImport() {
  return apiFetch('/api/import', { method: 'POST' });
}

export function demoOrderNotify() {
  return apiFetch('/api/demo/notify-order', { method: 'POST' });
}

export function createProInvoice() {
  return apiFetch('/api/payments/invoice', { method: 'POST' });
}
