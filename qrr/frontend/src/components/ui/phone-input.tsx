// src/components/ui/phone-input.tsx
// +91 prefix is fixed, user types only the 10-digit number
// Shows live digit count, red border when invalid length

import * as React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;           // full value stored in parent e.g. "+919876543210"
  onChange: (full: string) => void;  // passes "+91XXXXXXXXXX"
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, required, disabled, className, placeholder = "98765 43210", id }, ref) => {

    // Strip +91 prefix to get the bare digits the user has typed
    const digits = value.startsWith("+91") ? value.slice(3) : value.replace(/^\+?91/, "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numeric characters, max 10 digits
      const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
      onChange(raw ? `+91${raw}` : "");
    };

    const isValid   = digits.length === 0 || digits.length === 10;
    const isFilled  = digits.length === 10;
    const count     = digits.length;

    return (
      <div className="relative flex items-stretch">
        {/* Fixed +91 prefix */}
        <div className={cn(
          "flex items-center gap-1.5 px-3 rounded-l-lg border border-r-0 bg-secondary text-foreground text-sm font-semibold select-none shrink-0",
          !isValid ? "border-destructive" : isFilled ? "border-green-500" : "border-input"
        )}>
          <span className="text-base leading-none">🇮🇳</span>
          <span className="font-display tracking-wide">+91</span>
        </div>

        {/* Number input */}
        <input
          ref={ref}
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          placeholder={placeholder}
          value={digits}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          maxLength={10}
          className={cn(
            "flex-1 h-12 rounded-none rounded-r-lg border bg-background px-3 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 transition-colors pr-14",
            !isValid   ? "border-destructive focus-visible:ring-destructive"
            : isFilled ? "border-green-500  focus-visible:ring-green-500"
                       : "border-input",
            className
          )} />

        {/* Live digit counter badge */}
        <div className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono px-1.5 py-0.5 rounded-md transition-colors select-none pointer-events-none",
          count === 0    ? "text-muted-foreground"
          : count === 10 ? "bg-green-100 text-green-700 font-bold"
          : count < 10   ? "bg-yellow-100 text-yellow-700"
                         : "bg-destructive/10 text-destructive"
        )}>
          {count}/10
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
export { PhoneInput };
