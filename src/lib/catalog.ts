import { EDITOR_COPY } from "@/lib/editor-copy";

export type ProductSlug =
  | "love-story"
  | "mother-thanks"
  | "your-day"
  | "first-year";

export interface ProductQuestionField {
  id: string;
  label: string;
  placeholder: string;
  helperText: string;
  /** Текст, который попадает в ответ только по явному нажатию «Подставить пример». */
  example: string;
  required?: boolean;
  type: "short" | "long" | "date" | "number";
  step: "basics" | "questions";
}

export interface ProductThemePreset {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  accentClass: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  mutedClass: string;
  swatchHex: [string, string, string];
}

export interface ProductCatalogItem {
  slug: ProductSlug;
  sku: ProductSlug;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  initialPriceKopecks: number;
  renewalPriceKopecks: number | null;
  hostingDays: number;
  gracePeriodDays: number;
  allowsRenewalInMvp: boolean;
  allowsContinuousUpdates: boolean;
  defaultPrivacyPrivate: boolean;
  paletteSummary: string;
  compositionSummary: string[];
  idealFor: string[];
  estimatedMinutes: string;
  seoDescription: string;
  themes: ProductThemePreset[];
  fields: ProductQuestionField[];
  chapterPrompts: {
    id: string;
    title: string;
    prompt: string;
    example: string;
    optional?: boolean;
  }[];
  hostingPolicyNote: string;
}

/**
 * НЕИЗМЕННЫЕ БАЗОВЫЕ ЦЕНЫ (ТЗ Раздел 2)
 * Хранятся и вычисляются исключительно на сервере в копейках.
 * Визуальная цена в клиенте никогда не определяет стоимость платежа.
 */
export const SERVER_PRICING_KOPECKS: Record<
  ProductSlug,
  { initial: number; renewal: number | null }
> = {
  "love-story": { initial: 499000, renewal: null },
  "mother-thanks": { initial: 599000, renewal: null },
  "your-day": { initial: 599000, renewal: null },
  "first-year": { initial: 499000, renewal: 99000 },
};

export const PRODUCTS_CATALOG: Record<ProductSlug, ProductCatalogItem> = {
  "love-story": {
    slug: "love-story",
    sku: "love-story",
    title: "«Наша история»",
    subtitle: "Книга о любви, первых встречах и моментах, которые знают только двое",
    tagline: "От случайного взгляда до сегодняшнего дня — в одном камерном издании",
    badge: "Для пары · Годовщина · Признание",
    initialPriceKopecks: 499000,
    renewalPriceKopecks: null,
    hostingDays: 365,
    gracePeriodDays: 90,
    allowsRenewalInMvp: false,
    allowsContinuousUpdates: false,
    defaultPrivacyPrivate: true,
    paletteSummary: "Rose, кремовый, пыльно-розовый, глубокий бордо",
    compositionSummary: [
      "Обложка с именами пары и знаковой датой",
      "Глава о знакомстве и первом свидании",
      "Интерактивный таймлайн 3–6 ключевых событий (с сортировкой по датам)",
      "Любимое место и главная совместная фотография",
      "Фотогалерея тёплых кадров с подписями",
      "Финальное личное признание в конверте",
    ],
    idealFor: [
      "Годовщина знакомства или свадьбы",
      "Подарок партнёру на 14 февраля или без повода",
      "Предложение руки и сердца или памятный сюрприз",
    ],
    estimatedMinutes: "10–12 минут",
    seoDescription:
      "Создайте интерактивную книгу «Наша история» из ваших фотографий, дат и личных воспоминаний. Готовый цифровой подарок с приватной ссылкой и QR-кодом за 10 минут.",
    hostingPolicyNote:
      "В стоимость включено 12 месяцев приватного размещения книги с момента оплаты и возможность скачать полный архив ваших материалов. Продление на следующий год в текущем MVP не продаётся — дальнейшие условия хранения будут предложены отдельно до окончания срока.",
    themes: [
      {
        id: "rose-bordeaux",
        name: "Пыльная роза и бордо",
        bgClass: "bg-[#FAF4F4]",
        cardClass: "bg-[#FFFDFC]",
        accentClass: "bg-[#6E2638] text-[#FAF4F4]",
        badgeClass: "bg-[#F3E1E4] text-[#6E2638]",
        borderClass: "border-[#E6CDD2]",
        textClass: "text-[#2B181D]",
        mutedClass: "text-[#7A5B63]",
        swatchHex: ["#FAF4F4", "#D8A7B1", "#6E2638"],
      },
      {
        id: "warm-editorial-ivory",
        name: "Тёплый кремовый шёлк",
        bgClass: "bg-[#FBF8F3]",
        cardClass: "bg-[#FFFFFF]",
        accentClass: "bg-[#803445] text-[#FBF8F3]",
        badgeClass: "bg-[#F2E6E6] text-[#803445]",
        borderClass: "border-[#E5D5D0]",
        textClass: "text-[#291F1E]",
        mutedClass: "text-[#786564]",
        swatchHex: ["#FBF8F3", "#E8CFC8", "#803445"],
      },
    ],
    fields: [
      question("love-story", "partnerNames", { required: true, type: "short", step: "basics" }),
      question("love-story", "meetingDate", { required: true, type: "short", step: "basics" }),
      question("love-story", "occasionNote", { required: false, type: "short", step: "basics" }),
      question("love-story", "howWeMet", { required: true, type: "long", step: "questions" }),
      question("love-story", "firstDate", { required: false, type: "long", step: "questions" }),
      question("love-story", "favoritePlace", { required: false, type: "short", step: "questions" }),
      question("love-story", "personalConfession", { required: true, type: "long", step: "questions" }),
    ],
    chapterPrompts: [
      {
        id: "ch-meeting",
        title: "С чего всё началось",
        prompt: "Какое первое впечатление оказалось обманчивым или самым точным?",
        example: "Ты показался мне невероятно серьёзным, пока не рассмеялся над моей шуткой про метро.",
      },
      {
        id: "ch-rituals",
        title: "Наши маленькие ритуалы",
        prompt: "Что делает ваши будни особенными?",
        example: "Субботние блинчики в полдень и споры о том, какой фильм включить вечером.",
        optional: true,
      },
    ],
  },

  "mother-thanks": {
    slug: "mother-thanks",
    sku: "mother-thanks",
    title: "«Мама, спасибо»",
    subtitle: "Трогательное издание о детстве, материнской заботе и словах, которые мы редко говорим вслух",
    tagline: "Светлая книга благодарности самому близкому человеку",
    badge: "Маме · День матери · День рождения мамы",
    initialPriceKopecks: 599000,
    renewalPriceKopecks: null,
    hostingDays: 365,
    gracePeriodDays: 90,
    allowsRenewalInMvp: false,
    allowsContinuousUpdates: false,
    defaultPrivacyPrivate: true,
    paletteSummary: "Тёплый кремовый, пастельно-синий, мягкий шалфейно-серый",
    compositionSummary: [
      "Именная обложка с обращением к маме",
      "Глава с ласковым детским прозвищем и ароматом дома",
      "Яркие воспоминания детства и семейные традиции",
      "Разворот «Чему ты меня научила» и слова благодарности",
      "Семейный фотоархив от старых снимков до сегодняшних дней",
      "Финальное письмо маме от всего сердца",
    ],
    idealFor: [
      "День рождения мамы или юбилей",
      "День матери или 8 Марта",
      "Тёплый подарок без повода, когда вы далеко друг от друга",
    ],
    estimatedMinutes: "12–15 минут",
    seoDescription:
      "Цифровая книга «Мама, спасибо» — персональный подарок маме с архивными фотографиями, детскими воспоминаниями и письмом благодарности.",
    hostingPolicyNote:
      "В стоимость включено 12 месяцев приватного размещения книги с момента оплаты и возможность скачать архив материалов в любой момент. Продление на следующий год в текущем MVP не продаётся — дальнейшие условия хранения будут предложены отдельно.",
    themes: [
      {
        id: "cream-pastel-blue",
        name: "Тёплый крем и пастельно-синий",
        bgClass: "bg-[#F8F7F2]",
        cardClass: "bg-[#FFFFFF]",
        accentClass: "bg-[#2C4A6B] text-[#F8F7F2]",
        badgeClass: "bg-[#E3ECF5] text-[#2C4A6B]",
        borderClass: "border-[#CFDCE8]",
        textClass: "text-[#1E2A38]",
        mutedClass: "text-[#5C6F84]",
        swatchHex: ["#F8F7F2", "#BDD2E4", "#2C4A6B"],
      },
      {
        id: "linen-sky",
        name: "Лён и утреннее небо",
        bgClass: "bg-[#FAF8F4]",
        cardClass: "bg-[#FFFEFC]",
        accentClass: "bg-[#38587A] text-[#FAF8F4]",
        badgeClass: "bg-[#E8F0F7] text-[#38587A]",
        borderClass: "border-[#D8E2EC]",
        textClass: "text-[#22303F]",
        mutedClass: "text-[#647587]",
        swatchHex: ["#FAF8F4", "#CFE0EE", "#38587A"],
      },
    ],
    fields: [
      question("mother-thanks", "motherName", { required: true, type: "short", step: "basics" }),
      question("mother-thanks", "authorName", { required: true, type: "short", step: "basics" }),
      question("mother-thanks", "childhoodNickname", { required: false, type: "short", step: "questions" }),
      question("mother-thanks", "vividMemory", { required: true, type: "long", step: "questions" }),
      question("mother-thanks", "whatSheTaught", { required: true, type: "long", step: "questions" }),
      question("mother-thanks", "gratitudeList", { required: true, type: "long", step: "questions" }),
      question("mother-thanks", "finalLetterToMom", { required: true, type: "long", step: "questions" }),
    ],
    chapterPrompts: [
      {
        id: "ch-home",
        title: "Ощущение дома",
        prompt: "С каким вкусом, звуком или запахом у вас ассоциируется мамин дом?",
        example: "Запах свежезаваренного чая с чабрецом и чистых накрахмаленных простыней.",
      },
      {
        id: "ch-support",
        title: "Невидимая опора",
        prompt: "Момент, когда мамины слова поддержали сильнее всего",
        example: "Когда я сомневалась перед переездом, ты просто сказала: «Попробуй, а дом никуда не денется».",
        optional: true,
      },
    ],
  },

  "your-day": {
    slug: "your-day",
    sku: "your-day",
    title: "«Твой день»",
    subtitle: "Праздничное издание ко дню рождения с лучшими моментами, теплом и причинами для гордости",
    tagline: "Вместо десятка разрозненных сообщений — книга, где именинник в центре внимания",
    badge: "День рождения · Юбилей · Другу или близкому",
    initialPriceKopecks: 599000,
    renewalPriceKopecks: null,
    hostingDays: 365,
    gracePeriodDays: 90,
    allowsRenewalInMvp: false,
    allowsContinuousUpdates: false,
    defaultPrivacyPrivate: true,
    paletteSummary: "Праздничный кремовый, благородное золото, тёплый графит",
    compositionSummary: [
      "Праздничная обложка с именем именинника и датой/возрастом (по желанию)",
      "Главное авторское поздравление",
      "Глава «Лучшие моменты» — кадры и истории, которые хочется пережить снова",
      "Раздел «За что мы тебя любим и ценим»",
      "Тёплые пожелания на новый год жизни и фотогалерея",
    ],
    idealFor: [
      "День рождения близкого друга, супруга, сестры или брата",
      "Юбилей 25, 30, 40, 50+ лет",
      "Подарок человеку, у которого «всё есть»",
    ],
    estimatedMinutes: "10–14 минут",
    seoDescription:
      "Подарочная цифровая книга «Твой день» на день рождения или юбилей: фотографии, лучшие истории, раздел «За что мы тебя любим» и персональный QR-код.",
    hostingPolicyNote:
      "В стоимость включено 12 месяцев приватного размещения книги с момента оплаты и скачивание архива материалов. Продление на следующий год в текущем MVP не предусмотрено — условия дальнейшего хранения будут предложены отдельно.",
    themes: [
      {
        id: "festive-cream-gold",
        name: "Праздничный крем и тёплое золото",
        bgClass: "bg-[#FCF9F2]",
        cardClass: "bg-[#FFFFFF]",
        accentClass: "bg-[#8A6421] text-[#FCF9F2]",
        badgeClass: "bg-[#F5E9CE] text-[#6E4E16]",
        borderClass: "border-[#E6D4AE]",
        textClass: "text-[#262015]",
        mutedClass: "text-[#75664B]",
        swatchHex: ["#FCF9F2", "#E2C285", "#8A6421"],
      },
      {
        id: "champagne-noir",
        name: "Шампань и благородный антрацит",
        bgClass: "bg-[#FAF7F0]",
        cardClass: "bg-[#FFFEFA]",
        accentClass: "bg-[#2C261E] text-[#F5E6C4]",
        badgeClass: "bg-[#EFE4CC] text-[#2C261E]",
        borderClass: "border-[#DFCFAF]",
        textClass: "text-[#211D17]",
        mutedClass: "text-[#6E6352]",
        swatchHex: ["#FAF7F0", "#D4B982", "#2C261E"],
      },
    ],
    fields: [
      question("your-day", "celebrantName", { required: true, type: "short", step: "basics" }),
      question("your-day", "celebrantAge", { required: false, type: "short", step: "basics" }),
      question("your-day", "fromWho", { required: true, type: "short", step: "basics" }),
      question("your-day", "mainGreeting", { required: true, type: "long", step: "questions" }),
      question("your-day", "bestMoments", { required: true, type: "long", step: "questions" }),
      question("your-day", "whyWeLoveYou", { required: true, type: "long", step: "questions" }),
      question("your-day", "wishesForFuture", { required: true, type: "long", step: "questions" }),
      question("your-day", "finalCongrats", { required: false, type: "long", step: "questions" }),
    ],
    chapterPrompts: [
      {
        id: "ch-superpower",
        title: "Твоя суперсила",
        prompt: "Что у именинника получается лучше, чем у кого-либо?",
        example: "Собирать вокруг себя самых разных людей и превращать любой вечер в праздник.",
      },
      {
        id: "ch-year-ahead",
        title: "Главное обещание этому году",
        prompt: "Что вы обязательно сделаете вместе в ближайшие 12 месяцев?",
        example: "Наконец-то выберемся на Белое море в июле.",
        optional: true,
      },
    ],
  },

  "first-year": {
    slug: "first-year",
    sku: "first-year",
    title: "«Мой первый год»",
    subtitle: "Нежная хроника первых 12 месяцев малыша: от выписки до первых шагов и слов",
    tagline: "Живой семейный альбом, который можно пополнять весь год и продлевать по желанию",
    badge: "0–12 месяцев · Рождение малыша · Первый годик",
    initialPriceKopecks: 499000,
    renewalPriceKopecks: 99000,
    hostingDays: 365,
    gracePeriodDays: 90,
    allowsRenewalInMvp: true,
    allowsContinuousUpdates: true,
    defaultPrivacyPrivate: true,
    paletteSummary: "Молочный, пастельно-оливковый, тёплый песочный и пудровый",
    compositionSummary: [
      "Приватная по умолчанию обложка с именем малыша и датой рождения",
      "Главы по месяцам «0–12 месяцев» (можно заполнять сразу или постепенно в течение года)",
      "Карточки достижений: первая улыбка, первый зубик, первые шаги",
      "Словарик первых слов и забавных звуков",
      "Необязательные метрики роста и веса по желанию родителей",
      "Письмо малышу в будущее от родителей",
    ],
    idealFor: [
      "Молодым родителям при рождении ребёнка",
      "На крестины или первый день рождения (1 годик)",
      "Для бабушек и дедушек, которые живут в другом городе",
    ],
    estimatedMinutes: "10–15 минут (с возможностью дописывать весь год)",
    seoDescription:
      "Цифровая книга «Мой первый год» — приватный альбом малыша от 0 до 12 месяцев. Первые достижения, слова, фото по месяцам. 4 990 ₽ за первый год, ручное продление 990 ₽/год без автосписаний.",
    hostingPolicyNote:
      "Первоначальная покупка 4 990 ₽ включает 12 месяцев размещения и обновления книги. По окончании года вы можете вручную продлить размещение за 990 ₽ за каждый последующий год (без скрытых подписок и автосписаний). После окончания оплаченного срока данные бережно хранятся ещё 90 дней с предупреждениями за 30, 7 и 1 день.",
    themes: [
      {
        id: "milky-pastel-sage",
        name: "Топлёное молоко и пастельный шалфей",
        bgClass: "bg-[#FAF8F3]",
        cardClass: "bg-[#FFFFFF]",
        accentClass: "bg-[#4A6151] text-[#FAF8F3]",
        badgeClass: "bg-[#E6EFE8] text-[#3B4F41]",
        borderClass: "border-[#D3E0D6]",
        textClass: "text-[#222B24]",
        mutedClass: "text-[#637367]",
        swatchHex: ["#FAF8F3", "#C8DACB", "#4A6151"],
      },
      {
        id: "soft-oat-peach",
        name: "Овсяный крем и нежный персик",
        bgClass: "bg-[#FCF9F5]",
        cardClass: "bg-[#FFFFFF]",
        accentClass: "bg-[#8C5843] text-[#FCF9F5]",
        badgeClass: "bg-[#F6E6DF] text-[#734532]",
        borderClass: "border-[#EBD5CB]",
        textClass: "text-[#2B201B]",
        mutedClass: "text-[#7A6359]",
        swatchHex: ["#FCF9F5", "#EBC8B8", "#8C5843"],
      },
    ],
    fields: [
      question("first-year", "babyName", { required: true, type: "short", step: "basics" }),
      question("first-year", "birthDate", { required: true, type: "short", step: "basics" }),
      question("first-year", "birthMetrics", { required: false, type: "short", step: "basics" }),
      question("first-year", "howWeWelcomed", { required: false, type: "long", step: "questions" }),
      question("first-year", "firstSmile", { required: false, type: "long", step: "questions" }),
      question("first-year", "firstAchievements", { required: true, type: "long", step: "questions" }),
      question("first-year", "firstWords", { required: false, type: "long", step: "questions" }),
      question("first-year", "monthsHighlights", { required: true, type: "long", step: "questions" }),
      question("first-year", "letterToBaby", { required: true, type: "long", step: "questions" }),
    ],
    chapterPrompts: [
      {
        id: "ch-month-0",
        title: "Месяц 0 · Добро пожаловать в мир",
        prompt: "Первые дни дома, выписка и первое знакомство с семьёй",
        example: "В день выписки цвела сирень, а дома тебя уже ждала колыбелька у окна.",
      },
      {
        id: "ch-month-6",
        title: "Полгода · Маленький исследователь",
        prompt: "Любимые игрушки, прикорм и первые путешествия",
        example: "Больше всего тебе понравился шуршащий жирафик и прогулки в парке под шум листвы.",
        optional: true,
      },
      {
        id: "ch-month-12",
        title: "12 месяцев · Первый день рождения",
        prompt: "Каким стал малыш к концу первого года?",
        example: "Любознательный, улыбчивый человек, который обожает танцевать и обниматься.",
        optional: true,
      },
    ],
  },
};

export const PRODUCT_SLUGS: ProductSlug[] = [
  "love-story",
  "mother-thanks",
  "your-day",
  "first-year",
];

export function isValidProductSlug(slug: string): slug is ProductSlug {
  return PRODUCT_SLUGS.includes(slug as ProductSlug);
}

export function getProductBySlug(slug: string): ProductCatalogItem | null {
  if (!isValidProductSlug(slug)) return null;
  return PRODUCTS_CATALOG[slug];
}

function question(
  slug: ProductSlug,
  id: string,
  meta: Pick<ProductQuestionField, "required" | "type" | "step">
): ProductQuestionField {
  const copy = EDITOR_COPY[slug].fields[id];
  if (!copy) {
    throw new Error(`Нет подсказок редактора для ${slug}.${id}`);
  }
  return {
    id,
    label: copy.label,
    placeholder: copy.placeholder,
    helperText: copy.hint,
    example: copy.example,
    ...meta,
  };
}
