import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { getProductBySlug, PRODUCT_SLUGS } from "@/lib/catalog";
import { LANDINGS, SHOW_MOTHERS_DAY_BANNER } from "@/lib/landing";
import { formatRublesFromKopecks } from "@/lib/utils";
import { trackServerEvent } from "@/lib/analytics";

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Подарок не найден" };
  return {
    title: product.title,
    description: product.seoDescription,
    openGraph: {
      title: LANDINGS[product.slug].hero,
      description: product.seoDescription,
    },
  };
}

export default async function GiftProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const page = LANDINGS[product.slug];
  trackServerEvent({ event: "view_product", productSlug: product.slug });
  const price = formatRublesFromKopecks(product.initialPriceKopecks);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main>
        <section className={`${page.wash} px-4 py-14 sm:px-6 sm:py-20`}>
          <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className={`text-xs uppercase tracking-[0.2em] ${page.ink}`}>{page.eyebrow}</p>
              {product.slug === "mother-thanks" && SHOW_MOTHERS_DAY_BANNER && (
                <p className="mt-4 inline-flex bg-[#1F3042] px-3 py-1 text-xs text-[#F7F2E9]">Ко Дню матери — 29 ноября</p>
              )}
              <h1 className="mt-4 font-serif text-5xl leading-[0.95] sm:text-6xl">{page.hero}</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3E4C5C]">{page.lead}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/create/${product.slug}`} className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[#F7F2E9] ${page.accent}`}>
                  {page.cta}
                </Link>
                <Link href={`/demo/${product.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1F3042] px-6">
                  Посмотреть пример
                </Link>
                <p className="font-serif text-3xl sm:ml-2">{price}</p>
              </div>
            </div>
            <div className="paper-shadow bg-[#FFFDF8] p-8 lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A7563]">Разворот из примера</p>
              <p className={`mt-8 font-serif text-4xl leading-tight ${page.ink}`}>{page.spreads[0].title}</p>
              <p className="mt-4 text-sm leading-relaxed">{page.spreads[0].text}</p>
              <p className="mt-10 font-script text-3xl">Я здесь</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl">Что будет внутри</h2>
            <ul className="mt-6 space-y-3">
              {page.inside.map((item, index) => (
                <li key={item} className="flex gap-4 border-b border-[#EAE0D2] py-3">
                  <span className="font-serif text-xl text-[#B99273]">0{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            {page.spreads.slice(1).map((spread) => (
              <article key={spread.title} className={`p-6 ${page.wash}`}>
                <p className={`text-xs uppercase tracking-[0.16em] ${page.ink}`}>{spread.kicker}</p>
                <h3 className="mt-3 font-serif text-3xl">{spread.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#3E4C5C]">{spread.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#EAE0D2] bg-[#EFE7DA] px-4 py-14 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {["Выберите эту книгу", "Ответьте на короткие вопросы и добавьте фото", "Оплатите и отправьте ссылку"].map((step, index) => (
              <div key={step}>
                <p className="font-serif text-4xl text-[#B99273]">0{index + 1}</p>
                <p className="mt-3 font-serif text-2xl">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-4xl">Перед оплатой</h2>
          <div className="mt-6 space-y-6">
            {page.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-serif text-2xl">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#3E4C5C]">{item.a}</p>
              </div>
            ))}
            <p className="text-sm text-[#3E4C5C]">{product.hostingPolicyNote}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/create/${product.slug}`} className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[#F7F2E9] ${page.accent}`}>
              {page.cta} · {price}
            </Link>
            <Link href={`/demo/${product.slug}`} className="inline-flex min-h-12 items-center">Посмотреть пример</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
