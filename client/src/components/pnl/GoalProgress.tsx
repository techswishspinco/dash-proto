import { Check, TrendingUp, HelpCircle, BarChart3, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoalProgressProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  inverted?: boolean;
  onTrendClick?: () => void;
  onExplainClick?: () => void;
}

export function GoalProgress({
  label,
  current,
  target,
  unit = "%",
  inverted = false,
  onTrendClick,
  onExplainClick
}: GoalProgressProps) {
  const progress = Math.min((current / target) * 100, 100);
  const isGood = inverted ? current <= target : current >= target;

  return (
    <div
      onClick={onTrendClick}
      className={cn(
        "bg-white rounded-lg p-4 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-all",
        onTrendClick && "cursor-pointer hover:shadow-md"
      )}
    >
      {onExplainClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplainClick();
          }}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all z-20 opacity-0 group-hover:opacity-100"
          title="Explain why"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif">{current}{unit}</span>
            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              / {target}{unit} Goal
              {onTrendClick && (
                <BarChart3 className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              )}
            </span>
          </div>
        </div>
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
          isGood ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}>
          {isGood ? <Check className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
        </div>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative z-10">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", isGood ? "bg-emerald-500" : "bg-red-500")}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isGood && (
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
          <Trophy className="h-24 w-24 text-emerald-500 transform rotate-12" />
        </div>
      )}
    </div>
  );
}
