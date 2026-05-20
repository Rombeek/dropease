# Как выложить DropEase на Vercel (пошагово для новичка)

Vercel — бесплатный хостинг для сайтов и API. После деплоя вы получите публичную ссылку вида `https://ваш-проект.vercel.app`.

---

## Что понадобится

1. Аккаунт на [GitHub](https://github.com) (бесплатно)
2. Аккаунт на [Vercel](https://vercel.com) (можно войти через GitHub)
3. Токен бота от [@BotFather](https://t.me/BotFather) в Telegram
4. Папка с проектом DropEase на вашем компьютере

---

## Шаг 1. Установите Git (если ещё нет)

1. Скачайте Git: https://git-scm.com/download/win
2. Установите с настройками по умолчанию
3. Откройте **PowerShell** в папке проекта (правый клик → «Открыть в терминале»)

Проверка:

```powershell
git --version
```

---

## Шаг 2. Загрузите код на GitHub

### 2.1. Создайте репозиторий на GitHub

1. Зайдите на https://github.com/new
2. Имя: например `dropease`
3. Выберите **Private** или **Public**
4. **Не** ставьте галочки «Add README» — репозиторий должен быть пустым
5. Нажмите **Create repository**

### 2.2. Отправьте файлы с компьютера

В PowerShell (замените `ВАШ_ЛОГИН` на свой логин GitHub):

```powershell
cd "C:\Users\Lenovo\Desktop\Новая папка"

git init
git add .
git commit -m "DropEase MVP for Vercel"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/dropease.git
git push -u origin main
```

GitHub может попросить логин и пароль. Для пароля используйте **Personal Access Token** (Settings → Developer settings → Tokens), не обычный пароль от аккаунта.

---

## Шаг 3. Подключите проект к Vercel

1. Откройте https://vercel.com и войдите через GitHub
2. Нажмите **Add New…** → **Project**
3. Найдите репозиторий `dropease` → **Import**
4. Настройки оставьте как есть — Vercel сам увидит `vercel.json`
5. **Пока не жмите Deploy** — сначала добавьте переменные (шаг 4)

---

## Шаг 4. Добавьте секреты (Environment Variables)

На странице импорта проекта найдите блок **Environment Variables** и добавьте:

| Имя | Значение | Зачем |
|-----|----------|--------|
| `BOT_TOKEN` | Токен от @BotFather | Чтобы работал Telegram-бот |
| `DEV_BYPASS_AUTH` | `false` | В продакшене только через Telegram |
| `WEBHOOK_SECRET` | Любая длинная случайная строка (необязательно) | Защита webhook |

`WEBAPP_URL` можно **не** указывать: на Vercel адрес подставится автоматически (`VERCEL_URL`).

Если хотите свой домен позже — добавьте `WEBAPP_URL` = `https://ваш-домен.com`.

---

## Шаг 5. Первый деплой

1. Нажмите **Deploy**
2. Подождите 1–3 минуты
3. Когда статус станет **Ready**, нажмите на превью — откроется сайт

Ваша публичная ссылка будет вверху, например:

**https://dropease-xxxx.vercel.app**

Проверьте в браузере:

- `https://ВАШ-URL.vercel.app/` — Mini App (интерфейс)
- `https://ВАШ-URL.vercel.app/api/health` — должен ответить `{"ok":true,...}`

---

## Шаг 6. Настройте Telegram-бота

### 6.1. Web App URL (Mini App)

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота → **Bot Settings** → **Menu Button** → **Configure menu button**
3. Тип: **Web App**
4. URL: `https://ВАШ-URL.vercel.app/` (со слэшем в конце можно, без — тоже ок)

### 6.2. Webhook (чтобы бот отвечал на команды)

На компьютере в папке проекта создайте `.env`:

```env
BOT_TOKEN=ваш_токен_от_BotFather
WEBAPP_URL=https://ВАШ-URL.vercel.app
WEBHOOK_PATH=/webhook
WEBHOOK_SECRET=ваша_случайная_строка
```

Затем в PowerShell:

```powershell
npm run setup:webhook
```

Должно появиться `Webhook set: https://...`

Проверка в Telegram: напишите боту `/start`.

---

## Шаг 7. Обновления после изменений кода

Каждый раз, когда меняете код локально:

```powershell
git add .
git commit -m "описание изменений"
git push
```

Vercel **сам** пересоберёт и опубликует новую версию (обычно за 1–2 минуты).

---

## Частые проблемы

### «BOT_TOKEN is required» на Vercel

Переменная `BOT_TOKEN` не добавлена или деплой был до её добавления.  
**Settings** → **Environment Variables** → добавьте → **Redeploy**.

### Страница пустая или «build missing»

Сборка webapp не прошла. В Vercel откройте **Deployments** → последний деплой → **Building** / **Logs** и найдите ошибку `npm run build`.

### Бот не отвечает в Telegram

1. Проверьте `npm run setup:webhook` с правильным `WEBAPP_URL`
2. URL в BotFather должен совпадать с Vercel-ссылкой
3. На бесплатном Vercel иногда «засыпает» — первое сообщение может идти 2–5 сек

### В браузере без Telegram — ошибка 401

Это нормально: в продакшене `DEV_BYPASS_AUTH=false`. Открывайте приложение **из Telegram** (кнопка Menu / Web App).

---

## Краткая шпаргалка

| Действие | Команда / место |
|----------|------------------|
| Публичная ссылка | Vercel → Project → Domains |
| Переменные окружения | Vercel → Settings → Environment Variables |
| Логи ошибок | Vercel → Deployments → View Logs |
| Webhook | `npm run setup:webhook` |
| URL для BotFather | `https://ваш-проект.vercel.app/` |

Готово — DropEase доступен по HTTPS для Telegram Mini App и webhook.
