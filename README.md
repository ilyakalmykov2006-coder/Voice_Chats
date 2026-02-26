# Voice Chats — план реализации Windows-мессенджера (уникальный UI, без Discord-брендинга)

## 1) Выбранный стек и версии

### Клиент (Windows .exe)
- **Electron 30.x**
- **React 18.3.x**
- **TypeScript 5.6.x**
- **Vite 5.x** (рендерер)
- **electron-builder 24.x** (упаковка `.exe`)
- **Socket.IO client 4.8.x**
- **WebRTC (через browser APIs + mediasoup-client 3.x)**

### Backend / Signaling / API
- **Node.js 22 LTS**
- **Express 4.19.x**
- **Socket.IO 4.8.x**
- **TypeORM 0.3.x** (или Prisma 5.x; по умолчанию TypeORM)
- **mssql 10.x** (драйвер для MS SQL Server 2019)
- **argon2 0.41.x** (хеширование паролей)
- **jsonwebtoken 9.x** (JWT access + refresh)
- **zod 3.23.x** (валидация входных данных)
- **helmet 7.x**, **cors 2.8.x**, **express-rate-limit 7.x**

### Медиа / NAT traversal
- **mediasoup 3.14.x** + **mediasoup-client 3.7.x** (SFU)
- **coturn 4.6.x** (обязательно)
- **STUN/TURN**: `3478` (udp/tcp), `5349` (tls)

### Инфраструктура
- **nginx 1.27.x** (reverse proxy HTTPS/WSS)
- **Docker / docker-compose v2** для тестовой среды
- **MS SQL Server 2019** (у заказчика локально)

> Альтернатива (опционально): `.NET 8 + SignalR + EF Core` вместо Node.js, но в данном плане выбран Node.js стек как основной.

---

## 2) Архитектура (высокоуровнево)

### Компоненты
1. **Desktop client (.exe)**
   - UI: сервера/каналы/DM/друзья/настройки.
   - Реалтайм события: presence, typing, message, call signaling.
   - WebRTC publish/subscribe в голосовых каналах через SFU.
   - Screen share (один publisher, много viewers).

2. **Backend API + Signaling**
   - REST: auth, users, friends, servers, channels, messages, files.
   - Socket.IO: presence, typing, realtime updates, call control.
   - Генерация short-lived TURN credentials.
   - Работа с MS SQL (только backend, клиент напрямую к БД не ходит).

3. **SFU (mediasoup)**
   - Групповой голос и screen share.
   - Масштабирование по worker’ам/router’ам.

4. **coturn**
   - Relay для пользователей за NAT/CGNAT.

5. **Nginx (TLS termination)**
   - HTTPS + WSS на 443.
   - Проксирование API/Socket.IO.

### Топология сетевых портов
- `443/tcp`: nginx (HTTPS/WSS)
- `3478/udp,tcp`: coturn
- `5349/tcp`: coturn TLS
- `40000-40100/udp`: RTP диапазон mediasoup (пример для MVP/V1)

---

## 3) Конфигурация клиента (без пересборки)

Клиент читает `config.json` рядом с `.exe` (или `%AppData%/VoiceChats/config.json`):

```json
{
  "apiBaseUrl": "https://chat.example.com/api",
  "wsBaseUrl": "wss://chat.example.com/socket.io",
  "rtc": {
    "iceServersMode": "backend",
    "fallbackIceServers": [
      { "urls": ["stun:stun.l.google.com:19302"] }
    ]
  },
  "sfu": {
    "mode": "mediasoup",
    "announcedIp": "auto"
  }
}
```

- `iceServersMode=backend`: клиент запрашивает ICE/TURN у backend после авторизации.
- Можно «вшить» адреса signaling/SFU/TURN или получать дефолт с backend.

---

## 4) План работ по этапам

## MVP (база, 20–28 чел.дней)
**Цель:** рабочий вертикальный срез: auth + текст + друзья + базовый голос.

Включено:
- Регистрация/логин, e-mail validation, argon2.
- JWT access/refresh + refresh flow.
- Серверы, текстовые/голосовые каналы.
- Публичные текстовые сообщения (сохранение в MS SQL + realtime).
- Друзья: запрос/подтверждение/удаление/блокировка.
- DM только между друзьями (hard business rule).
- Presence + typing + notifications по Socket.IO.
- Голосовые комнаты через mediasoup (минимум 3–8 участников).
- Базовый Docker Compose (node + mediasoup + coturn + nginx).

Артефакты MVP:
- Исходники client/server.
- SQL schema + seed.
- README по локальному запуску.
- Базовые unit/integration тесты.

## V1 (production-ready core, +18–25 чел.дней)
**Цель:** довести до целевых требований эксплуатации.

Включено:
- Screen share (1 publisher / n viewers).
- Файлы и аватары (локальное FS или S3-compatible MinIO).
- Редактирование/удаление сообщений, реакции.
- Улучшенная модерация серверов/каналов (роли, права базового уровня).
- TURN short-lived creds через backend.
- Rate limiting, hardening security headers, audit logs.
- electron-builder сборки `.exe` (unsigned/signed process docs).
- Полный Docker-compose + non-Docker гайд для Windows + MS SQL.

Артефакты V1:
- Готовый `.exe` build.
- Swagger/OpenAPI + WebSocket event spec.
- Плейбук развертывания VPS/домашний ПК.
- Расширенный test plan + acceptance scripts.

## V2 (масштабирование и удобство, +15–22 чел.дней)
**Цель:** стабильность и операционная зрелость.

Включено:
- CI/CD (build .exe, backend deploy, медиасервисы).
- Observability: метрики/логи/алерты mediasoup + backend.
- Оптимизация качества голоса под разные сети.
- Поиск по сообщениям, улучшенный UX, retry/failover сценарии.
- Подготовка к multi-node SFU (по необходимости).

Артефакты V2:
- CI pipeline + release notes шаблон.
- Набор dashboard/алертов.
- Нагрузочный отчет (8–12 участников / канал).

---

## 5) Оценка трудозатрат (чел.дни)

- **MVP:** 20–28
- **V1:** 18–25
- **V2:** 15–22
- **Итого:** 53–75 чел.дней (в зависимости от UX-сложности, количества экранов и глубины QA).

Команда (рекомендовано):
- 1 Fullstack (Node + React/Electron)
- 1 RTC/Media инженер (part-time)
- 1 QA (part-time)
- 1 DevOps (part-time)

---

## 6) Риски и меры снижения

1. **NAT/CGNAT и нестабильные сети**
   - Риск: невозможность прямого P2P/packet loss.
   - Мера: coturn relay, приоритет TURN/TLS fallback, мониторинг ICE state.

2. **Upload bandwidth при screen share**
   - Риск: артефакты/лаги у отправителя.
   - Мера: adaptive bitrate, ограничение FPS/разрешения, simulcast/SVC где применимо.

3. **Windows SmartScreen для unsigned .exe**
   - Риск: предупреждения при запуске.
   - Мера: документировать обход для тестов + code-signing сертификат для prod.

4. **Нагрузка на один VPS**
   - Риск: деградация при пиках.
   - Мера: вынести SFU на отдельную ноду, увеличить RTP диапазон/worker count.

---

## 7) Безопасность (обязательные меры)

- Пароли только `argon2id` хеши, соль автоматически.
- Access token короткоживущий (например, 15 мин), refresh — ротация.
- HTTPS/WSS only (TLS сертификаты, Let's Encrypt).
- SQL injection: ORM/параметризованные запросы.
- XSS: sanitize + escaping в UI.
- CSRF: sameSite cookies (если cookie flow) + anti-CSRF token при необходимости.
- Brute-force: rate-limiting + lockout/backoff на auth endpoints.
- Секреты (JWT/TURN static auth secret, DB creds) только через env vars/secret store.

---

## 8) БД MS SQL Server 2019

### Обязательные сущности
- `Users`
- `Friends`
- `Servers`
- `Channels`
- `ServerMemberships`
- `Messages`
- `Attachments`

### Пример connection string (README-обязательство)

```text
Server=localhost,1433;Database=YourDB;User Id=sa;Password=yourStrong(!)Password;
```

### Пример безопасного параметризованного запроса (Node mssql)

```ts
const result = await pool
  .request()
  .input('email', sql.NVarChar(255), email)
  .query('SELECT TOP 1 * FROM Users WHERE Email = @email');
```

---

## 9) Docker-compose (тестовая среда)

Сервисы в compose:
- `nginx` (443)
- `node-app` (API + Socket.IO + signaling)
- `mediasoup` (в составе node-app или отдельный сервис)
- `coturn`

Примерная схема:
1. Клиент -> `https://domain` (nginx)
2. nginx -> node-app (`/api`, `/socket.io`)
3. node-app -> MS SQL
4. WebRTC media -> mediasoup UDP range (`40000-40100`)
5. ICE relay -> coturn `3478/5349`

---

## 10) Non-Docker развёртывание (Windows + MS SQL)

1. Установить Node.js 22 LTS.
2. Поднять MS SQL Server 2019, создать БД через SQL scripts.
3. Настроить `.env` backend (DB, JWT, TURN secret, домен).
4. Установить и настроить coturn (realm, static-auth-secret, tls cert).
5. Установить nginx и TLS (Let's Encrypt или корпоративный сертификат).
6. Запустить backend (pm2 / nssm service).
7. Собрать и выдать клиент `.exe` (electron-builder).
8. Проверить health-check и тестовые сценарии.

---

## 11) API и WebSocket документация

### API (OpenAPI/Swagger)
- `/auth/register`, `/auth/login`, `/auth/refresh`
- `/friends/request`, `/friends/accept`, `/friends/block`
- `/servers`, `/channels`, `/messages`
- `/media/turn-credentials`

### WebSocket события (пример)
- `presence:update`
- `typing:start` / `typing:stop`
- `message:new` / `message:edit` / `message:delete`
- `voice:join` / `voice:leave`
- `rtc:transport-create`, `rtc:produce`, `rtc:consume`
- `screen:start` / `screen:stop`

---

## 12) План тестирования

### Unit tests
- auth service (hash/verify, token issuance)
- friends service (DM permission rule)
- message service (edit/delete permissions)

### Integration tests
- REST + DB (register/login/refresh, create server/channel/message)
- Friends flow + DM access control
- TURN creds endpoint auth

### E2E tests
- 3 клиента: регистрация, сервер, канал, одновременные сообщения
- Friends + DM history persistence
- Voice room (3 users), mute/unmute, active speaker
- Screen share one-to-many
- NAT case with TURN relay

---

## 13) Acceptance-сценарии (пошагово)

1. **Регистрация/логин/JWT refresh**
   - Зарегистрировать 3 аккаунта.
   - Выполнить логин каждым.
   - Истечь access token, обновить через refresh.

2. **Сервер/канал/сообщения**
   - Пользователь A создает сервер и текстовый канал.
   - A/B/C входят и отправляют сообщения одновременно.
   - Проверить realtime и наличие записей в MS SQL.

3. **Друзья и DM**
   - A отправляет заявку B.
   - B подтверждает.
   - A<->B обмениваются DM.
   - C (не друг) не может писать DM A.

4. **Голос + screen share**
   - A/B/C подключаются к одному voice channel.
   - Проверка слышимости, mute/unmute, active speaker.
   - A запускает screen share, B/C видят.

5. **NAT/CGNAT**
   - Минимум один клиент за CGNAT.
   - Подтвердить ICE selected candidate = relay и рабочую связь.

6. **.exe запуск**
   - Проверить старт на тестовых Windows-машинах.
   - Для unsigned: documented SmartScreen bypass.
   - Для signed: warning-free запуск.

---

## 14) Code signing .exe (обязательная документация)

1. Получить сертификат (OV/EV Code Signing) у доверенного CA.
2. Экспортировать сертификат в `.pfx`.
3. Настроить `electron-builder`:
   - `CSC_LINK`, `CSC_KEY_PASSWORD` (или certFile/certPassword в CI secrets).
4. Подписать installer и/или portable exe.
5. Проверить подпись `signtool verify /pa yourapp.exe`.
6. Для EV: использовать hardware token/HSM согласно политике CA.

---

## 15) Где хостить SFU/TURN/Signaling

Варианты:
- **VPS (рекомендуется)**: стабильный аптайм, публичный IP, удобный TLS.
- **Домашний ПК (только тест/POC)**: возможно, но сложнее с NAT/портами/доступностью.

Рекомендация: backend + nginx на VPS, coturn на VPS с публичным IP, SFU либо там же (MVP), либо на отдельной VM (V1+).

---

## 16) Список deliverables

Обязательные:
- Полный исходный код (`client/`, `server/`, `infra/`, `db/`, `docs/`).
- Сборка Windows `.exe` (signed/unsigned + инструкция).
- Docker-compose (mediasoup + coturn + nginx + node).
- T-SQL schema + seed scripts.
- API docs (OpenAPI) + WebSocket protocol docs.
- Инструкции TURN/TLS/DDNS/domain.
- План тестирования + acceptance scripts.
- User quickstart (установка .exe, troubleshooting NAT).

Опционально:
- CI/CD pipelines.
- Production monitoring runbook.

---

## 17) Юридические и продуктовые ограничения

- Не использовать логотипы/брендинг/визуальные элементы Discord.
- UI должен быть уникальным (собственный дизайн language).
- E2EE не входит в текущий scope (может быть отдельным модулем/этапом).

