import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-elevated animate-in slide-in-from-bottom-5",
            t.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive/20"
              : "bg-background text-foreground border-border"
          )}>
          {t.variant === "destructive"
            ? <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            : <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-green-600" />}
          <div className="flex-1">
            {t.title       && <p className="text-sm font-semibold font-display">{t.title}</p>}
            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
