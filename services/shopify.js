/**
 * Shopify integration stub — replace with Admin API calls in production.
 * https://shopify.dev/docs/api/admin-rest
 */

export async function fetchProducts(_credentials) {
  return {
    platform: 'shopify',
    connected: Boolean(process.env.SHOPIFY_STORE && process.env.SHOPIFY_ACCESS_TOKEN),
    products: [
      { id: 'shp_1', title: 'Sample Wireless Earbuds', sku: 'WE-001', stock: 42, price: '29.99' },
      { id: 'shp_2', title: 'Sample Phone Case', sku: 'PC-002', stock: 120, price: '12.50' },
    ],
  };
}

export async function fetchOrders(_credentials) {
  return {
    platform: 'shopify',
    orders: [
      { id: 'ord_1001', status: 'paid', total: '29.99', createdAt: new Date().toISOString() },
      { id: 'ord_1002', status: 'fulfilled', total: '12.50', createdAt: new Date().toISOString() },
    ],
  };
}

export async function connect(_shop, _token) {
  return { ok: true, message: 'Shopify connection stub — configure SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN' };
}
