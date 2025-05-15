# Happy Harvest Reborn - Backend API

Серверная часть игры Happy Harvest Reborn, разработанная с использованием NestJS, TypeORM, WebSockets и интеграцией с Telegram API.

## 🛠️ Технологии

- **NestJS** - прогрессивный Node.js фреймворк для создания эффективных и масштабируемых серверных приложений
- **TypeORM** - ORM для работы с базой данных PostgreSQL
- **Socket.IO** - для обновлений и коммуникации в реальном времени
- **Telegram Bot API** - для интеграции с Telegram и авторизации пользователей
- **tRPC** - для типобезопасного API между клиентом и сервером
- **Redis** - для кеширования и pub/sub функциональности

## 📁 Структура проекта

```
api/
├── src/                   # Исходный код
│   ├── admin/             # Модуль администрирования
│   ├── animal/            # Управление животными
│   ├── auth/              # Аутентификация и авторизация
│   ├── building/          # Управление зданиями и фабриками
│   ├── garden/            # Управление садами
│   ├── plot/              # Управление грядками и растениями
│   ├── star/              # Управление звездами (премиум валюта)
│   ├── telegram/          # Интеграция с Telegram
│   ├── tree/              # Управление деревьями
│   ├── trpc/              # Настройка tRPC сервера
│   ├── websocket/         # WebSocket соединения для обновлений в реальном времени
│   ├── app.controller.ts  # Основной контроллер
│   ├── app.module.ts      # Основной модуль
│   ├── app.service.ts     # Основной сервис
│   └── main.ts            # Точка входа приложения
├── test/                  # Тесты
├── tsconfig.json          # Настройки TypeScript
└── package.json           # Зависимости и скрипты
```

## 🌐 API Endpoints

### Аутентификация
- `POST /auth/login` - Авторизация через Telegram
- `GET /auth/me` - Получение информации о текущем пользователе

### Сады
- `GET /garden` - Получение списка садов пользователя
- `POST /garden` - Создание нового сада
- `GET /garden/:id` - Получение информации о саде
- `POST /garden/:id/join` - Присоединение к саду
- `POST /garden/:id/leave` - Выход из сада

### Грядки
- `POST /plot/plant` - Посадка растения
- `POST /plot/water` - Полив растения
- `POST /plot/harvest` - Сбор урожая
- `POST /plot/steal` - Попытка кражи урожая
- `POST /plot/remove-weed` - Удаление сорняков

### Животные
- `POST /animal/purchase` - Покупка животного
- `POST /animal/feed/:animalId` - Кормление животного
- `GET /animal/garden/:gardenId` - Получение животных в саду
- `POST /animal/move` - Перемещение животного
- `POST /animal/sell/:animalId` - Продажа животного

### Деревья
- `POST /tree/plant` - Посадка дерева
- `POST /tree/harvest/:treeId` - Сбор фруктов с дерева
- `GET /tree/garden/:gardenId` - Получение деревьев в саду
- `POST /tree/remove/:treeId` - Удаление дерева

### Здания
- `POST /building/build` - Строительство здания
- `POST /building/production/start` - Запуск производства
- `POST /building/production/collect/:buildingId` - Сбор продукции
- `GET /building/garden/:gardenId` - Получение зданий в саду
- `POST /building/demolish/:buildingId` - Снос здания

### Звезды (премиум валюта)
- `GET /star/balance` - Получение баланса звезд пользователя
- `POST /star/purchase` - Покупка звезд
- `GET /star/transactions` - История транзакций

### WebSocket События
- `garden-update` - Обновления в саду
- `plot-update` - Обновления грядок
- `theft-attempt` - Попытка кражи урожая
- `level-up` - Повышение уровня
- `garden:message` - Сообщения в чате сада

## 🚀 Запуск проекта

### Локальная разработка

1. Убедитесь, что вы находитесь в корне монорепозитория и установили зависимости:
```bash
pnpm install
```

2. Запустите PostgreSQL и Redis (используя Docker Compose):
```bash
docker-compose up -d postgres redis
```

3. Запустите API:
```bash
pnpm --filter api dev
```

4. API будет доступен по адресу http://localhost:3000

### Сборка для продакшн

1. Выполните сборку проекта:
```bash
pnpm --filter api build
```

2. Для запуска в production режиме:
```bash
pnpm --filter api start:prod
```

## 📦 Миграции базы данных

1. Создание новой миграции:
```bash
pnpm --filter api migration:generate src/migrations/название-миграции
```

2. Запуск миграций:
```bash
pnpm --filter api migration:run
```

3. Откат миграций:
```bash
pnpm --filter api migration:revert
```

## 🔄 Интеграция с Telegram

### Настройка бота
1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Добавьте токен в переменную окружения `TG_BOT_TOKEN`

### Настройка Mini App
1. Используйте @BotFather для создания Web App для вашего бота
2. Укажите URL вашего фронтенд приложения
3. Добавьте название приложения в переменную окружения `TG_APP_NAME`

## 📊 Мониторинг и логирование

- Все API-запросы логируются в консоль
- Доступен эндпоинт `/health` для проверки состояния сервера и базы данных
- WebSocket соединения логируются с указанием пользователя и действий

## 🧪 Тесты

Для запуска тестов:
```bash
pnpm --filter api test
```

Для запуска тестов с покрытием:
```bash
pnpm --filter api test:cov
```
