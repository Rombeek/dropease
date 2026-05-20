/**
 * Rich notification helpers for order/inventory updates.
 */

export function formatOrderNotification(order) {
  const status = order.status || 'unknown';
  const total = order.total ?? '—';
  const id = order.id || '—';

  return (
    `📦 <b>Order update</b>\n\n` +
    `Order: <code>${id}</code>\n` +
    `Status: <b>${status}</b>\n` +
    `Total: $${total}\n\n` +
    `Open the dashboard to manage inventory.`
  );
}

export function formatImportNotification(count, platform) {
  return (
    `✅ <b>Import complete</b>\n\n` +
    `${count} product(s) synced from <b>${platform}</b>.\n` +
    `Review them in the Mini App dashboard.`
  );
}

export async function notifyUser(bot, chatId, htmlMessage, webAppUrl) {
  await bot.api.sendMessage(chatId, htmlMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📊 Open Dashboard',
            web_app: { url: webAppUrl },
          },
        ],
      ],
    },
  });
}
