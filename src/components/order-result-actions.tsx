"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[#4A6151]" />
          <span>Скопировано</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Скопировать ссылку</span>
        </>
      )}
    </Button>
  );
}

export function OrderRecoveryActions({
  orderId,
  orderStatus,
  demoSimulatorEnabled,
}: {
  orderId: string;
  orderStatus: string;
  demoSimulatorEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetryPublish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/retry-publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось завершить публикацию");
      } else {
        router.refresh();
      }
    } catch {
      setError("Ошибка сети при повторной попытке");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateWebhookSuccess() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          outcome: "payment.succeeded",
          simulatePublishFailureOnce: false,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Ошибка симулятора");
      } else {
        router.refresh();
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {(orderStatus === "publishing" || orderStatus === "paid") && (
        <Button
          type="button"
          variant="rose"
          disabled={loading}
          onClick={handleRetryPublish}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>
            {loading
              ? "Завершаем выпуск книги..."
              : "Повторить публикацию книги сейчас"}
          </span>
        </Button>
      )}

      {demoSimulatorEnabled &&
        (orderStatus === "pending_payment" ||
          orderStatus === "payment_failed") && (
          <Button
            type="button"
            variant="rose"
            disabled={loading}
            onClick={handleSimulateWebhookSuccess}
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {loading
                ? "Подтверждаем вебхук..."
                : "DEMO_MODE: Подтвердить успешный платёж вебхуком"}
            </span>
          </Button>
        )}

      {error && <p className="text-xs text-[#9E2A2B]">{error}</p>}
    </div>
  );
}
