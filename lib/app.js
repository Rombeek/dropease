import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { webhookCallback } from 'grammy';
import { createBot } from '../bot/index.js';
import { requireTelegramAuth } from '../utils/middleware.js';
import * as shopify from '../services/shopify.js';
import * as woocommerce from '../services/woocommerce.js';
import { notifyUser, formatOrderNotification } from '../bot/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cached = null;

export async function buildApp() {
  if (cached) return cached;

  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is required. Set it in Vercel → Settings → Environment Variables.');
  }

  const PORT = process.env.PORT || 3000;
  const WEBAPP_URL =
    process.env.WEBAPP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    `http://localhost:${PORT}`;
  const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/webhook';
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
  const webAppUrl = WEBAPP_URL.replace(/\/$/, '');

  const bot = await createBot(BOT_TOKEN, `${webAppUrl}/`);
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'dropease' });
  });

  app.get('/api/me', requireTelegramAuth, (req, res) => {
    res.json({ user: req.telegramUser });
  });

  app.get('/api/dashboard', requireTelegramAuth, async (_req, res) => {
    const [shp, woo, shpOrders, wooOrders] = await Promise.all([
      shopify.fetchProducts(),
      woocommerce.fetchProducts(),
      shopify.fetchOrders(),
      woocommerce.fetchOrders(),
    ]);

    res.json({
      products: [...shp.products, ...woo.products],
      orders: [...shpOrders.orders, ...wooOrders.orders].slice(0, 10),
      platforms: {
        shopify: shp.connected,
        woocommerce: woo.connected,
      },
    });
  });

  app.post('/api/import', requireTelegramAuth, async (req, res) => {
    const [shp, woo] = await Promise.all([
      shopify.fetchProducts(),
      woocommerce.fetchProducts(),
    ]);
    const products = [...shp.products, ...woo.products];

    if (req.telegramUser?.id) {
      try {
        await notifyUser(
          bot,
          req.telegramUser.id,
          `✅ <b>Import complete</b>\n\n${products.length} product(s) ready in your dashboard.`,
          `${webAppUrl}/`
        );
      } catch (e) {
        console.warn('Could not notify user:', e.message);
      }
    }

    res.json({ imported: products.length, products });
  });

  app.post('/api/demo/notify-order', requireTelegramAuth, async (req, res) => {
    const chatId = req.telegramUser?.id;
    if (!chatId) {
      return res.status(400).json({ error: 'No Telegram user in initData' });
    }

    const order = {
      id: 'demo_' + Date.now(),
      status: 'paid',
      total: '29.99',
    };

    await notifyUser(bot, chatId, formatOrderNotification(order), `${webAppUrl}/`);
    res.json({ sent: true, order });
  });

  app.post('/api/payments/invoice', requireTelegramAuth, async (req, res) => {
    const chatId = req.telegramUser?.id;
    if (!chatId) {
      return res.status(400).json({ error: 'No Telegram user' });
    }

    try {
      const link = await bot.api.createInvoiceLink({
        title: 'DropEase Pro',
        description: 'Unlock advanced integrations and analytics',
        payload: 'dropease_pro_' + chatId,
        currency: 'XTR',
        prices: [{ label: 'Pro (1 month)', amount: 100 }],
      });
      res.json({ invoiceLink: link });
    } catch (e) {
      res.status(500).json({
        error: e.message,
        hint: 'Enable payments for your bot in BotFather and use Telegram Stars (XTR).',
      });
    }
  });

  const webhookHandler = webhookCallback(bot, 'express', {
    secretToken: WEBHOOK_SECRET || undefined,
  });
  app.use(WEBHOOK_PATH, webhookHandler);

  const webappDist = path.join(__dirname, '..', 'webapp', 'dist');
  app.use(express.static(webappDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith(WEBHOOK_PATH)) {
      return next();
    }
    res.sendFile(path.join(webappDist, 'index.html'), (err) => {
      if (err) {
        res.status(503).send('Mini App build missing. Run: npm run build');
      }
    });
  });

  cached = { app, bot, webAppUrl };
  return cached;
}
