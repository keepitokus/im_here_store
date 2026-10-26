import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { PRODUCT_SLUGS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог цифровых книг-подарков",
  description:
    "Четыре коллекционные цифровые книги: «Мама, спасибо» (5 990 ₽), «Наша история» (4 990 ₽), «Твой день» (5 990 ₽) и «Мой первый год» (4 990 ₽).",
};

export default function CatalogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="layout-container flex-1 py-12 sm:py-16 lg:py-20 space-y-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
            Коллекция изданий «Я здесь» · {PRODUCT_SLUGS.length} книги
          </p>
          <h1 className="font-serif text-4xl leading-tight text-[#1F3042] sm:text-5xl lg:text-6xl">
            Кому вы хотите подарить историю?
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#2F3E4E]">
            Каждое издание оформлено как дорогой фотоальбом: со своей палитрой,
            обложкой, хронологией и личным письмом в финале.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <ProductCard slug="mother-thanks" />
          <ProductCard slug="love-story" />
          <ProductCard slug="your-day" />
          <ProductCard slug="first-year" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
