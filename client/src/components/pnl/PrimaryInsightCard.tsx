import { ArrowRight, ArrowUp, ArrowDown, Lightbulb, List, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricTrendData, MonthlyDataPoint } from "@/components/pnl/TrendChartModal";

export type RoleType = "owner" | "gm" | "chef";

export interface PrimaryInsight {
  id: string;
  type: "critical" | "warning" | "positive";
  metric: string;
  value: string;
  target: string;
  variance: string;
  direction: "up" | "down" | "flat";
  message: string;
  detail: string;
  cta?: string;
}

export const getPrimaryInsightForRole = (
  role: RoleType,
  trends: MetricTrendData[]
): PrimaryInsight | null => {
  // Helper to find metric data
  const getMetric = (id: string) => trends.find((t) => t.id === id);
  const getLastPoint = (metric: MetricTrendData) =>
    metric.data[metric.data.length - 1];

  // 1. Owner Focus: Prime Cost, Net Margin, Sales
  if (role === "owner") {
    const netIncome = getMetric("net-income");
    if (netIncome) {
      const last = getLastPoint(netIncome);
      // Critical: Net Margin < Target significantly (> 10% variance)
      if (last.variancePct <= -10) {
        return {
          id: "owner-margin-critical",
          type: "critical",
          metric: "Net Margin",
          value: `${last.actual.toFixed(1)}%`,
          target: `${last.target.toFixed(1)}%`,
          variance: `${last.variancePct.toFixed(1)}%`,
          direction: "down",
          message: `Net margin is ${Math.abs(last.variancePct).toFixed(
            1
          )}% below target`,
          detail:
            "Profitability has dropped significantly due to lower revenue volume and sustained fixed costs.",
        };
      }
    }

    const primeCost = getMetric("prime-cost");
    if (primeCost) {
      const last = getLastPoint(primeCost);
      // Critical: Prime Cost > Target (Inverse)
      if (last.variancePct >= 5) {
        return {
          id: "owner-prime-critical",
          type: "critical",
          metric: "Prime Cost",
          value: `${last.actual.toFixed(1)}%`,
          target: `${last.target.toFixed(1)}%`,
          variance: `+${last.variancePct.toFixed(1)}%`,
          direction: "up",
          message: `Prime cost is ${last.variancePct.toFixed(1)}% over target`,
          detail:
            "Combined COGS and Labor costs are exceeding benchmarks, primarily driven by COGS inefficiencies.",
        };
      }
    }
  }

  // 2. GM Focus: Labor, Sales, Ops
  if (role === "gm") {
    // Force the specific insight for the mockup scenario
    return {
      id: "gm-foh-labor-critical",
      type: "critical",
      metric: "FOH Labor",
      value: "16.4%",
      target: "14.0%",
      variance: "+2.4%",
      direction: "up",
      message: "FOH Labor is 2.4% Over Budget",
      detail:
        "High overtime on weekends contributed to the variance. Schedule optimization recommended.",
      cta: "Adjust Schedule",
    };
  }

  // 3. Chef Focus: Food Cost, Waste
  if (role === "chef") {
    const cogs = getMetric("cogs");
    if (cogs) {
      const last = getLastPoint(cogs);
      // Critical: COGS > Target (Inverse)
      if (last.variancePct >= 5) {
        return {
          id: "chef-cogs-critical",
          type: "critical",
          metric: "Food Cost",
          value: `${last.actual.toFixed(1)}%`,
          target: `${last.target.toFixed(1)}%`,
          variance: `+${last.variancePct.toFixed(1)}%`,
          direction: "up",
          message: `Food cost exceeded target by ${last.variancePct.toFixed(
            1
          )}%`,
          detail:
            "High variance in dairy and protein spend suggests potential waste or portioning issues.",
        };
      }
    }
  }

  // Default Positive Fallback if no critical issues
  return {
    id: "all-good",
    type: "positive",
    metric: "Overall Health",
    value: "On Track",
    target: "-",
    variance: "0%",
    direction: "flat",
    message: "Key metrics are tracking within acceptable ranges",
    detail:
      "Great job! Your primary KPIs are stable. Look for opportunities to optimize further in the details below.",
  };
};

interface PrimaryInsightCardProps {
  role: RoleType;
  trends: MetricTrendData[];
  onAddAction: (item: {
    title: string;
    source: string;
    metric?: string;
    context?: string;
  }) => void;
  onAskAI: (query: string) => void;
  onGenerateReport: (role: RoleType, insight: PrimaryInsight) => void;
}

export function PrimaryInsightCard({
  role,
  trends,
  onAddAction,
  onAskAI,
  onGenerateReport,
}: PrimaryInsightCardProps) {
  const primaryInsight = getPrimaryInsightForRole(role, trends);
  if (!primaryInsight) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        Primary Insight
      </h2>
      <div
        className={cn(
          "rounded-xl p-6 border-l-4 shadow-sm",
          primaryInsight.type === "critical"
            ? "bg-red-50 border-red-500"
            : primaryInsight.type === "warning"
            ? "bg-amber-50 border-amber-500"
            : "bg-emerald-50 border-emerald-500"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {primaryInsight.message}
            </h3>

            <p className="text-gray-700 mb-4 text-base leading-relaxed max-w-3xl">
              {primaryInsight.detail}
            </p>

            <div className="flex items-center gap-8">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">
                  Actual
                </span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    primaryInsight.type === "critical"
                      ? "text-red-700"
                      : primaryInsight.type === "warning"
                      ? "text-amber-700"
                      : "text-emerald-700"
                  )}
                >
                  {primaryInsight.value}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">
                  Target
                </span>
                <span className="text-lg font-medium text-gray-700">
                  {primaryInsight.target}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">
                  Variance
                </span>
                <span
                  className={cn(
                    "text-lg font-bold flex items-center gap-1",
                    primaryInsight.type === "critical"
                      ? "text-red-600"
                      : primaryInsight.type === "warning"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  )}
                >
                  {primaryInsight.direction === "up" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : primaryInsight.direction === "down" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : null}
                  {primaryInsight.variance}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onGenerateReport(role, primaryInsight)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm flex items-center gap-2",
                primaryInsight.type === "critical"
                  ? "bg-white text-red-700 border-red-200 hover:bg-red-50"
                  : primaryInsight.type === "warning"
                  ? "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                  : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              )}
            >
              <ArrowRight className="h-4 w-4" />
              View Breakdown
            </button>
            <button
              onClick={() => {
                onAddAction({
                  title: primaryInsight.cta
                    ? primaryInsight.cta
                    : `Investigate ${primaryInsight.metric} Variance`,
                  source: "pnl_insight",
                  metric: primaryInsight.metric,
                  context: primaryInsight.message,
                });
              }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <List className="h-4 w-4" />
              {primaryInsight.cta || "Add to Actions"}
            </button>
            <button
              onClick={() =>
                onAskAI(`Analyze ${primaryInsight.metric} variance for me`)
              }
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              Ask Assistant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Helper Functions for Period Aggregation ---

export const getAggregatedTrends = (
  period: string,
  baseTrends: MetricTrendData[]
): MetricTrendData[] => {
  return baseTrends.map((metric) => {
    let aggregatedData: MonthlyDataPoint;
    const data = metric.data;
    const last = data[data.length - 1];

    if (period === "week") {
      // Mock week as 1/4 of last month for currency, same for %
      aggregatedData = {
        ...last,
        month: "Current Week",
        actual: metric.unit === "currency" ? last.actual / 4 : last.actual,
        target: metric.unit === "currency" ? last.target / 4 : last.target,
        variance: metric.unit === "currency" ? last.variance / 4 : last.variance,
        variancePct: last.variancePct, // % variance stays roughly same
      };
    } else if (period === "quarter") {
      // Aggregate last 3 months (Jul, Aug, Sep)
      const last3 = data.slice(-3);
      if (metric.unit === "currency") {
        const actual = last3.reduce((sum, d) => sum + d.actual, 0);
        const target = last3.reduce((sum, d) => sum + d.target, 0);
        const variance = actual - target;
        aggregatedData = {
          month: "Q3 2025",
          actual,
          target,
          variance,
          variancePct: target !== 0 ? (variance / target) * 100 : 0,
        };
      } else {
        // For % metrics, average
        const actual = last3.reduce((sum, d) => sum + d.actual, 0) / 3;
        const target = last3.reduce((sum, d) => sum + d.target, 0) / 3;
        aggregatedData = {
          month: "Q3 2025",
          actual,
          target,
          variance: actual - target,
          variancePct: target !== 0 ? ((actual - target) / target) * 100 : 0,
        };
      }
    } else if (period === "ytd") {
      // Aggregate all data
      if (metric.unit === "currency") {
        const actual = data.reduce((sum, d) => sum + d.actual, 0);
        const target = data.reduce((sum, d) => sum + d.target, 0);
        const variance = actual - target;
        aggregatedData = {
          month: "YTD 2025",
          actual,
          target,
          variance,
          variancePct: target !== 0 ? (variance / target) * 100 : 0,
        };
      } else {
        // For % metrics, average
        const actual = data.reduce((sum, d) => sum + d.actual, 0) / data.length;
        const target = data.reduce((sum, d) => sum + d.target, 0) / data.length;
        aggregatedData = {
          month: "YTD 2025",
          actual,
          target,
          variance: actual - target,
          variancePct: target !== 0 ? ((actual - target) / target) * 100 : 0,
        };
      }
    } else {
      // Default: use last month
      aggregatedData = last;
    }

    return {
      ...metric,
      data: [aggregatedData],
    };
  });
};
