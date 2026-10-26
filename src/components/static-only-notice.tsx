import Link from "next/link";

export function StaticOnlyNotice({ title }: { title: string }) {
  return (
    <div className="layout-container py-16 sm:py-24">
      <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-[#DFD2C0] bg-[#FFFDF8] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A6855]">
          Статическая витрина
        </p>
        <h1 className="font-serif text-3xl text-[#1F3042]">{title}</h1>
        <p className="text-base leading-relaxed text-[#2F3E4E]">
          Редактор, оплата и личный кабинет работают только в полной версии
          магазина. На этой странице можно смотреть каталог, описания подарков
          и демонстрационные книги.
        </p>
        <Link
          href="/catalog"
          className="inline-flex min-h-11 items-center rounded-full bg-[#1F3042] px-5 text-sm font-medium text-[#F7F2E9]"
        >
          Вернуться в каталог
        </Link>
      </div>
    </div>
  );
}
