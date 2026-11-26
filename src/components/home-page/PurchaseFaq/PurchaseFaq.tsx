import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import styles from "./PurchaseFaq.module.css";

export function PurchaseFaq() {
  return (
    <section id="faq" className={styles.root}>
      <div className="layout-container">
        <div className={styles.content}>
          <div className={styles.heading}>
            <p className={styles.label}>
              Ответы на важные вопросы
            </p>
            <h2 className={styles.title}>
              Частые вопросы перед покупкой
            </h2>
          </div>

          <Accordion
            type="single"
            collapsible
            className={styles.accordion}
          >
            <AccordionItem value="a">
              <AccordionTrigger>
                Это цифровая или печатная книга?
              </AccordionTrigger>
              <AccordionContent>
                Это интерактивная цифровая книга: получатель открывает её по
                приватной ссылке или QR-коду с любого телефона, планшета или
                компьютера. Бумажный тираж не печатается, поэтому книгу можно
                создать и подарить в тот же день.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>
                Можно ли увидеть книгу до оплаты и отредактировать позже?
              </AccordionTrigger>
              <AccordionContent>
                Да. Вы собираете книгу в пошаговом редакторе и бесплатно
                листаете полный предпросмотр до оплаты. После покупки вы
                можете в любой момент вернуться в личный кабинет и поправить
                тексты или подписи.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>
                Кто сможет открыть мою книгу и защищены ли фотографии?
              </AccordionTrigger>
              <AccordionContent>
                Каждая опубликованная книга получает уникальный
                непредсказуемый адрес и закрыта от поисковых систем (
                <code>noindex</code>). Дополнительно вы можете установить
                защитный PIN-код из 4–8 цифр, чтобы открыть книгу мог только
                ваш близкий человек.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="d">
              <AccordionTrigger>
                Сколько фотографий можно загрузить и что будет через год?
              </AccordionTrigger>
              <AccordionContent>
                В книгу можно загрузить до 30 фотографий (JPEG, PNG или WebP
                до 15 МБ каждая). Каждая книга размещается на 12 месяцев. Для
                издания «Мой первый год» доступно добровольное ручное
                продление за 990 ₽/год (с льготным хранением 90 дней и
                напоминаниями за 30, 7 и 1 день). Для всех книг в личном
                кабинете всегда доступно бесплатное скачивание полного архива
                ваших материалов.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
