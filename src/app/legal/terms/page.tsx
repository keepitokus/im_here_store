import { SiteHeader, SiteFooter } from "@/components/site-layout";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6">
          <div className="rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-4 text-xs text-[#6B4800]">
            Внимание: текст подготовлен для MVP и требует юридической проверки перед
            публичным коммерческим запуском.
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18]">
            Пользовательское соглашение сервиса «Я здесь»
          </h1>

          <div className="space-y-4 text-sm text-[#4A3E36] leading-relaxed">
            <h2 className="font-serif text-xl font-semibold text-[#231C18] pt-2">
              1. Предмет соглашения
            </h2>
            <p>
              Сервис «Я здесь» предоставляет пользователю интерактивный конструктор
              для самостоятельного создания цифровой книги-подарка и её размещения
              на сервере в течение оплаченного срока.
            </p>

            <h2 className="font-serif text-xl font-semibold text-[#231C18] pt-2">
              2. Права на загружаемые материалы
            </h2>
            <p>
              Все права на загружаемые фотографии и авторские тексты остаются за
              пользователем. Пользователь подтверждает, что не загружает вредоносные
              файлы и материалы, нарушающие законодательство РФ.
            </p>

            <h2 className="font-serif text-xl font-semibold text-[#231C18] pt-2">
              3. Правила доступа по ссылке и PIN-коду
            </h2>
            <p>
              Тег <code>noindex</code> препятствует индексации поисковыми системами,
              однако любой обладатель прямой ссылки может открыть опубликованную
              книгу, если не включён PIN-код. Для дополнительной защиты рекомендуем
              включать PIN-код в настройках книги.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
