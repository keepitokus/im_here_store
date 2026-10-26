import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[108px] w-full rounded-xl border border-[#D8CFC4] bg-[#FFFEFA] px-4 py-3 text-sm leading-relaxed text-[#231C18] placeholder:text-[#8C7E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E2638] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
