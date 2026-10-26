import Link from "next/link";
import { ProductCatalogItem } from "@/lib/catalog";
import { formatRublesFromKopecks } from "@/lib/utils";
import { ArrowRight, Eye, Sparkles, Clock, RefreshCw } from "lucide-react";

export function ProductCard({ product }: { product: ProductCatalogItem }) {
  const primaryTheme = product.themes[0];
  const [c1, c2, c3] = primaryTheme.swatchHex;

  return (
    <article className="group flex flex-col justify-between rounded-3xl border border-[#E2D9CC] bg-[#FFFEFA] p-6 sm:p-7 shadow-xs transition-all hover:border-[#C7B8A6] hover:shadow-md">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${primaryTheme.badgeClass}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {product.badge}
          </span>

          <div
            className="flex items-center gap-1"
            title={`Палитра: ${product.paletteSummary}`}
          >
            <span
              className="h-4 w-4 rounded-full border border-black/15"
              style={{ backgroundColor: c1 }}
            />
            <span
              className="h-4 w-4 rounded-full border border-black/15"
              style={{ backgroundColor: c2 }}
            />
            <span
              className="h-4 w-4 rounded-full border border-black/15"
              style={{ backgroundColor: c3 }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18] group-hover:text-[#6E2638] transition-colors">
            <Link href={`/gifts/${product.slug}`} className="focus:outline-none">
              {product.title}
            </Link>
          </h3>
          <p className="text-sm sm:text-base text-[#574940] leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE2D6] p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#7A6B60]">
            Что внутри издания:
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-[#3F342D]">
            {product.compositionSummary.slice(0, 4).map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6E2638] shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-[#ECE4D8] space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-xs text-[#7A6B60]">Первоначальная покупка</div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
              {formatRublesFromKopecks(product.initialPriceKopecks)}
            </div>
          </div>

          <div className="text-right">
            {product.allowsRenewalInMvp && product.renewalPriceKopecks ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-[#E6EFE8] px-3 py-1 text-xs font-medium text-[#3B4F41]">
                <RefreshCw className="h-3 w-3" />
                <span>
                  Продление: {formatRublesFromKopecks(product.renewalPriceKopecks)}/год
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-xs text-[#7A6B60]">
                <Clock className="h-3.5 w-3.5" />
                <span>12 мес. размещения + архив</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href={`/create/${product.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#2B1E1A] px-4 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#3F2D27] transition-colors"
          >
            <span>Создать книгу</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/demo/${product.slug}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-3 py-2 text-xs font-medium text-[#2B1E1A] hover:bg-[#F3EDE3] transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Демо</span>
            </Link>
            <Link
              href={`/gifts/${product.slug}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-3 py-2 text-xs font-medium text-[#2B1E1A] hover:bg-[#F3EDE3] transition-colors"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
