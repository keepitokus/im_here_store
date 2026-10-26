import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { Mail, ShieldAlert, HelpCircle, BookOpen } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="layout-container flex-1 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A3E4A]">
              Служба заботы «Я здесь»
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#1F3042]">
              Поддержка и ответы на вопросы
            </h1>
            <p className="text-base sm:text-lg text-[#2F3E4E] leading-relaxed">
              Если у вас возник вопрос по оплате, публикации книги, скачиванию
              архива или продлению размещения — мы поможем разобраться.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="paper-shadow rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] p-7 space-y-4">
              <Mail className="h-6 w-6 text-[#7A3E4A]" />
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1F3042]">
                Написать в поддержку
              </h2>
              <p className="text-base text-[#2F3E4E] leading-relaxed">
                Укажите email, на который оформлялся заказ, или номер заказа
                (например, <code>ord_...</code>). Мы никогда не просим присылать
                коды входа или реквизиты банковских карт.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:support@ya-zdes.ru"
                  className="inline-flex min-h-12 items-center rounded-full bg-[#1F3042] px-6 text-[15px] font-medium text-[#F7F2E9] hover:bg-[#162433]"
                >
                  support@ya-zdes.ru
                </a>
              </div>
            </div>

            <div className="paper-shadow rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] p-7 space-y-4">
              <ShieldAlert className="h-6 w-6 text-[#4D6256]" />
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1F3042]">
                Если после оплаты книга ещё готовится
              </h2>
              <p className="text-base text-[#2F3E4E] leading-relaxed">
                Публикация запускается сразу после подтверждения оплаты.
                Если возникла кратковременная задержка, на странице заказа
                доступна кнопка повторного запуска выдачи.
              </p>
              <div className="pt-2">
                <Link
                  href="/account"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1F3042]/35 bg-[#FAF6EE] px-6 text-[15px] font-medium text-[#1F3042] hover:bg-[#EFE7DA]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Проверить мои книги в кабинете</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="paper-shadow rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] p-7 sm:p-9 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1F3042] flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-[#7A3E4A]" />
              Памятка покупателю
            </h2>
            <ul className="space-y-3 text-base text-[#2F3E4E] leading-relaxed">
              <li>
                • <strong>Форматы фотографий:</strong> до 30 снимков в форматах
                JPEG, PNG или WebP, размером до 15 МБ каждый.
              </li>
              <li>
                • <strong>Приватность:</strong> все опубликованные книги закрыты
                от индексации поисковиками (<code>noindex</code>). Для защиты от
                чтения по пересланной ссылке установите PIN-код (4–8 цифр).
              </li>
              <li>
                • <strong>Продление «Мой первый год»:</strong> 990 ₽ за 365 дней
                в ручном режиме из личного кабинета (льготный период хранения
                после окончания срока — 90 дней, без автосписаний).
              </li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
