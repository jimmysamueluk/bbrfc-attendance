import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" &&
          "bg-burgundy text-white hover:bg-burgundy/90 focus:ring-burgundy",
        variant === "outline" &&
          "border-2 border-burgundy text-burgundy hover:bg-burgundy/10 focus:ring-burgundy",
        variant === "ghost" &&
          "text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
        size === "sm" && "px-3 py-1.5 text-sm min-h-[36px]",
        size === "md" && "px-4 py-2.5 text-base min-h-[44px]",
        size === "lg" && "px-6 py-3 text-lg min-h-[48px]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";
export { Button };
