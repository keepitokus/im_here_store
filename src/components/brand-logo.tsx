import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  size?: "sm" | "header" | "footer" | "lg";
  variant?: "default" | "light";
  className?: string;
}

const SIZE_MAP = {
  sm: {
    boxClass: "h-10 w-10 sm:h-11 sm:w-11",
    px: 44,
  },
  header: {
    boxClass: "h-14 w-14 sm:h-16 sm:w-16 xl:h-[68px] xl:w-[68px]",
    px: 68,
  },
  footer: {
    boxClass: "h-24 w-24 sm:h-28 sm:w-28",
    px: 112,
  },
  lg: {
    boxClass: "h-28 w-28 sm:h-32 sm:w-32",
    px: 128,
  },
};

export function BrandLogo({
  size = "header",
  variant = "default",
  className,
}: BrandLogoProps) {
  const { boxClass, px } = SIZE_MAP[size];
  const src =
    variant === "light"
      ? "/images/logo-ya-zdes-light.webp"
      : "/images/logo-ya-zdes.webp";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center select-none",
        boxClass,
        className
      )}
    >
      <Image
        src={src}
        alt="Я здесь"
        width={px * 2}
        height={px * 2}
        unoptimized
        priority={size === "header"}
        className="h-full w-full object-contain"
      />
      <span className="sr-only">Я здесь</span>
    </span>
  );
}
