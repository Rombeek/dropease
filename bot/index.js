import { Bot } from 'grammy';
import { registerCommands } from './commands.js';

export async function createBot(token, webAppUrl) {
  const bot = new Bot(token);

  try {
    await bot.api.setMyCommands([
      { command: 'connect', description: 'Connect e-commerce platforms' },
      { command: 'import', description: 'Import products' },
      { command: 'orders', description: 'View recent orders' },
    ]);
  } catch (e) {
    console.warn('Could not register bot commands (check BOT_TOKEN):', e.description || e.message);
  }

  registerCommands(bot, webAppUrl);

  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  return bot;
}
