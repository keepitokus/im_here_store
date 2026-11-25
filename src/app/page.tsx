import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { BookIntro } from "@/components/home-page/BookIntro/BookIntro";
import { HomeHero } from "@/components/home-page/HomeHero/HomeHero";
import { LoveStoryGallery } from "@/components/home-page/LoveStoryGallery/LoveStoryGallery";
import { BookExamples } from "@/components/home-page/BookExamples/BookExamples";
import { HowItWorks } from "@/components/home-page/HowItWorks/HowItWorks";
import { Pricing } from "@/components/home-page/Pricing/Pricing";
import { ReadingStory } from "@/components/home-page/ReadingStory/ReadingStory";
import { PurchaseFaq } from "@/components/home-page/PurchaseFaq/PurchaseFaq";
import { ClosingCta } from "@/components/home-page/ClosingCta/ClosingCta";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <BookIntro />
      <div className={styles.shell} data-home-page>
        <SiteHeader />
        <main className={styles.main}>
          <noscript><span className={styles.noScript} hidden /></noscript>
          <HomeHero />
          <LoveStoryGallery />
          <BookExamples />
          <HowItWorks />
          <Pricing />
          <ReadingStory />
          <PurchaseFaq />
          <ClosingCta />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
