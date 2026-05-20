import * as shopify from '../services/shopify.js';
import * as woocommerce from '../services/woocommerce.js';
import { formatImportNotification } from './notifications.js';

export function registerCommands(bot, webAppUrl) {
  bot.command('start', async (ctx) => {
    await ctx.reply(
      'Welcome to DropEase! Connect your platforms and start managing your dropshipping business efficiently.\n\n' +
        'Commands:\n' +
        '/connect — Link Shopify or WooCommerce\n' +
        '/import — Import products into your dashboard\n' +
        '/orders — View recent orders',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📊 Open Dashboard', web_app: { url: webAppUrl } }],
            [{ text: '🔗 Connect Platform', callback_data: 'connect' }],
          ],
        },
      }
    );
  });

  bot.command('connect', async (ctx) => {
    await ctx.reply(
      'Choose a platform to connect:\n\n' +
        '• Shopify — set SHOPIFY_STORE + SHOPIFY_ACCESS_TOKEN in server .env\n' +
        '• WooCommerce — set WOOCOMMERCE_URL + keys in server .env\n\n' +
        'Then use /import to pull products.',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Shopify', callback_data: 'connect_shopify' },
              { text: 'WooCommerce', callback_data: 'connect_woo' },
            ],
            [{ text: '📊 Open Dashboard', web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  });

  bot.command('import', async (ctx) => {
    const [shp, woo] = await Promise.all([
      shopify.fetchProducts(),
      woocommerce.fetchProducts(),
    ]);
    const products = [...shp.products, ...woo.products];
    const platform = shp.connected ? 'Shopify' : woo.connected ? 'WooCommerce' : 'demo';

    await ctx.reply(formatImportNotification(products.length, platform), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '📊 Review in Dashboard', web_app: { url: webAppUrl } }]],
      },
    });
  });

  bot.command('orders', async (ctx) => {
    const [shp, woo] = await Promise.all([
      shopify.fetchOrders(),
      woocommerce.fetchOrders(),
    ]);
    const orders = [...shp.orders, ...woo.orders].slice(0, 5);

    const lines = orders.length
      ? orders.map((o) => `• <code>${o.id}</code> — ${o.status} — $${o.total}`).join('\n')
      : 'No orders yet. Connect a store with /connect.';

    await ctx.reply(`📋 <b>Recent orders</b>\n\n${lines}`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '📊 Full dashboard', web_app: { url: webAppUrl } }]],
      },
    });
  });

  bot.callbackQuery('connect', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('Use /connect to pick Shopify or WooCommerce.');
  });

  bot.callbackQuery('connect_shopify', async (ctx) => {
    await ctx.answerCallbackQuery();
    const result = await shopify.connect();
    await ctx.reply(result.message);
  });

  bot.callbackQuery('connect_woo', async (ctx) => {
    await ctx.answerCallbackQuery();
    const result = await woocommerce.connect();
    await ctx.reply(result.message);
  });
}
