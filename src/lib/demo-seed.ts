import { getDb } from "./db";
import {
  users,
  books,
  chapters,
  timelineEvents,
  mediaAssets,
  orders,
  payments,
  subscriptionsOrEntitlements,
} from "./db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { BookContentJsonV1 } from "./book-schema";

export const DEMO_CUSTOMER_EMAIL = "demo@ya-zdes.ru";
export const DEMO_ADMIN_EMAIL = "admin@ya-zdes.ru";

const seededDbInstances = new WeakSet<object>();

export function ensureDemoSeed() {
  const db = getDb();
  if (seededDbInstances.has(db)) {
    return;
  }
  const existingDemoUser = db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_CUSTOMER_EMAIL))
    .get();

  if (existingDemoUser) {
    // Обновляем старые SVG-заглушки в демо-книгах на реальные фотографии один раз на инстанс БД
    db.update(mediaAssets)
      .set({
        mimeType: "image/webp",
        dataUrl: "/images/books/baby-1-cover.webp",
      })
      .where(eq(mediaAssets.id, "med_demo_fy_1"))
      .run();
    db.update(mediaAssets)
      .set({
        mimeType: "image/webp",
        dataUrl: "/images/books/baby-5-steps.webp",
      })
      .where(eq(mediaAssets.id, "med_demo_fy_2"))
      .run();
    db.update(mediaAssets)
      .set({
        mimeType: "image/webp",
        dataUrl: "/images/books/love-1-cover.webp",
      })
      .where(eq(mediaAssets.id, "med_demo_ls_1"))
      .run();
    seededDbInstances.add(db);
    return;
  }

  const now = new Date("2026-10-26T12:00:00.000Z").toISOString();
  const demoUserId = "usr_demo_customer";
  const adminUserId = "usr_demo_admin";

  db.insert(users)
    .values([
      {
        id: demoUserId,
        email: DEMO_CUSTOMER_EMAIL,
        name: "Анна Морозова",
        role: "customer",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: adminUserId,
        email: DEMO_ADMIN_EMAIL,
        name: "Администратор «Я здесь»",
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .run();

  // 1. Опубликованная книга «Мой первый год» (доступно продление 990 ₽)
  const firstYearBookId = "book_demo_first_year";
  const firstYearExpires = new Date("2026-11-18T12:00:00.000Z").toISOString(); // скоро истекает (для демонстрации уведомления и продления)
  const firstYearGrace = new Date("2027-02-16T12:00:00.000Z").toISOString();

  const firstYearContent: BookContentJsonV1 = {
    schemaVersion: 1,
    productSlug: "first-year",
    coverTitle: "Лев · Наш первый год",
    coverSubtitle: "Двенадцать месяцев света, улыбок и первых открытий",
    dedication: "Нашему маленькому исследователю от мамы Анны и папы Михаила",
    themeId: "milky-pastel-sage",
    answers: {
      babyName: "Лев",
      birthDate: "18 ноября 2025",
      birthMetrics: "3 520 г · 53 см",
      firstAchievements:
        "В 6 недель подарил нам первую осознанную улыбку утром у окна. В 4 месяца уверенно перевернулся на животик, в 7 месяцев пополз за рыжим котом, а в 11 месяцев сделал три самостоятельных шага от дивана к папиным рукам.",
      firstWords:
        "«Ма-ма», «Ба-ба», восторженное «Бух!», когда падает кубик, и нежное «Агу-у» перед сном.",
      monthsHighlights:
        "1 мес — сонное царство и запах молока; 3 мес — смеётся в голос; 6 мес — первая ложка кабачка и брокколи; 9 мес — обожает стучать деревянной ложкой; 12 мес — задуваем первую свечку в кругу семьи!",
      letterToBaby:
        "Любимый Лёвушка, когда ты вырастешь и откроешь эту книгу, мы хотим, чтобы ты почувствовал, каким долгожданным и светлым чудом ты вошёл в нашу жизнь. Мы всегда рядом. Я здесь.",
    },
    chapters: [
      {
        id: "ch-fy-1",
        title: "Месяц 0 · День, когда зацвёл ноябрь",
        body: "За окном шёл первый пушистый снег, а в палате было так тихо и тепло. Когда ты впервые сжал мамин палец крошечной ладошкой, время будто остановилось.",
        promptKey: "ch-month-0",
      },
      {
        id: "ch-fy-2",
        title: "6 месяцев · Маленький исследователь",
        body: "Твоя любимая игрушка — деревянный жираф и связка шуршащих страниц. Каждое утро начинается с улыбки во весь беззубый рот.",
        promptKey: "ch-month-6",
      },
      {
        id: "ch-fy-3",
        title: "12 месяцев · Целый год счастья",
        body: "Ты уже уверенно топаешь по комнате, танцуешь под любую мелодию и обнимаешь нас так крепко, как только умеешь.",
        promptKey: "ch-month-12",
      },
    ],
    timeline: [
      {
        id: "tl-fy-1",
        eventDate: "2025-11-18",
        dateLabel: "18 ноября 2025",
        title: "Привет, мир!",
        description: "Рождение Льва: 3 520 г, 53 см. Первая встреча с мамой и папой.",
      },
      {
        id: "tl-fy-2",
        eventDate: "2026-01-02",
        dateLabel: "2 января 2026 · 1,5 месяца",
        title: "Первая осознанная улыбка",
        description: "Улыбнулся огонькам на новогодней ёлке и маминому голосу.",
      },
      {
        id: "tl-fy-3",
        eventDate: "2026-05-18",
        dateLabel: "18 мая 2026 · 6 месяцев",
        title: "Полгодика и первый прикорм",
        description: "Сидит с поддержкой, пробует печёное яблоко и смеётся над мыльными пузырями.",
      },
      {
        id: "tl-fy-4",
        eventDate: "2026-10-10",
        dateLabel: "10 октября 2026 · 11 месяцев",
        title: "Первые самостоятельные шаги",
        description: "Три смелых шага через всю гостиную прямо в объятия!",
      },
    ],
    favoriteMediaId: "med_demo_fy_1",
    finalLetterTitle: "Письмо нашему сыну в будущее",
    finalLetterBody:
      "Любимый Лёвушка, когда ты вырастешь и откроешь эту книгу, мы хотим, чтобы ты почувствовал, каким долгожданным и светлым чудом ты вошёл в нашу жизнь. Иди по миру смело, а наш дом всегда будет твоей тихой гаванью. Я здесь.",
    pinEnabled: false,
  };

  db.insert(books)
    .values({
      id: firstYearBookId,
      ownerId: demoUserId,
      productSlug: "first-year",
      title: "Лев · Наш первый год",
      publicSlug: "lev-first-year-demo7x9k",
      editTokenHash: crypto.createHash("sha256").update("demo-edit-token-fy").digest("hex"),
      theme: "milky-pastel-sage",
      contentJson: JSON.stringify(firstYearContent),
      status: "published",
      publishedAt: "2025-11-18T12:00:00.000Z",
      expiresAt: firstYearExpires,
      graceUntil: firstYearGrace,
      pinHash: null,
      createdAt: "2025-11-18T11:30:00.000Z",
      updatedAt: now,
    })
    .run();

  db.insert(mediaAssets)
    .values([
      {
        id: "med_demo_fy_1",
        bookId: firstYearBookId,
        ownerId: demoUserId,
        storageKey: "demo/baby-1-cover.webp",
        mimeType: "image/webp",
        sizeBytes: 152000,
        width: 1400,
        height: 1050,
        caption: "Первые дни дома в тёплом пледе",
        altText: "Новорождённый малыш Лев в молочном пледе на руках у мамы и папы",
        sortOrder: 0,
        isFavorite: true,
        dataUrl: "/images/books/baby-1-cover.webp",
        createdAt: now,
      },
      {
        id: "med_demo_fy_2",
        bookId: firstYearBookId,
        ownerId: demoUserId,
        storageKey: "demo/baby-5-steps.webp",
        mimeType: "image/webp",
        sizeBytes: 70000,
        width: 1400,
        height: 1050,
        caption: "Первые шаги в гостиной в 11 месяцев",
        altText: "Малыш Лев делает первые самостоятельные шаги к папиным рукам",
        sortOrder: 1,
        isFavorite: false,
        dataUrl: "/images/books/baby-5-steps.webp",
        createdAt: now,
      },
    ])
    .run();

  for (let i = 0; i < firstYearContent.chapters.length; i++) {
    const ch = firstYearContent.chapters[i];
    db.insert(chapters)
      .values({
        id: ch.id,
        bookId: firstYearBookId,
        sortOrder: i,
        title: ch.title,
        body: ch.body,
        promptKey: ch.promptKey ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  for (let i = 0; i < firstYearContent.timeline.length; i++) {
    const tl = firstYearContent.timeline[i];
    db.insert(timelineEvents)
      .values({
        id: tl.id,
        bookId: firstYearBookId,
        sortOrder: i,
        eventDate: tl.eventDate ?? null,
        dateLabel: tl.dateLabel,
        title: tl.title,
        description: tl.description,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  const fyOrderId = "ord_demo_first_year_init";
  db.insert(orders)
    .values({
      id: fyOrderId,
      userId: demoUserId,
      bookId: firstYearBookId,
      productSlug: "first-year",
      orderType: "initial_purchase",
      amountKopecks: 499000,
      currency: "RUB",
      status: "fulfilled",
      customerEmail: DEMO_CUSTOMER_EMAIL,
      termsAcceptedAt: "2025-11-18T11:55:00.000Z",
      utmSource: "organic",
      publishAttempts: 1,
      createdAt: "2025-11-18T11:55:00.000Z",
      updatedAt: "2025-11-18T12:00:00.000Z",
    })
    .run();

  db.insert(payments)
    .values({
      id: "pay_demo_first_year_init",
      orderId: fyOrderId,
      provider: "yookassa",
      providerPaymentId: "yk_demo_20251118_001",
      amountKopecks: 499000,
      currency: "RUB",
      status: "succeeded",
      isDemo: true,
      confirmationUrl: "/orders/ord_demo_first_year_init/result",
      idempotencyKey: "idem_demo_fy_init",
      paidAt: "2025-11-18T12:00:00.000Z",
      createdAt: "2025-11-18T11:55:00.000Z",
      updatedAt: "2025-11-18T12:00:00.000Z",
    })
    .run();

  db.insert(subscriptionsOrEntitlements)
    .values({
      id: "ent_demo_first_year",
      bookId: firstYearBookId,
      ownerId: demoUserId,
      productSlug: "first-year",
      status: "active",
      startsAt: "2025-11-18T12:00:00.000Z",
      expiresAt: firstYearExpires,
      graceUntil: firstYearGrace,
      autoRenewAllowed: false,
      warn30SentAt: "2026-10-19T09:00:00.000Z",
      createdAt: "2025-11-18T12:00:00.000Z",
      updatedAt: now,
    })
    .run();

  // 2. Опубликованная книга «Наша история» (4 990 ₽, без продления в MVP)
  const loveBookId = "book_demo_love_story";
  const loveExpires = new Date("2027-08-14T12:00:00.000Z").toISOString();
  const loveGrace = new Date("2027-11-12T12:00:00.000Z").toISOString();

  const loveContent: BookContentJsonV1 = {
    schemaVersion: 1,
    productSlug: "love-story",
    coverTitle: "Анна и Михаил",
    coverSubtitle: "Пять осеней, сотни утренних кофе и одна большая история",
    dedication: "К нашей пятой годовщине · 14 сентября",
    themeId: "rose-bordeaux",
    answers: {
      partnerNames: "Анна и Михаил",
      meetingDate: "14 сентября 2021",
      occasionNote: "К нашей пятой годовщине",
      howWeMet:
        "Мы столкнулись у полки с альбомами по архитектуре в маленьком книжном на Малой Бронной. Оба тянулись к одному и тому же изданию, а через полчаса уже пили фильтр-кофе за соседним столиком.",
      firstDate:
        "Внезапный сентябрьский ливень застал нас посреди Нескучного сада. Мы промокли до нитки, грелись облепиховым чаем и проговорили до самого закрытия веранды.",
      favoritePlace: "Скамейка у Андреевского моста на закате и маленькая пекарня у дома",
      personalConfession:
        "Рядом с тобой даже самый шумный город становится уютным домом. Спасибо за каждое утро, за твоё спокойствие и за то, как ты умеешь слышать между строк. Я здесь — сегодня и всегда.",
    },
    chapters: [
      {
        id: "ch-ls-1",
        title: "С чего всё началось",
        body: "Ты показался мне человеком, у которого всё расписано по минутам, но ради нашего разговора отменил вечернюю встречу и пошёл со мной пешком через полгорода.",
        promptKey: "ch-meeting",
      },
      {
        id: "ch-ls-2",
        title: "Наши маленькие ритуалы",
        body: "Воскресные завтраки без телефонов, бумажные открытки из каждого нового города и плейлист для ночных поездок по трассе.",
        promptKey: "ch-rituals",
      },
    ],
    timeline: [
      {
        id: "tl-ls-1",
        eventDate: "2021-09-14",
        dateLabel: "14 сентября 2021",
        title: "Книжный на Малой Бронной",
        description: "Одна книга на двоих и четыре часа разговоров взахлёб.",
      },
      {
        id: "tl-ls-2",
        eventDate: "2022-05-01",
        dateLabel: "Май 2022",
        title: "Первое путешествие вдвоём",
        description: "Утренний поезд в Выборг, запах сосен и залива.",
      },
      {
        id: "tl-ls-3",
        eventDate: "2023-10-20",
        dateLabel: "Октябрь 2023",
        title: "Ключи от нашей первой квартиры",
        description: "Ужин на картонных коробках при свечах в пустой гостиной.",
      },
      {
        id: "tl-ls-4",
        eventDate: null,
        dateLabel: "Той самой снежной зимой",
        title: "Сказали друг другу «Да»",
        description: "На вершине холма под снегопадом, когда вокруг не было ни души.",
      },
    ],
    favoriteMediaId: "med_demo_ls_1",
    finalLetterTitle: "Моё признание тебе",
    finalLetterBody:
      "Рядом с тобой даже самый шумный город становится уютным домом. Спасибо за каждое утро, за твоё спокойствие и за то, как ты умеешь слышать между строк. Я здесь — сегодня и всегда.",
    pinEnabled: false,
  };

  db.insert(books)
    .values({
      id: loveBookId,
      ownerId: demoUserId,
      productSlug: "love-story",
      title: "Анна и Михаил · Наша история",
      publicSlug: "anna-mikhail-story-demo4p2m",
      editTokenHash: crypto.createHash("sha256").update("demo-edit-token-ls").digest("hex"),
      theme: "rose-bordeaux",
      contentJson: JSON.stringify(loveContent),
      status: "published",
      publishedAt: "2026-08-14T12:00:00.000Z",
      expiresAt: loveExpires,
      graceUntil: loveGrace,
      pinHash: null,
      createdAt: "2026-08-14T11:20:00.000Z",
      updatedAt: now,
    })
    .run();

  db.insert(mediaAssets)
    .values([
      {
        id: "med_demo_ls_1",
        bookId: loveBookId,
        ownerId: demoUserId,
        storageKey: "demo/love-1-cover.webp",
        mimeType: "image/webp",
        sizeBytes: 77000,
        width: 1400,
        height: 1050,
        caption: "Тот самый сентябрьский вечер на набережной",
        altText: "Влюблённая пара Анна и Михаил обнимаются на старом мосту",
        sortOrder: 0,
        isFavorite: true,
        dataUrl: "/images/books/love-1-cover.webp",
        createdAt: now,
      },
    ])
    .run();

  const lsOrderId = "ord_demo_love_story_init";
  db.insert(orders)
    .values({
      id: lsOrderId,
      userId: demoUserId,
      bookId: loveBookId,
      productSlug: "love-story",
      orderType: "initial_purchase",
      amountKopecks: 499000,
      currency: "RUB",
      status: "fulfilled",
      customerEmail: DEMO_CUSTOMER_EMAIL,
      termsAcceptedAt: "2026-08-14T11:55:00.000Z",
      utmSource: "telegram",
      utmMedium: "cpc",
      utmCampaign: "anniversary_autumn",
      publishAttempts: 1,
      createdAt: "2026-08-14T11:55:00.000Z",
      updatedAt: "2026-08-14T12:00:00.000Z",
    })
    .run();

  db.insert(payments)
    .values({
      id: "pay_demo_love_story_init",
      orderId: lsOrderId,
      provider: "yookassa",
      providerPaymentId: "yk_demo_20260814_002",
      amountKopecks: 499000,
      currency: "RUB",
      status: "succeeded",
      isDemo: true,
      confirmationUrl: "/orders/ord_demo_love_story_init/result",
      idempotencyKey: "idem_demo_ls_init",
      paidAt: "2026-08-14T12:00:00.000Z",
      createdAt: "2026-08-14T11:55:00.000Z",
      updatedAt: "2026-08-14T12:00:00.000Z",
    })
    .run();

  db.insert(subscriptionsOrEntitlements)
    .values({
      id: "ent_demo_love_story",
      bookId: loveBookId,
      ownerId: demoUserId,
      productSlug: "love-story",
      status: "active",
      startsAt: "2026-08-14T12:00:00.000Z",
      expiresAt: loveExpires,
      graceUntil: loveGrace,
      autoRenewAllowed: false,
      createdAt: "2026-08-14T12:00:00.000Z",
      updatedAt: now,
    })
    .run();

  seededDbInstances.add(db);
}
