import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { EDITORIAL_PRODUCT_CARDS } from "@/components/product-card";
import { ProductCover } from "@/components/product-cover/ProductCover";
import { CardCarousel } from "../CardCarousel/CardCarousel";
import type { PricingItem } from "./Pricing.types";
import styles from "./Pricing.module.css";

const PRICING_ITEMS: readonly PricingItem[] = [
  {
    slug: "mother-thanks",
    title: "«Мама, спасибо»",
    subtitle: "Книга благодарности маме с семейным фотоархивом и письмом",
    price: "5 990 ₽",
    duration: "12 месяцев доступа по приватной ссылке",
    note: "Архив фото и текстов включён",
  },
  {
    slug: "love-story",
    title: "«Наша история»",
    subtitle: "Романтическое издание для пары: знакомство, свидания, таймлайн и признание",
    price: "4 990 ₽",
    duration: "12 месяцев доступа по приватной ссылке",
    note: "Архив фото и текстов включён",
  },
  {
    slug: "your-day",
    title: "«Твой день»",
    subtitle: "Персональный праздничный журнал ко дню рождения или юбилею близкого человека",
    price: "5 990 ₽",
    duration: "12 месяцев доступа по приватной ссылке",
    note: "Архив фото и текстов включён",
  },
  {
    slug: "first-year",
    title: "«Мой первый год»",
    subtitle: "Приватная хроника малыша от рождения до 12 месяцев: достижения, слова и фото",
    price: "4 990 ₽",
    duration: "12 месяцев размещения и обновления",
    note: "Продление по желанию — 990 ₽ в год",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className={styles.root} aria-labelledby="pricing-title">
      <div className={"layout-container " + styles.layout}>
        <div className={styles.heading}>
          <p className={styles.label}>
            Честные условия и фиксированные цены
          </p>
          <h2 id="pricing-title" className={styles.title}>
            Прозрачная стоимость без скрытых подписок
          </h2>
          <p className={styles.description}>
            Вы платите один раз при публикации готовой книги. Предпросмотр
            до оплаты бесплатен.
          </p>
        </div>

        <CardCarousel
          desktopColumns={2}
          previousLabel="Предыдущее издание"
          nextLabel="Следующее издание"
          trackClassName={styles.track}
        >
          {PRICING_ITEMS.map((item) => {
            const cover = EDITORIAL_PRODUCT_CARDS[item.slug];
            return (
              <article className={"group " + styles.card + " " + cover.paperTone} key={item.slug}>
                <div className={styles.summary}>
                  <span className={styles.badge + " " + cover.accentBadge}>
                    {cover.occasionTag}
                  </span>
                  <h3 className={styles.cardTitle}>
                    {item.title}
                  </h3>
                  <p className={styles.cardDescription}>
                    {item.subtitle}
                  </p>
                </div>

                <ProductCover
                  image={cover.scenePhoto}
                  alt={cover.sceneAlt}
                  title={cover.coverMiniTitle}
                  spineClassName={cover.spineColor}
                />

                <div className={styles.details}>
                  <ul className={styles.terms} role="list">
                    <li className={styles.term}>
                      <CheckCircle2 className={styles.check} aria-hidden="true" />
                      <span>{item.duration}</span>
                    </li>
                    <li className={styles.term}>
                      <CheckCircle2 className={styles.check} aria-hidden="true" />
                      <span>{item.note}</span>
                    </li>
                  </ul>

                  <footer className={styles.cardFooter}>
                    <dl className={styles.priceGroup}>
                      <dt className={styles.priceLabel}>Стоимость книги</dt>
                      <dd className={styles.price}>{item.price}</dd>
                    </dl>
                    <Link href={`/create/${item.slug}`} className={styles.createLink + " " + cover.buttonBg}>
                      Создать книгу <ArrowRight className={styles.arrow} aria-hidden="true" />
                    </Link>
                  </footer>
                </div>
              </article>
            );
          })}
        </CardCarousel>
      </div>
    </section>
  );
}
