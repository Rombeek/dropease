import { validateInitData } from './validateInitData.js';

/**
 * Express middleware: requires valid Telegram WebApp initData header.
 */
export function requireTelegramAuth(req, res, next) {
  const initData =
    req.headers['x-telegram-init-data'] ||
    req.query.initData ||
    req.body?.initData;

  if (!initData && process.env.DEV_BYPASS_AUTH === 'true') {
    req.telegramUser = { id: 0, first_name: 'Dev', username: 'dev_user' };
    req.telegramInitData = {};
    return next();
  }

  const botToken = process.env.BOT_TOKEN;
  const result = validateInitData(initData, botToken);

  if (!result.valid) {
    return res.status(401).json({ error: result.error || 'Unauthorized' });
  }

  req.telegramUser = result.user;
  req.telegramInitData = result.params;
  next();
}
