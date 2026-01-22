import { GoalProgress } from "./GoalProgress";

export interface GoalMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  inverted?: boolean;
  trendMetricId?: string;
}

export interface FinancialOverviewProps {
  title?: string;
  goals: GoalMetric[];
  onTrendClick?: (metricId: string) => void;
  onExplainClick?: (metricId: string) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FinancialOverview({
  title = "Financial Overview",
  goals,
  onTrendClick,
  onExplainClick,
  columns = 2,
  className
}: FinancialOverviewProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4"
  };

  return (
    <section className={className}>
      {title && (
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-6">{title}</h2>
      )}
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
        {goals.map((goal) => (
          <GoalProgress
            key={goal.id}
            label={goal.label}
            current={goal.current}
            target={goal.target}
            unit={goal.unit}
            inverted={goal.inverted}
            onTrendClick={goal.trendMetricId && onTrendClick ? () => onTrendClick(goal.trendMetricId!) : undefined}
            onExplainClick={onExplainClick ? () => onExplainClick(goal.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

// Preset goal configurations for different roles
export const ownerGoals: GoalMetric[] = [
  { id: "total-sales", label: "Total Sales", current: 124.5, target: 120, unit: "k", trendMetricId: "net-sales" },
  { id: "net-profit", label: "Net Profit %", current: 18, target: 15, unit: "%", trendMetricId: "net-income" },
  { id: "cogs", label: "COGS %", current: 31, target: 30, unit: "%", inverted: true, trendMetricId: "cogs" },
  { id: "labor", label: "Labor %", current: 33, target: 35, unit: "%", inverted: true, trendMetricId: "labor" },
];

export const gmGoals: GoalMetric[] = [
  { id: "labor-pct", label: "Labor %", current: 33, target: 35, unit: "%", inverted: true, trendMetricId: "labor" },
  { id: "prime-cost", label: "Prime Cost", current: 54, target: 60, unit: "%", inverted: true, trendMetricId: "prime-cost" },
  { id: "controllable", label: "Controllable $", current: 8.2, target: 10, unit: "k", inverted: true },
  { id: "sales-plh", label: "Sales/Labor Hr", current: 48.5, target: 45, unit: "$" },
];

export const chefGoals: GoalMetric[] = [
  { id: "food-cost", label: "Food Cost %", current: 31, target: 28, unit: "%", inverted: true, trendMetricId: "cogs" },
  { id: "waste-pct", label: "Waste %", current: 2.1, target: 2, unit: "%", inverted: true },
  { id: "plate-cost", label: "Avg Plate Cost", current: 3.45, target: 3.50, unit: "$", inverted: true },
  { id: "prep-eff", label: "Prep Efficiency", current: 94, target: 90, unit: "%" },
];
