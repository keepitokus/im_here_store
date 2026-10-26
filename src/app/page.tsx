import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { HeroBook } from "@/components/hero-book";
import { ProductCard } from "@/components/product-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SHOW_MOTHERS_DAY_BANNER } from "@/lib/landing";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. ПЕРВЫЙ ЭКРАН (HERO) */}
        <section className="relative overflow-hidden border-b border-[#E5D9C8] bg-gradient-to-b from-[#F7F2E9] via-[#F5EFE3] to-[#EFE7DA] py-10 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
            {/* Левая колонка */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C9B5] bg-[#FFFDF8] px-4 py-1.5 text-xs font-medium text-[#7A3E4A]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Цифровые коллекционные книги для самых близких</span>
              </div>

              <h1 className="font-serif text-4xl leading-[0.96] tracking-tight text-[#1F3042] sm:text-6xl lg:text-[64px]">
                Есть истории, которые хочется подарить
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#2F3E4E] sm:text-lg">
                Превратите ваши фотографии, воспоминания и самые важные слова в
                красивую цифровую книгу для близкого человека.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <Link
                  href="/catalog"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1F3042] px-7 text-sm sm:text-base font-medium text-[#F7F2E9] hover:bg-[#162433] transition-colors shadow-sm"
                >
                  <span>Создать книгу</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo/love-story"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1F3042] bg-[#FFFDF8]/80 px-6 text-sm sm:text-base font-medium text-[#1F3042] hover:bg-[#FFFDF8] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Посмотреть пример</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-[#DFD2C0] pt-5 text-xs text-[#4E5D6C]">
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1F3042] block">
                    от 4 990 ₽
                  </span>
                  <span>фиксированная цена без скрытых доплат</span>
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1F3042] block">
                    до 30 фото
                  </span>
                  <span>ваши снимки, даты и личное письмо</span>
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#1F3042] block">
                    По ссылке и QR
                  </span>
                  <span>открывается на любом телефоне</span>
                </div>
              </div>
            </div>

            {/* Правая колонка: Крупная цифровая книга с фотографиями и перелистыванием */}
            <div className="lg:col-span-6">
              <HeroBook />
            </div>
          </div>
        </section>

        {/* 2. ВИЗУАЛЬНЫЙ СТОРИТЕЛЛИНГ №1: «Помните, как всё начиналось?» */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-7">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-[#DFD2C0] shadow-lg">
                <Image
                  src="/images/books/love-2-first-date.webp"
                  alt="Молодая пара на первом свидании в уютной кофейне при свечах"
                  fill
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 right-5 font-serif text-lg italic text-[#FFFDF8] sm:text-xl">
                  «Две чашки кофе у дождливого окна и разговор, который изменил всё...»
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:absolute sm:-bottom-8 sm:right-6 sm:mt-0 sm:w-72">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-[#FFFDF8] shadow-lg">
                  <Image
                    src="/images/books/love-3-walk.webp"
                    alt="Осенняя прогулка пары по набережной"
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-[#FFFDF8] shadow-lg">
                  <Image
                    src="/images/books/love-4-travel.webp"
                    alt="Первое путешествие пары к морю"
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:col-span-5 lg:pl-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#7A3E4A]">
                Живые эмоции вместо дежурных подарков
              </p>
              <h2 className="font-serif text-4xl leading-tight text-[#1F3042] sm:text-5xl">
                Помните, как всё начиналось?
              </h2>
              <p className="text-base leading-relaxed text-[#2F3E4E]">
                Первые свидания. Мамины объятия. Детский смех и рассветы в кругу
                друзей. Мы собираем эти кадры и короткие подлинные фразы в
                коллекционное цифровое издание, которое можно листать страница за
                страницей.
              </p>
              <div className="pt-2">
                <Link
                  href="/demo/love-story"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#7A3E4A] underline decoration-[#B99273] underline-offset-4"
                >
                  <span>Пролистать историю Анны и Михаила (8 разворотов)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. КАТАЛОГ ЧЕТЫРЁХ ПОДАРКОВ (ЖУРНАЛЬНЫЕ КАРТОЧКИ С ОБЛОЖКАМИ И ФОТО) */}
        <section id="gifts" className="border-t border-[#E5D9C8] bg-[#F3ECE0]/60 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">
                  Четыре коллекционных издания
                </p>
                <h2 className="font-serif text-4xl text-[#1F3042] sm:text-5xl">
                  Выберите книгу для вашего близкого человека
                </h2>
              </div>
              {SHOW_MOTHERS_DAY_BANNER && (
                <p className="rounded-full border border-[#C8D8E4] bg-[#EEF3F6] px-4 py-1.5 text-xs font-medium text-[#2C4A6B]">
                  Ко Дню матери — 29 ноября · «Мама, спасибо» в сезонном фокусе
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ProductCard slug="mother-thanks" featured />
              <ProductCard slug="love-story" />
              <ProductCard slug="your-day" />
              <ProductCard slug="first-year" featured />
            </div>
          </div>
        </section>

        {/* 4. ВИЗУАЛЬНЫЙ СТОРИТЕЛЛИНГ №2: ХУДОЖЕСТВЕННЫЙ КОЛЛАЖ СЕМЕЙНЫХ СНИМКОВ */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 space-y-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">
              Эстетика коллекционной фотокниги
            </p>
            <h2 className="font-serif text-4xl leading-tight text-[#1F3042] sm:text-5xl">
              Самые дорогие моменты не должны теряться среди тысяч фотографий
            </h2>
            <p className="text-base leading-relaxed text-[#2F3E4E]">
              В телефоне хранятся тысячи случайных кадров, к которым редко
              возвращаются. Отобранные 15–30 фотографий с вашими подписями и
              письмом превращаются в семейную реликвию.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <figure className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#DFD2C0] lg:col-span-5">
              <Image
                src="/images/books/mom-2-childhood.webp"
                alt="Мама ведёт маленькую дочку с белыми бантами в первый класс"
                fill
                sizes="(max-width: 1024px) 100vw, 460px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <figcaption className="absolute bottom-4 left-4 right-4 text-[#FFFDF8]">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#DCE7F0]">
                  Из демо «Мама, спасибо»
                </span>
                <p className="font-serif text-xl">
                  1 сентября, белые банты и мамина рука
                </p>
              </figcaption>
            </figure>

            <figure className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#DFD2C0] lg:col-span-4">
              <Image
                src="/images/books/baby-3-smile.webp"
                alt="Первая радостная улыбка трёхмесячного малыша"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <figcaption className="absolute bottom-4 left-4 right-4 text-[#FFFDF8]">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#DFE9E1]">
                  Из демо «Мой первый год»
                </span>
                <p className="font-serif text-xl">
                  Первая осознанная улыбка в 6 недель
                </p>
              </figcaption>
            </figure>

            <figure className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#DFD2C0] sm:col-span-2 lg:col-span-3">
              <Image
                src="/images/books/day-4-moments.webp"
                alt="Друзья на вершине горного перевала на золотом рассвете"
                fill
                sizes="(max-width: 1024px) 100vw, 300px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <figcaption className="absolute bottom-4 left-4 right-4 text-[#FFFDF8]">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#F5E6C8]">
                  Из демо «Твой день»
                </span>
                <p className="font-serif text-xl">Рассвет выше облаков</p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 5. КАК ЭТО РАБОТАЕТ — 3 ШАГА С ВИЗУАЛЬНЫМИ ПРИМЕРАМИ */}
        <section id="how" className="border-y border-[#E5D9C8] bg-[#EFE7DA] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">
                Без дизайнера и долгих анкет
              </p>
              <h2 className="font-serif text-4xl text-[#1F3042] sm:text-5xl">
                Три шага до готового подарка
              </h2>
            </div>

            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  num: "01",
                  title: "Выберите историю",
                  text: "Один из четырёх поводов со своей палитрой, структурой глав и бережными подсказками.",
                  img: "/images/books/mom-4-home.webp",
                  alt: "Тёплый семейный момент на кухне",
                },
                {
                  num: "02",
                  title: "Добавьте фотографии и слова",
                  text: "Загрузите до 30 снимков с телефона и ответьте на короткие вопросы. Черновик сохраняется сам.",
                  img: "/images/books/love-5-home.webp",
                  alt: "Пара в новой квартире среди огоньков",
                },
                {
                  num: "03",
                  title: "Подарите по ссылке или QR",
                  text: "Пролистайте предпросмотр до оплаты, оплатите заказ и мгновенно отправьте ссылку близкому человеку.",
                  img: "/images/books/day-5-details.webp",
                  alt: "Праздничный конверт с сургучной печатью и бокалы",
                },
              ].map((step) => (
                <li
                  key={step.num}
                  className="overflow-hidden rounded-3xl border border-[#DFD2C0] bg-[#FFFDF8] shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={step.img}
                      alt={step.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-[#1F3042] px-3 py-1 font-serif text-lg text-[#FFFDF8]">
                      Шаг {step.num}
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#1F3042]">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#3E4C5C]">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6. ВИЗУАЛЬНЫЙ СТОРИТЕЛЛИНГ №3: «Однажды вы откроете эту книгу снова» */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-[#DFD2C0] bg-[#1F3042] shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative min-h-[320px] lg:col-span-7 lg:min-h-[480px]">
                <Image
                  src="/images/books/story-family-reading.webp"
                  alt="Семья вечером на диване вместе рассматривает цифровую фотокнигу на планшете и телефоне"
                  fill
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-7 text-[#F7F2E9] sm:p-12 lg:col-span-5 space-y-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#D8C3A8]">
                  Истории, к которым возвращаются
                </p>
                <h2 className="font-serif text-3xl leading-tight sm:text-5xl">
                  Однажды вы откроете эту книгу снова
                </h2>
                <p className="text-sm leading-relaxed text-[#E6DDD0] sm:text-base">
                  Через месяц, на следующую годовщину или тихим семейным вечером.
                  Книга открывается по приватной ссылке на любом телефоне или
                  планшете, а полный архив всегда можно сохранить себе.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/catalog"
                    className="inline-flex min-h-11 items-center rounded-full bg-[#F7F2E9] px-6 text-sm font-medium text-[#1F3042] hover:bg-white"
                  >
                    Выбрать повод
                  </Link>
                  <Link
                    href="/demo/mother-thanks"
                    className="inline-flex min-h-11 items-center rounded-full border border-[#F7F2E9]/40 px-5 text-sm text-[#F7F2E9] hover:bg-white/10"
                  >
                    Смотреть демо «Мама, спасибо»
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ПРОЗРАЧНАЯ СТОИМОСТЬ */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="rounded-3xl border border-[#DFD2C0] bg-[#FFFDF8] p-6 sm:p-10 space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">
                Честные правила размещения
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F3042]">
                Прозрачная стоимость без скрытых подписок
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-[#8A7563]">
                  <tr className="border-b border-[#EAE0D2]">
                    <th className="py-3 font-medium">Издание</th>
                    <th className="py-3 font-medium">Первая покупка</th>
                    <th className="py-3 font-medium">Условия после первого года</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D2]">
                  <tr>
                    <td className="py-4 font-serif text-xl text-[#1F3042]">«Наша история»</td>
                    <td className="py-4 font-semibold">4 990 ₽ · 12 месяцев</td>
                    <td className="py-4 text-[#3E4C5C]">
                      Включено скачивание полного архива книги. Продление в текущем выпуске не продаётся.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 font-serif text-xl text-[#1F3042]">«Мама, спасибо»</td>
                    <td className="py-4 font-semibold">5 990 ₽ · 12 месяцев</td>
                    <td className="py-4 text-[#3E4C5C]">
                      12 месяцев доступа по ссылке и скачивание архива своих материалов.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 font-serif text-xl text-[#1F3042]">«Твой день»</td>
                    <td className="py-4 font-semibold">5 990 ₽ · 12 месяцев</td>
                    <td className="py-4 text-[#3E4C5C]">
                      12 месяцев доступа по ссылке и скачивание архива.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 font-serif text-xl text-[#1F3042]">«Мой первый год»</td>
                    <td className="py-4 font-semibold">4 990 ₽ · первый год</td>
                    <td className="py-4 text-[#3E4C5C]">
                      Добровольное ручное продление — <strong>990 ₽/год</strong> отдельным платежом, без автосписаний.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. ЧАСТЫЕ ВОПРОСЫ (FAQ) */}
        <section id="faq" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <h2 className="font-serif text-4xl text-[#1F3042]">Частые вопросы</h2>
          <Accordion type="single" collapsible className="mt-4 rounded-3xl border border-[#DFD2C0] bg-[#FFFDF8] px-6 py-2">
            <AccordionItem value="a">
              <AccordionTrigger>Это цифровая или печатная книга?</AccordionTrigger>
              <AccordionContent>
                Это интерактивная цифровая книга: получатель открывает её по приватной ссылке или QR-коду с любого телефона, планшета или компьютера. Бумажный тираж не печатается.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Можно ли увидеть книгу до оплаты и отредактировать позже?</AccordionTrigger>
              <AccordionContent>
                Да. Вы собираете книгу в редакторе и бесплатно листаете полный предпросмотр до оплаты. После покупки вы можете вернуться в личный кабинет и поправить тексты.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>Кто сможет открыть мою книгу?</AccordionTrigger>
              <AccordionContent>
                Каждая книга получает случайный непредсказуемый адрес и закрыта от поисковых систем. Дополнительно вы можете установить защитный PIN-код из 4–8 цифр.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="d">
              <AccordionTrigger>Сколько фотографий можно загрузить и как работает продление «Мой первый год»?</AccordionTrigger>
              <AccordionContent>
                До 30 фотографий (JPEG, PNG, WebP до 15 МБ каждая). Все книги размещаются на 12 месяцев. Для «Мой первый год» доступно ручное продление за 990 ₽/год (с льготным хранением 90 дней и напоминаниями за 30, 7 и 1 день). Никаких автоматических списаний нет.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* 9. ФИНАЛЬНЫЙ ЭКРАН */}
        <section className="bg-[#1F3042] px-4 py-16 text-center text-[#F7F2E9] sm:px-6 sm:py-20">
          <p className="font-script text-4xl text-[#D8C3A8]">Я здесь</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl sm:text-6xl">
            У каждой семьи есть история. Начните со своей.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex min-h-12 items-center rounded-full bg-[#F7F2E9] px-7 text-sm sm:text-base font-medium text-[#1F3042] hover:bg-white"
            >
              Создать книгу
            </Link>
            <Link
              href="/demo/love-story"
              className="inline-flex min-h-12 items-center rounded-full border border-[#F7F2E9]/40 px-6 text-sm sm:text-base text-[#F7F2E9] hover:bg-white/10"
            >
              Посмотреть пример
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
