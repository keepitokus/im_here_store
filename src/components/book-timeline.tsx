"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Calendar, ChevronDown } from "lucide-react";
import type { TimelineEventView, TimelineImage } from "@/lib/timeline-view";

const WIDE_CONTAINER_PX = 760;

type BookTimelineProps = {
  events: TimelineEventView[];
  washClassName?: string;
  footnote?: string;
};

function EventPhotos({ images }: { images: TimelineImage[] }) {
  if (images.length === 0) return null;

  const frame = (image: TimelineImage, index: number) => (
    <div
      key={`${image.src}-${index}`}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#DED0BE] bg-[#F7F2E9]"
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 760px) 100vw, 420px"
        className="object-cover"
        unoptimized={image.src.startsWith("data:") || image.src.startsWith("blob:")}
      />
    </div>
  );

  if (images.length === 1) return frame(images[0], 0);

  return <div className="grid grid-cols-2 gap-2">{images.map(frame)}</div>;
}

export function BookTimeline({
  events,
  washClassName = "bg-[#F6ECEA]",
  footnote,
}: BookTimelineProps) {
  const baseId = useId().replace(/:/g, "");
  const [activeId, setActiveId] = useState<string | null>(events[0]?.id ?? null);
  const headerRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingAnchor = useRef<{ id: string; top: number } | null>(null);
  const resolvedId =
    activeId === null
      ? null
      : events.some((event) => event.id === activeId)
        ? activeId
        : (events[0]?.id ?? null);

  useLayoutEffect(() => {
    const pending = pendingAnchor.current;
    if (!pending) return;
    pendingAnchor.current = null;

    const header = headerRefs.current.get(pending.id);
    if (!header) return;

    const delta = header.getBoundingClientRect().top - pending.top;
    if (Math.abs(delta) > 1) {
      window.scrollBy(0, delta);
    }

    if (resolvedId !== pending.id) return;

    const panel = document.getElementById(`${baseId}-panel-${pending.id}`);
    if (!panel) return;

    const headerRect = header.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const photoIsOnScreen = panelRect.top < window.innerHeight - 140 && panelRect.top > 60;
    const headerIsOnScreen = headerRect.top >= 88 && headerRect.bottom <= window.innerHeight - 8;
    if (photoIsOnScreen && headerIsOnScreen) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(0, window.scrollY + headerRect.top - 96);
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }, [resolvedId, baseId]);

  if (events.length === 0) return null;

  const selected = events.find((event) => event.id === resolvedId) ?? events[0];

  function toggleCompact(id: string) {
    const header = headerRefs.current.get(id);
    if (header) {
      pendingAnchor.current = { id, top: header.getBoundingClientRect().top };
    }
    setActiveId((current) => (current === id ? null : id));
  }

  return (
    <div className="book-timeline w-full min-w-0" data-wide-at={WIDE_CONTAINER_PX}>
      <div className="book-timeline-compact" data-layout="compact">
        <ol className="relative ml-3 space-y-4 border-l border-[#D4C5B3] pl-5 sm:ml-4 sm:pl-6">
          {events.map((event, index) => {
            const open = event.id === resolvedId;
            const triggerId = `${baseId}-trigger-${event.id}`;
            const panelId = `${baseId}-panel-${event.id}`;
            return (
              <li key={event.id} className="relative scroll-mt-24">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[27px] top-5 h-3.5 w-3.5 rounded-full ring-4 ring-[#FFFDF8] sm:-left-[31px] ${
                    open ? "bg-[#1F3042]" : "border border-[#B99273] bg-[#FFFDF8]"
                  }`}
                />
                <article
                  className={`overflow-hidden rounded-3xl border bg-[#FFFDF8] transition-colors duration-300 motion-reduce:transition-none ${
                    open
                      ? "border-[#1F3042] shadow-[0_16px_40px_-28px_rgba(31,48,66,0.45)]"
                      : "border-[#EAE0D2]"
                  }`}
                >
                  <button
                    id={triggerId}
                    ref={(node) => {
                      if (node) headerRefs.current.set(event.id, node);
                      else headerRefs.current.delete(event.id);
                    }}
                    type="button"
                    className="timeline-trigger flex min-h-11 w-full items-start gap-3 px-4 py-3.5 text-left"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggleCompact(event.id)}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A6855]">
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="break-words">{event.date}</span>
                      </span>
                      <span className="mt-1 block break-words font-serif text-xl leading-snug text-[#1F3042]">
                        {event.title}
                      </span>
                    </span>
                    <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E4D7C6] bg-[#F7F2E9] text-[#1F3042]">
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 motion-reduce:transition-none ${
                          open ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                      <span className="sr-only">{open ? "Свернуть событие" : "Развернуть событие"}</span>
                    </span>
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-4 px-4 pb-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A7563]">
                          Глава 0{index + 1}
                        </p>
                        <EventPhotos images={event.images} />
                        {event.description ? (
                          <p className="break-words font-serif text-lg leading-relaxed text-[#1F3042] whitespace-pre-line">
                            {event.description}
                          </p>
                        ) : (
                          <p className="text-sm leading-relaxed text-[#6E6256]">
                            К этому событию пока не добавлено описание.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
        {footnote && <p className="mt-5 text-xs leading-relaxed text-[#6E6256]">{footnote}</p>}
      </div>

      <div className="book-timeline-wide" data-layout="wide">
        <div className="grid min-h-[540px] grid-cols-12 bg-[#FFFDF8]">
          <div className="col-span-7 space-y-5 p-7 sm:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">
                Интерактивная линия времени
              </p>
              <h3 className="font-serif text-3xl text-[#1F3042] sm:text-4xl">
                Памятные даты и события
              </h3>
              <p className="mt-1 text-xs text-[#6E6256]">
                Нажмите на любую дату, чтобы рассмотреть карточку момента:
              </p>
            </div>

            <ol className="space-y-3">
              {events.map((event, index) => {
                const isSelected = event.id === selected.id;
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setActiveId(event.id)}
                      className={`timeline-trigger min-h-11 w-full rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? `border-[#1F3042] shadow-xs ${washClassName}`
                          : "border-[#EAE0D2] bg-[#FAF6EE]/60 hover:bg-[#F3ECE0]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-[#7A6855]">
                        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em]">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {event.date}
                        </span>
                        <span>Глава 0{index + 1}</span>
                      </div>
                      <p className="mt-1 font-serif text-xl font-semibold text-[#1F3042]">{event.title}</p>
                      {event.description && (
                        <p className="mt-1 text-sm text-[#3E4C5C] whitespace-pre-line">{event.description}</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={`col-span-5 flex flex-col justify-between p-7 sm:p-10 ${washClassName}`}>
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.18em] text-[#7A6855]">
                {selected.images.length > 0 ? "Кадр выбранной главы" : "Карточка выбранной главы"}
              </span>
              <EventPhotos images={selected.images} />
              <h4 className="font-serif text-2xl text-[#1F3042]">{selected.title}</h4>
              {selected.description ? (
                <p className="text-sm leading-relaxed text-[#2F3E4E] whitespace-pre-line">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-[#6E6256]">
                  К этому событию пока не добавлено описание.
                </p>
              )}
            </div>
            {footnote && <p className="pt-4 text-xs text-[#6E6256]">{footnote}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
