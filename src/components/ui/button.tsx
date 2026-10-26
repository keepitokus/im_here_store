import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E2638] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-5 py-2.5",
  {
    variants: {
      variant: {
        default:
          "bg-[#2B1E1A] text-[#FAF7F2] hover:bg-[#3F2D27] shadow-sm",
        rose:
          "bg-[#6E2638] text-[#FAF4F4] hover:bg-[#581D2C] shadow-sm",
        outline:
          "border border-[#D8CFC4] bg-[#FFFEFA] text-[#2B1E1A] hover:bg-[#F4EFE6]",
        secondary:
          "bg-[#EFE9DE] text-[#2B1E1A] hover:bg-[#E4DCCB]",
        ghost:
          "text-[#2B1E1A] hover:bg-[#EFE9DE]/70",
        destructive:
          "bg-[#9E2A2B] text-white hover:bg-[#7F2021]",
      },
      size: {
        default: "min-h-[44px] px-5 py-2.5",
        sm: "min-h-[38px] px-4 py-1.5 text-xs",
        lg: "min-h-[50px] px-7 py-3 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
