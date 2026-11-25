"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ArrowScroll, CardCarouselProps } from "./CardCarousel.types";
import styles from "./CardCarousel.module.css";

const ARROW_SCROLL_DURATION_MS = 500;

export function CardCarousel({ children, desktopColumns, previousLabel, nextLabel, trackClassName }: CardCarouselProps) {
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const arrowScrollRef = useRef<ArrowScroll | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  function stopArrowScroll(track: HTMLDivElement) {
    if (!arrowScrollRef.current) return;

    cancelAnimationFrame(arrowScrollRef.current.frame);
    arrowScrollRef.current = null;
    delete track.dataset.arrowScrolling;
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateControls = () => {
      setCanGoBack(track.scrollLeft > 1);
      setCanGoForward(track.scrollLeft < track.scrollWidth - track.clientWidth - 1);
    };

    let width = track.clientWidth;
    const observer = new ResizeObserver(() => {
      if (track.clientWidth !== width) {
        stopArrowScroll(track);
        width = track.clientWidth;
      }
      updateControls();
    });
    observer.observe(track);
    track.addEventListener("scroll", updateControls, { passive: true });
    updateControls();

    return () => {
      stopArrowScroll(track);
      observer.disconnect();
      track.removeEventListener("scroll", updateControls);
    };
  }, []);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;

    const step = track.children[1].getBoundingClientRect().left - track.children[0].getBoundingClientRect().left;
    if (step <= 0) return;

    const start = track.scrollLeft;
    const current = arrowScrollRef.current;
    const index = Math.round((current?.target ?? start) / step) + direction;
    const target = Math.max(0, Math.min(index * step, track.scrollWidth - track.clientWidth));
    if (current?.target === target) return;

    stopArrowScroll(track);
    if (Math.abs(target - start) < 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.scrollLeft = target;
      return;
    }

    // Allow intermediate positions until the next card is aligned, then restore native snapping.
    track.dataset.arrowScrolling = "";
    const startedAt = performance.now();
    const animation = { frame: 0, target };
    arrowScrollRef.current = animation;

    const animate = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - startedAt) / ARROW_SCROLL_DURATION_MS));
      const eased = progress * progress * (3 - 2 * progress);
      track.scrollLeft = start + (target - start) * eased;
      if (progress < 1) animation.frame = requestAnimationFrame(animate);
      else stopArrowScroll(track);
    };

    animation.frame = requestAnimationFrame(animate);
  }

  return (
    <div>
      <div
        id={trackId}
        ref={trackRef}
        className={trackClassName ? styles.track + " " + trackClassName : styles.track}
        data-desktop-columns={desktopColumns}
        onPointerDown={(event) => stopArrowScroll(event.currentTarget)}
        onWheel={(event) => stopArrowScroll(event.currentTarget)}
      >
        {children}
      </div>
      {(canGoBack || canGoForward) && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.button}
            aria-label={previousLabel}
            aria-controls={trackId}
            aria-disabled={!canGoBack}
            onClick={() => canGoBack && move(-1)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.button}
            aria-label={nextLabel}
            aria-controls={trackId}
            aria-disabled={!canGoForward}
            onClick={() => canGoForward && move(1)}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
