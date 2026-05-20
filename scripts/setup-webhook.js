/**
 * Registers the Telegram webhook for production deploy.
 * Usage: WEBAPP_URL=https://your-domain.com node scripts/setup-webhook.js
 */
import 'dotenv/config';

const token = process.env.BOT_TOKEN;
const baseUrl = process.env.WEBAPP_URL;
const path = process.env.WEBHOOK_PATH || '/webhook';
const secret = process.env.WEBHOOK_SECRET || '';

if (!token || !baseUrl) {
  console.error('Set BOT_TOKEN and WEBAPP_URL in .env');
  process.exit(1);
}

const webhookUrl = `${baseUrl.replace(/\/$/, '')}${path}`;

const body = {
  url: webhookUrl,
  allowed_updates: ['message', 'callback_query'],
  drop_pending_updates: true,
};
if (secret) body.secret_token = secret;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const data = await res.json();
console.log(data.ok ? `Webhook set: ${webhookUrl}` : data);
process.exit(data.ok ? 0 : 1);
