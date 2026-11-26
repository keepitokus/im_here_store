import Image from "next/image";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import styles from "./BookIntro.module.css";

const book = DEMO_SAMPLE_BOOKS["love-story"];

export function BookIntro() {
  return (
    <section className={styles.root} data-hero-intro aria-label="Вступление. Книга «Наша история»">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.camera}>
        <div className={styles.stage}>
          <div className={styles.paper} aria-hidden="true">
            <div className={styles.paperContent}>
              <span>Наша история</span>
              <span className={styles.paperTitle}>{book.content.coverTitle}</span>
              <span>{book.content.coverSubtitle}</span>
            </div>
          </div>
          <div className={styles.spine} aria-hidden="true" />
          <button type="button" className={styles.cover} data-hero-open aria-label="Открыть книгу «Наша история»">
            <span className={styles.coverFront}>
              <span className={styles.imprint}>Я здесь</span>
              <span className={styles.coverTitle}>Когда слова<br />важнее подарка</span>
              <span className={styles.coverEdition}>Наша история</span>
            </span>
            <span className={styles.coverBack} aria-hidden="true">
              <span className={styles.coverPhoto}>
                <Image
                  src={book.coverImage}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(max-width: 600px) 80vw, 420px"
                />
              </span>
            </span>
          </button>
        </div>
      </div>
      <button type="button" className={styles.openButton} data-hero-open>
        <span className={styles.medallion} aria-hidden="true">
          <span className={styles.arrow} />
        </span>
        <span>Открыть книгу</span>
      </button>
    </section>
  );
}
