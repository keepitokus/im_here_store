import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PRODUCTS_CATALOG } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { formatRublesFromKopecks } from "@/lib/utils";
import styles from "./HomeHero.module.css";

const book = DEMO_SAMPLE_BOOKS["love-story"];
const price = formatRublesFromKopecks(PRODUCTS_CATALOG["love-story"].initialPriceKopecks);

export function HomeHero() {
  return (
    <section className={styles.root} aria-labelledby="home-hero-title">
      <div className={"layout-container " + styles.layout}>
        <div className={styles.intro}>
          <p className={styles.label}>
            <Sparkles size={16} aria-hidden="true" />
            Цифровые книги-подарки для самых близких
          </p>
          <h1 id="home-hero-title" tabIndex={-1} className={styles.heading}>
            Есть истории, которые хочется подарить
          </h1>
          <p className={styles.description}>
            Соберите ваши фотографии и воспоминания в цифровую книгу о вашей истории любви.
            Подарите её по приватной ссылке или QR-коду.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/create/love-story" className={styles.createLink}>
            Создать книгу <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <p className={styles.freeNote}>Черновик и предпросмотр бесплатны</p>
        </div>

        <article className={styles.example}>
          <div className={styles.photo}>
            <Image
              src={book.coverImage}
              alt={book.coverImageAlt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1440px) 550px, (min-width: 1240px) and (hover: hover) and (pointer: fine) 550px, (min-width: 1024px) and (hover: hover) and (pointer: fine) 45vw, (min-width: 900px) and (min-height: 600px) and (orientation: landscape) and (pointer: coarse) 45vw, (min-width: 640px) and (min-height: 600px) 640px, (height < 600px) and (orientation: landscape) and (pointer: coarse) 480px, 100vw"
            />
          </div>
          <div className={styles.exampleContent}>
            <p className={styles.exampleLabel}>«Наша история» · Пример книги</p>
            <h2 className={styles.exampleTitle}>{book.content.coverTitle}</h2>
            <p className={styles.exampleQuote}>«{book.content.coverSubtitle}»</p>
            <Link href="/demo/love-story" className={styles.exampleLink}>
              Пролистать пример <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </article>

        <ul className={styles.terms}>
          <li><strong>От {price} за готовое издание</strong></li>
          <li>До 30 ваших фотографий</li>
          <li>12 месяцев доступа без автосписаний</li>
        </ul>
      </div>
    </section>
  );
}
