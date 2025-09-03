// apps/web/src/components/ui/Button.jsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import Icon from "../AppIcon";

const buttonVariants = cva(
  // default: not pill — rounded-lg
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium " +
    "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        danger: "bg-error text-error-foreground hover:bg-error/90",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3",
        default: "h-10 px-4",
        lg: "h-11 px-6",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0", // square icon button (uses shape rounding)
      },
      // NEW: control rounding explicitly
      shape: {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "lg", // default = rounded-lg, not full
    },
  }
);

// icon sizes tied to button size
const ICON_SIZE = { xs: 12, sm: 14, default: 16, lg: 18, xl: 20, icon: 16 };

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    viewBox="0 0 24 24"
    fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button
 * Props: variant, size, shape ('none'|'sm'|'md'|'lg'|'xl'|'full'), asChild,
 * loading, iconName, iconPosition, iconSize, fullWidth, disabled, className, ...props
 */
const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size = "default",
      shape, // optional; defaults to 'lg' via cva
      asChild = false,
      children,
      loading = false,
      iconName = null,
      iconPosition = "left",
      iconSize = null,
      fullWidth = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const resolvedIconSize = iconSize ?? ICON_SIZE[size] ?? 16;

    const IconEl = iconName ? (
      <Icon
        name={iconName}
        size={resolvedIconSize}
        className={cn(
          children && iconPosition === "left" && "mr-2",
          children && iconPosition === "right" && "ml-2"
        )}
      />
    ) : null;

    const content = (
      <>
        {loading && <LoadingSpinner />}
        {iconPosition === "left" && IconEl}
        {children}
        {iconPosition === "right" && IconEl}
      </>
    );

    const classes = cn(
      buttonVariants({ variant, size, shape }),
      fullWidth && "w-full",
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: cn(classes, children.props.className),
        disabled: disabled || loading || children.props.disabled,
        ...props,
        children: content,
      });
    }

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}>
        {content}
      </Comp>
    );
  }
);

Button.displayName = "Button";
export default Button;
