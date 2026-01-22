import type { RoleType } from "@/components/pnl/PrimaryInsightCard";

// Mock Data for Chef Curated View
export const chefPrimaryInsight = {
  status: 'red' as const,
  headline: "Milky Puff per-plate cost exceeded acceptable range",
  context: "Food cost is $4.53 (31%), driven by high White Choc. Honeycomb & Condensed Milk costs.",
  metrics: [
    { label: "Avg FC / Plate", value: "$4.53", target: "$3.50" },
    { label: "Food Cost %", value: "31.0%", target: "28.0%" },
  ]
};

export const chefPlateMetrics = {
  avgCost: 3.45,
  range: { low: 1.65, high: 4.53 },
  aboveRangeCount: 3,
  topItems: [
    { name: "Milky Puff", cost: 4.53, pct: 31 },
    { name: "Matcha Lava", cost: 4.19, pct: 29 },
    { name: "Cookie Camp", cost: 4.01, pct: 28 }
  ]
};

// Curated View Filter Configuration
export const CURATED_VIEW_PREFS_KEY = "munch-curated-view-prefs";

export type CuratedFilterId =
  | "net-income" | "gross-profit" | "prime-costs" | "labor-pct" | "food-cost-pct"
  | "fixed-costs" | "cash-flow" | "period-trends" | "sales-breakdown" | "labor-vs-sales"
  | "controllable-expenses" | "delivery-performance" | "variance-vs-budget" | "staffing-impact"
  | "operational-alerts" | "vendor-spend" | "category-costs" | "waste-indicators"
  | "menu-cost-drivers" | "cogs-breakdown" | "wins" | "opportunities" | "impact-analysis"
  | "team-performance" | "action-items";

export interface CuratedFilterOption {
  id: CuratedFilterId;
  label: string;
  group: string;
}

export const OWNER_FILTER_OPTIONS: CuratedFilterOption[] = [
  { id: "net-income", label: "Net Income & Margin", group: "Financial" },
  { id: "gross-profit", label: "Gross Profit", group: "Financial" },
  { id: "prime-costs", label: "Prime Costs", group: "Financial" },
  { id: "labor-pct", label: "Labor %", group: "Costs" },
  { id: "food-cost-pct", label: "Food Cost %", group: "Costs" },
  { id: "fixed-costs", label: "Fixed / Occupancy Costs", group: "Costs" },
  { id: "period-trends", label: "Period-over-Period Trends", group: "Analysis" },
  { id: "wins", label: "Performance Wins", group: "Insights" },
  { id: "opportunities", label: "Opportunities", group: "Insights" },
  { id: "impact-analysis", label: "Impact Analysis", group: "Insights" },
  { id: "team-performance", label: "Team Performance", group: "Insights" },
];

export const GM_FILTER_OPTIONS: CuratedFilterOption[] = [
  { id: "sales-breakdown", label: "Sales Breakdown", group: "Revenue" },
  { id: "labor-vs-sales", label: "Labor vs Sales", group: "Operations" },
  { id: "controllable-expenses", label: "Controllable Expenses", group: "Operations" },
  { id: "delivery-performance", label: "Delivery Performance", group: "Operations" },
  { id: "variance-vs-budget", label: "Variance vs Budget", group: "Analysis" },
  { id: "staffing-impact", label: "Staffing & Scheduling Impact", group: "Analysis" },
  { id: "operational-alerts", label: "Operational Alerts", group: "Analysis" },
  { id: "wins", label: "Operations Wins", group: "Insights" },
  { id: "opportunities", label: "Opportunities", group: "Insights" },
];

export const CHEF_FILTER_OPTIONS: CuratedFilterOption[] = [
  { id: "food-cost-pct", label: "Food Cost %", group: "Costs" },
  { id: "cogs-breakdown", label: "COGS Breakdown", group: "Costs" },
  { id: "vendor-spend", label: "Vendor Spend", group: "Costs" },
  { id: "category-costs", label: "Category Cost Trends", group: "Analysis" },
  { id: "waste-indicators", label: "Waste / Variance Indicators", group: "Analysis" },
  { id: "menu-cost-drivers", label: "Menu-Driven Cost Drivers", group: "Analysis" },
  { id: "wins", label: "Kitchen Wins", group: "Insights" },
  { id: "opportunities", label: "Opportunities", group: "Insights" },
];

export const getFilterOptionsForRole = (role: RoleType): CuratedFilterOption[] => {
  switch (role) {
    case "owner": return OWNER_FILTER_OPTIONS;
    case "gm": return GM_FILTER_OPTIONS;
    case "chef": return CHEF_FILTER_OPTIONS;
  }
};

export const getDefaultFiltersForRole = (role: RoleType): CuratedFilterId[] => {
  return getFilterOptionsForRole(role).map(f => f.id);
};
