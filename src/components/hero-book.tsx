"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PAGES = [
  {
    kicker: "Обложка",
    title: "Анна и Михаил",
    body: "Пять осеней, одна скамейка у моста и разговор, который не хотелось заканчивать.",
    tone: "bg-[#F6ECEA] text-[#7A3E4A]",
  },
  {
    kicker: "14 сентября",
    title: "Книжный на Малой Бронной",
    body: "Один альбом про маяки на двоих. Через двадцать минут — кофе за соседним столом.",
    tone: "bg-[#F8F1E4] text-[#8A6840]",
  },
  {
    kicker: "Последняя страница",
    title: "Я здесь",
    body: "Рядом с тобой даже шумный город становится тихим. Это можно открыть снова.",
    tone: "bg-[#EEF3F6] text-[#3E5874]",
  },
];

export function HeroBook() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % PAGES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const page = PAGES[index];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -left-3 top-8 hidden h-[88%] w-full rounded-sm bg-[#E7D8C8] sm:block" aria-hidden />
      <div className={`paper-shadow relative min-h-[420px] rounded-sm border border-[#E7D8C8] p-8 sm:p-10 ${page.tone}`}>
        <p className="text-[11px] uppercase tracking-[0.22em]">{page.kicker}</p>
        <h2 className="mt-8 font-serif text-4xl leading-tight sm:text-5xl">{page.title}</h2>
        <p className="mt-6 max-w-xs text-sm leading-relaxed opacity-90">{page.body}</p>
        <p className="absolute bottom-8 left-8 font-script text-3xl">Я здесь</p>
        <div className="absolute bottom-8 right-8 flex gap-2">
          {PAGES.map((item, itemIndex) => (
            <button
              key={item.kicker}
              type="button"
              aria-label={`Страница ${itemIndex + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${itemIndex === index ? "bg-current" : "bg-current/30"}`}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      </div>
      <Link href="/demo/love-story" className="mt-4 inline-flex text-sm underline decoration-[#B99273] underline-offset-4">
        Листать пример целиком
      </Link>
    </div>
  );
}
