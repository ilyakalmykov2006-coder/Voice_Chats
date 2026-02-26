# Non-Docker развертывание (Windows + MS SQL Server 2019)

1. Установите:
   - Node.js 22 LTS
   - MS SQL Server 2019 + SSMS
   - nginx for Windows (или Caddy/IIS как reverse-proxy)
   - coturn

2. Подготовьте БД:
   - Выполните `db/001_schema.sql`
   - Выполните `db/002_seed.sql`

3. Настройте backend `.env`:
   - `DB_HOST=localhost`
   - `DB_PORT=1433`
   - `DB_USER=sa`
   - `DB_PASSWORD=yourStrong(!)Password`
   - `DB_NAME=YourDB`
   - `JWT_ACCESS_SECRET=...`
   - `JWT_REFRESH_SECRET=...`
   - `TURN_STATIC_AUTH_SECRET=...`
   - `TURN_REALM=chat.example.com`

4. Настройте coturn:
   - Откройте порты `3478/udp,tcp`, `5349/tcp` и RTP range `40000-40100/udp`.
   - Пример `turnserver.conf`:
     - `use-auth-secret`
     - `static-auth-secret=<TURN_STATIC_AUTH_SECRET>`
     - `realm=chat.example.com`
     - `cert=/path/to/fullchain.pem`
     - `pkey=/path/to/privkey.pem`

5. Настройте TLS:
   - Получите сертификат (Let's Encrypt).
   - Проксируйте `https://chat.example.com` на backend `http://127.0.0.1:3000`.
   - Включите websocket upgrade headers.

6. Запуск backend:
   - `npm ci`
   - `npm run build`
   - `npm run start`

7. Сборка клиента .exe:
   - `npm ci`
   - `npm run build`
   - `npx electron-builder --win nsis`

8. Проверка:
   - Регистрация/логин/refresh.
   - Realtime сообщения.
   - Voice + screen share + TURN fallback.
