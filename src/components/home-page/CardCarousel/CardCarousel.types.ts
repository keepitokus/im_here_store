import type { ReactNode } from "react";

export interface CardCarouselProps {
  children: ReactNode;
  desktopColumns: 2 | 3;
  previousLabel: string;
  nextLabel: string;
  trackClassName?: string;
}

export interface ArrowScroll {
  frame: number;
  target: number;
}
