# Финальный отчёт о проверках и готовности к релизу (`QA_FINAL_REPORT.md`)

**Проект:** «Я здесь» — магазин цифровых книг-подарков  
**Дата:** 26 октября 2026 года  
**Статус релиза:** **GO** (для локального/staging релиза и тестового контура; перед включением боевых списаний ЮKassa требуется заполнение боевых ключей `.env` и реквизитов юрлица в оферте).

---

## 1. Что было сломано (Главные дефекты и Root Cause)

1. **Шапка и навигация (`P0`):**
   - Блок навигации `<nav>` и блок кнопок («Кабинет», «Создать книгу») находились внутри одного правого flex-контейнера без `whitespace-nowrap`, из-за чего пункты «Как это работает» и «Примеры книг» переносились в 2 строки (`h: 63px`), высота шапки раздувалась до `131px`, а ссылки вплотную прижимались к кнопкам.
   - На `1024×768` (iPad landscape) отображалось полное горизонтальное меню (`lg:flex`), которое не помещалось в одну строку.
   - Мобильное меню (`drawer`) не имело `role="dialog"`, `aria-modal="true"`, не блокировало прокрутку `body`, не обрабатывало `Escape` / клик вне меню и не удерживало фокус.
   - На сверхмалом экране `320×568` шапка давала горизонтальный overflow в `6px` (`scrollWidth: 326px`).
2. **Карточки каталога и оверлеи на фото (`P0`):**
   - Смешение широких (`featured`) и вертикальных карточек нарушало ритм каталога; плавающие `position: absolute` мини-обложки поверх фотографий закрывали нижнюю часть снимков.
   - В секции «Самые дорогие моменты» использовалась неравная сетка `5+4+3` с мелким белым текстом поверх фото и ленивой загрузкой.
3. **Мобильный первый экран и прайс (`P0/P1`):**
   - Под кнопками Hero на мобильном сжимались 3 узкие микроколонки преимуществ, а в шапке `HeroBook` обрезалась строка `"Издание «Наша история» · Вымышленн..."`.
   - Таблица стоимости `min-w-[640px]` требовала горизонтального скролла на телефонах и планшетах.
4. **Якорная прокрутка и внутренние страницы (`P1/P2`):**
   - При переходе по якорям `#how`, `#pricing`, `#faq` sticky-шапка перекрывала заголовки секций (отсутствовал `scroll-margin-top`).
   - Часть вторичных кнопок имела высоту `38px` (`<44px`), а внутренние страницы использовали разнородные контейнеры.

---

## 2. Что исправлено (Конкретные файлы и компоненты)

- **`src/components/site-nav.tsx` и `src/components/site-layout.tsx`:**
  - Шапка перестроена в 3-зонную композицию `brand | navigation | actions` (`xl:grid-cols-[auto_1fr_auto] items-center`).
  - Демо-бар вынесен над `sticky`-шапкой; высота самого sticky-header составляет **`81px` на desktop (`1440px`)** и **`69px` на tablet/mobile (`1024px`, `768px`, `390px`)**.
  - Все ссылки и кнопки шапки строго однострочные (`whitespace-nowrap`), имеют высоту ровно **`44px`**, симметричные отступы **`74px`** между логотипом, центральным меню и правыми кнопками на `1440px`, и `0` пересечений (`overlaps: 0`).
  - На `≤1024px` включён `compact nav` с доступным drawer-меню (`role="dialog"`, `aria-modal="true"`, `Escape`, `outside click`, `scroll lock`, `focus trap` и возврат фокуса).
  - Устранён горизонтальный overflow на `320×568` (`scrollWidth === 320`).
- **`src/app/globals.css`:**
  - Введён единый дизайн-контейнер `.layout-container` (`max-width: 1240px`, адаптивные поля `20px / 32px / 48px`).
  - Добавлены `html { scroll-padding-top: 92px; }` и `[id] { scroll-margin-top: 92px; }`.
  - Вместо `overflow-x: hidden` применён `overflow-x: clip`.
- **`src/components/hero-book.tsx` и `src/components/product-card.tsx`:**
  - Убраны плавающие поверх фотографий мини-обложки и мелкие оверлеи; титулы и описания вынесены на светлые бумажные блоки под фотографиями.
  - Каталог выстроен в стройную сетку `2×2` карточек одинаковой высоты и структуры на `≥1024px` и `1` просторную колонку на `<1024px`.
- **`src/app/page.tsx`, `src/app/catalog/page.tsx`, `src/app/gifts/[slug]/page.tsx`, `src/components/cinematic-demo.tsx`:**
  - Выровнены все секции главной страницы, перестроена фотогалерея (3 равные карточки с `loading="eager"`), таблица цен заменена на 4 крупные адаптивные карточки `PRICING_ITEMS`, укрупнён `Accordion` FAQ (`src/components/ui/accordion.tsx`).
- **`src/components/ui/button.tsx`, `src/app/orders/[orderId]/result/page.tsx`, `src/app/support/page.tsx`, `src/app/legal/*/page.tsx`, `src/app/account/page.tsx`, `src/components/editor-wizard.tsx`, `src/app/not-found.tsx`:**
  - Все кнопки приведены к минимальной высоте `≥44px`, внутренние страницы переведены на `.layout-container`, добавлена фирменная страница `404`.

---

## 3. Визуальное сравнение (Пути к скриншотам До и После)

| Разрешение | Скриншоты «До» (Baseline) | Скриншоты «После» (Final) |
|---|---|---|
| **Desktop `1440×900`** | `/opt/cursor/artifacts/screenshots/final_before/desktop_1440x900_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_before/desktop_1440x900_full.png` | `/opt/cursor/artifacts/screenshots/final_after/desktop_1440x900_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_after/desktop_1440x900_full.png` |
| **iPad landscape `1024×768`** | `/opt/cursor/artifacts/screenshots/final_before/ipad_landscape_1024x768_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_before/ipad_landscape_1024x768_full.png` | `/opt/cursor/artifacts/screenshots/final_after/ipad_landscape_1024x768_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_after/ipad_landscape_1024x768_full.png` |
| **iPad portrait `768×1024`** | `/opt/cursor/artifacts/screenshots/final_before/ipad_portrait_768x1024_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_before/ipad_portrait_768x1024_full.png` | `/opt/cursor/artifacts/screenshots/final_after/ipad_portrait_768x1024_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_after/ipad_portrait_768x1024_full.png` |
| **iPhone `390×844`** | `/opt/cursor/artifacts/screenshots/final_before/iphone_390x844_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_before/iphone_390x844_full.png` | `/opt/cursor/artifacts/screenshots/final_after/iphone_390x844_viewport.png` <br> `/opt/cursor/artifacts/screenshots/final_after/iphone_390x844_full.png` |

---

## 4. Выполненные проверки и фактические результаты команд

1. **Автоматические тесты (`npm test` — Vitest):**
   - `Test Files: 3 passed (3)` (`tests/core-lifecycle.test.ts`, `tests/security-and-edge-cases.test.ts`, `tests/full-site-e2e.test.ts`)
   - `Tests: 14 passed (14)` — проверены все 4 независимых E2E сценария (`love-story` 4 990 ₽, `mother-thanks` 5 990 ₽, `your-day` 5 990 ₽, `first-year` 4 990 ₽ + ручное продление 990 ₽/год), идемпотентность вебхуков, защита от подмены цены и IDOR, валидация и оптимизация фото, PIN-код, экспорт и удаление данных, наличие всех 25 `.webp` ассетов.
2. **Линтер (`npm run lint` — ESLint):**
   - `0 errors, 0 warnings`.
3. **Production-сборка и типизация (`npm run build` — Next.js 16.4.3):**
   - Все 30 маршрутов успешно скомпилированы без ошибок TypeScript.
4. **Playwright геометрический, маршрутный и a11y аудит (`tests/visual.spec.ts`, `tests/smoke.spec.ts`):**
   - Проверены все 22 маршрута (`HTTP 200`, `CONSOLE_ERRORS_TOTAL: 0`).
   - Проверена матрица 10 разрешений (`320×568`, `360×800`, `375×812`, `390×844`, `428×926`, `768×1024`, `1024×768`, `1280×800`, `1440×900`, `1920×1080`): `horizontalOverflow: false` на всех 10 разрешениях.
   - Проверена доступность мобильного drawer-меню: `{"isOpen":true,"bodyOverflowLocked":true,"isClosedAfterEsc":true,"focusReturned":true}`.

---

## 5. Остаточные риски и внешние зависимости для боевого запуска

- **Внешние боевые ключи:** в локальной среде активен безопасный `DEMO_MODE`. Для приёма реальных платежей и отправки писем в production необходимо задать `DEMO_MODE=false`, `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `YOOKASSA_WEBHOOK_SECRET`, `SMTP_*` и `S3_*` согласно `.env.example` и `README.md`.
- **Юридические тексты:** страницы `/legal/offer`, `/legal/privacy`, `/legal/terms` содержат подготовленные проекты документов и требуют подстановки фактических реквизитов юрлица/ИП перед коммерческим открытием.
- **Кроссбраузерное окружение:** в контейнерной Linux-среде установлен `Google Chrome` (`/usr/local/bin/google-chrome`), на котором выполнены все автоматизированные проверки `playwright-core`. Нативные бинарники Safari/WebKit и Firefox в данном контейнере не предустановлены; для Safari iOS учтены `overflow-x: clip` (не ломающий `position: sticky`) и безопасные размеры тап-зон `≥44px`.
