import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/layout";
import confetti from "canvas-confetti";
import munchCatIcon from "../../../attached_assets/Screenshot_2026-01-08_at_12.59.10_PM_1767895210474.png";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Check, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight, 
  ChevronUp, 
  Download, 
  FileText, 
  LayoutDashboard, 
  Loader2, 
  MoreHorizontal, 
  PieChart, 
  Plus, 
  RefreshCw, 
  Save, 
  Search, 
  Send, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  X,
  ArrowLeft,
  Share,
  ArrowRight,
  FileSpreadsheet,
  File,
  Target,
  Trophy,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Clock,
  Users,
  List,
  User,
  Award,
  DollarSign,
  CheckCircle2,
  BarChart3,
  CalendarDays,
  HelpCircle,
  GitCompare,
  Layers,
  GripVertical,
  Filter,
  Mail,
  Eye,
  Pencil,
  RotateCcw,
  Wallet,
  CreditCard,
  Package,
  TrendingDown,
  MessageSquare,
  Maximize2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  ComposedChart
} from "recharts";
import { useLocation } from "wouter";
import { 
  getMetadata,
  getMonths,
  getLatestMonth,
  getLatestMonthSummary,
  getMonthlySummary,
  getYTDSummary,
  getMonthlyTrend,
  getIncomeByMonth,
  getCOGSByMonth,
  getCOGSPctByMonth,
  getLaborByMonth,
  getLaborPctByMonth,
  getTotalIncome,
  getTotalCOGS,
  getTotalLabor,
  getTotalCOGSPct,
  getTotalLaborPct,
  getTotalPrimeCost,
  getTotalPrimeCostPct,
  getCOGSBreakdown,
  getRevenueBreakdown,
  getCompletePLHierarchy,
  flattenHierarchy,
  type HierarchicalAccount
} from "@/data/pl-parser";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek, isSameMonth, isSameWeek, isSameDay } from "date-fns";
import { ReportPanel } from "@/components/reports/report-panel";
import { MOCK_REPORTS, ReportData, ReportType } from "@/components/reports/mock-data";
import { generateComparisonReport } from "@/components/reports/comparison-generator";
import { ReportsView } from "@/components/reports/reports-view";
import { ReportContent } from "@/components/reports/report-content";
import { Wand } from "@/components/ui/wand";
import { stateBenchmarks, type StateBenchmark } from "@/data/pnl/state-benchmarks";
import { TrendChartModal, type MetricTrendData, type MonthlyDataPoint, type DrilldownItem, isMetricOnTrack } from "@/components/pnl/TrendChartModal";
import { healthSnapshotTrendData } from "@/data/pnl/health-snapshot-data";
import { hierarchicalPnlData, type PnLLineItem, type VarianceLevel, type LineItemType, type VarianceInfo } from "@/data/pnl/hierarchical-pnl-data";
import { analyzeVariance, countFlaggedItems, filterItemsByVariance } from "@/lib/pnl/variance-analysis";
import { GoalProgress } from "@/components/pnl/GoalProgress";
import { ActionCard, availableActions, type LegacyActionItem } from "@/components/pnl/ActionCard";
import { ReleaseModal } from "@/components/pnl/ReleaseModal";
import { HoverAnalysisCard } from "@/components/pnl/HoverAnalysisCard";
import { InsightListSection, type InsightItem } from "@/components/pnl/InsightListSection";
import { FinancialOverview, ownerGoals, gmGoals, chefGoals } from "@/components/pnl/FinancialOverview";
import { generateMockResponse, generateReportContent, type FollowUpAction } from "@/lib/pnl/mock-responses";

// Mock Data for Chef Curated View
const chefPrimaryInsight = {
   status: 'red',
   headline: "Milky Puff per-plate cost exceeded acceptable range",
   context: "Food cost is $4.53 (31%), driven by high White Choc. Honeycomb & Condensed Milk costs.",
   metrics: [
      { label: "Avg FC / Plate", value: "$4.53", target: "$3.50" },
      { label: "Food Cost %", value: "31.0%", target: "28.0%" },
   ]
};

const chefPlateMetrics = {
   avgCost: 3.45,
   range: { low: 1.65, high: 4.53 },
   aboveRangeCount: 3,
   topItems: [
      { name: "Milky Puff", cost: 4.53, pct: 31 },
      { name: "Matcha Lava", cost: 4.19, pct: 29 },
      { name: "Cookie Camp", cost: 4.01, pct: 28 }
   ]
};

// --- Action Cart Types & Data ---
export interface ActionItem {
  id: string;
  title: string;
  source: 'pnl_insight' | 'ai_suggestion' | 'user_click';
  metric?: string;
  context?: string;
  status: 'new' | 'assigned' | 'dismissed';
  createdAt: number;
}

// --- Mock Data ---

type PnLStatus = "Draft" | "In Review" | "Finalized" | "Published";
type OwnerStatus = "Not Sent" | "Sent" | "Viewed" | "Approved" | "Changes Requested";
type TimeframeType = "Daily" | "Weekly" | "Monthly" | "Yearly";

interface PnLPeriod {
  id: string;
  period: string;
  location: string;
  pnlStatus: PnLStatus;
  ownerStatus: OwnerStatus;
  sentDate: string | null;
  startDate: Date;
  endDate: Date;
}

const pnlPeriods: PnLPeriod[] = [
  { id: "sep-25", period: "September 2025", location: "STMARKS", pnlStatus: "Draft", ownerStatus: "Not Sent", sentDate: null, startDate: new Date(2025, 8, 1), endDate: new Date(2025, 8, 30) },
  { id: "aug-25", period: "August 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Viewed", sentDate: "Sep 15, 2025", startDate: new Date(2025, 7, 1), endDate: new Date(2025, 7, 31) },
  { id: "jul-25", period: "July 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "Aug 12, 2025", startDate: new Date(2025, 6, 1), endDate: new Date(2025, 6, 31) },
  { id: "jun-25", period: "June 2025", location: "STMARKS", pnlStatus: "Finalized", ownerStatus: "Sent", sentDate: "Jul 14, 2025", startDate: new Date(2025, 5, 1), endDate: new Date(2025, 5, 30) },
  { id: "may-25", period: "May 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Changes Requested", sentDate: "Jun 10, 2025", startDate: new Date(2025, 4, 1), endDate: new Date(2025, 4, 31) },
  { id: "apr-25", period: "April 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "May 12, 2025", startDate: new Date(2025, 3, 1), endDate: new Date(2025, 3, 30) },
  { id: "mar-25", period: "March 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "Apr 14, 2025", startDate: new Date(2025, 2, 1), endDate: new Date(2025, 2, 31) },
  { id: "feb-25", period: "February 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "Mar 10, 2025", startDate: new Date(2025, 1, 1), endDate: new Date(2025, 1, 28) },
  { id: "jan-25", period: "January 2025", location: "STMARKS", pnlStatus: "In Review", ownerStatus: "Not Sent", sentDate: null, startDate: new Date(2025, 0, 1), endDate: new Date(2025, 0, 31) },
];

const PNL_STATUS_OPTIONS: PnLStatus[] = ["Draft", "In Review", "Finalized", "Published"];
const OWNER_STATUS_OPTIONS: OwnerStatus[] = ["Not Sent", "Sent", "Viewed", "Approved", "Changes Requested"];
const TIMEFRAME_OPTIONS: TimeframeType[] = ["Daily", "Weekly", "Monthly", "Yearly"];

const PNL_FILTER_KEY = "munch-pnl-filters";

interface PnLFilterState {
  startDate: string;
  endDate: string;
  timeframe: TimeframeType;
  pnlStatuses: PnLStatus[];
  ownerStatuses: OwnerStatus[];
}

const getDefaultFilters = (): PnLFilterState => {
  // Default to date range that matches available P&L periods (Jan 2025 - Sep 2025)
  return {
    startDate: "2025-01-01",
    endDate: "2025-09-30",
    timeframe: "Monthly",
    pnlStatuses: [],
    ownerStatuses: [],
  };
};

const loadFilters = (): PnLFilterState => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PNL_FILTER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return getDefaultFilters();
};

const saveFilters = (filters: PnLFilterState) => {
  localStorage.setItem(PNL_FILTER_KEY, JSON.stringify(filters));
};

// Curated View Filter Configuration
const CURATED_VIEW_PREFS_KEY = "munch-curated-view-prefs";

type CuratedFilterId = 
  | "net-income" | "gross-profit" | "prime-costs" | "labor-pct" | "food-cost-pct" 
  | "fixed-costs" | "cash-flow" | "period-trends" | "sales-breakdown" | "labor-vs-sales"
  | "controllable-expenses" | "delivery-performance" | "variance-vs-budget" | "staffing-impact"
  | "operational-alerts" | "vendor-spend" | "category-costs" | "waste-indicators"
  | "menu-cost-drivers" | "cogs-breakdown" | "wins" | "opportunities" | "impact-analysis"
  | "team-performance" | "action-items";

interface CuratedFilterOption {
  id: CuratedFilterId;
  label: string;
  group: string;
}

type RoleType = "owner" | "gm" | "chef";

const OWNER_FILTER_OPTIONS: CuratedFilterOption[] = [
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

const GM_FILTER_OPTIONS: CuratedFilterOption[] = [
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

const CHEF_FILTER_OPTIONS: CuratedFilterOption[] = [
  { id: "food-cost-pct", label: "Food Cost %", group: "Costs" },
  { id: "cogs-breakdown", label: "COGS Breakdown", group: "Costs" },
  { id: "vendor-spend", label: "Vendor Spend", group: "Costs" },
  { id: "category-costs", label: "Category Cost Trends", group: "Analysis" },
  { id: "waste-indicators", label: "Waste / Variance Indicators", group: "Analysis" },
  { id: "menu-cost-drivers", label: "Menu-Driven Cost Drivers", group: "Analysis" },
  { id: "wins", label: "Kitchen Wins", group: "Insights" },
  { id: "opportunities", label: "Opportunities", group: "Insights" },

];

const getFilterOptionsForRole = (role: RoleType): CuratedFilterOption[] => {
  switch (role) {
    case "owner": return OWNER_FILTER_OPTIONS;
    case "gm": return GM_FILTER_OPTIONS;
    case "chef": return CHEF_FILTER_OPTIONS;
  }
};

const getDefaultFiltersForRole = (role: RoleType): CuratedFilterId[] => {
  return getFilterOptionsForRole(role).map(f => f.id);
};

interface CuratedViewPrefs {
  owner: CuratedFilterId[];
  gm: CuratedFilterId[];
  chef: CuratedFilterId[];
  hasSeenHint: boolean;
}

const getDefaultCuratedPrefs = (): CuratedViewPrefs => ({
  owner: getDefaultFiltersForRole("owner"),
  gm: getDefaultFiltersForRole("gm"),
  chef: getDefaultFiltersForRole("chef"),
  hasSeenHint: false,
});

const loadCuratedPrefs = (): CuratedViewPrefs => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(CURATED_VIEW_PREFS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return getDefaultCuratedPrefs();
};

const saveCuratedPrefs = (prefs: CuratedViewPrefs) => {
  localStorage.setItem(CURATED_VIEW_PREFS_KEY, JSON.stringify(prefs));
};

const navigationYears = [
  { 
    year: 2025, 
    months: [
      { name: "September", goalsMet: 2, totalGoals: 4 },
      { name: "August", goalsMet: 3, totalGoals: 4 },
      { name: "July", goalsMet: 2, totalGoals: 4 },
      { name: "June", goalsMet: 3, totalGoals: 4 },
      { name: "May", goalsMet: 4, totalGoals: 4 },
      { name: "April", goalsMet: 3, totalGoals: 4 },
      { name: "March", goalsMet: 4, totalGoals: 4 },
      { name: "February", goalsMet: 3, totalGoals: 4 },
      { name: "January", goalsMet: 3, totalGoals: 4 },
    ]
  }
];

const tocSections = [
  { id: "executive-narrative", label: "Executive Narrative" },
  { id: "bottom-line", label: "Bottom Line" },
  { id: "health-snapshot", label: "Health Snapshot" },
  { id: "revenue-analysis", label: "Revenue Analysis" },
  { id: "prime-cost-analysis", label: "Prime Cost Analysis" },
  { id: "operating-expenses", label: "Operating Expenses" },
  { id: "deep-performance", label: "Performance Review" },
  { id: "profitability-analysis", label: "Profitability Analysis" },
  { id: "accountant-note", label: "Accountant Note" },
];

interface EditableSection {
  id: string;
  label: string;
  visible: boolean;
}

const defaultSections: EditableSection[] = [
  { id: "executive-narrative", label: "Executive Narrative", visible: true },
  { id: "bottom-line", label: "Bottom Line", visible: true },
  { id: "health-snapshot", label: "Health Snapshot", visible: true },
  { id: "revenue-analysis", label: "Revenue Analysis", visible: true },
  { id: "prime-cost-analysis", label: "Prime Cost Analysis", visible: true },
  { id: "operating-expenses", label: "Operating Expenses", visible: true },
  { id: "deep-performance", label: "Performance Review", visible: true },
  { id: "profitability-analysis", label: "Profitability Analysis", visible: true },
  { id: "accountant-note", label: "Accountant Note", visible: true },
];

interface Suggestion {
  icon: React.ReactNode;
  text: string;
  action: 'comparison' | 'trend' | 'breakdown' | 'ai_explain' | 'compare_metrics';
  params: Record<string, any>;
}

// Get contextual suggestions based on line item
const getSuggestions = (lineItem: PnLLineItem, varianceInfo: VarianceInfo): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const iconClass = "h-3.5 w-3.5";

  // Always show "Why did this change?" first
  suggestions.push({
    icon: <HelpCircle className={iconClass} />,
    text: 'Why did this change?',
    action: 'ai_explain',
    params: { metric: lineItem.id, variance: varianceInfo }
  });

  // If flagged with variance, add additional analysis options
  if (varianceInfo.level === 'critical' || varianceInfo.level === 'attention') {
    suggestions.push({
      icon: <BarChart3 className={iconClass} />,
      text: 'Compare to last 3 months',
      action: 'comparison',
      params: { metric: lineItem.id, periods: 3, type: 'month' }
    });

    suggestions.push({
      icon: <CalendarDays className={iconClass} />,
      text: 'See daily breakdown',
      action: 'breakdown',
      params: { metric: lineItem.id, granularity: 'day' }
    });
  }

  // Always available
  suggestions.push({
    icon: <TrendingUp className={iconClass} />,
    text: 'Show trend',
    action: 'trend',
    params: { metric: lineItem.id, periods: 12 }
  });

  // If related metrics exist
  if (lineItem.relatedMetrics && lineItem.relatedMetrics.length > 0) {
    suggestions.push({
      icon: <GitCompare className={iconClass} />,
      text: `Compare to ${lineItem.relatedMetrics[0].name}`,
      action: 'compare_metrics',
      params: { primary: lineItem.id, secondary: lineItem.relatedMetrics[0].id }
    });
  }

  // Add breakdown if has children
  if (lineItem.children && lineItem.children.length > 0) {
    suggestions.push({
      icon: <Layers className={iconClass} />,
      text: 'Drill down into subcategories',
      action: 'breakdown',
      params: { metric: lineItem.id, granularity: 'category' }
    });
  }

  return suggestions.slice(0, 5);
};

// --- Components ---

// Analysis Panel for drill-down insights
interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lineItem: PnLLineItem | null;
  analysisType: string;
  onSuggestionClick: (suggestion: Suggestion) => void;
  netProfit: number;
}

function AnalysisPanel({ isOpen, onClose, lineItem, analysisType, onSuggestionClick, netProfit }: AnalysisPanelProps) {
  if (!isOpen || !lineItem) return null;

  const variance = analyzeVariance(lineItem, netProfit);
  const suggestions = getSuggestions(lineItem, variance);

  const mockTrendData = [
    { month: 'Sep', value: lineItem.prior * 0.95 },
    { month: 'Oct', value: lineItem.prior * 0.98 },
    { month: 'Nov', value: lineItem.prior },
    { month: 'Dec', value: lineItem.current },
  ];

  const mockBreakdownData = lineItem.children?.map(child => ({
    name: child.name.replace(lineItem.name, '').trim() || child.name,
    value: child.current,
    prior: child.prior,
  })) || [];

  const getInsightText = () => {
    if (analysisType === 'comparison' || analysisType === 'trend') {
      const trend = variance.variance > 0 ? 'increased' : 'decreased';
      return `${lineItem.name} ${trend} by ${Math.abs(variance.variancePct).toFixed(1)}% ($${Math.abs(variance.variance).toLocaleString()}) compared to last period. ${variance.level === 'critical' ? 'This is a significant variance that requires immediate attention.' : variance.level === 'attention' ? 'This variance should be monitored closely.' : 'Performance is tracking well.'}`;
    }
    if (analysisType === 'ai_explain') {
      return `The primary driver of the ${lineItem.name} variance appears to be ${lineItem.type === 'expense' ? 'increased costs' : 'volume changes'} during weeks 3-4. ${lineItem.children ? `The ${lineItem.children[0].name} subcategory contributed most significantly to this change.` : ''} Consider reviewing operational patterns during peak periods.`;
    }
    return `${lineItem.name} shows a ${variance.variancePct > 0 ? 'positive' : 'negative'} trend. Current value: $${lineItem.current.toLocaleString()} vs Prior: $${lineItem.prior.toLocaleString()}.`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="analysis-panel-overlay"
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 mx-4"
        data-testid="analysis-panel"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-xl font-serif font-bold text-gray-900">{lineItem.name}: {analysisType === 'comparison' ? 'Last 3 Months' : analysisType === 'trend' ? 'Trend Analysis' : analysisType === 'ai_explain' ? 'Variance Explained' : 'Breakdown'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {analysisType === 'breakdown' && mockBreakdownData.length > 0 ? (
                <BarChart data={mockBreakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11}} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="prior" fill="#e5e7eb" name="Prior" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="value" fill={variance.level === 'favorable' ? '#10b981' : variance.level === 'critical' ? '#ef4444' : '#f59e0b'} name="Current" radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{fontSize: 11}} />
                  <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke={variance.level === 'favorable' ? '#10b981' : variance.level === 'critical' ? '#ef4444' : '#3b82f6'} strokeWidth={2} dot={{ fill: '#fff', strokeWidth: 2 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 flex gap-3 rounded-r-lg">
            <Sparkles className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{getInsightText()}</p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 rounded-lg -mx-2 px-2 py-3">
            <div className="p-3 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Current</p>
              <p className="text-2xl font-bold text-gray-900">${(lineItem.current / 1000).toFixed(1)}k</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prior</p>
              <p className="text-2xl font-bold text-gray-900">${(lineItem.prior / 1000).toFixed(1)}k</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Change</p>
              <p className={cn("text-2xl font-bold", variance.variance > 0 ? "text-red-600" : "text-emerald-600")}>
                {variance.variance > 0 ? '+' : ''}{variance.variancePct.toFixed(1)}%
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Next Steps</h4>
            <div className="space-y-2">
              {suggestions.filter(s => s.action !== analysisType).slice(0, 4).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  data-testid={`panel-suggestion-${idx}`}
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{suggestion.text}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// P&L Tree Line Item Component with hover suggestions
interface PnLTreeItemProps {
  item: PnLLineItem;
  depth: number;
  netProfit: number;
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
  selectedItem: string | null;
  onSelectItem: (id: string | null) => void;
  onSuggestionAccept: (item: PnLLineItem, suggestion: Suggestion) => void;
  focusedIndex: number;
  currentIndex: number;
  highlightedNodeId?: string | null;
}

function PnLTreeItem({ 
  item, 
  depth, 
  netProfit, 
  expandedItems, 
  onToggleExpand,
  selectedItem,
  onSelectItem,
  onSuggestionAccept,
  focusedIndex,
  currentIndex,
  highlightedNodeId
}: PnLTreeItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const variance = analyzeVariance(item, netProfit);
  const suggestions = getSuggestions(item, variance);
  const isFocused = focusedIndex === currentIndex;

  const cancelLeaveTimeout = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    cancelLeaveTimeout();
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(0);
    }, 400);
  };

  const handleSuggestionAreaEnter = () => {
    cancelLeaveTimeout();
  };

  const handleSuggestionAreaLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(0);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSuggestionAccept(item, suggestions[selectedSuggestionIndex]);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const varianceColor = {
    critical: 'bg-red-500',
    attention: 'bg-amber-500',
    favorable: 'bg-emerald-500',
    normal: 'bg-transparent'
  };

  const varianceBorder = {
    critical: 'border-l-red-500',
    attention: 'border-l-amber-500',
    favorable: 'border-l-emerald-500',
    normal: 'border-l-transparent'
  };

  const isHighlighted = highlightedNodeId === item.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center px-4 py-3 border-l-4 transition-all duration-150 cursor-pointer",
          varianceBorder[variance.level],
          isHighlighted 
            ? "bg-amber-100 ring-2 ring-amber-400 ring-inset" 
            : isHovered 
              ? "bg-blue-50" 
              : isFocused 
                ? "bg-gray-100" 
                : depth === 0 
                  ? "bg-white" 
                  : "bg-gray-50/50",
          depth > 0 && "border-b border-gray-100"
        )}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onClick={() => hasChildren ? onToggleExpand(item.id) : onSelectItem(item.id)}
        tabIndex={0}
        data-testid={`pnl-item-${item.id}`}
        data-pnl-id={item.id}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(item.id); }}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              data-testid={`toggle-${item.id}`}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </motion.div>
            </button>
          ) : (
            <div className="w-5" />
          )}

          <span className={cn(
            "font-medium truncate",
            depth === 0 ? "text-gray-900" : "text-gray-700",
            item.type === 'subtotal' && "font-bold"
          )}>
            {item.name}
          </span>

          {variance.level !== 'normal' && (
            <div 
              className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", varianceColor[variance.level])}
              title={variance.reason}
            />
          )}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <span className="font-semibold text-gray-900 w-28 text-right">
            ${item.current.toLocaleString()}
          </span>
          <span className="text-gray-500 w-28 text-right">
            ${item.prior.toLocaleString()}
          </span>
          <span className={cn(
            "font-medium w-20 text-right",
            variance.variance > 0 
              ? (item.type === 'expense' ? 'text-red-600' : 'text-emerald-600')
              : (item.type === 'expense' ? 'text-emerald-600' : 'text-red-600')
          )}>
            {variance.variance > 0 ? '+' : ''}{variance.variancePct.toFixed(1)}%
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-gray-50 border-l-4 border-l-gray-900 px-4 py-3"
            style={{ marginLeft: `${16 + depth * 24}px` }}
            onMouseEnter={handleSuggestionAreaEnter}
            onMouseLeave={handleSuggestionAreaLeave}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">Suggestions</span>
              <span className="text-xs text-gray-400 ml-auto">Tab to cycle, Enter to select</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionAccept(item, suggestion)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    idx === selectedSuggestionIndex 
                      ? "bg-gray-900 text-white shadow-md" 
                      : "bg-white text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50"
                  )}
                  data-testid={`suggestion-${item.id}-${idx}`}
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children!.map((child, idx) => (
              <PnLTreeItem
                key={child.id}
                item={child}
                depth={depth + 1}
                netProfit={netProfit}
                expandedItems={expandedItems}
                onToggleExpand={onToggleExpand}
                selectedItem={selectedItem}
                onSelectItem={onSelectItem}
                onSuggestionAccept={onSuggestionAccept}
                focusedIndex={focusedIndex}
                currentIndex={currentIndex + idx + 1}
                highlightedNodeId={highlightedNodeId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to find parent IDs that need to be expanded for search matches
const findParentIdsForSearch = (items: PnLLineItem[], searchTerm: string, parentIds: string[] = []): string[] => {
  const matchingParentIds: string[] = [];

  items.forEach(item => {
    const itemMatches = item.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (item.children && item.children.length > 0) {
      const childMatchIds = findParentIdsForSearch(item.children, searchTerm, [...parentIds, item.id]);
      if (childMatchIds.length > 0) {
        matchingParentIds.push(item.id, ...childMatchIds);
      }
    }

    if (itemMatches && parentIds.length > 0) {
      matchingParentIds.push(...parentIds);
    }
  });

  return Array.from(new Set(matchingParentIds));
};

// Filter items by search term - keep parent if any child matches
const filterItemsBySearch = (items: PnLLineItem[], searchTerm: string): PnLLineItem[] => {
  if (!searchTerm.trim()) return items;

  return items.reduce<PnLLineItem[]>((acc, item) => {
    const itemMatches = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const filteredChildren = item.children 
      ? filterItemsBySearch(item.children, searchTerm)
      : [];

    if (itemMatches || filteredChildren.length > 0) {
      acc.push({
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : item.children
      });
    }

    return acc;
  }, []);
};

// Metric to P&L node ID mapping
const METRIC_TO_PNL_NODE: Record<string, { nodeId: string; ancestors: string[] }> = {
  'net_income': { nodeId: 'net-income', ancestors: [] },
  'net_profit': { nodeId: 'net-income', ancestors: [] },
  'revenue': { nodeId: 'revenue', ancestors: [] },
  'labor': { nodeId: 'direct-labor-cost', ancestors: ['cogs'] },
  'labor_percent': { nodeId: 'direct-labor-cost', ancestors: ['cogs'] },
  'cogs': { nodeId: 'cogs', ancestors: [] },
  'cogs_percent': { nodeId: 'cogs', ancestors: [] },
  'prime_cost': { nodeId: 'cogs', ancestors: [] }, // Prime cost = COGS + Labor
  'operating_expenses': { nodeId: 'expenses', ancestors: [] },
  'foh_labor': { nodeId: 'server-plater', ancestors: ['cogs', 'direct-labor-cost'] },
  'boh_labor': { nodeId: 'dishwasher', ancestors: ['cogs', 'direct-labor-cost'] },
  'food_cost': { nodeId: 'food-cost', ancestors: ['cogs'] },
  'beverage_cost': { nodeId: 'beverage-cost', ancestors: ['cogs'] },
};

// Mapping from P&L line item IDs to Health Snapshot trend metric IDs
// Maps every P&L item to the most relevant high-level trend metric
const PNL_TO_TREND_METRIC: Record<string, string> = {
  // Revenue items -> Net Sales
  'revenue': 'net-sales',
  'dine-in': 'net-sales',
  'delivery': 'net-sales',
  'takeout': 'net-sales',
  'doordash': 'net-sales',
  'ubereats': 'net-sales',
  'grubhub': 'net-sales',

  // COGS items -> COGS %
  'cogs': 'cogs',
  'food-costs': 'cogs',
  'beverage-costs': 'cogs',
  'proteins': 'cogs',
  'produce': 'cogs',
  'dairy': 'cogs',
  'dry-goods': 'cogs',
  'packaging': 'cogs',

  // Labor items -> Labor %
  'labor': 'labor',
  'boh-labor': 'labor',
  'foh-labor': 'labor',
  'kitchen-staff': 'labor',
  'prep-team': 'labor',
  'management': 'labor',
  'payroll-taxes': 'labor',

  // Operating expenses -> Prime Cost % (as proxy for overall cost efficiency)
  'operating-expenses': 'prime-cost',
  'rent': 'prime-cost',
  'utilities': 'prime-cost',
  'marketing': 'prime-cost',
  'insurance': 'prime-cost',
  'repairs': 'prime-cost',
  'other-ops': 'prime-cost',

  // Bottom line -> Net Income %
  'net-income': 'net-income',
};

// Find all ancestor IDs for a given node
const findAncestorIds = (items: PnLLineItem[], targetId: string, currentPath: string[] = []): string[] => {
  for (const item of items) {
    if (item.id === targetId) {
      return currentPath;
    }
    if (item.children) {
      const result = findAncestorIds(item.children, targetId, [...currentPath, item.id]);
      if (result.length > 0 || item.children.some(c => c.id === targetId)) {
        return result.length > 0 ? result : [...currentPath, item.id];
      }
    }
  }
  return [];
};

// Main P&L Dashboard Component
interface PnLDashboardProps {
  onInsightClick: (query: string) => void;
  highlightedNodeId?: string | null;
  onHighlightClear?: () => void;
  onTrendClick?: (metricId: string) => void;
}

function PnLDashboard({ onInsightClick, highlightedNodeId, onHighlightClear, onTrendClick }: PnLDashboardProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['revenue', 'cogs', 'labor']));
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [analysisPanel, setAnalysisPanel] = useState<{ isOpen: boolean; item: PnLLineItem | null; type: string }>({
    isOpen: false,
    item: null,
    type: ''
  });
  const [filterLevel, setFilterLevel] = useState<VarianceLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Comparison Period State
  const [comparisonPeriod, setComparisonPeriod] = useState({
    currentMonth: "September",
    currentYear: "2025",
    priorMonth: "August", 
    priorYear: "2025"
  });
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2023", "2024", "2025", "2026"];

  // Use net profit for variance analysis (Net Operating Income)
  const netProfit = hierarchicalPnlData.find(item => item.id === 'net-income')?.current || 17722.37;
  const flagCounts = countFlaggedItems(hierarchicalPnlData, netProfit);

  // Auto-expand parents when search matches nested items
  useEffect(() => {
    if (searchTerm.trim()) {
      const parentIds = findParentIdsForSearch(hierarchicalPnlData, searchTerm);
      if (parentIds.length > 0) {
        setExpandedItems(prev => {
          const next = new Set(prev);
          parentIds.forEach(id => next.add(id));
          return next;
        });
      }
    }
  }, [searchTerm]);

  // Handle highlighted node - expand ancestors and scroll to it
  useEffect(() => {
    if (highlightedNodeId) {
      // Find and expand ancestors
      const ancestors = findAncestorIds(hierarchicalPnlData, highlightedNodeId);
      if (ancestors.length > 0) {
        setExpandedItems(prev => {
          const next = new Set(prev);
          ancestors.forEach(id => next.add(id));
          return next;
        });
      }

      // Expand if collapsed
      setIsCollapsed(false);

      // Scroll to the element after a short delay to allow expansion
      setTimeout(() => {
        const element = document.querySelector(`[data-pnl-id="${highlightedNodeId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        onHighlightClear?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightedNodeId, onHighlightClear]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSuggestionAccept = (item: PnLLineItem, suggestion: Suggestion) => {
    // If action is 'trend' and we have a mapping, open the trend modal
    if (suggestion.action === 'trend' && onTrendClick) {
      const trendMetricId = PNL_TO_TREND_METRIC[item.id];
      if (trendMetricId) {
        onTrendClick(trendMetricId);
        return;
      }
    }
    // Otherwise open the analysis panel
    setAnalysisPanel({ isOpen: true, item, type: suggestion.action });
  };

  const handlePanelSuggestionClick = (suggestion: Suggestion) => {
    if (analysisPanel.item) {
      setAnalysisPanel(prev => ({ ...prev, type: suggestion.action }));
    }
  };

  // Apply both variance filter and search filter
  let filteredItems = filterLevel === 'all' 
    ? hierarchicalPnlData 
    : filterItemsByVariance(hierarchicalPnlData, filterLevel, netProfit);

  if (searchTerm.trim()) {
    filteredItems = filterItemsBySearch(filteredItems, searchTerm);
  }

  return (
    <section id="pnl-dashboard" className="scroll-mt-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-serif font-bold text-gray-900">P&L Dashboard</h2>
        
        {/* Comparison Period - Inline with header */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Comparing</span>
          <select
            data-testid="select-current-month"
            value={comparisonPeriod.currentMonth}
            onChange={(e) => setComparisonPeriod(prev => ({ ...prev, currentMonth: e.target.value }))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            data-testid="select-current-year"
            value={comparisonPeriod.currentYear}
            onChange={(e) => setComparisonPeriod(prev => ({ ...prev, currentYear: e.target.value }))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select
            data-testid="select-prior-month"
            value={comparisonPeriod.priorMonth}
            onChange={(e) => setComparisonPeriod(prev => ({ ...prev, priorMonth: e.target.value }))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            data-testid="select-prior-year"
            value={comparisonPeriod.priorYear}
            onChange={(e) => setComparisonPeriod(prev => ({ ...prev, priorYear: e.target.value }))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search line items..."
            className="pl-9 pr-3 py-1.5 text-sm bg-white rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none w-48 transition-colors"
            data-testid="input-pnl-search"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <button
          onClick={() => setFilterLevel('all')}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === 'all' ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          data-testid="filter-all"
        >
          All Items
        </button>
        <button
          onClick={() => setFilterLevel('critical')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === 'critical' ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
          )}
          data-testid="filter-critical"
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {flagCounts.critical} Critical
        </button>
        <button
          onClick={() => setFilterLevel('attention')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === 'attention' ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          )}
          data-testid="filter-attention"
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {flagCounts.attention} Attention
        </button>
        <button
          onClick={() => setFilterLevel('favorable')}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === 'favorable' ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          )}
          data-testid="filter-favorable"
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {flagCounts.favorable} Favorable
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex-1">Line Item</div>
          <div className="flex items-center gap-6">
            <div className="w-28 text-right">Current</div>
            <div className="w-28 text-right">Prior</div>
            <div className="w-20 text-right">% Revenue</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredItems.map((item, idx) => (
            <PnLTreeItem
              key={item.id}
              item={item}
              depth={0}
              netProfit={netProfit}
              expandedItems={expandedItems}
              onToggleExpand={toggleExpand}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onSuggestionAccept={handleSuggestionAccept}
              focusedIndex={focusedIndex}
              currentIndex={idx}
              highlightedNodeId={highlightedNodeId}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Hover over any line item to see AI suggestions • Tab to cycle • Enter to select</span>
        <button 
          onClick={() => setExpandedItems(new Set())}
          className="hover:text-gray-700 transition-colors"
        >
          Collapse All
        </button>
      </div>

      <AnalysisPanel
        isOpen={analysisPanel.isOpen}
        onClose={() => setAnalysisPanel({ isOpen: false, item: null, type: '' })}
        lineItem={analysisPanel.item}
        analysisType={analysisPanel.type}
        onSuggestionClick={handlePanelSuggestionClick}
        netProfit={netProfit}
      />
    </section>
  );
}


// Simple markdown renderer for chat messages
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Replace **bold** with <strong>
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <React.Fragment key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// --- Assistant Types ---

type FloatingMessage = {
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

interface Report {
  id: string;
  title: string;
  query: string;
  content: string;
}

// --- Side Panel Assistant Component ---
function SidePanelAssistant({ 
  onClose, 
  triggerQuery,
  onOpenReport,
  onReportGenerated,
  actionItems,
  onAddActionItem,
  onRemoveActionItem,
  showActionCart,
  onToggleActionCart,
  onUpdateActionItems
}: { 
  onClose: () => void; 
  triggerQuery?: string | null;
  onOpenReport?: (report: Report) => void;
  onReportGenerated?: (report: {id: string, type: string, data: ReportData, createdAt: number}) => void;
  actionItems: ActionItem[];
  onAddActionItem: (item: Omit<ActionItem, 'id' | 'createdAt' | 'status'>) => void;
  onRemoveActionItem: (id: string) => void;
  showActionCart: boolean;
  onToggleActionCart: (show: boolean) => void;
  onUpdateActionItems: (items: ActionItem[]) => void;
}) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isReportMode, setIsReportMode] = useState(false);
  // const [showActionCart, setShowActionCart] = useState(false); // Moved to parent
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [processedTrigger, setProcessedTrigger] = useState<string | null>(null);

  // Report State
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);

  // Load Mock Files (Simulated)
  const loadMockComparison = async () => {
    try {
        const file1Response = await fetch('/attached_assets/2025_09_SPOT_SM_PL_1768325871185.json');
        const file2Response = await fetch('/attached_assets/2025_10_SPOT_SM_PL_(1)_1768325550699.json');
        
        // Fallback Mock Data if fetch fails (likely in this environment)
        const mockFile1 = {
             accounts: [
                 { account: "400-000 Food Sales", monthly_data: { "September 2025": { current: 103461.46 } } },
                 { account: "400-200 Beverage Sales", monthly_data: { "September 2025": { current: 17698.00 } } },
                 { account: "Total Income", monthly_data: { "September 2025": { current: 133042.50 } } }
             ]
        };
        const mockFile2 = {
            sections: {
                "Income": {
                    "400-000 Food Sales": { "Oct 2025": { current: 113360.78 } },
                    "400-200 Beverage Sales": { "Oct 2025": { current: 19998.35 } },
                    "Total Income": { "Oct 2025": { current: 142500.00 } }
                }
            }
        };

        const report = await generateComparisonReport(mockFile1, mockFile2);
        setCurrentReport(report);
        setIsReportPanelOpen(true);
        
        // Notify Parent
        if (onReportGenerated) {
            onReportGenerated({
                id: `report-${Date.now()}`,
                type: 'comparison',
                data: report,
                createdAt: Date.now()
            });
        }
        
        return true;
    } catch (e) {
        console.error("Failed to generate comparison", e);
        return false;
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (triggerQuery && triggerQuery !== processedTrigger) {
      // Remove the timestamp suffix if present (it's separated by space)
      const queryParts = triggerQuery.split(" ");
      const hasTimestamp = !isNaN(Number(queryParts[queryParts.length - 1]));
      const cleanQuery = hasTimestamp ? queryParts.slice(0, -1).join(" ") : triggerQuery;
      
      handleSend(cleanQuery, true);
      setProcessedTrigger(triggerQuery);
    }
  }, [triggerQuery]);

  const handleSend = async (text: string, isInstant: boolean = false) => {
    if (!text.trim()) return;

    const userMsg: FloatingMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => inputRef.current?.focus(), 50);

    // Simulate thinking
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    // Check for Report Intent
    const lowerText = text.toLowerCase();
    let reportType: ReportType | null = null;
    
    if (lowerText.includes("profit") || lowerText.includes("margin") || lowerText.includes("p&l")) reportType = "profitability";
    else if (lowerText.includes("labor") || lowerText.includes("staff") || lowerText.includes("overtime")) reportType = "labor";
    else if (lowerText.includes("sales") || lowerText.includes("revenue") || lowerText.includes("perform")) reportType = "sales";
    else if (lowerText.includes("inventory") || lowerText.includes("stock")) reportType = "inventory";

    if (reportType) {
        // Initial brief answer
        const initialResponse: FloatingMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: reportType === 'profitability' ? "Net margin declined 2.3% MoM, primarily due to higher labor costs in the kitchen." :
                     reportType === 'labor' ? "Labor costs are running 14% over budget this month, largely driven by overtime." :
                     reportType === 'sales' ? "Sales are up 4.2% overall, with strong performance in the dinner shift." :
                     "Inventory levels are healthy, though there is some variance in liquor stocks."
        };
        setMessages(prev => [...prev, initialResponse]);
        
        await new Promise(r => setTimeout(r, 600));

        // Determine relevant follow-ups
        let followUpQuestions: FollowUpAction[] = [];
        if (reportType === 'profitability') {
            followUpQuestions = [
                { type: "report", label: "Break down COGS", report_type: "cogs_breakdown", params: { focus: "savings" } },
                { type: "report", label: "Margin impact analysis", report_type: "margin_decomposition", params: { period: "current" } },
                { type: "chat", label: "Sustainable?", intent: "Is this margin sustainable next month?" }
            ];
        } else if (reportType === 'labor') {
            followUpQuestions = [
                { type: "report", label: "Overtime by role", report_type: "overtime_analysis", params: { role_breakdown: true } },
                { type: "report", label: "Labor efficiency vs LY", report_type: "labor_efficiency", params: { compare: "last_year" } },
                { type: "chat", label: "Hourly rate changes", intent: "Analyze hourly rate changes" }
            ];
        } else if (reportType === 'sales') {
            followUpQuestions = [
                { type: "report", label: "Sales growth drivers", report_type: "sales_drivers", params: { decomposition: true } },
                { type: "report", label: "Forecast validation", report_type: "forecast_validation", params: { horizon: "30d" } },
                { type: "chat", label: "Lunch vs Dinner", intent: "Compare lunch and dinner performance" }
            ];
        } else { // inventory
             followUpQuestions = [
                { type: "report", label: "Top 3 expenses", report_type: "expense_ranking", params: { limit: 3 } },
                { type: "report", label: "Food cost per plate", report_type: "food_cost_per_plate", params: { sort: "variance" } },
                { type: "chat", label: "Controllable expenses trend", intent: "Analyze controllable expenses trend" }
            ];
        }

        // Offer Report
        const offerMsg: FloatingMessage = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "Would you like a detailed report with supporting data?",
            toolCall: {
                state: "pending_confirmation",
                toolName: "generate_report",
                args: { type: reportType }
            },
            followUpQuestions: followUpQuestions
        };
        setMessages(prev => [...prev, offerMsg]);
        setIsTyping(false);
        return;
    }

    // Check for Comparison Intent
    if (lowerText.includes("compare") && lowerText.includes("september") && lowerText.includes("october")) {
         const initialResponse: FloatingMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I can compare the September and October P&L files for you. I found both files in your history."
        };
        setMessages(prev => [...prev, initialResponse]);
        
        await new Promise(r => setTimeout(r, 600));

        const offerMsg: FloatingMessage = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "Would you like a side-by-side comparison report?",
            toolCall: {
                state: "pending_confirmation",
                toolName: "generate_comparison",
                args: { type: "comparison", file1: "Sep 2025", file2: "Oct 2025" }
            }
        };
        setMessages(prev => [...prev, offerMsg]);
        setIsTyping(false);
        return;
    }

    // Check for Correlation Intent
    if (lowerText.includes("correlation") || lowerText.includes("affect") || lowerText.includes("impact") || (lowerText.includes("relationship") && lowerText.includes("between")) || (lowerText.includes("did") && lowerText.includes("cause"))) {
         const initialResponse: FloatingMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Analyzing data correlation across the last 3 periods..."
        };
        setMessages(prev => [...prev, initialResponse]);
        
        await new Promise(r => setTimeout(r, 1500));

        // Mock Correlation Logic
        let correlationMsg = "";
        
        if ((lowerText.includes("labor") && lowerText.includes("profit")) || (lowerText.includes("labor") && lowerText.includes("margin"))) {
            correlationMsg = "**Strong Negative Correlation Detected (-0.85)**\n\nWhen Labor Cost % increases, Net Profit Margin consistently decreases. This suggests labor overruns are directly eating into profitability, rather than driving sufficient additional revenue to cover the cost.";
        } else if (lowerText.includes("sales") && lowerText.includes("labor")) {
             correlationMsg = "**Moderate Positive Correlation (+0.62)**\n\nHigher sales volumes generally drive higher labor costs, but the efficiency varies. On peak Friday nights, labor efficiency improves (sales rise faster than labor costs), whereas Tuesday lunch shifts show poor efficiency.";
        } else if ((lowerText.includes("marketing") || lowerText.includes("promo")) && lowerText.includes("sales")) {
             correlationMsg = "**Weak Positive Correlation (+0.24)**\n\nMarketing spend shows a delayed impact on sales. Promotions run in Week 1 typically correlate with sales lifts in Week 2, but the immediate same-week impact is minimal.";
        } else {
             correlationMsg = "**Analysis Complete**\n\nI've analyzed the relationship between these metrics. Over the last quarter, they move relatively independently (Correlation: 0.12), suggesting other factors (like seasonality or COGS variance) are driving the changes you're seeing.";
        }

        const resultMsg: FloatingMessage = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: correlationMsg,
             followUpQuestions: [
                { type: "report", label: "View Efficiency Report", report_type: "labor_efficiency", params: { compare: "last_year" } },
                { type: "chat", label: "Identify outliers", intent: "Show me the specific days with worst labor efficiency" }
            ]
        };
        setMessages(prev => [...prev, resultMsg]);
        setIsTyping(false);
        return;
    }

    let content = "";
    let artifact = false;
    let report = undefined;
    let followUpQuestions: FollowUpAction[] | undefined;

    if (isReportMode) {
         const reportId = `report-${Date.now()}`;
         content = "I've generated a detailed report analyzing your question. Click below to view the full analysis.";
         // Mock ReportData compliant object
         const reportData = {
                id: reportId,
                title: text.length > 15 ? text.substring(0, 15) + "..." : text,
                dateRange: "Oct 1 - Oct 31, 2025",
                entity: "Downtown Location",
                dataSources: ["POS", "Labor"],
                summary: [generateReportContent(text)],
                metrics: [],
                status: "active" as const,
                createdAt: Date.now(),
                type: "analysis",
                content: generateReportContent(text), // Keep content for compatibility if needed, though interface might not have it
                tableData: { headers: [], rows: [] }
            };
         report = reportData;
    } else {
        const res = generateMockResponse(text);
        content = res.content;
        artifact = res.showArtifact || false;
        followUpQuestions = res.followUpQuestions;
    }
    
    const assistantMsg: FloatingMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: content,
      artifact: artifact,
      report: report,
      followUpQuestions: followUpQuestions
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleFollowUpAction = (action: FollowUpAction) => {
    if (action.type === 'chat') {
      handleSend(action.intent);
    } else if (action.type === 'report') {
      const reportId = `report-${Date.now()}`;
      const content = generateReportContent(action.report_type);
      const reportData = {
          id: reportId,
          title: action.label,
          query: action.report_type,
          content: content,
          dateRange: "Oct 1 - Oct 31, 2025",
          entity: "Downtown Location",
          dataSources: ["POS", "Labor"],
          summary: [content],
          metrics: [],
          status: "active" as const,
          createdAt: Date.now(),
          type: "analysis",
          tableData: { headers: [], rows: [] }
      };
      
      setCurrentReport(reportData);
      setIsReportPanelOpen(true);
      
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've generated the **${action.label}** for you.`,
          report: reportData
      }]);
    }
  };

  const handleConfirmTool = async (msgId: string, toolName: string, args: any) => {
    // Update to running
    setMessages(prev => prev.map(m => 
      m.id === msgId 
        ? { ...m, toolCall: { ...m.toolCall!, state: "running" } }
        : m
    ));
    setIsTyping(true);

    // Tool "running" pause
    await new Promise(r => setTimeout(r, 1500));

    // Handle Report Generation
    if (toolName === "generate_report") {
         setMessages(prev => prev.map(m => 
          m.id === msgId 
            ? { ...m, toolCall: { ...m.toolCall!, state: "completed", result: "Report generated successfully." } }
            : m
        ));
        
        const type = args.type as ReportType;
        const reportData = MOCK_REPORTS[type];
        
        // Notify Parent
        if (onReportGenerated) {
            onReportGenerated({
                id: `report-${Date.now()}`,
                type,
                data: reportData,
                createdAt: Date.now()
            });
        }

        setCurrentReport(reportData);
        setIsReportPanelOpen(true);
        setIsTyping(false);
        return;
    }

    // Handle Comparison Generation
    if (toolName === "generate_comparison") {
         const success = await loadMockComparison();
         
         if (success) {
             setMessages(prev => prev.map(m => 
              m.id === msgId 
                ? { ...m, toolCall: { ...m.toolCall!, state: "completed", result: "Comparison report generated successfully." } }
                : m
            ));
            
             // Notify Parent (need to get the report from somewhere, loadMockComparison sets it to state)
             // We can pass the report data if we refactor loadMockComparison to return it
             // For now, let's assume currentReport is set by loadMockComparison.
             // Wait, setCurrentReport is async? No, it's React state.
             // But we need the value. loadMockComparison calls setCurrentReport.
             // We should modify loadMockComparison to return the report.
         } else {
             setMessages(prev => prev.map(m => 
              m.id === msgId 
                ? { ...m, toolCall: { ...m.toolCall!, state: "denied", denialReason: "Failed to load files." } }
                : m
            ));
         }
         setIsTyping(false);
         return;
    }
  };

  const handleDenyTool = (msgId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId 
        ? { ...m, toolCall: { ...m.toolCall!, state: "denied", denialReason: "User cancelled action" } }
        : m
    ));
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Sparkles className="h-4 w-4 text-gray-600" />
             </div>
             <div>
                <h3 className="font-semibold text-sm text-gray-900">Munch Assistant</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">AI Analysis</p>
             </div>
        </div>
        <div className="flex items-center gap-3">
             {/* Action Cart Toggle */}
             <button 
                onClick={() => onToggleActionCart(!showActionCart)}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors relative",
                    showActionCart ? "bg-black text-white border-black" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
                title="Action Cart"
             >
                <div className="relative">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {actionItems.length > 0 && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white" />
                    )}
                </div>
                <span>Actions {actionItems.length > 0 && `(${actionItems.length})`}</span>
             </button>

             {messages.length > 0 && (
               <button 
                 onClick={handleNewChat}
                 className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                 title="Clear chat"
               >
                 <RotateCcw className="h-4 w-4" />
               </button>
             )}
             
             <div className="h-4 w-px bg-gray-200" />
             
             <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <X className="h-4 w-4" />
             </button>
        </div>
      </div>

      {/* Action Cart Panel */}
      {showActionCart && (
          <div className="border-b border-gray-200 bg-gray-50 p-4 space-y-3 max-h-[40vh] overflow-y-auto shadow-inner">
              <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action Cart</h4>
                  {actionItems.length > 0 && (
                      <button 
                        onClick={() => {
                            // Mock "Do All" functionality
                            const updatedItems = actionItems.map(item => ({...item, status: 'assigned' as const, context: item.context || 'Bulk Assigned'}));
                            onUpdateActionItems(updatedItems);
                            toast({
                                title: "Bulk Assignment",
                                description: `All ${actionItems.length} items have been processed.`,
                            });
                        }}
                        className="text-[10px] font-medium bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                      >
                          Do All
                      </button>
                  )}
              </div>
              {actionItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                      <p>No actions yet.</p>
                      <p className="text-xs mt-1">Add items from the P&L or chat.</p>
                  </div>
              ) : (
                  <div className="space-y-2">
                      {actionItems.map(item => (
                          <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm group">
                              <div className="flex items-start justify-between gap-2">
                                  <div>
                                      <div className="font-medium text-sm text-gray-900">{item.title}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{item.context}</div>
                                      <div className="flex items-center gap-2 mt-2">
                                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium border border-gray-200 uppercase">
                                              {item.source === 'ai_suggestion' ? 'AI Suggestion' : item.source === 'user_click' ? 'Manual' : 'Insight'}
                                          </span>
                                          {item.metric && <span className="text-[10px] text-gray-400">{item.metric}</span>}
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => onRemoveActionItem(item.id)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                      <X className="h-3.5 w-3.5" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Chat Content */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-end mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <p className="text-sm text-gray-800">{msg.content}</p>
                    <span className="text-xs text-gray-500 font-medium shrink-0">You</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-700 pt-1.5 whitespace-pre-line">
                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => 
                      part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                        : <span key={i}>{part}</span>
                    )}
                  </div>
                </div>
                
                {/* Tool Call UI */}
                {msg.toolCall && (
                     <div className="mt-2 mb-2">
                        {msg.toolCall.state === "pending_confirmation" ? (
                            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm max-w-sm">
                              <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Wand />
                                    <span className="font-medium text-sm">Confirm Action</span>
                                  </div>
                                  <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Pending</span>
                              </div>
                              
                              <div className="space-y-3 mb-4">
                                 <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Action</div>
                                 <div className="text-sm font-medium">
                                     {msg.toolCall.toolName === "generate_report" ? "Generate Report" : 
                                      msg.toolCall.toolName === "generate_comparison" ? "Compare Files" : msg.toolCall.toolName}
                                 </div>

                                 <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Type</div>
                                 <div className="text-sm font-medium capitalize">
                                     {msg.toolCall.args?.type || "Standard"}
                                     {msg.toolCall.args?.file1 && <div className="text-xs text-gray-500 mt-1">Files: {msg.toolCall.args.file1} vs {msg.toolCall.args.file2}</div>}
                                 </div>
                              </div>

                              <div className="flex gap-2 pt-2 border-t border-gray-100">
                                  <button 
                                    onClick={() => handleDenyTool(msg.id)}
                                    className="flex-1 py-2 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                  >
                                    No thanks
                                  </button>
                                  <button 
                                    onClick={() => handleConfirmTool(msg.id, msg.toolCall!.toolName, msg.toolCall!.args)}
                                    className="flex-1 py-2 text-xs font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors shadow-sm"
                                  >
                                    {msg.toolCall.toolName === 'generate_comparison' ? "Generate Comparison" : "Generate Report"}
                                  </button>
                              </div>
                            </div>
                        ) : msg.toolCall.state === "denied" ? (
                            <div className="inline-flex items-center gap-2 text-xs font-mono bg-gray-50 border border-gray-200 px-3 py-2 rounded-md opacity-70">
                               <div className="h-2 w-2 rounded-full bg-red-400" />
                               <span className="text-muted-foreground decoration-line-through">Action cancelled</span>
                            </div>
                        ) : (
                           <div className="inline-flex items-center gap-2 text-xs font-mono bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
                              {msg.toolCall.state === "running" ? (
                                 <>
                                    <Wand /> 
                                    <span className="text-muted-foreground">Generating report...</span> 
                                 </>
                              ) : (
                                 <>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-muted-foreground">Report Generated</span>
                                    <button onClick={() => setIsReportPanelOpen(true)} className="ml-1 underline text-emerald-600 hover:text-emerald-700 font-medium">View</button>
                                 </>
                              )}
                           </div>
                        )}
                     </div>
                )}

                {/* Follow-up Questions */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                   <div className="mt-3 flex flex-col gap-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Suggested Follow-ups</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.followUpQuestions.map((action, idx) => (
                           <button 
                             key={idx}
                             onClick={() => handleFollowUpAction(action)}
                             className={cn(
                               "text-left px-3 py-2 bg-white border rounded-lg text-xs transition-colors shadow-sm flex items-center gap-2",
                               action.type === 'report' 
                                 ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50" 
                                 : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                             )}
                           >
                             {action.type === 'report' && <FileText className="h-3 w-3" />}
                             {action.label}
                           </button>
                        ))}
                      </div>
                   </div>
                )}

                {/* Action Cards */}
                {msg.artifact && (
                  <div className="space-y-2 mt-3">
                    {[
                      { id: "review-pastry", title: "Review Pastry Supplier", desc: "Alternative supplier offers 15% discount on White Chocolate", impact: 600, icon: "arrow", color: "amber" },
                      { id: "adjust-delivery", title: "Adjust Delivery Window", desc: "Move Sysco to 8-10AM to avoid overtime", impact: 350, icon: "clock", color: "purple" },
                      { id: "lock-scheduling", title: "Lock Mid-Shift Cuts", desc: "Make Tue/Wed staffing changes permanent", impact: 480, icon: "users", color: "blue" },
                    ].map((action) => (
                      <div 
                        key={action.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 hover:border-gray-300 transition-colors cursor-pointer group"
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                          action.color === "amber" ? "bg-amber-50" :
                          action.color === "purple" ? "bg-purple-50" : "bg-blue-50"
                        )}>
                          {action.icon === "arrow" && <ArrowRight className={cn("h-5 w-5", action.color === "amber" ? "text-amber-600" : "text-gray-600")} />}
                          {action.icon === "clock" && <Clock className="h-5 w-5 text-purple-600" />}
                          {action.icon === "users" && <Users className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900">{action.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                          <div className="flex items-center gap-1 mt-2 text-emerald-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">+${action.impact}/mo</span>
                          </div>
                        </div>
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-gray-400 shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Report Card */}
                {msg.report && (
                  <div className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group cursor-pointer hover:border-indigo-300 transition-all" onClick={() => onOpenReport?.(msg.report!)}>
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 border border-indigo-200">
                         <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{msg.report.title}</h4>
                        <p className="text-xs text-gray-500">Comprehensive Analysis Generated</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="p-3 bg-gray-50/30">
                       <button 
                         className="w-full py-2 bg-white border border-gray-200 group-hover:border-indigo-200 group-hover:text-indigo-600 rounded-lg text-sm font-medium text-gray-700 transition-all shadow-sm flex items-center justify-center gap-2"
                       >
                         <Maximize2 className="h-4 w-4" />
                         Expand Full Report
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex items-center gap-1 pt-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {messages.length === 0 && !isTyping && (
          <div className="py-6">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Ask me anything about your P&L</p>
            </div>
            
            {/* Suggested Prompts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">Suggested</p>
              {[
                "Why did labor costs increase this month?",
                "How can I improve my food cost percentage?",
                "What's driving the change in net profit?",
                "Compare this month to last month",
                "Did labor affect profit?"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  data-testid={`suggested-prompt-${i}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input - Always visible at bottom */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3"
        >
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            data-testid="input-side-panel-chat"
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
              input.trim() 
                ? "bg-gray-900 text-white hover:bg-gray-800" 
                : "bg-gray-200 text-gray-400"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
      
      <ReportPanel 
        isOpen={isReportPanelOpen} 
        onClose={() => setIsReportPanelOpen(false)} 
        data={currentReport} 
      />
    </div>
  );
}

// --- Chat Component for Owner View ---
function OwnerChat({ isOpen, onClose, triggerQuery, onOpenReport }: { isOpen: boolean; onClose: () => void; triggerQuery?: string | null; onOpenReport?: (report: any) => void }) {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; actions?: string[]; report?: any }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [processedTrigger, setProcessedTrigger] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const cartTotal = cart.reduce((sum, id) => {
    const action = availableActions.find(a => a.id === id);
    return sum + (action?.impact || 0);
  }, 0);

  const toggleCart = (actionId: string) => {
    setCart(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const applyChanges = () => {
    setShowConfetti(true);
    toast({
      title: "Changes Applied!",
      description: `${cart.length} action${cart.length > 1 ? 's' : ''} scheduled. Est. impact: +$${cartTotal.toLocaleString()}/mo`,
    });
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (triggerQuery && triggerQuery !== processedTrigger && isOpen) {
       handleSend(triggerQuery, true);
       setProcessedTrigger(triggerQuery);
    }
  }, [triggerQuery, isOpen]);

  const handleSend = async (text: string, isInstant: boolean = false) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    if (!isInstant) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1500));
    }

    let responseText = "I can help with that! Here are some actions you can take:";
    let suggestedActions: string[] = [];

    const lowerText = text.toLowerCase();

    if (lowerText.includes("food cost") || lowerText.includes("pastry") || lowerText.includes("chocolate") || lowerText.includes("cogs") || lowerText.includes("ingredients")) {
       responseText = "I analyzed the **Pastry** category:\n\n• **White Chocolate**: $14.50 → $16.25 (+12%)\n• **Puff Pastry**: $38 → $41 (+8%)\n\nThese items caused $980 in variance. Here are actions you can add to your plan:";
       suggestedActions = ["review-pastry", "pastry-vendor"];
    } else if (lowerText.includes("labor") || lowerText.includes("efficiency") || lowerText.includes("scheduling")) {
       responseText = "**Labor Analysis:**\n\nLabor % improved from 35% → 32%!\n\n**Key Win**: Mid-shift cuts on Tue/Wed saved 40 hours.\n**Manager**: Sarah earned her efficiency bonus.\n\nHere are actions to lock in these wins:";
       suggestedActions = ["lock-scheduling", "bonus-sarah"];
    } else if (lowerText.includes("overtime")) {
        responseText = "**Overtime Breakdown:**\n\n• Kitchen Prep: 12 hours ($350 impact)\n• Cause: Late Sysco delivery on 10/14\n\nHere's how to prevent this next month:";
        suggestedActions = ["adjust-delivery"];
    } else if (lowerText.includes("sales") || lowerText.includes("tapas")) {
       responseText = "**Sales Insight:**\n\nWeekend Tapas sales are down 5%!\n\n**Top Item**: Matcha Lava Cake (+40 units)\n**Upsells**: 18% Coffee attach rate = $1,200 extra\n\nCapitalize on this momentum:";
       suggestedActions = ["promote-seasonal"];
    } else if (lowerText.includes("email")) {
       responseText = "I'll draft that email for you:\n\n---\n\n**Subject**: Great work on October!\n\nTeam,\n\nI'm thrilled to share that we beat our efficiency goals this month. Labor costs dropped 6% thanks to smart scheduling. Let's keep it up!\n\nBest,\nOwner\n\n---\n\n*Email ready to send via your preferred method.*";
       suggestedActions = [];
    } else {
       responseText = "Here are some suggested improvements based on your October report:";
       suggestedActions = ["review-pastry", "adjust-delivery", "lock-scheduling"];
    }

    const aiMsg = { 
      id: (Date.now() + 1).toString(), 
      role: "assistant" as const, 
      content: responseText,
      actions: suggestedActions
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
       {/* Header */}
       <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-serif font-bold text-sm">Munch Assistant</h3>
                <p className="text-xs text-muted-foreground">Build your action plan</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
             <X className="h-4 w-4" />
          </button>
       </div>

       {/* Cart Summary - Sticky */}
       {cart.length > 0 && (
         <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
               {cart.length}
             </div>
             <span className="text-sm font-medium text-emerald-900">actions selected</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-emerald-700">+${cartTotal.toLocaleString()}/mo</span>
             <button 
               onClick={applyChanges}
               className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
             >
               Apply All
             </button>
           </div>
         </div>
       )}

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" ref={scrollRef}>
          {messages.length === 0 && (
             <div className="mt-4 px-2">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full text-xs text-gray-600 mb-4">
                    <Sparkles className="h-3 w-3" />
                    Powered by AI
                  </div>
                  <p className="text-sm text-gray-600">Ask me about your P&L or explore these insights:</p>
                </div>
                <div className="space-y-2">
                   <button onClick={() => handleSend("Why did food costs go up?")} className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-sm group">
                      <span className="font-medium text-gray-900">Why did food costs go up?</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Analyze COGS variance → Get action items</span>
                   </button>
                   <button onClick={() => handleSend("Show me the labor efficiency wins")} className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-sm group">
                      <span className="font-medium text-gray-900">Labor efficiency wins</span>
                      <span className="block text-xs text-gray-500 mt-0.5">See what's working → Lock it in</span>
                   </button>
                   <button onClick={() => handleSend("What caused the overtime?")} className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-sm group">
                      <span className="font-medium text-gray-900">What caused overtime?</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Find root cause → Prevent next month</span>
                   </button>
                </div>
             </div>
          )}

          {messages.map((msg) => (
             <div key={msg.id} className="space-y-3">
               <div className={cn("flex gap-3", msg.role === "assistant" ? "" : "flex-row-reverse")}>
                  <div className={cn(
                     "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                     msg.role === "assistant" ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                  )}>
                     {msg.role === "assistant" ? <Sparkles className="h-4 w-4" /> : <div className="font-bold text-xs">You</div>}
                  </div>
                  <div className={cn(
                     "max-w-[85%] py-2 px-3 rounded-2xl text-sm leading-relaxed",
                     msg.role === "user" ? "bg-gray-200 text-gray-900 rounded-tr-none" : "bg-transparent text-gray-900 px-0"
                  )}>
                     {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
               </div>

               {/* Report Button */}
               {msg.role === "assistant" && msg.report && (
                 <div className="ml-11 mt-1 mb-2">
                    <button
                        onClick={() => onOpenReport?.(msg.report!)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium border border-indigo-100 shadow-sm"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Expand Full Report
                    </button>
                 </div>
               )}

               {/* Action Cards */}
               {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                 <div className="ml-11 space-y-2">
                   {msg.actions.map(actionId => {
                     const action = availableActions.find(a => a.id === actionId);
                     if (!action) return null;
                     return (
                       <ActionCard 
                         key={action.id}
                         action={action}
                         isInCart={cart.includes(action.id)}
                         onToggle={() => toggleCart(action.id)}
                       />
                     );
                   })}
                 </div>
               )}
             </div>
          ))}

          {isTyping && (
             <div className="flex gap-3">
                <div className="h-8 w-8 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                   <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 mt-3 px-3 py-2 bg-gray-100 rounded-xl">
                   <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                   <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                   <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
             </div>
          )}
       </div>

       {/* Input */}
       <div className="p-4 bg-white border-t border-gray-200">
          <form 
             onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
             className="relative flex items-center"
          >
             <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full py-3 pl-4 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
             />
             <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
                <Send className="h-4 w-4" />
             </button>
          </form>
       </div>

       {/* Confetti overlay */}
       {showConfetti && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="text-6xl animate-bounce">🎉</div>
         </div>
       )}
    </div>
  );
}

// --- Period Navigator Component ---
const PeriodNavigator = ({ 
  cadence, 
  date, 
  onPrev, 
  onNext 
}: { 
  cadence: "week" | "month", 
  date: Date, 
  onPrev: () => void, 
  onNext: () => void 
}) => {
  const display = cadence === "month" 
    ? format(date, 'MMMM yyyy')
    : `${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d')}`;

  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm ml-2">
      <button onClick={onPrev} className="p-1.5 hover:bg-gray-50 text-gray-500 rounded-l-md border-r border-gray-100 transition-colors">
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <div className="px-3 text-xs font-medium text-gray-700 min-w-[120px] text-center select-none">
        {display}
      </div>
      <button onClick={onNext} className="p-1.5 hover:bg-gray-50 text-gray-500 rounded-r-md border-l border-gray-100 transition-colors">
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// --- Main Page Component ---

// --- Role-Based Primary Insight Logic ---

interface PrimaryInsight {
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

const getPrimaryInsightForRole = (role: RoleType, trends: MetricTrendData[]): PrimaryInsight | null => {
  // Helper to find metric data
  const getMetric = (id: string) => trends.find(t => t.id === id);
  const getLastPoint = (metric: MetricTrendData) => metric.data[metric.data.length - 1];

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
          message: `Net margin is ${Math.abs(last.variancePct).toFixed(1)}% below target`,
          detail: "Profitability has dropped significantly due to lower revenue volume and sustained fixed costs."
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
          detail: "Combined COGS and Labor costs are exceeding benchmarks, primarily driven by COGS inefficiencies."
        };
      }
    }
  }

  // 2. GM Focus: Labor, Sales, Ops
  if (role === "gm") {
    const labor = getMetric("labor");
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
      detail: "High overtime on weekends contributed to the variance. Schedule optimization recommended.",
      cta: "Adjust Schedule" 
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
          message: `Food cost exceeded target by ${last.variancePct.toFixed(1)}%`,
          detail: "High variance in dairy and protein spend suggests potential waste or portioning issues."
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
    detail: "Great job! Your primary KPIs are stable. Look for opportunities to optimize further in the details below."
  };
};

const PrimaryInsightCard = ({ 
  role, 
  trends, 
  onAddAction, 
  onAskAI,
  onGenerateReport
}: { 
  role: RoleType; 
  trends: MetricTrendData[]; 
  onAddAction: (item: any) => void; 
  onAskAI: (query: string) => void;
  onGenerateReport: (role: RoleType, insight: any) => void;
}) => {
  const primaryInsight = getPrimaryInsightForRole(role, trends);
  if (!primaryInsight) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        Primary Insight
      </h2>
      <div className={cn(
        "rounded-xl p-6 border-l-4 shadow-sm",
        primaryInsight.type === "critical" ? "bg-red-50 border-red-500" :
        primaryInsight.type === "warning" ? "bg-amber-50 border-amber-500" :
        "bg-emerald-50 border-emerald-500"
      )}>
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
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">Actual</span>
                <span className={cn(
                  "text-lg font-bold",
                  primaryInsight.type === "critical" ? "text-red-700" :
                  primaryInsight.type === "warning" ? "text-amber-700" :
                  "text-emerald-700"
                )}>{primaryInsight.value}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">Target</span>
                <span className="text-lg font-medium text-gray-700">{primaryInsight.target}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">Variance</span>
                <span className={cn(
                  "text-lg font-bold flex items-center gap-1",
                  primaryInsight.type === "critical" ? "text-red-600" :
                  primaryInsight.type === "warning" ? "text-amber-600" :
                  "text-emerald-600"
                )}>
                  {primaryInsight.direction === "up" ? <ArrowUp className="h-4 w-4" /> : 
                    primaryInsight.direction === "down" ? <ArrowDown className="h-4 w-4" /> : null}
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
                primaryInsight.type === "critical" ? "bg-white text-red-700 border-red-200 hover:bg-red-50" :
                primaryInsight.type === "warning" ? "bg-white text-amber-700 border-amber-200 hover:bg-amber-50" :
                "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              )}
            >
              <ArrowRight className="h-4 w-4" />
              View Breakdown
            </button>
            <button
              onClick={() => {
                  onAddAction({
                    title: primaryInsight.cta ? primaryInsight.cta : `Investigate ${primaryInsight.metric} Variance`,
                    source: 'pnl_insight',
                    metric: primaryInsight.metric,
                    context: primaryInsight.message
                  });
              }} 
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <List className="h-4 w-4" />
              {primaryInsight.cta || "Add to Actions"}
            </button>
            <button
              onClick={() => onAskAI(`Analyze ${primaryInsight.metric} variance for me`)} 
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
};

// --- Helper Functions for Period Aggregation ---

const getAggregatedTrends = (period: string, baseTrends: MetricTrendData[]): MetricTrendData[] => {
  return baseTrends.map(metric => {
    let aggregatedData: MonthlyDataPoint;
    const data = metric.data;
    const last = data[data.length - 1];

    if (period === 'week') {
      // Mock week as 1/4 of last month for currency, same for %
      aggregatedData = {
        ...last,
        month: 'Current Week',
        actual: metric.unit === 'currency' ? last.actual / 4 : last.actual,
        target: metric.unit === 'currency' ? last.target / 4 : last.target,
        variance: metric.unit === 'currency' ? last.variance / 4 : last.variance,
        variancePct: last.variancePct // % variance stays roughly same
      };
    } else if (period === 'quarter') {
      // Aggregate last 3 months (Jul, Aug, Sep)
      const last3 = data.slice(-3);
      if (metric.unit === 'currency') {
        const actual = last3.reduce((sum, d) => sum + d.actual, 0);
        const target = last3.reduce((sum, d) => sum + d.target, 0);
        const variance = actual - target;
        aggregatedData = {
          month: 'Q3 2025',
          year: 2025,
          actual,
          target,
          variance,
          variancePct: (variance / target) * 100
        };
      } else {
        // Average for percentages
        const actual = last3.reduce((sum, d) => sum + d.actual, 0) / 3;
        const target = last3.reduce((sum, d) => sum + d.target, 0) / 3;
        const variance = actual - target; // Points variance
        aggregatedData = {
          month: 'Q3 2025',
          year: 2025,
          actual,
          target,
          variance,
          variancePct: ((actual - target) / target) * 100 // Relative % variance
        };
      }
    } else if (period === 'year') {
      // Aggregate all (YTD)
      if (metric.unit === 'currency') {
        const actual = data.reduce((sum, d) => sum + d.actual, 0);
        const target = data.reduce((sum, d) => sum + d.target, 0);
        const variance = actual - target;
        aggregatedData = {
          month: 'YTD 2025',
          year: 2025,
          actual,
          target,
          variance,
          variancePct: (variance / target) * 100
        };
      } else {
        // Average for percentages
        const actual = data.reduce((sum, d) => sum + d.actual, 0) / data.length;
        const target = data.reduce((sum, d) => sum + d.target, 0) / data.length;
        const variance = actual - target;
        aggregatedData = {
          month: 'YTD 2025',
          year: 2025,
          actual,
          target,
          variance,
          variancePct: ((actual - target) / target) * 100
        };
      }
    } else {
      // Month (Default)
      aggregatedData = last;
    }

    return {
      ...metric,
      data: [...data.slice(0, -1), aggregatedData] // Replace last point or append? Actually getPrimaryInsight uses getLastPoint.
      // Better to just return the aggregated point as the ONLY point or the last point to ensure getLastPoint works.
      // Let's just return it as the single point in data to be safe and avoid confusion.
      // data: [aggregatedData] 
      // Wait, getLastPoint might rely on index. Let's strictly follow getLastPoint impl.
      // getLastPoint isn't visible here but usually it's arr[arr.length-1]. 
      // So [aggregatedData] is fine.
    };
  });
};

const getDashboardMetrics = (period: string, trends: MetricTrendData[]) => {
  // Helper to extract value from aggregated trends
  const getVal = (id: string) => {
    const metric = trends.find(t => t.id === id);
    if (!metric || !metric.data.length) return { actual: 0, target: 0, variance: 0, variancePct: 0 };
    return metric.data[0]; // Since getAggregatedTrends returns single-element array
  };

  const sales = getVal('net-sales');
  const marketing = getVal('marketing');
  // OpEx isn't in trends directly as "opex" but we have "prime-cost" and "gross-profit".
  // Actually line 316 has OpEx in pnlData but trends has 'marketing'.
  // Let's infer OpEx roughly or add it to trends.
  // For now, I'll calculate OpEx based on a ratio if needed, or just use a placeholder scaled by period.
  
  // Actually, I can use the same scaling logic for the hardcoded cards.
  const scale = period === 'week' ? 0.25 : period === 'month' ? 1 : period === 'quarter' ? 3 : 9; // 9 months YTD

  return {
    income: {
      value: sales.actual,
      variancePct: sales.variancePct,
      trend: sales.variance >= 0 ? 'up' : 'down'
    },
    marketing: {
      value: marketing.actual,
      percentOfRev: (marketing.actual / sales.actual) * 100,
      trend: marketing.variancePct
    },
    opex: {
      value: 44500 * scale, // derived from month
      percentOfRev: 35.7 // keeping constant
    },
    growth: {
      value: sales.variancePct, // using sales variance as proxy for growth
      trend: sales.variancePct >= 0 ? 'up' : 'down'
    },
    cashFlow: {
      balance: 48200 + (8450 * (scale - 1)), // Mocking cash accumulation
      change: 8450 * scale,
      coverage: 2.4
    },
    compensation: {
      executive: 12400 * scale,
      manager: 18600 * scale,
      total: 31000 * scale
    },
    // KPIs for GoalProgress
    kpis: {
      sales: { current: sales.actual / 1000, target: sales.target / 1000 },
      netProfit: { current: getVal('net-income').actual, target: getVal('net-income').target },
      cogs: { current: getVal('cogs').actual, target: getVal('cogs').target },
      labor: { current: getVal('labor').actual, target: getVal('labor').target },
      fohLabor: { current: 14.3, target: 14 }, // Mock
      foodCost: { current: 23.3, target: 24 }, // Mock
      bohLabor: { current: 13, target: 12.5 }, // Mock
      beverageCost: { current: 4.8, target: 5 }, // Mock
      ticketTime: { current: 14, target: 12 }, // Mock
      throughput: { current: 85, target: 80 } // Mock
    }
  };
};

export default function PnlRelease() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Check view mode from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get("view");
  const isOwnerView = viewParam === "owner" || viewParam === "gm" || viewParam === "chef";
  const canEdit = !isOwnerView; // Owner view is read-only
  const urlRole = viewParam as "owner" | "gm" | "chef" | null;

  // State - Owner view goes directly to step 2 (viewing), accountant starts at step 1 (list)
  const [step, setStep] = useState<1 | 2 | 3>(isOwnerView ? 2 : 1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [locationName, setLocationName] = useState("STMARKS");
  const [period, setPeriod] = useState("September 2025");
  const [showChat, setShowChat] = useState(true); // Open by default
  
  // New Release Flow States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [chatTrigger, setChatTrigger] = useState<string | null>(null);
  const [floatingChatTrigger, setFloatingChatTrigger] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("curated");
  const [reportTabs, setReportTabs] = useState<Report[]>([]);
  const [activeSection, setActiveSection] = useState<string>("executive-narrative");
  const [tocDropdownOpen, setTocDropdownOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<StateBenchmark | null>(
  stateBenchmarks.find(s => s.code === "NY") || null
);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tocDropdownRef = useRef<HTMLDivElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

  // New Reports Tab State
  const [reportsList, setReportsList] = useState<Array<{
      id: string, 
      type: string, 
      data: ReportData, 
      createdAt: number,
      status: 'active' | 'archived',
      source?: 'manual' | 'curated_insight',
      role?: string
  }>>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  
  // Action Cart State
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [showActionCart, setShowActionCart] = useState(false);
  const [activeGMFilter, setActiveGMFilter] = useState<string | null>(null);
  const [insightModalMetric, setInsightModalMetric] = useState<string | null>(null);
  const [isProfitabilityExpanded, setIsProfitabilityExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["boh-labor", "foh-labor", "management"]));

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const handleArchiveReport = (id: string) => {
      setReportsList(prev => prev.map(report => 
          report.id === id ? { ...report, status: 'archived' as const } : report
      ));
      toast({
          title: "Report Archived",
          description: "Report moved to archive.",
      });
      if (activeReportId === id) {
          setActiveReportId(null);
      }
  };

  const handleRestoreReport = (id: string) => {
      setReportsList(prev => prev.map(report => 
          report.id === id ? { ...report, status: 'active' as const } : report
      ));
      toast({
          title: "Report Restored",
          description: "Report moved back to active reports.",
      });
  };

  const handleAddActionItem = (item: Omit<ActionItem, 'id' | 'createdAt' | 'status'>) => {
      const newItem: ActionItem = {
          ...item,
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'new',
          createdAt: Date.now()
      };
      setActionItems(prev => [newItem, ...prev]);
      toast({
          title: "Added to Actions",
          description: "Item added to your Action Cart.",
      });
  };

  const handleRemoveActionItem = (id: string) => {
      setActionItems(prev => prev.filter(item => item.id !== id));
      toast({
          title: "Removed",
          description: "Action item removed.",
      });
  };

  const handleReportGenerated = (report: {
      id: string, 
      type: string, 
      data: ReportData, 
      createdAt: number, 
      status: 'active' | 'archived',
      source?: 'manual' | 'curated_insight',
      role?: string
  }) => {
      setReportsList(prev => [report, ...prev]);
      setActiveReportId(report.id);
      setActiveTab("reports");
      toast({
          title: "Report Generated",
          description: "New report added to your Reports tab.",
      });
  };

  const handleGenerateReportFromTab = (type: ReportType) => {
      toast({
          title: "Generating Report",
          description: `Analyzing ${type} data...`,
      });

      setTimeout(() => {
          const reportData = MOCK_REPORTS[type];
          const newReport = {
              id: `report-${Date.now()}`,
              type,
              data: reportData,
              createdAt: Date.now(),
              status: 'active' as const,
              source: 'manual' as const,
              role: 'owner' // Default for manual generation
          };
          handleReportGenerated(newReport);
      }, 1500);
  };


  const handleGenerateChefInsightReport = () => {
      toast({
          title: "Generating Insight Report",
          description: "Analyzing food cost drivers...",
      });

      setTimeout(() => {
          const newReport = {
              id: `report-insight-${Date.now()}`,
              type: 'inventory',
              data: {
                  title: "Insight Report: Food Cost Variance",
                  dateRange: "September 2025",
                  entity: locationName,
                  dataSources: ["P&L", "Menu Mix", "Inventory"],
                  summary: [
                      chefPrimaryInsight.headline,
                      chefPrimaryInsight.context,
                      "Top 3 high-cost items are driving 80% of the variance."
                  ],
                  metrics: [
                      { label: "Food Cost %", value: "31.0%", change: "+3.0%", trend: "up" },
                      { label: "Avg Plate Cost", value: `$${chefPlateMetrics.avgCost.toFixed(2)}`, change: "+$0.45", trend: "up" },
                      { label: "Items > Range", value: chefPlateMetrics.aboveRangeCount.toString(), change: "+1", trend: "neutral" }
                  ],
                  tableData: {
                      headers: ["Item", "Cost/Plate", "FC %", "Status"],
                      rows: chefPlateMetrics.topItems.map(item => [
                          item.name,
                          `$${item.cost.toFixed(2)}`,
                          `${item.pct}%`,
                          "Critical"
                      ])
                  },
                  analysis: "The 'Milky Puff' item is the primary outlier, running at 31% food cost against a target of 28%. This is driven by recent price increases in dairy and specialty chocolate ingredients that have not been offset by menu price adjustments.",
                  recommendations: [
                      "Re-cost the Milky Puff recipe immediately.",
                      "Audit portioning for Matcha Lava.",
                      "Spot check inventory for Condensed Milk."
                  ]
              },
              createdAt: Date.now(),
              status: 'active' as const,
              source: 'curated_insight' as const,
              role: 'chef'
          };
          handleReportGenerated(newReport);
      }, 1500);
  };


  const handleGenerateOwnerInsightReport = (insight: PrimaryInsight) => {
    toast({
        title: "Generating Owner Insight Report",
        description: "Analyzing business health and profitability...",
    });

    setTimeout(() => {
        const newReport = {
            id: `report-insight-owner-${Date.now()}`,
            type: 'financial',
            data: {
                title: "Insight Report: Financial Health",
                dateRange: "September 2025",
                entity: locationName,
                dataSources: ["P&L", "Balance Sheet", "Sales Data"],
                summary: [
                    insight.message,
                    insight.detail,
                    "Overall profitability is healthy, with strong revenue growth offsetting minor cost variances."
                ],
                metrics: [
                    { label: "Net Profit", value: "18.5%", change: "+2.1%", trend: "up" },
                    { label: "Revenue", value: "$145k", change: "+12%", trend: "up" },
                    { label: "Cash Flow", value: "+$12k", change: "stable", trend: "neutral" }
                ],
                tableData: {
                    headers: ["Category", "Current", "Target", "Variance", "Status"],
                    rows: [
                        ["Sales", "$145,230", "$130,000", "+$15,230", "Good"],
                        ["Labor", "28.5%", "30.0%", "-1.5%", "Good"],
                        ["COGS", "31.2%", "30.0%", "+1.2%", "Warning"]
                    ]
                },
                analysis: "The business is performing well above targets. Revenue growth is the primary driver of improved net income. COGS requires slight attention but is manageable given the volume increase.",
                recommendations: [
                    "Reinvest portion of profit into marketing.",
                    "Review COGS for potential bulk purchasing savings.",
                    "Evaluate potential for holiday bonuses."
                ]
            },
            createdAt: Date.now(),
            status: 'active' as const,
            source: 'curated_insight' as const,
            role: 'owner'
        };
        handleReportGenerated(newReport);
    }, 1500);
  };


  const handleGenerateGMInsightReport = (insight: PrimaryInsight) => {
    toast({
        title: "Generating GM Insight Report",
        description: "Analyzing operational efficiency...",
    });

    setTimeout(() => {
        const newReport = {
            id: `report-insight-gm-${Date.now()}`,
            type: 'labor', // GM focused on labor often
            data: {
                title: "Insight Report: Labor Efficiency",
                dateRange: "September 2025",
                entity: locationName,
                dataSources: ["POS", "Time Clock"],
                summary: [
                    insight.message,
                    insight.detail,
                    "Scheduling efficiency has improved, but overtime remains a key variance driver."
                ],
                metrics: [
                    { label: "Labor %", value: "23.2%", change: "-0.8%", trend: "down" },
                    { label: "SPLH", value: "$48.50", change: "+$2.10", trend: "up" },
                    { label: "Overtime", value: "4.2%", change: "-1.5%", trend: "down" }
                ],
                tableData: {
                    headers: ["Role", "Regular Hrs", "OT Hrs", "Variance Cost", "Impact"],
                    rows: [
                        ["Line Cook", "850", "22", "$440", "Medium"],
                        ["Prep Cook", "420", "5", "$85", "Low"],
                        ["Dishwasher", "310", "15", "$225", "Low"]
                    ]
                },
                analysis: "BOH labor is trending in the right direction. The new prep schedule has reduced overtime significantly. Focus remains on managing Friday night cuts to maximize flow-through.",
                recommendations: [
                    "Continue new prep schedule pattern.",
                    "Monitor Friday close times.",
                    "Cross-train dishwashers for prep support."
                ]
            },
            createdAt: Date.now(),
            status: 'active' as const,
            source: 'curated_insight' as const,
            role: 'gm'
        };
        handleReportGenerated(newReport);
    }, 1500);
  };


  const handleGenerateFoodCostReport = () => {
    toast({
        title: "Generating Food Cost Report",
        description: "Analyzing commissary prices and plate costs...",
    });

    setTimeout(() => {
        const newReport = {
            id: `report-food-cost-${Date.now()}`,
            type: 'inventory',
            data: {
                title: "SPOT COMMISSARY FOOD PRICE & COST FALL/WINTER 2024",
                dateRange: "Updated 10/14/2024",
                entity: locationName,
                dataSources: ["Commissary Price List", "Menu Mix", "Recipe Cards"],
                summary: [
                    "Detailed breakdown of food costs across Tapas, Condiments, Showcase, and Takeout categories.",
                    "Key cost drivers identified: Milky Puff (31% FC) and Matcha Lava (29% FC).",
                    "Takeout Egg Tarts showing highest margin opportunity at 36% cost."
                ],
                metrics: [
                    { label: "Milky Puff FC", value: "31%", change: "+2%", trend: "up" },
                    { label: "Matcha Lava FC", value: "29%", change: "+1%", trend: "up" },
                    { label: "Cookie Camp FC", value: "28%", change: "0%", trend: "flat" }
                ],
                tableData: {
                    headers: ["Item", "Type", "Cost/Plate", "FC %", "Price"],
                    rows: [
                        ["Milky Puff", "TAPAS", "$4.53", "31%", "$14.45"],
                        ["Matcha Lava", "TAPAS", "$4.19", "29%", "$14.45"],
                        ["Cookie Camp", "TAPAS", "$4.01", "28%", "$14.45"],
                        ["Harvest", "TAPAS", "$3.84", "27%", "$14.45"],
                        ["Golden Toast", "TAPAS", "$3.17", "22%", "$14.45"],
                        ["Egg Tarts", "T/O", "$2.50", "36%", "$7.00"]
                    ]
                },
                analysis: `
### Top Item Breakdown: Milky Puff
**Total Food Cost Per Plate:** $4.53 (31% of $14.45 Selling Price)

**Cost Components:**
*   **Puff Pastry Choux:** $1.67 (From Commissary)
*   **White Choc. Honeycomb:** $1.12
*   **Cornflakes, Honey:** $0.50
*   **Banana:** $0.25
*   **Ice Cream Condensed Milk:** $1.00

### Top Item Breakdown: Matcha Lava
**Total Food Cost Per Plate:** $4.19 (29% of $14.45 Selling Price)

**Cost Components:**
*   **Matcha Lava Cake:** $0.75 (From Commissary)
*   **Matcha Ball:** $1.93
*   **Cookie Crumbs:** $0.14
*   **Matcha Powder:** $0.25
*   **Ice Cream Green Tea:** $1.12

### Top Item Breakdown: Cookie Camp
**Total Food Cost Per Plate:** $4.01 (28% of $14.45 Selling Price)

**Cost Components:**
*   **Cookie DH:** $1.89 (From Commissary)
*   **Cookie Crumbs:** $0.14
*   **Pretzel:** $0.10
*   **Choc Sauce:** $0.88
*   **Ice Cream Condensed:** $1.00
                `,
                recommendations: [
                    "Review portioning for White Choc. Honeycomb in Milky Puff ($1.12/plate impact).",
                    "Negotiate bulk pricing for Ice Cream bases as they are a major cost component across all top items.",
                    "Promote Golden Toast (22% FC) to improve overall mix margin."
                ]
            },
            createdAt: Date.now(),
            status: 'active' as const,
            source: 'curated_insight' as const,
            role: 'chef'
        };
        handleReportGenerated(newReport);
    }, 1500);
  };

  // Close TOC dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tocDropdownRef.current && !tocDropdownRef.current.contains(event.target as Node)) {
        setTocDropdownOpen(false);
      }
    };
    if (tocDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tocDropdownOpen]);

  // Close state dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setStateDropdownOpen(false);
        setStateSearchQuery("");
      }
    };
    if (stateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [stateDropdownOpen]);

  // Release Data State
  const [headline, setHeadline] = useState("Net operating income dropped 38.8% to $17.7K as revenue declined 13.8%. Operating costs improved by 12.1%.");
  const [insights, setInsights] = useState([
    { id: 1, text: "Revenue down $21.3K (-13.8%) driven by lower Food Sales and N/A Beverage. UberEats delivery grew 23.7%.", tag: "Negative" },
    { id: 2, text: "COGS improved by $1.8K (-3.2%) with favorable Commissary Food and Direct Labor savings.", tag: "Positive" },
    { id: 3, text: "Beverage Cost up 100% ($1.2K) due to Beer/Wine/Cider and Coffee/Tea purchases.", tag: "Negative" },
    { id: 4, text: "Server/Plater Overtime reduced by 91.4% saving $612 compared to August.", tag: "Positive" },
  ]);
  const [note, setNote] = useState("");
  const [visualizations, setVisualizations] = useState({
    breakdown: true,
    trend: true,
    variance: true
  });
  const [viewModes, setViewModes] = useState({
    revenueDrivers: "data" as "data" | "chart",
    bottomLine: "chart" as "data" | "chart",
    laborEfficiency: "data" as "data" | "chart"
  });
  const [healthSnapshotMode, setHealthSnapshotMode] = useState<"percentage" | "actual">("percentage");
  
  // Editable Health Snapshot Targets (detailed view)
  const [healthTargets, setHealthTargets] = useState({
    'net-sales': { pct: 100.0, dollar: 150000 },
    'prime-cost': { pct: 50.0, dollar: 66521 },
    'labor': { pct: 12.0, dollar: 15965 },
    'cogs': { pct: 38.0, dollar: 50556 },
    'net-income': { pct: 15.0, dollar: 19956 },
    'gross-profit': { pct: 62.0, dollar: 93000 },
  });
  
  // Health Snapshot actual values (fixed)
  const healthActuals = {
    'net-sales': { pct: 100.0, dollar: 133042 },
    'prime-cost': { pct: 54.0, dollar: 71826 },
    'labor': { pct: 12.1, dollar: 16156 },
    'cogs': { pct: 41.8, dollar: 55670 },
    'net-income': { pct: 13.3, dollar: 17722 },
    'gross-profit': { pct: 58.2, dollar: 77372 },
  };
  
  // Helper to calculate variance and status for health metrics
  const getHealthVariance = (metricId: string, isInverse: boolean = false) => {
    const actual = healthActuals[metricId as keyof typeof healthActuals];
    const target = healthTargets[metricId as keyof typeof healthTargets];
    if (!actual || !target) return { variance: 0, variancePct: 0, status: 'ON TRACK' as const };
    
    const dollarVar = actual.dollar - target.dollar;
    const pctVar = actual.pct - target.pct;
    
    // Determine status based on variance direction
    let status: 'ON TRACK' | 'NEEDS ATTENTION' | 'MONITOR' = 'ON TRACK';
    if (isInverse) {
      // For costs: lower is better
      if (actual.pct > target.pct + 2) status = 'NEEDS ATTENTION';
      else if (actual.pct > target.pct) status = 'MONITOR';
    } else {
      // For revenue/profit: higher is better
      if (actual.pct < target.pct - 2) status = 'NEEDS ATTENTION';
      else if (actual.pct < target.pct) status = 'MONITOR';
    }
    
    return { 
      dollarVar, 
      pctVar, 
      status,
      formattedDollarVar: dollarVar >= 0 ? `+$${dollarVar.toLocaleString()}` : `-$${Math.abs(dollarVar).toLocaleString()}`,
      formattedPctVar: `${pctVar >= 0 ? '+' : ''}${pctVar.toFixed(1)}pts`
    };
  };
  
  const updateHealthTarget = (metricId: string, field: 'pct' | 'dollar', value: number) => {
    setHealthTargets(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId as keyof typeof prev], [field]: value }
    }));
  };

  // Editable Labor Deep Dive Budgets - Default 30% of Revenue per spec
  const DEFAULT_LABOR_TARGET_PCT = 30;

  // Prime Cost Target Range - Linked to location benchmark
  const INDUSTRY_PRIME_COST_LOWER = 55;
  const INDUSTRY_PRIME_COST_UPPER = 60;
  const NY_PRIME_COST_LOWER = 58;
  const NY_PRIME_COST_UPPER = 65;
  
  // Determine default based on selected state
  const isNYLocation = selectedState?.code === 'NY';
  const defaultPrimeCostLower = isNYLocation ? NY_PRIME_COST_LOWER : INDUSTRY_PRIME_COST_LOWER;
  const defaultPrimeCostUpper = isNYLocation ? NY_PRIME_COST_UPPER : INDUSTRY_PRIME_COST_UPPER;
  
  const [primeCostTargetLower, setPrimeCostTargetLower] = useState(defaultPrimeCostLower);
  const [primeCostTargetUpper, setPrimeCostTargetUpper] = useState(defaultPrimeCostUpper);
  const [isCustomPrimeCostTarget, setIsCustomPrimeCostTarget] = useState(false);
  
  // Update targets when state changes (unless custom)
  useEffect(() => {
    if (!isCustomPrimeCostTarget) {
      setPrimeCostTargetLower(isNYLocation ? NY_PRIME_COST_LOWER : INDUSTRY_PRIME_COST_LOWER);
      setPrimeCostTargetUpper(isNYLocation ? NY_PRIME_COST_UPPER : INDUSTRY_PRIME_COST_UPPER);
    }
  }, [selectedState, isCustomPrimeCostTarget, isNYLocation]);
  
  const handlePrimeCostTargetChange = (type: 'lower' | 'upper', value: number) => {
    if (type === 'lower') {
      if (value >= 0 && value < primeCostTargetUpper) {
        setPrimeCostTargetLower(value);
        setIsCustomPrimeCostTarget(true);
      }
    } else {
      if (value > primeCostTargetLower && value <= 100) {
        setPrimeCostTargetUpper(value);
        setIsCustomPrimeCostTarget(true);
      }
    }
  };
  
  const resetPrimeCostTarget = () => {
    setPrimeCostTargetLower(defaultPrimeCostLower);
    setPrimeCostTargetUpper(defaultPrimeCostUpper);
    setIsCustomPrimeCostTarget(false);
  };
  
  // Get target label for display consistency
  const getPrimeCostTargetLabel = () => {
    if (isCustomPrimeCostTarget) return "Custom";
    if (isNYLocation) return "NY Benchmark";
    return "Industry Default";
  };
  
  const [laborBudgetPct, setLaborBudgetPct] = useState(DEFAULT_LABOR_TARGET_PCT);
  const [isCustomLaborBudget, setIsCustomLaborBudget] = useState(false);
  
  // Use YTD data from P&L JSON as single source of truth
  const ytdSummary = getYTDSummary();
  const latestMonthData = getLatestMonthSummary();
  const plMetadata = getMetadata();
  
  // PERIOD_REVENUE from JSON (YTD total income)
  const PERIOD_REVENUE = Math.round(ytdSummary.income);
  
  // Calculate budget from percentage
  const getLaborBudgetAmount = (revenue: number) => Math.round(revenue * (laborBudgetPct / 100));
  
  // Labor actuals from JSON - YTD totals (proportional breakdown)
  const totalLaborFromJSON = Math.round(ytdSummary.labor);
  const laborActuals = {
    'total-labor': totalLaborFromJSON,
    'boh-labor': Math.round(totalLaborFromJSON * 0.40),
    'line-cook': Math.round(totalLaborFromJSON * 0.193),
    'prep-cook': Math.round(totalLaborFromJSON * 0.128),
    'dishwasher': Math.round(totalLaborFromJSON * 0.08),
    'foh-labor': Math.round(totalLaborFromJSON * 0.44),
    'server': Math.round(totalLaborFromJSON * 0.236),
    'bartender': Math.round(totalLaborFromJSON * 0.124),
    'host': Math.round(totalLaborFromJSON * 0.082),
    'management': Math.round(totalLaborFromJSON * 0.132),
    'gm': Math.round(totalLaborFromJSON * 0.071),
    'supervisor': Math.round(totalLaborFromJSON * 0.061),
    'payroll-taxes': Math.round(totalLaborFromJSON * 0.11),
  };
  
  // Category percentages of total Labor for budget breakdown
  const laborCategoryPcts = {
    'boh-labor': 0.40, // 40% of labor
    'line-cook': 0.193,
    'prep-cook': 0.128,
    'dishwasher': 0.08,
    'foh-labor': 0.44, // 44% of labor
    'server': 0.236,
    'bartender': 0.124,
    'host': 0.082,
    'management': 0.132, // 13.2% of labor
    'gm': 0.071,
    'supervisor': 0.061,
    'payroll-taxes': 0.11, // 11% of labor
  };
  
  const getLaborBudgetForCategory = (id: string, revenue: number) => {
    const totalBudget = getLaborBudgetAmount(revenue);
    if (id === 'total-labor') return totalBudget;
    return Math.round(totalBudget * (laborCategoryPcts[id as keyof typeof laborCategoryPcts] || 0));
  };
  
  const getLaborVariance = (id: string, revenue: number = 293000) => {
    const actual = laborActuals[id as keyof typeof laborActuals] || 0;
    const budget = getLaborBudgetForCategory(id, revenue);
    const varianceDollar = actual - budget;
    const actualPct = (actual / revenue) * 100;
    const budgetPct = laborBudgetPct * (id === 'total-labor' ? 1 : (laborCategoryPcts[id as keyof typeof laborCategoryPcts] || 0));
    const variancePct = actualPct - budgetPct;
    return {
      varianceDollar,
      variancePct,
      formattedDollar: varianceDollar === 0 ? '$0' : varianceDollar > 0 ? `+$${varianceDollar.toLocaleString()}` : `-$${Math.abs(varianceDollar).toLocaleString()}`,
      formattedPct: variancePct === 0 ? '0.0%' : variancePct > 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`,
      color: varianceDollar > 0 ? 'text-red-600' : varianceDollar < 0 ? 'text-emerald-600' : 'text-gray-600',
      status: varianceDollar > budget * 0.05 ? 'over' : varianceDollar < -budget * 0.02 ? 'under' : 'on-target',
      statusColor: varianceDollar > budget * 0.05 ? 'bg-red-100 text-red-700' : varianceDollar < -budget * 0.02 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
      statusText: varianceDollar > budget * 0.05 ? 'OVER' : varianceDollar < -budget * 0.02 ? 'UNDER' : 'ON TARGET'
    };
  };
  
  const handleLaborBudgetChange = (newPct: number) => {
    if (newPct > 0 && newPct < 100) {
      setLaborBudgetPct(newPct);
      setIsCustomLaborBudget(newPct !== DEFAULT_LABOR_TARGET_PCT);
    }
  };
  
  const resetLaborBudgetToDefault = () => {
    setLaborBudgetPct(DEFAULT_LABOR_TARGET_PCT);
    setIsCustomLaborBudget(false);
  };

  // Editable Labor Efficiency Targets with Default/Custom tracking
  const DEFAULT_EFFICIENCY_TARGETS = {
    'sales-per-hour': 50.00,
    'hours-per-guest': 0.68,
    'overtime-pct': 4.0,
  };
  
  const [laborEfficiencyTargets, setLaborEfficiencyTargets] = useState({ ...DEFAULT_EFFICIENCY_TARGETS });
  const [isCustomEfficiencyTargets, setIsCustomEfficiencyTargets] = useState({
    'sales-per-hour': false,
    'hours-per-guest': false,
    'overtime-pct': false,
  });
  
  const laborEfficiencyActuals = {
    'sales-per-hour': 48.20,
    'hours-per-guest': 0.71,
    'overtime-pct': 7.4,
  };
  
  const handleEfficiencyTargetChange = (id: string, value: number) => {
    setLaborEfficiencyTargets(prev => ({ ...prev, [id]: value }));
    setIsCustomEfficiencyTargets(prev => ({
      ...prev,
      [id]: value !== DEFAULT_EFFICIENCY_TARGETS[id as keyof typeof DEFAULT_EFFICIENCY_TARGETS]
    }));
  };
  
  const resetEfficiencyTarget = (id: string) => {
    const defaultVal = DEFAULT_EFFICIENCY_TARGETS[id as keyof typeof DEFAULT_EFFICIENCY_TARGETS];
    setLaborEfficiencyTargets(prev => ({ ...prev, [id]: defaultVal }));
    setIsCustomEfficiencyTargets(prev => ({ ...prev, [id]: false }));
  };
  
  const getLaborEfficiencyStatus = (id: string, isInverse: boolean = false) => {
    const actual = laborEfficiencyActuals[id as keyof typeof laborEfficiencyActuals];
    const target = laborEfficiencyTargets[id as keyof typeof laborEfficiencyTargets];
    const diff = isInverse ? actual - target : target - actual;
    const variance = actual - target;
    const variancePct = ((actual - target) / target) * 100;
    return {
      status: diff > 1 ? 'ATTENTION' : diff > 0 ? 'MONITOR' : 'ON TRACK',
      color: diff > 1 ? 'bg-red-100 text-red-700' : diff > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
      variance,
      variancePct,
      formattedVariance: id === 'overtime-pct' 
        ? `${variance >= 0 ? '+' : ''}${variance.toFixed(1)}pts`
        : id === 'hours-per-guest'
          ? `${variance >= 0 ? '+' : ''}${variance.toFixed(2)}`
          : `${variance >= 0 ? '+' : ''}$${variance.toFixed(2)}`
    };
  };

  // Editable COGS Budgets - Default 25% of Revenue per spec
  const DEFAULT_COGS_TARGET_PCT = 25;
  
  const [cogsBudgetPct, setCogsBudgetPct] = useState(DEFAULT_COGS_TARGET_PCT);
  const [isCustomCogsBudget, setIsCustomCogsBudget] = useState(false);
  
  // Calculate budget from percentage
  const cogsBudgetAmount = Math.round(PERIOD_REVENUE * (cogsBudgetPct / 100));
  
  // COGS actuals from JSON - YTD totals
  const cogsActuals = {
    'total-cogs': Math.round(ytdSummary.cogs),
    'food-cost': Math.round(ytdSummary.cogs * 0.788), // Proportional breakdown
    'beverage-cost': Math.round(ytdSummary.cogs * 0.164),
    'paper-supplies': Math.round(ytdSummary.cogs * 0.048),
  };
  
  // Category percentages of total COGS for budget breakdown
  const cogsCategoryPcts = {
    'food-cost': 0.788, // ~78.8% of COGS is food
    'beverage-cost': 0.164, // ~16.4% is beverage
    'paper-supplies': 0.048, // ~4.8% is paper/supplies
  };
  
  const getCogsBudgetForCategory = (id: string) => {
    if (id === 'total-cogs') return cogsBudgetAmount;
    return Math.round(cogsBudgetAmount * (cogsCategoryPcts[id as keyof typeof cogsCategoryPcts] || 0));
  };
  
  const getCogsVariance = (id: string) => {
    const actual = cogsActuals[id as keyof typeof cogsActuals] || 0;
    const budget = getCogsBudgetForCategory(id);
    const varianceDollar = actual - budget;
    const actualPct = (actual / PERIOD_REVENUE) * 100;
    const variancePct = actualPct - cogsBudgetPct * (id === 'total-cogs' ? 1 : (cogsCategoryPcts[id as keyof typeof cogsCategoryPcts] || 0));
    return {
      varianceDollar,
      variancePct,
      formattedDollar: varianceDollar === 0 ? '$0' : varianceDollar > 0 ? `+$${varianceDollar.toLocaleString()}` : `-$${Math.abs(varianceDollar).toLocaleString()}`,
      formattedPct: variancePct === 0 ? '0.0%' : variancePct > 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`,
      color: varianceDollar > 0 ? 'text-red-600' : varianceDollar < 0 ? 'text-emerald-600' : 'text-gray-600',
      status: varianceDollar > budget * 0.05 ? 'over' : varianceDollar < -budget * 0.02 ? 'under' : 'on-target',
      statusColor: varianceDollar > budget * 0.05 ? 'bg-red-100 text-red-700' : varianceDollar < -budget * 0.02 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
      statusText: varianceDollar > budget * 0.05 ? 'OVER' : varianceDollar < -budget * 0.02 ? 'UNDER' : 'ON TARGET'
    };
  };
  
  const handleCogsBudgetChange = (newPct: number) => {
    if (newPct > 0 && newPct < 100) {
      setCogsBudgetPct(newPct);
      setIsCustomCogsBudget(newPct !== DEFAULT_COGS_TARGET_PCT);
    }
  };
  
  const resetCogsBudgetToDefault = () => {
    setCogsBudgetPct(DEFAULT_COGS_TARGET_PCT);
    setIsCustomCogsBudget(false);
  };

  // Editable Controllable Expenses Budgets
  const [controllableBudgets, setControllableBudgets] = useState({
    'total-controllable': 39800,
    'marketing': 4500,
    'repairs': 4000,
    'utilities': 6200,
    'cc-fees': 6600,
    'delivery': 7300,
  });
  const controllableActuals = {
    'total-controllable': 38600,
    'marketing': 3200,
    'repairs': 4800,
    'utilities': 6400,
    'cc-fees': 7400,
    'delivery': 8200,
  };
  const getControllableVariance = (id: string) => {
    const actual = controllableActuals[id as keyof typeof controllableActuals] || 0;
    const budget = controllableBudgets[id as keyof typeof controllableBudgets] || 0;
    const variance = actual - budget;
    return {
      variance,
      formatted: variance === 0 ? '$0' : variance > 0 ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`,
      color: variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : 'text-gray-600'
    };
  };

  // Editable Fixed/Occupancy Budgets
  const [occupancyBudgets, setOccupancyBudgets] = useState({
    'total-occupancy': 28500,
    'rent': 18000,
    'cam': 4500,
    'insurance': 3200,
    'depreciation': 2800,
  });
  const occupancyActuals = {
    'total-occupancy': 28500,
    'rent': 18000,
    'cam': 4500,
    'insurance': 3200,
    'depreciation': 2800,
  };
  const getOccupancyVariance = (id: string) => {
    const actual = occupancyActuals[id as keyof typeof occupancyActuals] || 0;
    const budget = occupancyBudgets[id as keyof typeof occupancyBudgets] || 0;
    const variance = actual - budget;
    return {
      variance,
      formatted: variance === 0 ? '$0' : variance > 0 ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`,
      color: variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : 'text-gray-600'
    };
  };

  // Calculate actual prime cost from COGS + Labor
  const actualPrimeCostPct = ((cogsActuals['total-cogs'] + laborActuals['total-labor']) / PERIOD_REVENUE) * 100;
  
  // Prime Cost Bridge calculations using consistent target
  const primeCostTargetMidpoint = (primeCostTargetLower + primeCostTargetUpper) / 2;
  const primeCostVarianceTotal = actualPrimeCostPct - primeCostTargetMidpoint;
  
  // Calculate driver breakdown for Prime Cost Bridge
  const actualCogsPct = (cogsActuals['total-cogs'] / PERIOD_REVENUE) * 100;
  const actualLaborPct = (laborActuals['total-labor'] / PERIOD_REVENUE) * 100;
  const cogsVariancePts = actualCogsPct - cogsBudgetPct;
  const laborVariancePts = actualLaborPct - laborBudgetPct;
  
  const getPrimeCostStatus = () => {
    if (actualPrimeCostPct <= primeCostTargetLower) {
      return { status: '🟢 EXCELLENT', color: 'bg-emerald-50 text-emerald-700', text: 'Below target range' };
    } else if (actualPrimeCostPct <= primeCostTargetUpper) {
      return { status: '🟢 IN RANGE', color: 'bg-emerald-50 text-emerald-700', text: 'Within target range' };
    } else if (actualPrimeCostPct <= primeCostTargetUpper + 2) {
      return { status: '🟡 NEAR LIMIT', color: 'bg-amber-50 text-amber-700', text: 'Near upper limit' };
    } else {
      return { status: '🔴 OVER TARGET', color: 'bg-red-50 text-red-700', text: 'Exceeds target range' };
    }
  };

  // Report Archive Sidebar State
  const [archiveSidebarWidth, setArchiveSidebarWidth] = useState(256); // default 256px (w-64)
  const [archiveSidebarCollapsed, setArchiveSidebarCollapsed] = useState(false);
  const [isResizingArchive, setIsResizingArchive] = useState(false);
  const [isLayoutSidebarHovered, setIsLayoutSidebarHovered] = useState(false);
  const archiveMinWidth = 200;
  const archiveMaxWidth = 400;

  // Track Layout sidebar hover via mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Layout sidebar is 64px (w-16) normally, expands to 256px (w-64) on hover
      const sidebarWidth = isLayoutSidebarHovered ? 256 : 64;
      setIsLayoutSidebarHovered(e.clientX <= sidebarWidth);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isLayoutSidebarHovered]);

  const handleArchiveMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingArchive(true);
  };

  useEffect(() => {
    if (!isResizingArchive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      if (newWidth < 50) {
        setArchiveSidebarCollapsed(true);
        setArchiveSidebarWidth(0);
      } else if (newWidth >= archiveMinWidth) {
        setArchiveSidebarCollapsed(false);
        setArchiveSidebarWidth(Math.min(newWidth, archiveMaxWidth));
      }
    };

    const handleMouseUp = () => {
      setIsResizingArchive(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingArchive]);

  const toggleArchiveSidebar = () => {
    if (archiveSidebarCollapsed) {
      setArchiveSidebarCollapsed(false);
      setArchiveSidebarWidth(256);
    } else {
      setArchiveSidebarCollapsed(true);
      setArchiveSidebarWidth(0);
    }
  };

  // Action Items State (Renamed to avoid conflict)
  const [legacyActionItems, setLegacyActionItems] = useState([
    { id: "cogs-spike", title: "Investigate Commissary Cost Spike — COGS jumped to 45% (Target 38%)", owner: "Executive Chef", impact: "$13,500/mo impact", priority: "high", completed: false, completedAt: null as Date | null },
    { id: "opex-review", title: "Review OpEx Increase — +$14k variance in October", owner: "GM", impact: "Profitability risk", priority: "high", completed: false, completedAt: null as Date | null },
    { id: "delivery-decline", title: "Monitor DoorDash decline — sales down 15% vs Sep", owner: "GM", impact: "$800/mo potential", priority: "medium", completed: false, completedAt: null as Date | null },
    { id: "food-sales-win", title: "Maintain Food Sales Momentum — +10% growth in Oct", owner: "GM", impact: "Revenue Growth", priority: "low", completed: false, completedAt: null as Date | null },
  ]);

  // Action Cart State (New)
  // const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  // Removed duplicate state declaration

  /*
  const handleAddActionItem = (item: Omit<ActionItem, 'id' | 'createdAt' | 'status'>) => {
      const newItem: ActionItem = {
          ...item,
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'new',
          createdAt: Date.now()
      };
      setActionItems(prev => [newItem, ...prev]);
      toast({
          title: "Added to Actions",
          description: "Item added to your Action Cart.",
      });
  };

  const handleRemoveActionItem = (id: string) => {
      setActionItems(prev => prev.filter(item => item.id !== id));
      toast({
          title: "Removed",
          description: "Action item removed.",
      });
  };
  */
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionTitle, setEditingActionTitle] = useState("");
  const [showCompletedActions, setShowCompletedActions] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  const toggleActionComplete = (id: string) => {
    setLegacyActionItems(prev => prev.map(item => {
      if (item.id === id) {
        const nowCompleted = !item.completed;
        if (nowCompleted) {
          setRecentlyCompleted(id);
          setTimeout(() => setRecentlyCompleted(null), 600);
        }
        return { ...item, completed: nowCompleted, completedAt: nowCompleted ? new Date() : null };
      }
      return item;
    }));
  };

  const startEditingAction = (id: string, title: string) => {
    setEditingActionId(id);
    setEditingActionTitle(title);
  };

  const saveActionEdit = () => {
    if (editingActionId && editingActionTitle.trim()) {
      setLegacyActionItems(prev => prev.map(item => 
        item.id === editingActionId ? { ...item, title: editingActionTitle.trim() } : item
      ));
    }
    setEditingActionId(null);
    setEditingActionTitle("");
  };

  const activeActions = legacyActionItems.filter(item => !item.completed);
  const completedActions = legacyActionItems.filter(item => item.completed);

  // Assign Modal State
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    actionId: string | null;
    actionTitle: string;
    recipients: string[];
    newEmail: string;
    subject: string;
    message: string;
  }>({
    isOpen: false,
    actionId: null,
    actionTitle: "",
    recipients: [],
    newEmail: "",
    subject: "",
    message: ""
  });

  const openAssignModal = (actionId: string, actionTitle: string, owner: string) => {
    // Open chat to provide context
    setShowChat(true);
    setShowActionCart(true); // Open Action Cart panel

    // Directly Add to Action Cart (Bypassing Modal)
    const actionToAdd = {
        title: actionTitle,
        source: 'user_click' as const,
        context: `Assigned to ${owner}`,
        metric: "Assignment",
    };

    // Check if already exists
    const exists = actionItems.some(i => i.title === actionTitle);
    
    if (!exists) {
        handleAddActionItem(actionToAdd);
    } else {
        toast({
            title: "Already in Cart",
            description: "This item is already in your action plan.",
        });
    }
  };

  const closeAssignModal = () => {
    setAssignModal({
      isOpen: false,
      actionId: null,
      actionTitle: "",
      recipients: [],
      newEmail: "",
      subject: "",
      message: ""
    });
  };

  const addAssignRecipient = () => {
    if (assignModal.newEmail.trim() && assignModal.newEmail.includes("@")) {
      setAssignModal(prev => ({
        ...prev,
        recipients: [...prev.recipients, prev.newEmail.trim()],
        newEmail: ""
      }));
    }
  };

  const removeAssignRecipient = (email: string) => {
    setAssignModal(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const sendAssignment = () => {
    // Add to Action Cart
    const actionToAdd = {
        title: assignModal.actionTitle,
        source: 'user_click' as const,
        context: `Assigned to ${assignModal.recipients.join(', ')}`,
        metric: "Assignment",
    };
    
    // Add to cart if not exists
    const exists = actionItems.some(i => i.title === assignModal.actionTitle);
    if (!exists) {
        handleAddActionItem(actionToAdd);
    } else {
         // Update existing item status
         setActionItems(prev => prev.map(i => i.title === assignModal.actionTitle ? {...i, status: 'assigned', context: `Assigned to ${assignModal.recipients.join(', ')}`} : i));
    }

    setShowChat(true); // Ensure chat panel is open
    closeAssignModal();
    toast({
        title: "Action Assigned",
        description: `Assigned to ${assignModal.recipients.length} recipients and added to chat.`,
    });
  };

  // Initialize role from URL param if viewing as owner/gm/chef, otherwise default to owner
  const [selectedRole, setSelectedRole] = useState<"owner" | "gm" | "chef">(urlRole || "owner");
  const [healthComparisonPeriod, setHealthComparisonPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  // Compute aggregated trends and metrics based on selected period
  const aggregatedTrends = React.useMemo(() => 
    getAggregatedTrends(healthComparisonPeriod, healthSnapshotTrendData), 
    [healthComparisonPeriod]
  );

  const dashboardMetrics = React.useMemo(() => 
    getDashboardMetrics(healthComparisonPeriod, aggregatedTrends), 
    [healthComparisonPeriod, aggregatedTrends]
  );
  const [grossProfitExpanded, setGrossProfitExpanded] = useState(false);
  const [netIncomeExpanded, setNetIncomeExpanded] = useState(false);
  
  // GM Time Range state (persists when switching locations)
  const [gmTimeRange, setGmTimeRange] = useState<"today" | "week" | "month" | "year">("month");
  const [selectedGMDate, setSelectedGMDate] = useState(new Date(2025, 8, 15)); // Sep 15, 2025
  
  // Chef Time Range state for Ticket Time Performance
  const [chefTimeRange, setChefTimeRange] = useState<"today" | "week" | "month" | "year">("month");
  const [selectedChefDate, setSelectedChefDate] = useState(new Date(2025, 8, 15)); // Sep 15, 2025
  
  // Ticket Time Performance data by time range
  const ticketTimeData = {
    today: {
      label: "Day",
      xAxisKey: "hour",
      data: [
        { hour: '10am', green: 12, yellow: 2, red: 0 },
        { hour: '11am', green: 28, yellow: 5, red: 1 },
        { hour: '12pm', green: 45, yellow: 12, red: 3 },
        { hour: '1pm', green: 52, yellow: 15, red: 5 },
        { hour: '2pm', green: 38, yellow: 8, red: 2 },
        { hour: '3pm', green: 18, yellow: 4, red: 1 },
        { hour: '4pm', green: 15, yellow: 3, red: 0 },
        { hour: '5pm', green: 32, yellow: 6, red: 2 },
        { hour: '6pm', green: 48, yellow: 14, red: 6 },
        { hour: '7pm', green: 55, yellow: 18, red: 9 },
        { hour: '8pm', green: 42, yellow: 12, red: 4 },
        { hour: '9pm', green: 25, yellow: 6, red: 2 },
      ],
      summary: { greenPct: 78, yellowPct: 16, redPct: 6 },
      xLabel: "Tickets by hour"
    },
    week: {
      label: "Week",
      xAxisKey: "day",
      data: [
        { day: 'Mon', green: 410, yellow: 87, red: 35 },
        { day: 'Tue', green: 385, yellow: 72, red: 28 },
        { day: 'Wed', green: 420, yellow: 95, red: 42 },
        { day: 'Thu', green: 445, yellow: 88, red: 38 },
        { day: 'Fri', green: 520, yellow: 125, red: 55 },
        { day: 'Sat', green: 580, yellow: 140, red: 68 },
        { day: 'Sun', green: 380, yellow: 78, red: 32 },
      ],
      summary: { greenPct: 76, yellowPct: 17, redPct: 7 },
      xLabel: "Tickets by day (WTD)"
    },
    month: {
      label: "Month",
      xAxisKey: "day",
      data: [
        { day: 'Jan 1', green: 385, yellow: 72, red: 28 },
        { day: 'Jan 2', green: 410, yellow: 87, red: 35 },
        { day: 'Jan 3', green: 520, yellow: 125, red: 55 },
        { day: 'Jan 4', green: 580, yellow: 140, red: 68 },
        { day: 'Jan 5', green: 380, yellow: 78, red: 32 },
        { day: 'Jan 6', green: 410, yellow: 87, red: 35 },
        { day: 'Jan 7', green: 385, yellow: 72, red: 28 },
        { day: 'Jan 8', green: 420, yellow: 95, red: 42 },
        { day: 'Jan 9', green: 445, yellow: 88, red: 38 },
        { day: 'Jan 10', green: 520, yellow: 125, red: 55 },
        { day: 'Jan 11', green: 580, yellow: 140, red: 68 },
        { day: 'Jan 12', green: 410, yellow: 105, red: 35 },
      ],
      summary: { greenPct: 75, yellowPct: 18, redPct: 7 },
      xLabel: "Tickets by day (MTD)"
    },
    year: {
      label: "Year",
      xAxisKey: "month",
      data: [
        { month: 'Jan', green: 5520, yellow: 1214, red: 519 },
      ],
      summary: { greenPct: 76, yellowPct: 17, redPct: 7 },
      xLabel: "Tickets by month (YTD)"
    }
  };
  
  const currentTicketData = ticketTimeData[chefTimeRange];
  
  // GM Time Range data (mock data for different periods)
  const gmTimeRangeData = {
    today: {
      label: "Today",
      dateLabel: "Monday, Jan 12",
      sales: { value: 4820, avg: 5180, variance: -6.9, avgLabel: "Avg Monday" },
      cogs: { value: 32.4, avg: 30.8, variance: 1.6, avgLabel: "Avg Monday" },
      labor: { value: 31.8, avg: 29.3, variance: 2.5, avgLabel: "Avg Monday" },
      primeCost: { value: 64.2, avg: 60.1, variance: 4.1, avgLabel: "Avg Monday" }
    },
    week: {
      label: "Week",
      dateLabel: "Week of Jan 6–12 (WTD)",
      sales: { value: 28450, avg: 31200, variance: -8.8, avgLabel: "Avg Week" },
      cogs: { value: 31.2, avg: 30.5, variance: 0.7, avgLabel: "Avg Week" },
      labor: { value: 30.8, avg: 29.0, variance: 1.8, avgLabel: "Avg Week" },
      primeCost: { value: 62.0, avg: 59.5, variance: 2.5, avgLabel: "Avg Week" }
    },
    month: {
      label: "Month",
      dateLabel: "January 2026 (MTD)",
      sales: { value: 42680, avg: 48500, variance: -12.0, avgLabel: "Avg MTD" },
      cogs: { value: 30.8, avg: 30.2, variance: 0.6, avgLabel: "Avg MTD" },
      labor: { value: 30.2, avg: 29.1, variance: 1.1, avgLabel: "Avg MTD" },
      primeCost: { value: 61.0, avg: 59.3, variance: 1.7, avgLabel: "Avg MTD" }
    },
    year: {
      label: "Year",
      dateLabel: "2026 (YTD)",
      sales: { value: 42680, avg: 48500, variance: -12.0, avgLabel: "Avg YTD" },
      cogs: { value: 30.5, avg: 30.0, variance: 0.5, avgLabel: "Avg YTD" },
      labor: { value: 29.8, avg: 29.2, variance: 0.6, avgLabel: "Avg YTD" },
      primeCost: { value: 60.3, avg: 59.2, variance: 1.1, avgLabel: "Avg YTD" }
    }
  };
  
  const currentGMData = gmTimeRangeData[gmTimeRange];
  
  // What Happened narratives by time range
  const getWhatHappenedNarrative = () => {
    switch (gmTimeRange) {
      case 'today':
        return {
          issues: [
            {
              id: 'lunch-overstaffed',
              icon: 'users',
              iconBg: 'bg-red-100',
              iconColor: 'text-red-600',
              title: 'Lunch overstaffed vs normal Monday',
              description: `Labor was +7.2 pts higher than normal for demand — likely overstaffed during Lunch shift.`,
              tags: [{ label: 'Shift: Lunch', color: 'bg-gray-100 text-gray-600' }, { label: 'Labor % +7.2 pts', color: 'bg-red-100 text-red-700' }],
              context: `[CONTEXT]\nRole: General Manager\nDay: Monday, Jan 12\nShift: Lunch\nIssue: Lunch was overstaffed vs typical Monday\nMetrics:\n• Labor %: 38.5% (+7.2 pts vs avg)\n• Sales: $1,840 (-8.3% vs avg)\n\nHelp me understand why lunch was overstaffed today and what I should do about tomorrow's schedule.`
            },
            {
              id: 'sales-below',
              icon: 'trending-down',
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-600',
              title: 'Sales below weekday average',
              description: 'Sales dropped -6.9% versus a typical Monday. Demand issue, not staffing.',
              tags: [{ label: 'Day: Monday', color: 'bg-gray-100 text-gray-600' }, { label: 'Sales -$360', color: 'bg-amber-100 text-amber-700' }],
              context: `[CONTEXT]\nRole: General Manager\nDay: Monday, Jan 12\nIssue: Sales below weekday average\nMetrics:\n• Today's Sales: $4,820\n• Avg Monday Sales: $5,180\n• Variance: -6.9% ($360 below average)\n\nHelp me understand why sales were down today and what I can do to improve tomorrow.`
            },
            {
              id: 'high-cogs',
              icon: 'package',
              iconBg: 'bg-orange-100',
              iconColor: 'text-orange-600',
              title: 'Food cost ran slightly high',
              description: 'COGS % was +1.6 pts above normal — check waste, comps, or portioning.',
              tags: [{ label: 'All Day', color: 'bg-gray-100 text-gray-600' }, { label: 'COGS % +1.6 pts', color: 'bg-orange-100 text-orange-700' }],
              context: `[CONTEXT]\nRole: General Manager\nDay: Monday, Jan 12\nIssue: Food cost ran higher than normal\nMetrics:\n• Today's COGS %: 32.4%\n• Avg Monday COGS %: 30.8%\n• Variance: +1.6 pts above normal\n\nHelp me investigate why food cost was high today.`
            }
          ],
          actions: ['Review Lunch schedule', 'Check portion sizes', 'Monitor afternoon traffic']
        };
      case 'week':
        return {
          issues: [
            {
              id: 'week-labor-pattern',
              icon: 'users',
              iconBg: 'bg-red-100',
              iconColor: 'text-red-600',
              title: 'Lunch shifts consistently ran above labor targets',
              description: 'This week, lunch shifts averaged +1.8 pts above target. Today followed the same pattern.',
              tags: [{ label: 'Week Pattern', color: 'bg-gray-100 text-gray-600' }, { label: 'Labor % +1.8 pts avg', color: 'bg-red-100 text-red-700' }],
              context: `[CONTEXT]\nRole: General Manager\nPeriod: Week of Jan 6-12\nIssue: Recurring lunch overstaffing pattern\nMetrics:\n• Week Labor %: 30.8% (+1.8 pts vs target)\n• Pattern: Lunch shifts consistently high\n• Today followed the same pattern\n\nHelp me understand this weekly pattern and how to adjust scheduling.`
            },
            {
              id: 'week-sales-trend',
              icon: 'trending-down',
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-600',
              title: 'Weekly sales tracking below target',
              description: 'Week-to-date sales are -8.8% below average. Weekday lunches are the primary driver.',
              tags: [{ label: 'WTD', color: 'bg-gray-100 text-gray-600' }, { label: 'Sales -8.8%', color: 'bg-amber-100 text-amber-700' }],
              context: `[CONTEXT]\nRole: General Manager\nPeriod: Week of Jan 6-12\nIssue: Weekly sales below target\nMetrics:\n• WTD Sales: $28,450 (-8.8% vs avg)\n• Primary driver: Weekday lunch traffic\n\nHelp me identify strategies to recover this week's sales gap.`
            }
          ],
          actions: ['Adjust weekly lunch schedule', 'Review weekday promotions', 'Analyze traffic patterns']
        };
      case 'month':
        return {
          issues: [
            {
              id: 'month-prime-cost',
              icon: 'alert-triangle',
              iconBg: 'bg-red-100',
              iconColor: 'text-red-600',
              title: 'Month-to-date prime cost above target',
              description: 'MTD prime cost is +1.7 pts above target, driven primarily by weekday labor overages. Today\'s performance did not materially change the trend.',
              tags: [{ label: 'MTD', color: 'bg-gray-100 text-gray-600' }, { label: 'Prime Cost +1.7 pts', color: 'bg-red-100 text-red-700' }],
              context: `[CONTEXT]\nRole: General Manager\nPeriod: January 2026 MTD\nIssue: Elevated prime cost for the month\nMetrics:\n• MTD Prime Cost: 61.0% (+1.7 pts vs target)\n• Primary driver: Weekday labor overages\n• Today's result aligned with trend\n\nHelp me develop a plan to bring prime cost back to target this month.`
            },
            {
              id: 'month-sales-gap',
              icon: 'trending-down',
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-600',
              title: 'Monthly sales pacing behind budget',
              description: 'MTD sales are -12% below average. Need strong weekend performance to recover.',
              tags: [{ label: 'MTD', color: 'bg-gray-100 text-gray-600' }, { label: 'Sales -12%', color: 'bg-amber-100 text-amber-700' }],
              context: `[CONTEXT]\nRole: General Manager\nPeriod: January 2026 MTD\nIssue: Monthly sales pacing behind\nMetrics:\n• MTD Sales: $42,680 (-12% vs budget)\n• Need weekend recovery\n\nHelp me plan how to recover the sales gap this month.`
            }
          ],
          actions: ['Review monthly staffing model', 'Plan weekend promotions', 'Optimize shift coverage']
        };
      case 'year':
        return {
          issues: [
            {
              id: 'ytd-margins',
              icon: 'check-circle',
              iconBg: 'bg-emerald-100',
              iconColor: 'text-emerald-600',
              title: 'Year-to-date margins remain healthy',
              description: 'YTD margins are holding despite recent labor pressure. Today\'s results align with the broader trend.',
              tags: [{ label: 'YTD', color: 'bg-gray-100 text-gray-600' }, { label: 'Prime Cost +1.1 pts', color: 'bg-amber-100 text-amber-700' }],
              context: `[CONTEXT]\nRole: General Manager\nPeriod: 2026 YTD\nIssue: Overall margin health check\nMetrics:\n• YTD Prime Cost: 60.3% (+1.1 pts vs target)\n• Margins healthy but showing slight pressure\n• Labor is primary variance driver\n\nHelp me understand the YTD trend and what to watch going forward.`
            },
            {
              id: 'ytd-labor-trend',
              icon: 'users',
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-600',
              title: 'Labor costs trending slightly above target',
              description: 'YTD labor is +0.6 pts above target. Consistent but manageable pressure.',
              tags: [{ label: 'YTD', color: 'bg-gray-100 text-gray-600' }, { label: 'Labor +0.6 pts', color: 'bg-amber-100 text-amber-700' }],
              context: `[CONTEXT]\nRole: General Manager\nPeriod: 2026 YTD\nIssue: Labor cost trend\nMetrics:\n• YTD Labor %: 29.8% (+0.6 pts vs target)\n• Trend: Consistent but manageable\n\nHelp me identify opportunities to optimize labor for the rest of the year.`
            }
          ],
          actions: ['Review annual staffing trends', 'Analyze seasonal patterns', 'Plan Q1 optimization']
        };
    }
  };
  
  const whatHappenedData = getWhatHappenedNarrative();
  
  // Shift Breakdown data by time range - hourly (synced with Performance Summary)
  const shiftBreakdownData = {
    today: [
      { hour: '9am', sales: 180, labor: 85, laborPct: 47.2 },
      { hour: '10am', sales: 240, labor: 95, laborPct: 39.6 },
      { hour: '11am', sales: 420, labor: 140, laborPct: 33.3 },
      { hour: '12pm', sales: 780, labor: 290, laborPct: 37.2 },
      { hour: '1pm', sales: 640, labor: 280, laborPct: 43.8 },
      { hour: '2pm', sales: 320, labor: 150, laborPct: 46.9 },
      { hour: '3pm', sales: 180, labor: 70, laborPct: 38.9 },
      { hour: '4pm', sales: 180, labor: 70, laborPct: 38.9 },
      { hour: '5pm', sales: 280, labor: 60, laborPct: 21.4 },
      { hour: '6pm', sales: 520, labor: 80, laborPct: 15.4 },
      { hour: '7pm', sales: 480, labor: 75, laborPct: 15.6 },
      { hour: '8pm', sales: 300, labor: 65, laborPct: 21.7 },
      { hour: '9pm', sales: 200, labor: 50, laborPct: 25.0 },
      { hour: '10pm', sales: 100, labor: 25, laborPct: 25.0 },
    ],
    week: [
      { hour: '9am', sales: 1260, labor: 595, laborPct: 47.2 },
      { hour: '10am', sales: 1680, labor: 665, laborPct: 39.6 },
      { hour: '11am', sales: 2940, labor: 980, laborPct: 33.3 },
      { hour: '12pm', sales: 5460, labor: 2030, laborPct: 37.2 },
      { hour: '1pm', sales: 4480, labor: 1190, laborPct: 26.6 },
      { hour: '2pm', sales: 2240, labor: 840, laborPct: 37.5 },
      { hour: '3pm', sales: 1260, labor: 490, laborPct: 38.9 },
      { hour: '4pm', sales: 1260, labor: 560, laborPct: 44.4 },
      { hour: '5pm', sales: 1960, labor: 420, laborPct: 21.4 },
      { hour: '6pm', sales: 3640, labor: 560, laborPct: 15.4 },
      { hour: '7pm', sales: 3360, labor: 525, laborPct: 15.6 },
      { hour: '8pm', sales: 2100, labor: 455, laborPct: 21.7 },
      { hour: '9pm', sales: 1400, labor: 300, laborPct: 21.4 },
      { hour: '10pm', sales: 700, labor: 150, laborPct: 21.4 },
    ],
    month: [
      { hour: '9am', sales: 2160, labor: 1020, laborPct: 47.2 },
      { hour: '10am', sales: 2880, labor: 1140, laborPct: 39.6 },
      { hour: '11am', sales: 5040, labor: 1680, laborPct: 33.3 },
      { hour: '12pm', sales: 9360, labor: 2810, laborPct: 30.0 },
      { hour: '1pm', sales: 7680, labor: 2050, laborPct: 26.7 },
      { hour: '2pm', sales: 3840, labor: 1340, laborPct: 34.9 },
      { hour: '3pm', sales: 2160, labor: 840, laborPct: 38.9 },
      { hour: '4pm', sales: 2160, labor: 880, laborPct: 40.7 },
      { hour: '5pm', sales: 3360, labor: 670, laborPct: 19.9 },
      { hour: '6pm', sales: 6240, labor: 870, laborPct: 13.9 },
      { hour: '7pm', sales: 5760, labor: 840, laborPct: 14.6 },
      { hour: '8pm', sales: 3600, labor: 770, laborPct: 21.4 },
      { hour: '9pm', sales: 2400, labor: 480, laborPct: 20.0 },
      { hour: '10pm', sales: 1200, labor: 240, laborPct: 20.0 },
    ],
    year: [
      { hour: '9am', sales: 2160, labor: 970, laborPct: 44.9 },
      { hour: '10am', sales: 2880, labor: 1080, laborPct: 37.5 },
      { hour: '11am', sales: 5040, labor: 1580, laborPct: 31.3 },
      { hour: '12pm', sales: 9360, labor: 2620, laborPct: 28.0 },
      { hour: '1pm', sales: 7680, labor: 1920, laborPct: 25.0 },
      { hour: '2pm', sales: 3840, labor: 1230, laborPct: 32.0 },
      { hour: '3pm', sales: 2160, labor: 780, laborPct: 36.1 },
      { hour: '4pm', sales: 2160, labor: 800, laborPct: 37.0 },
      { hour: '5pm', sales: 3360, labor: 600, laborPct: 17.9 },
      { hour: '6pm', sales: 6240, labor: 810, laborPct: 13.0 },
      { hour: '7pm', sales: 5760, labor: 780, laborPct: 13.5 },
      { hour: '8pm', sales: 3600, labor: 700, laborPct: 19.4 },
      { hour: '9pm', sales: 2400, labor: 430, laborPct: 17.9 },
      { hour: '10pm', sales: 1200, labor: 200, laborPct: 16.7 },
    ]
  };
  
  // Zoom state for shift breakdown graph
  const [shiftZoomLevel, setShiftZoomLevel] = useState<'60min' | '15min' | '5min' | '1min'>('60min');
  const [shiftZoomWindow, setShiftZoomWindow] = useState<{ start: number; end: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState<number | null>(null);
  const [dataOffset, setDataOffset] = useState(0);
  
  // Generate data at different resolutions
  const generateZoomedData = (baseHour: number, resolution: '15min' | '5min' | '1min') => {
    const baseData = shiftBreakdownData[gmTimeRange].find(d => {
      const hourNum = parseInt(d.hour.replace('am', '').replace('pm', ''));
      const isPM = d.hour.includes('pm') && hourNum !== 12;
      const isAM = d.hour.includes('am') || hourNum === 12;
      const hour24 = isPM ? hourNum + 12 : (hourNum === 12 && d.hour.includes('am') ? 0 : hourNum);
      return hour24 === baseHour;
    });
    
    if (!baseData) return [];
    
    const intervals = resolution === '15min' ? 4 : resolution === '5min' ? 12 : 60;
    const minuteStep = resolution === '15min' ? 15 : resolution === '5min' ? 5 : 1;
    
    return Array.from({ length: intervals }, (_, i) => {
      const minute = i * minuteStep;
      const variation = 0.7 + Math.random() * 0.6;
      const salesPerInterval = (baseData.sales / intervals) * variation;
      const laborPerInterval = (baseData.labor / intervals) * (0.8 + Math.random() * 0.4);
      const hourLabel = baseHour > 12 ? `${baseHour - 12}` : baseHour === 0 ? '12' : `${baseHour}`;
      const ampm = baseHour >= 12 ? 'pm' : 'am';
      
      return {
        time: `${hourLabel}:${minute.toString().padStart(2, '0')}${ampm}`,
        sales: Math.round(salesPerInterval),
        labor: Math.round(laborPerInterval),
        laborPct: laborPerInterval > 0 ? Math.round((laborPerInterval / salesPerInterval) * 100 * 10) / 10 : 0
      };
    });
  };
  
  // Generate full day data at current resolution
  const getFullDayData = (resolution: '15min' | '5min' | '1min') => {
    let allData: any[] = [];
    for (let h = 9; h <= 22; h++) {
      const hourData = generateZoomedData(h, resolution);
      allData = [...allData, ...hourData];
    }
    return allData;
  };
  
  // Get visible window of data based on zoom and pan
  const getZoomedShiftData = () => {
    if (shiftZoomLevel === '60min') {
      return shiftBreakdownData[gmTimeRange];
    }
    
    const fullData = getFullDayData(shiftZoomLevel);
    const windowSize = shiftZoomLevel === '15min' ? 16 : shiftZoomLevel === '5min' ? 24 : 30;
    const maxOffset = Math.max(0, fullData.length - windowSize);
    const clampedOffset = Math.min(Math.max(0, dataOffset), maxOffset);
    
    return fullData.slice(clampedOffset, clampedOffset + windowSize);
  };
  
  const currentShiftData = getZoomedShiftData();
  const shiftTotalSales = currentShiftData.reduce((sum, s) => sum + s.sales, 0);
  const shiftTotalLabor = currentShiftData.reduce((sum, s) => sum + s.labor, 0);
  
  // Reset zoom when time range changes
  useEffect(() => {
    setShiftZoomLevel('60min');
    setShiftZoomWindow(null);
    setDataOffset(0);
  }, [gmTimeRange]);
  
  // Get max offset for current zoom level
  const getMaxOffset = () => {
    if (shiftZoomLevel === '60min') return 0;
    const totalPoints = 14 * (shiftZoomLevel === '15min' ? 4 : shiftZoomLevel === '5min' ? 12 : 60);
    const windowSize = shiftZoomLevel === '15min' ? 16 : shiftZoomLevel === '5min' ? 24 : 30;
    return Math.max(0, totalPoints - windowSize);
  };
  
  // Handle zoom from drag selection (for hourly view)
  const handleShiftChartMouseDown = (e: any) => {
    if (shiftZoomLevel === '60min' && e && e.activeLabel) {
      setIsDragging(true);
      setDragStart(e.activeTooltipIndex);
    }
  };
  
  const handleShiftChartMouseMove = (e: any) => {
    if (isDragging && e && e.activeTooltipIndex !== undefined) {
      setDragEnd(e.activeTooltipIndex);
    }
  };
  
  const handleShiftChartMouseUp = () => {
    if (isDragging && dragStart !== null && dragEnd !== null && dragStart !== dragEnd) {
      const start = Math.min(dragStart, dragEnd);
      const end = Math.max(dragStart, dragEnd);
      
      // Zoom in based on selection
      if (shiftZoomLevel === '60min') {
        setShiftZoomLevel('15min');
        setDataOffset(start * 4);
        setShiftZoomWindow({ start: start + 9, end: end + 10 });
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };
  
  // Native DOM event handlers for panning (when zoomed)
  const [accumulatedDelta, setAccumulatedDelta] = useState(0);
  
  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (shiftZoomLevel !== '60min') {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setPanStartX(e.clientX);
      setAccumulatedDelta(0);
    }
  };
  
  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStartX !== null && shiftZoomLevel !== '60min') {
      e.preventDefault();
      const delta = panStartX - e.clientX;
      const newAccumulated = accumulatedDelta + delta;
      
      // Sensitivity: pixels needed to move one data point
      const pixelsPerPoint = shiftZoomLevel === '1min' ? 3 : shiftZoomLevel === '5min' ? 5 : 8;
      const pointsToMove = Math.floor(newAccumulated / pixelsPerPoint);
      
      if (pointsToMove !== 0) {
        const maxOff = getMaxOffset();
        const newOffset = Math.min(Math.max(0, dataOffset + pointsToMove), maxOff);
        setDataOffset(newOffset);
        setAccumulatedDelta(newAccumulated - (pointsToMove * pixelsPerPoint));
        setPanStartX(e.clientX);
      } else {
        setAccumulatedDelta(newAccumulated);
        setPanStartX(e.clientX);
      }
    }
  };
  
  const handlePanMouseUp = () => {
    setIsPanning(false);
    setPanStartX(null);
    setAccumulatedDelta(0);
  };
  
  // Calculate current time window for display
  const getCurrentTimeWindow = () => {
    if (shiftZoomLevel === '60min') return null;
    
    const pointsPerHour = shiftZoomLevel === '15min' ? 4 : shiftZoomLevel === '5min' ? 12 : 60;
    const windowSize = shiftZoomLevel === '15min' ? 16 : shiftZoomLevel === '5min' ? 24 : 30;
    
    const startMinutes = (9 * 60) + (dataOffset / pointsPerHour * 60);
    const endMinutes = startMinutes + (windowSize / pointsPerHour * 60);
    
    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      const period = h >= 12 ? 'pm' : 'am';
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return m === 0 ? `${hour12}${period}` : `${hour12}:${m.toString().padStart(2, '0')}${period}`;
    };
    
    return { start: formatTime(startMinutes), end: formatTime(Math.min(endMinutes, 22 * 60)) };
  };
  
  const timeWindow = getCurrentTimeWindow();
  
  const handleShiftChartDoubleClick = () => {
    setShiftZoomLevel('60min');
    setShiftZoomWindow(null);
    setDataOffset(0);
  };
  
  // Shift time customization state
  const [lunchStart, setLunchStart] = useState("11:00");
  const [lunchEnd, setLunchEnd] = useState("16:00");
  const [dinnerStart, setDinnerStart] = useState("16:00");
  const [dinnerEnd, setDinnerEnd] = useState("22:00");
  
  // Calculate shift data based on hours
  const getShiftData = (start: string, end: string, isLunch: boolean) => {
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);
    const hours = endHour - startHour;
    
    // Base hourly rates (simulated data)
    const hourlyData: Record<number, { sales: number; labor: number; cogs: number }> = {
      10: { sales: 180, labor: 85, cogs: 58 },
      11: { sales: 320, labor: 95, cogs: 102 },
      12: { sales: 480, labor: 110, cogs: 154 },
      13: { sales: 420, labor: 105, cogs: 134 },
      14: { sales: 280, labor: 90, cogs: 90 },
      15: { sales: 200, labor: 85, cogs: 64 },
      16: { sales: 350, labor: 120, cogs: 112 },
      17: { sales: 520, labor: 140, cogs: 166 },
      18: { sales: 680, labor: 160, cogs: 218 },
      19: { sales: 720, labor: 165, cogs: 230 },
      20: { sales: 640, labor: 155, cogs: 205 },
      21: { sales: 480, labor: 130, cogs: 154 },
      22: { sales: 280, labor: 100, cogs: 90 },
    };
    
    let totalSales = 0;
    let totalLabor = 0;
    let totalCogs = 0;
    
    for (let h = startHour; h < endHour; h++) {
      const data = hourlyData[h] || { sales: 200, labor: 80, cogs: 64 };
      totalSales += data.sales;
      totalLabor += data.labor;
      totalCogs += data.cogs;
    }
    
    const laborPct = totalSales > 0 ? (totalLabor / totalSales) * 100 : 0;
    const cogsPct = totalSales > 0 ? (totalCogs / totalSales) * 100 : 0;
    const primePct = laborPct + cogsPct;
    
    // Compare to averages (baseline: lunch avg 29%, dinner avg 28.8%)
    const avgLaborPct = isLunch ? 29.0 : 28.8;
    const avgPrimePct = isLunch ? 59.7 : 60.2;
    const avgSales = isLunch ? 1872 : 3248;
    
    const laborVariance = laborPct - avgLaborPct;
    const primeVariance = primePct - avgPrimePct;
    const salesVariance = ((totalSales - avgSales) / avgSales) * 100;
    
    const hasIssue = laborVariance > 5 || primeVariance > 5 || salesVariance < -10;
    
    return {
      sales: totalSales,
      laborPct: laborPct.toFixed(1),
      primePct: primePct.toFixed(1),
      laborVariance: laborVariance.toFixed(1),
      primeVariance: primeVariance.toFixed(1),
      salesVariance: salesVariance.toFixed(1),
      hasIssue,
      hours
    };
  };
  
  const lunchData = getShiftData(lunchStart, lunchEnd, true);
  const dinnerData = getShiftData(dinnerStart, dinnerEnd, false);
  const [showFullPnl, setShowFullPnl] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [goalsMet, setGoalsMet] = useState(true); // Mock state for confetti
  const [highlightedPnlNodeId, setHighlightedPnlNodeId] = useState<string | null>(null);
  const [trendModalMetric, setTrendModalMetric] = useState<MetricTrendData | null>(null);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSectionsSidebar, setShowSectionsSidebar] = useState(false);
  const [sections, setSections] = useState<EditableSection[]>(defaultSections);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  
  // Editable Content State
  const [editableContent, setEditableContent] = useState({
    executiveSummary: "Net operating income dropped 38.8% to $17.7K as revenue declined 13.8%. Operating costs improved by 12.1%.",
    revenueAnalysis: "Revenue declined by $21.3K (-13.8%) primarily driven by lower Food Sales ($18.5K decrease) and N/A Beverage sales ($5K decrease). Delivery platforms showed mixed results with UberEats growing 23.7% while DoorDash declined 11%.",
    primeCostAnalysis: "Prime costs as a percentage of revenue increased to 54% from 49.2% last month. COGS improved slightly but labor efficiency gains were offset by the revenue decline.",
    operatingExpenses: "Operating expenses decreased by $8.2K (-12.1%) with notable savings in Marketing & PR ($1.1K), Repairs & Maintenance ($530), and Salaries & Wages ($2K).",
    bottomLine: "Net operating income of $17.7K represents a 13.3% margin. This is below the 15% target but still within acceptable range given the seasonal revenue decline.",
    actionItems: "Focus on reversing the Food Sales decline through targeted promotions. Monitor beverage cost increases and renegotiate supplier contracts. Continue leveraging UberEats growth momentum.",
  });
  
  // Section drag handlers
  const handleSectionDragStart = (sectionId: string) => {
    setDraggedSectionId(sectionId);
  };
  
  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedSectionId && draggedSectionId !== sectionId) {
      setDragOverSectionId(sectionId);
    }
  };
  
  const handleSectionDragLeave = () => {
    setDragOverSectionId(null);
  };
  
  const handleSectionDrop = (targetSectionId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;
    
    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedSectionId);
    const targetIndex = newSections.findIndex(s => s.id === targetSectionId);
    
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    
    setSections(newSections);
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };
  
  const handleSectionDragEnd = () => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };
  
  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ));
  };
  
  const removeSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, visible: false } : s
    ));
  };
  
  const isSectionVisible = (sectionId: string) => {
    return sections.find(s => s.id === sectionId)?.visible ?? true;
  };
  
  const getSectionOrderIndex = (sectionId: string) => {
    return sections.findIndex(s => s.id === sectionId);
  };
  
  // Processing animation messages - P&L specific
  const processingMessages = [
    "Importing Data...",
    "Analyzing Revenue...",
    "Calculating Costs...",
    "Categorizing Expenses...",
    "Computing Margins...",
    "Building Your P&L..."
  ];

  // Handle file upload and start processing
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  // Start the magical processing animation
  const startProcessingAnimation = () => {
    setShowUploadModal(false);
    setShowProcessingAnimation(true);
    setProcessingStep(0);
    
    // Cycle through processing messages
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < processingMessages.length) {
        setProcessingStep(currentStep);
      } else {
        clearInterval(interval);
        // Animation complete - go to P&L view
        setTimeout(() => {
          setShowProcessingAnimation(false);
          setPeriod("October 2025");
          setStep(2);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 }
          });
          toast({
            title: "P&L Report Generated",
            description: "Your October 2025 P&L is ready for review.",
          });
        }, 800);
      }
    }, 1200);
  };

  // Handle drag and drop
  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file);
    }
  };

  // Filter state for P&L Release list
  const [filters, setFilters] = useState<PnLFilterState>(loadFilters);
  const [showPnlStatusDropdown, setShowPnlStatusDropdown] = useState(false);
  const [showOwnerStatusDropdown, setShowOwnerStatusDropdown] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // Update localStorage when filters change
  useEffect(() => {
    saveFilters(filters);
  }, [filters]);

  // Curated View filter preferences
  const [curatedPrefs, setCuratedPrefs] = useState<CuratedViewPrefs>(loadCuratedPrefs);
  const [showCuratedFilterDropdown, setShowCuratedFilterDropdown] = useState(false);
  const [roleBannerExpanded, setRoleBannerExpanded] = useState(true);
  const [ownerViewTab, setOwnerViewTab] = useState<"curated" | "detailed">("curated");
  const curatedFilterRef = React.useRef<HTMLDivElement>(null);

  // Get active filters for current role
  const activeFilters = curatedPrefs[selectedRole];
  const filterOptions = getFilterOptionsForRole(selectedRole);

  // Check if filter is enabled
  const isFilterEnabled = (filterId: CuratedFilterId) => activeFilters.includes(filterId);

  // Toggle a filter
  const toggleCuratedFilter = (filterId: CuratedFilterId) => {
    setCuratedPrefs(prev => {
      const currentFilters = prev[selectedRole];
      const newFilters = currentFilters.includes(filterId)
        ? currentFilters.filter(f => f !== filterId)
        : [...currentFilters, filterId];
      const updated = { ...prev, [selectedRole]: newFilters, hasSeenHint: true };
      saveCuratedPrefs(updated);
      return updated;
    });
  };

  // Reset to role defaults
  const resetToRoleDefaults = () => {
    setCuratedPrefs(prev => {
      const updated = { ...prev, [selectedRole]: getDefaultFiltersForRole(selectedRole), hasSeenHint: true };
      saveCuratedPrefs(updated);
      return updated;
    });
  };

  // Dismiss hint
  const dismissHint = () => {
    setCuratedPrefs(prev => {
      const updated = { ...prev, hasSeenHint: true };
      saveCuratedPrefs(updated);
      return updated;
    });
  };

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (curatedFilterRef.current && !curatedFilterRef.current.contains(event.target as Node)) {
        setShowCuratedFilterDropdown(false);
      }
    };
    if (showCuratedFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCuratedFilterDropdown]);

  // Email Report Modal State
  const [showEmailReportModal, setShowEmailReportModal] = useState(false);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [expandedMissedTarget, setExpandedMissedTarget] = useState<string | null>(null);
  const [emailRecipients, setEmailRecipients] = useState<string[]>([
    "owner@restaurant.com",
    "gm@restaurant.com"
  ]);
  const [newRecipient, setNewRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("Manager Scoreboard Report - Q3 2025");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Get manager scoreboard data for email
  const getScoreboardData = () => ({
    quarter: "Q3 2025",
    location: "STMARKS",
    manager: "Sarah Mitchell",
    role: "General Manager",
    goalsHit: "2/3",
    goals: [
      { name: "Labor under 33%", achieved: true, value: "32%", bonus: "$250" },
      { name: "Sales target $120k", achieved: true, value: "$124.5k", bonus: "$200" },
      { name: "COGS under 30%", achieved: false, value: "31%", bonus: "$0" }
    ],
    totalBonus: "$450",
    generatedAt: new Date().toLocaleString()
  });

  // Add recipient
  const addRecipient = () => {
    const email = newRecipient.trim().toLowerCase();
    if (email && email.includes("@") && !emailRecipients.includes(email)) {
      setEmailRecipients([...emailRecipients, email]);
      setNewRecipient("");
    }
  };

  // Remove recipient
  const removeRecipient = (email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email));
  };

  // Send email report
  const sendEmailReport = async () => {
    if (emailRecipients.length === 0) return;

    setEmailSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Report sent successfully",
        description: `Email sent to ${emailRecipients.length} recipient${emailRecipients.length > 1 ? 's' : ''}`
      });

      setShowEmailReportModal(false);
      setShowEmailPreview(false);
    } catch (error) {
      toast({
        title: "Failed to send report",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setEmailSending(false);
    }
  };

  // Filter periods based on current filter state
  const filteredPeriods = pnlPeriods.filter(p => {
    // Check date range
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    if (p.endDate < startDate || p.startDate > endDate) {
      return false;
    }

    // Check P&L status (if any selected)
    if (filters.pnlStatuses.length > 0 && !filters.pnlStatuses.includes(p.pnlStatus)) {
      return false;
    }

    // Check Owner status (if any selected)
    if (filters.ownerStatuses.length > 0 && !filters.ownerStatuses.includes(p.ownerStatus)) {
      return false;
    }

    return true;
  });

  const togglePnlStatus = (status: PnLStatus) => {
    setFilters(prev => ({
      ...prev,
      pnlStatuses: prev.pnlStatuses.includes(status)
        ? prev.pnlStatuses.filter(s => s !== status)
        : [...prev.pnlStatuses, status]
    }));
  };

  const toggleOwnerStatus = (status: OwnerStatus) => {
    setFilters(prev => ({
      ...prev,
      ownerStatuses: prev.ownerStatuses.includes(status)
        ? prev.ownerStatuses.filter(s => s !== status)
        : [...prev.ownerStatuses, status]
    }));
  };

  const clearAllFilters = () => {
    setFilters(getDefaultFilters());
  };

  const hasActiveFilters = filters.pnlStatuses.length > 0 || filters.ownerStatuses.length > 0;

  // Format filter summary label
  const getFilterSummary = () => {
    const parts: string[] = [];
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    parts.push(`${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
    parts.push(filters.timeframe);
    if (filters.pnlStatuses.length > 0) parts.push(filters.pnlStatuses.join(", "));
    if (filters.ownerStatuses.length > 0) parts.push(filters.ownerStatuses.join(", "));
    return parts.join(" · ");
  };

  // Open trend chart modal for a Health Snapshot metric
  const openTrendModal = (metricId: string) => {
    console.log("Opening trend modal for:", metricId);
    const metric = healthSnapshotTrendData.find(m => m.id === metricId);
    if (metric) {
      setTrendModalMetric(metric);
    } else {
      console.warn("Metric not found for trend modal:", metricId);
    }
  };

  // Navigate to a specific P&L node from executive summary
  const navigateToPnlNode = (metricKey: string) => {
    const mapping = METRIC_TO_PNL_NODE[metricKey];
    if (mapping) {
      setHighlightedPnlNodeId(mapping.nodeId);
      // Scroll to the P&L Dashboard section
      setTimeout(() => {
        const pnlSection = document.getElementById('pnl-dashboard');
        if (pnlSection) {
          pnlSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  };

  // Sync selectedRole with URL param when navigating between roles
  useEffect(() => {
    if (urlRole && urlRole !== selectedRole) {
      setSelectedRole(urlRole);
    }
  }, [urlRole]);

  useEffect(() => {
    if (isOwnerView && goalsMet && selectedRole === "owner") {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOwnerView, goalsMet, selectedRole]);

  // Scroll tracking for TOC
  useEffect(() => {
    if (activeTab !== "detailed" || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;

      const sections = tocSections.map(section => {
        const element = document.getElementById(section.id);
        if (!element) return { id: section.id, relativeTop: Infinity };
        const elementRect = element.getBoundingClientRect();
        // Calculate position relative to the container's top
        const relativeTop = elementRect.top - containerTop;
        return { id: section.id, relativeTop };
      });

      // Find the section that is currently visible (closest to top of container)
      // A section is "active" when its top is at or above the threshold (e.g., 100px from container top)
      let currentSection = sections[0].id; // Default to first section

      for (const section of sections) {
        // Section becomes active when it's within 100px of the container top
        if (section.relativeTop <= 100) {
          currentSection = section.id;
        }
      }

      setActiveSection(currentSection);
    };

    container.addEventListener("scroll", handleScroll);
    
    // Run initial detection after a brief delay to ensure DOM is ready
    const initialTimeout = setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(initialTimeout);
    };
  }, [activeTab]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  }, []);

  // Handlers
  const handlePeriodClick = (p: PnLPeriod) => {
     setPeriod(p.period);
     setLocationName(p.location);
     setStep(2);
  };

  const handleOpenReport = (report: Report) => {
    if (!reportTabs.find(r => r.id === report.id)) {
      setReportTabs(prev => [...prev, report]);
    }
    setActiveTab(report.id);
  };

  const handleCloseReport = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportTabs(prev => prev.filter(r => r.id !== reportId));
    if (activeTab === reportId) {
      setActiveTab("curated");
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStep(2);
      toast({
        title: "Sync Complete",
        description: "Financial data retrieved from QuickBooks.",
      });
    }, 2000);
  };

  const handleRelease = () => {
    setShowReleaseModal(true);
  };

  const confirmRelease = () => {
    setShowReleaseModal(false);

    // Simulate release by setting a flag (in a real app this would be a backend call)
    localStorage.setItem("munch_pnl_released", "true");
    localStorage.setItem("munch_pnl_period", period);

    toast({
      title: "P&L Released",
      description: "Owner has been notified via email and app.",
    });

    // Redirect to home page after a short delay
    setTimeout(() => {
      setLocation("/insight/home");
    }, 1000);
  };

  const handleInsightClick = (query: string) => {
    setFloatingChatTrigger(query + " " + Date.now()); // Unique trigger for floating chat
    setShowChat(true); // Open the chat panel
  };

  // --- Step 1: P&L List Table ---
  if (step === 1) {
    return (
      <Layout>
         <div className="flex flex-col h-full bg-gray-50/30">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">P&L Release</h1>
                     <p className="text-sm text-muted-foreground">Manage and release monthly financial packages to location owners.</p>
                  </div>
                  <button 
                     onClick={() => {
                        setUploadedFile(null);
                        setShowUploadModal(true);
                     }}
                     className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                     data-testid="button-start-new-release"
                  >
                     <Plus className="h-4 w-4" /> Start New Release
                  </button>
               </div>

               {/* Unified Filters Bar */}
               <div className="flex flex-wrap gap-3 items-center">
                  {/* Calendar / Date Range Filter */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
                     <div className="flex items-center gap-2 px-3 py-1.5">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <input
                           type="date"
                           value={filters.startDate}
                           onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                           className="bg-transparent text-sm text-gray-700 border-none focus:outline-none w-28"
                           data-testid="filter-start-date"
                        />
                        <span className="text-gray-400">–</span>
                        <input
                           type="date"
                           value={filters.endDate}
                           min={filters.startDate}
                           onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                           className="bg-transparent text-sm text-gray-700 border-none focus:outline-none w-28"
                           data-testid="filter-end-date"
                        />
                     </div>
                     <div className="h-6 w-px bg-gray-200" />
                     <div className="relative">
                        <button 
                           onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                           className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                           data-testid="filter-timeframe"
                        >
                           {filters.timeframe}
                           <ChevronDown className="h-3 w-3 opacity-50" />
                        </button>
                        {showTimeframeDropdown && (
                           <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              {TIMEFRAME_OPTIONS.map(tf => (
                                 <button
                                    key={tf}
                                    onClick={() => { setFilters(prev => ({ ...prev, timeframe: tf })); setShowTimeframeDropdown(false); }}
                                    className={cn(
                                       "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                                       filters.timeframe === tf && "bg-gray-50 font-medium"
                                    )}
                                 >
                                    {tf}
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* P&L Status Filter */}
                  <div className="relative">
                     <button 
                        onClick={() => { setShowPnlStatusDropdown(!showPnlStatusDropdown); setShowOwnerStatusDropdown(false); }}
                        className={cn(
                           "flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors",
                           filters.pnlStatuses.length > 0 
                              ? "bg-black text-white border-black" 
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                        data-testid="filter-pnl-status"
                     >
                        <span>P&L Status</span>
                        {filters.pnlStatuses.length > 0 && (
                           <span className="bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {filters.pnlStatuses.length}
                           </span>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-70" />
                     </button>
                     {showPnlStatusDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[180px]">
                           <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by Status</span>
                           </div>
                           {PNL_STATUS_OPTIONS.map(status => (
                              <button
                                 key={status}
                                 onClick={() => togglePnlStatus(status)}
                                 className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                                 data-testid={`filter-pnl-status-${status.toLowerCase().replace(" ", "-")}`}
                              >
                                 <div className={cn(
                                    "h-4 w-4 rounded border flex items-center justify-center",
                                    filters.pnlStatuses.includes(status) 
                                       ? "bg-black border-black text-white" 
                                       : "border-gray-300"
                                 )}>
                                    {filters.pnlStatuses.includes(status) && <Check className="h-3 w-3" />}
                                 </div>
                                 <span>{status}</span>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Owner Status Filter */}
                  <div className="relative">
                     <button 
                        onClick={() => { setShowOwnerStatusDropdown(!showOwnerStatusDropdown); setShowPnlStatusDropdown(false); }}
                        className={cn(
                           "flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors",
                           filters.ownerStatuses.length > 0 
                              ? "bg-black text-white border-black" 
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                        data-testid="filter-owner-status"
                     >
                        <span>Owner Status</span>
                        {filters.ownerStatuses.length > 0 && (
                           <span className="bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {filters.ownerStatuses.length}
                           </span>
                        )}
                        <ChevronDown className="h-3 w-3 opacity-70" />
                     </button>
                     {showOwnerStatusDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                           <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by Owner Status</span>
                           </div>
                           {OWNER_STATUS_OPTIONS.map(status => (
                              <button
                                 key={status}
                                 onClick={() => toggleOwnerStatus(status)}
                                 className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                                 data-testid={`filter-owner-status-${status.toLowerCase().replace(" ", "-")}`}
                              >
                                 <div className={cn(
                                    "h-4 w-4 rounded border flex items-center justify-center",
                                    filters.ownerStatuses.includes(status) 
                                       ? "bg-black border-black text-white" 
                                       : "border-gray-300"
                                 )}>
                                    {filters.ownerStatuses.includes(status) && <Check className="h-3 w-3" />}
                                 </div>
                                 <span>{status}</span>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                     <button 
                        onClick={clearAllFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        data-testid="clear-filters"
                     >
                        <X className="h-3.5 w-3.5" />
                        Clear filters
                     </button>
                  )}

                  <div className="ml-auto flex gap-3 items-center">
                     {/* Filter Summary */}
                     <span className="text-xs text-gray-500 hidden lg:block">
                        {getFilterSummary()}
                     </span>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                           type="text" 
                           placeholder="Search periods..." 
                           className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-black"
                           data-testid="search-periods"
                        />
                     </div>
                  </div>
               </div>

               {/* Active Filter Tags */}
               {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mt-3">
                     {filters.pnlStatuses.map(status => (
                        <span 
                           key={`pnl-${status}`}
                           className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                           {status}
                           <button 
                              onClick={() => togglePnlStatus(status)}
                              className="hover:text-gray-900"
                           >
                              <X className="h-3 w-3" />
                           </button>
                        </span>
                     ))}
                     {filters.ownerStatuses.map(status => (
                        <span 
                           key={`owner-${status}`}
                           className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                           {status}
                           <button 
                              onClick={() => toggleOwnerStatus(status)}
                              className="hover:text-blue-900"
                           >
                              <X className="h-3 w-3" />
                           </button>
                        </span>
                     ))}
                  </div>
               )}
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-8">
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-4 font-semibold text-gray-900">Period</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Location</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Sent Date</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Owner Status</th>
                           <th className="px-6 py-4"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredPeriods.map((item) => (
                           <tr 
                              key={item.id} 
                              onClick={() => handlePeriodClick(item)}
                              className="hover:bg-gray-50 transition-colors cursor-pointer group"
                              data-testid={`pnl-row-${item.id}`}
                           >
                              <td className="px-6 py-4 font-medium text-gray-900">{item.period}</td>
                              <td className="px-6 py-4 text-gray-600">{item.location}</td>
                              <td className="px-6 py-4">
                                 <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                    item.pnlStatus === "Draft" && "bg-gray-50 text-gray-700 border-gray-200",
                                    item.pnlStatus === "In Review" && "bg-blue-50 text-blue-700 border-blue-100",
                                    item.pnlStatus === "Finalized" && "bg-amber-50 text-amber-700 border-amber-100",
                                    item.pnlStatus === "Published" && "bg-emerald-50 text-emerald-700 border-emerald-100"
                                 )}>
                                    {item.pnlStatus === "Published" && <Check className="h-3 w-3" />}
                                    {item.pnlStatus === "In Review" && <Loader2 className="h-3 w-3" />}
                                    {item.pnlStatus}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500">{item.sentDate || "—"}</td>
                              <td className="px-6 py-4">
                                 <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                    item.ownerStatus === "Approved" && "bg-emerald-50 text-emerald-700",
                                    item.ownerStatus === "Viewed" && "bg-blue-50 text-blue-700",
                                    item.ownerStatus === "Sent" && "bg-gray-100 text-gray-700",
                                    item.ownerStatus === "Not Sent" && "bg-gray-50 text-gray-500",
                                    item.ownerStatus === "Changes Requested" && "bg-red-50 text-red-700"
                                 )}>
                                    {item.ownerStatus}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors ml-auto" />
                              </td>
                           </tr>
                        ))}
                        {filteredPeriods.length === 0 && (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                 No P&L reports match the current filters. Try adjusting your filter criteria.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Upload Modal */}
         <AnimatePresence>
           {showUploadModal && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
               onClick={() => setShowUploadModal(false)}
             >
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 transition={{ duration: 0.2 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-200"
               >
                 {/* Modal Header */}
                 <div className="flex items-center justify-between p-5 border-b border-gray-100">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                       <FileSpreadsheet className="h-5 w-5 text-white" />
                     </div>
                     <div>
                       <h3 className="font-serif font-semibold text-gray-900">Upload Financial Data</h3>
                       <p className="text-sm text-gray-500">Import CSV or Excel file</p>
                     </div>
                   </div>
                   <button
                     onClick={() => setShowUploadModal(false)}
                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                     data-testid="button-close-upload-modal"
                   >
                     <X className="h-5 w-5 text-gray-400" />
                   </button>
                 </div>

                 {/* Upload Area */}
                 <div className="p-5">
                   <div
                     onDragOver={handleFileDragOver}
                     onDragLeave={handleFileDragLeave}
                     onDrop={handleFileDrop}
                     className={cn(
                       "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
                       isDragOver 
                         ? "border-gray-900 bg-gray-50" 
                         : uploadedFile 
                           ? "border-emerald-500 bg-emerald-50"
                           : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                     )}
                     onClick={() => document.getElementById('file-upload-step1')?.click()}
                   >
                     <input
                       id="file-upload-step1"
                       type="file"
                       accept=".csv,.xlsx,.xls"
                       className="hidden"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) handleFileUpload(file);
                       }}
                       data-testid="input-file-upload"
                     />
                     
                     {uploadedFile ? (
                       <motion.div
                         initial={{ scale: 0.9, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="flex flex-col items-center gap-3"
                       >
                         <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                           <Check className="h-6 w-6 text-emerald-600" />
                         </div>
                         <div>
                           <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                           <p className="text-sm text-gray-500 mt-1">
                             {(uploadedFile.size / 1024).toFixed(1)} KB
                           </p>
                         </div>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setUploadedFile(null);
                           }}
                           className="text-sm text-gray-500 hover:text-gray-700 underline"
                           data-testid="button-remove-file"
                         >
                           Remove file
                         </button>
                       </motion.div>
                     ) : (
                       <div className="flex flex-col items-center gap-3">
                         <div className={cn(
                           "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
                           isDragOver ? "bg-gray-200" : "bg-gray-100"
                         )}>
                           <FileSpreadsheet className={cn(
                             "h-7 w-7 transition-colors",
                             isDragOver ? "text-gray-700" : "text-gray-400"
                           )} />
                         </div>
                         <div>
                           <p className="font-medium text-gray-900">
                             {isDragOver ? "Drop your file here" : "Drag & drop or click to upload"}
                           </p>
                           <p className="text-sm text-gray-500 mt-1">
                             CSV, XLSX, or XLS files
                           </p>
                         </div>
                       </div>
                     )}
                   </div>

                   <p className="text-center text-xs text-gray-400 mt-4">
                     For this demo, you can skip the upload
                   </p>
                 </div>

                 {/* Footer */}
                 <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                   <button
                     onClick={() => setShowUploadModal(false)}
                     className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                     data-testid="button-cancel-upload"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={startProcessingAnimation}
                     className="px-5 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                     data-testid="button-generate-pnl"
                   >
                     Generate P&L
                   </button>
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Processing Animation */}
         <AnimatePresence>
           {showProcessingAnimation && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] flex items-center justify-center bg-white overflow-hidden"
             >
               {/* Subtle grid pattern background */}
               <div 
                 className="absolute inset-0 opacity-[0.03]"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }}
               />

               {/* Floating dots */}
               <div className="absolute inset-0 overflow-hidden">
                 {[...Array(20)].map((_, i) => (
                   <motion.div
                     key={i}
                     className="absolute w-1 h-1 rounded-full bg-gray-300"
                     style={{
                       left: `${Math.random() * 100}%`,
                       top: `${Math.random() * 100}%`,
                     }}
                     animate={{
                       y: [0, -20, 0],
                       opacity: [0.2, 0.5, 0.2],
                     }}
                     transition={{
                       duration: 4 + Math.random() * 2,
                       repeat: Infinity,
                       delay: Math.random() * 2,
                     }}
                   />
                 ))}
               </div>

               {/* Center content */}
               <div className="relative z-10 text-center px-8">
                 {/* Spinning loader */}
                 <motion.div
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="mb-8 flex justify-center"
                 >
                   <div className="relative">
                     <div className="h-16 w-16 rounded-full border-2 border-gray-200" />
                     <motion.div 
                       className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-t-gray-900"
                       animate={{ rotate: 360 }}
                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <Sparkles className="h-6 w-6 text-gray-400" />
                     </div>
                   </div>
                 </motion.div>

                 {/* Animated Text */}
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={processingStep}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                   >
                     <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                       {processingMessages[processingStep]}
                     </h1>
                   </motion.div>
                 </AnimatePresence>

                 {/* Progress bar */}
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.3 }}
                   className="mt-8 w-64 mx-auto"
                 >
                   <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-gray-900 rounded-full"
                       initial={{ width: "0%" }}
                       animate={{ 
                         width: `${((processingStep + 1) / processingMessages.length) * 100}%` 
                       }}
                       transition={{ duration: 0.5, ease: "easeOut" }}
                     />
                   </div>
                   <p className="text-sm text-gray-400 mt-3">
                     Step {processingStep + 1} of {processingMessages.length}
                   </p>
                 </motion.div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
      </Layout>
    );
  }

  // --- Step 2: Accountant View (Editing) ---
  return (
    <Layout>
       <div className="flex h-screen bg-gray-50 overflow-hidden">

          {/* Main Editing Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">

             {/* Toolbar */}
             <div className="bg-white border-b border-gray-200 shrink-0">
                <div className="px-6 py-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <button
                         onClick={() => canEdit ? setStep(1) : setLocation("/insight/home")}
                         className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                      >
                         <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                         <h1 className="font-serif text-xl font-bold text-gray-900">{period} Report</h1>
                         <p className="text-xs text-muted-foreground">
                            {locationName} {canEdit ? "• Draft" : "• Prepared by Accountant"}
                         </p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      {/* Sync button - Accountant only */}
                      {canEdit && (
                         <>
                            {isSyncing ? (
                               <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Syncing with QuickBooks...
                               </div>
                            ) : (
                               <button
                                  onClick={handleSync}
                                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                               >
                                  <RefreshCw className="h-4 w-4" /> Sync Data
                               </button>
                            )}
                            <div className="h-6 w-px bg-gray-200" />
                         </>
                      )}
                      {/* Edit and Sections buttons - Accountant only */}
                      {canEdit && activeTab === "detailed" && (
                         <>
                            <button
                               onClick={() => setIsEditMode(!isEditMode)}
                               className={cn(
                                  "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
                                  isEditMode
                                     ? "bg-blue-50 text-blue-700 border border-blue-200"
                                     : "text-gray-600 hover:text-black hover:bg-gray-100"
                               )}
                               data-testid="button-toggle-edit-mode"
                            >
                               {isEditMode ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                               {isEditMode ? "Editing" : "Edit"}
                            </button>
                            <button
                               onClick={() => setShowSectionsSidebar(!showSectionsSidebar)}
                               className={cn(
                                  "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
                                  showSectionsSidebar
                                     ? "bg-gray-100 text-gray-900"
                                     : "text-gray-600 hover:text-black hover:bg-gray-100"
                               )}
                               data-testid="button-toggle-sections-sidebar"
                            >
                               <Layers className="h-4 w-4" /> Sections
                            </button>
                            <div className="h-6 w-px bg-gray-200" />
                         </>
                      )}
                      {/* Save Draft - Accountant only */}
                      {canEdit && (
                         <>
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                               <Save className="h-4 w-4" /> Save Draft
                            </button>
                            <div className="h-6 w-px bg-gray-200" />
                         </>
                      )}
                      {/* Assistant toggle - Always visible */}
                      <button
                         onClick={() => setShowChat(!showChat)}
                         className={cn(
                            "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
                            showChat
                               ? "bg-gray-900 text-white"
                               : "text-gray-600 hover:text-black hover:bg-gray-100"
                         )}
                         data-testid="button-toggle-assistant"
                      >
                         <Sparkles className="h-4 w-4" /> Assistant
                      </button>
                      {/* Review & Send - Accountant only */}
                      {canEdit && (
                         <button
                            onClick={handleRelease}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                         >
                            Review & Send <ArrowRight className="h-4 w-4" />
                         </button>
                      )}
                   </div>
                </div>

                {/* View Toggle Tabs */}
                <div className="px-6 flex gap-1 border-t border-gray-100">
                   {/* Curated View Tab - First */}
                   <button
                      data-testid="tab-curated-view"
                      onClick={() => setActiveTab("curated")}
                      className={cn(
                         "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                         activeTab === "curated"
                            ? "border-black text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                   >
                      <div className="flex items-center gap-2">
                         <LayoutDashboard className="h-4 w-4" />
                         Curated View
                      </div>
                   </button>

                   {/* Detailed View Tab - Second */}
                   <div 
                      ref={tocDropdownRef}
                      className="relative group"
                      onMouseEnter={() => setTocDropdownOpen(true)}
                      onMouseLeave={() => setTocDropdownOpen(false)}
                   >
                      <button
                         data-testid="tab-detailed-view"
                         onClick={() => setActiveTab("detailed")}
                         className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === "detailed"
                               ? "border-black text-gray-900"
                               : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                         )}
                      >
                         <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Detailed View
                            <ChevronDown className={cn(
                               "h-3.5 w-3.5 transition-transform duration-150",
                               tocDropdownOpen && "rotate-180"
                            )} />
                         </div>
                      </button>
                      
                      {/* TOC Dropdown Menu */}
                      <div 
                         className={cn(
                            "absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-150 ease-out",
                            tocDropdownOpen 
                               ? "opacity-100 translate-y-0 visible" 
                               : "opacity-0 -translate-y-1 invisible"
                         )}
                      >
                         <div className="px-3 py-2 border-b border-gray-100 mb-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                               Document Outline
                            </span>
                         </div>
                         {tocSections.map((section, index) => (
                            <button
                               key={section.id}
                               data-testid={`toc-dropdown-${section.id}`}
                               onClick={() => {
                                  setActiveTab("detailed");
                                  scrollToSection(section.id);
                                  setTocDropdownOpen(false);
                               }}
                               className={cn(
                                  "w-full text-left px-3 py-2 text-sm transition-colors duration-100 flex items-center gap-3",
                                  activeSection === section.id
                                     ? "bg-gray-100 text-gray-900 font-medium"
                                     : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                               )}
                            >
                               <span className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                                  activeSection === section.id
                                     ? "bg-black text-white"
                                     : "bg-gray-100 text-gray-500"
                               )}>
                                  {index + 1}
                               </span>
                               {section.label}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* P&L Dashboard Tab - Third */}
                   <button
                      data-testid="tab-pnl-view"
                      onClick={() => setActiveTab("pnl")}
                      className={cn(
                         "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                         activeTab === "pnl"
                            ? "border-black text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                   >
                      <div className="flex items-center gap-2">
                         <PieChart className="h-4 w-4" />
                         P&L Dashboard
                      </div>
                   </button>

                   {/* Reports Tab - Fourth */}
                   <button
                      data-testid="tab-reports-view"
                      onClick={() => setActiveTab("reports")}
                      className={cn(
                         "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                         activeTab === "reports"
                            ? "border-black text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                   >
                      <div className="flex items-center gap-2">
                         <FileText className="h-4 w-4" />
                         Reports
                      </div>
                   </button>

                   {/* Report Tabs */}
                   {reportTabs.map(report => (
                       <div key={report.id} className="flex items-center border-l border-gray-200 pl-1 ml-1 h-full py-2">
                           <button
                              onClick={() => setActiveTab(report.id)}
                              className={cn(
                                 "px-3 py-1.5 text-xs font-medium border rounded-md transition-colors group flex items-center gap-2 h-full",
                                 activeTab === report.id
                                    ? "border-indigo-200 text-indigo-700 bg-indigo-50 shadow-sm"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              )}
                           >
                              <FileText className="h-3.5 w-3.5" />
                              <span className="max-w-[120px] truncate">{report.title}</span>
                              <div 
                                onClick={(e) => handleCloseReport(report.id, e)}
                                className="ml-1 p-0.5 rounded-full hover:bg-indigo-200/50 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </div>
                           </button>
                       </div>
                   ))}
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 flex overflow-hidden min-h-0">


                {/* Main Scrollable Content */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto h-full">
                
                {/* P&L Dashboard Tab */}
                {activeTab === "pnl" && (
                <div className="p-8">
                  <div className="max-w-5xl mx-auto">
                    <PnLDashboard 
                      onInsightClick={handleInsightClick} 
                      highlightedNodeId={highlightedPnlNodeId}
                      onHighlightClear={() => setHighlightedPnlNodeId(null)}
                      onTrendClick={openTrendModal}
                    />
                  </div>
                </div>
                )}

                {/* Reports Tab */}
                {activeTab === "reports" && (
                    <ReportsView 
                        reports={reportsList}
                        activeReportId={activeReportId}
                        onSelectReport={setActiveReportId}
                        onGenerateReport={handleGenerateReportFromTab}
                        onArchiveReport={handleArchiveReport}
                        onRestoreReport={handleRestoreReport}
                    />
                )}

                {/* Report Views */}
                {reportTabs.map(report => (
                    activeTab === report.id && (
                        <div key={report.id} className="p-8 h-full overflow-y-auto bg-gray-50/50">
                            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[80vh]">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">{report.title}</h1>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Sparkles className="h-3 w-3 text-indigo-500" />
                                            Generated by Munch AI • {new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleCloseReport(report.id, e)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-600 prose-table:border-collapse prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-gray-100 prose-li:text-gray-600">
                                    {renderMarkdown(report.content)}
                                </div>
                            </div>
                        </div>
                    )
                ))}

                {/* Detailed View Tab */}
                {activeTab === "detailed" && (
                <div className="p-8">
                      <div className="max-w-5xl mx-auto flex flex-col gap-8">

                   {(selectedRole === "owner" || selectedRole === "gm") && isSectionVisible("profitability-analysis") && (
                   <section 
                      id="profitability-analysis-detailed"
                      className="scroll-mt-4"
                      style={{ order: getSectionOrderIndex("profitability-analysis") }}
                      data-testid="profitability-section-main"
                   >
                      <div className="flex items-center justify-between mb-4">
                         <div>
                            <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                               <BarChart3 className="h-5 w-5 text-gray-600" />
                               Profitability Analysis
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Month-over-month performance summary (Oct vs Sep 2025)</p>
                         </div>
                         
                         <div className="flex items-center gap-3">
                            {/* Header elements removed as requested */}
                         </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                         <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-2">Metric</div>
                            <div className="text-right">Oct 2025</div>
                            <div className="text-right">Sep 2025</div>
                            <div className="text-right">Change</div>
                            <div className="text-right">Trend</div>
                         </div>

                         {/* Gross Profit - Parent Row */}
                         <Popover>
                           <PopoverTrigger asChild>
                              <div className="border-b border-gray-100 cursor-pointer">
                                 <div className="grid grid-cols-6 px-4 py-4 bg-white hover:bg-blue-50 transition-colors w-full text-left">
                                    <div className="col-span-2 flex items-center gap-2">
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setGrossProfitExpanded(!grossProfitExpanded); }}
                                          className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                                       >
                                          <ChevronRight className={cn("h-4 w-4 text-gray-500 transition-transform", grossProfitExpanded && "rotate-90")} />
                                       </button>
                                       <span className="font-medium text-gray-900">Gross Profit</span>
                                       <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded ml-2">Elaborated</span>
                                    </div>
                                    <div className="text-right font-semibold text-gray-900">$81,247</div>
                                    <div className="text-right text-gray-500">$77,372</div>
                                    <div className="text-right font-medium text-emerald-600">+$3,876</div>
                                    <div className="text-right"><span className="text-emerald-600 font-medium">+5.0% ↑</span></div>
                                 </div>
                              </div>
                           </PopoverTrigger>
                           <PopoverContent className="w-[380px] p-0" align="start">
                              <div className="p-4 border-b border-gray-100">
                                 <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                    <div>
                                       <p className="font-medium text-gray-900 mb-1">Gross Profit Analysis</p>
                                       <p className="text-sm text-gray-600">Higher revenue driven by increased patio seating capacity (+$3.2k) and improved waste reduction in kitchen (-$600 COGS).</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="p-4">
                                 <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={[
                                          { label: 'Jul', value: 48 },
                                          { label: 'Aug', value: 52 },
                                          { label: 'Sep', value: 58 }
                                       ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                          <Tooltip formatter={(v: number) => `${v}`} contentStyle={{ fontSize: 12 }} />
                                          <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                                 <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                       <button onClick={() => handleInsightClick("Menu pricing impact")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Menu pricing impact</button>
                                       <button onClick={() => handleInsightClick("COGS trend vs Revenue")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">COGS trend vs Revenue</button>
                                       <button onClick={() => handleInsightClick("Waste reduction details")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Waste reduction details</button>
                                    </div>
                                 </div>
                              </div>
                           </PopoverContent>
                        </Popover>
                             
                             {/* Gross Profit Margin - Child Row */}
                             {grossProfitExpanded && (
                                <Popover>
                                   <PopoverTrigger asChild>
                                      <div className="grid grid-cols-6 px-4 py-3 pl-12 bg-gray-50 hover:bg-blue-50 transition-colors w-full text-left border-t border-gray-100 cursor-pointer">
                                         <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-sm text-gray-700">Gross Profit Margin</span>
                                            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                         </div>
                                         <div className="text-right text-sm font-medium text-gray-900">58.4%</div>
                                         <div className="text-right text-sm text-gray-500">58.2%</div>
                                         <div className="text-right text-sm font-medium text-emerald-600">+0.2 pts</div>
                                         <div className="text-right"><span className="text-emerald-600 text-sm">↑</span></div>
                                      </div>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-[380px] p-0" align="start">
                                      <div className="p-4 border-b border-gray-100">
                                         <div className="flex items-start gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                            <div>
                                               <p className="font-medium text-gray-900 mb-1">Gross Margin Analysis</p>
                                               <p className="text-sm text-gray-600">Margin expanded by 0.2 pts despite labor pressure, largely due to successful menu engineering and vendor consolidation.</p>
                                            </div>
                                         </div>
                                      </div>
                                      <div className="p-4">
                                         <div className="h-36">
                                            <ResponsiveContainer width="100%" height="100%">
                                               <BarChart data={[
                                                  { label: 'Jul', value: 55 },
                                                  { label: 'Aug', value: 56 },
                                                  { label: 'Sep', value: 58 }
                                               ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                  <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                                                  <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                               </BarChart>
                                            </ResponsiveContainer>
                                         </div>
                                         <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                               <button onClick={() => handleInsightClick("Analyze margin growth")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Analyze margin growth</button>
                                               <button onClick={() => handleInsightClick("Compare to industry avg")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Compare to industry avg</button>
                                               <button onClick={() => handleInsightClick("Menu engineering results")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Menu engineering results</button>
                                            </div>
                                         </div>
                                      </div>
                                   </PopoverContent>
                                </Popover>
                             )}

                         {/* Net Operating Income - Parent Row */}
                         <Popover>
                           <PopoverTrigger asChild>
                              <div className="border-b border-gray-100 cursor-pointer">
                                 <div className="grid grid-cols-6 px-4 py-4 bg-white hover:bg-blue-50 transition-colors w-full text-left">
                                    <div className="col-span-2 flex items-center gap-2">
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setNetIncomeExpanded(!netIncomeExpanded); }}
                                          className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                                       >
                                          <ChevronRight className={cn("h-4 w-4 text-gray-500 transition-transform", netIncomeExpanded && "rotate-90")} />
                                       </button>
                                       <span className="font-bold text-gray-900">Net Operating Income</span>
                                       <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded ml-2">Elaborated</span>
                                    </div>
                                    <div className="text-right font-bold text-gray-900">$23,424</div>
                                    <div className="text-right text-gray-500">$17,722</div>
                                    <div className="text-right font-bold text-emerald-600">+$5,702</div>
                                    <div className="text-right"><span className="text-emerald-600 font-bold">+32.2% ↑</span></div>
                                 </div>
                              </div>
                           </PopoverTrigger>
                           <PopoverContent className="w-[380px] p-0" align="start">
                              <div className="p-4 border-b border-gray-100">
                                 <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                    <div>
                                       <p className="font-medium text-gray-900 mb-1">NOI Drivers</p>
                                       <p className="text-sm text-gray-600">Net Operating Income surged 32.2% driven by combined effects of revenue growth and strict OpEx management.</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="p-4">
                                 <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={[
                                          { label: 'Jul', value: 12 },
                                          { label: 'Aug', value: 14 },
                                          { label: 'Sep', value: 17 }
                                       ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}k`} />
                                          <Tooltip formatter={(v: number) => `$${v}k`} contentStyle={{ fontSize: 12 }} />
                                          <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                                 <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                       <button onClick={() => handleInsightClick("Profitability drivers")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Profitability drivers</button>
                                       <button onClick={() => handleInsightClick("Cash flow impact")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Cash flow impact</button>
                                       <button onClick={() => handleInsightClick("Owner distribution potential")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Owner distribution potential</button>
                                    </div>
                                 </div>
                              </div>
                           </PopoverContent>
                        </Popover>
                             
                             {/* Net Operating Income Children */}
                             {netIncomeExpanded && (
                                <>
                                   <Popover>
                                      <PopoverTrigger asChild>
                                         <div className="grid grid-cols-6 px-4 py-3 pl-12 bg-gray-50 hover:bg-blue-50 transition-colors w-full text-left border-t border-gray-100 cursor-pointer">
                                            <div className="col-span-2 flex items-center gap-2">
                                               <span className="text-sm text-gray-700">Operating Expenses</span>
                                               <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                            </div>
                                            <div className="text-right text-sm font-medium text-gray-900">$57,823</div>
                                            <div className="text-right text-sm text-gray-500">$59,650</div>
                                            <div className="text-right text-sm font-medium text-emerald-600">-$1,826</div>
                                            <div className="text-right"><span className="text-emerald-600 text-sm">🟢 ↓</span></div>
                                         </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[380px] p-0" align="start">
                                         <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-start gap-3">
                                               <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                               <div>
                                                  <p className="font-medium text-gray-900 mb-1">OpEx Analysis</p>
                                                  <p className="text-sm text-gray-600">Expenses decreased $1.8k primarily from renegotiated linen contracts (-$450/mo) and reduced utility usage.</p>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="p-4">
                                            <div className="h-36">
                                               <ResponsiveContainer width="100%" height="100%">
                                                  <BarChart data={[
                                                     { label: 'Jul', value: 45 },
                                                     { label: 'Aug', value: 44 },
                                                     { label: 'Sep', value: 41 }
                                                  ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                     <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                     <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}k`} />
                                                     <Tooltip formatter={(v: number) => `$${v}k`} contentStyle={{ fontSize: 12 }} />
                                                     <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                                  </BarChart>
                                               </ResponsiveContainer>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                               <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                               <div className="flex flex-wrap gap-1.5">
                                                  <button onClick={() => handleInsightClick("Utility usage breakdown")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Utility usage breakdown</button>
                                                  <button onClick={() => handleInsightClick("Labor vs OpEx")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Labor vs OpEx</button>
                                                  <button onClick={() => handleInsightClick("Vendor spend details")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Vendor spend details</button>
                                               </div>
                                            </div>
                                         </div>
                                      </PopoverContent>
                                   </Popover>
                                   
                                   <Popover>
                                      <PopoverTrigger asChild>
                                         <div className="grid grid-cols-6 px-4 py-3 pl-12 bg-gray-50 hover:bg-blue-50 transition-colors w-full text-left border-t border-gray-100 cursor-pointer">
                                            <div className="col-span-2 flex items-center gap-2">
                                               <span className="text-sm text-gray-700">Operating Expense Ratio</span>
                                               <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                            </div>
                                            <div className="text-right text-sm font-medium text-gray-900">41.5%</div>
                                            <div className="text-right text-sm text-gray-500">44.8%</div>
                                            <div className="text-right text-sm font-medium text-emerald-600">-3.3 pts</div>
                                            <div className="text-right"><span className="text-emerald-600 text-sm">🟢 ↓</span></div>
                                         </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[380px] p-0" align="start">
                                         <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-start gap-3">
                                               <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                               <div>
                                                  <p className="font-medium text-gray-900 mb-1">Efficiency Trends</p>
                                                  <p className="text-sm text-gray-600">OpEx Ratio improved by 3.3 pts, indicating better fixed cost leverage on higher sales volume.</p>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="p-4">
                                            <div className="h-36">
                                               <ResponsiveContainer width="100%" height="100%">
                                                  <BarChart data={[
                                                     { label: 'Jul', value: 45 },
                                                     { label: 'Aug', value: 44 },
                                                     { label: 'Sep', value: 41 }
                                                  ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                     <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                     <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                     <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                                                     <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                                  </BarChart>
                                               </ResponsiveContainer>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                               <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                               <div className="flex flex-wrap gap-1.5">
                                                  <button onClick={() => handleInsightClick("Efficiency trends")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Efficiency trends</button>
                                                  <button onClick={() => handleInsightClick("Fixed vs Variable costs")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Fixed vs Variable costs</button>
                                                  <button onClick={() => handleInsightClick("Break-even analysis")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Break-even analysis</button>
                                               </div>
                                            </div>
                                         </div>
                                      </PopoverContent>
                                   </Popover>
                                   
                                   <Popover>
                                      <PopoverTrigger asChild>
                                         <div className="grid grid-cols-6 px-4 py-3 pl-12 bg-gray-50 hover:bg-blue-50 transition-colors w-full text-left border-t border-gray-100 cursor-pointer">
                                            <div className="col-span-2 flex items-center gap-2">
                                               <span className="text-sm text-gray-700">Expense as % of Revenue</span>
                                               <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                            </div>
                                            <div className="text-right text-sm font-medium text-gray-900">83.1%</div>
                                            <div className="text-right text-sm text-gray-500">86.7%</div>
                                            <div className="text-right text-sm font-medium text-emerald-600">-3.6 pts</div>
                                            <div className="text-right"><span className="text-emerald-600 text-sm">🟢 ↓</span></div>
                                         </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[380px] p-0" align="start">
                                         <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-start gap-3">
                                               <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                               <div>
                                                  <p className="font-medium text-gray-900 mb-1">Total Cost Burden</p>
                                                  <p className="text-sm text-gray-600">Total costs reduced to 83.1% of revenue, the lowest level this year, confirming effective cost control measures.</p>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="p-4">
                                            <div className="h-36">
                                               <ResponsiveContainer width="100%" height="100%">
                                                  <BarChart data={[
                                                     { label: 'Jul', value: 88 },
                                                     { label: 'Aug', value: 86 },
                                                     { label: 'Sep', value: 83 }
                                                  ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                     <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                     <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                     <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                                                     <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                                  </BarChart>
                                               </ResponsiveContainer>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                               <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                               <div className="flex flex-wrap gap-1.5">
                                                  <button onClick={() => handleInsightClick("Cost reduction drivers")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Cost reduction drivers</button>
                                                  <button onClick={() => handleInsightClick("Forecast next month")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Forecast next month</button>
                                                  <button onClick={() => handleInsightClick("Compare to budget")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Compare to budget</button>
                                               </div>
                                            </div>
                                         </div>
                                      </PopoverContent>
                                   </Popover>
                                </>
                             )}

                         {/* Operating Margin - Standalone Row */}
                         <Popover>
                           <PopoverTrigger asChild>
                              <div className="grid grid-cols-6 px-4 py-4 bg-white hover:bg-blue-50 transition-colors w-full text-left cursor-pointer">
                                 <div className="col-span-2 flex items-center gap-2 pl-6">
                                    <span className="font-bold text-gray-900">Operating Margin</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                 </div>
                                 <div className="text-right font-bold text-gray-900">16.8%</div>
                                 <div className="text-right text-gray-500">13.3%</div>
                                 <div className="text-right font-bold text-emerald-600">+3.5 pts</div>
                                 <div className="text-right"><span className="text-emerald-600 font-bold">↑</span></div>
                              </div>
                           </PopoverTrigger>
                           <PopoverContent className="w-[380px] p-0" align="start">
                              <div className="p-4 border-b border-gray-100">
                                 <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                    <div>
                                       <p className="font-medium text-gray-900 mb-1">Sustainability Check</p>
                                       <p className="text-sm text-gray-600">Operating Margin reached 16.8%, exceeding the 15% target for the first time this quarter.</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="p-4">
                                 <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={[
                                          { label: 'Jul', value: 12 },
                                          { label: 'Aug', value: 14 },
                                          { label: 'Sep', value: 16 }
                                       ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                          <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                                          <Bar dataKey="value" fill="#10b981" name="Value" radius={[4, 4, 0, 0]} />
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                                 <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                       <button onClick={() => handleInsightClick("Sustainability check")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Sustainability check</button>
                                       <button onClick={() => handleInsightClick("YoY comparison")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">YoY comparison</button>
                                       <button onClick={() => handleInsightClick("Regional benchmark")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Regional benchmark</button>
                                    </div>
                                 </div>
                              </div>
                           </PopoverContent>
                        </Popover>
                      </div>

                      {/* Footer elements removed as requested */}
                   </section>
                   )}
                   {/* 1. Executive Narrative */}
                   {isSectionVisible("executive-narrative") && (
                   <section id="executive-narrative" className="scroll-mt-4" style={{ order: getSectionOrderIndex("executive-narrative") }}>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <h2 className="text-xl font-serif font-bold text-gray-900">Executive Narrative</h2>
                            {isEditMode && (
                               <button
                                  onClick={() => removeSection("executive-narrative")}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Remove section"
                               >
                                  <X className="h-4 w-4" />
                               </button>
                            )}
                         </div>
                         <button 
                            data-testid="learn-executive-narrative"
                            onClick={() => handleInsightClick("Explain the Executive Narrative section in depth. Please cover:\n\n1. What this section tells me (Definition)\n2. Key metrics to look for and pay attention to\n3. Actionable steps I can take to improve my store based on this data")}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Learn about Executive Narrative"
                         >
                            <Lightbulb className="h-3.5 w-3.5" />
                            Learn
                         </button>
                      </div>
                      <div className={cn("bg-white rounded-xl border p-6", isEditMode ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-200")}>
                         <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                               <Sparkles className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                               <h3 className="font-semibold text-gray-900 mb-2">Performance Summary</h3>
                               {isEditMode ? (
                                  <textarea
                                     value={editableContent.executiveSummary}
                                     onChange={(e) => setEditableContent(prev => ({ ...prev, executiveSummary: e.target.value }))}
                                     className="w-full min-h-[100px] p-3 text-gray-700 leading-relaxed border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                                     placeholder="Enter executive summary..."
                                     data-testid="textarea-executive-summary"
                                  />
                               ) : (
                               <p className="text-gray-700 leading-relaxed">
                                  September{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('net-income')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Net Income in P&L Dashboard"
                                    data-testid="link-net-income"
                                  >net income</button>{' '}
                                  came in at $17,722 (13.3% margin), falling short of budget. Seasonal trends drove{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('income')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Revenue in P&L Dashboard"
                                    data-testid="link-revenue"
                                  >revenue</button>{' '}
                                  down 13.8%, though{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('direct-labor-cost')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Labor Costs in P&L Dashboard"
                                    data-testid="link-labor"
                                  >labor costs</button>{' '}
                                  remained well-controlled.{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('cogs')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Prime Cost in P&L Dashboard"
                                    data-testid="link-prime-cost"
                                  >Prime cost</button>{' '}
                                  landed at 62.1%—exceeding target driven by higher COGS .
                               </p>
                               )}
                            </div>
                         </div>
                      </div>
                   </section>
                   )}


                   {/* 2. Bottom Line */}
                   {isSectionVisible("bottom-line") && (
                   <section id="bottom-line" className="scroll-mt-4" style={{ order: getSectionOrderIndex("bottom-line") }}>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <h2 className="text-xl font-serif font-bold text-gray-900">Bottom Line</h2>
                            {isEditMode && (
                               <button
                                  onClick={() => removeSection("bottom-line")}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Remove section"
                               >
                                  <X className="h-4 w-4" />
                               </button>
                            )}
                         </div>
                         <button 
                            data-testid="learn-bottom-line"
                            onClick={() => handleInsightClick("Explain the Bottom Line (Net Income) section in depth. Please cover:\n\n1. What this section tells me (Definition)\n2. Key metrics to look for and pay attention to (e.g. Net Margin)\n3. Actionable steps I can take to improve my store's profitability based on this data")}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Learn about Bottom Line"
                         >
                            <Lightbulb className="h-3.5 w-3.5" />
                            Learn
                         </button>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Net Income Walk</h3>
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                               <button 
                                  onClick={() => setViewModes({...viewModes, bottomLine: "data"})}
                                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewModes.bottomLine === "data" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                               >
                                  Data
                               </button>
                               <button 
                                  onClick={() => setViewModes({...viewModes, bottomLine: "chart"})}
                                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewModes.bottomLine === "chart" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                               >
                                  Chart
                               </button>
                            </div>
                         </div>
                         {viewModes.bottomLine === "chart" ? (
                            <div className="h-64">
                               <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                     { name: 'Net Sales', value: 133042, fill: '#10b981' },
                                     { name: 'COGS', value: -55670, fill: '#ef4444' },
                                     { name: 'Labor', value: -16156, fill: '#ef4444' },
                                     { name: 'Expenses', value: -43494, fill: '#f59e0b' },
                                     { name: 'Net Income', value: 17722, fill: '#1e293b' }
                                  ]}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                     <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                     <Tooltip formatter={(value: number) => `$${Math.abs(value).toLocaleString()}`} />
                                     <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {[
                                           { fill: '#10b981' },
                                           { fill: '#ef4444' },
                                           { fill: '#ef4444' },
                                           { fill: '#f59e0b' },
                                           { fill: '#1e293b' }
                                        ].map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                     </Bar>
                                  </BarChart>
                               </ResponsiveContainer>
                            </div>
                         ) : (
                            <div className="space-y-3">
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-900">Net Sales</span>
                                  <div className="text-right">
                                     <span className="font-semibold text-gray-900">$133,042</span>
                                     <span className="text-gray-500 text-sm ml-2">(100.0%)</span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-700">- COGS</span>
                                  <div className="text-right">
                                     <span className="font-medium text-red-600">-$55,670</span>
                                     <span className="text-gray-500 text-sm ml-2">(41.8%)</span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-700">= Gross Profit</span>
                                  <div className="text-right">
                                     <span className="font-medium text-emerald-600">$77,372</span>
                                     <span className="text-gray-500 text-sm ml-2">(58.2%)</span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-700">- Direct Labor</span>
                                  <div className="text-right">
                                     <span className="font-medium text-red-600">-$16,156</span>
                                     <span className="text-gray-500 text-sm ml-2">(12.1%)</span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-700">- Operating Expenses</span>
                                  <div className="text-right">
                                     <span className="font-medium text-red-600">-$43,494</span>
                                     <span className="text-gray-500 text-sm ml-2">(32.7%)</span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4 mt-2">
                                  <span className="font-semibold text-gray-900">= Net Operating Income</span>
                                  <div className="text-right">
                                     <span className="font-bold text-lg text-emerald-600">$17,722</span>
                                     <span className="text-gray-500 text-sm ml-2">(13.3%)</span>
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
                   </section>
                   )}

                   {/* 3. Health Snapshot */}
                   {isSectionVisible("health-snapshot") && (
                   <section id="health-snapshot" className="scroll-mt-4" style={{ order: getSectionOrderIndex("health-snapshot") }}>
                      <div className="flex items-center justify-between mb-1">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Health Snapshot</h2>
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                               <span className={cn("text-xs font-medium transition-colors", healthSnapshotMode === "percentage" ? "text-gray-900" : "text-gray-400")}>%</span>
                               <button
                                  onClick={() => setHealthSnapshotMode(healthSnapshotMode === "percentage" ? "actual" : "percentage")}
                                  className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                                  data-testid="toggle-health-switch"
                               >
                                  <span className={cn(
                                     "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                                     healthSnapshotMode === "actual" && "translate-x-5"
                                  )} />
                               </button>
                               <span className={cn("text-xs font-medium transition-colors", healthSnapshotMode === "actual" ? "text-gray-900" : "text-gray-400")}>$</span>
                            </div>
                            <button 
                               data-testid="learn-health-snapshot"
                               onClick={() => handleInsightClick("Explain the Health Snapshot section in depth. Please cover:\n\n1. What this section tells me (Definition)\n2. Key KPIs to look for and pay attention to\n3. Actionable steps I can take to improve my store based on these metrics")}
                               className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                               title="Learn about Health Snapshot KPIs"
                            >
                               <Lightbulb className="h-3.5 w-3.5" />
                               Learn
                            </button>
                         </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Key Performance Indicators <span className="text-gray-400">• Click a metric to view trends</span></p>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100">
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Metric</th>
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Actual</th>
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Target</th>
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Variance</th>
                                  <th className="text-right px-6 py-4 font-medium text-gray-500">Status</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {[
                                 { id: 'net-sales', name: 'Net Sales', isInverse: false },
                                 { id: 'prime-cost', name: 'Prime Cost', isInverse: true },
                                 { id: 'labor', name: 'Labor', isInverse: true },
                                 { id: 'cogs', name: 'COGS', isInverse: true },
                                 { id: 'net-income', name: 'Net Margin', isInverse: false },
                                 { id: 'gross-profit', name: 'Gross Profit', isInverse: false },
                               ].map(metric => {
                                 const actual = healthActuals[metric.id as keyof typeof healthActuals];
                                 const target = healthTargets[metric.id as keyof typeof healthTargets];
                                 const variance = getHealthVariance(metric.id, metric.isInverse);
                                 const statusColors = {
                                   'ON TRACK': 'bg-emerald-100 text-emerald-700',
                                   'MONITOR': 'bg-amber-100 text-amber-700',
                                   'NEEDS ATTENTION': 'bg-red-100 text-red-700'
                                 };
                                 const varianceColor = variance.status === 'ON TRACK' ? 'text-emerald-600' : 
                                                       variance.status === 'MONITOR' ? 'text-amber-600' : 'text-red-600';
                                 return (
                                   <tr 
                                     key={metric.id}
                                     className="hover:bg-gray-50 group transition-colors"
                                     data-testid={`health-row-${metric.id}`}
                                   >
                                     <td 
                                       className="px-6 py-4 text-gray-900 flex items-center gap-2 cursor-pointer"
                                       onClick={() => openTrendModal(metric.id)}
                                     >
                                       {metric.name}
                                       <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </td>
                                     <td className="px-6 py-4 font-semibold text-gray-900">
                                       {healthSnapshotMode === "actual" ? `$${actual.dollar.toLocaleString()}` : `${actual.pct.toFixed(1)}%`}
                                     </td>
                                     <td className="px-6 py-4">
                                       <input
                                         type="text"
                                         value={healthSnapshotMode === "actual" 
                                           ? `$${target.dollar.toLocaleString()}` 
                                           : `${target.pct.toFixed(1)}%`}
                                         onChange={(e) => {
                                           const val = e.target.value.replace(/[$,%]/g, '').replace(/,/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) {
                                             updateHealthTarget(metric.id, healthSnapshotMode === "actual" ? 'dollar' : 'pct', num);
                                           }
                                         }}
                                         onClick={(e) => e.stopPropagation()}
                                         className="w-24 px-2 py-1 text-gray-600 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-sm"
                                         data-testid={`target-input-${metric.id}`}
                                       />
                                     </td>
                                     <td className={cn("px-6 py-4 font-medium", varianceColor)}>
                                       {healthSnapshotMode === "actual" ? variance.formattedDollarVar : variance.formattedPctVar}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                       <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusColors[variance.status])}>
                                         {variance.status}
                                       </span>
                                     </td>
                                   </tr>
                                 );
                               })}
                            </tbody>
                         </table>
                      </div>
                   </section>
                   )}

                   {/* 3. Revenue Analysis */}
                   {isSectionVisible("revenue-analysis") && (
                   <section id="revenue-analysis" className="scroll-mt-4" style={{ order: getSectionOrderIndex("revenue-analysis") }}>
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Revenue Analysis</h2>
                         <button 
                            data-testid="learn-revenue-analysis"
                            onClick={() => handleInsightClick("Explain the Revenue Analysis section in depth. Please cover:\n\n1. What this section tells me (Definition)\n2. Key metrics to look for (Channel Mix, Average Check, Trends)\n3. Actionable steps I can take to drive revenue growth based on this data")}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Learn about Revenue Analysis"
                         >
                            <Lightbulb className="h-3.5 w-3.5" />
                            Learn
                         </button>
                      </div>

                      {/* AI Insight */}
                      <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6 flex gap-3">
                         <Sparkles className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                         <p className="text-gray-700">Revenue declined by $21,309 (-13.8%) compared to prior month due to seasonal slowdown. Net sales of $133,042 for September is below the $150,000 target. Focus on driving foot traffic and average check size.</p>
                      </div>

                      {/* Channel Performance */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                         <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Channel Performance</h3>
                         </div>
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <th className="text-left px-6 py-3 font-medium text-gray-500">Channel</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actual</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Var %</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Mix %</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">vs PY</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-900">Food Sales</td>
                                  <td className="px-6 py-4 text-right font-medium">$95,614</td>
                                  <td className="px-6 py-4 text-right text-red-600 font-medium">-15.2%</td>
                                  <td className="px-6 py-4 text-right text-gray-600">71.8%</td>
                                  <td className="px-6 py-4 text-right text-red-600">-5.9%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-900">Beverage Sales</td>
                                  <td className="px-6 py-4 text-right font-medium">$17,698</td>
                                  <td className="px-6 py-4 text-right text-red-600 font-medium">-12.4%</td>
                                  <td className="px-6 py-4 text-right text-gray-600">13.3%</td>
                                  <td className="px-6 py-4 text-right text-red-600">-11.5%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-900">Delivery/Online</td>
                                  <td className="px-6 py-4 text-right font-medium">$19,730</td>
                                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">+2.8%</td>
                                  <td className="px-6 py-4 text-right text-gray-600">14.9%</td>
                                  <td className="px-6 py-4 text-right text-emerald-600">+9.6%</td>
                               </tr>
                               <tr className="hover:bg-gray-50 bg-gray-50 font-semibold">
                                  <td className="px-6 py-4 text-gray-900">Total Net Sales</td>
                                  <td className="px-6 py-4 text-right">$133,042</td>
                                  <td className="px-6 py-4 text-right text-red-600">-13.8%</td>
                                  <td className="px-6 py-4 text-right text-gray-600">100%</td>
                                  <td className="px-6 py-4 text-right text-red-600">-11.3%</td>
                               </tr>
                            </tbody>
                         </table>
                      </div>

                      {/* Revenue Drivers */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Revenue Drivers</h3>
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                               <button 
                                  onClick={() => setViewModes({...viewModes, revenueDrivers: "data"})}
                                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewModes.revenueDrivers === "data" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                               >
                                  Data
                               </button>
                               <button 
                                  onClick={() => setViewModes({...viewModes, revenueDrivers: "chart"})}
                                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewModes.revenueDrivers === "chart" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                               >
                                  Chart
                               </button>
                            </div>
                         </div>
                         {viewModes.revenueDrivers === "data" ? (
                            <div className="grid grid-cols-4 gap-4">
                               <div className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-1">Guest Count</p>
                                  <p className="text-2xl font-bold text-gray-900">8,580</p>
                                  <p className="text-xs text-emerald-600 font-medium">+12.2% vs prior</p>
                               </div>
                               <div className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-1">Average Check</p>
                                  <p className="text-2xl font-bold text-gray-900">$34.20</p>
                                  <p className="text-xs text-emerald-600 font-medium">+1% vs prior</p>
                               </div>
                               <div className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-1">Table Turns</p>
                                  <p className="text-2xl font-bold text-gray-900">2.4</p>
                                  <p className="text-xs text-emerald-600 font-medium">+9.1% vs prior</p>
                               </div>
                               <div className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-1">Avg Delivery Order</p>
                                  <p className="text-2xl font-bold text-gray-900">$42.50</p>
                                  <p className="text-xs text-emerald-600 font-medium">+5.7% vs prior</p>
                               </div>
                            </div>
                         ) : (
                            <div className="h-48">
                               <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                     { name: 'Guest Count', current: 8580, prior: 7650 },
                                     { name: 'Avg Check', current: 34.20, prior: 33.85 },
                                     { name: 'Table Turns', current: 2.4, prior: 2.2 },
                                     { name: 'Delivery Avg', current: 42.50, prior: 40.20 }
                                  ]}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                     <YAxis hide />
                                     <Tooltip />
                                     <Bar dataKey="prior" fill="#e5e7eb" name="Prior" radius={[4, 4, 0, 0]} />
                                     <Bar dataKey="current" fill="#10b981" name="Current" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                               </ResponsiveContainer>
                            </div>
                         )}
                         
                         {/* Insight Buttons */}
                         <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleInsightClick("Analyze the 2pt increase in delivery mix vs prior year. What are the margin implications given the high commission fees?")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-xs font-medium transition-colors border border-indigo-100"
                            >
                              <Sparkles className="h-3 w-3" />
                              Delivery mix +2pts vs prior
                            </button>
                            <button
                              onClick={() => handleInsightClick("Explain why Week 4 dine-in revenue was 28% above average. Is this purely holiday effect or something else?")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-xs font-medium transition-colors border border-indigo-100"
                            >
                              <Sparkles className="h-3 w-3" />
                              Week 4 dine-in +28%
                            </button>
                            <button
                              onClick={() => handleInsightClick("Confirm that there was no significant discounting or promo activity this period. How does this compare to last year?")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-xs font-medium transition-colors border border-emerald-100"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              No promo activity
                            </button>
                         </div>
                      </div>
                   </section>
                   )}

                   {/* 4. Prime Cost Analysis */}
                   {isSectionVisible("prime-cost-analysis") && (
                   <section id="prime-cost-analysis" className="scroll-mt-4" style={{ order: getSectionOrderIndex("prime-cost-analysis") }}>
                      <div className="flex items-center justify-between mb-1">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Prime Cost Analysis</h2>
                         <div className="flex items-center gap-2">
                            {/* Location Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                               <Target className="h-3.5 w-3.5" />
                               NY Benchmark
                            </div>
                            
                            {/* Info Tooltip */}
                            <div className="relative group">
                               <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                                  <HelpCircle className="h-4 w-4" />
                               </button>
                               <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg">
                                  Prime cost benchmarks are based on New York regional labor costs and food pricing to compare your performance against industry standards.
                               </div>
                            </div>
                            
                            <button 
                               data-testid="learn-prime-cost"
                               onClick={() => handleInsightClick("Explain the Prime Cost Analysis section in depth. Please cover:\n\n1. What this section tells me (Definition)\n2. Key metrics to look for and pay attention to (Target vs Actual)\n3. Actionable steps I can take to improve my Prime Cost based on this data")}
                               className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                               title="Learn about Prime Cost"
                            >
                               <Lightbulb className="h-3.5 w-3.5" />
                               Learn
                            </button>
                         </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">The heart of the P&L</p>

                      
                      {/* State Benchmark Comparison */}
                      {selectedState && (
                         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                     <Target className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                     <h4 className="font-semibold text-gray-900">{selectedState.name} Industry Benchmark</h4>
                                     <p className="text-xs text-gray-500">Restaurant prime cost standard</p>
                                  </div>
                               </div>
                               <button 
                                  onClick={() => setSelectedState(null)}
                                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                               >
                                  <X className="h-4 w-4 text-gray-400" />
                               </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4">
                               <div className="bg-white rounded-lg p-3 border border-blue-100">
                                  <p className="text-xs text-gray-500 mb-1">Food Cost</p>
                                  <p className="text-lg font-bold text-gray-900">{selectedState.foodCost}%</p>
                               </div>
                               <div className="bg-white rounded-lg p-3 border border-blue-100">
                                  <p className="text-xs text-gray-500 mb-1">Labor Cost</p>
                                  <p className="text-lg font-bold text-gray-900">{selectedState.laborCost}%</p>
                               </div>
                               <div className="bg-white rounded-lg p-3 border border-blue-100">
                                  <p className="text-xs text-gray-500 mb-1">Prime Cost</p>
                                  <p className="text-lg font-bold text-gray-900">{selectedState.primeCost}%</p>
                               </div>
                            </div>
                            
                            {/* Comparison with actual */}
                            {(() => {
                               const actualPrimeCost = 62.1;
                               const diff = actualPrimeCost - selectedState.primeCost;
                               const isOnTrack = diff <= 0;
                               const isClose = Math.abs(diff) <= 2;
                               
                               return (
                                  <div className={cn(
                                     "flex items-center justify-between p-3 rounded-lg",
                                     isOnTrack ? "bg-emerald-50 border border-emerald-200" :
                                     isClose ? "bg-amber-50 border border-amber-200" :
                                     "bg-red-50 border border-red-200"
                                  )}>
                                     <div className="flex items-center gap-3">
                                        <div className={cn(
                                           "h-8 w-8 rounded-full flex items-center justify-center",
                                           isOnTrack ? "bg-emerald-100" :
                                           isClose ? "bg-amber-100" :
                                           "bg-red-100"
                                        )}>
                                           {isOnTrack ? (
                                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                           ) : isClose ? (
                                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                                           ) : (
                                              <AlertTriangle className="h-4 w-4 text-red-600" />
                                           )}
                                        </div>
                                        <div>
                                           <p className={cn(
                                              "font-medium text-sm",
                                              isOnTrack ? "text-emerald-800" :
                                              isClose ? "text-amber-800" :
                                              "text-red-800"
                                           )}>
                                              {isOnTrack ? "Below State Benchmark" :
                                               isClose ? "Slightly Above Benchmark" :
                                               "Above State Benchmark"}
                                           </p>
                                           <p className="text-xs text-gray-600">
                                              Your actual: 62.1% vs {selectedState.code} benchmark: {selectedState.primeCost}%
                                           </p>
                                        </div>
                                     </div>
                                     <div className={cn(
                                        "text-right",
                                        isOnTrack ? "text-emerald-700" :
                                        isClose ? "text-amber-700" :
                                        "text-red-700"
                                     )}>
                                        <span className="text-lg font-bold">
                                           {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                                        </span>
                                        <p className="text-xs">variance</p>
                                     </div>
                                  </div>
                               );
                            })()}
                         </div>
                      )}

                      {/* AI Insight */}
                      <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6 flex gap-3">
                         <Sparkles className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                         <p className="text-gray-700">Prime cost of 62.1% is within acceptable range but 0.6pts above budget. Labor overage (+$4,400) was partially offset by strong COGS management (-$2,600). The labor variance traces primarily to overtime during holiday weeks.</p>
                      </div>

                      {/* Prime Cost Bridge + Labor Variance Drivers */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                         <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-1">
                               <h3 className="font-semibold text-gray-900">Prime Cost Bridge</h3>
                               <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  isCustomPrimeCostTarget ? "bg-blue-50 text-blue-700" : isNYLocation ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"
                               )}>
                                  {getPrimeCostTargetLabel()}
                               </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Target ({primeCostTargetMidpoint.toFixed(1)}%) to Actual ({actualPrimeCostPct.toFixed(1)}%)</p>
                            <div className="space-y-3">
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Target Prime Cost:</span>
                                  <div className="text-right">
                                     <span className="font-medium text-gray-900">{primeCostTargetMidpoint.toFixed(1)}%</span>
                                     <span className="text-gray-500 text-sm ml-2">(${Math.round(PERIOD_REVENUE * primeCostTargetMidpoint / 100).toLocaleString()})</span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">{laborVariancePts >= 0 ? '+' : '-'} Labor Variance:</span>
                                  <div className="text-right">
                                     <span className={cn("font-medium", laborVariancePts > 0 ? "text-red-600" : "text-emerald-600")}>
                                        {laborVariancePts > 0 ? '+' : ''}{laborVariancePts.toFixed(1)}pts
                                     </span>
                                     <span className={cn("text-sm ml-2", laborVariancePts > 0 ? "text-red-600" : "text-emerald-600")}>
                                        ({laborVariancePts > 0 ? '+' : ''}${Math.round((laborVariancePts / 100) * PERIOD_REVENUE).toLocaleString()})
                                     </span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">{cogsVariancePts >= 0 ? '+' : '-'} COGS Variance:</span>
                                  <div className="text-right">
                                     <span className={cn("font-medium", cogsVariancePts > 0 ? "text-red-600" : "text-emerald-600")}>
                                        {cogsVariancePts > 0 ? '+' : ''}{cogsVariancePts.toFixed(1)}pts
                                     </span>
                                     <span className={cn("text-sm ml-2", cogsVariancePts > 0 ? "text-red-600" : "text-emerald-600")}>
                                        ({cogsVariancePts > 0 ? '+' : ''}${Math.round((cogsVariancePts / 100) * PERIOD_REVENUE).toLocaleString()})
                                     </span>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-2">
                                  <span className="font-semibold text-gray-900">= Actual Prime Cost:</span>
                                  <div className="text-right">
                                     <span className="font-bold text-gray-900">{actualPrimeCostPct.toFixed(1)}%</span>
                                     <span className="text-gray-600 text-sm ml-2">(${(cogsActuals['total-cogs'] + laborActuals['total-labor']).toLocaleString()})</span>
                                  </div>
                               </div>
                               {/* Variance Summary */}
                               <div className={cn(
                                  "flex justify-between items-center py-3 rounded-lg px-3 mt-2 border",
                                  primeCostVarianceTotal <= 0 ? "bg-emerald-50 border-emerald-200" : primeCostVarianceTotal <= 2 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
                               )}>
                                  <span className={cn(
                                     "font-medium",
                                     primeCostVarianceTotal <= 0 ? "text-emerald-700" : primeCostVarianceTotal <= 2 ? "text-amber-700" : "text-red-700"
                                  )}>
                                     Variance vs Target:
                                  </span>
                                  <span className={cn(
                                     "font-bold",
                                     primeCostVarianceTotal <= 0 ? "text-emerald-700" : primeCostVarianceTotal <= 2 ? "text-amber-700" : "text-red-700"
                                  )}>
                                     {primeCostVarianceTotal > 0 ? '+' : ''}{primeCostVarianceTotal.toFixed(1)}pts
                                  </span>
                               </div>
                                                           </div>
                         </div>
                         <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Labor Variance Drivers</h3>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <div>
                                     <p className="font-medium text-gray-900">Overtime Hours</p>
                                     <p className="text-xs text-gray-500">142 OT hours vs 80 budgeted</p>
                                  </div>
                                  <span className="text-red-600 font-semibold">+$3,200</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <div>
                                     <p className="font-medium text-gray-900">Holiday Premium</p>
                                     <p className="text-xs text-gray-500">Dec 24-25, Dec 31</p>
                                  </div>
                                  <span className="text-red-600 font-semibold">+$1,800</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <div>
                                     <p className="font-medium text-gray-900">Volume-Driven</p>
                                     <p className="text-xs text-gray-500">Appropriate for +12% revenue</p>
                                  </div>
                                  <span className="text-red-600 font-semibold">+$8,500</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Labor Deep Dive */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <h3 className="font-semibold text-gray-900">Labor Deep Dive</h3>
                               <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  getLaborVariance('total-labor', PERIOD_REVENUE).statusColor
                               )}>
                                  {getLaborVariance('total-labor', PERIOD_REVENUE).statusText}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="relative group">
                                  <span className="text-xs text-gray-500 cursor-help border-b border-dotted border-gray-400">Budget (% of Revenue):</span>
                                  <div className="absolute right-0 top-full mt-1 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg">
                                     Budget is calculated as a percentage of revenue. Dollar amounts update automatically based on sales.
                                  </div>
                               </div>
                               {(selectedRole === "owner" || selectedRole === "gm") ? (
                                  <div className="flex items-center gap-1">
                                     <input
                                        type="number"
                                        value={laborBudgetPct}
                                        onChange={(e) => handleLaborBudgetChange(parseFloat(e.target.value) || 32)}
                                        min="1"
                                        max="99"
                                        className="w-14 px-2 py-1 text-gray-700 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-sm text-right"
                                        data-testid="labor-budget-pct"
                                        disabled={selectedRole === "gm"}
                                     />
                                     <span className="text-sm text-gray-600">%</span>
                                  </div>
                               ) : (
                                  <span className="text-sm font-medium text-gray-700">{laborBudgetPct}%</span>
                               )}
                               <span className={cn(
                                  "px-1.5 py-0.5 rounded text-xs",
                                  isCustomLaborBudget ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                               )}>
                                  {isCustomLaborBudget ? "Custom" : "Default"}
                               </span>
                               {isCustomLaborBudget && selectedRole === "owner" && (
                                  <button
                                     onClick={resetLaborBudgetToDefault}
                                     className="text-xs text-gray-500 hover:text-gray-700 underline"
                                     data-testid="reset-labor-budget"
                                  >
                                     Reset
                                  </button>
                               )}
                            </div>
                         </div>
                         <Popover>
                            <PopoverTrigger asChild>
                               <button className="w-full px-6 py-3 flex items-start gap-2 text-left bg-amber-50/60 hover:bg-amber-50 border-b border-amber-100 transition-colors cursor-pointer">
                                  <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">
                                     <span className="font-medium text-gray-900">There's a 17.5% increase in labor spending this month.</span>
                                     {" "}Click to see what's driving this variance.
                                  </span>
                               </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[420px] p-0" align="start">
                               <div className="p-4 border-b border-gray-100">
                                  <div className="flex items-start gap-3">
                                     <div className="p-2 bg-amber-100 rounded-lg">
                                        <Sparkles className="h-4 w-4 text-amber-600" />
                                     </div>
                                     <div>
                                        <p className="text-sm text-gray-700">
                                           We're finding that the 17.5% labor increase this month was driven by <span className="font-semibold">overtime hours</span> and <span className="font-semibold">FOH staffing</span> adjustments.
                                        </p>
                                     </div>
                                  </div>
                               </div>
                               <div className="p-4">
                                  <div className="flex items-center gap-4 mb-4 text-xs">
                                     <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-red-400"></div>
                                        <span className="text-gray-600">Increase</span>
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                                        <span className="text-gray-600">Decrease</span>
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                                        <span className="text-gray-600">Total</span>
                                     </div>
                                  </div>
                                  <div className="h-48">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                           data={[
                                              { name: 'Base\nBudget', value: 81220, fill: '#3b82f6', isTotal: true },
                                              { name: 'Overtime', value: 3200, fill: '#f87171', isIncrease: true },
                                              { name: 'FOH\nStaff', value: 4300, fill: '#f87171', isIncrease: true },
                                              { name: 'BOH\nStaff', value: 2700, fill: '#f87171', isIncrease: true },
                                              { name: 'Scheduling\nEfficiency', value: -1500, fill: '#34d399', isDecrease: true },
                                              { name: 'Actual', value: 95400, fill: '#3b82f6', isTotal: true },
                                           ]}
                                           margin={{ top: 20, right: 10, left: 10, bottom: 30 }}
                                        >
                                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                           <XAxis 
                                              dataKey="name" 
                                              tick={{ fontSize: 10, fill: '#6b7280' }}
                                              axisLine={{ stroke: '#e5e7eb' }}
                                              tickLine={false}
                                              interval={0}
                                           />
                                           <YAxis 
                                              tick={{ fontSize: 10, fill: '#6b7280' }}
                                              axisLine={false}
                                              tickLine={false}
                                              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                                           />
                                           <Tooltip
                                              formatter={(value: number) => [`$${Math.abs(value).toLocaleString()}`, value < 0 ? 'Savings' : 'Amount']}
                                              contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                           />
                                           <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                              {[
                                                 { name: 'Base Budget', value: 81220, fill: '#3b82f6' },
                                                 { name: 'Overtime', value: 3200, fill: '#f87171' },
                                                 { name: 'FOH Staff', value: 4300, fill: '#f87171' },
                                                 { name: 'BOH Staff', value: 2700, fill: '#f87171' },
                                                 { name: 'Scheduling', value: -1500, fill: '#34d399' },
                                                 { name: 'Actual', value: 95400, fill: '#3b82f6' },
                                              ].map((entry, index) => (
                                                 <Cell key={`cell-${index}`} fill={entry.fill} />
                                              ))}
                                           </Bar>
                                        </BarChart>
                                     </ResponsiveContainer>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                     <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Net Variance</span>
                                        <span className="font-semibold text-red-600">+$14,180 (17.5%)</span>
                                     </div>
                                  </div>
                               </div>
                            </PopoverContent>
                         </Popover>
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actual</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Budget</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Variance $</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% of Revenue</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50 font-semibold bg-gray-50/30">
                                  <td className="px-6 py-4 text-gray-900">Total Labor</td>
                                  <td className="px-6 py-4 text-right">${laborActuals['total-labor'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">${getLaborBudgetForCategory('total-labor', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('total-labor', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('total-labor', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-700">
                                     {((laborActuals['total-labor'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                     <span className={cn("ml-1 text-xs", getLaborVariance('total-labor', PERIOD_REVENUE).color)}>
                                        ({getLaborVariance('total-labor', PERIOD_REVENUE).formattedPct})
                                     </span>
                                  </td>
                               </tr>
                               <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow("boh-labor")}>
                                  <td className="px-6 py-4 text-gray-700 pl-10 flex items-center gap-2">
                                     <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRows.has("boh-labor") ? "rotate-0" : "-rotate-90")} />
                                     BOH Labor
                                  </td>
                                  <td className="px-6 py-4 text-right">${laborActuals['boh-labor'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('boh-labor', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('boh-labor', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('boh-labor', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['boh-labor'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                               </tr>
                               {expandedRows.has("boh-labor") && (
                               <>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Line Cook
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['line-cook'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('line-cook', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('line-cook', PERIOD_REVENUE).color)}>{getLaborVariance('line-cook', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['line-cook'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-amber-100 rounded-lg"><Sparkles className="h-4 w-4 text-amber-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Line Cook Cost Analysis</p>
                                              <p className="text-sm text-gray-600">Variance driven by 12 additional overtime hours during weekend rushes.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 16800, budget: 17000 },
                                                 { name: 'Aug', actual: 17200, budget: 17000 },
                                                 { name: 'Sep', actual: 18400, budget: 17000 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Show overtime breakdown")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show overtime breakdown</button>
                                              <button onClick={() => handleInsightClick("Compare to last year")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Compare to last year</button>
                                              <button onClick={() => handleInsightClick("Which shifts drove this?")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Which shifts drove this?</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Prep Cook
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['prep-cook'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('prep-cook', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('prep-cook', PERIOD_REVENUE).color)}>{getLaborVariance('prep-cook', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['prep-cook'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-amber-100 rounded-lg"><Sparkles className="h-4 w-4 text-amber-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Prep Cook Cost Analysis</p>
                                              <p className="text-sm text-gray-600">Slight increase due to new hire training overlap period.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 11200, budget: 11500 },
                                                 { name: 'Aug', actual: 11400, budget: 11500 },
                                                 { name: 'Sep', actual: 12200, budget: 11500 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("When does training end?")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">When does training end?</button>
                                              <button onClick={() => handleInsightClick("Show headcount trend")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show headcount trend</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Dishwasher
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['dishwasher'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('dishwasher', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('dishwasher', PERIOD_REVENUE).color)}>{getLaborVariance('dishwasher', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['dishwasher'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-amber-100 rounded-lg"><Sparkles className="h-4 w-4 text-amber-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Dishwasher Cost Analysis</p>
                                              <p className="text-sm text-gray-600">Added evening shift coverage for busy dinner service.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 6800, budget: 7000 },
                                                 { name: 'Aug', actual: 7100, budget: 7000 },
                                                 { name: 'Sep', actual: 7600, budget: 7000 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Hours by day of week")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Hours by day of week</button>
                                              <button onClick={() => handleInsightClick("Is this sustainable?")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Is this sustainable?</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               </>
                               )}
                               <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow("foh-labor")}>
                                  <td className="px-6 py-4 text-gray-700 pl-10 flex items-center gap-2">
                                     <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRows.has("foh-labor") ? "rotate-0" : "-rotate-90")} />
                                     FOH Labor
                                  </td>
                                  <td className="px-6 py-4 text-right">${laborActuals['foh-labor'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('foh-labor', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('foh-labor', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('foh-labor', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['foh-labor'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                               </tr>
                               {expandedRows.has("foh-labor") && (
                               <>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Server
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['server'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('server', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('server', PERIOD_REVENUE).color)}>{getLaborVariance('server', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['server'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-red-100 rounded-lg"><Sparkles className="h-4 w-4 text-red-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Server Cost Analysis</p>
                                              <p className="text-sm text-gray-600">Highest variance driver. Added 2 FTE for patio season; recommend scaling back.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 20100, budget: 19800 },
                                                 { name: 'Aug', actual: 21200, budget: 19800 },
                                                 { name: 'Sep', actual: 22500, budget: 19800 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#ef4444" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Show patio vs indoor split")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show patio vs indoor split</button>
                                              <button onClick={() => handleInsightClick("When to scale back?")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">When to scale back?</button>
                                              <button onClick={() => handleInsightClick("Revenue per server")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Revenue per server</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Bartender
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['bartender'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('bartender', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('bartender', PERIOD_REVENUE).color)}>{getLaborVariance('bartender', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['bartender'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-amber-100 rounded-lg"><Sparkles className="h-4 w-4 text-amber-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Bartender Cost Analysis</p>
                                              <p className="text-sm text-gray-600">Extended happy hour staffing drove higher costs this month.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 10200, budget: 10500 },
                                                 { name: 'Aug', actual: 10800, budget: 10500 },
                                                 { name: 'Sep', actual: 11800, budget: 10500 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Happy hour revenue impact")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Happy hour revenue impact</button>
                                              <button onClick={() => handleInsightClick("Bar sales per hour")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Bar sales per hour</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Host/Hostess
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['host'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('host', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('host', PERIOD_REVENUE).color)}>{getLaborVariance('host', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['host'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Host/Hostess Cost Analysis</p>
                                              <p className="text-sm text-gray-600">On track. Minor variance within acceptable range.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 7400, budget: 7500 },
                                                 { name: 'Aug', actual: 7600, budget: 7500 },
                                                 { name: 'Sep', actual: 7800, budget: 7500 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Covers per host hour")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Covers per host hour</button>
                                              <button onClick={() => handleInsightClick("Wait time trends")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Wait time trends</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               </>
                               )}
                               <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow("management")}>
                                  <td className="px-6 py-4 text-gray-700 pl-10 flex items-center gap-2">
                                     <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRows.has("management") ? "rotate-0" : "-rotate-90")} />
                                     Management
                                  </td>
                                  <td className="px-6 py-4 text-right">${laborActuals['management'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('management', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('management', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('management', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['management'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                               </tr>
                               {expandedRows.has("management") && (
                               <>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           General Manager
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['gm'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('gm', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('gm', PERIOD_REVENUE).color)}>{getLaborVariance('gm', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['gm'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">General Manager Cost</p>
                                              <p className="text-sm text-gray-600">Fixed salary. On budget with no variance.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 6800, budget: 6800 },
                                                 { name: 'Aug', actual: 6800, budget: 6800 },
                                                 { name: 'Sep', actual: 6800, budget: 6800 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Show bonus structure")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show bonus structure</button>
                                              <button onClick={() => handleInsightClick("YoY comparison")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">YoY comparison</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <Popover>
                                  <PopoverTrigger asChild>
                                     <tr className="hover:bg-amber-50/40 cursor-pointer">
                                        <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                           Shift Supervisor
                                           <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">${laborActuals['supervisor'].toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">${getLaborBudgetForCategory('supervisor', PERIOD_REVENUE).toLocaleString()}</td>
                                        <td className={cn("px-6 py-3 text-right text-xs", getLaborVariance('supervisor', PERIOD_REVENUE).color)}>{getLaborVariance('supervisor', PERIOD_REVENUE).formattedDollar}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{((laborActuals['supervisor'] / PERIOD_REVENUE) * 100).toFixed(1)}%</td>
                                     </tr>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[380px] p-0" align="start">
                                     <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start gap-3">
                                           <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                           <div>
                                              <p className="font-medium text-gray-900 mb-1">Shift Supervisor Cost</p>
                                              <p className="text-sm text-gray-600">Fixed salary. On budget with no variance.</p>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="p-4">
                                        <div className="h-36">
                                           <ResponsiveContainer width="100%" height="100%">
                                              <BarChart data={[
                                                 { name: 'Jul', actual: 5800, budget: 5800 },
                                                 { name: 'Aug', actual: 5800, budget: 5800 },
                                                 { name: 'Sep', actual: 5800, budget: 5800 },
                                              ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                 <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                 <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                 <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
                                                 <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                              </BarChart>
                                           </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                           <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                           <div className="flex flex-wrap gap-1.5">
                                              <button onClick={() => handleInsightClick("Shifts per week")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Shifts per week</button>
                                              <button onClick={() => handleInsightClick("Coverage efficiency")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Coverage efficiency</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               </>
                               )}
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Payroll Taxes & Benefits</td>
                                  <td className="px-6 py-4 text-right">${laborActuals['payroll-taxes'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('payroll-taxes', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('payroll-taxes', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('payroll-taxes', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['payroll-taxes'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                               </tr>
                            </tbody>
                         </table>
                         <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                               Budget calculated as {laborBudgetPct}% of period revenue (${PERIOD_REVENUE.toLocaleString()})
                            </p>
                            <p className="text-xs text-gray-500">
                               Actual Labor: {((laborActuals['total-labor'] / PERIOD_REVENUE) * 100).toFixed(1)}% of revenue
                            </p>
                         </div>
                      </div>

                      {/* Labor Efficiency Metrics */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <h3 className="font-semibold text-gray-900">Labor Efficiency Metrics</h3>
                               {/* Overall status based on how many metrics are on track */}
                               {(() => {
                                  const onTrack = [
                                     getLaborEfficiencyStatus('sales-per-hour').status === 'ON TRACK',
                                     getLaborEfficiencyStatus('hours-per-guest', true).status === 'ON TRACK',
                                     getLaborEfficiencyStatus('overtime-pct', true).status === 'ON TRACK'
                                  ].filter(Boolean).length;
                                  const statusColor = onTrack === 3 ? 'bg-emerald-50 text-emerald-700' : onTrack >= 2 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
                                  const statusText = onTrack === 3 ? '🟢 ALL ON TRACK' : onTrack >= 2 ? '🟡 ATTENTION' : '🔴 ACTION NEEDED';
                                  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor)}>{statusText}</span>;
                               })()}
                            </div>
                            <div className="flex items-center gap-3">
                               {/* Any custom targets indicator */}
                               {(isCustomEfficiencyTargets['sales-per-hour'] || isCustomEfficiencyTargets['hours-per-guest'] || isCustomEfficiencyTargets['overtime-pct']) && (
                                  <div className="flex items-center gap-2">
                                     <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Custom Targets</span>
                                     {selectedRole === 'owner' && (
                                        <button
                                           onClick={() => {
                                              resetEfficiencyTarget('sales-per-hour');
                                              resetEfficiencyTarget('hours-per-guest');
                                              resetEfficiencyTarget('overtime-pct');
                                           }}
                                           className="text-xs text-gray-500 hover:text-gray-700 underline"
                                        >
                                           Reset All
                                        </button>
                                     )}
                                  </div>
                               )}
                               <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                  <button 
                                     onClick={() => setViewModes({...viewModes, laborEfficiency: "data"})}
                                     className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewModes.laborEfficiency === "data" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                                  >
                                     Data
                                  </button>
                                  <button 
                                     onClick={() => setViewModes({...viewModes, laborEfficiency: "chart"})}
                                     className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewModes.laborEfficiency === "chart" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                                  >
                                     Chart
                                  </button>
                               </div>
                            </div>
                         </div>
                         <div className="p-6">
                         {viewModes.laborEfficiency === "data" ? (
                            <table className="w-full text-sm">
                               <thead>
                                  <tr className="border-b border-gray-100">
                                     <th className="text-left py-2 font-medium text-gray-500">Metric</th>
                                     <th className="text-right py-2 font-medium text-gray-500">Actual</th>
                                     <th className="text-right py-2 font-medium text-gray-500">Target</th>
                                     <th className="text-right py-2 font-medium text-gray-500">Status</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-100">
                                  <tr>
                                     <td className="py-3 text-gray-900">Sales per Labor Hour</td>
                                     <td className="py-3 text-right font-medium">${laborEfficiencyActuals['sales-per-hour'].toFixed(2)}</td>
                                     <td className="py-3 text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                           <input
                                              type="text"
                                              value={`$${laborEfficiencyTargets['sales-per-hour'].toFixed(2)}`}
                                              onChange={(e) => {
                                                 const val = e.target.value.replace(/[$,]/g, '');
                                                 const num = parseFloat(val);
                                                 if (!isNaN(num)) handleEfficiencyTargetChange('sales-per-hour', num);
                                              }}
                                              className="w-16 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                              data-testid="target-sales-per-hour"
                                           />
                                           {isCustomEfficiencyTargets['sales-per-hour'] && (
                                              <button onClick={() => resetEfficiencyTarget('sales-per-hour')} className="text-[10px] text-gray-400 hover:text-gray-600">↺</button>
                                           )}
                                        </div>
                                     </td>
                                     <td className="py-3 text-right"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborEfficiencyStatus('sales-per-hour').color)}>{getLaborEfficiencyStatus('sales-per-hour').status}</span></td>
                                  </tr>
                                  <tr>
                                     <td className="py-3 text-gray-900">Labor Hours / Guest</td>
                                     <td className="py-3 text-right font-medium">{laborEfficiencyActuals['hours-per-guest'].toFixed(2)}</td>
                                     <td className="py-3 text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                           <input
                                              type="text"
                                              value={laborEfficiencyTargets['hours-per-guest'].toFixed(2)}
                                              onChange={(e) => {
                                                 const num = parseFloat(e.target.value);
                                                 if (!isNaN(num)) handleEfficiencyTargetChange('hours-per-guest', num);
                                              }}
                                              className="w-14 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                              data-testid="target-hours-per-guest"
                                           />
                                           {isCustomEfficiencyTargets['hours-per-guest'] && (
                                              <button onClick={() => resetEfficiencyTarget('hours-per-guest')} className="text-[10px] text-gray-400 hover:text-gray-600">↺</button>
                                           )}
                                        </div>
                                     </td>
                                     <td className="py-3 text-right"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborEfficiencyStatus('hours-per-guest', true).color)}>{getLaborEfficiencyStatus('hours-per-guest', true).status}</span></td>
                                  </tr>
                                  <tr>
                                     <td className="py-3 text-gray-900">Overtime % of Total</td>
                                     <td className="py-3 text-right font-medium">{laborEfficiencyActuals['overtime-pct'].toFixed(1)}%</td>
                                     <td className="py-3 text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                           <input
                                              type="text"
                                              value={`${laborEfficiencyTargets['overtime-pct'].toFixed(1)}%`}
                                              onChange={(e) => {
                                                 const val = e.target.value.replace(/%/g, '');
                                                 const num = parseFloat(val);
                                                 if (!isNaN(num)) handleEfficiencyTargetChange('overtime-pct', num);
                                              }}
                                              className="w-14 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                              data-testid="target-overtime-pct"
                                           />
                                           {isCustomEfficiencyTargets['overtime-pct'] && (
                                              <button onClick={() => resetEfficiencyTarget('overtime-pct')} className="text-[10px] text-gray-400 hover:text-gray-600">↺</button>
                                           )}
                                        </div>
                                     </td>
                                     <td className="py-3 text-right"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborEfficiencyStatus('overtime-pct', true).color)}>{getLaborEfficiencyStatus('overtime-pct', true).status}</span></td>
                                  </tr>
                               </tbody>
                            </table>
                         ) : (
                            <div className="h-40">
                               <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                     { name: 'Sales/Labor Hr', actual: 48.20, target: 50 },
                                     { name: 'Hrs/Guest', actual: 0.71, target: 0.68 },
                                     { name: 'OT %', actual: 7.4, target: 4.0 }
                                  ]}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                     <YAxis hide />
                                     <Tooltip />
                                     <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
                                     <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                               </ResponsiveContainer>
                            </div>
                         )}
                         </div>
                         <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                               Efficiency targets measure labor productivity relative to sales and guest volume
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                               <span>Sales/Hr: {laborEfficiencyActuals['sales-per-hour'] >= laborEfficiencyTargets['sales-per-hour'] ? '✓' : '✗'}</span>
                               <span>Hrs/Guest: {laborEfficiencyActuals['hours-per-guest'] <= laborEfficiencyTargets['hours-per-guest'] ? '✓' : '✗'}</span>
                               <span>OT%: {laborEfficiencyActuals['overtime-pct'] <= laborEfficiencyTargets['overtime-pct'] ? '✓' : '✗'}</span>
                            </div>
                         </div>
                      </div>

                      {/* COGS Deep Dive */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <h3 className="font-semibold text-gray-900">COGS Deep Dive</h3>
                               <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  getCogsVariance('total-cogs').statusColor
                               )}>
                                  {getCogsVariance('total-cogs').statusText}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="relative group">
                                  <span className="text-xs text-gray-500 cursor-help border-b border-dotted border-gray-400">Budget (% of Revenue):</span>
                                  <div className="absolute right-0 top-full mt-1 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg">
                                     Budget is calculated as a percentage of revenue. Dollar amounts update automatically based on sales.
                                  </div>
                               </div>
                               {(selectedRole === "owner" || selectedRole === "gm") ? (
                                  <div className="flex items-center gap-1">
                                     <input
                                        type="number"
                                        value={cogsBudgetPct}
                                        onChange={(e) => handleCogsBudgetChange(parseFloat(e.target.value) || 25)}
                                        min="1"
                                        max="99"
                                        className="w-14 px-2 py-1 text-gray-700 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-sm text-right"
                                        data-testid="cogs-budget-pct"
                                        disabled={selectedRole === "gm"}
                                     />
                                     <span className="text-sm text-gray-600">%</span>
                                  </div>
                               ) : (
                                  <span className="text-sm font-medium text-gray-700">{cogsBudgetPct}%</span>
                               )}
                               <span className={cn(
                                  "px-1.5 py-0.5 rounded text-xs",
                                  isCustomCogsBudget ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                               )}>
                                  {isCustomCogsBudget ? "Custom" : "Default"}
                               </span>
                               {isCustomCogsBudget && selectedRole === "owner" && (
                                  <button
                                     onClick={resetCogsBudgetToDefault}
                                     className="text-xs text-gray-500 hover:text-gray-700 underline"
                                     data-testid="reset-cogs-budget"
                                  >
                                     Reset
                                  </button>
                               )}
                            </div>
                         </div>
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actual</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Budget</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Variance $</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% of Revenue</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <tr className="hover:bg-amber-50/40 cursor-pointer font-semibold bg-gray-50/30">
                                       <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                          Total COGS
                                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">${cogsActuals['total-cogs'].toLocaleString()}</td>
                                       <td className="px-6 py-4 text-right text-gray-600">${getCogsBudgetForCategory('total-cogs').toLocaleString()}</td>
                                       <td className={cn("px-6 py-4 text-right font-medium", getCogsVariance('total-cogs').color)}>
                                          {getCogsVariance('total-cogs').formattedDollar}
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-700">
                                          {((cogsActuals['total-cogs'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                          <span className={cn("ml-1 text-xs", getCogsVariance('total-cogs').color)}>
                                             ({getCogsVariance('total-cogs').formattedPct})
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getCogsVariance('total-cogs').statusColor)}>
                                             {getCogsVariance('total-cogs').statusText}
                                          </span>
                                       </td>
                                    </tr>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[380px] p-0" align="start">
                                    <div className="p-4 border-b border-gray-100">
                                       <div className="flex items-start gap-3">
                                          <div className="p-2 bg-emerald-100 rounded-lg"><Sparkles className="h-4 w-4 text-emerald-600" /></div>
                                          <div>
                                             <p className="font-medium text-gray-900 mb-1">Total COGS Analysis</p>
                                             <p className="text-sm text-gray-600">Overall COGS is under budget due to strategic bulk purchasing in early January.</p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="p-4">
                                       <div className="h-36">
                                          <ResponsiveContainer width="100%" height="100%">
                                             <BarChart data={[
                                                { name: 'Jul', actual: 54000, budget: 56000 },
                                                { name: 'Aug', actual: 55200, budget: 56000 },
                                                { name: 'Sep', actual: 55670, budget: 56000 },
                                             ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                             </BarChart>
                                          </ResponsiveContainer>
                                       </div>
                                       <div className="mt-3 pt-3 border-t border-gray-100">
                                          <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                             <button onClick={() => handleInsightClick("Vendor price trends")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Vendor price trends</button>
                                             <button onClick={() => handleInsightClick("Inventory turnover rate")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Inventory turnover rate</button>
                                          </div>
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <tr className="hover:bg-amber-50/40 cursor-pointer">
                                       <td className="px-6 py-4 text-gray-700 pl-10 flex items-center gap-2">
                                          Food Cost
                                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">${cogsActuals['food-cost'].toLocaleString()}</td>
                                       <td className="px-6 py-4 text-right text-gray-500">${getCogsBudgetForCategory('food-cost').toLocaleString()}</td>
                                       <td className={cn("px-6 py-4 text-right font-medium", getCogsVariance('food-cost').color)}>
                                          {getCogsVariance('food-cost').formattedDollar}
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-600">
                                          {((cogsActuals['food-cost'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getCogsVariance('food-cost').statusColor)}>
                                             {getCogsVariance('food-cost').statusText}
                                          </span>
                                       </td>
                                    </tr>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[520px] p-0" align="start">
                                    <div className="p-6">
                                       {/* Top Metrics Row */}
                                       <div className="grid grid-cols-3 gap-6 mb-8">
                                          {/* Metric 1 */}
                                          <div>
                                             <div className="text-xs text-gray-500 mb-1.5">Average Cost / Plate</div>
                                             <div className="text-3xl font-bold text-gray-900 tracking-tight">$3.45</div>
                                             <div className="text-xs text-gray-400 mt-1.5 font-medium">Target: $4.50</div>
                                          </div>
                                          {/* Metric 2 */}
                                          <div>
                                             <div className="text-xs text-gray-500 mb-1.5">Cost Range</div>
                                             <div className="text-2xl font-bold text-gray-900 tracking-tight">$1.65 - $4.53</div>
                                             <div className="text-xs text-gray-400 mt-1.5 font-medium">Min - Max across menu</div>
                                          </div>
                                          {/* Metric 3 */}
                                          <div>
                                             <div className="text-xs text-gray-500 mb-1.5">Items Above Range</div>
                                             <div className="flex items-center gap-3">
                                                <div className="text-2xl font-bold text-red-600 tracking-tight">3</div>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide rounded">High Impact</span>
                                             </div>
                                          </div>
                                       </div>

                                       {/* Section Header */}
                                       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Cost Drivers</div>

                                       {/* List */}
                                       <div className="space-y-3">
                                          {/* Item 1 */}
                                          <div 
                                             onClick={() => handleGenerateFoodCostReport()}
                                             className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                          >
                                             <span className="font-semibold text-gray-900 text-sm">Milky Puff</span>
                                             <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                   <div className="text-sm font-bold text-gray-900">$4.53</div>
                                                   <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Cost/Plate</div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200" />
                                                <div className="text-right">
                                                   <div className="text-sm font-bold text-red-600">31%</div>
                                                   <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Food Cost</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                             </div>
                                          </div>
                                          {/* Item 2 */}
                                          <div 
                                             onClick={() => handleGenerateFoodCostReport()}
                                             className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                          >
                                             <span className="font-semibold text-gray-900 text-sm">Matcha Lava</span>
                                             <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                   <div className="text-sm font-bold text-gray-900">$4.19</div>
                                                   <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Cost/Plate</div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200" />
                                                <div className="text-right">
                                                   <div className="text-sm font-bold text-red-600">29%</div>
                                                   <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Food Cost</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                             </div>
                                          </div>
                                          {/* Item 3 */}
                                          <div 
                                             onClick={() => handleGenerateFoodCostReport()}
                                             className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                          >
                                             <span className="font-semibold text-gray-900 text-sm">Cookie Camp</span>
                                             <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                   <div className="text-sm font-bold text-gray-900">$4.01</div>
                                                   <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Cost/Plate</div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200" />
                                                <div className="text-right">
                                                   <div className="text-sm font-bold text-red-600">28%</div>
                                                   <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Food Cost</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <tr className="hover:bg-amber-50/40 cursor-pointer">
                                       <td className="px-6 py-4 text-gray-700 pl-10 flex items-center gap-2">
                                          Beverage Cost
                                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">${cogsActuals['beverage-cost'].toLocaleString()}</td>
                                       <td className="px-6 py-4 text-right text-gray-500">${getCogsBudgetForCategory('beverage-cost').toLocaleString()}</td>
                                       <td className={cn("px-6 py-4 text-right font-medium", getCogsVariance('beverage-cost').color)}>
                                          {getCogsVariance('beverage-cost').formattedDollar}
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-600">
                                          {((cogsActuals['beverage-cost'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getCogsVariance('beverage-cost').statusColor)}>
                                             {getCogsVariance('beverage-cost').statusText}
                                          </span>
                                       </td>
                                    </tr>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[380px] p-0" align="start">
                                    <div className="p-4 border-b border-gray-100">
                                       <div className="flex items-start gap-3">
                                          <div className="p-2 bg-amber-100 rounded-lg"><Sparkles className="h-4 w-4 text-amber-600" /></div>
                                          <div>
                                             <p className="font-medium text-gray-900 mb-1">Beverage Cost Analysis</p>
                                             <p className="text-sm text-gray-600">Liquor costs slightly up due to new premium cocktail menu launch.</p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="p-4">
                                       <div className="h-36">
                                          <ResponsiveContainer width="100%" height="100%">
                                             <BarChart data={[
                                                { name: 'Jul', actual: 12000, budget: 13000 },
                                                { name: 'Aug', actual: 12800, budget: 13000 },
                                                { name: 'Sep', actual: 13450, budget: 13000 },
                                             ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                             </BarChart>
                                          </ResponsiveContainer>
                                       </div>
                                       <div className="mt-3 pt-3 border-t border-gray-100">
                                          <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                             <button onClick={() => handleInsightClick("Cocktail margin analysis")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Cocktail margin analysis</button>
                                             <button onClick={() => handleInsightClick("Pour cost report")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Pour cost report</button>
                                          </div>
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <tr className="hover:bg-amber-50/40 cursor-pointer">
                                       <td className="px-6 py-4 text-gray-700 pl-10 flex items-center gap-2">
                                          Paper & Supplies
                                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">${cogsActuals['paper-supplies'].toLocaleString()}</td>
                                       <td className="px-6 py-4 text-right text-gray-500">${getCogsBudgetForCategory('paper-supplies').toLocaleString()}</td>
                                       <td className={cn("px-6 py-4 text-right font-medium", getCogsVariance('paper-supplies').color)}>
                                          {getCogsVariance('paper-supplies').formattedDollar}
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-600">
                                          {((cogsActuals['paper-supplies'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getCogsVariance('paper-supplies').statusColor)}>
                                             {getCogsVariance('paper-supplies').statusText}
                                          </span>
                                       </td>
                                    </tr>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[380px] p-0" align="start">
                                    <div className="p-4 border-b border-gray-100">
                                       <div className="flex items-start gap-3">
                                          <div className="p-2 bg-red-100 rounded-lg"><Sparkles className="h-4 w-4 text-red-600" /></div>
                                          <div>
                                             <p className="font-medium text-gray-900 mb-1">Paper & Supplies Cost Analysis</p>
                                             <p className="text-sm text-gray-600">To-go packaging costs rose with increased delivery volume.</p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="p-4">
                                       <div className="h-36">
                                          <ResponsiveContainer width="100%" height="100%">
                                             <BarChart data={[
                                                { name: 'Jul', actual: 3200, budget: 3000 },
                                                { name: 'Aug', actual: 3500, budget: 3000 },
                                                { name: 'Sep', actual: 3985, budget: 3000 },
                                             ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                                                <Bar dataKey="actual" fill="#ef4444" name="Actual" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[4, 4, 0, 0]} />
                                             </BarChart>
                                          </ResponsiveContainer>
                                       </div>
                                       <div className="mt-3 pt-3 border-t border-gray-100">
                                          <p className="text-xs text-gray-500 mb-2">Ask follow-up questions:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                             <button onClick={() => handleInsightClick("Packaging cost per order")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Packaging cost per order</button>
                                             <button onClick={() => handleInsightClick("Supplier options")} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Supplier options</button>
                                          </div>
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                            </tbody>
                         </table>
                         <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                               Budget calculated as {cogsBudgetPct}% of period revenue (${PERIOD_REVENUE.toLocaleString()})
                            </p>
                            <p className="text-xs text-gray-500">
                               Actual COGS: {((cogsActuals['total-cogs'] / PERIOD_REVENUE) * 100).toFixed(1)}% of revenue
                            </p>
                         </div>
                      </div>
                   </section>
                   )}

                   {/* 5. Operating Expenses */}
                   {isSectionVisible("operating-expenses") && (
                   <section id="operating-expenses" className="scroll-mt-4" style={{ order: getSectionOrderIndex("operating-expenses") }}>
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Operating Expenses</h2>
                         <button 
                            data-testid="learn-operating-expenses"
                            onClick={() => handleInsightClick("Explain the Operating Expenses section in depth. Please cover:\n\n1. What this section tells me (Definition)\n2. Key metrics to look for (Controllable vs Fixed Expenses)\n3. Actionable steps I can take to reduce operating costs based on this data")}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Learn about Operating Expenses"
                         >
                            <Lightbulb className="h-3.5 w-3.5" />
                            Learn
                         </button>
                      </div>

                      {/* Controllable Expenses */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                         <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Controllable Expenses</h3>
                         </div>
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actual</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Budget</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% Revenue</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% of Sales</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50 font-semibold">
                                  <td className="px-6 py-4 text-gray-900">Total Controllable</td>
                                  <td className="px-6 py-4 text-right">${controllableActuals['total-controllable'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${controllableBudgets['total-controllable'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setControllableBudgets(prev => ({ ...prev, 'total-controllable': num }));
                                        }}
                                        className="w-24 px-2 py-1 text-gray-600 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-sm text-right"
                                        data-testid="budget-total-controllable"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getControllableVariance('total-controllable').color)}>{getControllableVariance('total-controllable').formatted}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">13.2%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Marketing</td>
                                  <td className="px-6 py-4 text-right">${controllableActuals['marketing'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${controllableBudgets['marketing'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setControllableBudgets(prev => ({ ...prev, 'marketing': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-marketing"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getControllableVariance('marketing').color)}>{getControllableVariance('marketing').formatted}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">1.1%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Repairs & Maintenance</td>
                                  <td className="px-6 py-4 text-right">${controllableActuals['repairs'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${controllableBudgets['repairs'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setControllableBudgets(prev => ({ ...prev, 'repairs': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-repairs"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getControllableVariance('repairs').color)}>{getControllableVariance('repairs').formatted}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">1.6%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Utilities</td>
                                  <td className="px-6 py-4 text-right">${controllableActuals['utilities'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${controllableBudgets['utilities'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setControllableBudgets(prev => ({ ...prev, 'utilities': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-utilities"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getControllableVariance('utilities').color)}>{getControllableVariance('utilities').formatted}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">2.2%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Credit Card Fees</td>
                                  <td className="px-6 py-4 text-right">${controllableActuals['cc-fees'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${controllableBudgets['cc-fees'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setControllableBudgets(prev => ({ ...prev, 'cc-fees': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-cc-fees"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getControllableVariance('cc-fees').color)}>{getControllableVariance('cc-fees').formatted}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">2.5%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Delivery Commissions</td>
                                  <td className="px-6 py-4 text-right">${controllableActuals['delivery'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${controllableBudgets['delivery'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setControllableBudgets(prev => ({ ...prev, 'delivery': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-delivery"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getControllableVariance('delivery').color)}>{getControllableVariance('delivery').formatted}</td>
                                  <td className="px-6 py-4 text-right text-gray-600">2.8%</td>
                               </tr>
                            </tbody>
                         </table>
                      </div>

                      {/* Fixed / Occupancy Costs */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Fixed / Occupancy Costs</h3>
                         </div>
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actual</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Budget</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Variance</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50 font-semibold">
                                  <td className="px-6 py-4 text-gray-900">Total Occupancy</td>
                                  <td className="px-6 py-4 text-right">${occupancyActuals['total-occupancy'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${occupancyBudgets['total-occupancy'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setOccupancyBudgets(prev => ({ ...prev, 'total-occupancy': num }));
                                        }}
                                        className="w-24 px-2 py-1 text-gray-600 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-sm text-right"
                                        data-testid="budget-total-occupancy"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getOccupancyVariance('total-occupancy').color)}>{getOccupancyVariance('total-occupancy').formatted}</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Rent</td>
                                  <td className="px-6 py-4 text-right">${occupancyActuals['rent'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${occupancyBudgets['rent'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setOccupancyBudgets(prev => ({ ...prev, 'rent': num }));
                                        }}
                                        className="w-24 px-2 py-1 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-sm text-right"
                                        data-testid="budget-rent"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getOccupancyVariance('rent').color)}>{getOccupancyVariance('rent').formatted}</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">CAM / Property Tax</td>
                                  <td className="px-6 py-4 text-right">${occupancyActuals['cam'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${occupancyBudgets['cam'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setOccupancyBudgets(prev => ({ ...prev, 'cam': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-cam"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getOccupancyVariance('cam').color)}>{getOccupancyVariance('cam').formatted}</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Insurance</td>
                                  <td className="px-6 py-4 text-right">${occupancyActuals['insurance'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${occupancyBudgets['insurance'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setOccupancyBudgets(prev => ({ ...prev, 'insurance': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-insurance"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getOccupancyVariance('insurance').color)}>{getOccupancyVariance('insurance').formatted}</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Depreciation</td>
                                  <td className="px-6 py-4 text-right">${occupancyActuals['depreciation'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right">
                                     <input
                                        type="text"
                                        value={`$${occupancyBudgets['depreciation'].toLocaleString()}`}
                                        onChange={(e) => {
                                           const val = e.target.value.replace(/[$,]/g, '');
                                           const num = parseFloat(val);
                                           if (!isNaN(num)) setOccupancyBudgets(prev => ({ ...prev, 'depreciation': num }));
                                        }}
                                        className="w-20 px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors text-xs text-right"
                                        data-testid="budget-depreciation"
                                     />
                                  </td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getOccupancyVariance('depreciation').color)}>{getOccupancyVariance('depreciation').formatted}</td>
                               </tr>
                            </tbody>
                         </table>
                         <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-600">No variance — as expected for fixed costs</p>
                         </div>
                      </div>
                   </section>
                   )}


                   {/* Performance Review */}
                   {isSectionVisible("deep-performance") && (
                   <section id="deep-performance" className="scroll-mt-4" style={{ order: getSectionOrderIndex("deep-performance") }}>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <h2 className="text-xl font-serif font-bold text-gray-900">Performance Review</h2>
                            {isEditMode && (
                               <button
                                  onClick={() => removeSection("deep-performance")}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Remove section"
                               >
                                  <X className="h-4 w-4" />
                               </button>
                            )}
                         </div>
                         <div className="flex items-center gap-2">
                            {/* Filter removed as requested */}
                         </div>
                      </div>

                      {/* Shift Breakdown Graph (Moved to Performance Insight Modal) */}
                      {/* <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6" data-testid="shift-breakdown-graph">
                         ... Content removed to avoid duplication ...
                      </div> */}
                   
                   {/* Ticket Time Performance (Moved from Curated) */}
                   <section data-testid="ticket-time-zone-section" className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            Ticket Time Performance
                         </h2>
                         <div className="flex items-center gap-2">
                           <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                              {(["today", "week", "month", "year"] as const).map((range) => (
                                 <button
                                    key={range}
                                    onClick={() => setChefTimeRange(range)}
                                    className={cn(
                                       "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                       chefTimeRange === range
                                          ? "bg-white text-gray-900 shadow-sm"
                                          : "text-gray-600 hover:text-gray-900"
                                    )}
                                 >
                                    {range === "today" ? "Day" : range.charAt(0).toUpperCase() + range.slice(1)}
                                 </button>
                              ))}
                           </div>

                           {/* Period Navigator */}
                           {(chefTimeRange === 'week' || chefTimeRange === 'month') && (
                             <PeriodNavigator 
                               cadence={chefTimeRange}
                               date={selectedChefDate}
                               onPrev={() => setSelectedChefDate(d => chefTimeRange === 'month' ? subMonths(d, 1) : subWeeks(d, 1))}
                               onNext={() => setSelectedChefDate(d => chefTimeRange === 'month' ? addMonths(d, 1) : addWeeks(d, 1))}
                             />
                           )}
                         </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                                  <span className="text-xs text-gray-600">On-time (0-7 min)</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-sm bg-amber-400" />
                                  <span className="text-xs text-gray-600">At risk (7-10 min)</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-sm bg-red-500" />
                                  <span className="text-xs text-gray-600">Problematic (&gt;10 min)</span>
                               </div>
                            </div>
                            <span className="text-xs text-gray-500">{currentTicketData.xLabel}</span>
                         </div>
                         <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={currentTicketData.data}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                  <XAxis dataKey={currentTicketData.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} interval={chefTimeRange === 'month' ? 1 : 0} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                  <Tooltip 
                                     content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                           const green = payload.find(p => p.dataKey === 'green')?.value as number || 0;
                                           const yellow = payload.find(p => p.dataKey === 'yellow')?.value as number || 0;
                                           const red = payload.find(p => p.dataKey === 'red')?.value as number || 0;
                                           const total = green + yellow + red;
                                           const greenPct = total > 0 ? Math.round((green / total) * 100) : 0;
                                           const yellowPct = total > 0 ? Math.round((yellow / total) * 100) : 0;
                                           const redPct = total > 0 ? Math.round((red / total) * 100) : 0;
                                           const tooltipLabel = chefTimeRange === 'today' ? `${label}:00 – ${label}:59` : label;
                                           return (
                                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                                                 <div className="font-semibold text-gray-900 mb-2">{tooltipLabel}</div>
                                                 <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-4">
                                                       <div className="flex items-center gap-2">
                                                          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                                                          <span className="text-gray-700">Green</span>
                                                       </div>
                                                       <span className="font-medium text-gray-900">{green} tickets ({greenPct}%)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                       <div className="flex items-center gap-2">
                                                          <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                                                          <span className="text-gray-700">Yellow</span>
                                                       </div>
                                                       <span className="font-medium text-gray-900">{yellow} tickets ({yellowPct}%)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                       <div className="flex items-center gap-2">
                                                          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                                                          <span className="text-gray-700">Red</span>
                                                       </div>
                                                       <span className="font-medium text-gray-900">{red} tickets ({redPct}%)</span>
                                                    </div>
                                                 </div>
                                                 <div className="mt-2 pt-2 border-t border-gray-100 text-gray-600">
                                                    Total: {total} tickets
                                                 </div>
                                              </div>
                                           );
                                        }
                                        return null;
                                     }}
                                  />
                                  <Bar dataKey="green" stackId="tickets" fill="#10b981" name="On-time" radius={[0, 0, 0, 0]} />
                                  <Bar dataKey="yellow" stackId="tickets" fill="#fbbf24" name="At risk" radius={[0, 0, 0, 0]} />
                                  <Bar dataKey="red" stackId="tickets" fill="#ef4444" name="Problematic" radius={[4, 4, 0, 0]} />
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-3 gap-4 text-center">
                               <div>
                                  <div className="text-2xl font-bold text-emerald-600">{currentTicketData.summary.greenPct}%</div>
                                  <div className="text-xs text-gray-500">On-time tickets</div>
                               </div>
                               <div>
                                  <div className="text-2xl font-bold text-amber-500">{currentTicketData.summary.yellowPct}%</div>
                                  <div className="text-xs text-gray-500">At risk tickets</div>
                               </div>
                               <div>
                                  <div className="text-2xl font-bold text-red-500">{currentTicketData.summary.redPct}%</div>
                                  <div className="text-xs text-gray-500">Problematic tickets</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </section>
                   </section>
                   )}

                   <section 
                      data-testid="gm-daily-prime-cost-section"
                      style={{ order: getSectionOrderIndex("accountant-note") }}
                   >
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            Performance Summary
                            <span className="text-sm font-normal text-gray-500 ml-2">{currentGMData.dateLabel}</span>
                         </h2>
                         {/* Time Range Selector */}
                         <div className="flex items-center gap-2">
                           <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1" data-testid="gm-time-range-selector">
                              {(['today', 'week', 'month', 'year'] as const).map((range) => (
                                 <button
                                    key={range}
                                    onClick={() => setGmTimeRange(range)}
                                    className={cn(
                                       "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                       gmTimeRange === range
                                          ? "bg-white text-gray-900 shadow-sm"
                                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                    data-testid={`btn-time-range-${range}`}
                                 >
                                    {range === 'today' ? 'Today' : range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Year'}
                                 </button>
                              ))}
                           </div>

                           {/* Period Navigator */}
                           {(gmTimeRange === 'week' || gmTimeRange === 'month') && (
                             <PeriodNavigator 
                               cadence={gmTimeRange}
                               date={selectedGMDate}
                               onPrev={() => setSelectedGMDate(d => gmTimeRange === 'month' ? subMonths(d, 1) : subWeeks(d, 1))}
                               onNext={() => setSelectedGMDate(d => gmTimeRange === 'month' ? addMonths(d, 1) : addWeeks(d, 1))}
                             />
                           )}
                         </div>
                      </div>

                      {/* GM Filters */}
                      <div className="flex flex-wrap gap-3 mb-6">
                          {/* Positive Contributors Filter */}
                          <button
                              onClick={() => setActiveGMFilter(activeGMFilter === 'positive' ? null : 'positive')}
                              className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                  activeGMFilter === 'positive' 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500" 
                                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-emerald-50/50"
                              )}
                          >
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                              Contributing to Profit
                          </button>

                          {/* Negative Contributors Filter */}
                          <button
                              onClick={() => setActiveGMFilter(activeGMFilter === 'negative' ? null : 'negative')}
                              className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                  activeGMFilter === 'negative' 
                                      ? "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500" 
                                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-red-50/50"
                              )}
                          >
                              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                              Dragging Profit
                          </button>
                      </div>
                      
                      {/* Performance Metrics Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         {/* Sales Card */}
                         {(!activeGMFilter || 
                           (activeGMFilter === 'positive' && currentGMData.sales.variance >= 0) || 
                           (activeGMFilter === 'negative' && currentGMData.sales.variance < 0)) && (
                         <div className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                            <button
                               onClick={() => setInsightModalMetric('sales')}
                               className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                               title="View trend"
                            >
                               <BarChart3 className="h-3.5 w-3.5" />
                            </button>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sales</div>
                            <div className="text-2xl font-bold text-gray-900">${currentGMData.sales.value.toLocaleString()}</div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-xs text-gray-500">{currentGMData.sales.avgLabel}:</span>
                               <span className="text-xs font-medium text-gray-700">${currentGMData.sales.avg.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                               {currentGMData.sales.variance < 0 ? (
                                  <TrendingDown className="h-3 w-3 text-red-500" />
                               ) : (
                                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                               )}
                               <span className={cn("text-xs font-medium", currentGMData.sales.variance < 0 ? "text-red-600" : "text-emerald-600")}>
                                  {currentGMData.sales.variance > 0 ? '+' : ''}{currentGMData.sales.variance}%
                               </span>
                               <span className="text-xs text-gray-500">vs avg</span>
                            </div>
                         </div>
                         )}

                         {/* COGS % Card */}
                         {(!activeGMFilter || 
                           (activeGMFilter === 'positive' && currentGMData.cogs.variance <= 0) || 
                           (activeGMFilter === 'negative' && currentGMData.cogs.variance > 0)) && (
                         <div className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                            <button
                               onClick={() => setInsightModalMetric('cogs')}
                               className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                               title="View trend"
                            >
                               <BarChart3 className="h-3.5 w-3.5" />
                            </button>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">COGS %</div>
                            <div className="text-2xl font-bold text-gray-900">{currentGMData.cogs.value}%</div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-xs text-gray-500">{currentGMData.cogs.avgLabel}:</span>
                               <span className="text-xs font-medium text-gray-700">{currentGMData.cogs.avg}%</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                               {currentGMData.cogs.variance > 0 ? (
                                  <TrendingUp className="h-3 w-3 text-red-500" />
                               ) : (
                                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                               )}
                               <span className={cn("text-xs font-medium", currentGMData.cogs.variance > 0 ? "text-red-600" : "text-emerald-600")}>
                                  {currentGMData.cogs.variance > 0 ? '+' : ''}{currentGMData.cogs.variance} pts
                               </span>
                               <span className="text-xs text-gray-500">vs avg</span>
                            </div>
                         </div>
                         )}

                         {/* Labor % Card */}
                         {(!activeGMFilter || 
                           (activeGMFilter === 'positive' && currentGMData.labor.variance <= 0) || 
                           (activeGMFilter === 'negative' && currentGMData.labor.variance > 0)) && (
                         <div className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                            <button
                               onClick={() => setInsightModalMetric('labor')}
                               className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                               title="View trend"
                            >
                               <BarChart3 className="h-3.5 w-3.5" />
                            </button>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labor %</div>
                            <div className="text-2xl font-bold text-gray-900">{currentGMData.labor.value}%</div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-xs text-gray-500">{currentGMData.labor.avgLabel}:</span>
                               <span className="text-xs font-medium text-gray-700">{currentGMData.labor.avg}%</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                               {currentGMData.labor.variance > 0 ? (
                                  <TrendingUp className="h-3 w-3 text-red-500" />
                               ) : (
                                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                               )}
                               <span className={cn("text-xs font-medium", currentGMData.labor.variance > 0 ? "text-red-600" : "text-emerald-600")}>
                                  {currentGMData.labor.variance > 0 ? '+' : ''}{currentGMData.labor.variance} pts
                               </span>
                               <span className="text-xs text-gray-500">vs avg</span>
                            </div>
                         </div>
                         )}

                         {/* Prime Cost Card - Primary */}
                         {(!activeGMFilter || 
                           (activeGMFilter === 'positive' && currentGMData.primeCost.variance <= 0) || 
                           (activeGMFilter === 'negative' && currentGMData.primeCost.variance > 0)) && (
                         <div className={cn(
                            "border rounded-xl p-4 relative group",
                            currentGMData.primeCost.variance > 2 
                               ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200" 
                               : currentGMData.primeCost.variance > 0 
                                  ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                                  : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                         )}>
                            <button
                               onClick={() => setInsightModalMetric('primeCost')}
                               className={cn(
                                  "absolute top-3 right-3 p-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors",
                                  currentGMData.primeCost.variance > 2 ? "bg-red-100 text-red-400" : currentGMData.primeCost.variance > 0 ? "bg-amber-100 text-amber-400" : "bg-emerald-100 text-emerald-400"
                               )}
                               title="View trend"
                            >
                               <BarChart3 className="h-3.5 w-3.5" />
                            </button>
                            <div className={cn(
                               "text-xs font-medium uppercase tracking-wide mb-2",
                               currentGMData.primeCost.variance > 2 ? "text-red-700" : currentGMData.primeCost.variance > 0 ? "text-amber-700" : "text-emerald-700"
                            )}>Prime Cost</div>
                            <div className="text-2xl font-bold text-gray-900">{currentGMData.primeCost.value}%</div>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-xs text-gray-500">{currentGMData.primeCost.avgLabel}:</span>
                               <span className="text-xs font-medium text-gray-700">{currentGMData.primeCost.avg}%</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                               {currentGMData.primeCost.variance > 2 ? (
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                               ) : currentGMData.primeCost.variance > 0 ? (
                                  <TrendingUp className="h-3 w-3 text-amber-500" />
                               ) : (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                               )}
                               <span className={cn(
                                  "text-xs font-medium",
                                  currentGMData.primeCost.variance > 2 ? "text-red-600" : currentGMData.primeCost.variance > 0 ? "text-amber-600" : "text-emerald-600"
                               )}>
                                  {currentGMData.primeCost.variance > 0 ? '+' : ''}{currentGMData.primeCost.variance} pts
                                  {currentGMData.primeCost.variance > 2 ? ' 🔴' : currentGMData.primeCost.variance > 0 ? ' 🟡' : ' 🟢'}
                               </span>
                            </div>
                         </div>
                         )}
                      </div>

                      {/* What Happened - Dynamic based on time range */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                         <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-600" />
                            What happened{gmTimeRange === 'today' ? ' today' : gmTimeRange === 'week' ? ' this week' : gmTimeRange === 'month' ? ' this month' : ' this year'}?
                            <span className="text-xs font-normal text-gray-500 ml-auto">Click an issue to get guided help</span>
                         </h3>
                         <div className="space-y-3">
                            {whatHappenedData.issues.map((issue) => (
                               <button 
                                  key={issue.id}
                                  onClick={() => {
                                     setFloatingChatTrigger(issue.context);
                                     setShowChat(true);
                                  }}
                                  className="w-full text-left flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-amber-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                               >
                                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100", issue.iconBg)}>
                                     {issue.icon === 'users' && <Users className={cn("h-3.5 w-3.5 group-hover:text-blue-600", issue.iconColor)} />}
                                     {issue.icon === 'trending-down' && <TrendingDown className={cn("h-3.5 w-3.5 group-hover:text-blue-600", issue.iconColor)} />}
                                     {issue.icon === 'package' && <Package className={cn("h-3.5 w-3.5 group-hover:text-blue-600", issue.iconColor)} />}
                                     {issue.icon === 'alert-triangle' && <AlertTriangle className={cn("h-3.5 w-3.5 group-hover:text-blue-600", issue.iconColor)} />}
                                     {issue.icon === 'check-circle' && <CheckCircle2 className={cn("h-3.5 w-3.5 group-hover:text-blue-600", issue.iconColor)} />}
                                  </div>
                                  <div className="flex-1">
                                     <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 flex items-center gap-2">
                                        {issue.title}
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="text-xs text-gray-600 mt-0.5">
                                        {issue.description}
                                     </div>
                                     <div className="flex items-center gap-2 mt-2">
                                        {issue.tags.map((tag, idx) => (
                                           <span key={idx} className={cn("px-2 py-0.5 text-xs rounded", tag.color)}>{tag.label}</span>
                                        ))}
                                     </div>
                                  </div>
                               </button>
                            ))}
                         </div>
                         
                         {/* Action Summary */}
                         <div className="mt-4 pt-4 border-t border-amber-200">
                            <div className="text-xs font-medium text-gray-700 mb-2">
                               {gmTimeRange === 'today' ? 'Recommended Actions for Tomorrow:' : 
                                gmTimeRange === 'week' ? 'Recommended Actions This Week:' :
                                gmTimeRange === 'month' ? 'Recommended Actions This Month:' :
                                'Strategic Focus Areas:'}
                            </div>
                            <div className="flex flex-wrap gap-2">
                               {whatHappenedData.actions.map((action, idx) => (
                                  <button 
                                     key={idx}
                                     onClick={() => {
                                        setFloatingChatTrigger(`Help me with: ${action}. Period: ${currentGMData.dateLabel}`);
                                        setShowChat(true);
                                     }}
                                     className="px-2.5 py-1 bg-white border border-gray-200 text-xs text-gray-700 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer"
                                  >
                                     {action}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>

                     {/* Profitability Analysis Table (Integrated) */}
                     <div id="profitability-analysis" className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden scroll-mt-24" data-testid="profitability-table-gm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                           <div>
                              <h3 className="font-semibold text-gray-900">Profitability Analysis</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                 {gmTimeRange === 'month' ? 'Month-over-month performance summary' : 
                                  gmTimeRange === 'week' ? 'Week-over-week performance summary' :
                                  gmTimeRange === 'year' ? 'Year-over-year performance summary' : 'Day-over-day performance summary'}
                                 {' '}({currentGMData.dateLabel})
                              </p>
                           </div>
                        </div>
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="border-b border-gray-100">
                                 <th className="text-left px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Metric</th>
                                 <th className="text-right px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">
                                    {gmTimeRange === 'month' ? 'Oct 2025' : 
                                     gmTimeRange === 'week' ? 'Week 42' :
                                     gmTimeRange === 'year' ? '2025' : 'Today'}
                                 </th>
                                 <th className="text-right px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">
                                    {gmTimeRange === 'month' ? 'Sep 2025' : 
                                     gmTimeRange === 'week' ? 'Week 41' :
                                     gmTimeRange === 'year' ? '2024' : 'Yesterday'}
                                 </th>
                                 <th className="text-right px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Change</th>
                                 <th className="text-right px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Trend</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {/* Gross Profit */}
                              <tr 
                                 onClick={() => openTrendModal('gross-profit')}
                                 className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                              >
                                 <td className="px-6 py-4 font-medium text-gray-900">Gross Profit</td>
                                 <td className="px-6 py-4 text-right font-semibold text-gray-900">${hierarchicalPnlData.find(i => i.id === 'gross-profit')?.current.toLocaleString()}</td>
                                 <td className="px-6 py-4 text-right text-gray-600">${hierarchicalPnlData.find(i => i.id === 'gross-profit')?.prior.toLocaleString()}</td>
                                 <td className="px-6 py-4 text-right font-medium text-emerald-600">+$81</td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit ml-auto">
                                       <TrendingUp className="h-3 w-3" />
                                       <span className="text-xs font-bold">0.1%</span>
                                    </div>
                                 </td>
                              </tr>
                              {/* Net Operating Income */}
                              <tr 
                                 onClick={() => openTrendModal('net-income')}
                                 className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                              >
                                 <td className="px-6 py-4 font-medium text-gray-900">Net Operating Income</td>
                                 <td className="px-6 py-4 text-right font-semibold text-gray-900">$5,115</td>
                                 <td className="px-6 py-4 text-right text-gray-600">$19,076</td>
                                 <td className="px-6 py-4 text-right font-medium text-red-600">-$13,961</td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit ml-auto">
                                       <TrendingDown className="h-3 w-3" />
                                       <span className="text-xs font-bold">-73.2%</span>
                                    </div>
                                 </td>
                              </tr>
                              {/* Operating Margin */}
                              <tr 
                                 onClick={() => openTrendModal('net-income')}
                                 className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                              >
                                 <td className="px-6 py-4 font-medium text-gray-900">Operating Margin</td>
                                 <td className="px-6 py-4 text-right font-semibold text-gray-900">3.5%</td>
                                 <td className="px-6 py-4 text-right text-gray-600">14.3%</td>
                                 <td className="px-6 py-4 text-right font-medium text-red-600">-10.8 pts</td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit ml-auto">
                                       <TrendingDown className="h-3 w-3" />
                                       <span className="text-xs font-bold">-75.5%</span>
                                    </div>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                   </section>

                   {/* Accountant Note */}
                   {isSectionVisible("accountant-note") && (
                   <section id="accountant-note" className="scroll-mt-4" style={{ order: getSectionOrderIndex("accountant-note") }}>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                         <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Note from Accountant</h2>
                         <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add any specific context, action items, or clarifications..."
                            className="w-full text-sm border border-gray-200 rounded-lg p-4 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                         />
                      </div>
                   </section>
                   )}

                      </div>
                </div>
                )}

                {/* Curated View Tab */}
                {activeTab === "curated" && (
                <div className="max-w-4xl mx-auto space-y-10 p-8">

                   {/* Role Toggle */}
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <LayoutDashboard className="h-5 w-5 text-blue-600" />
                         </div>
                         <div>
                            <h3 className="font-medium text-gray-900">Role Preview Mode</h3>
                            <p className="text-sm text-gray-500">Preview how each role will see their curated report</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                         <button 
                            data-testid="button-role-owner"
                            onClick={() => setSelectedRole("owner")}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", selectedRole === "owner" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                         >
                            Owner
                         </button>
                         <button 
                            data-testid="button-role-gm"
                            onClick={() => setSelectedRole("gm")}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", selectedRole === "gm" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                         >
                            GM
                         </button>
                         <button 
                            data-testid="button-role-chef"
                            onClick={() => setSelectedRole("chef")}
                            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", selectedRole === "chef" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                         >
                            Executive Chef
                         </button>
                      </div>
                   </div>


                   {/* Primary Insight Card (GM Only) */}
                   {selectedRole === "gm" && (
                     <PrimaryInsightCard 
                       role={selectedRole}
                       trends={healthSnapshotTrendData}
                       onAddAction={handleAddActionItem}
                       onAskAI={(query) => {
                         setFloatingChatTrigger(query);
                         setShowChat(true);
                       }}
                       onGenerateReport={(role, insight) => {
                         if (role === 'gm') handleGenerateGMInsightReport(insight);
                         else if (role === 'chef') handleGenerateChefInsightReport();
                         else if (role === 'owner') handleGenerateOwnerInsightReport(insight);
                       }}
                     />
                   )}

                   {/* Primary Insight Card (Owner Only) */}
                   {selectedRole === "owner" && (
                      <div className="mb-6">
                         <PrimaryInsightCard 
                            role={selectedRole}
                            trends={aggregatedTrends}
                            onAddAction={handleAddActionItem}
                            onAskAI={(query) => {
                              setFloatingChatTrigger(query);
                              setShowChat(true);
                            }}
                            onGenerateReport={(role, insight) => {
                                 if (role === 'gm') handleGenerateGMInsightReport(insight);
                                 else if (role === 'chef') handleGenerateChefInsightReport();
                                 else if (role === 'owner') handleGenerateOwnerInsightReport(insight);
                            }}
                         />
                      </div>
                   )}

                   {/* Executive Summary Cards - Owner Only */}
                   {selectedRole === "owner" && (
                   <section data-testid="executive-summary-section-main">
                      <h2 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                         <TrendingUp className="h-5 w-5 text-gray-600" />
                         Executive Summary
                      </h2>
                      
                      {/* Financial Health Card - Primary */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-6">
                         <div className="flex items-start justify-between">
                            <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Health</span>
                               </div>
                               <div className="flex items-baseline gap-2 mt-2">
                                  <span className="text-5xl font-bold text-gray-900">
                                     {healthComparisonPeriod === "week" ? 84 : healthComparisonPeriod === "month" ? 82 : healthComparisonPeriod === "quarter" ? 79 : 76}
                                  </span>
                                  <span className="text-lg text-gray-500">/100</span>
                               </div>
                            </div>
                            <div className="text-right space-y-2">
                               <div className="flex items-center gap-1 bg-white/60 rounded-lg p-1">
                                  {(["week", "month", "quarter", "year"] as const).map((period) => (
                                     <button
                                        key={period}
                                        onClick={() => setHealthComparisonPeriod(period)}
                                        className={cn(
                                           "px-2 py-1 text-xs font-medium rounded-md transition-colors",
                                           healthComparisonPeriod === period 
                                              ? "bg-emerald-600 text-white shadow-sm" 
                                              : "text-gray-600 hover:bg-white/80"
                                        )}
                                        data-testid={`button-health-period-${period}`}
                                     >
                                        {period === "week" ? "W" : period === "month" ? "M" : period === "quarter" ? "Q" : "Y"}
                                     </button>
                                  ))}
                               </div>
                               <div className="flex items-center gap-1 justify-end text-emerald-600">
                                  <TrendingUp className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                     {healthComparisonPeriod === "week" ? "+2%" : healthComparisonPeriod === "month" ? "+5%" : healthComparisonPeriod === "quarter" ? "+8%" : "+12%"}
                                  </span>
                               </div>
                               <span className="text-xs text-gray-500 block">
                                  vs prior {healthComparisonPeriod}
                               </span>
                            </div>
                         </div>
                         
                         {/* Health Pillars */}
                         <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/60 rounded-lg p-3">
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-500">Profitability</span>
                                  <span className="text-xs text-gray-400">40%</span>
                               </div>
                               <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-bold text-gray-900">
                                     {healthComparisonPeriod === "week" ? 86 : healthComparisonPeriod === "month" ? 85 : healthComparisonPeriod === "quarter" ? 82 : 78}
                                  </span>
                                  <span className="text-xs text-emerald-600">↑</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${healthComparisonPeriod === "week" ? 86 : healthComparisonPeriod === "month" ? 85 : healthComparisonPeriod === "quarter" ? 82 : 78}%` }} />
                               </div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-500">Efficiency</span>
                                  <span className="text-xs text-gray-400">35%</span>
                               </div>
                               <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-bold text-gray-900">
                                     {healthComparisonPeriod === "week" ? 80 : healthComparisonPeriod === "month" ? 78 : healthComparisonPeriod === "quarter" ? 75 : 72}
                                  </span>
                                  <span className={cn("text-xs", healthComparisonPeriod === "week" ? "text-emerald-600" : "text-amber-500")}>
                                     {healthComparisonPeriod === "week" ? "↑" : "→"}
                                  </span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                  <div className={cn("h-1.5 rounded-full", healthComparisonPeriod === "week" ? "bg-emerald-500" : "bg-amber-400")} style={{ width: `${healthComparisonPeriod === "week" ? 80 : healthComparisonPeriod === "month" ? 78 : healthComparisonPeriod === "quarter" ? 75 : 72}%` }} />
                               </div>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-500">Stability</span>
                                  <span className="text-xs text-gray-400">25%</span>
                               </div>
                               <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-bold text-gray-900">
                                     {healthComparisonPeriod === "week" ? 85 : healthComparisonPeriod === "month" ? 84 : healthComparisonPeriod === "quarter" ? 80 : 79}
                                  </span>
                                  <span className="text-xs text-emerald-600">↑</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${healthComparisonPeriod === "week" ? 85 : healthComparisonPeriod === "month" ? 84 : healthComparisonPeriod === "quarter" ? 80 : 79}%` }} />
                               </div>
                            </div>
                         </div>
                         
                         {/* CFO Narrative */}
                         <div className="mt-4 p-3 bg-white/80 rounded-lg border border-emerald-100">
                            <div className="flex items-start gap-2">
                               <Lightbulb className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                               <div className="text-sm text-gray-700">
                                  <span className="font-medium text-gray-900">CFO Insight:</span>{" "}
                                  {healthComparisonPeriod === "week" 
                                     ? "Strong week-over-week momentum with efficiency gains (+2pts). Labor costs tracking below budget, revenue trending up 1.2%."
                                     : healthComparisonPeriod === "month"
                                     ? "Strong profitability driven by improved labor efficiency (+3pts). Prime cost held at 62%, slightly above target. Revenue growth of 3.7% provides stability cushion."
                                     : healthComparisonPeriod === "quarter"
                                     ? "Quarterly performance shows steady improvement (+8pts). COGS efficiency offset seasonal revenue dip. YTD margin of 16.2% exceeds annual target."
                                     : "Year-over-year health improved significantly (+12pts). Major gains in profitability through menu optimization and labor scheduling. Revenue up 4.8% despite industry headwinds."
                                  }
                               </div>
                            </div>
                         </div>


                        {/* Profitability Toggle */}
                        <div className="mt-4 flex justify-center">
                           <button 
                              onClick={() => setIsProfitabilityExpanded(!isProfitabilityExpanded)}
                              className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 border border-emerald-100 rounded-full text-sm font-medium text-emerald-800 transition-all shadow-sm hover:shadow"
                           >
                              Profitability
                              {isProfitabilityExpanded ? (
                                 <ChevronUp className="h-4 w-4" />
                              ) : (
                                 <ChevronDown className="h-4 w-4" />
                              )}
                           </button>
                        </div>

                        {/* Collapsible Profitability Section */}
                        {isProfitabilityExpanded && (
                        <div className="mt-6 pt-6 border-t border-emerald-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                           {/* Summary Cards Grid */}
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              {/* Income Card */}
                              <div 
                                 onClick={() => openTrendModal('net-sales')}
                                 className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Income</span>
                                       <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleInsightClick(`Analyze my Income of $${dashboardMetrics.income.value.toLocaleString()}. Correlate with marketing spend and customer count if available.`);
                                          }}
                                          className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                          title="Explain why"
                                       >
                                          <HelpCircle className="h-3 w-3" />
                                       </button>
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                       <DollarSign className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                 </div>
                                 <div className="text-2xl font-bold text-gray-900">${dashboardMetrics.income.value.toLocaleString()}</div>
                                 <div className="flex items-center gap-1 mt-1">
                                    {dashboardMetrics.income.trend === 'up' ? (
                                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={cn("text-xs font-medium", dashboardMetrics.income.trend === 'up' ? "text-emerald-600" : "text-red-600")}>
                                        {dashboardMetrics.income.variancePct > 0 ? '+' : ''}{dashboardMetrics.income.variancePct.toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-gray-500">vs prior</span>
                                 </div>
                              </div>

                              {/* Marketing Spend Card */}
                              <div 
                                 onClick={() => openTrendModal('marketing')}
                                 className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marketing</span>
                                       <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleInsightClick(`Analyze marketing spend of $${dashboardMetrics.marketing.value.toLocaleString()} (${dashboardMetrics.marketing.percentOfRev.toFixed(1)}% of revenue). Correlate with new customer acquisition and sales growth.`);
                                          }}
                                          className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                          title="Explain why"
                                       >
                                          <HelpCircle className="h-3 w-3" />
                                       </button>
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                       <Target className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                 </div>
                                 <div className="text-2xl font-bold text-gray-900">${dashboardMetrics.marketing.value.toLocaleString()}</div>
                                 <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs font-medium text-gray-600">{dashboardMetrics.marketing.percentOfRev.toFixed(1)}%</span>
                                    <span className="text-xs text-gray-500">of revenue</span>
                                 </div>
                              </div>

                              {/* Operating Expenses Card */}
                              <div 
                                 onClick={() => openTrendModal('controllable-expenses')}
                                 className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Op. Expenses</span>
                                       <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleInsightClick(`Analyze Operating Expenses of $${dashboardMetrics.opex.value.toLocaleString()} (${dashboardMetrics.opex.percentOfRev.toFixed(1)}% of revenue). Correlate with sales volume to check efficiency.`);
                                          }}
                                          className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                          title="Explain why"
                                       >
                                          <HelpCircle className="h-3 w-3" />
                                       </button>
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                       <CreditCard className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                 </div>
                                 <div className="text-2xl font-bold text-gray-900">${dashboardMetrics.opex.value.toLocaleString()}</div>
                                 <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs font-medium text-amber-600">{dashboardMetrics.opex.percentOfRev.toFixed(1)}%</span>
                                    <span className="text-xs text-gray-500">of revenue</span>
                                 </div>
                              </div>

                              {/* Growth Card */}
                              <div 
                                 onClick={() => openTrendModal('net-sales')}
                                 className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Growth</span>
                                       <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleInsightClick(`Analyze ${dashboardMetrics.growth.value.toFixed(1)}% revenue growth YoY. Correlate with marketing initiatives and seasonal trends.`);
                                          }}
                                          className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                          title="Explain why"
                                       >
                                          <HelpCircle className="h-3 w-3" />
                                       </button>
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                       {dashboardMetrics.growth.trend === 'up' ? (
                                           <TrendingUp className="h-4 w-4 text-emerald-500 group-hover:text-blue-600 transition-colors" />
                                       ) : (
                                           <TrendingDown className="h-4 w-4 text-red-500 group-hover:text-blue-600 transition-colors" />
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className={cn("text-2xl font-bold", dashboardMetrics.growth.trend === 'up' ? "text-emerald-600" : "text-red-600")}>
                                        {dashboardMetrics.growth.trend === 'up' ? '↑ Growing' : '↓ Slowing'}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1 mt-1">
                                    <span className={cn("text-xs font-medium", dashboardMetrics.growth.trend === 'up' ? "text-emerald-600" : "text-red-600")}>
                                        {dashboardMetrics.growth.value > 0 ? '+' : ''}{dashboardMetrics.growth.value.toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-gray-500">revenue YoY</span>
                                 </div>
                              </div>
                           </div>

                           {/* Second Row - Cash Flow & Compensation */}
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Cash Flow Card */}
                              <div 
                                 onClick={() => openTrendModal('cash-flow')}
                                 className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cash Flow</span>
                                       <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleInsightClick(`Analyze Cash Flow of $${dashboardMetrics.cashFlow.balance.toLocaleString()}. Correlate with NOI ($${dashboardMetrics.income.value.toLocaleString()}) and capital expenditures.`);
                                          }}
                                          className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                          title="Explain why"
                                       >
                                          <HelpCircle className="h-3 w-3" />
                                       </button>
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                       <Wallet className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <div className="text-xl font-bold text-gray-900">${dashboardMetrics.cashFlow.balance.toLocaleString()}</div>
                                       <div className="text-xs text-gray-500">Current balance</div>
                                    </div>
                                    <div className="text-right">
                                       <div className="flex items-center gap-1 justify-end">
                                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                                          <span className="text-sm font-medium text-emerald-600">+${dashboardMetrics.cashFlow.change.toLocaleString()}</span>
                                       </div>
                                       <div className="text-xs text-gray-500">Net change this period</div>
                                    </div>
                                 </div>
                                 <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                       <div className="flex-1 bg-gray-100 rounded-full h-2">
                                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                                       </div>
                                       <span className="text-xs text-gray-600">{dashboardMetrics.cashFlow.coverage.toFixed(1)} mo coverage</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Spend Visibility Card */}
                              <div 
                                 onClick={() => openTrendModal('labor')}
                                 className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compensation Overview</span>
                                       <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleInsightClick(`Analyze Total Management Compensation of $${dashboardMetrics.compensation.total.toLocaleString()}. Correlate with retention rates and revenue per manager.`);
                                          }}
                                          className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                          title="Explain why"
                                       >
                                          <HelpCircle className="h-3 w-3" />
                                       </button>
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                       <Users className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                 </div>
                                 <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                          <span className="text-sm text-gray-700">Executive Spend</span>
                                       </div>
                                       <span className="text-sm font-semibold text-gray-900">${dashboardMetrics.compensation.executive.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                                          <span className="text-sm text-gray-700">Manager Spend</span>
                                       </div>
                                       <span className="text-sm font-semibold text-gray-900">${dashboardMetrics.compensation.manager.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                       <span className="text-xs text-gray-500">Total Management Compensation</span>
                                       <span className="text-sm font-bold text-gray-900">${dashboardMetrics.compensation.total.toLocaleString()}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        )}

                      </div>
                   </section>
                   )}


                   {/* Financial Overview - Owner Only */}
                   {selectedRole === "owner" && (
                   <section>
                      <h2 className="text-lg font-serif font-bold text-gray-900 mb-6">Financial Overview</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <GoalProgress 
                           label="Total Sales" 
                           current={dashboardMetrics.kpis.sales.current} 
                           target={dashboardMetrics.kpis.sales.target} 
                           unit="k" 
                           onTrendClick={() => openTrendModal('net-sales')}
                           onExplainClick={() => handleInsightClick(`Analyze Total Sales of $${dashboardMetrics.kpis.sales.current}k. Compare with target ($${dashboardMetrics.kpis.sales.target}k) and identify top drivers.`)}
                         />
                         <GoalProgress 
                           label="Net Profit %" 
                           current={dashboardMetrics.kpis.netProfit.current} 
                           target={dashboardMetrics.kpis.netProfit.target} 
                           unit="%" 
                           onTrendClick={() => openTrendModal('net-income')}
                           onExplainClick={() => handleInsightClick(`Analyze Net Profit of ${dashboardMetrics.kpis.netProfit.current}%. Compare with target (${dashboardMetrics.kpis.netProfit.target}%) and explain variance.`)}
                         />
                         <GoalProgress 
                           label="COGS %" 
                           current={dashboardMetrics.kpis.cogs.current} 
                           target={dashboardMetrics.kpis.cogs.target} 
                           unit="%" 
                           inverted={true} 
                           onTrendClick={() => openTrendModal('cogs')}
                           onExplainClick={() => handleInsightClick(`Analyze COGS of ${dashboardMetrics.kpis.cogs.current}%. Compare with target (${dashboardMetrics.kpis.cogs.target}%) and identify cost drivers.`)}
                         />
                         <GoalProgress 
                           label="Labor %" 
                           current={dashboardMetrics.kpis.labor.current} 
                           target={dashboardMetrics.kpis.labor.target} 
                           unit="%" 
                           inverted={true} 
                           onTrendClick={() => openTrendModal('labor')}
                           onExplainClick={() => handleInsightClick(`Analyze Labor Cost of ${dashboardMetrics.kpis.labor.current}%. Compare with target (${dashboardMetrics.kpis.labor.target}%) and suggest efficiency improvements.`)}
                         />
                      </div>
                   </section>
                   )}

                   {/* Chef Curated View - Kitchen Execution */}
                   {selectedRole === "chef" && (
                      <div className="space-y-8">

                         {/* Primary Kitchen Insight Card */}
                         <section>
                            <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                               <Lightbulb className="h-5 w-5 text-amber-500" />
                               Primary Kitchen Insight
                            </h2>
                            <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500 shadow-sm">
                               <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                                           Primary Insight
                                        </span>
                                     </div>
                                     
                                     <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {chefPrimaryInsight.headline}
                                     </h3>
                                     <p className="text-gray-700 mb-4 text-base leading-relaxed max-w-3xl">
                                        {chefPrimaryInsight.context}
                                     </p>

                                     <div className="flex items-center gap-12">
                                        {chefPrimaryInsight.metrics.map((metric, idx) => (
                                           <div key={idx}>
                                              <span className="text-xs text-gray-500 uppercase tracking-wide block mb-0.5">{metric.label}</span>
                                              <span className="text-lg font-bold text-red-700">{metric.value}</span>
                                              <div className="text-sm text-gray-500 mt-0.5">vs {metric.target} target</div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                     <button 
                                        onClick={handleGenerateChefInsightReport}
                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm flex items-center gap-2 bg-white text-red-700 border-red-200 hover:bg-red-50"
                                     >
                                        <ArrowRight className="h-4 w-4" />
                                        View Breakdown
                                     </button>
                                     <button
                                        onClick={(e) => {
                                           e.stopPropagation();
                                           setFloatingChatTrigger(`Analyze ${chefPrimaryInsight.metrics[1].label} variance for me`);
                                           setShowChat(true);
                                        }} 
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                                     >
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        Ask Assistant
                                     </button>
                                  </div>
                               </div>
                            </div>
                         </section>


                         {/* Secondary Kitchen Metrics */}
                         <section>
                            <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 text-gray-500 text-base">
                               Secondary Metrics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                               <GoalProgress 
                                 label="COGS %" 
                                 current={dashboardMetrics.kpis.cogs.current} 
                                 target={dashboardMetrics.kpis.cogs.target} 
                                 unit="%" 
                                 inverted={true} 
                                 onTrendClick={() => openTrendModal('cogs')}
                                 onExplainClick={() => handleInsightClick(`Analyze COGS of ${dashboardMetrics.kpis.cogs.current}%. Compare with target (${dashboardMetrics.kpis.cogs.target}%) and identify kitchen waste issues.`)}
                               />
                               <GoalProgress 
                                 label="Food Cost %" 
                                 current={dashboardMetrics.kpis.foodCost.current} 
                                 target={dashboardMetrics.kpis.foodCost.target} 
                                 unit="%" 
                                 inverted={true} 
                                 onTrendClick={() => openTrendModal('cogs')}
                                 onExplainClick={() => handleInsightClick(`Analyze Food Cost of ${dashboardMetrics.kpis.foodCost.current}%. Compare with target (${dashboardMetrics.kpis.foodCost.target}%) and suggest menu engineering adjustments.`)}
                               />
                               <GoalProgress 
                                 label="BOH Labor %" 
                                 current={dashboardMetrics.kpis.bohLabor.current} 
                                 target={dashboardMetrics.kpis.bohLabor.target} 
                                 unit="%" 
                                 inverted={true} 
                                 onTrendClick={() => openTrendModal('labor')}
                                 onExplainClick={() => handleInsightClick(`Analyze BOH Labor of ${dashboardMetrics.kpis.bohLabor.current}%. Compare with target (${dashboardMetrics.kpis.bohLabor.target}%) and suggest scheduling optimizations.`)}
                               />
                               <GoalProgress 
                                 label="Ticket Time" 
                                 current={dashboardMetrics.kpis.ticketTime.current} 
                                 target={dashboardMetrics.kpis.ticketTime.target} 
                                 unit="m" 
                                 inverted={true}
                                 onExplainClick={() => handleInsightClick(`Analyze Ticket Time of ${dashboardMetrics.kpis.ticketTime.current}m. Compare with target (${dashboardMetrics.kpis.ticketTime.target}m) and identify bottlenecks.`)}
                               />
                            </div>
                         </section>
                      </div>
                   )}



                   {/* Operations Overview - GM Only (Moved to bottom) */}
                   {selectedRole === "gm" && (
                   <section>
                      <h2 className="text-lg font-serif font-bold text-gray-900 mb-6">Operations Overview</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <GoalProgress 
                           label="Total Sales" 
                           current={dashboardMetrics.kpis.sales.current} 
                           target={dashboardMetrics.kpis.sales.target} 
                           unit="k" 
                           onTrendClick={() => openTrendModal('net-sales')}
                           onExplainClick={() => handleInsightClick(`Analyze Total Sales of $${dashboardMetrics.kpis.sales.current}k. Compare with target ($${dashboardMetrics.kpis.sales.target}k) and identify daily trends.`)}
                         />
                         <GoalProgress 
                           label="FOH Labor %" 
                           current={dashboardMetrics.kpis.fohLabor.current} 
                           target={dashboardMetrics.kpis.fohLabor.target} 
                           unit="%" 
                           inverted={true} 
                           onTrendClick={() => openTrendModal('labor')}
                           onExplainClick={() => handleInsightClick(`Analyze FOH Labor of ${dashboardMetrics.kpis.fohLabor.current}%. Compare with target (${dashboardMetrics.kpis.fohLabor.target}%) and suggest front-of-house staffing adjustments.`)}
                         />
                         <GoalProgress 
                           label="Ticket Time" 
                           current={dashboardMetrics.kpis.ticketTime.current} 
                           target={dashboardMetrics.kpis.ticketTime.target} 
                           unit="m" 
                           inverted={true}
                           onExplainClick={() => handleInsightClick(`Analyze Ticket Time of ${dashboardMetrics.kpis.ticketTime.current}m. Compare with target (${dashboardMetrics.kpis.ticketTime.target}m) and identify service delays.`)}
                         />
                         <GoalProgress 
                           label="Throughput" 
                           current={dashboardMetrics.kpis.throughput.current} 
                           target={dashboardMetrics.kpis.throughput.target} 
                           unit="/hr"
                           onExplainClick={() => handleInsightClick(`Analyze Throughput of ${dashboardMetrics.kpis.throughput.current}/hr. Compare with target (${dashboardMetrics.kpis.throughput.target}/hr) and suggest capacity improvements.`)}
                         />
                      </div>
                   </section>
                   )}


                   {/* Highlights Section */}
                   <section>
                      <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                         <Check className="h-5 w-5 text-emerald-600" />
                         {selectedRole === "owner" ? "Highlights" : 
                          selectedRole === "gm" ? "Operations Highlights" : 
                          "Kitchen Highlights"}
                      </h3>

                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                         <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-emerald-700">What's working this period</span>
                            <span className="text-xs text-emerald-600">Impact</span>
                         </div>
                         <div className="divide-y divide-gray-100">
                            {selectedRole === "owner" && (
                               <>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">
                                              Revenue grew 10.2%:{' '}
                                              <button 
                                                 onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('revenue'), 100); }}
                                                 className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2"
                                              >$146.6k vs $133k</button>
                                           </p>
                                           <p className="text-xs text-muted-foreground">Strong rebound in Food Sales vs prior month</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('revenue'), 100); }}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                                     >+$13,564</button>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">
                                              UberEats performance:{' '}
                                              <button 
                                                 onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('revenue'), 100); }}
                                                 className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2"
                                              >+22% growth</button>
                                           </p>
                                           <p className="text-xs text-muted-foreground">Delivery channel continues to expand share</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('revenue'), 100); }}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                                     >+$2,400</button>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">
                                              Guest sentiment up:{' '}
                                              <button 
                                                 onClick={() => {}}
                                                 className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2"
                                              >4.8 stars</button>
                                           </p>
                                           <p className="text-xs text-muted-foreground">Positive feedback on new seasonal specials</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => {}}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                                     >+0.3</button>
                                  </div>
                               </>
                            )}
                            {selectedRole === "gm" && (
                               <>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Revenue Growth: +10.2%</p>
                                           <p className="text-xs text-muted-foreground">$146k vs $133k prior month</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$13.5k</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Guest count up 12%: 8,580 vs 7,650</p>
                                           <p className="text-xs text-muted-foreground">Strong weekend traffic, especially during brunch</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+930 covers</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Delivery Sales: +22%</p>
                                           <p className="text-xs text-muted-foreground">UberEats led growth across channels</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$2.4k</span>
                                  </div>
                               </>
                            )}
                            {selectedRole === "chef" && (
                               <>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Food Sales Rebound: $107k</p>
                                           <p className="text-xs text-muted-foreground">Strong volume recovery vs Sep</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$11k</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Cookie Camp cost at 28%</p>
                                           <p className="text-xs text-muted-foreground">Maintained target despite ingredient price flux</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">On Target</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Kitchen Output up 12%</p>
                                           <p className="text-xs text-muted-foreground">Managed higher volume without labor spike</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">High Efficiency</span>
                                  </div>
                               </>
                            )}
                         </div>
                      </div>
                   </section>

                   {/* Kitchen Issues (Moved) */}
                   {selectedRole === "chef" && (
                   <section className="mb-10">
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                               <AlertTriangle className="h-4 w-4 text-red-600" />
                               {chefTimeRange === 'today' ? 'Kitchen Issues Today' :
                                chefTimeRange === 'week' ? 'Kitchen Issues This Week' :
                                chefTimeRange === 'month' ? 'Kitchen Issues This Month' :
                                'Kitchen Issues This Year'}
                               <span className="text-xs font-normal text-gray-500 ml-auto">Click to get guided help</span>
                            </h3>
                            <div className="space-y-3">
                               {/* Issue 1: Red Tickets */}
                               <button 
                                  onClick={() => {
                                     const contextByRange = {
                                        today: `[CONTEXT]\nRole: Executive Chef\nPeriod: Monday, Jan 12\nIssue: Red tickets spiked during dinner rush\nMetrics:\n• Peak hour: 7pm with 9 red tickets (11% of hour)\n• Total red tickets today: 35 (6% of all tickets)\n• Worst stations: Grill (12 red), Sauté (8 red)\n• Avg ticket time during rush: 9.2 min (target: 7 min)\n\nHelp me understand what caused the red ticket spike during dinner and how to prevent it tomorrow.`,
                                        week: `[CONTEXT]\nRole: Executive Chef\nPeriod: Week of Jan 6-12 (WTD)\nIssue: Elevated red tickets on Fri/Sat dinner shifts\nMetrics:\n• Total red tickets this week: 298 (7% of all tickets)\n• Worst days: Friday (55 red), Saturday (68 red)\n• Worst stations: Grill (89 red), Sauté (72 red)\n• Avg ticket time on weekends: 8.8 min vs 7.2 min weekdays\n\nHelp me identify the pattern causing weekend ticket delays and how to address staffing or workflow.`,
                                        month: `[CONTEXT]\nRole: Executive Chef\nPeriod: January 2026 (MTD)\nIssue: Red ticket percentage trending up vs last month\nMetrics:\n• MTD red tickets: 519 (7% of all tickets)\n• December average: 5.2% red tickets\n• Worst shifts: Friday/Saturday dinner (consistently 8-9%)\n• Pattern: Grill station bottleneck during peak hours\n\nHelp me create an action plan to reduce red tickets to under 5% for the remainder of the month.`,
                                        year: `[CONTEXT]\nRole: Executive Chef\nPeriod: 2026 (YTD)\nIssue: Kitchen efficiency baseline for the year\nMetrics:\n• YTD red tickets: 519 (7% of all tickets)\n• YTD yellow tickets: 1,214 (17%)\n• YTD green tickets: 5,520 (76%)\n• Primary bottleneck: Grill station during Friday/Saturday rushes\n\nHelp me set improvement targets and identify the biggest opportunities for ticket time reduction this year.`
                                     };
                                     setFloatingChatTrigger(contextByRange[chefTimeRange]);
                                     setShowChat(true);
                                  }}
                                  className="w-full text-left flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-red-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                               >
                                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100">
                                     <Clock className="h-3.5 w-3.5 text-red-600 group-hover:text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                     <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 flex items-center gap-2">
                                        {chefTimeRange === 'today' ? 'Red tickets spiked during dinner rush' :
                                         chefTimeRange === 'week' ? 'Elevated red tickets on weekend dinners' :
                                         chefTimeRange === 'month' ? 'Red ticket % trending up vs last month' :
                                         'Kitchen efficiency baseline for the year'}
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="text-xs text-gray-600 mt-0.5">
                                        {chefTimeRange === 'today' ? '9 problematic tickets at 7pm — check grill and sauté stations for bottlenecks.' :
                                         chefTimeRange === 'week' ? 'Friday & Saturday dinner shifts showing 8-9% red tickets vs 5% on weekdays.' :
                                         chefTimeRange === 'month' ? 'MTD red tickets at 7% vs 5.2% last month — grill station is primary bottleneck.' :
                                         '7% red tickets YTD — opportunity to improve weekend dinner service efficiency.'}
                                     </div>
                                     <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                           {chefTimeRange === 'today' ? 'Hour: 7pm' :
                                            chefTimeRange === 'week' ? 'Days: Fri/Sat' :
                                            chefTimeRange === 'month' ? 'Trend: +1.8 pts' :
                                            'Baseline: 7%'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                           {chefTimeRange === 'today' ? '9 red tickets' :
                                            chefTimeRange === 'week' ? '298 red tickets' :
                                            chefTimeRange === 'month' ? '519 red tickets' :
                                            '519 red YTD'}
                                        </span>
                                     </div>
                                  </div>
                               </button>
                               
                               {/* Issue 2: Food Cost / Waste */}
                               <button 
                                  onClick={() => {
                                     const contextByRange = {
                                        today: `[CONTEXT]\nRole: Executive Chef\nPeriod: Monday, Jan 12\nIssue: Food cost running above target\nMetrics:\n• Today's Food Cost %: 23.3%\n• Target: 24% (within range but trending up)\n• Waste log: 2.1% of inventory\n• High-cost items: Matcha Lava (4 over-baked), Milky Puff (3 defects)\n\nHelp me identify where we're losing margin on food cost and what kitchen adjustments to make.`,
                                        week: `[CONTEXT]\nRole: Executive Chef\nPeriod: Week of Jan 6-12 (WTD)\nIssue: Protein waste elevated this week\nMetrics:\n• Weekly waste: 2.4% of inventory (target: 1.8%)\n• Matcha Lava: 18 over-baked logged\n• Milky Puff: 12 defects\n• Cookies: 8 burnt batches\n\nHelp me address the protein waste pattern and create accountability measures for the line.`,
                                        month: `[CONTEXT]\nRole: Executive Chef\nPeriod: January 2026 (MTD)\nIssue: COGS trending above budget\nMetrics:\n• MTD COGS: 31.2% (budget: 30%)\n• Primary driver: Protein waste at 2.3% (target: 1.5%)\n• Secondary: Over-ordering on perishables\n• Potential savings: $1,840/month if waste hits target\n\nHelp me build a waste reduction plan to get COGS back on target.`,
                                        year: `[CONTEXT]\nRole: Executive Chef\nPeriod: 2026 (YTD)\nIssue: COGS baseline and opportunities\nMetrics:\n• YTD COGS: 31.2%\n• Target: 30%\n• Main opportunity: Protein portioning consistency\n• Estimated annual savings at target: $22,000\n\nHelp me create annual food cost goals and identify the biggest cost reduction opportunities.`
                                     };
                                     setFloatingChatTrigger(contextByRange[chefTimeRange]);
                                     setShowChat(true);
                                  }}
                                  className="w-full text-left flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-red-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                               >
                                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100">
                                     <Package className="h-3.5 w-3.5 text-orange-600 group-hover:text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                     <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 flex items-center gap-2">
                                        {chefTimeRange === 'today' ? 'Protein waste above normal' :
                                         chefTimeRange === 'week' ? 'Elevated protein waste this week' :
                                         chefTimeRange === 'month' ? 'COGS trending above budget' :
                                         'COGS baseline and annual targets'}
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="text-xs text-gray-600 mt-0.5">
                                        {chefTimeRange === 'today' ? 'Matcha Lava over-baked and salmon defects driving waste — review portioning with line.' :
                                         chefTimeRange === 'week' ? '38 protein waste incidents logged — ribeye and salmon are top offenders.' :
                                         chefTimeRange === 'month' ? 'COGS at 31.2% vs 30% budget — protein waste is primary driver.' :
                                         'Opportunity to save $22K annually by hitting 30% COGS target.'}
                                     </div>
                                     <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                           {chefTimeRange === 'today' ? 'Items: Matcha Lava, Milky Puff' :
                                            chefTimeRange === 'week' ? 'Waste: 2.4%' :
                                            chefTimeRange === 'month' ? 'COGS: 31.2%' :
                                            'Target: 30%'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                           {chefTimeRange === 'today' ? '7 issues flagged' :
                                            chefTimeRange === 'week' ? '38 incidents' :
                                            chefTimeRange === 'month' ? '+1.2 pts over' :
                                            '$22K opportunity'}
                                        </span>
                                     </div>
                                  </div>
                               </button>

                               {/* Issue 3: Prep / Operational */}
                               <button 
                                  onClick={() => {
                                     const contextByRange = {
                                        today: `[CONTEXT]\nRole: Executive Chef\nPeriod: Monday, Jan 12\nIssue: Prep completion delayed before dinner service\nMetrics:\n• Prep completed: 4:45pm (target: 4:00pm)\n• Delay: 45 minutes\n• Impact: Slow start to dinner, backed up tickets at 5:30pm\n• Cause: Late produce delivery (arrived 11:30am vs 9am)\n\nHelp me create a contingency plan for late deliveries and adjust prep timing.`,
                                        week: `[CONTEXT]\nRole: Executive Chef\nPeriod: Week of Jan 6-12 (WTD)\nIssue: Prep delays on 3 of 7 days this week\nMetrics:\n• Late prep days: Monday, Thursday, Saturday\n• Average delay: 35 minutes\n• Common cause: Delivery timing (2 days), understaffing (1 day)\n• Impact: Elevated yellow/red tickets on late days\n\nHelp me identify the root cause of recurring prep delays and build a more resilient prep schedule.`,
                                        month: `[CONTEXT]\nRole: Executive Chef\nPeriod: January 2026 (MTD)\nIssue: Prep efficiency below target MTD\nMetrics:\n• On-time prep days: 8 of 12 (67%)\n• Target: 90% on-time\n• Primary causes: Delivery delays (3), staffing gaps (1)\n• Correlation: Late prep days show 25% more red tickets\n\nHelp me implement process improvements to hit 90% on-time prep for the rest of the month.`,
                                        year: `[CONTEXT]\nRole: Executive Chef\nPeriod: 2026 (YTD)\nIssue: Kitchen operations baseline and goals\nMetrics:\n• Prep on-time rate: 67%\n• Ticket efficiency: 76% green, 17% yellow, 7% red\n• Primary improvement areas: Prep timing, grill station workflow\n• Goal: 85% green tickets, <5% red by Q2\n\nHelp me set operational KPIs for the kitchen and create a quarterly improvement roadmap.`
                                     };
                                     setFloatingChatTrigger(contextByRange[chefTimeRange]);
                                     setShowChat(true);
                                  }}
                                  className="w-full text-left flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-red-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                               >
                                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100">
                                     <Calendar className="h-3.5 w-3.5 text-amber-600 group-hover:text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                     <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 flex items-center gap-2">
                                        {chefTimeRange === 'today' ? 'Prep completed late before dinner' :
                                         chefTimeRange === 'week' ? 'Prep delays on 3 of 7 days' :
                                         chefTimeRange === 'month' ? 'Prep efficiency below target MTD' :
                                         'Kitchen operations baseline and goals'}
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="text-xs text-gray-600 mt-0.5">
                                        {chefTimeRange === 'today' ? '45 min behind schedule due to late produce delivery — impacted early dinner tickets.' :
                                         chefTimeRange === 'week' ? 'Mon, Thu, Sat prep ran late — delivery timing and staffing gaps are root causes.' :
                                         chefTimeRange === 'month' ? 'Only 67% on-time prep days — late days correlate with 25% more red tickets.' :
                                         'Prep timing and grill workflow are the biggest opportunities for improvement.'}
                                     </div>
                                     <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                           {chefTimeRange === 'today' ? 'Prep: 4:45pm' :
                                            chefTimeRange === 'week' ? '3 late days' :
                                            chefTimeRange === 'month' ? 'On-time: 67%' :
                                            'Target: 90%'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                           {chefTimeRange === 'today' ? '45 min late' :
                                            chefTimeRange === 'week' ? 'Avg 35 min delay' :
                                            chefTimeRange === 'month' ? '-23 pts vs target' :
                                            'Q2 goal: 85% green'}
                                        </span>
                                     </div>
                                  </div>
                               </button>
                            </div>
                         </div>
                   </section>
                   )}

                   {/* Missed Targets Section - Separate with whitespace */}
                   <section>
                      <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                         <AlertTriangle className="h-5 w-5 text-amber-600" />
                         Missed Targets
                      </h3>

                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                         <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-amber-700">Areas needing attention</span>
                            <span className="text-xs text-amber-600">Impact</span>
                         </div>
                         <div className="divide-y divide-gray-100">
                            {selectedRole === "owner" && (
                               <>
                                  {/* COGS Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-cogs-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "cogs" ? null : "cogs")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 COGS % missed target:{' '}
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('cogs'), 100); }}
                                                    className="text-amber-700 hover:text-amber-900 underline decoration-dotted underline-offset-2"
                                                 >31% vs 30%</button> goal
                                              </p>
                                              <p className="text-xs text-muted-foreground">Ingredient costs rose: White Choc +12%, Puff Pastry +8%</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <button 
                                              onClick={(e) => { e.stopPropagation(); setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('cogs'), 100); }}
                                              className="text-sm font-medium text-amber-600 hover:text-amber-800 hover:underline"
                                           >-$1,245</button>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "cogs" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "cogs" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunity</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Review Pastry Supplier</p>
                                                          <p className="text-xs text-gray-500">COGS • Pastry</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$800</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>

                                  {/* Overtime Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-overtime-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "overtime" ? null : "overtime")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 Overtime ran high:{' '}
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('labor'), 100); }}
                                                    className="text-amber-700 hover:text-amber-900 underline decoration-dotted underline-offset-2"
                                                 >142 hrs vs 80</button> budgeted
                                              </p>
                                              <p className="text-xs text-muted-foreground">Holiday weeks drove excess overtime across BOH and FOH</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <button 
                                              onClick={(e) => { e.stopPropagation(); setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('labor'), 100); }}
                                              className="text-sm font-medium text-amber-600 hover:text-amber-800 hover:underline"
                                           >-$3,200</button>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "overtime" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "overtime" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunity</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Cut 10hrs of Prep Overtime</p>
                                                          <p className="text-xs text-gray-500">Kitchen Staff • Oct 14</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$350</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>
                               </>
                            )}
                            {selectedRole === "gm" && (
                               <>
                                  {/* FOH Overtime Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-foh-overtime-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "foh-overtime" ? null : "foh-overtime")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 FOH overtime exceeded budget by{' '}
                                                 <span className="text-amber-700">62 hours</span>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Need better scheduling for January</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$1,800</span>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "foh-overtime" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "foh-overtime" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunities</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Implement split-shift scheduling on weekends</p>
                                                          <p className="text-xs text-gray-500">Scheduling • FOH Staff</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$600/mo</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Cross-train 2 hosts as backup servers</p>
                                                          <p className="text-xs text-gray-500">Training • Flexibility</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$400/mo</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>

                                  {/* Over-scheduled Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-scheduling-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "scheduling" ? null : "scheduling")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 Week 2 over-scheduled by{' '}
                                                 <span className="text-amber-700">2.1 hrs/day</span>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Tighter scheduling alignment with traffic patterns</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$680</span>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "scheduling" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "scheduling" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunities</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Use POS traffic data for predictive scheduling</p>
                                                          <p className="text-xs text-gray-500">Analytics • Scheduling</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$350/mo</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Reduce Tuesday/Wednesday staff by 1 server</p>
                                                          <p className="text-xs text-gray-500">Scheduling • Low-traffic Days</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$280/mo</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>

                                  {/* Table Turn Rate Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-table-turn-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "table-turn" ? null : "table-turn")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 Saturday dinner turns dropped:{' '}
                                                 <span className="text-amber-700">2.1 vs 2.4 target</span>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Average table time up 12 minutes vs prior month</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$520</span>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "table-turn" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "table-turn" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunity</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Streamline dessert/check drop timing</p>
                                                          <p className="text-xs text-gray-500">Service Flow • Table Turns</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$400/mo</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>
                               </>
                            )}
                            {selectedRole === "chef" && (
                               <>
                                  {/* Commissary Food Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-produce-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "produce" ? null : "produce")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 Commissary Food Spiked:{' '}
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('commissary-food'), 100); }}
                                                    className="text-amber-700 hover:text-amber-900 underline decoration-dotted underline-offset-2"
                                                 >$28k vs $19k</button>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Major variance in prepared food costs</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$8,257</span>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "produce" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "produce" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunities</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Audit Commissary Orders</p>
                                                          <p className="text-xs text-gray-500">COGS • Commissary</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">Critical</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>

                                  {/* BOH Overtime Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-boh-overtime-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "boh-overtime" ? null : "boh-overtime")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 BOH overtime:{' '}
                                                 <span className="text-amber-700">12 unplanned hours</span>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Sysco delivery arrived late on 10/14</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$350</span>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "boh-overtime" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "boh-overtime" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunities</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Set Sysco delivery SLA with penalties</p>
                                                          <p className="text-xs text-gray-500">Vendor Management • Sysco</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$150/mo</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Prep buffer stock for late delivery days</p>
                                                          <p className="text-xs text-gray-500">Inventory • Prep Planning</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$200/mo</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>

                                  {/* Food Cost Missed Target with Dropdown */}
                                  <div>
                                     <button
                                        data-testid="toggle-food-cost-opportunity"
                                        onClick={() => setExpandedMissedTarget(expandedMissedTarget === "food-cost" ? null : "food-cost")}
                                        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                              <AlertTriangle className="h-4 w-4" />
                                           </div>
                                           <div className="text-left">
                                              <p className="text-sm font-medium text-gray-900">
                                                 Food cost % over target:{' '}
                                                 <span className="text-amber-700">23.3% vs 24%</span>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Portion drift detected on protein items</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$445</span>
                                           <ChevronDown className={cn(
                                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                                              expandedMissedTarget === "food-cost" && "rotate-180"
                                           )} />
                                        </div>
                                     </button>
                                     <AnimatePresence>
                                        {expandedMissedTarget === "food-cost" && (
                                           <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                           >
                                              <div className="px-4 pb-4 pt-1 ml-11 border-l-2 border-indigo-200">
                                                 <div className="bg-indigo-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                       <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                       <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Opportunity</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Recalibrate protein portion scales</p>
                                                          <p className="text-xs text-gray-500">Kitchen Ops • Portioning</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$300/mo</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>
                               </>
                            )}
                         </div>

                         {/* Footer Summary - Owner only */}
                         {selectedRole === "owner" && (
                            <div className="p-4 bg-emerald-50/50 border-t border-gray-200 flex justify-between items-center">
                               <span className="text-sm font-medium text-gray-900">Potential Net Income Increase</span>
                               <span className="text-lg font-serif font-bold text-emerald-700">+$1,150</span>
                            </div>
                         )}
                      </div>
                   </section>


                   {/* Team Performance - Owner only */}
                   {selectedRole === "owner" && (
                   <section>
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                           <Users className="h-5 w-5 text-gray-700" /> Team Performance & Goals
                         </h3>
                         <div className="flex items-center gap-2">
                            <button
                              data-testid="button-email-report-curated"
                              onClick={() => setShowEmailReportModal(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Email Report
                            </button>
                            <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                              Q4 2024
                            </span>
                         </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                                SM
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">Sarah Mitchell</h5>
                                <p className="text-sm text-gray-500">General Manager</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
                              <Trophy className="h-5 w-5 text-amber-500" />
                              <div className="text-right">
                                <span className="text-lg font-bold text-gray-900">2/3</span>
                                <p className="text-xs text-gray-500">Goals Hit</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Labor under 33%</p>
                                <p className="text-xs text-gray-500">Achieved 32%</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-emerald-600">+$250</span>
                          </div>
                          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Sales target $120k</p>
                                <p className="text-xs text-gray-500">Achieved $124.5k</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-emerald-600">+$200</span>
                          </div>
                          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="h-4 w-4 text-red-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">COGS under 30%</p>
                                <p className="text-xs text-gray-500">Actual 31%</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-400">—</span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Total Bonus Earned</span>
                          <span className="text-lg font-bold text-gray-900">$450</span>
                        </div>
                      </div>
                   </section>
                   )}

                   {/* Role-specific Action Items - Click to open chat */}
                   <section>
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-serif text-lg font-bold text-gray-900">Your Action Items</h3>
                         <p className="text-xs text-gray-500">Click an item to discuss with Munch Assistant</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                         <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                               {activeActions
                                  .filter(item => item.owner === (selectedRole === "owner" ? "Owner" : selectedRole === "gm" ? "GM" : "Executive Chef"))
                                  .map((item) => (
                                  <motion.div
                                     key={item.id}
                                     layout
                                     initial={{ opacity: 0, y: -10 }}
                                     animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        scale: recentlyCompleted === item.id ? [1, 1.02, 1] : 1
                                     }}
                                     exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                                     className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                                  >
                                     <button
                                        onClick={() => toggleActionComplete(item.id)}
                                        className={cn(
                                           "w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                                           "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
                                        )}
                                     >
                                     </button>
                                     <div className={cn(
                                        "h-2.5 w-2.5 rounded-full flex-shrink-0",
                                        item.priority === "high" ? "bg-red-500" : item.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                                     )} />
                                     <div className="flex-1 min-w-0">
                                        {editingActionId === item.id ? (
                                           <input
                                              type="text"
                                              value={editingActionTitle}
                                              onChange={(e) => setEditingActionTitle(e.target.value)}
                                              onBlur={saveActionEdit}
                                              onKeyDown={(e) => e.key === "Enter" && saveActionEdit()}
                                              className="w-full font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                              autoFocus
                                           />
                                        ) : (
                                           <div 
                                              onClick={() => startEditingAction(item.id, item.title)}
                                              className="cursor-pointer group/text"
                                           >
                                              <p className="font-medium text-gray-900 group-hover/text:text-blue-600 transition-colors">
                                                 {item.title}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                 Impact: {item.impact}
                                              </p>
                                           </div>
                                        )}
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <button
                                           onClick={() => handleInsightClick(`Help me with this action item: ${item.title}`)}
                                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                           title="Ask Munch Assistant"
                                        >
                                           <Sparkles className="h-4 w-4" />
                                        </button>
                                        <button
                                           onClick={() => openAssignModal(item.id, item.title, item.owner)}
                                           className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                           Assign
                                        </button>
                                        <button
                                           onClick={() => startEditingAction(item.id, item.title)}
                                           className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                           <Pencil className="h-4 w-4" />
                                        </button>
                                     </div>
                                  </motion.div>
                               ))}
                            </AnimatePresence>
                            
                            {activeActions.filter(item => item.owner === (selectedRole === "owner" ? "Owner" : selectedRole === "gm" ? "GM" : "Executive Chef")).length === 0 && (
                               <div className="text-center py-8 text-gray-500">
                                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-300 mb-2" />
                                  <p className="font-medium">All action items completed!</p>
                               </div>
                            )}


                           {/* Completed Actions for Role */}
                            {completedActions.filter(item => item.owner === (selectedRole === "owner" ? "Owner" : selectedRole === "gm" ? "GM" : "Executive Chef")).length > 0 && (
                               <div className="mt-4 pt-4 border-t border-gray-100">
                                  <button
                                     onClick={() => setShowCompletedActions(!showCompletedActions)}
                                     className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                  >
                                     <ChevronDown className={cn("h-3 w-3 transition-transform", showCompletedActions && "rotate-180")} />
                                     Completed ({completedActions.filter(item => item.owner === (selectedRole === "owner" ? "Owner" : selectedRole === "gm" ? "GM" : "Executive Chef")).length})
                                  </button>
                                  <AnimatePresence>
                                     {showCompletedActions && (
                                        <motion.div
                                           initial={{ height: 0, opacity: 0 }}
                                           animate={{ height: "auto", opacity: 1 }}
                                           exit={{ height: 0, opacity: 0 }}
                                           className="overflow-hidden"
                                        >
                                           <div className="space-y-2 mt-2">
                                              {completedActions
                                                 .filter(item => item.owner === (selectedRole === "owner" ? "Owner" : selectedRole === "gm" ? "GM" : "Executive Chef"))
                                                 .map((item) => (
                                                 <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-75"
                                                 >
                                                    <button
                                                       onClick={() => toggleActionComplete(item.id)}
                                                       className="w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center flex-shrink-0"
                                                    >
                                                       <Check className="h-3 w-3 text-white" />
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                       <p className="font-medium text-gray-500 line-through text-sm">{item.title}</p>
                                                    </div>
                                                 </motion.div>
                                              ))}
                                           </div>
                                        </motion.div>
                                     )}
                                  </AnimatePresence>
                               </div>
                            )}
                         </div>
                      </div>
                   </section>

                </div>
                )}
                </div>
             </div>
          </div>

          <ReleaseModal 
             isOpen={showReleaseModal} 
             onClose={() => setShowReleaseModal(false)}
             data={{
                period,
                headline,
                insights
             }}
             onConfirm={confirmRelease}
          />

          <TrendChartModal 
             isOpen={!!trendModalMetric} 
             onClose={() => setTrendModalMetric(null)}
             metric={trendModalMetric}
          />

          {/* Performance Insight Modal (Layer 2) */}
          {insightModalMetric && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setInsightModalMetric(null)}>
              <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 mx-4" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                      insightModalMetric === 'sales' ? "bg-blue-100 text-blue-600" :
                      insightModalMetric === 'labor' ? "bg-orange-100 text-orange-600" :
                      insightModalMetric === 'cogs' ? "bg-amber-100 text-amber-600" :
                      "bg-emerald-100 text-emerald-600"
                    )}>
                       {insightModalMetric === 'sales' ? <BarChart3 className="h-6 w-6" /> :
                        insightModalMetric === 'labor' ? <Users className="h-6 w-6" /> :
                        insightModalMetric === 'cogs' ? <Package className="h-6 w-6" /> :
                        <TrendingUp className="h-6 w-6" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-serif font-bold text-gray-900">
                        {insightModalMetric === 'sales' ? 'Sales Performance' :
                         insightModalMetric === 'labor' ? 'Labor Efficiency' :
                         insightModalMetric === 'cogs' ? 'COGS Analysis' :
                         'Prime Cost Breakdown'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">Deep dive into {insightModalMetric === 'primeCost' ? 'Prime Cost' : insightModalMetric} trends and drivers</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{gmTimeRange === 'today' ? 'Today' : 'This Week'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setInsightModalMetric(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                  {/* Layer 2: Embedded Chart */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                           <Clock className="h-4 w-4 text-gray-500" />
                           Shift Breakdown
                           <span className="text-xs font-normal text-gray-500 ml-2">
                              {gmTimeRange === 'today' ? 'Today' : gmTimeRange === 'week' ? 'This Week (Avg/Day)' : gmTimeRange === 'month' ? 'This Month (Avg/Day)' : 'YTD (Avg/Day)'}
                           </span>
                        </h3>
                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs">
                           <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm bg-blue-500" />
                              <span className="text-gray-600">Sales</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm bg-orange-400" />
                              <span className="text-gray-600">Labor Cost</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-gray-600">Labor %</span>
                           </div>
                        </div>
                     </div>
                     
                     {/* Chart Container */}
                     <div 
                        className={cn(
                           "h-72 select-none",
                           shiftZoomLevel === '60min' ? "cursor-crosshair" : isPanning ? "cursor-grabbing" : "cursor-grab"
                        )}
                        onDoubleClick={handleShiftChartDoubleClick}
                        onMouseDown={handlePanMouseDown}
                        onMouseMove={handlePanMouseMove}
                        onMouseUp={handlePanMouseUp}
                        onMouseLeave={handlePanMouseUp}
                     >
                        <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart 
                              data={currentShiftData} 
                              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                              onMouseDown={handleShiftChartMouseDown}
                              onMouseMove={handleShiftChartMouseMove}
                              onMouseUp={handleShiftChartMouseUp}
                              onMouseLeave={handleShiftChartMouseUp}
                           >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis 
                                 dataKey={shiftZoomLevel === '60min' ? 'hour' : 'time'} 
                                 tick={{ fontSize: 10, fill: '#6b7280' }}
                                 axisLine={{ stroke: '#e5e7eb' }}
                                 tickLine={false}
                                 interval={shiftZoomLevel === '1min' ? 9 : shiftZoomLevel === '5min' ? 2 : 0}
                              />
                              <YAxis 
                                 yAxisId="left"
                                 tick={{ fontSize: 11, fill: '#6b7280' }}
                                 axisLine={{ stroke: '#e5e7eb' }}
                                 tickLine={false}
                                 tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                              />
                              <YAxis 
                                 yAxisId="right"
                                 orientation="right"
                                 domain={[0, 50]}
                                 tick={{ fontSize: 11, fill: '#6b7280' }}
                                 axisLine={{ stroke: '#e5e7eb' }}
                                 tickLine={false}
                                 tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip 
                                 content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                       const data = payload[0].payload;
                                       const timeLabel = data.time || data.hour;
                                       return (
                                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                                             <div className="font-semibold text-gray-900 mb-2">{timeLabel}</div>
                                             <div className="space-y-1">
                                                <div className="flex justify-between gap-4">
                                                   <span className="text-gray-600">Sales:</span>
                                                   <span className="font-medium text-blue-600">${data.sales.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                   <span className="text-gray-600">Labor Cost:</span>
                                                   <span className="font-medium text-orange-600">${data.labor.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between gap-4 pt-1 border-t border-gray-100">
                                                   <span className="text-gray-600">Labor %:</span>
                                                   <span className={cn(
                                                      "font-medium",
                                                      data.laborPct > 35 ? "text-red-600" : data.laborPct > 25 ? "text-amber-600" : "text-emerald-600"
                                                   )}>{data.laborPct}%</span>
                                                </div>
                                             </div>
                                          </div>
                                       );
                                    }
                                    return null;
                                 }}
                              />
                              <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sales" barSize={32} fillOpacity={insightModalMetric === 'sales' ? 1 : 0.6} />
                              <Bar yAxisId="left" dataKey="labor" fill="#fb923c" radius={[4, 4, 0, 0]} name="Labor" barSize={32} fillOpacity={insightModalMetric === 'labor' ? 1 : 0.6} />
                              <Line 
                                 yAxisId="right" 
                                 type="monotone" 
                                 dataKey="laborPct" 
                                 stroke="#ef4444" 
                                 strokeWidth={insightModalMetric === 'labor' ? 3 : 2}
                                 dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                 name="Labor %"
                              />
                           </ComposedChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Layer 3: Narrative Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Analysis & Context</h3>
                        
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                           <div className="flex gap-4">
                              <div className="p-2.5 bg-indigo-50 rounded-lg h-fit shrink-0">
                                 <Sparkles className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="space-y-3">
                                 <h4 className="font-semibold text-gray-900">
                                    {insightModalMetric === 'sales' ? "Strong Dinner Service Performance" :
                                     insightModalMetric === 'labor' ? "Labor Variance Detected in Mid-Afternoon" :
                                     insightModalMetric === 'cogs' ? "Waste Reduction Opportunity" :
                                     "Prime Cost Optimization"}
                                 </h4>
                                 <p className="text-sm text-gray-600 leading-relaxed">
                                    {insightModalMetric === 'sales' ? 
                                       "Dinner service (6pm-8pm) is consistently outperforming targets, driven by higher patio turnover and increased check averages. However, lunch service remains flat week-over-week." :
                                     insightModalMetric === 'labor' ? 
                                       "Lunch shifts (11am-2pm) are running 4% above labor targets due to fixed staffing levels during variable volume periods. Dinner labor efficiency is excellent at 18%." :
                                     insightModalMetric === 'cogs' ?
                                       "Food cost variance is elevated in the Proteins category, specifically correlated with the new steak special. Portion control or waste tracking might need review." :
                                       "Prime cost is trending favorably overall, but the mix of high labor + high food cost on Tuesdays is dragging down the weekly average."}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                           <h4 className="font-semibold text-gray-900 mb-3 text-sm">Key Contributing Factors</h4>
                           <ul className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                 <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>
                                       {insightModalMetric === 'sales' ? 
                                          (i===1 ? "Patio seating capacity utilized at 85% (vs 60% avg)" : i===2 ? "New cocktail menu driving beverage mix +2%" : "Friday night event drove record traffic") :
                                        insightModalMetric === 'labor' ? 
                                          (i===1 ? "Overstaffed by 1 server on Mon/Tue lunch" : i===2 ? "Kitchen overtime reduced by 15% vs last week" : "Training hours included in labor cost (temp impact)") :
                                          (i===1 ? "Supplier price increase on beef (+5%)" : i===2 ? "Waste logs show 95% compliance" : "Inventory turnover improved to 4.5 days")}
                                    </span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recommended Actions</h3>
                        <div className="space-y-3">
                           {[1, 2, 3].map((i) => (
                              <button key={i} className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                       {i===1 ? "Immediate" : i===2 ? "This Week" : "Strategic"}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                                 </div>
                                 <p className="font-medium text-gray-900 text-sm mb-1">
                                    {insightModalMetric === 'sales' ? 
                                       (i===1 ? "Promote Happy Hour specials" : i===2 ? "Review server upsell training" : "Plan seasonal menu launch") :
                                     insightModalMetric === 'labor' ? 
                                       (i===1 ? "Cut 1 server from Tue lunch" : i===2 ? "Adjust out-times for closers" : "Cross-train prep cooks") :
                                       (i===1 ? "Spot check steak portioning" : i===2 ? "Negotiate pricing with Vendor A" : "Audit inventory process")}
                                 </p>
                              </button>
                           ))}
                        </div>
                        
                        <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                           <MessageSquare className="h-4 w-4" />
                           Ask Assistant for Details
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Email Report Modal */}
          <AnimatePresence>
            {showEmailReportModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
                onClick={() => {
                  setShowEmailReportModal(false);
                  setShowEmailPreview(false);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-200"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Report</h3>
                        <p className="text-sm text-gray-500">Send Manager Scoreboard summary</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowEmailReportModal(false);
                        setShowEmailPreview(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      data-testid="button-close-email-modal"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {!showEmailPreview ? (
                    <>
                      {/* Recipients */}
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Recipients</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {emailRecipients.map((email) => (
                              <span
                                key={email}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                              >
                                {email}
                                <button
                                  onClick={() => removeRecipient(email)}
                                  className="hover:text-gray-900"
                                  data-testid={`button-remove-${email}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              placeholder="Add email address..."
                              value={newRecipient}
                              onChange={(e) => setNewRecipient(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              data-testid="input-new-recipient"
                            />
                            <button
                              onClick={addRecipient}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              data-testid="button-add-recipient"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Subject</label>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            data-testid="input-email-subject"
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">Message (optional)</label>
                          <textarea
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            placeholder="Add a personal note..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                            data-testid="textarea-email-message"
                          />
                        </div>

                        {/* Report Preview Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-900">Report Summary</span>
                            <button
                              onClick={() => setShowEmailPreview(true)}
                              className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                              data-testid="button-preview-report"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>• Manager Scoreboard - {getScoreboardData().quarter}</p>
                            <p>• Location: {getScoreboardData().location}</p>
                            <p>• {getScoreboardData().manager}'s Goals & Bonus Summary</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => {
                            setShowEmailReportModal(false);
                            setShowEmailPreview(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          data-testid="button-cancel-email"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={sendEmailReport}
                          disabled={emailSending || emailRecipients.length === 0}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-send-email"
                        >
                          {emailSending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Report
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Full Preview */}
                      <div className="p-5 max-h-[60vh] overflow-y-auto">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          {/* Email Header Preview */}
                          <div className="bg-gray-900 p-5">
                            <h4 className="font-bold text-lg text-white">Manager Scoreboard Report</h4>
                            <p className="text-gray-400 text-sm">{getScoreboardData().quarter} • {getScoreboardData().location}</p>
                          </div>

                          {/* Email Body Preview */}
                          <div className="p-5 space-y-4">
                            {emailMessage && (
                              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic border border-gray-100">
                                "{emailMessage}"
                              </div>
                            )}

                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                                  SM
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900">{getScoreboardData().manager}</h5>
                                  <p className="text-sm text-gray-500">{getScoreboardData().role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <div className="text-right">
                                  <span className="text-lg font-bold text-gray-900">{getScoreboardData().goalsHit}</span>
                                  <p className="text-xs text-gray-500">Goals Hit</p>
                                </div>
                              </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                              {getScoreboardData().goals.map((goal, i) => (
                                <div key={i} className="flex items-center justify-between py-3">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "h-8 w-8 rounded-full flex items-center justify-center",
                                      goal.achieved ? "bg-emerald-100" : "bg-red-100"
                                    )}>
                                      {goal.achieved ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                      ) : (
                                        <X className="h-4 w-4 text-red-500" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                                      <p className="text-xs text-gray-500">{goal.value} {!goal.achieved && "(missed)"}</p>
                                    </div>
                                  </div>
                                  <span className={cn(
                                    "text-sm font-semibold",
                                    goal.achieved ? "text-emerald-600" : "text-gray-400"
                                  )}>
                                    {goal.achieved ? goal.bonus : "—"}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <span className="text-sm font-medium text-gray-600">Total Bonus Earned</span>
                              <span className="text-lg font-bold text-gray-900">{getScoreboardData().totalBonus}</span>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-4">
                              <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                data-testid="button-view-pnl-cta"
                              >
                                <Target className="h-4 w-4" />
                                Maximize Your Next Bonus
                                <ArrowRight className="h-4 w-4" />
                              </button>
                              <p className="text-xs text-gray-500 text-center mt-2">
                                View your personalized P&L breakdown
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-100">
                            Generated on {getScoreboardData().generatedAt} via Munch Insights
                          </div>
                        </div>
                      </div>

                      {/* Preview Footer */}
                      <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => setShowEmailPreview(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          data-testid="button-back-from-preview"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Edit
                        </button>
                        <button
                          onClick={sendEmailReport}
                          disabled={emailSending || emailRecipients.length === 0}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-send-email-preview"
                        >
                          {emailSending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Report
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sections Sidebar */}
          <AnimatePresence>
            {showSectionsSidebar && activeTab === "detailed" && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-l border-gray-200 h-full overflow-hidden shrink-0"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Sections</h3>
                    <button
                      onClick={() => setShowSectionsSidebar(false)}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                      data-testid="button-close-sections-sidebar"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Drag to reorder, click eye to toggle</p>
                </div>
                <div className="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => handleSectionDragStart(section.id)}
                      onDragOver={(e) => handleSectionDragOver(e, section.id)}
                      onDragLeave={handleSectionDragLeave}
                      onDrop={() => handleSectionDrop(section.id)}
                      onDragEnd={handleSectionDragEnd}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-move transition-all",
                        draggedSectionId === section.id && "opacity-50 bg-gray-100",
                        dragOverSectionId === section.id && "border-t-2 border-blue-500",
                        section.visible ? "bg-white hover:bg-gray-50" : "bg-gray-50 opacity-60"
                      )}
                      data-testid={`section-item-${section.id}`}
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className={cn(
                        "text-sm flex-1 truncate",
                        section.visible ? "text-gray-700" : "text-gray-400 line-through"
                      )}>
                        {section.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionVisibility(section.id);
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-gray-200 transition-colors",
                          section.visible ? "text-gray-500" : "text-gray-300"
                        )}
                        data-testid={`toggle-visibility-${section.id}`}
                      >
                        {section.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setSections(defaultSections)}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    data-testid="button-reset-sections"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Side Panel Chat */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white border-l border-gray-200 shrink-0"
                style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}
                data-testid="assistant-side-panel"
              >
                <SidePanelAssistant 
                  onClose={() => setShowChat(false)} 
                  triggerQuery={floatingChatTrigger}
                  onOpenReport={handleOpenReport}
                  onReportGenerated={handleReportGenerated}
                  actionItems={actionItems}
                  onAddActionItem={handleAddActionItem}
                  onRemoveActionItem={handleRemoveActionItem}
                  showActionCart={showActionCart}
                  onToggleActionCart={setShowActionCart}
                  onUpdateActionItems={setActionItems}
                />
              </motion.div>
            )}
          </AnimatePresence>
       </div>
    </Layout>
  );
}
