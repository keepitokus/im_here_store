import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "demo" | "success" | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const styles = {
    default: "bg-[#EFE9DE] text-[#2B1E1A] border-transparent",
    outline: "bg-transparent text-[#574940] border-[#D8CFC4]",
    demo: "bg-[#FFF3D6] text-[#7A5200] border-[#E8CC88]",
    success: "bg-[#E5F2E8] text-[#255431] border-[#BBDCC2]",
    warning: "bg-[#FBE9E7] text-[#872D23] border-[#EABAB4]",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        styles,
        className
      )}
      {...props}
    />
  );
}
