# Happy Harvest Reborn

Современная реализация классической игры Happy Farmer в виде Telegram Mini App. Проект использует монорепозиторий для управления frontend и backend частями игры.

## 🌱 Что такое Happy Harvest Reborn?

Happy Harvest Reborn - это фермерская игра для Telegram, где пользователи могут:
- Выращивать различные сельскохозяйственные культуры
- Разводить животных для получения ресурсов
- Строить здания и фабрики
- Посещать сады друзей и помогать им
- Соревноваться в рейтинге лучших фермеров

## 🛠️ Технологии

### Frontend
- React 18 + TypeScript
- Vite для быстрой сборки
- Zustand для управления состоянием
- PixiJS для рендеринга изометрической графики
- Telegram Web App SDK для интеграции с Telegram

### Backend
- Node.js 18
- NestJS для создания API
- PostgreSQL с TypeORM для управления базой данных
- Redis для функциональности pub/sub
- Socket.IO для обновлений в реальном времени

### Инфраструктура
- Docker Compose для оркестрации контейнеров
- Nginx для раздачи статических файлов и обработки SSL

## 📁 Структура проекта

Проект организован как монорепозиторий с использованием workspaces:

```
happyFermer/
├── apps/                 # Приложения
│   ├── api/              # Backend API (NestJS)
│   └── web/              # Frontend (React + Vite)
├── packages/             # Общие пакеты
│   ├── db/               # Модели и миграции базы данных
│   ├── game-logic/       # Игровая логика
│   └── shared-types/     # Типы и схемы, общие для frontend и backend
├── content/              # Контент игры (JSON файлы)
└── docker-compose.yml    # Конфигурация Docker Compose
```

## 🚀 Запуск проекта

### Необходимые зависимости
- Node.js 18+
- pnpm
- Docker и Docker Compose

### Настройка и установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/happyFermer.git
cd happyFermer
```

2. Установите pnpm (если не установлен):
```bash
npm install -g pnpm
```

3. Установите зависимости:
```bash
pnpm install
```

4. Создайте файл .env в корне проекта:
```
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=happy_harvest
REDIS_HOST=redis
REDIS_PORT=6379
TG_BOT_TOKEN=your_telegram_bot_token
TG_APP_NAME=your_telegram_app_name
STAR_API_KEY=your_star_api_key
```

### Запуск локально

1. Запустите Docker контейнеры:
```bash
docker-compose up -d postgres redis
```

2. Запустите API:
```bash
pnpm --filter api dev
```

3. Запустите веб-приложение:
```bash
pnpm --filter web dev
```

4. Откройте в браузере http://localhost:5173

### Запуск в Docker

```bash
docker-compose up -d
```

## 📝 Примечания по разработке

### Доступ к API
- API доступен по адресу: http://localhost:3000
- Веб-приложение доступно по адресу: http://localhost:5173

### Работа с Telegram Mini App
1. Зарегистрируйте бота у @BotFather в Telegram
2. Получите токен бота и настройте webhooks
3. Создайте Mini App через @BotFather
4. Укажите URL вашего развернутого приложения

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности смотрите в файле LICENSE.
