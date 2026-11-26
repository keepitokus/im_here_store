import Image from "next/image";
import type { BookCreationStep } from "./HowItWorks.types";
import styles from "./HowItWorks.module.css";

const STEPS: readonly BookCreationStep[] = [
  {
    num: "Шаг 01",
    title: "Выберите историю",
    text: "Четыре готовых сценария со своей палитрой, структурой глав и подсказками. Регистрация для старта не нужна.",
    img: "/images/books/mom-4-home.webp",
    alt: "Тёплый семейный момент на кухне",
  },
  {
    num: "Шаг 02",
    title: "Добавьте фотографии и слова",
    text: "Загрузите до 30 снимков с телефона и ответьте на короткие вопросы. Черновик автоматически сохраняется.",
    img: "/images/books/love-5-home.webp",
    alt: "Пара в новой квартире среди огоньков",
  },
  {
    num: "Шаг 03",
    title: "Подарите по ссылке или QR",
    text: "Пролистайте полный предпросмотр до оплаты, оплатите заказ и мгновенно отправьте ссылку или QR-код близкому человеку.",
    img: "/images/books/day-5-details.webp",
    alt: "Праздничный конверт с сургучной печатью и бокалы",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className={styles.root}
    >
      <div className={"layout-container " + styles.layout}>
        <div className={styles.heading}>
          <p className={styles.label}>
            Понятный путь без дизайнера
          </p>
          <h2 className={styles.title}>
            Три шага до готового подарка
          </h2>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li
              key={step.num}
              className={"paper-shadow " + styles.step}
            >
              <div className={styles.photo}>
                <Image
                  src={step.img}
                  alt={step.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 380px"
                  className={styles.image}
                />
                <span className={styles.number}>
                  {step.num}
                </span>
              </div>
              <div className={styles.stepContent}>
                <div className={styles.copy}>
                  <h3 className={styles.stepTitle}>
                    {step.title}
                  </h3>
                  <p className={styles.stepDescription}>
                    {step.text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
