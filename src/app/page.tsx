import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { HeroBook } from "@/components/hero-book";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SHOW_MOTHERS_DAY_BANNER } from "@/lib/landing";

const GIFTS = [
  {
    href: "/gifts/mother-thanks",
    demo: "/demo/mother-thanks",
    title: "Мама, спасибо",
    situation: "Ко Дню матери и просто так",
    price: "5 990 ₽",
    note: "Письмо, детские кадры, то, чему она научила",
    wash: "bg-[#EEF3F6]",
    ink: "text-[#3E5874]",
    featured: true,
  },
  {
    href: "/gifts/love-story",
    demo: "/demo/love-story",
    title: "Наша история",
    situation: "Годовщина и признание",
    price: "4 990 ₽",
    note: "Знакомство, свидания, даты и последнее письмо",
    wash: "bg-[#F6ECEA]",
    ink: "text-[#7A3E4A]",
  },
  {
    href: "/gifts/your-day",
    demo: "/demo/your-day",
    title: "Твой день",
    situation: "День рождения",
    price: "5 990 ₽",
    note: "Лучшие дни, тосты и причины гордиться",
    wash: "bg-[#F8F1E4]",
    ink: "text-[#8A6840]",
  },
  {
    href: "/gifts/first-year",
    demo: "/demo/first-year",
    title: "Мой первый год",
    situation: "Первые двенадцать месяцев",
    price: "4 990 ₽",
    note: "Месяцы, первые слова, письмо в будущее",
    wash: "bg-[#F3F6F2]",
    ink: "text-[#4D6256]",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">Цифровые книги для самых близких</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-[#1F3042] sm:text-6xl lg:text-7xl">
              Есть истории, которые хочется подарить
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3E4C5C]">
              Соберите ваши фотографии, воспоминания и важные слова в красивую интерактивную книгу. Создайте сами — подарите по ссылке.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalog" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1F3042] px-6 text-[#F7F2E9]">
                Выбрать подарок
              </Link>
              <Link href="/demo/mother-thanks" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1F3042] px-6">
                Посмотреть книгу
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#5C6B7A]">От 4 990 ₽ · 12 месяцев доступа по ссылке · без автосписаний</p>
          </div>
          <HeroBook />
        </section>

        <section className="bg-[#1F3042] px-4 py-16 text-[#F7F2E9] sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-3xl leading-snug sm:text-5xl">
              Первые свидания. Мамины объятия. Самые счастливые дни. Всё это может стать книгой.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/demo/love-story" className="rounded-full border border-white/30 px-4 py-2">История пары</Link>
              <Link href="/demo/mother-thanks" className="rounded-full border border-white/30 px-4 py-2">Письмо маме</Link>
              <Link href="/demo/your-day" className="rounded-full border border-white/30 px-4 py-2">День рождения</Link>
              <Link href="/demo/first-year" className="rounded-full border border-white/30 px-4 py-2">Первый год</Link>
            </div>
          </div>
        </section>

        <section id="gifts" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">Четыре повода</p>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Выберите, кому хотите это подарить</h2>
            </div>
            {SHOW_MOTHERS_DAY_BANNER && (
              <p className="text-sm text-[#3E5874]">Ко Дню матери — 29 ноября. «Мама, спасибо» можно собрать заранее.</p>
            )}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {GIFTS.map((gift) => (
              <article key={gift.href} className={`paper-shadow flex min-h-72 flex-col justify-between p-6 sm:p-8 ${gift.wash} ${gift.featured ? "md:col-span-2 md:min-h-80" : ""}`}>
                <div>
                  <p className={`text-xs uppercase tracking-[0.18em] ${gift.ink}`}>{gift.situation}</p>
                  <h3 className="mt-3 font-serif text-4xl sm:text-5xl">{gift.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#3E4C5C]">{gift.note}</p>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-serif text-3xl">{gift.price}</p>
                  <div className="flex gap-2">
                    <Link href={gift.demo} className="inline-flex min-h-11 items-center px-3 text-sm underline underline-offset-4">Посмотреть пример</Link>
                    <Link href={gift.href} className="inline-flex min-h-11 items-center rounded-full bg-[#1F3042] px-4 text-sm text-[#F7F2E9]">Создать</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-[#EAE0D2] bg-[#EFE7DA] px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-4xl sm:text-5xl">Три шага, без дизайнера</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["01", "Выберите историю", "Один из четырёх поводов. Вопросы уже внутри — длинный рассказ писать не нужно."],
                ["02", "Добавьте фотографии и слова", "До 30 снимков и короткие ответы. Черновик сохраняется, к нему можно вернуться."],
                ["03", "Подарите по ссылке", "После оплаты получатель открывает книгу с телефона. Можно защитить её коротким кодом."],
              ].map(([n, title, text]) => (
                <li key={n} className="bg-[#F7F2E9] p-6">
                  <p className="font-serif text-3xl text-[#B99273]">{n}</p>
                  <h3 className="mt-4 font-serif text-2xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#3E4C5C]">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">Посмотрите, что получится</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Пример можно листать до оплаты</h2>
            <p className="mt-4 text-[#3E4C5C]">Регистрация для просмотра не нужна. Это вымышленные семьи — так выглядит готовая книга, а не черновик редактора.</p>
            <Link href="/demo/love-story" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#7A3E4A] px-6 text-[#F7F2E9]">
              Открыть «Нашу историю»
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F6ECEA] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#7A3E4A]">Глава II</p>
              <p className="mt-6 font-serif text-2xl">Первое свидание под дождём</p>
            </div>
            <div className="bg-[#EEF3F6] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#3E5874]">Письмо</p>
              <p className="mt-6 font-serif text-2xl">Спасибо, что дом всегда на месте</p>
            </div>
            <div className="col-span-2 bg-[#F8F1E4] p-5">
              <p className="font-serif text-3xl">За что мы тебя любим — отдельной страницей, не строчкой в чате.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-serif text-4xl">Почему это не открытка из магазина</h2>
          <div className="mt-6 grid gap-px bg-[#EAE0D2] sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Только ваши воспоминания", "Никаких чужих историй. Текст и фотографии добавляете вы."],
              ["Открывается с телефона", "Ссылка или QR. Получателю не нужно ничего устанавливать."],
              ["Слова остаются рядом", "Письмо, даты и подписи к кадрам собраны в одном месте."],
              ["Без дизайнера", "Обложка, главы и палитра уже собраны. Вы отвечаете на короткие вопросы."],
            ].map(([title, text]) => (
              <div key={title} className="bg-[#F7F2E9] p-5">
                <h3 className="font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-sm text-[#3E4C5C]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-serif text-4xl">Сколько это стоит</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-[#8A7563]">
                <tr className="border-b border-[#EAE0D2]">
                  <th className="py-3 font-medium">Книга</th>
                  <th className="py-3 font-medium">Сейчас</th>
                  <th className="py-3 font-medium">Дальше</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#EAE0D2]"><td className="py-4">Наша история</td><td>4 990 ₽ · 12 месяцев</td><td>Продление в этом выпуске не продаётся. Архив можно скачать.</td></tr>
                <tr className="border-b border-[#EAE0D2]"><td className="py-4">Мама, спасибо</td><td>5 990 ₽ · 12 месяцев</td><td>То же: год по ссылке и скачивание своих материалов.</td></tr>
                <tr className="border-b border-[#EAE0D2]"><td className="py-4">Твой день</td><td>5 990 ₽ · 12 месяцев</td><td>Без второго платежа в этом выпуске.</td></tr>
                <tr><td className="py-4">Мой первый год</td><td>4 990 ₽ · первый год</td><td>Следующий год — 990 ₽, только если решите продлить. Автосписания нет.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <h2 className="font-serif text-4xl">Вопросы</h2>
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="a">
              <AccordionTrigger>Это печатная книга?</AccordionTrigger>
              <AccordionContent>Нет. Это цифровая книга: получатель открывает её по ссылке или QR на телефоне. Бумажный тираж не печатается.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Можно ли вернуться и поправить текст?</AccordionTrigger>
              <AccordionContent>Да. Черновик и оплаченная книга остаются в кабинете. «Мой первый год» можно дополнять, пока действует оплаченный срок.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>Что увидит получатель?</AccordionTrigger>
              <AccordionContent>Обложку, главы, фотографии и письмо. Страница закрыта от поисковиков. Если задать код из 4–8 цифр, без него книгу не откроют.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="d">
              <AccordionTrigger>Сколько фотографий и что будет через год?</AccordionTrigger>
              <AccordionContent>До 30 снимков JPEG, PNG или WebP, каждый до 15 МБ. Ссылка живёт 12 месяцев. У «Мой первый год» следующий год стоит 990 ₽ и оплачивается отдельно. Остальные книги можно скачать архивом до конца срока.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section className="bg-[#1F3042] px-4 py-16 text-center text-[#F7F2E9] sm:px-6">
          <h2 className="mx-auto max-w-3xl font-serif text-4xl sm:text-6xl">У каждой семьи есть история. Начните со своей.</h2>
          <Link href="/catalog" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#F7F2E9] px-6 text-[#1F3042]">
            Выбрать подарок
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
