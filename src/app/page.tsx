import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { HeroBook } from "@/components/hero-book";
import { ProductCard } from "@/components/product-card";
import { BrandLogo } from "@/components/brand-logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";

const PRICING_ITEMS = [
  {
    slug: "mother-thanks",
    title: "«Мама, спасибо»",
    subtitle: "Книга благодарности маме с семейным фотоархивом и письмом",
    price: "5 990 ₽",
    duration: "12 месяцев доступа по приватной ссылке",
    afterYear:
      "Включено скачивание полного архива книги (тексты и фото). Автосписаний и скрытых платежей нет.",
    badge: "Сезонный выбор ко Дню матери",
    tone: "bg-[#EEF3F6] border-[#C9D8E4]",
  },
  {
    slug: "love-story",
    title: "«Наша история»",
    subtitle: "Романтическое издание для пары: знакомство, свидания, таймлайн и признание",
    price: "4 990 ₽",
    duration: "12 месяцев доступа по приватной ссылке",
    afterYear:
      "Включено скачивание полного архива книги. Продление в текущем выпуске не требуется.",
    badge: "Для пары и годовщины",
    tone: "bg-[#F6ECEA] border-[#E2C8CC]",
  },
  {
    slug: "your-day",
    title: "«Твой день»",
    subtitle: "Персональный праздничный журнал ко дню рождения или юбилею близкого человека",
    price: "5 990 ₽",
    duration: "12 месяцев доступа по приватной ссылке",
    afterYear:
      "Включено скачивание полного архива книги. Без подписок и дополнительных доплат.",
    badge: "День рождения и юбилей",
    tone: "bg-[#F8F1E4] border-[#E2D0B0]",
  },
  {
    slug: "first-year",
    title: "«Мой первый год»",
    subtitle: "Приватная хроника малыша от рождения до 12 месяцев: достижения, слова и фото",
    price: "4 990 ₽",
    duration: "Первые 12 месяцев размещения и обновления",
    afterYear:
      "Добровольное продление со 2-го года — 990 ₽/год отдельным разовым платежом. Без автосписаний.",
    badge: "Продление 990 ₽/год по желанию",
    tone: "bg-[#F3F6F2] border-[#CAD9CE]",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <section className="order-1 bg-[#F7F2E9] px-5 pb-6 pt-4 lg:hidden">
          <p className="mh-title text-[13px] font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
            Когда слова важнее подарка
          </p>
          <h1 className="mh-title mt-2 font-serif text-[28px] leading-[1.12] text-[#1F3042] min-[390px]:text-[32px]">
            Есть истории, которые хочется подарить
          </h1>
          <p className="mh-sub mt-2 text-base leading-snug text-[#2F3E4E]">
            Ваши фотографии, воспоминания и самые тёплые слова — в одной красивой цифровой книге.
          </p>

          <Link
            href="/demo/love-story"
            className="mh-book mt-4 block"
            aria-label="Открыть демонстрационную книгу «Наша история»"
          >
            <span className="relative block">
              <span
                aria-hidden
                className="absolute inset-y-2 left-3 right-1 rounded-r-[24px] border border-[#E4D3C0] bg-[#EFE4D4]"
              />
              <span className="relative block overflow-hidden rounded-[24px] border border-[#D8C9B5] bg-[#FFFDF8] shadow-[0_28px_50px_-30px_rgba(31,48,66,0.55)]">
                <span aria-hidden className="absolute inset-y-0 left-0 z-10 w-3 bg-[#6E2F3B]" />
                <span className="block pl-3">
                  <span className="relative block h-[min(26vh,200px)] w-full overflow-hidden bg-[#EAE0D2]">
                    <Image
                      src="/images/books/love-1-cover.webp"
                      alt="Влюблённая пара на каменном мосту — обложка книги «Наша история»"
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover object-[center_30%]"
                    />
                  </span>
                  <span className="block bg-[#F6ECEA] px-4 py-3">
                    <span className="block text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7A3E4A]">
                      Наша история
                    </span>
                    <span className="mt-0.5 block font-serif text-2xl leading-[1.1] text-[#1F3042]">
                      Анна и Михаил
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </Link>
          <p className="mt-2 text-center text-sm text-[#7A6855]">Нажмите, чтобы открыть книгу</p>

          <Link
            href="/catalog"
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1F3042] px-6 text-base font-medium text-[#F7F2E9] shadow-xs hover:bg-[#162433]"
          >
            Выбрать подарок
          </Link>
          <p className="mt-2 text-center text-sm text-[#3E4C5C]">
            Четыре истории · От 4 990 ₽ · Создаётся онлайн
          </p>
        </section>

        {/* 1. ПЕРВЫЙ ЭКРАН (HERO) — десктоп */}
        <section className="hidden border-b border-[#DFD2C0] bg-gradient-to-b from-[#F7F2E9] via-[#F5EFE3] to-[#EFE7DA] py-7 sm:py-12 lg:block lg:py-20">
          <div className="layout-container grid grid-cols-1 items-center gap-7 sm:gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Левая колонка */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4C5B3] bg-[#FFFDF8] px-4 py-2 text-xs sm:text-sm font-medium text-[#7A3E4A]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Цифровые книги-подарки для самых близких</span>
              </div>

              <h1 className="font-serif text-[38px] leading-[1.08] text-[#1F3042] sm:text-5xl xl:text-[62px]">
                Есть истории, которые хочется подарить
              </h1>

              <p className="max-w-[54ch] text-base sm:text-lg leading-[1.6] text-[#2F3E4E]">
                Превратите ваши фотографии, воспоминания и самые важные слова в
                красивую цифровую книгу для близкого человека. Создайте сами —
                подарите по приватной ссылке или QR-коду.
              </p>

              <div className="flex flex-col gap-3.5 pt-1 sm:flex-row sm:items-center">
                <Link
                  href="/catalog"
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#1F3042] px-7 text-base font-medium text-[#F7F2E9] hover:bg-[#162433] transition-colors shadow-xs"
                >
                  <span>Создать книгу</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo/love-story"
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#1F3042] bg-[#FFFDF8] px-6 text-base font-medium text-[#1F3042] hover:bg-[#EFE7DA] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Посмотреть пример</span>
                </Link>
              </div>

              {/* Спокойная читаемая строка ключевых условий без сжатых микроколонок */}
              <div className="rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8]/85 px-5 py-4 text-sm sm:text-[15px] text-[#2F3E4E] flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="font-semibold text-[#1F3042]">
                  От 4 990 ₽ за готовое издание
                </span>
                <span className="text-[#B99273]">•</span>
                <span>До 30 ваших фотографий</span>
                <span className="text-[#B99273]">•</span>
                <span>12 месяцев доступа без автосписаний</span>
              </div>
            </div>

            {/* Правая колонка: Крупная цифровая книга */}
            <div className="lg:col-span-6">
              <HeroBook />
            </div>
          </div>
        </section>

        <section className="hidden py-14 sm:py-20 lg:block lg:py-24">
          <div className="layout-container grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* Фотокомпозиция в чистой сетке без налезающих absolute-элементов */}
            <div className="lg:col-span-7 space-y-4">
              <figure className="overflow-hidden rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] shadow-sm">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D2]">
                  <Image
                    src="/images/books/love-2-first-date.webp"
                    alt="Молодая пара на первом свидании в уютной книжной кофейне при свечах"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 640px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-[#EAE0D2] bg-[#FFFDF8] px-5 py-3.5 text-sm sm:text-[15px] italic text-[#3E4C5C]">
                  «Две чашки кофе у дождливого окна и разговор, который изменил всё...» — разворот из книги «Наша история»
                </figcaption>
              </figure>

              <div className="grid grid-cols-2 gap-4">
                <figure className="overflow-hidden rounded-2xl border border-[#D8CBB8] bg-[#FFFDF8]">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src="/images/books/love-3-walk.webp"
                      alt="Осенняя прогулка пары по набережной"
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-4 py-2.5 text-xs sm:text-sm text-[#3E4C5C]">
                    Осенняя прогулка вдвоём
                  </figcaption>
                </figure>

                <figure className="overflow-hidden rounded-2xl border border-[#D8CBB8] bg-[#FFFDF8]">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src="/images/books/love-4-travel.webp"
                      alt="Первое путешествие пары к морю"
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-4 py-2.5 text-xs sm:text-sm text-[#3E4C5C]">
                    Первая поездка к Балтийскому морю
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* Правая текстовая колонка */}
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A3E4A]">
                Не просто подарок · Ваша живая история
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.12] text-[#1F3042]">
                Помните, как всё начиналось?
              </h2>
              <p className="text-base sm:text-[17px] leading-[1.6] text-[#2F3E4E]">
                Первая встреча, долгий разговор и место, которое стало только
                вашим. Мы собираем фотографии и короткие слова в книгу, которую
                хочется открыть снова.
              </p>
              <p className="text-base leading-[1.6] text-[#3E4C5C]">
                Вам не нужно писать длинные тексты или владеть дизайном —
                достаточно выбрать повод и ответить на бережные вопросы.
              </p>
              <div className="pt-2">
                <Link
                  href="/demo/love-story"
                  className="inline-flex max-w-full items-center justify-between gap-4 rounded-full border border-[#7A3E4A] bg-[#F6ECEA] py-3 pl-6 pr-5 text-[15px] font-medium leading-tight text-[#7A3E4A] transition-colors hover:bg-[#EED9DC]"
                >
                  <span className="text-left">
                    <span className="block">Пролистать пример «Наша история»</span>
                    <span className="mt-0.5 block text-[13px] font-medium tracking-wide text-[#7A3E4A]/75">
                      8 разворотов
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. КАТАЛОГ ЧЕТЫРЁХ ПОДАРКОВ (СТРОЙНАЯ СЕТКА 2x2 ОДНОЙ ИЕРАРХИИ) */}
        <section
          id="gifts"
          className="order-2 border-y border-[#DFD2C0] bg-[#EFE7DA]/65 py-14 sm:py-20 lg:order-none lg:py-24"
        >
          <div className="layout-container space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                Четыре повода · Четыре характера
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] text-[#1F3042]">
                Выберите книгу для вашего близкого человека
              </h2>
            </div>

            {/* Сетка 2x2 на 1024px+ и 1 просторная колонка на iPhone и iPad portrait */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <ProductCard slug="mother-thanks" />
              <ProductCard slug="love-story" />
              <ProductCard slug="your-day" />
              <ProductCard slug="first-year" />
            </div>
          </div>
        </section>

        <section className="order-4 py-14 sm:py-20 lg:order-none lg:py-24">
          <div className="layout-container space-y-10">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                Эстетика коллекционной фотокниги
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] text-[#1F3042]">
                Самые дорогие моменты не должны теряться среди тысяч фотографий
              </h2>
              <p className="text-base sm:text-[17px] leading-[1.6] text-[#2F3E4E]">
                В памяти телефона хранятся тысячи случайных снимков, которые
                редко открывают. Отобранные 15–30 фотографий с вашими подписями
                и личным письмом становятся книгой, к которой возвращаются.
              </p>
            </div>

            {/* Три сбалансированные карточки с отдельными читаемыми подписями под фото */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {[
                {
                  img: "/images/books/mom-2-childhood.webp",
                  alt: "Мама ведёт маленькую дочку с белыми бантами в первый класс",
                  tag: "Из примера «Мама, спасибо»",
                  title: "1 сентября, белые банты и мамина рука",
                  text: "Детские воспоминания и благодарность за тепло родного дома, собранные в светлую книгу для мамы.",
                  href: "/demo/mother-thanks",
                },
                {
                  img: "/images/books/baby-3-smile.webp",
                  alt: "Первая радостная улыбка трёхмесячного малыша",
                  tag: "Из примера «Мой первый год»",
                  title: "Первая осознанная улыбка и первые шаги",
                  text: "Хроника взросления малыша от 0 до 12 месяцев, которую можно дополнять весь год.",
                  href: "/demo/first-year",
                },
                {
                  img: "/images/books/day-4-moments.webp",
                  alt: "Друзья на вершине горного перевала на золотом рассвете",
                  tag: "Из примера «Твой день»",
                  title: "Рассветы, путешествия и слова друзей",
                  text: "Праздничное издание ко дню рождения с лучшими совместными историями и тостом.",
                  href: "/demo/your-day",
                },
              ].map((card) => (
                <article
                  key={card.title}
                  className="paper-shadow flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8]"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE0D2]">
                      <Image
                        src={card.img}
                        alt={card.alt}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 380px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-2.5">
                      <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A6855] block">
                        {card.tag}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-[26px] leading-snug text-[#1F3042]">
                        {card.title}
                      </h3>
                      <p className="text-[15px] sm:text-base leading-relaxed text-[#2F3E4E]">
                        {card.text}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-2">
                    <Link
                      href={card.href}
                      className="inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-medium text-[#1F3042] underline decoration-[#B99273] underline-offset-4 hover:text-[#7A3E4A]"
                    >
                      <span>Открыть этот пример</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. КАК ЭТО РАБОТАЕТ — 3 ШАГА */}
        <section
          id="how"
          className="order-3 border-y border-[#DFD2C0] bg-[#EFE7DA] py-14 sm:py-20 lg:order-none lg:py-24"
        >
          <div className="layout-container space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                Понятный путь без дизайнера
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] text-[#1F3042]">
                Три шага до готового подарка
              </h2>
            </div>

            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {[
                {
                  num: "Шаг 01",
                  title: "Выберите историю",
                  text: "Четыре готовых сценария со своей палитрой, структурой глав и подсказками. Регистрация для старта не нужна.",
                  img: "/images/books/mom-4-home.webp",
                  alt: "Тёплый семейный момент на кухне",
                },
                {
                  num: "Шаг 02",
                  title: "Добавьте фотографии и слова",
                  text: "Загрузите до 30 снимков с телефона и ответьте на короткие вопросы. Черновик автоматически сохраняется.",
                  img: "/images/books/love-5-home.webp",
                  alt: "Пара в новой квартире среди огоньков",
                },
                {
                  num: "Шаг 03",
                  title: "Подарите по ссылке или QR",
                  text: "Пролистайте полный предпросмотр до оплаты, оплатите заказ и мгновенно отправьте ссылку или QR-код близкому человеку.",
                  img: "/images/books/day-5-details.webp",
                  alt: "Праздничный конверт с сургучной печатью и бокалы",
                },
              ].map((step) => (
                <li
                  key={step.num}
                  className="paper-shadow flex h-full flex-col overflow-hidden rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D2]">
                    <Image
                      src={step.img}
                      alt={step.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-[#1F3042] px-4 py-1.5 font-serif text-base font-medium text-[#FFFDF8] shadow-xs">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7 space-y-3">
                    <div className="space-y-2.5">
                      <h3 className="font-serif text-2xl sm:text-[28px] font-medium leading-tight text-[#1F3042]">
                        {step.title}
                      </h3>
                      <p className="text-base leading-relaxed text-[#2F3E4E]">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="order-5 py-14 sm:py-20 lg:order-none lg:py-24">
          <div className="layout-container">
            <div className="paper-shadow overflow-hidden rounded-3xl border border-[#1F3042] bg-[#1F3042]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="relative min-h-[280px] sm:min-h-[360px] lg:col-span-6 lg:min-h-[460px]">
                  <Image
                    src="/images/books/story-family-reading.webp"
                    alt="Семья вечером на диване вместе рассматривает цифровую фотокнигу на планшете и телефоне"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 580px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14 text-[#F7F2E9] lg:col-span-6 space-y-6">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#D8C3A8]">
                    Истории, к которым возвращаются
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                    Однажды вы откроете эту книгу снова
                  </h2>
                  <p className="text-base sm:text-[17px] leading-[1.6] text-[#EAE2D6]">
                    Через месяц или тихим вечером, когда захочется вспомнить.
                    Книга открывается по приватной ссылке на любом телефоне или
                    планшете, а полный архив фотографий и текстов всегда можно
                    сохранить себе.
                  </p>
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/catalog"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#F7F2E9] px-7 text-base font-medium text-[#1F3042] hover:bg-white sm:w-auto"
                    >
                      Выбрать подарок
                    </Link>
                    <Link
                      href="/demo/mother-thanks"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#F7F2E9]/45 px-6 py-2.5 text-center text-base font-medium leading-tight text-[#F7F2E9] hover:bg-white/10 sm:w-auto sm:py-0"
                    >
                      <span className="sm:hidden">
                        <span className="block whitespace-nowrap">Смотреть демо</span>
                        <span className="block whitespace-nowrap">«Мама, спасибо»</span>
                      </span>
                      <span className="hidden whitespace-nowrap sm:inline">Смотреть демо «Мама, спасибо»</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ПРОЗРАЧНАЯ СТОИМОСТЬ (КРУПНЫЕ ЧИТАЕМЫЕ КАРТОЧКИ НА ВСЕХ УСТРОЙСТВАХ) */}
        <section
          id="pricing"
          className="order-6 border-t border-[#DFD2C0] bg-[#EFE7DA]/50 py-14 sm:py-20 lg:order-none lg:py-24"
        >
          <div className="layout-container space-y-10">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                Честные условия и фиксированные цены
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] text-[#1F3042]">
                Прозрачная стоимость без скрытых подписок
              </h2>
              <p className="text-base sm:text-[17px] leading-[1.6] text-[#2F3E4E]">
                Вы платите один раз при публикации готовой книги. Предпросмотр
                до оплаты бесплатен.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
              {PRICING_ITEMS.map((item) => (
                <div
                  key={item.slug}
                  className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between gap-6 ${item.tone}`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-[#FFFDF8] px-3.5 py-1 text-xs sm:text-[13px] font-medium text-[#1F3042] border border-[#D8CBB8]">
                        {item.badge}
                      </span>
                      <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3042]">
                        {item.price}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F3042]">
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed text-[#2F3E4E]">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="border-t border-[#D8CBB8]/80 pt-4 space-y-3">
                    <div className="flex items-start gap-2.5 text-sm sm:text-[15px] text-[#1F3042]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4D6256] mt-1" />
                      <span>
                        <strong>Срок размещения:</strong> {item.duration}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm sm:text-[15px] text-[#2F3E4E]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4D6256] mt-1" />
                      <span>{item.afterYear}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
                      <Link
                        href={`/create/${item.slug}`}
                        className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-[#1F3042] px-4 text-[15px] font-medium text-[#F7F2E9] hover:bg-[#162433]"
                      >
                        <span className="whitespace-nowrap">Создать книгу</span>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                      <Link
                        href={`/demo/${item.slug}`}
                        className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-[#1F3042]/40 bg-[#FFFDF8] px-4 text-[15px] font-medium text-[#1F3042] hover:bg-[#F7F2E9]"
                      >
                        <span className="whitespace-nowrap">Посмотреть пример</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. ЧАСТЫЕ ВОПРОСЫ (FAQ) */}
        <section id="faq" className="order-7 py-14 sm:py-20 lg:order-none lg:py-24">
          <div className="layout-container">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                  Ответы на важные вопросы
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] text-[#1F3042]">
                  Частые вопросы перед покупкой
                </h2>
              </div>

              <Accordion
                type="single"
                collapsible
                className="rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] px-6 py-3 sm:px-8 shadow-xs"
              >
                <AccordionItem value="a">
                  <AccordionTrigger>
                    Это цифровая или печатная книга?
                  </AccordionTrigger>
                  <AccordionContent>
                    Это интерактивная цифровая книга: получатель открывает её по
                    приватной ссылке или QR-коду с любого телефона, планшета или
                    компьютера. Бумажный тираж не печатается, поэтому книгу можно
                    создать и подарить в тот же день.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                  <AccordionTrigger>
                    Можно ли увидеть книгу до оплаты и отредактировать позже?
                  </AccordionTrigger>
                  <AccordionContent>
                    Да. Вы собираете книгу в пошаговом редакторе и бесплатно
                    листаете полный предпросмотр до оплаты. После покупки вы
                    можете в любой момент вернуться в личный кабинет и поправить
                    тексты или подписи.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="c">
                  <AccordionTrigger>
                    Кто сможет открыть мою книгу и защищены ли фотографии?
                  </AccordionTrigger>
                  <AccordionContent>
                    Каждая опубликованная книга получает уникальный
                    непредсказуемый адрес и закрыта от поисковых систем (
                    <code>noindex</code>). Дополнительно вы можете установить
                    защитный PIN-код из 4–8 цифр, чтобы открыть книгу мог только
                    ваш близкий человек.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="d">
                  <AccordionTrigger>
                    Сколько фотографий можно загрузить и что будет через год?
                  </AccordionTrigger>
                  <AccordionContent>
                    В книгу можно загрузить до 30 фотографий (JPEG, PNG или WebP
                    до 15 МБ каждая). Каждая книга размещается на 12 месяцев. Для
                    издания «Мой первый год» доступно добровольное ручное
                    продление за 990 ₽/год (с льготным хранением 90 дней и
                    напоминаниями за 30, 7 и 1 день). Для всех книг в личном
                    кабинете всегда доступно бесплатное скачивание полного архива
                    ваших материалов.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* 9. ФИНАЛЬНЫЙ CTA */}
        <section className="order-8 bg-[#1F3042] py-16 text-center text-[#F7F2E9] sm:py-20 lg:order-none">
          <div className="layout-container space-y-6">
            <div className="flex justify-center">
              <BrandLogo size="lg" variant="light" />
            </div>
            <h2 className="mx-auto max-w-3xl font-serif text-3xl sm:text-5xl lg:text-[54px] leading-[1.08]">
              У каждого близкого человека есть история. Начните со своей.
            </h2>
            <p className="mx-auto max-w-xl text-base sm:text-lg text-[#E2D9CC]">
              Выберите повод, посмотрите живой пример книги и соберите подарок,
              который сохранит ваши самые тёплые слова.
            </p>
            <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-3 pt-2 sm:max-w-none sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#F7F2E9] px-8 text-base font-medium text-[#1F3042] hover:bg-white sm:w-auto"
              >
                <span className="whitespace-nowrap">Выбрать подарок</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/demo/love-story"
                className="inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full border border-[#F7F2E9]/45 px-7 text-base font-medium text-[#F7F2E9] hover:bg-white/10 sm:w-auto"
              >
                Пример «Наша история»
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
