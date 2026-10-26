import { SiteHeader, SiteFooter } from "@/components/site-layout";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="layout-container flex-1 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] p-7 sm:p-10 shadow-xs">
          <div className="rounded-2xl border border-[#E2D4C0] bg-[#FAF6EE] p-4 text-sm text-[#4E5D6C]">
            Внимание: текст подготовлен для MVP и требует юридической проверки
            перед коммерческим запуском.
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#1F3042]">
            Пользовательское соглашение сервиса «Я здесь»
          </h1>

          <div className="space-y-5 text-base text-[#2F3E4E] leading-relaxed">
            <h2 className="font-serif text-2xl text-[#1F3042] pt-2">
              1. Предмет соглашения
            </h2>
            <p>
              Сервис «Я здесь» предоставляет пользователю интерактивный редактор
              для самостоятельного создания цифровой книги-подарка и её
              размещения по приватной ссылке в течение оплаченного срока.
            </p>

            <h2 className="font-serif text-2xl text-[#1F3042] pt-2">
              2. Права на загружаемые материалы
            </h2>
            <p>
              Все права на загружаемые фотографии и авторские тексты остаются за
              пользователем. Пользователь подтверждает, что не загружает
              вредоносные файлы и материалы, нарушающие законодательство РФ.
            </p>

            <h2 className="font-serif text-2xl text-[#1F3042] pt-2">
              3. Правила доступа по ссылке и PIN-коду
            </h2>
            <p>
              Тег <code>noindex</code> препятствует индексации поисковыми
              системами, однако любой обладатель прямой ссылки может открыть
              опубликованную книгу, если не включён PIN-код. Для дополнительной
              защиты рекомендуем включать PIN-код из 4–8 цифр в настройках
              книги.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
