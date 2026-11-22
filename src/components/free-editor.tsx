"use client";

import { useState } from "react";
import { BrowserOnly } from "@/components/browser-only";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { EditorWizard } from "@/components/editor-wizard";
import { isValidProductSlug } from "@/lib/catalog";
import { getFreeBook, readFreeSession } from "@/lib/browser-demo";

export function FreeEditor({ slug }: { slug: string }) {
  return (
    <BrowserOnly>
      <FreeEditorContent slug={slug} />
    </BrowserOnly>
  );
}

function FreeEditorContent({ slug }: { slug: string }) {
  const [bookId] = useState(() => new URLSearchParams(window.location.search).get("bookId"));

  if (!isValidProductSlug(slug)) {
    return (
      <div className="layout-container py-16">
        <p>Такого подарка нет.</p>
      </div>
    );
  }

  const stored = bookId ? getFreeBook(bookId) : null;
  const session = readFreeSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2E9]">
      <SiteHeader accountLabel={session?.name || "Кабинет"} />
      <main className="flex-1">
        <EditorWizard
          freeMode
          initialSlug={slug}
          initialUser={
            session
              ? { id: session.id, email: session.email, name: session.name }
              : null
          }
          existingBook={
            stored
              ? {
                  id: stored.id,
                  content: stored.content,
                  photos: stored.photos,
                  editToken: "free",
                }
              : null
          }
        />
      </main>
      <SiteFooter />
    </div>
  );
}
