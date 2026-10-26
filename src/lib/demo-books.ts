import { BookContentJsonV1 } from "./book-schema";
import { ProductSlug } from "./catalog";

export interface DemoSamplePhoto {
  id: string;
  caption: string;
  altText: string;
  isFavorite?: boolean;
  dataUrl: string;
}

export interface DemoSampleBook {
  slug: ProductSlug;
  characterSummary: string;
  content: BookContentJsonV1;
  photos: DemoSamplePhoto[];
}

function makeEditorialIllustration(params: {
  bg: string;
  accent: string;
  secondary: string;
  kicker: string;
  headline: string;
  subline: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650">
    <rect width="900" height="650" fill="${params.bg}"/>
    <rect x="36" y="36" width="828" height="578" rx="22" fill="none" stroke="${params.accent}" stroke-opacity="0.24" stroke-width="1.5"/>
    <circle cx="710" cy="160" r="140" fill="${params.secondary}" fill-opacity="0.28"/>
    <circle cx="190" cy="490" r="165" fill="${params.accent}" fill-opacity="0.09"/>
    <text x="86" y="130" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="${params.accent}" fill-opacity="0.75">${params.kicker.toUpperCase()}</text>
    <text x="86" y="300" font-family="Georgia, serif" font-size="40" fill="${params.accent}">${params.headline}</text>
    <line x1="86" y1="335" x2="260" y2="335" stroke="${params.accent}" stroke-opacity="0.4" stroke-width="2"/>
    <text x="86" y="385" font-family="Georgia, serif" font-size="21" fill="${params.accent}" fill-opacity="0.82">${params.subline}</text>
    <text x="86" y="560" font-family="Arial, sans-serif" font-size="13" fill="${params.accent}" fill-opacity="0.55">Коллекционное цифровое издание · «Я здесь»</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_SAMPLE_BOOKS: Record<ProductSlug, DemoSampleBook> = {
  "love-story": {
    slug: "love-story",
    characterSummary: "Анна и Михаил · 5 лет со дня случайной встречи в книжном на Малой Бронной",
    content: {
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
          "Мы столкнулись у полки с альбомами по архитектуре в маленьком книжном на Малой Бронной. Оба потянулись к последнему экземпляру книги про скандинавские маяки, рассмеялись и уже через двадцать минут пили фильтр-кофе за соседним столиком.",
        firstDate:
          "Сентябрьский ливень застал нас посреди Нескучного сада. Мы промокли до нитки, спрятались под навесом старой лодочной станции и проговорили четыре часа подряд.",
        favoritePlace: "Скамейка у Андреевского моста на закате и маленькая пекарня на углу",
        personalConfession:
          "Рядом с тобой даже самый шумный город становится тихим и тёплым домом. Спасибо за каждое утро, за твоё спокойствие и за то, как ты умеешь слышать меня без слов. Я здесь — сегодня и всегда.",
      },
      chapters: [
        {
          id: "demo-ls-ch1",
          title: "С чего всё началось",
          body: "Ты показался мне человеком, у которого всё расписано по минутам, но ради нашего разговора легко отменил все планы на вечер и пошёл со мной пешком через полгорода.",
          promptKey: "ch-meeting",
        },
        {
          id: "demo-ls-ch2",
          title: "Наши маленькие ритуалы",
          body: "Воскресные завтраки без телефонов, бумажные открытки из каждого нового города и наш бесконечный плейлист для ночных поездок.",
          promptKey: "ch-rituals",
        },
      ],
      timeline: [
        {
          id: "demo-ls-tl1",
          eventDate: "2021-09-14",
          dateLabel: "14 сентября 2021",
          title: "Книжный на Малой Бронной",
          description: "Один альбом про маяки на двоих и четыре часа разговоров взахлёб.",
        },
        {
          id: "demo-ls-tl2",
          eventDate: "2022-05-07",
          dateLabel: "7 мая 2022",
          title: "Первая поездка к морю",
          description: "Утренний поезд, холодный балтийский ветер и горячий кофе в термосе.",
        },
        {
          id: "demo-ls-tl3",
          eventDate: "2023-10-20",
          dateLabel: "20 октября 2023",
          title: "Ключи от нашей квартиры",
          description: "Ужин на картонных коробках при свечах в пустой гостиной.",
        },
        {
          id: "demo-ls-tl4",
          eventDate: null,
          dateLabel: "Той самой снежной зимой",
          title: "Сказали друг другу «Да»",
          description: "На вершине холма под густым снегопадом, когда вокруг не было ни души.",
        },
      ],
      favoriteMediaId: "demo-ls-photo-1",
      finalLetterTitle: "Моё признание тебе",
      finalLetterBody:
        "Рядом с тобой даже самый шумный город становится тихим и тёплым домом. Спасибо за каждое утро, за твоё спокойствие и за то, как ты умеешь слышать меня без слов. Я здесь — сегодня и всегда.",
      pinEnabled: false,
    },
    photos: [
      {
        id: "demo-ls-photo-1",
        caption: "Тот самый сентябрьский вечер у Андреевского моста",
        altText: "Иллюстрация: вечерняя прогулка пары у моста",
        isFavorite: true,
        dataUrl: makeEditorialIllustration({
          bg: "#FAF4F4",
          accent: "#6E2638",
          secondary: "#D8A7B1",
          kicker: "Любимый кадр · 14 сентября",
          headline: "Вечер у старого моста",
          subline: "Когда огни набережной отражались в мокром после дождя асфальте",
        }),
      },
      {
        id: "demo-ls-photo-2",
        caption: "Балтийский берег и наш термос с корицей",
        altText: "Иллюстрация: берег моря и сосны",
        dataUrl: makeEditorialIllustration({
          bg: "#FBF8F3",
          accent: "#803445",
          secondary: "#E8CFC8",
          kicker: "Путешествие · Май 2022",
          headline: "Шум сосен и залива",
          subline: "Первая поездка вдвоём, откуда мы привезли горсть янтаря",
        }),
      },
      {
        id: "demo-ls-photo-3",
        caption: "Первое утро в нашей собственной квартире",
        altText: "Иллюстрация: утренний солнечный свет в комнате",
        dataUrl: makeEditorialIllustration({
          bg: "#FAF4F4",
          accent: "#6E2638",
          secondary: "#E6CDD2",
          kicker: "Наш дом · Октябрь 2023",
          headline: "Ужин на картонных коробках",
          subline: "Никакой мебели, только гирлянда на окне и два бокала",
        }),
      },
    ],
  },

  "mother-thanks": {
    slug: "mother-thanks",
    characterSummary: "Любимой маме Елене от дочери Кати · Книга благодарности и памяти детства",
    content: {
      schemaVersion: 1,
      productSlug: "mother-thanks",
      coverTitle: "Любимой маме Елене",
      coverSubtitle: "За тёплые руки, тихую мудрость и дом, куда всегда хочется возвращаться",
      dedication: "От твоей дочери Кати · С бесконечной любовью",
      themeId: "cream-pastel-blue",
      answers: {
        motherName: "Любимой маме Елене",
        authorName: "От твоей дочери Кати",
        childhoodNickname: "«Воробушек» и «Моё ясное солнышко»",
        vividMemory:
          "Субботнее утро на нашей светлой кухне: за окном ещё лежит февральский снег, по радио тихо играет классическая музыка, а ты достаёшь из духовки румяный пирог с антоновкой и корицей.",
        whatSheTaught:
          "Ты научила меня не бояться перемен, быть бережной к людям, держать слово и находить красоту в простых деталях — свежей скатерти, живых цветах на столе и добром разговоре.",
        gratitudeList:
          "За бессонные ночи над моими детскими поделками; за то, что никогда не ругала за разбитые коленки; за длинные звонки, когда я уехала учиться в другой город; за безусловную веру в меня.",
        finalLetterToMom:
          "Мамочка, сколько бы лет мне ни исполнилось и какие бы расстояния нас ни разделяли, твой голос в трубке мгновенно возвращает меня в самое безопасное место на земле. Спасибо тебе за всё. Я здесь, я очень тебя люблю.",
      },
      chapters: [
        {
          id: "demo-mt-ch1",
          title: "Ощущение дома",
          body: "Дом для меня — это запах заваренного чая с чабрецом, твоя синяя чашка на подоконнике и ощущение, что тебя примут и поймут в любую минуту.",
          promptKey: "ch-home",
        },
        {
          id: "demo-mt-ch2",
          title: "Твоя невидимая опора",
          body: "Когда я сомневалась перед переездом и первой серьёзной работой, ты просто обняла меня и сказала: «Попробуй смело, а родной дом всегда тебя ждёт».",
          promptKey: "ch-support",
        },
      ],
      timeline: [
        {
          id: "demo-mt-tl1",
          eventDate: "1998-09-01",
          dateLabel: "1 сентября 1998",
          title: "Первый класс и огромные белые банты",
          description: "Ты гладила мою форму до полуночи, а утром крепко держала меня за руку на линейке.",
        },
        {
          id: "demo-mt-tl2",
          eventDate: "2005-07-15",
          dateLabel: "Лето 2005",
          title: "Каникулы на даче под соснами",
          description: "Чтение вслух на веранде под шум летнего ливня и варенье из лесной земляники.",
        },
        {
          id: "demo-mt-tl3",
          eventDate: "2016-06-25",
          dateLabel: "Июнь 2016",
          title: "Выпускной в университете",
          description: "Твои сияющие глаза в первом ряду зала — моя главная награда.",
        },
      ],
      favoriteMediaId: "demo-mt-photo-1",
      finalLetterTitle: "Письмо моей маме",
      finalLetterBody:
        "Мамочка, сколько бы лет мне ни исполнилось и какие бы расстояния нас ни разделяли, твой голос в трубке мгновенно возвращает меня в самое безопасное место на земле. Спасибо тебе за всё. Я здесь, я очень тебя люблю.",
      pinEnabled: false,
    },
    photos: [
      {
        id: "demo-mt-photo-1",
        caption: "Летняя веранда и наш яблочный пирог",
        altText: "Иллюстрация: уютный семейный стол на летней веранде",
        isFavorite: true,
        dataUrl: makeEditorialIllustration({
          bg: "#F8F7F2",
          accent: "#2C4A6B",
          secondary: "#BDD2E4",
          kicker: "Семейный архив · Детство",
          headline: "Утро на солнечной веранде",
          subline: "Аромат антоновки, синяя фарфоровая чашка и мамина улыбка",
        }),
      },
      {
        id: "demo-mt-photo-2",
        caption: "Первое сентября и мамина рука в моей",
        altText: "Иллюстрация: мама ведёт дочку в первый класс",
        dataUrl: makeEditorialIllustration({
          bg: "#FAF8F4",
          accent: "#38587A",
          secondary: "#CFE0EE",
          kicker: "1 сентября 1998",
          headline: "Большие банты и букет гладиолусов",
          subline: "Твоя ладонь, с которой никогда ничего не страшно",
        }),
      },
    ],
  },

  "your-day": {
    slug: "your-day",
    characterSummary: "Александру к 30-летию · Праздничное издание от близких друзей",
    content: {
      schemaVersion: 1,
      productSlug: "your-day",
      coverTitle: "Александр · Твой день",
      coverSubtitle: "Тридцать ярких лет, десятки маршрутов и люди, которые тобой гордятся",
      dedication: "30 лет · От твоих близких друзей",
      themeId: "festive-cream-gold",
      answers: {
        celebrantName: "Александр",
        celebrantAge: "30 лет",
        fromWho: "От твоих друзей: Иры, Максима и Дениса",
        mainGreeting:
          "Саша, с твоим днём! Рядом с тобой невозможные затеи превращаются в лучшие воспоминания. Мы собрали эту книгу, чтобы ты увидел себя нашими глазами.",
        bestMoments:
          "Спонтанный выезд в Хибины с одной палаткой, ночной запуск твоего первого проекта на кухне и легендарный ужин на крыше, когда внезапно погас свет во всём квартале.",
        whyWeLoveYou:
          "За редкую способность сохранять самоиронию в любой буре, за верность слову, щедрость и за то, что твой дом всегда открыт для друзей.",
        wishesForFuture:
          "Пусть новое десятилетие принесёт смелые горизонты, внутренний покой, новые вершины и сотни поводов поднять бокал за твои победы!",
      },
      chapters: [
        {
          id: "demo-yd-ch1",
          title: "Твоя главная суперсила",
          body: "Ты умеешь объединять вокруг себя совершенно разных людей так, что каждый чувствует себя на своём месте с первой минуты.",
          promptKey: "ch-superpower",
        },
        {
          id: "demo-yd-ch2",
          title: "Обещание этому году",
          body: "Этим летом мы наконец-то выходим под парусом в Белое море — маршрут уже ждёт своего капитана!",
          promptKey: "ch-year-ahead",
        },
      ],
      timeline: [
        {
          id: "demo-yd-tl1",
          eventDate: "2019-08-12",
          dateLabel: "Август 2019",
          title: "Экспедиция на север",
          description: "Пять дней без связи, северное сияние и гитара у костра.",
        },
        {
          id: "demo-yd-tl2",
          eventDate: "2023-04-03",
          dateLabel: "Апрель 2023",
          title: "Запуск собственной мастерской",
          description: "День, когда твоя давняя мечта обрела вывеску и первых гостей.",
        },
        {
          id: "demo-yd-tl3",
          eventDate: "2026-10-26",
          dateLabel: "Октябрь 2026",
          title: "30 лет · Новая глава",
          description: "Праздник в кругу самых близких людей.",
        },
      ],
      favoriteMediaId: "demo-yd-photo-1",
      finalLetterTitle: "Тост в твою честь",
      finalLetterBody:
        "Саша, спасибо, что ты есть в нашей жизни. Сохраняй свой огонь, смелость и доброе сердце. Мы всегда рядом — в любой точке карты!",
      pinEnabled: false,
    },
    photos: [
      {
        id: "demo-yd-photo-1",
        caption: "Вечер на крыше в честь запуска мастерской",
        altText: "Иллюстрация: праздничный вечер друзей на террасе",
        isFavorite: true,
        dataUrl: makeEditorialIllustration({
          bg: "#FCF9F2",
          accent: "#8A6421",
          secondary: "#E2C285",
          kicker: "Лучший момент · Весна 2023",
          headline: "Огни города и большая мечта",
          subline: "Вечер, когда мы праздновали открытие твоей студии до самого рассвета",
        }),
      },
      {
        id: "demo-yd-photo-2",
        caption: "Поход в горы и рассвет над перевалом",
        altText: "Иллюстрация: горный хребет в утреннем золотом свете",
        dataUrl: makeEditorialIllustration({
          bg: "#FAF7F0",
          accent: "#2C261E",
          secondary: "#D4B982",
          kicker: "Экспедиция · Хибины",
          headline: "Выше облаков",
          subline: "Тот самый подъём в 4 утра ради первого луча солнца",
        }),
      },
    ],
  },

  "first-year": {
    slug: "first-year",
    characterSummary: "Малыш Лев · Хроника от рождения до 12 месяцев (с поддержкой продления 990 ₽/год)",
    content: {
      schemaVersion: 1,
      productSlug: "first-year",
      coverTitle: "Лев · Наш первый год",
      coverSubtitle: "Двенадцать месяцев света, улыбок и первых открытий",
      dedication: "Нашему маленькому исследователю от мамы и папы",
      themeId: "milky-pastel-sage",
      answers: {
        babyName: "Лев",
        birthDate: "18 ноября 2025",
        birthMetrics: "3 520 г · 53 см",
        firstAchievements:
          "Первая осознанная улыбка в 6 недель, переворот на животик в 4 месяца, первый зубик в полгода и три самостоятельных шага в 11 месяцев.",
        firstWords:
          "«Ма-ма», «Ба-ба», звонкое «Бух!», когда падает башня из кубиков, и шёпот «Агу» перед сном.",
        monthsHighlights:
          "0 мес — выписка под первый снег; 3 мес — смеётся в голос; 6 мес — пробует печёное яблоко; 9 мес — встаёт у кроватки; 12 мес — задуваем первую свечку!",
        letterToBaby:
          "Любимый Лёвушка, когда ты вырастешь и откроешь эту книгу, мы хотим, чтобы ты почувствовал, каким долгожданным и светлым чудом ты вошёл в нашу жизнь. Мы всегда рядом. Я здесь.",
      },
      chapters: [
        {
          id: "demo-fy-ch1",
          title: "Месяц 0 · Добро пожаловать в мир",
          body: "За окном шёл первый пушистый снег, а в комнате было так тихо и тепло. Когда ты впервые сжал мамин палец крошечной ладошкой, время остановилось.",
          promptKey: "ch-month-0",
        },
        {
          id: "demo-fy-ch2",
          title: "6 месяцев · Маленький исследователь",
          body: "Твоя любимая игрушка — деревянный жираф и шуршащие страницы. Каждое утро начинается с широкой улыбки.",
          promptKey: "ch-month-6",
        },
        {
          id: "demo-fy-ch3",
          title: "12 месяцев · Первый день рождения",
          body: "Ты уже уверенно топаешь по гостиной, танцуешь под любую музыку и крепко обнимаешь нас за шею.",
          promptKey: "ch-month-12",
        },
      ],
      timeline: [
        {
          id: "demo-fy-tl1",
          eventDate: "2025-11-18",
          dateLabel: "Месяц 0 · 18 ноября 2025",
          title: "День рождения Льва",
          description: "3 520 г и 53 см чистого счастья. Первая встреча с домом.",
        },
        {
          id: "demo-fy-tl2",
          eventDate: "2026-02-18",
          dateLabel: "3 месяца · Февраль 2026",
          title: "Первый звонкий смех",
          description: "Рассмеялся в голос, когда папа строил рожицы у пеленального столика.",
        },
        {
          id: "demo-fy-tl3",
          eventDate: "2026-05-18",
          dateLabel: "6 месяцев · Май 2026",
          title: "Полгодика и первая прогулка в парке сирени",
          description: "Сидит в коляске, тянется к веточкам и пробует детское печенье.",
        },
        {
          id: "demo-fy-tl4",
          eventDate: "2026-10-10",
          dateLabel: "11 месяцев · Октябрь 2026",
          title: "Первые самостоятельные шаги",
          description: "Отпустил диван и прошёл через весь ковёр прямо к маме!",
        },
      ],
      favoriteMediaId: "demo-fy-photo-1",
      finalLetterTitle: "Письмо малышу в будущее",
      finalLetterBody:
        "Любимый Лёвушка, когда ты вырастешь и откроешь эту книгу, мы хотим, чтобы ты почувствовал, каким долгожданным и светлым чудом ты вошёл в нашу жизнь. Мы всегда рядом. Я здесь.",
      pinEnabled: false,
    },
    photos: [
      {
        id: "demo-fy-photo-1",
        caption: "Первые дни дома в вязаном молочном пледе",
        altText: "Иллюстрация: колыбель малыша в солнечной комнате",
        isFavorite: true,
        dataUrl: makeEditorialIllustration({
          bg: "#FAF8F3",
          accent: "#4A6151",
          secondary: "#C8DACB",
          kicker: "Месяц 0 · Ноябрь 2025",
          headline: "Тихое утро в детской",
          subline: "Вязаный плед, солнечный зайчик на стене и сонное дыхание",
        }),
      },
      {
        id: "demo-fy-photo-2",
        caption: "11 месяцев: первые шаги по мягкому ковру",
        altText: "Иллюстрация: первые шаги малыша и деревянные кубики",
        dataUrl: makeEditorialIllustration({
          bg: "#FCF9F5",
          accent: "#8C5843",
          secondary: "#EBC8B8",
          kicker: "11 месяцев · Достижение",
          headline: "Три смелых шага",
          subline: "От дивана прямо в распахнутые объятия родителей",
        }),
      },
    ],
  },
};
