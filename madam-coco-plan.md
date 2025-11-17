# Madam COCO AI Assistant – Implementation Plan

## 0. Цели и критерии успеха
- Автоматизировать запись/перенос/отмену, FAQ, рекламации и эскалации во всех целевых каналах (Telegram, WhatsApp Business, виджет сайта/Яндекс/2ГИС).
- Обеспечить единый “мозг” (LLM-агент) с фирменным тоном, опорой на регламенты и интеграцией в CRM (Sonline/Битрикс).
- Сократить нагрузку на администраторов ≥40 %, увеличить скорость ответа ≤10 сек, обеспечить сбор структурированных данных по рекламациям.
- Подготовить архитектуру, которую можно эволюционировать от «быстрого старта» к «правильному» и далее к полностью автономному агенту.

## 1. Архитектура (целевое состояние уровня 2→3)
- **Каналы**: Telegram Bot API, WhatsApp Business (через провайдера), web/виджет (Angular), внешние каталоги (Яндекс/2ГИС).
- **Оркестрация**: backend на NestJS (Nx workspace) + Redis/BullMQ для задач, PostgreSQL для персистентных данных (профили гостей, кэш расписаний, лог диалогов).
- **LLM-слой**: OpenAI GPT-4.1 (или совместимая модель) через API, с инструкцией, retrieval из векторного стора (pgvector/Redis), безопасные тулы (CRM, FAQ, расписание).
- **CRM-интеграция**: обёртка над API Sonline/Битрикс (REST/webhook), сервисы: гостевой профиль, расписание, записи, рекламации.
- **Интеграционный слой**: webhooks от каналов → Channel Ingress → Intent Router → CRM/FAQ/Complaints flows → Response Formatter.
- **Админ-инструменты**: Angular (Nx) админка для контента FAQ, мониторинга диалогов, ручной эскалации.
- ** observability**: OpenTelemetry → Grafana/Prometheus, централизованные логи (ELK/CloudWatch). 

## 2. План работ по фазам

### Фаза A — Discovery & инфраструктура (неделя 1)
1. Подтвердить каналы запуска (Telegram, WhatsApp, web) и CRM (Sonline/Битрикс), собрать документацию API.
2. Выбрать провайдера WhatsApp Business (360dialog, WABA официальный и т.п.), проверить тарифы и SLA.
3. Создать репозиторий, настроить Nx workspace:
   - `apps/backend` (NestJS), `apps/admin` (Angular), `libs/shared/*`.
   - Настроить Docker Compose (Postgres, Redis, pgvector, webhook tunnel для локалки).
4. Описать .env, секреты (Vault/Azure Key Vault), CI/CD скелет (GitHub Actions/ADO).
5. Draft документа «Правила общения, политика гарантий, скрипты» (вместе с бизнесом) — нужен для prompt.

### Фаза B — Конверсационный дизайн и знания (недели 1–2)
1. Детализировать сценарии:
   - Запись / перенос / отмена (варианты с «после 18:00», «любой день вечером», «на имя…»).
   - FAQ (услуги, цены, адреса, как добраться, парковка, длительность, материалы).
   - Рекламации: сбор полей (филиал, дата, мастер, услуга, описание, фото, желаемый исход).
   - «Связаться с администратором», «как в прошлый раз».
2. Подготовить knowledge base:
   - FAQ + регламенты → markdown/JSON → загрузить в векторное хранилище (embedding).
   - Мапа услуг/кодовых названий → для CRM API.
3. Прописать бренд-тон (мы/я, эмодзи, upsell правила) → часть системного промпта.
4. Определить границы ответственности ИИ: какие процедуры требует валидации, когда эскалация обязательна.

### Фаза C — Backend & CRM интеграции (недели 2–3)
1. Реализовать NestJS модули:
   - `ChannelsModule` (webhooks/long polling adapters).
   - `CRMModule` (Sonline/Битрикс SDK + DTO + rate limiting + retries).
   - `SchedulingModule` (доступ к слотам, кэш в Redis, BullMQ jobs для обновления расписания).
   - `ConversationsModule` (state machine, storing context в Postgres).
2. Имплементировать базу данных:
   - Таблицы гостей, обращений, записей, audit, complaint tickets.
   - pgvector таблица для FAQ (если остаётся в PostgreSQL).
3. Покрыть интеграции контрактными тестами (Pact/Prism mocks), подготовить локальные фейковые адаптеры CRM.
4. Настроить BullMQ очереди: обновление расписаний, эскалации, напоминания, ретраи запросов.

### Фаза D — LLM-оркестрация и агент (недели 3–4)
1. Определить схема сообщений:
   - System prompt с правилами (тон, политики, запрещённые действия).
   - Tool definitions для CRM-операций, FAQ retrieval, complaint intake.
   - Memory handling (фресс контекст + long-term store в БД).
2. Реализовать Intent Router:
   - Первичный классификатор (LLM few-shot или лёгкая модель на OpenAI text-embedding + cosine).
   - Маппинг на сценарии: `booking`, `reschedule`, `cancel`, `faq`, `complaint`, `handover`.
3. Реализовать tool calling:
   - `get_available_slots(filial, service, from, to)`
   - `create_booking`, `update_booking`, `cancel_booking`
   - `fetch_last_service(customer_id)` для «как в прошлый раз».
   - `create_complaint_ticket`.
4. Настроить Guardrails:
   - ограничение токенов, profanity/abuse фильтры, проверка «опасных процедур» → правило “перевести на администратора”.
5. Протестировать сценарии в автономном режиме (unit + integration).

### Фаза E — Каналы и UI (недели 3–4)
1. Telegram:
   - Создать BotFather креды, webhook endpoint, обработчики команд (`/start`, `/help`), хранение consent.
2. WhatsApp Business:
   - Интеграция с выбранным провайдером (регистрация шаблонов, верификация номера).
   - Поддержка сессионных сообщений, реакции на медиавложения (фото для рекламаций).
3. Web/виджет:
   - Мини-виджет на Angular (standalone bundle) + чат API.
   - Интеграция с сайтами/Яндекс/2ГИС (если требуется — предоставить JS snippet).
4. Admin UI:
   - Dashboard: live диалоги, возможность take-over, статусы, ручные записи.
   - Контент-менеджмент: FAQ статьи, тарифы, блоки промо.

### Фаза F — QA, мониторинг и запуск (недели 4–5)
1. Тесты:
   - E2E сценарии (Playwright для web, Bot API mocks для Telegram/WhatsApp).
   - Нагрузочные тесты очередей и CRM API.
2. Набор метрик:
   - SLA ответа, доля автозавершённых диалогов, конверсия в запись, NPS по рекламациям.
3. Аллерты/observability: Sentry + Prometheus/Grafana + логирование диалогов с redaction PII.
4. Постепенный rollout:
   - Пилот на одном филиале/канале → сбор обратной связи → включение остальных.
5. Документация & handover: инструкции для админов, чек-листы эскалации, плейбуки L1 поддержки.

## 3. Технические решения и бэклог
- **Nx Monorepo**: единый линтинг (ESLint), форматирование (Prettier), Jest + Vitest, target pipelines.
- **Backend**: NestJS, GraphQL/REST (для виджета), Swagger для API, Zod/DTO для валидации.
- **Data**: PostgreSQL + Prisma/TypeORM, Redis (cache + BullMQ), pgvector или Redis Vector.
- **AI**: OpenAI GPT-4.1, fallback mini-model (GPT-4o-mini/Claude), embeddings `text-embedding-3-large`.
- **DevOps**: Docker Compose (dev), Kubernetes/Container Apps (prod), GitHub Actions CI, IaC (Terraform/Bicep) для облака.
- **Security**: OAuth 2.0 for admin, service accounts для CRM, Vault для секретов, PII mask в логах.
- **Analytics**: Event pipeline (Segment/Amplitude) + собственные отчёты в Postgres (metabase).

## 4. Настройка и обучение агента
1. Собрать документ “Инструкция Madam COCO” (тон, допродажи, запреты).
2. Создать knowledge packs: услуги, цены, гарантии, FAQ → загрузить в векторное хранилище.
3. Подготовить шаблоны prompts:
   - System prompt (правила).
   - Few-shot примеры для каждого интента.
   - Tool-call инструкции.
4. Настроить continuous learning:
   - Логирование диалогов → ручная разметка → fine-tune (при необходимости) или обновление примеров.
5. Проработать рекламационные сценарии:
   - Сбор фактуры (филиал, дата, мастер, фото).
   - Авто-предложение решения по SLA.
   - Эскалация: создание задачи ст. админу + уведомление в рабочем чате (Slack/Telegram).

## 5. Переходные уровни реализации
- **Уровень 1 (быстрый старт)**: Botmother/BotHelp + webhook в CRM. Использовать как fallback/канал для теста. Сконфигурировать дерево диалогов, подключить FAQ через no-code.
- **Уровень 2 (целевой)**: текущий план — собственный backend + LLM. Стартовать с Telegram + CRM интеграцией, затем WhatsApp и web.
- **Уровень 3 (агент)**: добавить автопредложение решений по рекламациям, ML-набор для прогнозов no-show, self-learning через разметку историй.

## 6. Немедленные действия (на завтра)
1. **Каналы & CRM**: подтвердить порядок запуска (Telegram/WhatsApp/web), собрать API-доступы CRM, выбрать WA провайдера.
2. **ТЗ**: оформить документ со сценариями, правилами, голосом бренда, ограничениями (на базе секций выше).
3. **Техличка**: инициализировать репозиторий + Nx workspace, настроить Docker Compose (Postgres, Redis, pgvector), базовый NestJS skeleton, зафиксировать .env.sample.
4. Подготовить черновик системного промпта и списка инструментов для LLM, определить формат хранения FAQ/регламентов.

Документ служит живым планом: обновляй по мере решений, добавляй конкретные задачи/issue в трекер (Jira/Linear). После выполнения Фазы A–C можно детализировать backlog до user stories с оценками.

