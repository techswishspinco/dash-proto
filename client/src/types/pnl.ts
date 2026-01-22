// PnL Release Page Types

export interface ActionItem {
  id: string;
  title: string;
  source: 'pnl_insight' | 'ai_suggestion' | 'user_click';
  metric?: string;
  context?: string;
  status: 'new' | 'assigned' | 'dismissed';
  createdAt: number;
}

export type PnLStatus = "Draft" | "In Review" | "Finalized" | "Published";
export type OwnerStatus = "Not Sent" | "Sent" | "Viewed" | "Approved" | "Changes Requested";
export type TimeframeType = "Daily" | "Weekly" | "Monthly" | "Yearly";
export type RoleType = "owner" | "gm" | "chef";

export interface PnLPeriod {
  id: string;
  period: string;
  location: string;
  pnlStatus: PnLStatus;
  ownerStatus: OwnerStatus;
  sentDate: string | null;
  startDate: Date;
  endDate: Date;
}

export interface PnLFilterState {
  startDate: string;
  endDate: string;
  timeframe: TimeframeType;
  pnlStatuses: PnLStatus[];
  ownerStatuses: OwnerStatus[];
}

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

export interface CuratedViewPrefs {
  owner: CuratedFilterId[];
  gm: CuratedFilterId[];
  chef: CuratedFilterId[];
  hasSeenHint: boolean;
}

export interface MonthlyDataPoint {
  month: string;
  year: number;
  actual: number;
  target: number;
  variance: number;
  variancePct: number;
}

export interface DrilldownItem {
  id: string;
  name: string;
  actual: number;
  target: number;
  variance: number;
  variancePct: number;
  isOnTrack: boolean;
}

export interface MetricTrendData {
  id: string;
  name: string;
  description: string;
  unit: 'currency' | 'percentage';
  isInverse?: boolean;
  data: MonthlyDataPoint[];
  drilldown?: {
    title: string;
    items: DrilldownItem[];
  };
}

export interface EditableSection {
  id: string;
  label: string;
  visible: boolean;
}

export type VarianceLevel = 'critical' | 'attention' | 'favorable' | 'normal';
export type LineItemType = 'revenue' | 'expense' | 'subtotal';

export interface PnLLineItem {
  id: string;
  name: string;
  current: number;
  prior: number;
  type: LineItemType;
  children?: PnLLineItem[];
  relatedMetrics?: { id: string; name: string }[];
}

export interface VarianceInfo {
  level: VarianceLevel;
  reason: string;
  variance: number;
  variancePct: number;
}

export interface Suggestion {
  icon: React.ReactNode;
  text: string;
  action: 'comparison' | 'trend' | 'breakdown' | 'ai_explain' | 'compare_metrics';
  params: Record<string, any>;
}

export type FollowUpAction =
  | { type: "chat"; label: string; intent: string }
  | { type: "report"; label: string; report_type: string; params?: any };

export type FloatingMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: boolean;
  report?: any;
  followUpQuestions?: FollowUpAction[];
  toolCall?: {
    state: "running" | "completed" | "pending_confirmation" | "denied";
    toolName: string;
    args?: any;
    result?: any;
    denialReason?: string;
  };
};

export interface Report {
  id: string;
  title: string;
  query: string;
  content: string;
}

export interface PrimaryInsight {
  status: 'green' | 'yellow' | 'red';
  message: string;
  detail: string;
  metric: string;
  metricValue: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
}
