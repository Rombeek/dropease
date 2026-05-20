import 'dotenv/config';
import { pathToFileURL } from 'url';
import { buildApp } from './lib/app.js';

const PORT = process.env.PORT || 3000;

const { app, webAppUrl } = await buildApp();

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  app.listen(PORT, async () => {
    console.log(`DropEase server listening on :${PORT}`);
    console.log(`Mini App URL: ${webAppUrl}/`);
    console.log(`Webhook path: ${process.env.WEBHOOK_PATH || '/webhook'}`);

    if (process.env.USE_POLLING === 'true') {
      const { bot } = await buildApp();
      await bot.start();
      console.log('Bot polling enabled (USE_POLLING=true)');
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('\nDev: set USE_POLLING=true in .env, or run npm run setup:webhook with HTTPS URL');
      console.log('Set BotFather Menu Button / Web App URL to:', webAppUrl + '/');
    }
  });
}

export { app };
