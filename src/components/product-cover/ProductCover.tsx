import Image from "next/image";
import type { ProductCoverProps } from "./ProductCover.types";
import styles from "./ProductCover.module.css";

export function ProductCover({ image, alt, title, spineClassName, priority }: ProductCoverProps) {
  return (
    <figure className={styles.root}>
      <div className={styles.spine + " " + spineClassName} aria-hidden="true" />
      <div className={styles.spread}>
        <div className={styles.photo}>
          <Image
            src={image}
            alt={alt}
            fill
            preload={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(max-width: 768px) 100vw, 520px"
            className={styles.image}
          />
        </div>
        <figcaption className={styles.caption}>
          <span className={styles.title}>Обложка издания «{title}»</span>
          <span className={styles.composition}>До 30 фото · 6 глав</span>
        </figcaption>
      </div>
    </figure>
  );
}
