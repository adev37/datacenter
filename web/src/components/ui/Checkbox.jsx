// apps/web/src/components/ui/Checkbox.jsx
import React, { useEffect, useId, useMemo } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * ✅ Clean, accessible Checkbox
 * - Uses React.useId() for stable ids
 * - Properly sets the native `indeterminate` state on the input
 * - Peer-based focus/disabled styles (input is the peer)
 * - Size variants: sm | md | lg
 * - Optional label, description, error
 */

export const Checkbox = React.forwardRef(
  (
    {
      className,
      id,
      checked,
      defaultChecked,
      indeterminate = false,
      disabled = false,
      required = false,
      label,
      description,
      error,
      size = "md",
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const checkboxId = id || `cb-${reactId}`;
    const descId = useMemo(
      () => (description || error ? `${checkboxId}-desc` : undefined),
      [checkboxId, description, error]
    );

    // map sizes
    const boxSize = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    }[size];

    // set native indeterminate prop
    useEffect(() => {
      if (ref && typeof ref !== "function") {
        if (ref.current) ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className={cn("flex items-start gap-2", className)}>
        <span className="relative inline-flex items-center">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            aria-describedby={descId}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            required={required}
            {...props}
          />

          <label
            htmlFor={checkboxId}
            className={cn(
              "grid place-content-center rounded-md border transition-colors",
              "ring-offset-background focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "text-white", // icon color
              boxSize,
              // states
              "border-gray-300 bg-white text-transparent dark:bg-gray-900 dark:border-gray-700",
              "peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              error && "border-rose-500 peer-checked:border-rose-500"
            )}>
            {indeterminate ? (
              <Minus className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </label>
        </span>

        {(label || description || error) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "cursor-pointer text-sm font-medium leading-none",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  error ? "text-rose-600" : "text-foreground"
                )}>
                {label}
                {required && <span className="ml-1 text-rose-600">*</span>}
              </label>
            )}

            {description && !error && (
              <p id={descId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}

            {error && (
              <p id={descId} className="text-sm text-rose-600">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

/**
 * Simple CheckboxGroup
 * - Renders group label, optional description & error
 */
export const CheckboxGroup = React.forwardRef(
  (
    {
      className,
      children,
      label,
      description,
      error,
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <fieldset
        ref={ref}
        disabled={disabled}
        className={cn("space-y-3", className)}
        {...props}>
        {label && (
          <legend
            className={cn(
              "text-sm font-medium",
              error ? "text-rose-600" : "text-foreground"
            )}>
            {label}
            {required && <span className="ml-1 text-rose-600">*</span>}
          </legend>
        )}

        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="space-y-2">{children}</div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
      </fieldset>
    );
  }
);

CheckboxGroup.displayName = "CheckboxGroup";

export default Checkbox;
