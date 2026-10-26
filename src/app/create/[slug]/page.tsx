import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { EditorWizard } from "@/components/editor-wizard";
import { isValidProductSlug } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { assertBookOwnerOrEditToken, getBookWithRelations } from "@/lib/books";
import { ensureDemoSeed } from "@/lib/demo-seed";

export default async function CreateBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookId?: string; editToken?: string }>;
}) {
  ensureDemoSeed();
  const { slug } = await params;
  const { bookId, editToken } = await searchParams;

  if (!isValidProductSlug(slug)) {
    notFound();
  }

  const user = await getCurrentUser();
  let existingBook = null;

  if (bookId) {
    try {
      assertBookOwnerOrEditToken({
        bookId,
        userId: user?.id,
        editToken: editToken || null,
      });
      const full = getBookWithRelations(bookId);
      if (full) {
        existingBook = {
          id: full.book.id,
          content: full.content,
          photos: full.photos,
          editToken: editToken || null,
        };
      }
    } catch {
      // Если нет прав — не раскрываем чужую книгу
      existingBook = null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <EditorWizard
          initialSlug={slug}
          initialUser={
            user
              ? { id: user.id, email: user.email, name: user.name }
              : null
          }
          existingBook={existingBook}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
