import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { BookOpen, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="layout-container flex-1 flex items-center justify-center py-16">
        <div className="paper-shadow max-w-lg w-full rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] p-8 sm:p-10 text-center space-y-5">
          <p className="font-script text-4xl text-[#1F3042]">Я здесь</p>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
            Ошибка 404 · Страница не найдена
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1F3042]">
            Такой страницы нет в нашем издательстве
          </h1>
          <p className="text-base leading-relaxed text-[#2F3E4E]">
            Возможно, ссылка устарела или была введена с опечаткой. Вы можете
            вернуться на главную страницу или посмотреть примеры готовых книг.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1F3042] px-6 text-[15px] font-medium text-[#F7F2E9] hover:bg-[#162433]"
            >
              <span>На главную</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/catalog"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1F3042]/35 bg-[#FFFDF8] px-6 text-[15px] font-medium text-[#1F3042] hover:bg-[#EFE7DA]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Каталог подарков</span>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
