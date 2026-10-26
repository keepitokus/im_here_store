"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function AdminActionButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function runEvaluateEntitlements() {
    setLoading(true);
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_entitlements" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={runEvaluateEntitlements}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      <span>Проверить сроки размещения и отправить предупреждения (30/7/1 дн.)</span>
    </Button>
  );
}

export function AdminRetryOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRetry() {
    setLoading(true);
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_publish", orderId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleRetry}
      className="rounded-full bg-[#6E2638] px-3 py-1 text-xs font-medium text-white hover:bg-[#581D2C]"
    >
      {loading ? "Повтор..." : "Повторить выдачу"}
    </button>
  );
}
