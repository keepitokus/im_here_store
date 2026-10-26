import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3042] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-5 py-2.5",
  {
    variants: {
      variant: {
        default:
          "bg-[#1F3042] text-[#F7F2E9] hover:bg-[#162433] shadow-xs",
        rose:
          "bg-[#7A3E4A] text-[#FFFDF8] hover:bg-[#612E39] shadow-xs",
        outline:
          "border border-[#1F3042]/35 bg-[#FFFDF8] text-[#1F3042] hover:bg-[#EFE7DA]",
        secondary:
          "bg-[#EFE7DA] text-[#1F3042] hover:bg-[#E4D9C8]",
        ghost:
          "text-[#1F3042] hover:bg-[#EFE7DA]/70",
        destructive:
          "bg-[#9E2A2B] text-white hover:bg-[#7F2021]",
      },
      size: {
        default: "min-h-[46px] px-5 py-2.5 text-[15px]",
        sm: "min-h-[44px] px-4 py-2 text-sm",
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
