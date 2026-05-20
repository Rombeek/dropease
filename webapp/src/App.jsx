import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import Dashboard from './Dashboard.jsx';
import {
  fetchDashboard,
  triggerImport,
  demoOrderNotify,
  createProInvoice,
} from './api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    setUser(WebApp.initDataUnsafe?.user ?? null);
    load();
  }, [load]);

  const handleImport = async () => {
    setActionMsg(null);
    try {
      const result = await triggerImport();
      setActionMsg(`Imported ${result.imported} product(s). Check bot for notification.`);
      await load();
    } catch (e) {
      setActionMsg(e.message);
    }
  };

  const handleDemoNotify = async () => {
    setActionMsg(null);
    try {
      await demoOrderNotify();
      setActionMsg('Order notification sent in Telegram.');
    } catch (e) {
      setActionMsg(e.message);
    }
  };

  const handleUpgrade = async () => {
    setActionMsg(null);
    try {
      const { invoiceLink } = await createProInvoice();
      if (invoiceLink) WebApp.openInvoice(invoiceLink);
    } catch (e) {
      setActionMsg(e.message);
    }
  };

  const displayName = user?.first_name || 'Seller';

  return (
    <div className="app">
      <header className="header">
        <h1>DropEase</h1>
        <p>
          Hi, {displayName} — manage inventory & orders
        </p>
      </header>

      {error && (
        <div className="card error">
          {error}
          {import.meta.env.DEV && (
            <p style={{ marginTop: 8, fontSize: '0.8rem' }}>
              Dev: open via Telegram or send X-Telegram-Init-Data from WebApp.
            </p>
          )}
        </div>
      )}

      {actionMsg && <div className="card">{actionMsg}</div>}

      <Dashboard
        data={dashboard}
        loading={loading}
        onImport={handleImport}
        onDemoNotify={handleDemoNotify}
        onUpgrade={handleUpgrade}
      />

      <button type="button" className="btn btn-secondary" onClick={() => WebApp.close()}>
        Close
      </button>
    </div>
  );
}
