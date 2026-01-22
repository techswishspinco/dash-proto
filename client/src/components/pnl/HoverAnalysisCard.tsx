import { Sparkles } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export interface HoverAnalysisData {
  label: string;
  value: number;
  color?: string;
}

export interface HoverAnalysisCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  data: HoverAnalysisData[];
  questions: string[];
  onQuestionClick: (q: string) => void;
}

export function HoverAnalysisCard({
  children,
  title,
  description,
  data,
  questions,
  onQuestionClick
}: HoverAnalysisCardProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0 overflow-hidden" align="start" side="right" sideOffset={20}>
        <div className="p-4 bg-white">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg shrink-0">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>
            </div>
          </div>

          <div className="h-32 mt-4 mb-4 flex items-end justify-between gap-2 px-2 border-b border-gray-100 pb-2">
            {data.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1 group/bar">
                <div className="text-[10px] font-medium text-gray-500 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {d.value}%
                </div>
                <div
                  className={cn("w-full rounded-t-sm transition-all hover:opacity-80", d.color || "bg-gray-200")}
                  style={{ height: `${d.value}%` }}
                />
                <div className="text-[10px] text-gray-400 font-medium">{d.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ask follow-up questions:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestionClick(q);
                  }}
                  className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 rounded-md transition-colors text-left border border-gray-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
