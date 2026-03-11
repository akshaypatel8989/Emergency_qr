import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Language, languageLabels } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** "dropdown" (default) — for Header; "inline" — for settings pages */
  variant?: "dropdown" | "inline";
  className?: string;
}

const LanguageSwitcher = ({ variant = "dropdown", className }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const langs = Object.entries(languageLabels) as [Language, (typeof languageLabels)[Language]][];

  // ── Inline variant (row of buttons) ────────────────────────────────────────
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {langs.map(([code, meta]) => (
          <button key={code}
            onClick={() => setLanguage(code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              language === code
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
            )}>
            <span>{meta.flag}</span>
            <span className="font-display tracking-wide">{meta.native}</span>
          </button>
        ))}
      </div>
    );
  }

  // ── Dropdown variant (for header) ───────────────────────────────────────────
  const current = languageLabels[language];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm font-medium",
          "hover:bg-secondary hover:border-primary/40 transition-all",
          open && "bg-secondary border-primary/40"
        )}
        title="Change Language">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="hidden sm:block font-display tracking-wide text-foreground">
          {current.native}
        </span>
        <span className="sm:hidden">{current.flag}</span>
        {/* Chevron */}
        <svg className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[140px] overflow-hidden rounded-xl border border-border bg-background shadow-elevated animate-in fade-in-0 zoom-in-95 duration-100">
          {langs.map(([code, meta]) => (
            <button key={code}
              onClick={() => { setLanguage(code); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors",
                "hover:bg-secondary",
                language === code ? "text-primary font-semibold" : "text-foreground"
              )}>
              <span className="text-base leading-none">{meta.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display tracking-wide">{meta.native}</p>
                {meta.native !== meta.label && (
                  <p className="text-[10px] text-muted-foreground">{meta.label}</p>
                )}
              </div>
              {language === code && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
