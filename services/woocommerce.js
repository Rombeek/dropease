/**
 * WooCommerce integration stub — replace with REST API calls in production.
 * https://woocommerce.github.io/woocommerce-rest-api-docs/
 */

export async function fetchProducts(_credentials) {
  return {
    platform: 'woocommerce',
    connected: Boolean(process.env.WOOCOMMERCE_URL && process.env.WOOCOMMERCE_KEY),
    products: [
      { id: 'woo_1', title: 'Sample Hoodie', sku: 'HD-101', stock: 18, price: '45.00' },
      { id: 'woo_2', title: 'Sample Mug', sku: 'MG-202', stock: 200, price: '8.99' },
    ],
  };
}

export async function fetchOrders(_credentials) {
  return {
    platform: 'woocommerce',
    orders: [
      { id: 'wc_501', status: 'processing', total: '45.00', createdAt: new Date().toISOString() },
      { id: 'wc_502', status: 'completed', total: '8.99', createdAt: new Date().toISOString() },
    ],
  };
}

export async function connect(_url, _key, _secret) {
  return {
    ok: true,
    message: 'WooCommerce connection stub — configure WOOCOMMERCE_URL, WOOCOMMERCE_KEY, WOOCOMMERCE_SECRET',
  };
}
