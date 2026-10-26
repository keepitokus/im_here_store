import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { CheckoutClient } from "@/components/checkout-client";
import { getCurrentUser } from "@/lib/auth";
import { getBookWithRelations } from "@/lib/books";
import { getProductBySlug, isValidProductSlug } from "@/lib/catalog";
import { computeServerOrderPriceKopecks } from "@/lib/commerce";
import { isSimulatedPaymentAllowed } from "@/lib/env";
import { ensureDemoSeed } from "@/lib/demo-seed";
import { Lock } from "lucide-react";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  ensureDemoSeed();
  const { bookId } = await params;
  const { type } = await searchParams;
  const user = await getCurrentUser();

  const full = getBookWithRelations(bookId);
  if (!full || !isValidProductSlug(full.book.productSlug)) {
    notFound();
  }

  if (!user || full.book.ownerId !== user.id) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBE9E7]">
              <Lock className="h-6 w-6 text-[#9E2A2B]" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-[#231C18]">
              Войдите в аккаунт владельца для оплаты книги
            </h1>
            <p className="text-sm text-[#574940]">
              Оформить заказ или продление может только автор книги.
            </p>
            <Link
              href="/account"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#6E2638] px-6 py-2.5 text-sm font-medium text-[#FAF4F4]"
            >
              Войти в личный кабинет
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const product = getProductBySlug(full.book.productSlug)!;
  const orderType =
    type === "renewal" && product.allowsRenewalInMvp
      ? "renewal"
      : "initial_purchase";

  const serverAmountKopecks = computeServerOrderPriceKopecks(
    product.slug,
    orderType
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CheckoutClient
            bookId={full.book.id}
            bookTitle={full.book.title}
            product={product}
            orderType={orderType}
            serverAmountKopecks={serverAmountKopecks}
            currentExpiresAt={full.book.expiresAt}
            demoSimulatorEnabled={isSimulatedPaymentAllowed()}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
