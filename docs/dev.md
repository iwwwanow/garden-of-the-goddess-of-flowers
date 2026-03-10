# dev.md — план разработки garden-of-the-goddess-of-flowers

## Стек

- **Frontend**: Vite + React + TypeScript + `@telegram-apps/telegram-ui`
- **Backend**: Node.js + Express + TypeScript
- **БД**: SQLite (better-sqlite3 + drizzle-orm)
- **Генератор цветков**: Python (PyTorch) — запускается вручную раз в сезон
- **Деплой**: VPS + nginx + pm2

---

## Структура проекта

```
/
├── client/          # Telegram Mini App (Vite + React + TS)
├── server/          # Express API (Node.js + TS)
├── flower-generator/ # Python генератор (уже есть)
├── docs/
│   └── dev.md
└── scripts/
```

---

## TODO

### Фаза 0 — Инициализация

- [ ] Сгенерировать первый цветок (`python3 flower-generator/src/generate.py`) → сохранить как `server/assets/flowers/season-1.png`
- [ ] Инициализировать `server/` — `npm init`, `tsconfig.json`, зависимости (express, better-sqlite3, drizzle-orm, @types/\*)
- [ ] Инициализировать `client/` — `npm create vite`, настроить `@telegram-apps/sdk` и `@telegram-apps/telegram-ui`
- [ ] Создать `.env.example` (TELEGRAM_BOT_TOKEN, DATABASE_URL, PORT, CLIENT_URL)
- [ ] Создать `docker-compose.yml` под локальную разработку (опционально)

---

### Фаза 1 — БД (SQLite + drizzle)

Схема:

```
users          — telegram_id, username, first_name, fd_balance, created_at
flowers        — id, season, image_path (одна запись на сезон — текущий цветок)
user_flowers   — id, user_id, flower_id, day (1–7), last_watered_at, is_dried, created_at
waterings      — id, user_flower_id, watered_by_user_id, watered_at (уникально per day per user)
seeds          — id, user_id, flower_id, quantity
```

- [ ] Написать drizzle schema (`server/src/db/schema.ts`)
- [ ] Написать и прогнать первую миграцию

---

### Фаза 2 — Backend API (Express + TS)

- [ ] `POST /auth` — принять `initData` от Telegram, верифицировать HMAC, создать/найти пользователя → вернуть JWT
- [ ] `GET /me` — текущий юзер + статус его цветка (день роста, FD, семена)
- [ ] `POST /flowers/:userFlowerId/water` — полить цветок (свой или чужой). Ограничение: 1 раз в день на цветок
- [ ] `GET /users/:userId/flower` — цветок пользователя (для просмотра чужого профиля)
- [ ] `GET /leaderboard` — топ пользователей по `fd_balance`
- [ ] `GET /seeds` — семена текущего юзера
- [ ] `POST /seeds/share` — передать семена другому юзеру

Игровая логика (cron, каждый день в midnight):

- [ ] За каждый политый цветок: начислить `2^(day-1)` FD юзеру и художнику (owner of flower)
- [ ] Если цветок не полили — стать `is_dried = true`, день не прибавлять
- [ ] На 7-й день: сгенерировать семена по последовательности простых чисел (3, 7, 11, ...)

---

### Фаза 3 — Frontend (Telegram Mini App)

Экраны:

- [ ] **Home** — цветок юзера: изображение (с B&W фильтром если засох), день роста, FD баланс, кнопка "Полить"
- [ ] **Flower detail** — полная карточка цветка (рост по дням, анимация если gif)
- [ ] **Leaderboard** — список юзеров, отсортированных по FD
- [ ] **Profile** — аватар, имя, баланс FD, коллекция семян, гербарий (засохшие цветки)
- [ ] **Social** — запросить полив, поделиться семенами
- [ ] **Export** — скачать PNG цветка

UI детали:

- [ ] Засохший цветок: CSS фильтр `grayscale(100%)` + лейбл "засох"
- [ ] Семена: иконка мешочка с эмблемой цветка
- [ ] Кнопка полива недоступна если уже поливал сегодня (серая)

---

### Фаза 4 — Telegram Bot

- [ ] Создать бота в BotFather, получить токен
- [ ] Зарегистрировать Mini App (`/newapp` в BotFather)
- [ ] Настроить команду `/start` — открывает мини-апп
- [ ] Уведомления (опционально): "Не забудь полить цветок!" (раз в день)

---

### Фаза 5 — Деплой на VPS

- [ ] Настроить nginx как reverse proxy (client → static, server → :3000)
- [ ] SSL через Let's Encrypt (certbot)
- [ ] Запуск сервера через pm2
- [ ] Build клиента (`vite build`) → статика через nginx
- [ ] Cron job для ежедневной игровой логики (systemd timer или node-cron внутри сервера)
- [ ] Переменные окружения в `/etc/environment` или `.env` на сервере

---

## Порядок разработки

1. Фаза 0 (инициализация проекта)
2. Фаза 1 (БД + миграции)
3. Фаза 2 (API)
4. Фаза 3 (Frontend)
5. Фаза 4 (Bot + интеграция)
6. Фаза 5 (Деплой)

---

## Заметки

- Цветок — один на сезон. Все юзеры растят один и тот же базовый цветок (разные экземпляры).
- `fd_balance` — суммарный накопленный баланс юзера.
- Художник цветка = создатель текущего сезонного цветка (пока это мы сами).
- `waterings` содержит `watered_at` с датой (без времени) для проверки "уже поливал сегодня".
