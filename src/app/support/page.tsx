import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { Mail, ShieldAlert, HelpCircle, BookOpen } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
              Служба заботы «Я здесь»
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#231C18]">
              Поддержка и ответы на вопросы
            </h1>
            <p className="text-base text-[#574940] leading-relaxed">
              Если у вас возник вопрос по оплате, публикации книги, скачиванию архива
              или продлению размещения — мы поможем разобраться.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-3">
              <Mail className="h-6 w-6 text-[#6E2638]" />
              <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
                Написать в поддержку
              </h2>
              <p className="text-sm text-[#574940] leading-relaxed">
                Укажите email, на который оформлялся заказ, или номер заказа (например,{" "}
                <code>ord_...</code>). Мы никогда не просим присылать коды входа или
                реквизиты карт.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:support@ya-zdes.ru"
                  className="inline-flex min-h-[44px] items-center rounded-full bg-[#2B1E1A] px-5 py-2 text-sm font-medium text-[#FAF7F2]"
                >
                  support@ya-zdes.ru
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-3">
              <ShieldAlert className="h-6 w-6 text-[#4A6151]" />
              <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
                Что делать, если после оплаты книга ещё готовится?
              </h2>
              <p className="text-sm text-[#574940] leading-relaxed">
                Публикация запускается сразу после подтверждения вебхука от платёжной
                системы. Если возникла кратковременная задержка, на странице заказа
                вы увидите статус «Платёж получен, готовим книгу» и кнопку повторного
                запуска выдачи.
              </p>
              <div className="pt-2">
                <Link
                  href="/account"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D8CFC4] bg-[#FAF7F2] px-5 py-2 text-sm font-medium text-[#2B1E1A]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Проверить мои книги в кабинете</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18] flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#6E2638]" />
              Памятка покупателю
            </h2>
            <ul className="space-y-2.5 text-sm text-[#4A3E36]">
              <li>
                • <strong>Форматы фотографий:</strong> до 30 снимков в форматах JPEG,
                PNG или WebP, размером до 15 МБ каждый.
              </li>
              <li>
                • <strong>Приватность:</strong> все книги закрыты от индексации (
                <code>noindex</code>). Для защиты от чтения по пересланной ссылке
                установите PIN-код (4–8 цифр).
              </li>
              <li>
                • <strong>Продление «Мой первый год»:</strong> 990 ₽ за 365 дней в
                ручном режиме из личного кабинета (льготный период хранения после
                окончания срока — 90 дней).
              </li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
