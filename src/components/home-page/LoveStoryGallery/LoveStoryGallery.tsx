import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./LoveStoryGallery.module.css";

export function LoveStoryGallery() {
  return (
    <section className={styles.root} aria-labelledby="love-story-gallery-title">
      <div className={"layout-container " + styles.layout}>
        <div className={styles.intro}>
          <p className={styles.label}>
            Не просто подарок · Ваша живая история
          </p>
          <h2 id="love-story-gallery-title" className={styles.title}>
            Помните, как всё начиналось?
          </h2>
          <p className={styles.lead}>
            Первая встреча, долгий разговор и место, которое стало только
            вашим. Мы собираем фотографии и короткие слова в книгу, которую
            хочется открыть снова.
          </p>
        </div>

        <div className={styles.details}>
          <p className={styles.note}>
            Вам не нужно писать длинные тексты или владеть дизайном —
            достаточно выбрать повод и ответить на бережные вопросы.
          </p>
          <Link href="/demo/love-story" className={styles.link}>
            <span>
              <span className={styles.linkTitle}>Пролистать пример «Наша&nbsp;история»</span>
              <span className={styles.linkMeta}>8 разворотов</span>
            </span>
            <ArrowRight className={styles.arrow} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.gallery}>
          <figure className={styles.mainFigure}>
            <div className={styles.mainPhoto}>
              <Image
                src="/images/books/love-2-first-date.webp"
                alt="Молодая пара на первом свидании в уютной книжной кофейне при свечах"
                fill
                loading="lazy"
                sizes="(min-width: 1240px) 648px, (min-width: 1024px) 55vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                className={styles.image}
              />
            </div>
            <figcaption className={styles.mainCaption}>
              «Две чашки кофе у дождливого окна и разговор, который изменил всё...» — разворот из книги «Наша история»
            </figcaption>
          </figure>

          <div className={styles.smallGallery}>
            <figure className={styles.smallFigure}>
              <div className={styles.smallPhoto}>
                <Image
                  src="/images/books/love-3-walk.webp"
                  alt="Осенняя прогулка пары по набережной"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1240px) 316px, (min-width: 1024px) 27vw, (min-width: 640px) calc(50vw - 40px), calc(50vw - 25px)"
                  className={styles.image}
                />
              </div>
              <figcaption className={styles.smallCaption}>
                Осенняя прогулка вдвоём
              </figcaption>
            </figure>

            <figure className={styles.smallFigure}>
              <div className={styles.smallPhoto}>
                <Image
                  src="/images/books/love-4-travel.webp"
                  alt="Первое путешествие пары к морю"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1240px) 316px, (min-width: 1024px) 27vw, (min-width: 640px) calc(50vw - 40px), calc(50vw - 25px)"
                  className={styles.image}
                />
              </div>
              <figcaption className={styles.smallCaption}>
                Первая поездка к Балтийскому морю
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
