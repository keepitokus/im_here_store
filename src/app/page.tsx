import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS_CATALOG, PRODUCT_SLUGS } from "@/lib/catalog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sparkles,
  BookOpen,
  QrCode,
  Clock,
  Smartphone,
  Download,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const products = PRODUCT_SLUGS.map((slug) => PRODUCTS_CATALOG[slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Первый экран (Hero) */}
        <section className="relative overflow-hidden border-b border-[#E5DDD2] bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] py-12 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#DECFC2] bg-[#FFFEFA] px-4 py-1.5 text-xs font-medium text-[#6E2638]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Цифровое издание-подарок без общения с менеджером</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#231C18] leading-[1.08]">
                  Истории, к которым возвращаются
                </h1>

                <p className="text-base sm:text-lg text-[#4E4239] leading-relaxed max-w-2xl">
                  Создайте персональную интерактивную книгу из ваших фотографий,
                  памятных дат и тёплых слов за <strong>10–15 минут</strong> прямо с
                  телефона. Посмотрите живой предпросмотр, оплатите и мгновенно
                  получите приватную ссылку и QR-код для вручения.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href="/catalog"
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#6E2638] px-7 py-3 text-base font-medium text-[#FAF4F4] hover:bg-[#581D2C] transition-colors shadow-sm"
                  >
                    <span>Выбрать повод и создать книгу</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/demo/love-story"
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[#D4C8BA] bg-[#FFFEFA] px-6 py-3 text-base font-medium text-[#2B1E1A] hover:bg-[#F4EFE6] transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-[#6E2638]" />
                    <span>Листать живые образцы</span>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E2D9CC] text-xs sm:text-sm text-[#574940]">
                  <div>
                    <div className="font-serif text-lg sm:text-xl font-semibold text-[#231C18]">
                      10–15 мин
                    </div>
                    <div>от первой фотографии до готового QR-кода</div>
                  </div>
                  <div>
                    <div className="font-serif text-lg sm:text-xl font-semibold text-[#231C18]">
                      4 издания
                    </div>
                    <div>уникальные вопросы, палитра и вёрстка</div>
                  </div>
                  <div>
                    <div className="font-serif text-lg sm:text-xl font-semibold text-[#231C18]">
                      Приватно
                    </div>
                    <div>защита PIN-кодом и закрытие от индексации</div>
                  </div>
                </div>
              </div>

              {/* Интерактивная витрина книги на первом экране */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-[#DFD2C5] bg-[#FFFEFA] p-6 sm:p-8 shadow-lg space-y-5">
                  <div className="flex items-center justify-between text-xs text-[#7A6B60]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#6E2638]">
                      <span className="h-2 w-2 rounded-full bg-[#6E2638]" />
                      Интерактивный разворот
                    </span>
                    <span>«Я здесь» · Коллекция 2026</span>
                  </div>

                  <div className="rounded-2xl border border-[#E6CDD2] bg-[#FAF4F4] p-6 text-center space-y-3">
                    <div className="text-xs uppercase tracking-widest text-[#7A5B63]">
                      Глава I · 14 сентября
                    </div>
                    <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B181D]">
                      Анна и Михаил
                    </div>
                    <p className="text-xs sm:text-sm text-[#5E4149] leading-relaxed italic">
                      «Мы столкнулись у полки с альбомами по архитектуре в маленьком
                      книжном на Малой Бронной...»
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-2">
                      <span className="rounded-full bg-[#F3E1E4] px-3 py-1 text-[11px] font-medium text-[#6E2638]">
                        Обложка
                      </span>
                      <span className="rounded-full bg-[#F3E1E4] px-3 py-1 text-[11px] font-medium text-[#6E2638]">
                        Таймлайн дат
                      </span>
                      <span className="rounded-full bg-[#F3E1E4] px-3 py-1 text-[11px] font-medium text-[#6E2638]">
                        До 30 фотографий
                      </span>
                      <span className="rounded-full bg-[#F3E1E4] px-3 py-1 text-[11px] font-medium text-[#6E2638]">
                        Письмо в конверте
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <Link
                      href="/demo/love-story"
                      className="rounded-xl border border-[#E5DDD2] bg-[#FAF7F2] p-3 hover:border-[#6E2638] transition-colors"
                    >
                      <div className="font-serif font-semibold text-sm text-[#231C18]">
                        «Наша история»
                      </div>
                      <div className="text-[#7A6B60] mt-0.5">Открыть демо →</div>
                    </Link>
                    <Link
                      href="/demo/mother-thanks"
                      className="rounded-xl border border-[#E5DDD2] bg-[#FAF7F2] p-3 hover:border-[#2C4A6B] transition-colors"
                    >
                      <div className="font-serif font-semibold text-sm text-[#231C18]">
                        «Мама, спасибо»
                      </div>
                      <div className="text-[#7A6B60] mt-0.5">Открыть демо →</div>
                    </Link>
                    <Link
                      href="/demo/your-day"
                      className="rounded-xl border border-[#E5DDD2] bg-[#FAF7F2] p-3 hover:border-[#8A6421] transition-colors"
                    >
                      <div className="font-serif font-semibold text-sm text-[#231C18]">
                        «Твой день»
                      </div>
                      <div className="text-[#7A6B60] mt-0.5">Открыть демо →</div>
                    </Link>
                    <Link
                      href="/demo/first-year"
                      className="rounded-xl border border-[#E5DDD2] bg-[#FAF7F2] p-3 hover:border-[#4A6151] transition-colors"
                    >
                      <div className="font-serif font-semibold text-sm text-[#231C18]">
                        «Мой первый год»
                      </div>
                      <div className="text-[#7A6B60] mt-0.5">Открыть демо →</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Четыре карточки продукта (Каталог на главной) */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
                  Четыре повода · Четыре характера
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18]">
                  Выберите книгу для вашего близкого человека
                </h2>
              </div>
              <p className="text-sm text-[#574940] max-w-md">
                Каждое издание имеет собственную палитру, продуманные вопросы и
                композицию глав. Никаких длинных анкет — только бережные подсказки.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Как это работает */}
        <section className="border-y border-[#E5DDD2] bg-[#F4EFE6] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
                Полный self-service без ожидания
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18]">
                Как создаётся подарок за 10–15 минут
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "Шаг 1",
                  title: "Выберите повод и палитру",
                  desc: "Один из четырёх сценариев с бережными вопросами и примерами коротких ответов.",
                  icon: Sparkles,
                },
                {
                  step: "Шаг 2",
                  title: "Добавьте до 30 фотографий и дат",
                  desc: "Прямо с телефона. Снимки автоматически выравниваются и оптимизируются, черновик сохраняется сам.",
                  icon: Smartphone,
                },
                {
                  step: "Шаг 3",
                  title: "Проверьте живой предпросмотр",
                  desc: "Пролистайте готовую книгу до оплаты так, как её увидит получатель.",
                  icon: BookOpen,
                },
                {
                  step: "Шаг 4",
                  title: "Получите ссылку и QR-код",
                  desc: "Сразу после оплаты книга публикуется по секретному адресу с возможностью защиты PIN-кодом.",
                  icon: QrCode,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6E2638]">
                      {item.step}
                    </span>
                    <item.icon className="h-5 w-5 text-[#6E2638]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#231C18]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#574940] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Блок доверия и честных условий */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-10">
              <div className="max-w-2xl space-y-2 mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6151]">
                  Приватность и прозрачные правила
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
                  Бережное отношение к семейным историям
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE9DE]">
                    <Lock className="h-5 w-5 text-[#2B1E1A]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#231C18]">
                    Секретная ссылка и PIN-код
                  </h3>
                  <p className="text-sm text-[#574940] leading-relaxed">
                    Каждая опубликованная книга получает непредсказуемый адрес и
                    закрыта от поисковиков (<code>noindex</code>). Поскольку сама по
                    себе ссылка доступна любому, кому вы её перешлёте, вы можете
                    включить персональный PIN-код.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE9DE]">
                    <Clock className="h-5 w-5 text-[#2B1E1A]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#231C18]">
                    12 месяцев размещения без автосписаний
                  </h3>
                  <p className="text-sm text-[#574940] leading-relaxed">
                    В покупку входит 1 год хостинга книги. Для альбома «Мой первый
                    год» доступно ручное продление за 990 ₽/год (с льготным хранением
                    90 дней и уведомлениями за 30, 7 и 1 день). Никаких скрытых
                    подписок.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE9DE]">
                    <Download className="h-5 w-5 text-[#2B1E1A]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#231C18]">
                    Экспорт ваших материалов в любой момент
                  </h3>
                  <p className="text-sm text-[#574940] leading-relaxed">
                    Ваши тексты, даты и фотографии принадлежат вам. В личном кабинете
                    всегда доступно скачивание полного архива книги и полное удаление
                    данных по первому требованию.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
                Частые вопросы
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18]">
                Всё, что важно знать перед созданием книги
              </h2>
            </div>

            <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] px-6 py-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Сколько времени занимает создание книги и нужно ли много писать?
                  </AccordionTrigger>
                  <AccordionContent>
                    В среднем 10–15 минут. Мы специально построили редактор вокруг
                    коротких тёплых вопросов с готовыми примерами. Длинные рассказы
                    писать не нужно, а любые необязательные разделы можно пропустить.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Как получатель откроет подарок? Нужна ли ему регистрация?
                  </AccordionTrigger>
                  <AccordionContent>
                    Регистрация получателю не нужна. После оплаты вы мгновенно
                    получаете приватную ссылку и готовый QR-код (его можно распечатать
                    на открытке или переслать в мессенджере). Если вы установили PIN,
                    получатель введёт его при открытии.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Как устроено хранение книг и продление «Мой первый год»?
                  </AccordionTrigger>
                  <AccordionContent>
                    Каждая книга размещается на 12 месяцев с момента подтверждения
                    первого платежа. Для издания «Мой первый год» (4 990 ₽) вы можете
                    обновлять дневник малыша весь год, а затем вручную продлевать
                    размещение за 990 ₽ за каждый последующий год — без автоматических
                    списаний. После окончания срока данные «Мой первый год» бережно
                    сохраняются ещё 90 дней, а мы заранее напомним за 30, 7 и 1 день.
                    Для остальных трёх книг покупка продления в MVP не предусмотрена,
                    при этом вы всегда можете скачать полный архив своих материалов.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Кто может видеть мои черновики и детские фотографии?
                  </AccordionTrigger>
                  <AccordionContent>
                    Черновики и загруженные фотографии доступны только вам после входа
                    по одноразовому коду из письма. В книге «Мой первый год» данные о
                    ребёнке приватны по умолчанию, а детские фотографии никогда не
                    отправляются во внешние ИИ-сервисы.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
