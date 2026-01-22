import { Check, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InsightItem {
  id: string;
  title: string;
  subtitle: string;
  impact?: string;
  impactType?: "positive" | "negative" | "neutral";
}

export interface InsightListSectionProps {
  title: string;
  subtitle?: string;
  items: InsightItem[];
  variant: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  onAskAssistant?: (query: string) => void;
  className?: string;
}

export function InsightListSection({
  title,
  subtitle,
  items,
  variant,
  icon: CustomIcon,
  onAskAssistant,
  className
}: InsightListSectionProps) {
  const variantStyles = {
    positive: {
      headerBg: "bg-emerald-50 border-emerald-100",
      headerText: "text-emerald-700",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      impactText: "text-emerald-600",
      buttonHover: "hover:text-emerald-800 hover:bg-emerald-100 text-emerald-600",
      Icon: CustomIcon || Check
    },
    negative: {
      headerBg: "bg-amber-50 border-amber-100",
      headerText: "text-amber-700",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      impactText: "text-amber-600",
      buttonHover: "hover:text-amber-800 hover:bg-amber-100 text-amber-600",
      Icon: CustomIcon || AlertTriangle
    },
    neutral: {
      headerBg: "bg-indigo-50 border-indigo-100",
      headerText: "text-indigo-700",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      impactText: "text-indigo-600",
      buttonHover: "hover:text-indigo-800 hover:bg-indigo-100 text-indigo-600",
      Icon: CustomIcon || TrendingUp
    }
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.Icon;

  return (
    <section className={className}>
      <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <IconComponent className={cn("h-5 w-5", styles.iconText)} /> {title}
      </h3>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {subtitle && (
          <div className={cn("p-4 border-b flex justify-between items-center", styles.headerBg)}>
            <span className={cn("text-sm font-medium", styles.headerText)}>{subtitle}</span>
            <span className={cn("text-xs", styles.headerText)}>Impact</span>
          </div>
        )}
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", styles.iconBg, styles.iconText)}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.impact && (
                  <span className={cn(
                    "text-sm font-medium",
                    item.impactType === "positive" ? "text-emerald-600" :
                    item.impactType === "negative" ? "text-red-600" :
                    styles.impactText
                  )}>
                    {item.impact}
                  </span>
                )}
                {onAskAssistant && (
                  <button
                    onClick={() => onAskAssistant(`Tell me more about: ${item.title}`)}
                    className={cn(
                      "p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100",
                      styles.buttonHover
                    )}
                    title="Ask Assistant"
                  >
                    <Lightbulb className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
