import crypto from 'crypto';

/**
 * Validates Telegram Mini App initData per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData, botToken) {
  if (!initData || !botToken) {
    return { valid: false, error: 'Missing initData or bot token' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { valid: false, error: 'Missing hash' };
  }

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    return { valid: false, error: 'Invalid hash' };
  }

  const authDate = Number(params.get('auth_date'));
  if (authDate) {
    const maxAgeSec = 86400;
    if (Math.floor(Date.now() / 1000) - authDate > maxAgeSec) {
      return { valid: false, error: 'initData expired' };
    }
  }

  let user = null;
  const userRaw = params.get('user');
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      return { valid: false, error: 'Invalid user payload' };
    }
  }

  return { valid: true, user, params: Object.fromEntries(params) };
}
