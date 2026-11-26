import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowRight } from "lucide-react";
import styles from "./ClosingCta.module.css";

export function ClosingCta() {
  return (
    <section className={styles.root}>
      <div className={"layout-container " + styles.layout}>
        <div className={styles.logo}>
          <BrandLogo size="lg" variant="light" />
        </div>
        <h2 className={styles.title}>
          У каждого близкого человека есть история. Начните со своей.
        </h2>
        <p className={styles.description}>
          Выберите повод, посмотрите живой пример книги и соберите подарок,
          который сохранит ваши самые тёплые слова.
        </p>
        <div className={styles.actions}>
          <Link
            href="/catalog"
            className={styles.catalogLink}
          >
            <span className={styles.noWrap}>Выбрать подарок</span>
            <ArrowRight className={styles.arrow} />
          </Link>
          <Link
            href="/demo/love-story"
            className={styles.exampleLink}
          >
            Смотреть демо
          </Link>
        </div>
      </div>
    </section>
  );
}
