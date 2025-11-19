# Madam COCO AI Platform

Моно-репозиторий на Nx 22 c Angular 20 (админка) и NestJS 11 (backend) для построения AI-бота с глубокими интеграциями в CRM.

## Стек

- Node.js 22 + pnpm 10
- Nx 22 (package-based workspace)
- Angular 20 + Playwright + Jest
- NestJS 11 + Webpack + Jest
- PostgreSQL 16 + pgvector, Redis 7 (docker-compose)

## Предварительные требования

- Node.js ≥ 20.11 (LTS) + pnpm `npm install -g pnpm`
- Docker Desktop / Docker Compose v2
- Git + VS Code (рекомендуется Nx Console extension)

## Быстрый старт

```bash
git clone https://github.com/NikolayTrofimenko/llm-studio.git
cd llm-studio
pnpm install
cp .env.example .env        # при необходимости заполнить секреты
docker compose up -d        # поднимаем Postgres + Redis
pnpm dev                    # параллельный запуск api + admin
```

### Отдельные команды

| Цель       | Команда            |
| ---------- | ------------------ |
| Admin dev  | `pnpm start:admin` |
| API dev    | `pnpm start:api`   |
| Lint       | `pnpm lint`        |
| Unit tests | `pnpm test`        |
| E2E admin  | `pnpm e2e:admin`   |
| E2E api    | `pnpm e2e:api`     |

## Структура

- `admin` – Angular 18/20 приложение (SCSS, esbuild, Playwright)
- `api` – NestJS приложение с Jest и ESLint
- `admin-e2e`, `api-e2e` – отдельные e2e-пакеты
- `packages/*` – место под общие библиотеки (data-access, domain, ui)
- `docker/` – инфраструктурные скрипты (init для pgvector и т.д.)

## Окружение и переменные

Все переменные описаны в `.env.example`:

- `DATABASE_URL`, `DATABASE_USER/PASSWORD/NAME`
- `REDIS_HOST/PORT/PASSWORD`
- `OPENAI_API_KEY`, `VITE_API_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`

Файлы `.env*` занесены в `.gitignore`. Для локальной разработки достаточно скопировать `.env.example` → `.env` и при необходимости переопределить значения.

## Docker Compose

Файл `docker-compose.yml` поднимает Postgres 16 с расширениями `vector` и `pg_trgm`, а также Redis 7:

```bash
docker compose up -d
docker compose logs -f postgres
```

Инициализация расширений лежит в `docker/postgres/init/01_extensions.sql`.

## Проверка качества

```bash
pnpm lint                  # eslint всех пакетов
pnpm test                  # jest admin + api
pnpm nx graph              # визуализация зависимостей
```

## Дальнейшие шаги

- См. `madam-coco-plan.md` для дорожной карты (интеграции с CRM, настройка LLM-агента, админка).
- Добавить Domain/Shared библиотеки в `packages/`.
- Подготовить CI (GitHub Actions) для lint/test/build и публикации контейнеров.
