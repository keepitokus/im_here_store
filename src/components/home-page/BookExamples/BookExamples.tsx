import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CardCarousel } from "../CardCarousel/CardCarousel";
import type { BookExample } from "./BookExamples.types";
import styles from "./BookExamples.module.css";

const EXAMPLES: readonly BookExample[] = [
  {
    img: "/images/books/baby-3-smile.webp",
    alt: "Первая радостная улыбка трёхмесячного малыша",
    tag: "Из примера «Мой первый год»",
    title: "Первая осознанная улыбка и первые шаги",
    text: "Хроника взросления малыша от 0 до 12 месяцев, которую можно дополнять весь год.",
    href: "/demo/first-year",
  },
  {
    img: "/images/books/day-4-moments.webp",
    alt: "Друзья на вершине горного перевала на золотом рассвете",
    tag: "Из примера «Твой день»",
    title: "Рассветы, путешествия и слова друзей",
    text: "Праздничное издание ко дню рождения с лучшими совместными историями и тостом.",
    href: "/demo/your-day",
  },
  {
    img: "/images/books/mom-2-childhood.webp",
    alt: "Мама ведёт маленькую дочку с белыми бантами в первый класс",
    tag: "Из примера «Мама, спасибо»",
    title: "1 сентября, белые банты и мамина рука",
    text: "Детские воспоминания и благодарность за тепло родного дома, собранные в светлую книгу для мамы.",
    href: "/demo/mother-thanks",
  },
];

export function BookExamples() {
  return (
    <section id="book-examples" className={styles.root} aria-labelledby="book-examples-title">
      <div className={"layout-container " + styles.layout}>
        <div className={styles.heading}>
          <p className={styles.label}>
            Эстетика коллекционной фотокниги
          </p>
          <h2 className={styles.title} id="book-examples-title">
            Самые дорогие моменты не должны теряться среди тысяч фотографий
          </h2>
          <p className={styles.description}>
            В памяти телефона хранятся тысячи случайных снимков, которые
            редко открывают. Отобранные 15–30 фотографий с вашими подписями
            и личным письмом становятся книгой, к которой возвращаются.
          </p>
        </div>

        <CardCarousel desktopColumns={3} previousLabel="Предыдущий пример" nextLabel="Следующий пример">
          {EXAMPLES.map((card) => (
            <article
              key={card.title}
              className={"paper-shadow " + styles.card}
            >
              <div>
                <div className={styles.photo}>
                  <Image
                    src={card.img}
                    alt={card.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1440px) 380px, (min-width: 1024px) and (hover: hover) and (pointer: fine) 380px, (min-width: 1240px) and (min-height: 600px) 560px, (min-width: 640px) and (min-height: 600px) 50vw, 100vw"
                    className={styles.image}
                  />
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>
                    {card.tag}
                  </span>
                  <h3 className={styles.cardTitle}>
                    {card.title}
                  </h3>
                  <p className={styles.cardText}>
                    {card.text}
                  </p>
                </div>
              </div>
              <div className={styles.cardActions}>
                <Link
                  href={card.href}
                  className={styles.link}
                >
                  <span>Открыть этот пример</span>
                  <ArrowRight className={styles.arrow} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </CardCarousel>
      </div>
    </section>
  );
}
