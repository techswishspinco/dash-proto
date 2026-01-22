import { ArrowRight, Clock, Users, TrendingUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type LegacyActionItem = {
  id: string;
  title: string;
  description: string;
  impact: number;
  category: "cogs" | "labor" | "sales" | "ops";
  icon: "truck" | "clock" | "users" | "trending";
};

export const availableActions: LegacyActionItem[] = [
  { id: "review-pastry", title: "Review Pastry Supplier", description: "Alternative supplier offers 15% discount on White Chocolate", impact: 600, category: "cogs", icon: "truck" },
  { id: "adjust-delivery", title: "Adjust Delivery Window", description: "Move Sysco to 8-10AM to avoid overtime", impact: 350, category: "ops", icon: "clock" },
  { id: "lock-scheduling", title: "Lock Mid-Shift Cuts", description: "Make Tue/Wed staffing changes permanent", impact: 480, category: "labor", icon: "users" },
  { id: "promote-seasonal", title: "Promote Seasonal Items", description: "Launch 2 new fall pastries for weekend", impact: 800, category: "sales", icon: "trending" },
  { id: "pastry-vendor", title: "Negotiate Ingredient Pricing", description: "Request volume discount from chocolate vendor", impact: 180, category: "cogs", icon: "truck" },
  { id: "bonus-sarah", title: "Approve Sarah's Bonus", description: "Send $500 efficiency bonus for Q4", impact: 0, category: "labor", icon: "users" },
];

export interface ActionCardProps {
  action: LegacyActionItem;
  isInCart: boolean;
  onToggle: () => void;
}

export function ActionCard({ action, isInCart, onToggle }: ActionCardProps) {
  const iconMap = {
    truck: <ArrowRight className="h-4 w-4" />,
    clock: <Clock className="h-4 w-4" />,
    users: <Users className="h-4 w-4" />,
    trending: <TrendingUp className="h-4 w-4" />,
  };

  const colorMap = {
    cogs: "bg-orange-100 text-orange-700 border-orange-200",
    labor: "bg-blue-100 text-blue-700 border-blue-200",
    sales: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ops: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div
      onClick={onToggle}
      className={cn(
        "p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
        isInCart
          ? "border-emerald-500 bg-emerald-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", colorMap[action.category])}>
          {iconMap[action.icon]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm text-gray-900 truncate">{action.title}</h4>
            {isInCart ? (
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-emerald-400 flex-shrink-0 transition-colors" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
          {action.impact > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              <TrendingUp className="h-3 w-3" />
              +${action.impact.toLocaleString()}/mo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
