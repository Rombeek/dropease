export default function Dashboard({ data, loading, onImport, onDemoNotify, onUpgrade }) {
  if (loading) {
    return <div className="card">Loading dashboard…</div>;
  }

  if (!data) {
    return <div className="card error">Could not load dashboard.</div>;
  }

  const { products = [], orders = [], platforms = {} } = data;

  return (
    <>
      <div className="platforms">
        <span className={`platform-pill ${platforms.shopify ? 'on' : ''}`}>
          Shopify {platforms.shopify ? '✓' : '—'}
        </span>
        <span className={`platform-pill ${platforms.woocommerce ? 'on' : ''}`}>
          WooCommerce {platforms.woocommerce ? '✓' : '—'}
        </span>
      </div>

      <div className="card">
        <h2>Inventory ({products.length})</h2>
        <ul className="list">
          {products.length === 0 ? (
            <li>No products — use Import or /import in the bot.</li>
          ) : (
            products.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong>
                <br />
                SKU {p.sku} · stock {p.stock} · ${p.price}
              </li>
            ))
          )}
        </ul>
        <button type="button" className="btn" onClick={onImport}>
          Sync products
        </button>
      </div>

      <div className="card">
        <h2>Recent orders</h2>
        <ul className="list">
          {orders.length === 0 ? (
            <li>No orders yet.</li>
          ) : (
            orders.map((o) => (
              <li key={o.id}>
                <code>{o.id}</code>{' '}
                <span className="badge">{o.status}</span> · ${o.total}
              </li>
            ))
          )}
        </ul>
        <button type="button" className="btn btn-secondary" onClick={onDemoNotify}>
          Test order notification
        </button>
      </div>

      <button type="button" className="btn btn-secondary" onClick={onUpgrade}>
        Upgrade with Telegram Stars
      </button>
    </>
  );
}
