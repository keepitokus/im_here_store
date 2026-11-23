import Image from "next/image";
import Link from "next/link";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";

const book = DEMO_SAMPLE_BOOKS["love-story"];

export function HeroBook() {
  return (
    <section className="hero-opening order-1" aria-label="Книга «Наша история»">
      <div className="hero-spread">
        <div className="hero-photo">
          <Image src={book.coverImage} alt={book.coverImageAlt} fill priority sizes="(min-width: 1200px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="hero-story">
          <p className="hero-kicker">«Наша история» · Пример книги</p>
          <h1 tabIndex={-1} className="hero-heading">{book.content.coverTitle}</h1>
          <p className="hero-subtitle">{book.content.coverSubtitle}</p>
          <p className="hero-text">{book.content.answers.howWeMet}</p>
          <div className="hero-links">
            <Link href="/demo/love-story">Листать эту книгу целиком</Link>
            <Link href="/catalog">Выбрать подарок</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroBookIntro() {
  return (
    <section className="hero-cover-wrap" aria-label="Вступление. Книга «Наша история»">
      <div className="hero-intro-backdrop" aria-hidden="true" />
      <div className="hero-intro-camera">
        <div className="hero-book-stage">
          <div className="hero-paper" aria-hidden="true">
            <div className="hero-paper-content">
              <span>Наша история</span>
              <span className="hero-paper-title">{book.content.coverTitle}</span>
              <span>{book.content.coverSubtitle}</span>
            </div>
          </div>
          <div className="hero-spine" aria-hidden="true" />
          <button type="button" className="hero-cover" data-hero-open aria-label="Открыть книгу «Наша история»">
            <span className="hero-cover-front">
              <span className="hero-cover-imprint">Я здесь</span>
              <span className="hero-cover-title">Когда слова<br />важнее подарка</span>
              <span className="hero-cover-edition">Наша история</span>
            </span>
            <span className="hero-cover-back" aria-hidden="true">
              <span className="hero-cover-photo"><Image src={book.coverImage} alt="" fill loading="eager" sizes="(max-width: 600px) 80vw, 420px" className="object-cover" /></span>
            </span>
          </button>
        </div>
      </div>
      <button type="button" className="hero-open-button" data-hero-open>
        <span className="hero-open-medallion" aria-hidden="true">
          <span className="hero-open-arrow" />
        </span>
        <span>Открыть книгу</span>
      </button>
    </section>
  );
}
