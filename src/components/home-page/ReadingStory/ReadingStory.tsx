import Image from "next/image";
import Link from "next/link";
import styles from "./ReadingStory.module.css";

export function ReadingStory() {
  return (
    <section className={styles.root} aria-labelledby="reading-story-title">
      <div className="layout-container">
        <h2 id="reading-story-title" className={styles.sectionTitle}>
          Истории, к которым возвращаются
        </h2>
        <div className={"paper-shadow " + styles.panel}>
          <div className={styles.grid}>
            <div className={styles.photo}>
              <Image
                src="/images/books/story-family-reading.webp"
                alt="Семья вечером на диване вместе рассматривает цифровую фотокнигу на планшете и телефоне"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 580px"
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>
                Однажды вы откроете эту книгу снова
              </h3>
              <p className={styles.description}>
                Через месяц или тихим вечером, когда захочется вспомнить.
                Книга открывается по приватной ссылке на любом телефоне или
                планшете, а полный архив фотографий и текстов всегда можно
                сохранить себе.
              </p>
              <div className={styles.actions}>
                <Link
                  href="/catalog"
                  className={styles.catalogLink}
                >
                  Выбрать подарок
                </Link>
                <Link
                  href="/demo/mother-thanks"
                  className={styles.exampleLink}
                >
                  Смотреть демо
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
