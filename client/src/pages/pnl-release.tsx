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
  Sun,
  Moon,
  Package,
  TrendingDown
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  { id: "action-items", label: "Action Items", group: "Insights" },
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
  { id: "action-items", label: "Action Items", group: "Insights" },
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
  { id: "action-items", label: "Action Items", group: "Insights" },
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

// Real P&L summary from Excel (September 2025 vs August 2025)
const pnlData = [
  { category: "Revenue", current: 133042, prior: 154351, variance: -21309, pct: -13.8 },
  { category: "COGS", current: 55670, prior: 57494, variance: -1824, pct: -3.2 },
  { category: "Labor", current: 16156, prior: 18408, variance: -2252, pct: -12.2 },
  { category: "Expenses", current: 59650, prior: 67891, variance: -8241, pct: -12.1 },
  { category: "Gross Profit", current: 77372, prior: 96857, variance: -19485, pct: -20.1 },
  { category: "Net Income", current: 17722, prior: 28966, variance: -11244, pct: -38.8 },
];

// Real net margin % trend from Excel (Jan-Sep 2025)
const trendData = [
  { month: 'Jan', margin: 16.0 },
  { month: 'Feb', margin: 16.5 },
  { month: 'Mar', margin: 22.9 },
  { month: 'Apr', margin: 18.0 },
  { month: 'May', margin: 21.9 },
  { month: 'Jun', margin: 19.3 },
  { month: 'Jul', margin: 11.1 },
  { month: 'Aug', margin: 18.8 },
  { month: 'Sep', margin: 13.3 },
];

// Monthly trend data for Health Snapshot metrics
interface MonthlyDataPoint {
  month: string;
  year: number;
  actual: number;
  target: number;
  variance: number;
  variancePct: number;
}

interface DrilldownItem {
  id: string;
  name: string;
  actual: number;
  target: number;
  variance: number;
  variancePct: number;
  isOnTrack: boolean;
}

interface MetricTrendData {
  id: string;
  name: string;
  description: string;
  unit: 'currency' | 'percentage';
  isInverse?: boolean; // true if lower is better (costs)
  data: MonthlyDataPoint[];
  drilldown?: {
    title: string;
    items: DrilldownItem[];
  };
}

// Helper to determine if metric is on track
const isMetricOnTrack = (metric: MetricTrendData): boolean => {
  const current = metric.data[metric.data.length - 1];
  if (metric.isInverse) {
    return current.actual <= current.target;
  }
  return current.actual >= current.target;
};

// Real data from Excel file (Jan-Sep 2025)
const healthSnapshotTrendData: MetricTrendData[] = [
  {
    id: 'net-sales',
    name: 'Net Sales',
    description: 'Revenue after discounts and returns',
    unit: 'currency',
    data: [
      { month: 'Jan', year: 2025, actual: 163530, target: 160000, variance: 3530, variancePct: 2.2 },
      { month: 'Feb', year: 2025, actual: 139832, target: 145000, variance: -5168, variancePct: -3.6 },
      { month: 'Mar', year: 2025, actual: 163042, target: 160000, variance: 3042, variancePct: 1.9 },
      { month: 'Apr', year: 2025, actual: 162828, target: 160000, variance: 2828, variancePct: 1.8 },
      { month: 'May', year: 2025, actual: 161381, target: 160000, variance: 1381, variancePct: 0.9 },
      { month: 'Jun', year: 2025, actual: 149995, target: 155000, variance: -5005, variancePct: -3.2 },
      { month: 'Jul', year: 2025, actual: 142042, target: 150000, variance: -7958, variancePct: -5.3 },
      { month: 'Aug', year: 2025, actual: 154351, target: 155000, variance: -649, variancePct: -0.4 },
      { month: 'Sep', year: 2025, actual: 133042, target: 150000, variance: -16958, variancePct: -11.3 },
    ],
    drilldown: {
      title: 'Sales by Channel',
      items: [
        { id: 'food-sales', name: 'Food Sales', actual: 103461, target: 110000, variance: -6539, variancePct: -5.9, isOnTrack: false },
        { id: 'beverage-sales', name: 'Beverage Sales', actual: 17698, target: 20000, variance: -2302, variancePct: -11.5, isOnTrack: false },
        { id: 'delivery-sales', name: 'Delivery Sales', actual: 19728, target: 18000, variance: 1728, variancePct: 9.6, isOnTrack: true },
      ]
    }
  },
  {
    id: 'prime-cost',
    name: 'Prime Cost %',
    description: '(COGS + Labor) ÷ Net Sales',
    unit: 'percentage',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 50.5, target: 50.0, variance: 0.5, variancePct: 1.0 },
      { month: 'Feb', year: 2025, actual: 51.9, target: 50.0, variance: 1.9, variancePct: 3.8 },
      { month: 'Mar', year: 2025, actual: 47.1, target: 50.0, variance: -2.9, variancePct: -5.8 },
      { month: 'Apr', year: 2025, actual: 50.0, target: 50.0, variance: 0.0, variancePct: 0.0 },
      { month: 'May', year: 2025, actual: 47.8, target: 50.0, variance: -2.2, variancePct: -4.4 },
      { month: 'Jun', year: 2025, actual: 52.0, target: 50.0, variance: 2.0, variancePct: 4.0 },
      { month: 'Jul', year: 2025, actual: 54.8, target: 50.0, variance: 4.8, variancePct: 9.6 },
      { month: 'Aug', year: 2025, actual: 49.2, target: 50.0, variance: -0.8, variancePct: -1.6 },
      { month: 'Sep', year: 2025, actual: 54.0, target: 50.0, variance: 4.0, variancePct: 8.0 },
    ],
    drilldown: {
      title: 'Prime Cost Breakdown',
      items: [
        { id: 'labor-pct', name: 'Direct Labor %', actual: 12.1, target: 12.0, variance: 0.1, variancePct: 0.8, isOnTrack: true },
        { id: 'cogs-pct', name: 'COGS %', actual: 41.8, target: 38.0, variance: 3.8, variancePct: 10.0, isOnTrack: false },
      ]
    }
  },
  {
    id: 'labor',
    name: 'Labor %',
    description: 'Direct Labor ÷ Net Sales',
    unit: 'percentage',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 11.0, target: 12.0, variance: -1.0, variancePct: -8.3 },
      { month: 'Feb', year: 2025, actual: 11.0, target: 12.0, variance: -1.0, variancePct: -8.3 },
      { month: 'Mar', year: 2025, actual: 10.9, target: 12.0, variance: -1.1, variancePct: -9.2 },
      { month: 'Apr', year: 2025, actual: 11.5, target: 12.0, variance: -0.5, variancePct: -4.2 },
      { month: 'May', year: 2025, actual: 11.1, target: 12.0, variance: -0.9, variancePct: -7.5 },
      { month: 'Jun', year: 2025, actual: 12.4, target: 12.0, variance: 0.4, variancePct: 3.3 },
      { month: 'Jul', year: 2025, actual: 12.4, target: 12.0, variance: 0.4, variancePct: 3.3 },
      { month: 'Aug', year: 2025, actual: 11.9, target: 12.0, variance: -0.1, variancePct: -0.8 },
      { month: 'Sep', year: 2025, actual: 12.1, target: 12.0, variance: 0.1, variancePct: 0.8 },
    ],
    drilldown: {
      title: 'Labor by Role',
      items: [
        { id: 'server-plater', name: 'Server/Plater', actual: 9.6, target: 9.0, variance: 0.6, variancePct: 6.7, isOnTrack: false },
        { id: 'dishwasher', name: 'Dishwasher', actual: 2.3, target: 2.5, variance: -0.2, variancePct: -8.0, isOnTrack: true },
        { id: 'overtime', name: 'Overtime', actual: 0.3, target: 0.5, variance: -0.2, variancePct: -40.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'cogs',
    name: 'COGS %',
    description: 'COGS ÷ Net Sales',
    unit: 'percentage',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 39.5, target: 38.0, variance: 1.5, variancePct: 3.9 },
      { month: 'Feb', year: 2025, actual: 40.9, target: 38.0, variance: 2.9, variancePct: 7.6 },
      { month: 'Mar', year: 2025, actual: 36.1, target: 38.0, variance: -1.9, variancePct: -5.0 },
      { month: 'Apr', year: 2025, actual: 38.5, target: 38.0, variance: 0.5, variancePct: 1.3 },
      { month: 'May', year: 2025, actual: 36.7, target: 38.0, variance: -1.3, variancePct: -3.4 },
      { month: 'Jun', year: 2025, actual: 39.6, target: 38.0, variance: 1.6, variancePct: 4.2 },
      { month: 'Jul', year: 2025, actual: 42.4, target: 38.0, variance: 4.4, variancePct: 11.6 },
      { month: 'Aug', year: 2025, actual: 37.2, target: 38.0, variance: -0.8, variancePct: -2.1 },
      { month: 'Sep', year: 2025, actual: 41.8, target: 38.0, variance: 3.8, variancePct: 10.0 },
    ],
    drilldown: {
      title: 'COGS by Category',
      items: [
        { id: 'commissary', name: 'Commissary Food', actual: 14.9, target: 15.0, variance: -0.1, variancePct: -0.7, isOnTrack: true },
        { id: 'food-cost', name: 'Food Cost', actual: 3.9, target: 4.0, variance: -0.1, variancePct: -2.5, isOnTrack: true },
        { id: 'beverage-cost', name: 'Beverage Cost', actual: 1.8, target: 1.5, variance: 0.3, variancePct: 20.0, isOnTrack: false },
        { id: 'delivery-fees', name: 'Online Delivery Fees', actual: 2.4, target: 2.0, variance: 0.4, variancePct: 20.0, isOnTrack: false },
      ]
    }
  },
  {
    id: 'net-income',
    name: 'Net Margin %',
    description: 'Net Operating Income ÷ Net Sales',
    unit: 'percentage',
    data: [
      { month: 'Jan', year: 2025, actual: 16.0, target: 15.0, variance: 1.0, variancePct: 6.7 },
      { month: 'Feb', year: 2025, actual: 16.5, target: 15.0, variance: 1.5, variancePct: 10.0 },
      { month: 'Mar', year: 2025, actual: 22.9, target: 15.0, variance: 7.9, variancePct: 52.7 },
      { month: 'Apr', year: 2025, actual: 18.0, target: 15.0, variance: 3.0, variancePct: 20.0 },
      { month: 'May', year: 2025, actual: 21.9, target: 15.0, variance: 6.9, variancePct: 46.0 },
      { month: 'Jun', year: 2025, actual: 19.3, target: 15.0, variance: 4.3, variancePct: 28.7 },
      { month: 'Jul', year: 2025, actual: 11.1, target: 15.0, variance: -3.9, variancePct: -26.0 },
      { month: 'Aug', year: 2025, actual: 18.8, target: 15.0, variance: 3.8, variancePct: 25.3 },
      { month: 'Sep', year: 2025, actual: 13.3, target: 15.0, variance: -1.7, variancePct: -11.3 },
    ],
    drilldown: {
      title: 'Margin Drivers',
      items: [
        { id: 'gross-margin', name: 'Gross Margin', actual: 58.2, target: 60.0, variance: -1.8, variancePct: -3.0, isOnTrack: false },
        { id: 'operating-expenses', name: 'Operating Expenses %', actual: 44.8, target: 45.0, variance: -0.2, variancePct: -0.4, isOnTrack: true },
        { id: 'cogs-impact', name: 'COGS Impact', actual: -41.8, target: -38.0, variance: -3.8, variancePct: 10.0, isOnTrack: false },
      ]
    }
  },
  {
    id: 'gross-profit',
    name: 'Gross Profit',
    description: 'Revenue minus COGS',
    unit: 'currency',
    data: [
      { month: 'Jan', year: 2025, actual: 98854, target: 99200, variance: -346, variancePct: -0.3 },
      { month: 'Feb', year: 2025, actual: 82689, target: 89900, variance: -7211, variancePct: -8.0 },
      { month: 'Mar', year: 2025, actual: 104157, target: 99200, variance: 4957, variancePct: 5.0 },
      { month: 'Apr', year: 2025, actual: 100076, target: 99200, variance: 876, variancePct: 0.9 },
      { month: 'May', year: 2025, actual: 102178, target: 99200, variance: 2978, variancePct: 3.0 },
      { month: 'Jun', year: 2025, actual: 90529, target: 96100, variance: -5571, variancePct: -5.8 },
      { month: 'Jul', year: 2025, actual: 81796, target: 93000, variance: -11204, variancePct: -12.0 },
      { month: 'Aug', year: 2025, actual: 96857, target: 96100, variance: 757, variancePct: 0.8 },
      { month: 'Sep', year: 2025, actual: 77372, target: 93000, variance: -15628, variancePct: -16.8 },
    ],
    drilldown: {
      title: 'Gross Profit Components',
      items: [
        { id: 'revenue', name: 'Total Revenue', actual: 133042, target: 150000, variance: -16958, variancePct: -11.3, isOnTrack: false },
        { id: 'cogs', name: 'Total COGS', actual: -55670, target: -57000, variance: 1330, variancePct: -2.3, isOnTrack: true },
      ]
    }
  },
  {
    id: 'marketing',
    name: 'Marketing Spend',
    description: 'Total marketing and advertising expenses',
    unit: 'currency',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 3500, target: 4000, variance: -500, variancePct: -12.5 },
      { month: 'Feb', year: 2025, actual: 3800, target: 4000, variance: -200, variancePct: -5.0 },
      { month: 'Mar', year: 2025, actual: 4200, target: 4000, variance: 200, variancePct: 5.0 },
      { month: 'Apr', year: 2025, actual: 3600, target: 4000, variance: -400, variancePct: -10.0 },
      { month: 'May', year: 2025, actual: 3400, target: 4000, variance: -600, variancePct: -15.0 },
      { month: 'Jun', year: 2025, actual: 3900, target: 4000, variance: -100, variancePct: -2.5 },
      { month: 'Jul', year: 2025, actual: 4100, target: 4000, variance: 100, variancePct: 2.5 },
      { month: 'Aug', year: 2025, actual: 3700, target: 4000, variance: -300, variancePct: -7.5 },
      { month: 'Sep', year: 2025, actual: 3200, target: 4000, variance: -800, variancePct: -20.0 },
    ],
    drilldown: {
      title: 'Marketing Channels',
      items: [
        { id: 'digital-ads', name: 'Digital Ads', actual: 1800, target: 2000, variance: -200, variancePct: -10.0, isOnTrack: true },
        { id: 'social-media', name: 'Social Media', actual: 800, target: 1000, variance: -200, variancePct: -20.0, isOnTrack: true },
        { id: 'local-promo', name: 'Local Promotions', actual: 600, target: 1000, variance: -400, variancePct: -40.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Net operating cash balance',
    unit: 'currency',
    data: [
      { month: 'Jan', year: 2025, actual: 42000, target: 40000, variance: 2000, variancePct: 5.0 },
      { month: 'Feb', year: 2025, actual: 38500, target: 40000, variance: -1500, variancePct: -3.8 },
      { month: 'Mar', year: 2025, actual: 45200, target: 42000, variance: 3200, variancePct: 7.6 },
      { month: 'Apr', year: 2025, actual: 44800, target: 42000, variance: 2800, variancePct: 6.7 },
      { month: 'May', year: 2025, actual: 47500, target: 45000, variance: 2500, variancePct: 5.6 },
      { month: 'Jun', year: 2025, actual: 43200, target: 45000, variance: -1800, variancePct: -4.0 },
      { month: 'Jul', year: 2025, actual: 39800, target: 42000, variance: -2200, variancePct: -5.2 },
      { month: 'Aug', year: 2025, actual: 44600, target: 45000, variance: -400, variancePct: -0.9 },
      { month: 'Sep', year: 2025, actual: 48200, target: 45000, variance: 3200, variancePct: 7.1 },
    ],
    drilldown: {
      title: 'Cash Flow Sources',
      items: [
        { id: 'operating-cash', name: 'Operating Cash', actual: 32400, target: 30000, variance: 2400, variancePct: 8.0, isOnTrack: true },
        { id: 'receivables', name: 'Receivables', actual: 8200, target: 10000, variance: -1800, variancePct: -18.0, isOnTrack: false },
        { id: 'reserve', name: 'Cash Reserve', actual: 7600, target: 5000, variance: 2600, variancePct: 52.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'controllable-expenses',
    name: 'Controllable Expenses',
    description: 'Total controllable operating expenses',
    unit: 'currency',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 42500, target: 45000, variance: -2500, variancePct: -5.6 },
      { month: 'Feb', year: 2025, actual: 43800, target: 45000, variance: -1200, variancePct: -2.7 },
      { month: 'Mar', year: 2025, actual: 41200, target: 45000, variance: -3800, variancePct: -8.4 },
      { month: 'Apr', year: 2025, actual: 44100, target: 45000, variance: -900, variancePct: -2.0 },
      { month: 'May', year: 2025, actual: 43600, target: 45000, variance: -1400, variancePct: -3.1 },
      { month: 'Jun', year: 2025, actual: 46200, target: 45000, variance: 1200, variancePct: 2.7 },
      { month: 'Jul', year: 2025, actual: 47800, target: 45000, variance: 2800, variancePct: 6.2 },
      { month: 'Aug', year: 2025, actual: 44900, target: 45000, variance: -100, variancePct: -0.2 },
      { month: 'Sep', year: 2025, actual: 44500, target: 45000, variance: -500, variancePct: -1.1 },
    ],
    drilldown: {
      title: 'Expense Categories',
      items: [
        { id: 'marketing-exp', name: 'Marketing', actual: 3200, target: 4000, variance: -800, variancePct: -20.0, isOnTrack: true },
        { id: 'repairs-exp', name: 'Repairs & Maintenance', actual: 8400, target: 8000, variance: 400, variancePct: 5.0, isOnTrack: false },
        { id: 'utilities-exp', name: 'Utilities', actual: 12800, target: 12000, variance: 800, variancePct: 6.7, isOnTrack: false },
        { id: 'cc-fees-exp', name: 'CC Fees', actual: 5200, target: 5500, variance: -300, variancePct: -5.5, isOnTrack: true },
        { id: 'delivery-exp', name: 'Delivery Fees', actual: 14900, target: 15500, variance: -600, variancePct: -3.9, isOnTrack: true },
      ]
    }
  }
];

// Cost breakdown based on September 2025 data (% of revenue)
const categoryData = [
  { name: 'COGS', value: 42, color: '#3b82f6' },
  { name: 'Labor', value: 12, color: '#ef4444' },
  { name: 'Operating', value: 33, color: '#eab308' },
  { name: 'Margin', value: 13, color: '#10b981' },
];

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
  { id: "action-items", label: "Action Items" },
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
  { id: "action-items", label: "Action Items", visible: true },
  { id: "accountant-note", label: "Accountant Note", visible: true },
];

// --- State Prime Cost Benchmarks ---
interface StateBenchmark {
  code: string;
  name: string;
  primeCost: number;
  foodCost: number;
  laborCost: number;
}

const stateBenchmarks: StateBenchmark[] = [
  { code: "AL", name: "Alabama", primeCost: 58.5, foodCost: 30.0, laborCost: 28.5 },
  { code: "AK", name: "Alaska", primeCost: 64.0, foodCost: 34.0, laborCost: 30.0 },
  { code: "AZ", name: "Arizona", primeCost: 60.5, foodCost: 31.5, laborCost: 29.0 },
  { code: "AR", name: "Arkansas", primeCost: 57.5, foodCost: 29.5, laborCost: 28.0 },
  { code: "CA", name: "California", primeCost: 65.0, foodCost: 33.0, laborCost: 32.0 },
  { code: "CO", name: "Colorado", primeCost: 61.5, foodCost: 31.0, laborCost: 30.5 },
  { code: "CT", name: "Connecticut", primeCost: 63.0, foodCost: 32.0, laborCost: 31.0 },
  { code: "DE", name: "Delaware", primeCost: 60.0, foodCost: 31.0, laborCost: 29.0 },
  { code: "FL", name: "Florida", primeCost: 59.5, foodCost: 30.5, laborCost: 29.0 },
  { code: "GA", name: "Georgia", primeCost: 59.0, foodCost: 30.0, laborCost: 29.0 },
  { code: "HI", name: "Hawaii", primeCost: 66.0, foodCost: 36.0, laborCost: 30.0 },
  { code: "ID", name: "Idaho", primeCost: 58.0, foodCost: 30.0, laborCost: 28.0 },
  { code: "IL", name: "Illinois", primeCost: 62.0, foodCost: 31.5, laborCost: 30.5 },
  { code: "IN", name: "Indiana", primeCost: 58.5, foodCost: 30.0, laborCost: 28.5 },
  { code: "IA", name: "Iowa", primeCost: 57.5, foodCost: 29.5, laborCost: 28.0 },
  { code: "KS", name: "Kansas", primeCost: 58.0, foodCost: 30.0, laborCost: 28.0 },
  { code: "KY", name: "Kentucky", primeCost: 58.0, foodCost: 29.5, laborCost: 28.5 },
  { code: "LA", name: "Louisiana", primeCost: 59.0, foodCost: 30.5, laborCost: 28.5 },
  { code: "ME", name: "Maine", primeCost: 60.5, foodCost: 31.5, laborCost: 29.0 },
  { code: "MD", name: "Maryland", primeCost: 62.0, foodCost: 31.5, laborCost: 30.5 },
  { code: "MA", name: "Massachusetts", primeCost: 64.0, foodCost: 32.5, laborCost: 31.5 },
  { code: "MI", name: "Michigan", primeCost: 59.5, foodCost: 30.5, laborCost: 29.0 },
  { code: "MN", name: "Minnesota", primeCost: 60.0, foodCost: 30.5, laborCost: 29.5 },
  { code: "MS", name: "Mississippi", primeCost: 57.0, foodCost: 29.0, laborCost: 28.0 },
  { code: "MO", name: "Missouri", primeCost: 58.5, foodCost: 30.0, laborCost: 28.5 },
  { code: "MT", name: "Montana", primeCost: 59.0, foodCost: 31.0, laborCost: 28.0 },
  { code: "NE", name: "Nebraska", primeCost: 58.0, foodCost: 30.0, laborCost: 28.0 },
  { code: "NV", name: "Nevada", primeCost: 61.0, foodCost: 31.0, laborCost: 30.0 },
  { code: "NH", name: "New Hampshire", primeCost: 61.0, foodCost: 31.5, laborCost: 29.5 },
  { code: "NJ", name: "New Jersey", primeCost: 63.5, foodCost: 32.0, laborCost: 31.5 },
  { code: "NM", name: "New Mexico", primeCost: 59.0, foodCost: 30.5, laborCost: 28.5 },
  { code: "NY", name: "New York", primeCost: 64.5, foodCost: 32.5, laborCost: 32.0 },
  { code: "NC", name: "North Carolina", primeCost: 59.0, foodCost: 30.0, laborCost: 29.0 },
  { code: "ND", name: "North Dakota", primeCost: 58.0, foodCost: 30.0, laborCost: 28.0 },
  { code: "OH", name: "Ohio", primeCost: 59.0, foodCost: 30.0, laborCost: 29.0 },
  { code: "OK", name: "Oklahoma", primeCost: 57.5, foodCost: 29.5, laborCost: 28.0 },
  { code: "OR", name: "Oregon", primeCost: 62.5, foodCost: 31.5, laborCost: 31.0 },
  { code: "PA", name: "Pennsylvania", primeCost: 61.0, foodCost: 31.0, laborCost: 30.0 },
  { code: "RI", name: "Rhode Island", primeCost: 62.0, foodCost: 31.5, laborCost: 30.5 },
  { code: "SC", name: "South Carolina", primeCost: 58.5, foodCost: 30.0, laborCost: 28.5 },
  { code: "SD", name: "South Dakota", primeCost: 57.5, foodCost: 29.5, laborCost: 28.0 },
  { code: "TN", name: "Tennessee", primeCost: 58.5, foodCost: 30.0, laborCost: 28.5 },
  { code: "TX", name: "Texas", primeCost: 59.5, foodCost: 30.5, laborCost: 29.0 },
  { code: "UT", name: "Utah", primeCost: 59.0, foodCost: 30.5, laborCost: 28.5 },
  { code: "VT", name: "Vermont", primeCost: 61.0, foodCost: 32.0, laborCost: 29.0 },
  { code: "VA", name: "Virginia", primeCost: 60.5, foodCost: 31.0, laborCost: 29.5 },
  { code: "WA", name: "Washington", primeCost: 63.5, foodCost: 32.0, laborCost: 31.5 },
  { code: "WV", name: "West Virginia", primeCost: 57.5, foodCost: 29.5, laborCost: 28.0 },
  { code: "WI", name: "Wisconsin", primeCost: 59.0, foodCost: 30.0, laborCost: 29.0 },
  { code: "WY", name: "Wyoming", primeCost: 58.5, foodCost: 30.5, laborCost: 28.0 },
];

// --- Hierarchical P&L Data with Variance Flagging ---
type VarianceLevel = 'critical' | 'attention' | 'favorable' | 'normal';
type LineItemType = 'revenue' | 'expense' | 'subtotal';

interface PnLLineItem {
  id: string;
  name: string;
  current: number;
  prior: number;
  type: LineItemType;
  children?: PnLLineItem[];
  relatedMetrics?: { id: string; name: string }[];
}

interface VarianceInfo {
  level: VarianceLevel;
  reason: string;
  variance: number;
  variancePct: number;
}

interface Suggestion {
  icon: React.ReactNode;
  text: string;
  action: 'comparison' | 'trend' | 'breakdown' | 'ai_explain' | 'compare_metrics';
  params: Record<string, any>;
}

// Hierarchical P&L data structure - Complete Excel Coverage (September 2025 vs August 2025)
const hierarchicalPnlData: PnLLineItem[] = [
  {
    id: 'income',
    name: 'Revenue',
    current: 133041.81,
    prior: 154351.46,
    type: 'revenue',
    relatedMetrics: [{ id: 'cogs', name: 'COGS' }],
    children: [
      { id: 'food-sales', name: 'Food Sales', current: 103461.46, prior: 121928.52, type: 'revenue' },
      { id: 'beverage-sales', name: 'Beverage Sales', current: 17698, prior: 22676.45, type: 'revenue',
        children: [
          { id: 'alcohol-bevs', name: 'Alcohol Beverages', current: 2622, prior: 2598, type: 'revenue' },
          { id: 'n-a-beverage', name: 'N/A Beverage', current: 15076, prior: 20078.45, type: 'revenue' },
        ]
      },
      { id: 'delivery-sales', name: 'Delivery Sales', current: 19727.58, prior: 18785.77, type: 'revenue',
        children: [
          { id: 'classpass', name: 'ClassPass', current: 192.04, prior: 160.12, type: 'revenue' },
          { id: 'doordash', name: 'DoorDash', current: 5269.8, prior: 5920.7, type: 'revenue' },
          { id: 'ezcater', name: 'ezCater', current: 1890, prior: 1777.29, type: 'revenue' },
          { id: 'fantuan', name: 'Fantuan', current: 215.75, prior: 132.95, type: 'revenue' },
          { id: 'grubhub', name: 'GrubHub', current: 1784, prior: 2063.55, type: 'revenue' },
          { id: 'hungrypanda', name: 'HungryPanda', current: 64.7, prior: 393.5, type: 'revenue' },
          { id: 'ubereats', name: 'UberEats', current: 10311.29, prior: 8337.66, type: 'revenue' },
          { id: 'grubhub-deli-promo', name: 'GrubHub - Deli Promo', current: 0, prior: 0, type: 'revenue' },
          { id: 'ubereats-deli-promo', name: 'UberEats - Deli Promo', current: 0, prior: 0, type: 'revenue' },
        ]
      },
      { id: 'events-offpremise', name: 'Events / Off-Premise Sales', current: 0, prior: 0, type: 'revenue' },
      { id: 'comps-discount', name: 'Comps / Discount', current: -7845.23, prior: -9039.28, type: 'revenue' },
    ]
  },
  {
    id: 'cogs',
    name: 'Cost of Goods Sold',
    current: 55669.86,
    prior: 57494.34,
    type: 'expense',
    relatedMetrics: [{ id: 'income', name: 'Revenue' }],
    children: [
      { id: 'food-cost', name: 'Food Cost', current: 5184.83, prior: 4937.5, type: 'expense',
        children: [
          { id: 'dairy', name: 'Dairy', current: 1858.85, prior: 1521.68, type: 'expense' },
          { id: 'dry-goods', name: 'Dry Goods', current: 1533.06, prior: 1940.61, type: 'expense' },
          { id: 'produce', name: 'Produce', current: 1792.92, prior: 1475.21, type: 'expense' },
        ]
      },
      { id: 'beverage-cost', name: 'Beverage Cost', current: 2393.45, prior: 1195.39, type: 'expense',
        children: [
          { id: 'beer-wine-cider', name: 'Beer/Wine/Cider', current: 976.12, prior: 300.4, type: 'expense' },
          { id: 'coffee-tea', name: 'Coffee/Tea', current: 995.37, prior: 454.7, type: 'expense' },
          { id: 'juice-soda-water', name: 'Juice/Soda/Water', current: 421.96, prior: 440.29, type: 'expense' },
        ]
      },
      { id: 'commissary-food', name: 'Commissary Food', current: 19847.4, prior: 23938.32, type: 'expense',
        children: [
          { id: 'ice-cream', name: 'Ice Cream', current: 19847.4, prior: 23938.32, type: 'expense' },
        ]
      },
      { id: 'direct-labor-cost', name: 'Direct Labor Cost', current: 16156.05, prior: 18408.13, type: 'expense',
        children: [
          { id: 'dishwasher', name: 'Dishwasher', current: 3087.86, prior: 3844.52, type: 'expense' },
          { id: 'dishwasher-overtime', name: 'Dishwasher Overtime', current: 278.45, prior: 383.62, type: 'expense' },
          { id: 'server-plater', name: 'Server/Plater', current: 12731.99, prior: 13510.36, type: 'expense' },
          { id: 'server-plater-overtime', name: 'Server/Plater Overtime', current: 57.75, prior: 669.63, type: 'expense' },
        ]
      },
      { id: 'online-delivery-fees', name: 'Online Delivery Fees', current: 3133.72, prior: 0, type: 'expense',
        children: [
          { id: 'grubhub-fees-cogs', name: 'GrubHub Fees', current: 1566.86, prior: 0, type: 'expense' },
          { id: 'ubereats-fees-cogs', name: 'UberEats Fees', current: 1566.86, prior: 0, type: 'expense' },
        ]
      },
    ]
  },
  {
    id: 'gross-profit',
    name: 'Gross Profit',
    current: 77371.95,
    prior: 96857.12,
    type: 'subtotal',
  },
  {
    id: 'expenses',
    name: 'Operating Expenses',
    current: 59649.58,
    prior: 67890.77,
    type: 'expense',
    children: [
      { id: 'payroll-expenses', name: 'Payroll Expenses', current: 16948.93, prior: 19247.68, type: 'expense',
        children: [
          { id: 'payroll-processing-fees', name: 'Payroll Processing Fees', current: 286.52, prior: 341.73, type: 'expense' },
          { id: 'payroll-taxes-benefits', name: 'Payroll Taxes & Benefits', current: 2413.27, prior: 2684.01, type: 'expense',
            children: [
              { id: 'federal-unemployment', name: 'Federal Unemployment Insurance', current: 0, prior: 0, type: 'expense' },
              { id: 'fica', name: 'FICA Expense', current: 2093.27, prior: 2334.01, type: 'expense' },
              { id: 'state-unemployment', name: 'State Unemployment Insurance', current: 320, prior: 350, type: 'expense' },
            ]
          },
          { id: 'salaries-wages', name: 'Salaries & Wages', current: 14249.14, prior: 16221.94, type: 'expense',
            children: [
              { id: 'admin-marketing', name: 'Admin/Marketing', current: 4274.74, prior: 4866.58, type: 'expense' },
              { id: 'management', name: 'Management', current: 9974.4, prior: 11355.36, type: 'expense' },
            ]
          },
        ]
      },
      { id: 'direct-operating-costs', name: 'Direct Operating Costs', current: 21379.69, prior: 25018.45, type: 'expense',
        children: [
          { id: 'chace-depot-delivery', name: 'Chace Depot Delivery Fees', current: 0, prior: 0, type: 'expense' },
          { id: 'chace-royalty', name: 'Chace Royalty Fees', current: 1393.64, prior: 1214.36, type: 'expense' },
          { id: 'contract-services', name: 'Contract Service Companies', current: 1543.28, prior: 1398.76, type: 'expense',
            children: [
              { id: 'dishwashing-company', name: 'Dishwashing Company', current: 0, prior: 0, type: 'expense' },
              { id: 'garbage-removal', name: 'Garbage Removal', current: 850, prior: 750, type: 'expense' },
              { id: 'grease-removal', name: 'Grease Removal', current: 325, prior: 290.76, type: 'expense' },
              { id: 'pest-control', name: 'Pest Control', current: 368.28, prior: 358, type: 'expense' },
            ]
          },
          { id: 'credit-card-fees', name: 'Credit Card Fees', current: 3977.74, prior: 4615.28, type: 'expense' },
          { id: 'delivery-service-fees', name: 'Delivery Service Fees', current: 5241.57, prior: 5046.48, type: 'expense',
            children: [
              { id: 'classpass-fees', name: 'ClassPass Fees', current: 28.81, prior: 24.02, type: 'expense' },
              { id: 'doordash-fees', name: 'DoorDash Fees', current: 1185.71, prior: 1332.16, type: 'expense' },
              { id: 'ezcater-fees', name: 'ezCater Fees', current: 283.5, prior: 266.59, type: 'expense' },
              { id: 'fantuan-fees', name: 'Fantuan Fees', current: 32.36, prior: 19.94, type: 'expense' },
              { id: 'grubhub-fees', name: 'GrubHub Fees', current: 401.4, prior: 464.3, type: 'expense' },
              { id: 'hungrypanda-fees', name: 'HungryPanda Fees', current: 9.71, prior: 59.03, type: 'expense' },
              { id: 'grubhub-bogo', name: 'GrubHub - BOGO Promo', current: 0, prior: 0, type: 'expense' },
              { id: 'ubereats-bogo', name: 'UberEats - BOGO Promo', current: 0, prior: 0, type: 'expense' },
              { id: 'ubereats-mkt-ads', name: 'UberEats - Mkt/Ads Promo', current: 3300.08, prior: 2880.44, type: 'expense' },
            ]
          },
          { id: 'marketing-pr', name: 'Marketing & PR', current: 989.25, prior: 2098.35, type: 'expense',
            children: [
              { id: 'advertising-promo', name: 'Advertising and Promotion', current: 0, prior: 398.35, type: 'expense' },
              { id: 'branding', name: 'Branding', current: 0, prior: 0, type: 'expense' },
              { id: 'custom-packaging', name: 'Custom Packaging Design', current: 0, prior: 0, type: 'expense' },
              { id: 'photography', name: 'Photography', current: 0, prior: 200, type: 'expense' },
              { id: 'printing', name: 'Printing, Cutting, Laminating', current: 189.25, prior: 300, type: 'expense' },
              { id: 'social-media', name: 'Social Media', current: 800, prior: 1200, type: 'expense' },
              { id: 'website', name: 'Website', current: 0, prior: 0, type: 'expense' },
            ]
          },
          { id: 'repairs-maintenance', name: 'Repairs & Maintenance', current: 1150.28, prior: 1680.45, type: 'expense',
            children: [
              { id: 'kitchen-repairs', name: 'Kitchen Repairs', current: 650.28, prior: 980.45, type: 'expense' },
              { id: 'labor-repair', name: 'Labor, Repair/Maint (internal)', current: 300, prior: 400, type: 'expense' },
              { id: 'tools-materials', name: 'Tools & Materials', current: 200, prior: 300, type: 'expense' },
            ]
          },
          { id: 'restaurant-supplies', name: 'Restaurant/Kitchen Supplies', current: 7084.03, prior: 7965.46, type: 'expense',
            children: [
              { id: 'cleaning-supplies', name: 'Cleaning Supplies', current: 892.45, prior: 1045.32, type: 'expense' },
              { id: 'disposables', name: 'Disposables', current: 3245.18, prior: 3612.84, type: 'expense' },
              { id: 'linen', name: 'Linen', current: 425.6, prior: 512.4, type: 'expense' },
              { id: 'office-supplies', name: 'Office Supplies', current: 312.8, prior: 398.5, type: 'expense' },
              { id: 'smallware', name: 'Smallware', current: 1108, prior: 1246.4, type: 'expense' },
              { id: 'tools-equipment', name: 'Tools/Equipment/General', current: 850, prior: 900, type: 'expense' },
              { id: 'uniforms', name: 'Uniforms', current: 250, prior: 250, type: 'expense' },
            ]
          },
        ]
      },
      { id: 'general-admin', name: 'General & Administrative', current: 3870.86, prior: 4318.56, type: 'expense',
        children: [
          { id: 'expenses-misc', name: 'Expenses - Misc.', current: 485.35, prior: 762.18, type: 'expense',
            children: [
              { id: 'year-end-party', name: 'Annual Year End Party', current: 0, prior: 0, type: 'expense' },
              { id: 'bank-service-charges', name: 'Bank Service Charges', current: 85.35, prior: 112.18, type: 'expense' },
              { id: 'ground-transportation', name: 'Ground Transportation', current: 150, prior: 200, type: 'expense' },
              { id: 'meals-entertainment', name: 'Meals and Entertainment', current: 250, prior: 350, type: 'expense' },
              { id: 'over-short', name: 'Over/Short', current: 0, prior: 100, type: 'expense' },
            ]
          },
          { id: 'info-technology', name: 'Information Technology', current: 988.46, prior: 1124.58, type: 'expense',
            children: [
              { id: 'hardware', name: 'Hardware', current: 0, prior: 236.12, type: 'expense' },
              { id: 'pos-it-support', name: 'POS System Repair / IT Support', current: 488.46, prior: 388.46, type: 'expense' },
              { id: 'software', name: 'Software', current: 500, prior: 500, type: 'expense' },
            ]
          },
          { id: 'insurance-expense', name: 'Insurance Expense', current: 1892.23, prior: 1927.45, type: 'expense',
            children: [
              { id: 'disability-pfl', name: 'Disability / PFL', current: 192.23, prior: 227.45, type: 'expense' },
              { id: 'general-liability', name: 'General Liability Insurance', current: 900, prior: 900, type: 'expense' },
              { id: 'workers-comp', name: 'Workers Comp', current: 800, prior: 800, type: 'expense' },
            ]
          },
          { id: 'licenses-permits', name: 'Licenses & Permits', current: 125.82, prior: 145.35, type: 'expense',
            children: [
              { id: 'health-permit', name: 'Health Permit', current: 125.82, prior: 145.35, type: 'expense' },
              { id: 'liquor-license', name: 'Liquor License Tax', current: 0, prior: 0, type: 'expense' },
            ]
          },
          { id: 'professional-fees', name: 'Professional Fees', current: 379, prior: 359, type: 'expense',
            children: [
              { id: 'accounting', name: 'Accounting', current: 379, prior: 359, type: 'expense' },
            ]
          },
          { id: 'research-development', name: 'Research & Development', current: 0, prior: 0, type: 'expense' },
        ]
      },
      { id: 'occupancy', name: 'Occupancy', current: 17053.5, prior: 19305.08, type: 'expense',
        children: [
          { id: 'real-estate-taxes', name: 'Real Estate Taxes', current: 1857.65, prior: 3836.5, type: 'expense' },
          { id: 'rent', name: 'Rent', current: 12000, prior: 12400, type: 'expense' },
          { id: 'utilities', name: 'Utilities', current: 3195.85, prior: 3068.58, type: 'expense',
            children: [
              { id: 'electricity', name: 'Electricity', current: 2195.85, prior: 2068.58, type: 'expense' },
              { id: 'telephone-internet', name: 'Telephone & Internet', current: 500, prior: 500, type: 'expense' },
              { id: 'water-sewer', name: 'Water/Sewer', current: 500, prior: 500, type: 'expense' },
            ]
          },
        ]
      },
    ]
  },
  {
    id: 'net-income',
    name: 'Net Operating Income',
    current: 17722.37,
    prior: 28966.35,
    type: 'subtotal',
  }
];

// Variance analysis function - uses % of profit for accurate critical status
const analyzeVariance = (lineItem: PnLLineItem, netProfit: number): VarianceInfo => {
  const variance = lineItem.current - lineItem.prior;
  const variancePct = lineItem.prior !== 0 ? (variance / lineItem.prior) * 100 : 0;
  // Profit impact: how much does this variance eat into profit?
  const profitImpact = netProfit !== 0 ? Math.abs(variance / netProfit) * 100 : 0;

  const isExpense = lineItem.type === 'expense';
  const isPositiveChange = variance > 0;
  const isFavorable = isExpense ? !isPositiveChange : isPositiveChange;

  // Critical: variance exceeds 25% of profit OR (>15% line variance AND >$3,000)
  if (profitImpact > 25 || (Math.abs(variancePct) > 15 && Math.abs(variance) > 3000)) {
    return {
      level: isFavorable ? 'favorable' : 'critical',
      reason: `${isPositiveChange ? 'Up' : 'Down'} ${Math.abs(variancePct).toFixed(1)}% ($${Math.abs(variance).toLocaleString()}) • ${profitImpact.toFixed(0)}% of profit`,
      variance,
      variancePct
    };
  }

  // Attention: variance is 10-25% of profit OR >$2,000 impact
  if (profitImpact > 10 || Math.abs(variance) > 2000) {
    return {
      level: isFavorable ? 'favorable' : 'attention',
      reason: `${isPositiveChange ? 'Up' : 'Down'} ${Math.abs(variancePct).toFixed(1)}% ($${Math.abs(variance).toLocaleString()}) • ${profitImpact.toFixed(0)}% of profit`,
      variance,
      variancePct
    };
  }

  // Favorable check for improvements >5% of profit
  if (isFavorable && (profitImpact > 5 || Math.abs(variance) > 1000)) {
    return {
      level: 'favorable',
      reason: `${isPositiveChange ? 'Up' : 'Down'} ${Math.abs(variancePct).toFixed(1)}% ($${Math.abs(variance).toLocaleString()})`,
      variance,
      variancePct
    };
  }

  return { level: 'normal', reason: '', variance, variancePct };
};

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

// Count flagged items
const countFlaggedItems = (items: PnLLineItem[], netProfit: number): { critical: number; attention: number; favorable: number } => {
  let counts = { critical: 0, attention: 0, favorable: 0 };

  const countRecursive = (lineItems: PnLLineItem[]) => {
    lineItems.forEach(item => {
      const variance = analyzeVariance(item, netProfit);
      if (variance.level === 'critical') counts.critical++;
      else if (variance.level === 'attention') counts.attention++;
      else if (variance.level === 'favorable') counts.favorable++;
      if (item.children) countRecursive(item.children);
    });
  };

  countRecursive(items);
  return counts;
};

// Filter items recursively - keep parent if any child matches
const filterItemsByVariance = (items: PnLLineItem[], level: VarianceLevel, netProfit: number): PnLLineItem[] => {
  return items.reduce<PnLLineItem[]>((acc, item) => {
    const variance = analyzeVariance(item, netProfit);
    const itemMatches = variance.level === level;

    // Check if any children match
    const filteredChildren = item.children 
      ? filterItemsByVariance(item.children, level, netProfit)
      : [];

    // Include item if it matches OR if it has matching children
    if (itemMatches || filteredChildren.length > 0) {
      acc.push({
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : item.children
      });
    }

    return acc;
  }, []);
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

// Status Icon Component
function StatusIcon({ isOnTrack, size = 'sm' }: { isOnTrack: boolean; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center rounded-full flex-shrink-0",
        isOnTrack ? "text-emerald-600" : "text-red-600"
      )}
      title={isOnTrack ? "On track to goal" : "Not on track to goal"}
      aria-label={isOnTrack ? "On track" : "Not on track"}
    >
      {isOnTrack ? (
        <CheckCircle2 className={sizeClass} />
      ) : (
        <AlertTriangle className={sizeClass} />
      )}
    </span>
  );
}

// Health Snapshot Trend Chart Modal
interface TrendChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricTrendData | null;
}

function TrendChartModal({ isOpen, onClose, metric }: TrendChartModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!isOpen || !metric) return null;

  const data = metric.data;
  const currentMonth = data[data.length - 1];
  const lastMonth = data[data.length - 2];
  const firstMonth = data[0];
  const onTrack = isMetricOnTrack(metric);

  // Calculate MoM change
  const momChange = lastMonth 
    ? ((currentMonth.actual - lastMonth.actual) / lastMonth.actual * 100).toFixed(1)
    : '0';

  // Calculate 6-month change
  const sixMonthChange = ((currentMonth.actual - firstMonth.actual) / firstMonth.actual * 100).toFixed(1);

  // Format value based on unit type
  const formatValue = (value: number, isCurrency?: boolean) => {
    const useCurrency = isCurrency ?? metric.unit === 'currency';
    if (useCurrency) {
      return Math.abs(value) >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toLocaleString()}`;
    }
    return `${value.toFixed(1)}%`;
  };

  const formatFullValue = (value: number, isCurrency?: boolean) => {
    const useCurrency = isCurrency ?? metric.unit === 'currency';
    if (useCurrency) {
      return `$${value.toLocaleString()}`;
    }
    return `${value.toFixed(1)}%`;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm">
          <p className="font-semibold text-gray-900">{dataPoint.month} {dataPoint.year}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-gray-700">Actual: <span className="font-medium">{formatFullValue(dataPoint.actual)}</span></p>
            <p className="text-gray-500">Target: {formatFullValue(dataPoint.target)}</p>
            <p className={cn(
              "font-medium",
              metric.isInverse 
                ? (dataPoint.variance <= 0 ? "text-emerald-600" : "text-red-600")
                : (dataPoint.variance >= 0 ? "text-emerald-600" : "text-red-600")
            )}>
              {dataPoint.variance >= 0 ? '+' : ''}{metric.unit === 'currency' ? `$${dataPoint.variance.toLocaleString()}` : `${dataPoint.variance.toFixed(1)}pts`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 mx-4">
        {/* Header with Status */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <StatusIcon isOnTrack={onTrack} size="md" />
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">{metric.name} Trend</h2>
              <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-trend-modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Stats with Status */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
          <div className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Current ({currentMonth.month.substring(0, 3)})
            </p>
            <div className="flex items-center justify-center gap-2">
              <StatusIcon isOnTrack={onTrack} />
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(currentMonth.actual)}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Target: {formatValue(currentMonth.target)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              vs Last Month
            </p>
            <p className={cn(
              "text-2xl font-bold",
              metric.isInverse
                ? (Number(momChange) <= 0 ? "text-emerald-600" : "text-red-600")
                : (Number(momChange) >= 0 ? "text-emerald-600" : "text-red-600")
            )}>
              {Number(momChange) >= 0 ? '+' : ''}{momChange}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {lastMonth?.month.substring(0, 3)} → {currentMonth.month.substring(0, 3)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              6-Month Change
            </p>
            <p className={cn(
              "text-2xl font-bold",
              metric.isInverse
                ? (Number(sixMonthChange) <= 0 ? "text-emerald-600" : "text-red-600")
                : (Number(sixMonthChange) >= 0 ? "text-emerald-600" : "text-red-600")
            )}>
              {Number(sixMonthChange) >= 0 ? '+' : ''}{sixMonthChange}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {firstMonth.month.substring(0, 3)} → {currentMonth.month.substring(0, 3)}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Chart */}
          <div className="p-6 border-b border-gray-100">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => metric.unit === 'currency' ? `$${(value / 1000).toFixed(0)}k` : `${value}%`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#9ca3af" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke={onTrack ? "#10b981" : "#ef4444"}
                    strokeWidth={3}
                    dot={{ fill: onTrack ? '#10b981' : '#ef4444', strokeWidth: 0, r: 5 }}
                    activeDot={{ fill: onTrack ? '#10b981' : '#ef4444', strokeWidth: 0, r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drilldown Section */}
          {metric.drilldown && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('drilldown')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                data-testid="toggle-drilldown"
                aria-expanded={expandedSections.has('drilldown')}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-500 transition-transform",
                    expandedSections.has('drilldown') ? "" : "-rotate-90"
                  )} />
                  <span className="font-medium text-gray-900">{metric.drilldown.title}</span>
                  <span className="text-xs text-gray-500">({metric.drilldown.items.length} items)</span>
                </div>
                <span className="text-xs text-gray-500">Click to {expandedSections.has('drilldown') ? 'collapse' : 'expand'}</span>
              </button>

              <AnimatePresence>
                {expandedSections.has('drilldown') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left px-4 py-2 font-medium text-gray-500">Sub-Category</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-500">Actual</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-500">Target</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-500">% Revenue</th>
                              <th className="text-center px-4 py-2 font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {metric.drilldown.items.map((item) => (
                              <tr key={item.id} className="bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-900">{item.name}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                                  {metric.unit === 'currency' && item.actual >= 1000 
                                    ? `$${item.actual.toLocaleString()}`
                                    : `${item.actual.toFixed(1)}%`
                                  }
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-500">
                                  {metric.unit === 'currency' && item.target >= 1000 
                                    ? `$${item.target.toLocaleString()}`
                                    : `${item.target.toFixed(1)}%`
                                  }
                                </td>
                                <td className={cn(
                                  "px-4 py-2.5 text-right font-medium",
                                  item.isOnTrack ? "text-emerald-600" : "text-red-600"
                                )}>
                                  {item.variance >= 0 ? '+' : ''}{item.variancePct.toFixed(1)}%
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <StatusIcon isOnTrack={item.isOnTrack} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Monthly Data Table */}
          <div>
            <button
              onClick={() => toggleSection('monthly')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              data-testid="toggle-monthly-data"
              aria-expanded={expandedSections.has('monthly')}
            >
              <div className="flex items-center gap-2">
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  expandedSections.has('monthly') ? "" : "-rotate-90"
                )} />
                <span className="font-medium text-gray-900">Monthly Breakdown</span>
                <span className="text-xs text-gray-500">({data.length} months)</span>
              </div>
              <span className="text-xs text-gray-500">Click to {expandedSections.has('monthly') ? 'collapse' : 'expand'}</span>
            </button>

            <AnimatePresence>
              {expandedSections.has('monthly') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left px-4 py-2 font-medium text-gray-500">Month</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">Actual</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">Target</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">vs Target</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">MoM %</th>
                            <th className="text-center px-4 py-2 font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[...data].reverse().map((point, idx) => {
                            const prevPoint = data[data.length - 2 - idx];
                            const momPct = prevPoint 
                              ? ((point.actual - prevPoint.actual) / prevPoint.actual * 100).toFixed(1)
                              : null;
                            const pointOnTrack = metric.isInverse 
                              ? point.actual <= point.target
                              : point.actual >= point.target;
                            return (
                              <tr key={point.month} className="bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-900">{point.month} {point.year}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                                  {formatFullValue(point.actual)}
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-500">
                                  {formatFullValue(point.target)}
                                </td>
                                <td className={cn(
                                  "px-4 py-2.5 text-right font-medium",
                                  pointOnTrack ? "text-emerald-600" : "text-red-600"
                                )}>
                                  {point.variance >= 0 ? '+' : ''}{point.variancePct.toFixed(1)}%
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-500">
                                  {momPct ? `${Number(momPct) >= 0 ? '+' : ''}${momPct}%` : '—'}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <StatusIcon isOnTrack={pointOnTrack} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReleaseModal({ isOpen, onClose, data, onConfirm }: { isOpen: boolean, onClose: () => void, data: any, onConfirm: () => void }) {
   const [message, setMessage] = useState("Here is your P&L report for the period. Highlights included below.");
   const [scheduleDate, setScheduleDate] = useState("");
   const [scheduleTime, setScheduleTime] = useState("");

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[80vh] flex overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Left Col: Settings */}
            <div className="w-1/2 p-8 border-r border-gray-200 flex flex-col">
               <div className="mb-6">
                  <h2 className="font-serif text-2xl font-medium mb-2">Finalize Release</h2>
                  <p className="text-muted-foreground text-sm">Review the notification message before sending to the owner.</p>
               </div>

               <div className="space-y-6 flex-1">
                  <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Schedule Send At</label>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                           <input 
                              type="date" 
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-black focus:border-black outline-none"
                           />
                        </div>
                        <div className="relative">
                           <input 
                              type="time" 
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-black focus:border-black outline-none"
                           />
                        </div>
                     </div>
                     <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 
                        {scheduleDate && scheduleTime 
                           ? `Scheduled for ${new Date(scheduleDate).toLocaleDateString()} at ${scheduleTime}`
                           : "Leave blank to send immediately"}
                     </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Notification Message</label>
                     <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg focus:ring-black focus:border-black p-3 min-h-[120px] shadow-sm"
                        placeholder="Add a personal message..."
                     />
                     <p className="text-xs text-muted-foreground mt-2">This message will appear in the email body and push notification.</p>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                  <button 
                     onClick={onClose}
                     className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={onConfirm}
                     className="flex-1 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                     {scheduleDate && scheduleTime ? (
                        <>Schedule Release <Calendar className="h-3 w-3" /></>
                     ) : (
                        <>Send & Release <Send className="h-3 w-3" /></>
                     )}
                  </button>
               </div>
            </div>

            {/* Right Col: Preview */}
            <div className="w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  Live Preview
               </div>

               {/* Email Card Preview */}
               <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 transform scale-95 origin-center">
                   {/* Email Header */}
                   <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-white text-black rounded-full flex items-center justify-center font-serif font-bold text-xs">M</div>
                        <span className="font-medium text-sm">Munch Insights</span>
                     </div>
                     <span className="text-xs text-gray-400">Now</span>
                   </div>

                   <div className="p-6">
                     <div className="mb-4">
                        <h3 className="text-lg font-serif font-medium text-gray-900 mb-1">P&L Ready: {data.period}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                     </div>

                     <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Executive Summary</div>
                        <p className="text-sm font-medium text-gray-900 leading-snug mb-3">{data.headline}</p>

                        <div className="space-y-2">
                           {data.insights.slice(0, 2).map((insight: any) => (
                              <div key={insight.id} className="flex gap-2 items-start">
                                 <div className={cn(
                                    "mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    insight.tag === "Positive" ? "bg-emerald-500" : 
                                    insight.tag === "Negative" ? "bg-red-500" : "bg-gray-400"
                                 )} />
                                 <p className="text-xs text-gray-600 leading-snug line-clamp-2">{insight.text}</p>
                              </div>
                           ))}
                           {data.insights.length > 2 && (
                              <p className="text-[10px] text-muted-foreground pl-3.5">+ {data.insights.length - 2} more insights</p>
                           )}
                        </div>
                     </div>

                     <button className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium">
                        View Full Report
                     </button>
                   </div>
               </div>
            </div>

         </div>
      </div>
   );
}

function InsightCard({ insight, onDelete, onUpdate }: { insight: any, onDelete: () => void, onUpdate: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(insight.text);

  return (
    <div className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all relative">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block",
            insight.tag === "Positive" ? "bg-emerald-100 text-emerald-700" :
            insight.tag === "Negative" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-700"
          )}>
            {insight.tag}
          </span>
          {isEditing ? (
            <textarea 
              className="w-full text-sm border-gray-300 rounded-md focus:ring-black focus:border-black p-2 min-h-[80px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => { setIsEditing(false); onUpdate(text); }}
              autoFocus
            />
          ) : (
            <p 
              className="text-sm text-gray-800 leading-relaxed cursor-text hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {text}
            </p>
          )}
        </div>
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function GoalProgress({ label, current, target, unit = "%", inverted = false, onTrendClick }: { label: string, current: number, target: number, unit?: string, inverted?: boolean, onTrendClick?: () => void }) {
  const progress = Math.min((current / target) * 100, 100);
  const isGood = inverted ? current <= target : current >= target;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-all">
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif">{current}{unit}</span>
            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              / {target}{unit} Goal
              {onTrendClick && (
                <button
                  onClick={onTrendClick}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  title={`View ${label} trend`}
                  data-testid={`trend-btn-${label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
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

function VisualizationCard({ title, children, active, onToggle }: { title: string, children: React.ReactNode, active: boolean, onToggle: () => void }) {
  return (
    <div className={cn(
      "border rounded-xl transition-all duration-300 overflow-hidden",
      active ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-200 opacity-60 grayscale"
    )}>
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-sm text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{active ? "Included" : "Excluded"}</span>
          <button 
            onClick={onToggle}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              active ? "bg-black" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200",
              active ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>
      <div className="p-4 h-64 flex items-center justify-center">
        {children}
      </div>
    </div>
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

// Action card type for shopping cart
type ActionItem = {
  id: string;
  title: string;
  description: string;
  impact: number;
  category: "cogs" | "labor" | "sales" | "ops";
  icon: "truck" | "clock" | "users" | "trending";
};

// Available actions that can be added to cart
const availableActions: ActionItem[] = [
  { id: "switch-avocado", title: "Switch Avocado Supplier", description: "GreenLeaf offers $48/case vs current $62", impact: 600, category: "cogs", icon: "truck" },
  { id: "adjust-delivery", title: "Adjust Delivery Window", description: "Move Sysco to 8-10AM to avoid overtime", impact: 350, category: "ops", icon: "clock" },
  { id: "lock-scheduling", title: "Lock Mid-Shift Cuts", description: "Make Tue/Wed staffing changes permanent", impact: 480, category: "labor", icon: "users" },
  { id: "expand-brunch", title: "Expand Brunch Menu", description: "Add 2 new benedict options for weekends", impact: 800, category: "sales", icon: "trending" },
  { id: "lime-vendor", title: "Negotiate Lime Pricing", description: "Request volume discount from current vendor", impact: 180, category: "cogs", icon: "truck" },
  { id: "bonus-sarah", title: "Approve Sarah's Bonus", description: "Send $500 efficiency bonus for Q4", impact: 0, category: "labor", icon: "users" },
];

// Action Card Component
function ActionCard({ action, isInCart, onToggle }: { action: ActionItem; isInCart: boolean; onToggle: () => void }) {
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

// --- Floating Assistant Bar (Digits-inspired) ---
type FloatingMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: boolean;
};

const pnlQuickActions = [
  { id: "1", label: "Labor Variance", icon: "labor" },
  { id: "2", label: "COGS Analysis", icon: "cogs" },
  { id: "3", label: "Margin Trends", icon: "margin" },
];

const pnlInsightPrompts = [
  { id: "1", question: "Why is labor running 1.5pts above target this month?", category: "variance" },
  { id: "2", question: "What's driving the improvement in net margin vs last quarter?", category: "trend" },
  { id: "3", question: "Which expense categories need attention before month-end?", category: "action" },
  { id: "4", question: "How does our prime cost compare to industry benchmarks?", category: "benchmark" },
];

function FloatingAssistantBar({ triggerQuery }: { triggerQuery?: string | null }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [processedTrigger, setProcessedTrigger] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (triggerQuery && triggerQuery !== processedTrigger) {
      setIsExpanded(true);
      handleSend(triggerQuery.split(" ").slice(0, -1).join(" "));
      setProcessedTrigger(triggerQuery);
    }
  }, [triggerQuery]);

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  const generateMockResponse = (question: string): { content: string; showArtifact: boolean } => {
    const q = question.toLowerCase();
    
    if (q.includes('labor') && (q.includes('high') || q.includes('above') || q.includes('variance') || q.includes('why'))) {
      return {
        content: "Labor costs are running 1.5 points above target this month primarily due to:\n\n• **Holiday overtime**: 142 hours vs 80 budgeted, driven by Thanksgiving week scheduling\n• **Training costs**: New BOH staff onboarding added $1,200 in extra hours\n• **Server/Plater overtime**: Up $612 from last month\n\nTo reduce labor costs, consider locking in the Tue/Wed mid-shift cuts that saved $2,400 last month.",
        showArtifact: true
      };
    }
    
    if (q.includes('cogs') || q.includes('food cost') || q.includes('cost of goods')) {
      return {
        content: "Your COGS is at 31% of revenue, slightly above the 30% target:\n\n• **Food Cost**: $5,185 (up 5% from last month)\n• **Beverage Cost**: $2,393 (doubled due to new wine program)\n• **Dairy**: Up 22% - consider switching suppliers\n\nGreenLeaf offers avocados at $48/case vs your current $62, potentially saving $600/month.",
        showArtifact: true
      };
    }
    
    if (q.includes('margin') || q.includes('profit') || q.includes('net income') || q.includes('bottom line')) {
      return {
        content: "Net Operating Income is $17,722 (13.3% of revenue), down from $28,966 prior period:\n\n• **Revenue**: Up 4.2% to $133,042 — strong DoorDash growth (+$2,100)\n• **COGS**: 31% vs 30% target — slight overage\n• **Labor efficiency**: Improved from 35% to 32%\n\nThe margin compression is mainly from one-time online delivery fee investments ($3,134) that will pay back over time.",
        showArtifact: false
      };
    }
    
    if (q.includes('revenue') || q.includes('sales') || q.includes('income')) {
      return {
        content: "Revenue for September 2025 was $133,042, up 4.2% vs prior period:\n\n• **Dine-in**: $89,650 (67% of revenue)\n• **Delivery**: $28,418 (21%) — DoorDash up 35%\n• **Takeout**: $14,974 (11%)\n\nDelivery channel is the fastest growing segment. Consider optimizing DoorDash menu pricing to improve margins.",
        showArtifact: false
      };
    }
    
    if (q.includes('prime cost') || q.includes('benchmark') || q.includes('industry') || q.includes('compare')) {
      return {
        content: "Your Prime Cost (COGS + Labor) is at 54.2%, which compares favorably:\n\n• **Your Restaurant**: 54.2%\n• **Texas Average**: 59.5%\n• **National Average**: 60.0%\n\nYou're outperforming benchmarks by 5-6 points. Key advantages: efficient BOH staffing and strong vendor relationships.",
        showArtifact: false
      };
    }
    
    if (q.includes('expense') || q.includes('operating') || q.includes('overhead')) {
      return {
        content: "Operating Expenses total $59,650 (44.8% of revenue):\n\n• **Payroll & Benefits**: $16,949 (25%)\n• **Direct Operating**: $21,380 (32%) — includes credit card fees\n• **Occupancy**: $17,054 (26%) — rent is stable\n• **G&A**: $3,871 (6%)\n\nCredit card fees at $3,978 are high — consider negotiating processor rates or incentivizing cash payments.",
        showArtifact: false
      };
    }
    
    if (q.includes('action') || q.includes('improve') || q.includes('recommend') || q.includes('what should')) {
      return {
        content: "Based on your September P&L, here are the top opportunities:",
        showArtifact: true
      };
    }
    
    if (q.includes('overtime') || q.includes('hours')) {
      return {
        content: "Overtime ran high this month: 142 hours vs 80 budgeted (+$3,200 impact):\n\n• **Dishwasher OT**: $278 (down from $384)\n• **Server/Plater OT**: $58 (down significantly from $670)\n• **Holiday weeks**: Thanksgiving drove most of the excess\n\nConsider adjusting Sysco delivery windows to 8-10AM to avoid prep overtime.",
        showArtifact: true
      };
    }
    
    return {
      content: "I can help you understand your P&L data. Here are some things I can explain:\n\n• **Labor costs** and overtime analysis\n• **COGS breakdown** and food cost percentages\n• **Revenue trends** by channel (dine-in, delivery, takeout)\n• **Operating expenses** and where to cut costs\n• **Prime cost benchmarks** vs industry standards\n\nWhat would you like to know more about?",
      showArtifact: false
    };
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setIsExpanded(true);

    const userMsg: FloatingMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => inputRef.current?.focus(), 50);

    // Simulate thinking time (1-2 seconds for realism)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const response = generateMockResponse(text);
    
    const assistantMsg: FloatingMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      artifact: response.showArtifact
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <AnimatePresence mode="wait">
      {!isExpanded ? (
        <motion.button
          key="fab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 bg-black rounded-full shadow-xl flex items-center justify-center cursor-pointer overflow-hidden"
          data-testid="floating-chat-icon"
          title="Open Munch Assistant"
        >
          <img src={munchCatIcon} alt="Munch" className="h-10 w-10 object-contain -ml-0.5" />
        </motion.button>
      ) : (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/10 z-40"
            onClick={handleCollapse}
          />
          <motion.div 
            key="panel"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "calc(100vh - 100px)" }}
            data-testid="floating-assistant-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  <img src="/src/assets/munch-logo.png" alt="Munch" className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">Munch Assistant</h3>
                  <p className="text-xs text-gray-500">Build your action plan</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button 
                    onClick={handleNewChat}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    title="Clear chat"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={handleCollapse}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
              style={{ maxHeight: "450px" }}
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
                      
                      {/* Action Cards */}
                      {msg.artifact && (
                        <div className="space-y-2 mt-3">
                          {[
                            { id: "switch-avocado", title: "Switch Avocado Supplier", desc: "GreenLeaf offers $48/case vs current $62", impact: 600, icon: "arrow", color: "amber" },
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
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Ask me anything about your P&L</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
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
                  data-testid="input-floating-chat"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Side Panel Assistant Component ---
function SidePanelAssistant({ onClose, triggerQuery }: { onClose: () => void; triggerQuery?: string | null }) {
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [processedTrigger, setProcessedTrigger] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (triggerQuery && triggerQuery !== processedTrigger) {
      handleSend(triggerQuery.split(" ").slice(0, -1).join(" "));
      setProcessedTrigger(triggerQuery);
    }
  }, [triggerQuery]);

  const handleSend = async (text: string) => {
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

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const response = generateMockResponse(text);
    
    const assistantMsg: FloatingMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      artifact: response.showArtifact
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
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
          <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
            <Sparkles className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">Munch Assistant</h3>
            <p className="text-xs text-gray-500">Build your action plan</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button 
              onClick={handleNewChat}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              title="Clear chat"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

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
                
                {/* Action Cards */}
                {msg.artifact && (
                  <div className="space-y-2 mt-3">
                    {[
                      { id: "switch-avocado", title: "Switch Avocado Supplier", desc: "GreenLeaf offers $48/case vs current $62", impact: 600, icon: "arrow", color: "amber" },
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
    </div>
  );
}

// --- Chat Component for Owner View ---
function OwnerChat({ isOpen, onClose, triggerQuery }: { isOpen: boolean; onClose: () => void; triggerQuery?: string | null }) {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; actions?: string[] }[]>([]);
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

    if (lowerText.includes("food cost") || lowerText.includes("produce") || lowerText.includes("avocados") || lowerText.includes("cogs") || lowerText.includes("limes")) {
       responseText = "I analyzed the **Produce** category:\n\n• **Avocados**: $45 → $62 (+37%)\n• **Limes**: $32 → $41 (+28%)\n\nThese items caused $980 in variance. Here are actions you can add to your plan:";
       suggestedActions = ["switch-avocado", "lime-vendor"];
    } else if (lowerText.includes("labor") || lowerText.includes("efficiency") || lowerText.includes("scheduling")) {
       responseText = "**Labor Analysis:**\n\nLabor % improved from 35% → 32%!\n\n**Key Win**: Mid-shift cuts on Tue/Wed saved 40 hours.\n**Manager**: Sarah earned her efficiency bonus.\n\nHere are actions to lock in these wins:";
       suggestedActions = ["lock-scheduling", "bonus-sarah"];
    } else if (lowerText.includes("overtime")) {
        responseText = "**Overtime Breakdown:**\n\n• Kitchen Prep: 12 hours ($350 impact)\n• Cause: Late Sysco delivery on 10/14\n\nHere's how to prevent this next month:";
        suggestedActions = ["adjust-delivery"];
    } else if (lowerText.includes("sales") || lowerText.includes("brunch")) {
       responseText = "**Sales Insight:**\n\nWeekend Brunch is up 12% YoY!\n\n**Top Item**: Smoked Salmon Benedict (+40 units)\n**Upsells**: 18% Mimosa attach rate = $1,200 extra\n\nCapitalize on this momentum:";
       suggestedActions = ["expand-brunch"];
    } else if (lowerText.includes("email")) {
       responseText = "I'll draft that email for you:\n\n---\n\n**Subject**: Great work on October!\n\nTeam,\n\nI'm thrilled to share that we beat our efficiency goals this month. Labor costs dropped 6% thanks to smart scheduling. Let's keep it up!\n\nBest,\nOwner\n\n---\n\n*Email ready to send via your preferred method.*";
       suggestedActions = [];
    } else {
       responseText = "Here are some suggested improvements based on your October report:";
       suggestedActions = ["switch-avocado", "adjust-delivery", "lock-scheduling"];
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

// --- Main Page Component ---

export default function PnlRelease() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Check view mode from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get("view");
  const isOwnerView = viewParam === "owner" || viewParam === "gm" || viewParam === "chef";
  const urlRole = viewParam as "owner" | "gm" | "chef" | null;

  // State
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [activeTab, setActiveTab] = useState<"detailed" | "curated" | "pnl">("curated");
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

  // Action Items State
  const [actionItems, setActionItems] = useState([
    { id: "ot-policy", title: "Review OT policy — 142 hours is unsustainable", owner: "GM", impact: "$1,500/mo potential", priority: "high", completed: false, completedAt: null as Date | null },
    { id: "delivery-commission", title: "Renegotiate delivery commission with DoorDash", owner: "Owner", impact: "$400/mo potential", priority: "medium", completed: false, completedAt: null as Date | null },
    { id: "hvac-repair", title: "Investigate HVAC repair — one-time or recurring?", owner: "GM", impact: "Budgeting clarity", priority: "low", completed: false, completedAt: null as Date | null },
    { id: "produce-pricing", title: "Review produce supplier pricing — avocado costs up 37%", owner: "Executive Chef", impact: "$800/mo potential", priority: "medium", completed: false, completedAt: null as Date | null },
  ]);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionTitle, setEditingActionTitle] = useState("");
  const [showCompletedActions, setShowCompletedActions] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  const toggleActionComplete = (id: string) => {
    setActionItems(prev => prev.map(item => {
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
      setActionItems(prev => prev.map(item => 
        item.id === editingActionId ? { ...item, title: editingActionTitle.trim() } : item
      ));
    }
    setEditingActionId(null);
    setEditingActionTitle("");
  };

  const activeActions = actionItems.filter(item => !item.completed);
  const completedActions = actionItems.filter(item => item.completed);

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
    const defaultRecipient = owner.toLowerCase().replace(/\s+/g, '') + "@restaurant.com";
    setAssignModal({
      isOpen: true,
      actionId,
      actionTitle,
      recipients: [defaultRecipient],
      newEmail: "",
      subject: `Action Item: ${actionTitle}`,
      message: ""
    });
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
    closeAssignModal();
  };

  // Initialize role from URL param if viewing as owner/gm/chef, otherwise default to owner
  const [selectedRole, setSelectedRole] = useState<"owner" | "gm" | "chef">(urlRole || "owner");
  const [healthComparisonPeriod, setHealthComparisonPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  
  // GM Time Range state (persists when switching locations)
  const [gmTimeRange, setGmTimeRange] = useState<"today" | "week" | "month" | "year">("today");
  
  // Chef Time Range state for Ticket Time Performance
  const [chefTimeRange, setChefTimeRange] = useState<"today" | "week" | "month" | "year">("today");
  
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
    const metric = healthSnapshotTrendData.find(m => m.id === metricId);
    if (metric) {
      setTrendModalMetric(metric);
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

  // --- Owner View (Customer Facing) ---
  if (isOwnerView) {
     return (
        <Layout>
           <div className="min-h-screen bg-gray-50 flex overflow-hidden relative">

              {/* Collapsed Sidebar Toggle Tab - attached to top right of left sidebar */}
              {archiveSidebarCollapsed && (
                 <button
                    onClick={toggleArchiveSidebar}
                    style={{ left: isLayoutSidebarHovered ? 256 : 64 }}
                    className="fixed top-24 z-30 bg-white border border-l-0 border-gray-200 rounded-r-lg shadow-md px-1.5 py-3 hover:bg-gray-50 transition-all duration-500 ease-in-out"
                    data-testid="expand-archive-tab"
                 >
                    <div className="flex flex-col items-center gap-1.5">
                       <ChevronRight className="h-4 w-4 text-gray-400" />
                       <span className="text-[10px] font-medium text-gray-500 [writing-mode:vertical-rl] rotate-180">Archive</span>
                    </div>
                 </button>
              )}

              {/* Left Navigation (Google Docs Style) - Resizable */}
              <div 
                 className={cn(
                    "bg-white border-r border-gray-200 hidden lg:flex flex-col h-full overflow-hidden transition-all duration-200 relative",
                    archiveSidebarCollapsed && "w-0 border-r-0"
                 )}
                 style={{ width: archiveSidebarCollapsed ? 0 : archiveSidebarWidth }}
              >
                 {/* Sidebar Content */}
                 <div className="p-6 overflow-y-auto flex-1" style={{ minWidth: archiveMinWidth }}>
                    <div className="flex items-center justify-between mb-4">
                       <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Archive</h2>
                       <button
                          onClick={toggleArchiveSidebar}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          data-testid="collapse-archive-btn"
                       >
                          <ChevronLeft className="h-4 w-4" />
                       </button>
                    </div>
                    <div className="space-y-6">
                       {navigationYears.map((group) => (
                          <div key={group.year}>
                             <h3 className="text-sm font-serif font-bold text-gray-900 mb-2">{group.year}</h3>
                             <div className="space-y-1">
                                {group.months.map((m) => {
                                   const isCurrent = group.year === 2025 && m.name === "September";
                                   const allGoalsMet = m.goalsMet === m.totalGoals;
                                   const mostGoalsMet = m.goalsMet >= 3;

                                   return (
                                      <button 
                                         key={m.name}
                                         className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                            isCurrent ? "bg-emerald-50 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                                         )}
                                      >
                                         <span>{m.name}</span>
                                         <div className="flex items-center gap-1.5">
                                            {allGoalsMet ? (
                                               <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 rounded text-[10px] font-medium text-emerald-700">
                                                  <Trophy className="h-3 w-3" />
                                                  {m.goalsMet}/{m.totalGoals}
                                               </div>
                                            ) : mostGoalsMet ? (
                                               <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded text-[10px] font-medium text-blue-600">
                                                  {m.goalsMet}/{m.totalGoals}
                                               </div>
                                            ) : (
                                               <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-500">
                                                  {m.goalsMet}/{m.totalGoals}
                                               </div>
                                            )}
                                         </div>
                                      </button>
                                   );
                                })}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Resize Handle */}
                 <div
                    onMouseDown={handleArchiveMouseDown}
                    className={cn(
                       "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-10",
                       isResizingArchive && "bg-blue-400"
                    )}
                    data-testid="archive-resize-handle"
                 />
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex justify-center overflow-y-auto">
                 <div className="w-full max-w-4xl bg-white shadow-sm border-x border-gray-200 min-h-screen pb-32">
                    {/* Header - Compact sticky header */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-8 py-3 z-10">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <button onClick={() => setLocation("/insight/home")} className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                             </button>
                             <div>
                                <h1 className="font-serif text-xl font-bold text-gray-900">{period} Report</h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                   {locationName} <span className="w-1 h-1 rounded-full bg-gray-300" /> Prepared by Accountant
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             {/* Role Toggle Pills - Compact */}
                             <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button 
                                   data-testid="button-owner-role-owner"
                                   onClick={() => { setSelectedRole("owner"); setLocation("/finance/pnl-release?view=owner"); }}
                                   className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", selectedRole === "owner" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                                >
                                   Owner
                                </button>
                                <button 
                                   data-testid="button-owner-role-gm"
                                   onClick={() => { setSelectedRole("gm"); setLocation("/finance/pnl-release?view=gm"); }}
                                   className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", selectedRole === "gm" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                                >
                                   GM
                                </button>
                                <button 
                                   data-testid="button-owner-role-chef"
                                   onClick={() => { setSelectedRole("chef"); setLocation("/finance/pnl-release?view=chef"); }}
                                   className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", selectedRole === "chef" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                                >
                                   Chef
                                </button>
                             </div>
                             <Popover>
                               <PopoverTrigger asChild>
                                 <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full">
                                    <Download className="h-5 w-5" />
                                 </button>
                               </PopoverTrigger>
                               <PopoverContent className="w-48 p-1" align="end">
                                 <div className="grid gap-1">
                                   <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-md transition-colors">
                                     <File className="h-4 w-4 text-red-500" />
                                     <span>Download PDF</span>
                                   </button>
                                   <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-md transition-colors">
                                     <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                     <span>Download Excel</span>
                                   </button>
                                 </div>
                               </PopoverContent>
                             </Popover>
                          </div>
                       </div>

                       {/* View Toggle Tabs - matches accounting/pnl exactly */}
                       <div className="px-6 flex gap-1 border-t border-gray-100 mt-2">
                          <button
                             data-testid="tab-owner-detailed-view"
                             onClick={() => setOwnerViewTab("detailed")}
                             className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                ownerViewTab === "detailed"
                                   ? "border-black text-gray-900"
                                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                             )}
                          >
                             <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Detailed View
                             </div>
                          </button>
                          <button
                             data-testid="tab-owner-curated-view"
                             onClick={() => setOwnerViewTab("curated")}
                             className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                ownerViewTab === "curated"
                                   ? "border-black text-gray-900"
                                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                             )}
                          >
                             <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Curated View
                             </div>
                          </button>
                       </div>
                    </div>

                    {/* Curated View Content */}
                    {ownerViewTab === "curated" && (
                    <>
                    {/* First-time user hint */}
                    {!curatedPrefs.hasSeenHint && (
                       <div className="mx-8 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Lightbulb className="h-4 w-4 text-blue-600" />
                             <p className="text-sm text-blue-800">
                                This view is customized for your role. You can change it anytime using the <strong>Customize</strong> button.
                             </p>
                          </div>
                          <button 
                             onClick={dismissHint}
                             className="text-blue-600 hover:text-blue-800 p-1"
                             data-testid="button-dismiss-hint-owner"
                          >
                             <X className="h-4 w-4" />
                          </button>
                       </div>
                    )}

                    {/* Role Description Banner with Customize Button - matches accounting/pnl */}
                    <div className="px-8 pt-4">
                       <div className={cn(
                          "rounded-xl p-4 flex items-center gap-3",
                          selectedRole === "owner" ? "bg-blue-50 border border-blue-200" : 
                          selectedRole === "gm" ? "bg-purple-50 border border-purple-200" : 
                          "bg-orange-50 border border-orange-200"
                       )}>
                          <div className={cn(
                             "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0",
                             selectedRole === "owner" ? "bg-blue-500" : 
                             selectedRole === "gm" ? "bg-purple-500" : 
                             "bg-orange-500"
                          )}>
                             {selectedRole === "owner" ? "O" : selectedRole === "gm" ? "GM" : "EC"}
                          </div>
                          <div className="flex-1">
                             <h3 className={cn(
                                "font-medium",
                                selectedRole === "owner" ? "text-blue-900" : 
                                selectedRole === "gm" ? "text-purple-900" : 
                                "text-orange-900"
                             )}>
                                {selectedRole === "owner" ? "Owner View" : selectedRole === "gm" ? "General Manager View" : "Executive Chef View"}
                             </h3>
                             <p className={cn(
                                "text-sm",
                                selectedRole === "owner" ? "text-blue-700" : 
                                selectedRole === "gm" ? "text-purple-700" : 
                                "text-orange-700"
                             )}>
                                {selectedRole === "owner" ? "Full access to all financial data and insights" : 
                                 selectedRole === "gm" ? "Focus on FOH labor, operations, and overall revenue performance" : 
                                 "Focus on COGS, BOH labor, and kitchen operations"}
                             </p>
                          </div>

                          {/* Customize View Button */}
                          <div ref={curatedFilterRef} className="relative flex-shrink-0">
                             <button 
                                data-testid="button-customize-view-owner"
                                onClick={() => setShowCuratedFilterDropdown(!showCuratedFilterDropdown)}
                                className={cn(
                                   "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                                   selectedRole === "owner" ? "bg-white/80 border-blue-200 hover:bg-white text-blue-900" :
                                   selectedRole === "gm" ? "bg-white/80 border-purple-200 hover:bg-white text-purple-900" :
                                   "bg-white/80 border-orange-200 hover:bg-white text-orange-900",
                                   showCuratedFilterDropdown && "bg-white shadow-sm"
                                )}
                             >
                                <Filter className="h-4 w-4" />
                                Customize
                                {activeFilters.length < filterOptions.length && (
                                   <span className={cn(
                                      "text-xs px-1.5 py-0.5 rounded-full",
                                      selectedRole === "owner" ? "bg-blue-100 text-blue-700" :
                                      selectedRole === "gm" ? "bg-purple-100 text-purple-700" :
                                      "bg-orange-100 text-orange-700"
                                   )}>
                                      {activeFilters.length}/{filterOptions.length}
                                   </span>
                                )}
                             </button>

                             {/* Filter Dropdown */}
                             {showCuratedFilterDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                                   <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                      <span className="text-sm font-semibold text-gray-900">Show Insights</span>
                                      <button
                                         data-testid="button-reset-filters-owner"
                                         onClick={resetToRoleDefaults}
                                         className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                         Restore defaults
                                      </button>
                                   </div>
                                   <div className="max-h-80 overflow-y-auto p-2">
                                      {Object.entries(
                                         filterOptions.reduce((acc, opt) => {
                                            if (!acc[opt.group]) acc[opt.group] = [];
                                            acc[opt.group].push(opt);
                                            return acc;
                                         }, {} as Record<string, CuratedFilterOption[]>)
                                      ).map(([group, options]) => (
                                         <div key={group} className="mb-3 last:mb-0">
                                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group}</div>
                                            {options.map(opt => (
                                               <label 
                                                  key={opt.id}
                                                  className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                               >
                                                  <input
                                                     type="checkbox"
                                                     checked={isFilterEnabled(opt.id)}
                                                     onChange={() => toggleCuratedFilter(opt.id)}
                                                     className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                     data-testid={`checkbox-filter-owner-${opt.id}`}
                                                  />
                                                  <span className="text-sm text-gray-700">{opt.label}</span>
                                               </label>
                                            ))}
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="p-8 space-y-10">

                       {/* Executive Summary Cards - Owner Only */}
                       {selectedRole === "owner" && (
                       <section data-testid="executive-summary-section">
                          <h2 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <TrendingUp className="h-5 w-5 text-gray-600" />
                             Executive Summary
                          </h2>
                          
                          {/* Financial Health Card - Primary */}
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-6">
                             <div className="flex items-start justify-between">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-emerald-700 uppercase tracking-wide">Financial Health</span>
                                      <div className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                         🟢 HEALTHY
                                      </div>
                                   </div>
                                   <div className="flex items-baseline gap-2 mt-2">
                                      <span className="text-5xl font-bold text-gray-900">82</span>
                                      <span className="text-lg text-gray-500">/100</span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="flex items-center gap-1 text-emerald-600">
                                      <TrendingUp className="h-4 w-4" />
                                      <span className="text-sm font-medium">+5 pts</span>
                                   </div>
                                   <span className="text-xs text-gray-500">vs prior period</span>
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
                                      <span className="text-xl font-bold text-gray-900">85</span>
                                      <span className="text-xs text-emerald-600">↑</span>
                                   </div>
                                   <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                                   </div>
                                </div>
                                <div className="bg-white/60 rounded-lg p-3">
                                   <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-500">Efficiency</span>
                                      <span className="text-xs text-gray-400">35%</span>
                                   </div>
                                   <div className="flex items-baseline gap-1">
                                      <span className="text-xl font-bold text-gray-900">78</span>
                                      <span className="text-xs text-amber-500">→</span>
                                   </div>
                                   <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '78%' }} />
                                   </div>
                                </div>
                                <div className="bg-white/60 rounded-lg p-3">
                                   <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-500">Stability</span>
                                      <span className="text-xs text-gray-400">25%</span>
                                   </div>
                                   <div className="flex items-baseline gap-1">
                                      <span className="text-xl font-bold text-gray-900">84</span>
                                      <span className="text-xs text-emerald-600">↑</span>
                                   </div>
                                   <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '84%' }} />
                                   </div>
                                </div>
                             </div>
                             
                             {/* CFO Narrative */}
                             <div className="mt-4 p-3 bg-white/80 rounded-lg border border-emerald-100">
                                <div className="flex items-start gap-2">
                                   <Lightbulb className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                   <div className="text-sm text-gray-700">
                                      <span className="font-medium text-gray-900">CFO Insight:</span> Strong profitability driven by improved labor efficiency (+3pts). Prime cost held at 62%, slightly above target. Revenue growth of 3.7% provides stability cushion.
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Summary Cards Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                             {/* Income Card */}
                             <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Income</span>
                                   <DollarSign className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">$124,500</div>
                                <div className="flex items-center gap-1 mt-1">
                                   <TrendingUp className="h-3 w-3 text-emerald-600" />
                                   <span className="text-xs font-medium text-emerald-600">+3.7%</span>
                                   <span className="text-xs text-gray-500">vs prior</span>
                                </div>
                             </div>

                             {/* Marketing Spend Card */}
                             <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marketing</span>
                                   <Target className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">$3,200</div>
                                <div className="flex items-center gap-1 mt-1">
                                   <span className="text-xs font-medium text-gray-600">2.6%</span>
                                   <span className="text-xs text-gray-500">of revenue</span>
                                </div>
                             </div>

                             {/* Operating Expenses Card */}
                             <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Op. Expenses</span>
                                   <CreditCard className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">$44,500</div>
                                <div className="flex items-center gap-1 mt-1">
                                   <span className="text-xs font-medium text-amber-600">35.7%</span>
                                   <span className="text-xs text-gray-500">of revenue</span>
                                </div>
                             </div>

                             {/* Growth Card */}
                             <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Growth</span>
                                   <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="text-2xl font-bold text-emerald-600">↑ Growing</div>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                   <span className="text-xs font-medium text-emerald-600">+3.7%</span>
                                   <span className="text-xs text-gray-500">revenue YoY</span>
                                </div>
                             </div>
                          </div>

                          {/* Second Row - Owner Only Cards */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                             {/* Cash Flow Card */}
                             <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cash Flow</span>
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">OWNER ONLY</span>
                                   </div>
                                   <Wallet className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between">
                                   <div>
                                      <div className="text-xl font-bold text-gray-900">$48,200</div>
                                      <div className="text-xs text-gray-500">Current balance</div>
                                   </div>
                                   <div className="text-right">
                                      <div className="flex items-center gap-1 justify-end">
                                         <TrendingUp className="h-3 w-3 text-emerald-600" />
                                         <span className="text-sm font-medium text-emerald-600">+$8,450</span>
                                      </div>
                                      <div className="text-xs text-gray-500">Net change this period</div>
                                   </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                   <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                                         <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                                      </div>
                                      <span className="text-xs text-gray-600">2.4 mo coverage</span>
                                   </div>
                                </div>
                             </div>

                             {/* Spend Visibility Card */}
                             <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compensation Overview</span>
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">OWNER ONLY</span>
                                   </div>
                                   <Users className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                         <span className="text-sm text-gray-700">Executive Spend</span>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900">$12,400</span>
                                   </div>
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 rounded-full bg-purple-500" />
                                         <span className="text-sm text-gray-700">Manager Spend</span>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900">$18,600</span>
                                   </div>
                                   <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Total Management Compensation</span>
                                      <span className="text-sm font-bold text-gray-900">$31,000</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </section>
                       )}

                       {/* Financial Overview - New Section */}
                       <section>
                          <h2 className="text-lg font-serif font-bold text-gray-900 mb-6">Financial Overview</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <GoalProgress label="Total Sales" current={124.5} target={120} unit="k" onTrendClick={() => openTrendModal('net-sales')} />
                             <GoalProgress label="Net Profit %" current={18} target={15} unit="%" onTrendClick={() => openTrendModal('net-income')} />
                             <GoalProgress label="COGS %" current={31} target={30} unit="%" inverted={true} onTrendClick={() => openTrendModal('cogs')} />
                             <GoalProgress label="Labor %" current={33} target={35} unit="%" inverted={true} onTrendClick={() => openTrendModal('labor')} />
                          </div>
                       </section>

                       {/* 2. Highlights Section - matches curated view */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <Check className="h-5 w-5 text-emerald-600" /> Highlights
                          </h3>

                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                             <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                                <span className="text-sm font-medium text-emerald-700">What's working this period</span>
                                <span className="text-xs text-emerald-600">Impact</span>
                             </div>
                             <div className="divide-y divide-gray-100">
                                <div className="p-4 flex justify-between items-center group">
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                         <Check className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">
                                            Labor % improved: 35% → 32%
                                         </p>
                                         <p className="text-xs text-muted-foreground">Dinner shifts on Tue/Wed operated with 1 less runner</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-emerald-600">+$2,400</span>
                                      <button 
                                         onClick={() => handleInsightClick("Tell me more about the labor efficiency improvements")}
                                         className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                         title="Ask Assistant"
                                      >
                                         <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </div>
                                </div>
                                <div className="p-4 flex justify-between items-center group">
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                         <Check className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">
                                            Sales exceeded target: $124.5k vs $120k goal
                                         </p>
                                         <p className="text-xs text-muted-foreground">Weekend brunch traffic was up 12% YoY</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-emerald-600">+$4,500</span>
                                      <button 
                                         onClick={() => handleInsightClick("Analyze the sales goal variance")}
                                         className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                         title="Ask Assistant"
                                      >
                                         <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </div>
                                </div>
                                <div className="p-4 flex justify-between items-center group">
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                         <Check className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">
                                            Net Profit up: 15% → 18%
                                         </p>
                                         <p className="text-xs text-muted-foreground">Combined labor savings and strong sales outpaced COGS increase</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-emerald-600">+$3,735</span>
                                      <button 
                                         onClick={() => handleInsightClick("What drove the net profit improvement?")}
                                         className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                         title="Ask Assistant"
                                      >
                                         <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* 3. Missed Targets Section - with expandable opportunities */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <AlertTriangle className="h-5 w-5 text-amber-600" /> Missed Targets
                          </h3>

                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                             <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                                <span className="text-sm font-medium text-amber-700">Areas needing attention</span>
                                <span className="text-xs text-amber-600">Impact</span>
                             </div>
                             <div className="divide-y divide-gray-100">
                                {/* COGS Missed Target with Dropdown */}
                                <div>
                                   <button
                                      data-testid="toggle-cogs-opportunity-finance"
                                      onClick={() => setExpandedMissedTarget(expandedMissedTarget === "cogs-finance" ? null : "cogs-finance")}
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
                                            <p className="text-xs text-muted-foreground">Produce prices spiked: Avocados +37%, Limes +28%</p>
                                         </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('cogs'), 100); }}
                                            className="text-sm font-medium text-amber-600 hover:text-amber-800 hover:underline"
                                         >-$1,245</button>
                                         <ChevronDown className={cn(
                                            "h-4 w-4 text-gray-400 transition-transform duration-200",
                                            expandedMissedTarget === "cogs-finance" && "rotate-180"
                                         )} />
                                      </div>
                                   </button>
                                   <AnimatePresence>
                                      {expandedMissedTarget === "cogs-finance" && (
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
                                                        <p className="text-sm font-medium text-gray-900">Switch Avocado Supplier</p>
                                                        <p className="text-xs text-gray-500">COGS • Produce</p>
                                                     </div>
                                                     <span className="text-sm font-semibold text-emerald-600">+$800/mo</span>
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
                                      data-testid="toggle-overtime-opportunity-finance"
                                      onClick={() => setExpandedMissedTarget(expandedMissedTarget === "overtime-finance" ? null : "overtime-finance")}
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
                                            expandedMissedTarget === "overtime-finance" && "rotate-180"
                                         )} />
                                      </div>
                                   </button>
                                   <AnimatePresence>
                                      {expandedMissedTarget === "overtime-finance" && (
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
                                                     <span className="text-sm font-semibold text-emerald-600">+$350/wk</span>
                                                  </div>
                                               </div>
                                            </div>
                                         </motion.div>
                                      )}
                                   </AnimatePresence>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* 4. Team Performance & Manager Goals */}
                       <section id="team-performance" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                               <Users className="h-5 w-5 text-gray-700" /> Team Performance & Goals
                             </h3>
                             <div className="flex items-center gap-2">
                                <button
                                  data-testid="button-email-report"
                                  onClick={() => setShowEmailReportModal(true)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  Email Report
                                </button>
                                <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                  Q3 2025
                                </span>
                             </div>
                          </div>

                          {/* Manager Goals Summary */}
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
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

                          {/* Staff Highlights */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-900">FOH Upsell Leader</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Team achieved 18% upsell rate on specials — best month this year.</p>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                   <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">JR</div>
                                      <span className="text-xs font-medium text-gray-600">Jamie R.</span>
                                   </div>
                                   <span className="text-xs font-semibold text-emerald-600">+$1,200</span>
                                </div>
                             </div>
                             <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-900">Scheduling Win</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">New "mid-shift cut" policy saved 40 hours without impacting service.</p>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                   <span className="text-xs text-gray-500">Started Oct 8</span>
                                   <span className="text-xs font-semibold text-emerald-600">-$2,400</span>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* Full P&L Dashboard - from accounting/pnl */}
                       <div className="border-t border-gray-100 pt-8">
                          <PnLDashboard 
                            onInsightClick={handleInsightClick} 
                            highlightedNodeId={highlightedPnlNodeId}
                            onHighlightClear={() => setHighlightedPnlNodeId(null)}
                            onTrendClick={openTrendModal}
                          />
                       </div>

                    </div>
                    </>
                    )}

                    {/* Detailed View Content */}
                    {ownerViewTab === "detailed" && (
                    <div className="p-8 space-y-8">
                       {/* 1. Executive Narrative */}
                       <section id="owner-executive-narrative" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Executive Narrative</h2>
                             <button 
                                data-testid="learn-owner-executive-narrative"
                                onClick={() => handleInsightClick("What is an executive narrative in a P&L report? Help me understand how to write and interpret it for my restaurant.")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Learn about Executive Narrative"
                             >
                                <Lightbulb className="h-3.5 w-3.5" />
                                Learn
                             </button>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                             <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                   <Sparkles className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                   <h3 className="font-semibold text-gray-900 mb-2">Performance Summary</h3>
                                   <p className="text-gray-700 leading-relaxed">
                                      December{' '}
                                      <button 
                                        onClick={() => navigateToPnlNode('net_income')}
                                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                        aria-label="View Net Income in P&L Dashboard"
                                      >net income</button>{' '}
                                      came in at $18,200 (6.2% margin), beating budget by $2,400. Strong holiday traffic drove{' '}
                                      <button 
                                        onClick={() => navigateToPnlNode('revenue')}
                                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                        aria-label="View Revenue in P&L Dashboard"
                                      >revenue</button>{' '}
                                      up 12% YoY, while{' '}
                                      <button 
                                        onClick={() => navigateToPnlNode('labor')}
                                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                        aria-label="View Labor Costs in P&L Dashboard"
                                      >labor costs</button>{' '}
                                      ran slightly over target due to overtime during peak weeks. Food cost held steady at 29.2%. The{' '}
                                      <button 
                                        onClick={() => navigateToPnlNode('prime_cost')}
                                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                        aria-label="View Prime Cost in P&L Dashboard"
                                      >prime cost</button>{' '}
                                      remained within the target range of 60-62%.
                                   </p>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* Health Snapshot */}
                       <section id="owner-health-snapshot" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-1">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Health Snapshot</h2>
                             <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-medium transition-colors", healthSnapshotMode === "percentage" ? "text-gray-900" : "text-gray-400")}>%</span>
                                <button
                                   onClick={() => setHealthSnapshotMode(healthSnapshotMode === "percentage" ? "actual" : "percentage")}
                                   className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                                   data-testid="toggle-owner-health-switch"
                                >
                                   <span className={cn(
                                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                                      healthSnapshotMode === "actual" && "translate-x-5"
                                   )} />
                                </button>
                                <span className={cn("text-xs font-medium transition-colors", healthSnapshotMode === "actual" ? "text-gray-900" : "text-gray-400")}>$</span>
                             </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">Key Performance Indicators</p>
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
                                   <tr className="hover:bg-gray-50 group transition-colors">
                                      <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                        Net Sales
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-gray-900">{healthSnapshotMode === "actual" ? "$133,042" : "100.0%"}</td>
                                      <td className="px-6 py-4 text-gray-500">{healthSnapshotMode === "actual" ? "$150,000" : "100.0%"}</td>
                                      <td className="px-6 py-4 text-red-600 font-medium">{healthSnapshotMode === "actual" ? "-$16,958" : "-11.3%"}</td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => openTrendModal('net-sales')}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                                          data-testid="status-net-sales"
                                          title="View Net Sales trend"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                          NEEDS ATTENTION
                                          <TrendingUp className="h-3 w-3 opacity-70" />
                                        </button>
                                      </td>
                                   </tr>
                                   <tr className="hover:bg-gray-50 group transition-colors">
                                      <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                        Prime Cost
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-gray-900">{healthSnapshotMode === "actual" ? "$71,826" : "54.0%"}</td>
                                      <td className="px-6 py-4 text-gray-500">{healthSnapshotMode === "actual" ? "$66,521" : "50.0%"}</td>
                                      <td className="px-6 py-4 text-red-600 font-medium">{healthSnapshotMode === "actual" ? "+$5,305" : "+4.0pts"}</td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => openTrendModal('prime-cost')}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                                          data-testid="status-prime-cost"
                                          title="View Prime Cost trend"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                          NEEDS ATTENTION
                                          <TrendingUp className="h-3 w-3 opacity-70" />
                                        </button>
                                      </td>
                                   </tr>
                                   <tr className="hover:bg-gray-50 group transition-colors">
                                      <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                        Labor
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-gray-900">{healthSnapshotMode === "actual" ? "$16,156" : "12.1%"}</td>
                                      <td className="px-6 py-4 text-gray-500">{healthSnapshotMode === "actual" ? "$15,965" : "12.0%"}</td>
                                      <td className="px-6 py-4 text-amber-600 font-medium">{healthSnapshotMode === "actual" ? "+$191" : "+0.1pts"}</td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => openTrendModal('labor')}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
                                          data-testid="status-labor"
                                          title="View Labor trend"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                          ON TRACK
                                          <TrendingUp className="h-3 w-3 opacity-70" />
                                        </button>
                                      </td>
                                   </tr>
                                   <tr className="hover:bg-gray-50 group transition-colors">
                                      <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                        COGS
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-gray-900">{healthSnapshotMode === "actual" ? "$41,243" : "31.0%"}</td>
                                      <td className="px-6 py-4 text-gray-500">{healthSnapshotMode === "actual" ? "$39,913" : "30.0%"}</td>
                                      <td className="px-6 py-4 text-red-600 font-medium">{healthSnapshotMode === "actual" ? "+$1,330" : "+1.0pts"}</td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => openTrendModal('cogs')}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                                          data-testid="status-cogs"
                                          title="View COGS trend"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                          NEEDS ATTENTION
                                          <TrendingUp className="h-3 w-3 opacity-70" />
                                        </button>
                                      </td>
                                   </tr>
                                   <tr className="hover:bg-gray-50 group transition-colors">
                                      <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                        Net Income
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-gray-900">{healthSnapshotMode === "actual" ? "$17,722" : "13.3%"}</td>
                                      <td className="px-6 py-4 text-gray-500">{healthSnapshotMode === "actual" ? "$15,000" : "10.0%"}</td>
                                      <td className="px-6 py-4 text-emerald-600 font-medium">{healthSnapshotMode === "actual" ? "+$2,722" : "+3.3pts"}</td>
                                      <td className="px-6 py-4 text-right">
                                        <button
                                          onClick={() => openTrendModal('net-income')}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
                                          data-testid="status-net-income"
                                          title="View Net Income trend"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                          ON TRACK
                                          <TrendingUp className="h-3 w-3 opacity-70" />
                                        </button>
                                      </td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>
                       </section>

                       {/* 2. Bottom Line */}
                       <section id="owner-bottom-line" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Bottom Line</h2>
                             <button 
                                data-testid="learn-owner-bottom-line"
                                onClick={() => handleInsightClick("What is net income and how do I read a net income walk? Explain how to understand what's eating into my restaurant's profits.")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Learn about Bottom Line"
                             >
                                <Lightbulb className="h-3.5 w-3.5" />
                                Learn
                             </button>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                             <h3 className="font-semibold text-gray-900 mb-4">Net Income Walk</h3>
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
                          </div>
                       </section>

                       {/* 3. Revenue Analysis */}
                       <section id="owner-revenue-analysis" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Revenue Analysis</h2>
                             <button 
                                data-testid="learn-owner-revenue-analysis"
                                onClick={() => handleInsightClick("How should I analyze revenue in my restaurant P&L? Explain channel mix, average check, and what to look for in revenue trends.")}
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
                             <h3 className="font-semibold text-gray-900 mb-4">Revenue Drivers</h3>
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
                          </div>

                          {/* Flags & Anomalies */}
                          <div className="space-y-2">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flags & Anomalies</h4>
                             <div className="space-y-2">
                                <div className="flex items-start gap-2 text-sm">
                                   <span className="text-amber-500">⚡</span>
                                   <span className="text-gray-700">Delivery mix increased 2pts vs prior year — margin implications?</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                   <span className="text-amber-500">⚡</span>
                                   <span className="text-gray-700">Week 4 dine-in revenue was 28% above weekly average (holiday effect)</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                   <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                   <span className="text-gray-700">No significant discounting or promo activity</span>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* 4. Prime Cost Analysis */}
                       <section id="owner-prime-cost-analysis" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-1">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Prime Cost Analysis</h2>
                             <button 
                                data-testid="learn-owner-prime-cost"
                                onClick={() => handleInsightClick("What is prime cost and why is it the most important metric in restaurant P&L? Explain how to calculate it and what's a healthy target.")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Learn about Prime Cost"
                             >
                                <Lightbulb className="h-3.5 w-3.5" />
                                Learn
                             </button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">The heart of the P&L</p>

                          {/* Prime Cost Walk */}
                          <div className="grid grid-cols-2 gap-6 mb-6">
                             <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Prime Cost Walk</h3>
                                <div className="space-y-2">
                                   <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-600">Target Prime Cost:</span>
                                      <div className="text-right">
                                         <span className="font-medium text-gray-900">61.5%</span>
                                         <span className="text-gray-500 text-sm ml-2">($180,400)</span>
                                      </div>
                                   </div>
                                   <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-600">+ Labor Variance:</span>
                                      <div className="text-right">
                                         <span className="font-medium text-red-600">+1.5pts</span>
                                         <span className="text-red-600 text-sm ml-2">(+$4,400)</span>
                                      </div>
                                   </div>
                                   <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                      <span className="text-gray-600">- COGS Variance:</span>
                                      <div className="text-right">
                                         <span className="font-medium text-emerald-600">-0.9pts</span>
                                         <span className="text-emerald-600 text-sm ml-2">(-$2,600)</span>
                                      </div>
                                   </div>
                                   <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-2">
                                      <span className="font-semibold text-gray-900">= Actual Prime Cost:</span>
                                      <div className="text-right">
                                         <span className="font-bold text-gray-900">62.1%</span>
                                         <span className="text-gray-600 text-sm ml-2">($182,200)</span>
                                      </div>
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
                             <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Labor Deep Dive</h3>
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
                                      <th className="text-right px-6 py-3 font-medium text-gray-500">% Revenue</th>
                                      <th className="text-right px-6 py-3 font-medium text-gray-500">% of Sales</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                   <tr className="hover:bg-gray-50 font-semibold bg-gray-50/30">
                                      <td className="px-6 py-4 text-gray-900">Total Labor</td>
                                      <td className="px-6 py-4 text-right">$95,400</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$81,220</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$14,180</td>
                                      <td className="px-6 py-4 text-right text-gray-600">32.5%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">BOH Labor</td>
                                      <td className="px-6 py-4 text-right">$38,200</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$35,500</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$2,700</td>
                                      <td className="px-6 py-4 text-right text-gray-600">13.0%</td>
                                   </tr>
                                   <Popover>
                                      <PopoverTrigger asChild>
                                         <tr className="hover:bg-amber-50/40 cursor-pointer">
                                            <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                               Line Cook
                                               <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                            </td>
                                            <td className="px-6 py-3 text-right text-gray-600">$18,400</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$17,000</td>
                                            <td className="px-6 py-3 text-right text-red-500 text-xs">+$1,400</td>
                                            <td className="px-6 py-3 text-right text-gray-500">6.3%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show overtime breakdown</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Compare to last year</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Which shifts drove this?</button>
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
                                            <td className="px-6 py-3 text-right text-gray-600">$12,200</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$11,500</td>
                                            <td className="px-6 py-3 text-right text-red-500 text-xs">+$700</td>
                                            <td className="px-6 py-3 text-right text-gray-500">4.2%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">When does training end?</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show headcount trend</button>
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
                                            <td className="px-6 py-3 text-right text-gray-600">$7,600</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$7,000</td>
                                            <td className="px-6 py-3 text-right text-red-500 text-xs">+$600</td>
                                            <td className="px-6 py-3 text-right text-gray-500">2.6%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Hours by day of week</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Is this sustainable?</button>
                                               </div>
                                            </div>
                                         </div>
                                      </PopoverContent>
                                   </Popover>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">FOH Labor</td>
                                      <td className="px-6 py-4 text-right">$42,100</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$37,800</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$4,300</td>
                                      <td className="px-6 py-4 text-right text-gray-600">14.3%</td>
                                   </tr>
                                   <Popover>
                                      <PopoverTrigger asChild>
                                         <tr className="hover:bg-amber-50/40 cursor-pointer">
                                            <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                               Server
                                               <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                            </td>
                                            <td className="px-6 py-3 text-right text-gray-600">$22,500</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$19,800</td>
                                            <td className="px-6 py-3 text-right text-red-500 text-xs">+$2,700</td>
                                            <td className="px-6 py-3 text-right text-gray-500">7.7%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show patio vs indoor split</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">When to scale back?</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Revenue per server</button>
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
                                            <td className="px-6 py-3 text-right text-gray-600">$11,800</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$10,500</td>
                                            <td className="px-6 py-3 text-right text-red-500 text-xs">+$1,300</td>
                                            <td className="px-6 py-3 text-right text-gray-500">4.0%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Happy hour revenue impact</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Bar sales per hour</button>
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
                                            <td className="px-6 py-3 text-right text-gray-600">$7,800</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$7,500</td>
                                            <td className="px-6 py-3 text-right text-red-500 text-xs">+$300</td>
                                            <td className="px-6 py-3 text-right text-gray-500">2.7%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Covers per host hour</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Wait time trends</button>
                                               </div>
                                            </div>
                                         </div>
                                      </PopoverContent>
                                   </Popover>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Management</td>
                                      <td className="px-6 py-4 text-right">$12,600</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$12,600</td>
                                      <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                      <td className="px-6 py-4 text-right text-gray-600">4.3%</td>
                                   </tr>
                                   <Popover>
                                      <PopoverTrigger asChild>
                                         <tr className="hover:bg-amber-50/40 cursor-pointer">
                                            <td className="px-6 py-3 text-gray-600 pl-16 flex items-center gap-2">
                                               General Manager
                                               <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">Elaborated</span>
                                            </td>
                                            <td className="px-6 py-3 text-right text-gray-600">$6,800</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$6,800</td>
                                            <td className="px-6 py-3 text-right text-gray-500 text-xs">$0</td>
                                            <td className="px-6 py-3 text-right text-gray-500">2.3%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show bonus structure</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">YoY comparison</button>
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
                                            <td className="px-6 py-3 text-right text-gray-600">$5,800</td>
                                            <td className="px-6 py-3 text-right text-gray-400">$5,800</td>
                                            <td className="px-6 py-3 text-right text-gray-500 text-xs">$0</td>
                                            <td className="px-6 py-3 text-right text-gray-500">2.0%</td>
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
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Shifts per week</button>
                                                  <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Coverage efficiency</button>
                                               </div>
                                            </div>
                                         </div>
                                      </PopoverContent>
                                   </Popover>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Payroll Taxes & Benefits</td>
                                      <td className="px-6 py-4 text-right">$10,500</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$9,320</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$1,180</td>
                                      <td className="px-6 py-4 text-right text-gray-600">3.6%</td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>

                          {/* COGS Deep Dive */}
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">COGS Deep Dive</h3>
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
                                      <td className="px-6 py-4 text-gray-900">Total COGS</td>
                                      <td className="px-6 py-4 text-right">$86,800</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$79,910</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$6,890</td>
                                      <td className="px-6 py-4 text-right text-gray-600">29.6%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Food Cost</td>
                                      <td className="px-6 py-4 text-right">$68,400</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$62,880</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$5,520</td>
                                      <td className="px-6 py-4 text-right text-gray-600">23.3%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Beverage Cost</td>
                                      <td className="px-6 py-4 text-right">$14,200</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$13,100</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$1,100</td>
                                      <td className="px-6 py-4 text-right text-gray-600">4.8%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Paper & Supplies</td>
                                      <td className="px-6 py-4 text-right">$4,200</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$3,930</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$270</td>
                                      <td className="px-6 py-4 text-right text-gray-600">1.4%</td>
                                   </tr>
                                </tbody>
                             </table>
                             <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs text-gray-600">Note: COGS variance is favorable as a % of sales (-0.9pts) despite higher absolute dollars due to volume increase.</p>
                             </div>
                          </div>
                       </section>

                       {/* 5. Operating Expenses */}
                       <section id="owner-operating-expenses" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Operating Expenses</h2>
                             <button 
                                data-testid="learn-owner-operating-expenses"
                                onClick={() => handleInsightClick("What are controllable vs fixed expenses in a restaurant P&L? Explain each category and how to manage them effectively.")}
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
                                      <td className="px-6 py-4 text-right">$38,600</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$39,800</td>
                                      <td className="px-6 py-4 text-right text-emerald-600">-$1,200</td>
                                      <td className="px-6 py-4 text-right text-gray-600">13.2%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Marketing</td>
                                      <td className="px-6 py-4 text-right">$3,200</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$4,500</td>
                                      <td className="px-6 py-4 text-right text-emerald-600">-$1,300</td>
                                      <td className="px-6 py-4 text-right text-gray-600">1.1%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Repairs & Maintenance</td>
                                      <td className="px-6 py-4 text-right">$4,800</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$4,000</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$800</td>
                                      <td className="px-6 py-4 text-right text-gray-600">1.6%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Utilities</td>
                                      <td className="px-6 py-4 text-right">$6,400</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$6,200</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$200</td>
                                      <td className="px-6 py-4 text-right text-gray-600">2.2%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Credit Card Fees</td>
                                      <td className="px-6 py-4 text-right">$7,400</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$6,600</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$800</td>
                                      <td className="px-6 py-4 text-right text-gray-600">2.5%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Delivery Commissions</td>
                                      <td className="px-6 py-4 text-right">$8,200</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$7,300</td>
                                      <td className="px-6 py-4 text-right text-red-600">+$900</td>
                                      <td className="px-6 py-4 text-right text-gray-600">2.8%</td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>

                          {/* Fixed/Occupancy Expenses */}
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Fixed / Occupancy Expenses</h3>
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
                                      <td className="px-6 py-4 text-gray-900">Total Fixed</td>
                                      <td className="px-6 py-4 text-right">$21,400</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$21,400</td>
                                      <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                      <td className="px-6 py-4 text-right text-gray-600">7.3%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Rent</td>
                                      <td className="px-6 py-4 text-right">$12,000</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$12,000</td>
                                      <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                      <td className="px-6 py-4 text-right text-gray-600">4.1%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Insurance</td>
                                      <td className="px-6 py-4 text-right">$3,800</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$3,800</td>
                                      <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                      <td className="px-6 py-4 text-right text-gray-600">1.3%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">CAM & Property Tax</td>
                                      <td className="px-6 py-4 text-right">$2,800</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$2,800</td>
                                      <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                      <td className="px-6 py-4 text-right text-gray-600">1.0%</td>
                                   </tr>
                                   <tr className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-700 pl-10">Depreciation</td>
                                      <td className="px-6 py-4 text-right">$2,800</td>
                                      <td className="px-6 py-4 text-right text-gray-500">$2,800</td>
                                      <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                      <td className="px-6 py-4 text-right text-gray-600">1.0%</td>
                                   </tr>
                                </tbody>
                             </table>
                          </div>
                       </section>

                       {/* 6. Action Items & Recommendations */}
                       <section id="owner-action-items" className="scroll-mt-4">
                          <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-serif font-bold text-gray-900">Action Items & Recommendations</h2>
                             <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">{activeActions.length} active</span>
                                {completedActions.length > 0 && (
                                   <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">{completedActions.length} completed</span>
                                )}
                             </div>
                          </div>

                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                             <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                   {activeActions.map((item) => (
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
                                         data-testid={`owner-action-item-${item.id}`}
                                         className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                                      >
                                         <button
                                            onClick={() => toggleActionComplete(item.id)}
                                            className={cn(
                                               "w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                                               "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
                                            )}
                                            data-testid={`owner-checkbox-${item.id}`}
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
                                                  data-testid={`owner-input-edit-${item.id}`}
                                               />
                                            ) : (
                                               <p
                                                  onClick={() => startEditingAction(item.id, item.title)}
                                                  className="font-medium text-gray-900 cursor-pointer hover:text-gray-700"
                                                  data-testid={`owner-text-action-${item.id}`}
                                               >
                                                  {item.title}
                                               </p>
                                            )}
                                            <p className="text-sm text-gray-500">
                                               Owner: <span className="font-medium">{item.owner}</span> &nbsp;•&nbsp; Impact: {item.impact}
                                            </p>
                                         </div>
                                         <div className="flex items-center gap-2">
                                            <button
                                               onClick={() => openAssignModal(item.id, item.title, item.owner)}
                                               className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                               data-testid={`owner-button-assign-${item.id}`}
                                            >
                                               Assign
                                            </button>
                                            <button
                                               onClick={() => startEditingAction(item.id, item.title)}
                                               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                               data-testid={`owner-button-edit-${item.id}`}
                                            >
                                               <Pencil className="h-4 w-4" />
                                            </button>
                                         </div>
                                      </motion.div>
                                   ))}
                                </AnimatePresence>

                                {activeActions.length === 0 && (
                                   <div className="text-center py-8 text-gray-500">
                                      <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-300 mb-2" />
                                      <p className="font-medium">All action items completed!</p>
                                   </div>
                                )}
                             </div>

                             {/* Completed Actions Collapsible */}
                             {completedActions.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                   <button
                                      onClick={() => setShowCompletedActions(!showCompletedActions)}
                                      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                      data-testid="owner-toggle-completed-actions"
                                   >
                                      <ChevronDown className={cn("h-4 w-4 transition-transform", showCompletedActions && "rotate-180")} />
                                      Completed ({completedActions.length})
                                   </button>
                                   <AnimatePresence>
                                      {showCompletedActions && (
                                         <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                         >
                                            <div className="space-y-2 mt-3">
                                               {completedActions.map((item) => (
                                                  <motion.div
                                                     key={item.id}
                                                     initial={{ opacity: 0, scale: 0.95 }}
                                                     animate={{ opacity: 1, scale: 1 }}
                                                     className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                                     data-testid={`owner-completed-action-${item.id}`}
                                                  >
                                                     <button
                                                        onClick={() => toggleActionComplete(item.id)}
                                                        className="w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center flex-shrink-0"
                                                        data-testid={`owner-checkbox-completed-${item.id}`}
                                                     >
                                                        <Check className="h-3 w-3 text-white" />
                                                     </button>
                                                     <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-500 line-through">{item.title}</p>
                                                        <p className="text-xs text-gray-400">
                                                           Completed {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'recently'}
                                                        </p>
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
                       </section>
                    </div>
                    )}
                 </div>
              </div>

              {/* Split Screen Chat Interface */}
              <OwnerChat 
                isOpen={showChat} 
                onClose={() => setShowChat(false)} 
                triggerQuery={chatTrigger ? chatTrigger.split(" ").slice(0, -1).join(" ") : null}
              />

              {/* Email Report Modal for Owner View */}
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
                          data-testid="button-close-email-modal-owner"
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
                                      data-testid={`button-remove-owner-${email}`}
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
                                  data-testid="input-new-recipient-owner"
                                />
                                <button
                                  onClick={addRecipient}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  data-testid="button-add-recipient-owner"
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
                                data-testid="input-email-subject-owner"
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
                                data-testid="textarea-email-message-owner"
                              />
                            </div>

                            {/* Report Preview Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-900">Report Summary</span>
                                <button
                                  onClick={() => setShowEmailPreview(true)}
                                  className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                  data-testid="button-preview-report-owner"
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
                              data-testid="button-cancel-email-owner"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={sendEmailReport}
                              disabled={emailRecipients.length === 0 || emailSending}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              data-testid="button-send-report-owner"
                            >
                              {emailSending ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                          {/* Email Preview */}
                          <div className="p-5">
                            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                              <div className="p-4 border-b border-gray-200 bg-white">
                                <p className="text-sm"><strong>To:</strong> {emailRecipients.join(", ")}</p>
                                <p className="text-sm"><strong>Subject:</strong> {emailSubject}</p>
                              </div>
                              <div className="p-4 space-y-4">
                                {emailMessage && (
                                  <p className="text-sm text-gray-700">{emailMessage}</p>
                                )}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Manager Scoreboard - {getScoreboardData().quarter}</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Location:</strong> {getScoreboardData().location}</p>
                                    <p><strong>Manager:</strong> {getScoreboardData().manager} ({getScoreboardData().role})</p>
                                    <p><strong>Goals Hit:</strong> {getScoreboardData().goalsHit}</p>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                      <p className="font-medium mb-2">Performance Summary:</p>
                                      {getScoreboardData().goals.map((goal, i) => (
                                        <div key={i} className="flex items-center justify-between py-1">
                                          <span className={goal.achieved ? "text-emerald-600" : "text-amber-600"}>
                                            {goal.achieved ? "✓" : "○"} {goal.name}
                                          </span>
                                          <span className="font-medium">{goal.bonus}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                      <span className="font-semibold">Total Bonus</span>
                                      <span className="text-lg font-bold text-emerald-600">{getScoreboardData().totalBonus}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Preview Footer */}
                          <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-100 bg-gray-50">
                            <button
                              onClick={() => setShowEmailPreview(false)}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                              data-testid="button-back-edit-owner"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Back to Edit
                            </button>
                            <button
                              onClick={sendEmailReport}
                              disabled={emailSending}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                              data-testid="button-send-preview-owner"
                            >
                              {emailSending ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
           </div>
        </Layout>
     );
  }

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
                      <button onClick={() => setStep(1)} className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                         <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                         <h1 className="font-serif text-xl font-bold text-gray-900">{period} Report</h1>
                         <p className="text-xs text-muted-foreground">{locationName} • Draft</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
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
                      {activeTab === "detailed" && (
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
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                         <Save className="h-4 w-4" /> Save Draft
                      </button>
                      <div className="h-6 w-px bg-gray-200" />
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
                      <button 
                         onClick={handleRelease}
                         className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                      >
                         Review & Send <ArrowRight className="h-4 w-4" />
                      </button>
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

                {/* Detailed View Tab */}
                {activeTab === "detailed" && (
                <div className="p-8">
                      <div className="max-w-5xl mx-auto flex flex-col gap-8">

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
                            onClick={() => handleInsightClick("What is an executive narrative in a P&L report? Help me understand how to write and interpret it for my restaurant.")}
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
                                  December{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('net_income')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Net Income in P&L Dashboard"
                                    data-testid="link-net-income"
                                  >net income</button>{' '}
                                  came in at $18,200 (6.2% margin), beating budget by $2,400. Strong holiday traffic drove{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('revenue')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Revenue in P&L Dashboard"
                                    data-testid="link-revenue"
                                  >revenue</button>{' '}
                                  12% above forecast, though{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('labor')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Labor Costs in P&L Dashboard"
                                    data-testid="link-labor"
                                  >labor costs</button>{' '}
                                  ran hot during the final two weeks.{' '}
                                  <button 
                                    onClick={() => navigateToPnlNode('prime_cost')}
                                    className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1"
                                    aria-label="View Prime Cost in P&L Dashboard"
                                    data-testid="link-prime-cost"
                                  >Prime cost</button>{' '}
                                  landed at 62.1%—within target but worth watching as January staffing decisions are made.
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
                            onClick={() => handleInsightClick("What is net income and how do I read a net income walk? Explain how to understand what's eating into my restaurant's profits.")}
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
                               onClick={() => handleInsightClick("What are the key KPIs in a restaurant P&L health snapshot? Explain what each metric means and what healthy ranges look like.")}
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
                            onClick={() => handleInsightClick("How should I analyze revenue in my restaurant P&L? Explain channel mix, average check, and what to look for in revenue trends.")}
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
                      </div>

                      {/* Flags & Anomalies */}
                      <div className="space-y-2">
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Flags & Anomalies</h4>
                         <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm">
                               <span className="text-amber-500">⚡</span>
                               <span className="text-gray-700">Delivery mix increased 2pts vs prior year — margin implications?</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                               <span className="text-amber-500">⚡</span>
                               <span className="text-gray-700">Week 4 dine-in revenue was 28% above weekly average (holiday effect)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                               <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                               <span className="text-gray-700">No significant discounting or promo activity</span>
                            </div>
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
                               onClick={() => handleInsightClick("What is prime cost and why is it the most important metric in restaurant P&L? Explain how to calculate it and what's a healthy target.")}
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
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Status</th>
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
                                  <td className="px-6 py-4 text-right">
                                     <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborVariance('total-labor', PERIOD_REVENUE).statusColor)}>
                                        {getLaborVariance('total-labor', PERIOD_REVENUE).statusText}
                                     </span>
                                  </td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">BOH Labor</td>
                                  <td className="px-6 py-4 text-right">${laborActuals['boh-labor'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('boh-labor', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('boh-labor', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('boh-labor', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['boh-labor'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborVariance('boh-labor', PERIOD_REVENUE).statusColor)}>
                                        {getLaborVariance('boh-labor', PERIOD_REVENUE).statusText}
                                     </span>
                                  </td>
                               </tr>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('line-cook', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('line-cook', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show overtime breakdown</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Compare to last year</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Which shifts drove this?</button>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('prep-cook', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('prep-cook', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">When does training end?</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show headcount trend</button>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('dishwasher', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('dishwasher', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Hours by day of week</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Is this sustainable?</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">FOH Labor</td>
                                  <td className="px-6 py-4 text-right">${laborActuals['foh-labor'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('foh-labor', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('foh-labor', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('foh-labor', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['foh-labor'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborVariance('foh-labor', PERIOD_REVENUE).statusColor)}>
                                        {getLaborVariance('foh-labor', PERIOD_REVENUE).statusText}
                                     </span>
                                  </td>
                               </tr>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('server', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('server', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show patio vs indoor split</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">When to scale back?</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Revenue per server</button>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('bartender', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('bartender', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Happy hour revenue impact</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Bar sales per hour</button>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('host', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('host', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Covers per host hour</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Wait time trends</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Management</td>
                                  <td className="px-6 py-4 text-right">${laborActuals['management'].toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${getLaborBudgetForCategory('management', PERIOD_REVENUE).toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", getLaborVariance('management', PERIOD_REVENUE).color)}>
                                     {getLaborVariance('management', PERIOD_REVENUE).formattedDollar}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-600">
                                     {((laborActuals['management'] / PERIOD_REVENUE) * 100).toFixed(1)}%
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborVariance('management', PERIOD_REVENUE).statusColor)}>
                                        {getLaborVariance('management', PERIOD_REVENUE).statusText}
                                     </span>
                                  </td>
                               </tr>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('gm', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('gm', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Show bonus structure</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">YoY comparison</button>
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
                                        <td className="px-6 py-3 text-right">
                                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getLaborVariance('supervisor', PERIOD_REVENUE).statusColor)}>
                                              {getLaborVariance('supervisor', PERIOD_REVENUE).statusText}
                                           </span>
                                        </td>
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
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Shifts per week</button>
                                              <button className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">Coverage efficiency</button>
                                           </div>
                                        </div>
                                     </div>
                                  </PopoverContent>
                               </Popover>
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
                                  <td className="px-6 py-4 text-right">
                                     <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLaborVariance('payroll-taxes', PERIOD_REVENUE).statusColor)}>
                                        {getLaborVariance('payroll-taxes', PERIOD_REVENUE).statusText}
                                     </span>
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
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Status</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50 font-semibold bg-gray-50/30">
                                  <td className="px-6 py-4 text-gray-900">Total COGS</td>
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
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Food Cost</td>
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
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Beverage Cost</td>
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
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Paper & Supplies</td>
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
                            onClick={() => handleInsightClick("What are controllable vs fixed expenses in a restaurant P&L? Explain each category and how to manage them effectively.")}
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

                   {/* 7. Action Items & Recommendations */}
                   {isSectionVisible("action-items") && (
                   <section id="action-items" className="scroll-mt-4" style={{ order: getSectionOrderIndex("action-items") }}>
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Action Items & Recommendations</h2>
                         <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">{activeActions.length} active</span>
                            {completedActions.length > 0 && (
                               <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">{completedActions.length} completed</span>
                            )}
                         </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                         <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                               {activeActions.map((item) => (
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
                                     data-testid={`action-item-${item.id}`}
                                     className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
                                  >
                                     <button
                                        onClick={() => toggleActionComplete(item.id)}
                                        className={cn(
                                           "w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                                           "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
                                        )}
                                        data-testid={`checkbox-${item.id}`}
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
                                              data-testid={`input-edit-${item.id}`}
                                           />
                                        ) : (
                                           <p
                                              onClick={() => startEditingAction(item.id, item.title)}
                                              className="font-medium text-gray-900 cursor-pointer hover:text-gray-700"
                                              data-testid={`text-action-${item.id}`}
                                           >
                                              {item.title}
                                           </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                           Owner: <span className="font-medium">{item.owner}</span> &nbsp;•&nbsp; Impact: {item.impact}
                                        </p>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <button
                                           onClick={() => openAssignModal(item.id, item.title, item.owner)}
                                           className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                           data-testid={`button-assign-${item.id}`}
                                        >
                                           Assign
                                        </button>
                                        <button
                                           onClick={() => startEditingAction(item.id, item.title)}
                                           className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                           data-testid={`button-edit-${item.id}`}
                                        >
                                           <Pencil className="h-4 w-4" />
                                        </button>
                                     </div>
                                  </motion.div>
                               ))}
                            </AnimatePresence>

                            {activeActions.length === 0 && (
                               <div className="text-center py-8 text-gray-500">
                                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-300 mb-2" />
                                  <p className="font-medium">All action items completed!</p>
                               </div>
                            )}
                         </div>

                         {/* Completed Actions Collapsible */}
                         {completedActions.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                               <button
                                  onClick={() => setShowCompletedActions(!showCompletedActions)}
                                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                  data-testid="toggle-completed-actions"
                               >
                                  <ChevronDown className={cn("h-4 w-4 transition-transform", showCompletedActions && "rotate-180")} />
                                  Completed ({completedActions.length})
                               </button>
                               <AnimatePresence>
                                  {showCompletedActions && (
                                     <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                     >
                                        <div className="space-y-2 mt-3">
                                           {completedActions.map((item) => (
                                              <motion.div
                                                 key={item.id}
                                                 initial={{ opacity: 0, scale: 0.95 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                                 data-testid={`completed-action-${item.id}`}
                                              >
                                                 <button
                                                    onClick={() => toggleActionComplete(item.id)}
                                                    className="w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center flex-shrink-0"
                                                    data-testid={`checkbox-completed-${item.id}`}
                                                 >
                                                    <Check className="h-3 w-3 text-white" />
                                                 </button>
                                                 <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-500 line-through">{item.title}</p>
                                                    <p className="text-xs text-gray-400">
                                                       Completed {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'recently'}
                                                    </p>
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

                      {/* Recommendation Cards */}
                      <div className="grid grid-cols-3 gap-4">
                         <div data-testid="card-recommendation-labor" className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <h4 className="font-semibold text-blue-900 mb-2">January Labor Planning</h4>
                            <p className="text-sm text-blue-800">Holiday volume won't repeat. Target returning to 31% labor by end of Jan via schedule adjustments.</p>
                         </div>
                         <div data-testid="card-recommendation-delivery" className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                            <h4 className="font-semibold text-purple-900 mb-2">Delivery Channel</h4>
                            <p className="text-sm text-purple-800">Delivery now 20% of revenue. Model in-house delivery for orders within 2-mile radius to save margin.</p>
                         </div>
                         <div data-testid="card-recommendation-marketing" className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                            <h4 className="font-semibold text-orange-900 mb-2">Marketing Reactivation</h4>
                            <p className="text-sm text-orange-800">Reinstate marketing spend ($5k budget) focused on weekday traffic for the soft January period.</p>
                         </div>
                      </div>

                      {/* Assign Action Item Modal */}
                      <AnimatePresence>
                         {assignModal.isOpen && (
                            <motion.div
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               exit={{ opacity: 0 }}
                               className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                               onClick={closeAssignModal}
                            >
                               <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                  transition={{ duration: 0.2 }}
                                  className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
                                  onClick={(e) => e.stopPropagation()}
                               >
                                  <div className="p-6 border-b border-gray-100">
                                     <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                           <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                              <Mail className="h-6 w-6 text-gray-600" />
                                           </div>
                                           <div>
                                              <h3 className="font-semibold text-gray-900">Assign Action Item</h3>
                                              <p className="text-sm text-gray-500">Send assignment notification</p>
                                           </div>
                                        </div>
                                        <button
                                           onClick={closeAssignModal}
                                           className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                           <X className="h-5 w-5" />
                                        </button>
                                     </div>
                                  </div>

                                  <div className="p-6 space-y-5">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Recipients</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                           {assignModal.recipients.map((email) => (
                                              <span
                                                 key={email}
                                                 className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                                              >
                                                 {email}
                                                 <button
                                                    onClick={() => removeAssignRecipient(email)}
                                                    className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                                                 >
                                                    <X className="h-3.5 w-3.5" />
                                                 </button>
                                              </span>
                                           ))}
                                        </div>
                                        <div className="flex gap-2">
                                           <input
                                              type="email"
                                              value={assignModal.newEmail}
                                              onChange={(e) => setAssignModal(prev => ({ ...prev, newEmail: e.target.value }))}
                                              onKeyDown={(e) => e.key === "Enter" && addAssignRecipient()}
                                              placeholder="Add email address..."
                                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                           />
                                           <button
                                              onClick={addAssignRecipient}
                                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                           >
                                              <Plus className="h-4 w-4" />
                                           </button>
                                        </div>
                                     </div>

                                     <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Subject</label>
                                        <input
                                           type="text"
                                           value={assignModal.subject}
                                           onChange={(e) => setAssignModal(prev => ({ ...prev, subject: e.target.value }))}
                                           className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                                        />
                                     </div>

                                     <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Message (optional)</label>
                                        <textarea
                                           value={assignModal.message}
                                           onChange={(e) => setAssignModal(prev => ({ ...prev, message: e.target.value }))}
                                           placeholder="Add a personal note..."
                                           rows={3}
                                           className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                                        />
                                     </div>

                                     <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                                        <div className="flex items-center justify-between mb-2">
                                           <h4 className="font-medium text-gray-900">Action Item Summary</h4>
                                           <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                              <Eye className="h-3.5 w-3.5" />
                                              Preview
                                           </button>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                           <li>• {assignModal.actionTitle}</li>
                                           <li>• Period: September 2025</li>
                                           <li>• Location: STMARKS</li>
                                        </ul>
                                     </div>
                                  </div>

                                  <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                     <button
                                        onClick={closeAssignModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                     >
                                        Cancel
                                     </button>
                                     <button
                                        onClick={sendAssignment}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                                     >
                                        <Send className="h-4 w-4" />
                                        Send Assignment
                                     </button>
                                  </div>
                               </motion.div>
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </section>
                   )}

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

                   {/* First-time user hint */}
                   {!curatedPrefs.hasSeenHint && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <p className="text-sm text-blue-800">
                               This view is customized for your role. You can change it anytime using the <strong>Customize View</strong> button.
                            </p>
                         </div>
                         <button 
                            onClick={dismissHint}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            data-testid="button-dismiss-hint"
                         >
                            <X className="h-4 w-4" />
                         </button>
                      </div>
                   )}

                   {/* Role Description Banner with Customize Button */}
                   <div className={cn(
                      "rounded-xl p-4 flex items-center gap-3",
                      selectedRole === "owner" ? "bg-blue-50 border border-blue-200" : 
                      selectedRole === "gm" ? "bg-purple-50 border border-purple-200" : 
                      "bg-orange-50 border border-orange-200"
                   )}>
                      <div className={cn(
                         "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0",
                         selectedRole === "owner" ? "bg-blue-500" : 
                         selectedRole === "gm" ? "bg-purple-500" : 
                         "bg-orange-500"
                      )}>
                         {selectedRole === "owner" ? "O" : selectedRole === "gm" ? "GM" : "EC"}
                      </div>
                      <div className="flex-1">
                         <h3 className={cn(
                            "font-medium",
                            selectedRole === "owner" ? "text-blue-900" : 
                            selectedRole === "gm" ? "text-purple-900" : 
                            "text-orange-900"
                         )}>
                            {selectedRole === "owner" ? "Owner View" : selectedRole === "gm" ? "General Manager View" : "Executive Chef View"}
                         </h3>
                         <p className={cn(
                            "text-sm",
                            selectedRole === "owner" ? "text-blue-700" : 
                            selectedRole === "gm" ? "text-purple-700" : 
                            "text-orange-700"
                         )}>
                            {selectedRole === "owner" ? "Full access to all financial data and insights" : 
                             selectedRole === "gm" ? "Focus on FOH labor, operations, and overall revenue performance" : 
                             "Focus on COGS, BOH labor, and kitchen operations"}
                         </p>
                      </div>

                      {/* Customize View Button */}
                      <div ref={curatedFilterRef} className="relative flex-shrink-0">
                         <button 
                            data-testid="button-customize-view"
                            onClick={() => setShowCuratedFilterDropdown(!showCuratedFilterDropdown)}
                            className={cn(
                               "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                               selectedRole === "owner" ? "bg-white/80 border-blue-200 hover:bg-white text-blue-900" :
                               selectedRole === "gm" ? "bg-white/80 border-purple-200 hover:bg-white text-purple-900" :
                               "bg-white/80 border-orange-200 hover:bg-white text-orange-900",
                               showCuratedFilterDropdown && "bg-white shadow-sm"
                            )}
                         >
                            <Filter className="h-4 w-4" />
                            Customize
                            {activeFilters.length < filterOptions.length && (
                               <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded-full",
                                  selectedRole === "owner" ? "bg-blue-100 text-blue-700" :
                                  selectedRole === "gm" ? "bg-purple-100 text-purple-700" :
                                  "bg-orange-100 text-orange-700"
                               )}>
                                  {activeFilters.length}/{filterOptions.length}
                               </span>
                            )}
                         </button>

                         {/* Filter Dropdown */}
                         {showCuratedFilterDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                               <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-900">Show Insights</span>
                                  <button
                                     data-testid="button-reset-filters"
                                     onClick={resetToRoleDefaults}
                                     className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                     Restore defaults
                                  </button>
                               </div>
                               <div className="max-h-80 overflow-y-auto p-2">
                                  {Object.entries(
                                     filterOptions.reduce((acc, opt) => {
                                        if (!acc[opt.group]) acc[opt.group] = [];
                                        acc[opt.group].push(opt);
                                        return acc;
                                     }, {} as Record<string, CuratedFilterOption[]>)
                                  ).map(([group, options]) => (
                                     <div key={group} className="mb-3 last:mb-0">
                                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group}</div>
                                        {options.map(opt => (
                                           <label 
                                              key={opt.id}
                                              className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                           >
                                              <input
                                                 type="checkbox"
                                                 checked={isFilterEnabled(opt.id)}
                                                 onChange={() => toggleCuratedFilter(opt.id)}
                                                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                 data-testid={`checkbox-filter-${opt.id}`}
                                              />
                                              <span className="text-sm text-gray-700">{opt.label}</span>
                                           </label>
                                        ))}
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>
                   </div>

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
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-emerald-700 uppercase tracking-wide">Financial Health</span>
                                  <div className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                     🟢 HEALTHY
                                  </div>
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
                      </div>

                      {/* Summary Cards Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         {/* Income Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                               <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Income</span>
                               <button 
                                  onClick={() => openTrendModal('net-sales')}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                  data-testid="button-income-trend"
                               >
                                  <DollarSign className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                               </button>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">$124,500</div>
                            <div className="flex items-center gap-1 mt-1">
                               <TrendingUp className="h-3 w-3 text-emerald-600" />
                               <span className="text-xs font-medium text-emerald-600">+3.7%</span>
                               <span className="text-xs text-gray-500">vs prior</span>
                            </div>
                         </div>

                         {/* Marketing Spend Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                               <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marketing</span>
                               <button 
                                  onClick={() => openTrendModal('marketing')}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                  data-testid="button-marketing-trend"
                               >
                                  <Target className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                               </button>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">$3,200</div>
                            <div className="flex items-center gap-1 mt-1">
                               <span className="text-xs font-medium text-gray-600">2.6%</span>
                               <span className="text-xs text-gray-500">of revenue</span>
                            </div>
                         </div>

                         {/* Operating Expenses Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                               <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Op. Expenses</span>
                               <button 
                                  onClick={() => openTrendModal('controllable-expenses')}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                  data-testid="button-opex-trend"
                               >
                                  <CreditCard className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                               </button>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">$44,500</div>
                            <div className="flex items-center gap-1 mt-1">
                               <span className="text-xs font-medium text-amber-600">35.7%</span>
                               <span className="text-xs text-gray-500">of revenue</span>
                            </div>
                         </div>

                         {/* Growth Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                               <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Growth</span>
                               <button 
                                  onClick={() => openTrendModal('net-sales')}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                  data-testid="button-growth-trend"
                               >
                                  <TrendingUp className="h-4 w-4 text-emerald-500 group-hover:text-blue-600 transition-colors" />
                               </button>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="text-2xl font-bold text-emerald-600">↑ Growing</div>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                               <span className="text-xs font-medium text-emerald-600">+3.7%</span>
                               <span className="text-xs text-gray-500">revenue YoY</span>
                            </div>
                         </div>
                      </div>

                      {/* Second Row - Owner Only Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         {/* Cash Flow Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cash Flow</span>
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">OWNER ONLY</span>
                               </div>
                               <button 
                                  onClick={() => openTrendModal('cash-flow')}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                  data-testid="button-cashflow-trend"
                               >
                                  <Wallet className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                               </button>
                            </div>
                            <div className="flex items-center justify-between">
                               <div>
                                  <div className="text-xl font-bold text-gray-900">$48,200</div>
                                  <div className="text-xs text-gray-500">Current balance</div>
                               </div>
                               <div className="text-right">
                                  <div className="flex items-center gap-1 justify-end">
                                     <TrendingUp className="h-3 w-3 text-emerald-600" />
                                     <span className="text-sm font-medium text-emerald-600">+$8,450</span>
                                  </div>
                                  <div className="text-xs text-gray-500">Net change this period</div>
                               </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                               <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                                     <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                                  </div>
                                  <span className="text-xs text-gray-600">2.4 mo coverage</span>
                               </div>
                            </div>
                         </div>

                         {/* Spend Visibility Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compensation Overview</span>
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">OWNER ONLY</span>
                               </div>
                               <button 
                                  onClick={() => openTrendModal('labor')}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                  data-testid="button-compensation-trend"
                               >
                                  <Users className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                               </button>
                            </div>
                            <div className="space-y-3">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                     <span className="text-sm text-gray-700">Executive Spend</span>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">$12,400</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-purple-500" />
                                     <span className="text-sm text-gray-700">Manager Spend</span>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">$18,600</span>
                               </div>
                               <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Total Management Compensation</span>
                                  <span className="text-sm font-bold text-gray-900">$31,000</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </section>
                   )}

                   {/* Financial Overview - Role-specific KPIs */}
                   <section>
                      <h2 className="text-lg font-serif font-bold text-gray-900 mb-6">
                         {selectedRole === "owner" ? "Financial Overview" : 
                          selectedRole === "gm" ? "Operations Overview" : 
                          "Kitchen Performance"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Owner sees everything */}
                         {selectedRole === "owner" && (
                            <>
                               <GoalProgress label="Total Sales" current={124.5} target={120} unit="k" onTrendClick={() => openTrendModal('net-sales')} />
                               <GoalProgress label="Net Profit %" current={18} target={15} unit="%" onTrendClick={() => openTrendModal('net-income')} />
                               <GoalProgress label="COGS %" current={31} target={30} unit="%" inverted={true} onTrendClick={() => openTrendModal('cogs')} />
                               <GoalProgress label="Labor %" current={33} target={35} unit="%" inverted={true} onTrendClick={() => openTrendModal('labor')} />
                            </>
                         )}
                         {/* GM sees sales, labor (FOH focus), and operations */}
                         {selectedRole === "gm" && (
                            <>
                               <GoalProgress label="Total Sales" current={124.5} target={120} unit="k" onTrendClick={() => openTrendModal('net-sales')} />
                               <GoalProgress label="FOH Labor %" current={14.3} target={14} unit="%" inverted={true} onTrendClick={() => openTrendModal('labor')} />
                               <GoalProgress label="Table Turns" current={2.4} target={2.2} unit="" />
                               <GoalProgress label="Guest Count" current={8580} target={7800} unit="" />
                            </>
                         )}
                         {/* Executive Chef sees COGS, BOH labor */}
                         {selectedRole === "chef" && (
                            <>
                               <GoalProgress label="COGS %" current={31} target={30} unit="%" inverted={true} onTrendClick={() => openTrendModal('cogs')} />
                               <GoalProgress label="Food Cost %" current={23.3} target={24} unit="%" inverted={true} onTrendClick={() => openTrendModal('cogs')} />
                               <GoalProgress label="BOH Labor %" current={13} target={12.5} unit="%" inverted={true} onTrendClick={() => openTrendModal('labor')} />
                               <GoalProgress label="Beverage Cost %" current={4.8} target={5} unit="%" inverted={true} onTrendClick={() => openTrendModal('cogs')} />
                            </>
                         )}
                      </div>
                   </section>

                   {/* Performance Summary & Auto-Diagnosis - GM Only */}
                   {selectedRole === "gm" && (
                   <section data-testid="gm-daily-prime-cost-section">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            Performance Summary
                            <span className="text-sm font-normal text-gray-500 ml-2">{currentGMData.dateLabel}</span>
                         </h2>
                         {/* Time Range Selector */}
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
                      </div>
                      
                      {/* Performance Metrics Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         {/* Sales Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                            <button
                               onClick={() => openTrendModal('net-sales')}
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

                         {/* COGS % Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                            <button
                               onClick={() => openTrendModal('cogs')}
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

                         {/* Labor % Card */}
                         <div className="bg-white border border-gray-200 rounded-xl p-4 relative group">
                            <button
                               onClick={() => openTrendModal('labor')}
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

                         {/* Prime Cost Card - Primary */}
                         <div className={cn(
                            "border rounded-xl p-4 relative group",
                            currentGMData.primeCost.variance > 2 
                               ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200" 
                               : currentGMData.primeCost.variance > 0 
                                  ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                                  : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                         )}>
                            <button
                               onClick={() => openTrendModal('prime-cost')}
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
                      </div>

                      {/* Shift Breakdown Graph */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6" data-testid="shift-breakdown-graph">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                               <Clock className="h-4 w-4 text-gray-500" />
                               Shift Breakdown
                               <span className="text-xs font-normal text-gray-500">
                                  {gmTimeRange === 'today' ? 'Today' : gmTimeRange === 'week' ? 'This Week (Avg/Day)' : gmTimeRange === 'month' ? 'This Month (Avg/Day)' : 'YTD (Avg/Day)'}
                               </span>
                               {shiftZoomLevel !== '60min' && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full flex items-center gap-1">
                                     {shiftZoomLevel === '15min' ? '15-min' : shiftZoomLevel === '5min' ? '5-min' : '1-min'} resolution
                                     <button 
                                        onClick={handleShiftChartDoubleClick}
                                        className="ml-1 hover:text-blue-900"
                                        title="Reset to hourly view"
                                     >
                                        ×
                                     </button>
                                  </span>
                               )}
                            </h3>
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
                               {shiftZoomLevel === '60min' ? (
                                  <span className="text-[10px] text-gray-400 italic">Drag to zoom</span>
                               ) : (
                                  <div className="flex items-center gap-2">
                                     {timeWindow && (
                                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                           {timeWindow.start} – {timeWindow.end}
                                        </span>
                                     )}
                                     <span className="text-[10px] text-gray-400 italic">← Drag to pan →</span>
                                  </div>
                               )}
                            </div>
                         </div>
                         
                         {/* Combined Bar + Line Chart with Zoom */}
                         <div 
                            className={cn(
                               "h-64 select-none",
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
                                     tick={{ fontSize: shiftZoomLevel === '1min' ? 8 : 10, fill: '#6b7280' }}
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
                                  <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sales" />
                                  <Bar yAxisId="left" dataKey="labor" fill="#fb923c" radius={[4, 4, 0, 0]} name="Labor" />
                                  <Line 
                                     yAxisId="right" 
                                     type="monotone" 
                                     dataKey="laborPct" 
                                     stroke="#ef4444" 
                                     strokeWidth={2}
                                     dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                     name="Labor %"
                                  />
                               </ComposedChart>
                            </ResponsiveContainer>
                         </div>
                         
                         {/* Summary Footer */}
                         <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Total Sales:</span>
                                  <span className="font-semibold text-gray-900">${shiftTotalSales.toLocaleString()}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Total Labor:</span>
                                  <span className="font-semibold text-gray-900">${shiftTotalLabor.toLocaleString()}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Overall Labor %:</span>
                                  <span className={cn(
                                     "font-semibold px-1.5 py-0.5 rounded",
                                     (shiftTotalLabor / shiftTotalSales * 100) > 32 ? "bg-red-100 text-red-700" : 
                                     (shiftTotalLabor / shiftTotalSales * 100) > 28 ? "bg-amber-100 text-amber-700" : 
                                     "bg-emerald-100 text-emerald-700"
                                  )}>
                                     {((shiftTotalLabor / shiftTotalSales) * 100).toFixed(1)}%
                                  </span>
                               </div>
                            </div>
                            <span className="text-gray-400">Synced with Performance Summary</span>
                         </div>
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
                   </section>
                   )}

                   {/* Ticket Time Zone Bar Graph - Chef Only */}
                   {selectedRole === "chef" && (
                   <section data-testid="ticket-time-zone-section">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            Ticket Time Performance
                         </h2>
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
                      
                      {/* Kitchen Action Items */}
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 mt-6">
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
                                     today: `[CONTEXT]\nRole: Executive Chef\nPeriod: Monday, Jan 12\nIssue: Food cost running above target\nMetrics:\n• Today's Food Cost %: 23.3%\n• Target: 24% (within range but trending up)\n• Waste log: 2.1% of inventory\n• High-cost items: Ribeye (4 over-portions), Salmon (3 remakes)\n\nHelp me identify where we're losing margin on food cost and what kitchen adjustments to make.`,
                                     week: `[CONTEXT]\nRole: Executive Chef\nPeriod: Week of Jan 6-12 (WTD)\nIssue: Protein waste elevated this week\nMetrics:\n• Weekly waste: 2.4% of inventory (target: 1.8%)\n• Ribeye: 18 over-portions logged\n• Salmon: 12 remakes\n• Chicken: 8 temperature rejects\n\nHelp me address the protein waste pattern and create accountability measures for the line.`,
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
                                     {chefTimeRange === 'today' ? 'Ribeye over-portions and salmon remakes driving waste — review portioning with line.' :
                                      chefTimeRange === 'week' ? '38 protein waste incidents logged — ribeye and salmon are top offenders.' :
                                      chefTimeRange === 'month' ? 'COGS at 31.2% vs 30% budget — protein waste is primary driver.' :
                                      'Opportunity to save $22K annually by hitting 30% COGS target.'}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                     <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                        {chefTimeRange === 'today' ? 'Items: Ribeye, Salmon' :
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
                                              Labor % improved:{' '}
                                              <button 
                                                 onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('labor'), 100); }}
                                                 className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2"
                                              >35% → 32%</button>
                                           </p>
                                           <p className="text-xs text-muted-foreground">Dinner shifts on Tue/Wed operated with 1 less runner</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('labor'), 100); }}
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
                                              Sales exceeded target:{' '}
                                              <button 
                                                 onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('revenue'), 100); }}
                                                 className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2"
                                              >$124.5k vs $120k</button> goal
                                           </p>
                                           <p className="text-xs text-muted-foreground">Weekend brunch traffic was up 12% YoY</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('revenue'), 100); }}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                                     >+$4,500</button>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">
                                              Net Profit up:{' '}
                                              <button 
                                                 onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('net_profit'), 100); }}
                                                 className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2"
                                              >15% → 18%</button>
                                           </p>
                                           <p className="text-xs text-muted-foreground">Combined labor savings and strong sales outpaced COGS increase</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => { setActiveTab("detailed"); setTimeout(() => navigateToPnlNode('net_profit'), 100); }}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                                     >+$3,735</button>
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
                                           <p className="text-sm font-medium text-gray-900">FOH Labor optimized: Saved 40 hours</p>
                                           <p className="text-xs text-muted-foreground">Dinner shifts on Tue/Wed operated with 1 less runner</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$1,200</span>
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
                                           <p className="text-sm font-medium text-gray-900">Table turns improved: 2.4 vs 2.2 target</p>
                                           <p className="text-xs text-muted-foreground">Faster turnover during peak hours</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+9%</span>
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
                                           <p className="text-sm font-medium text-gray-900">Food cost % on target: 23.3% vs 24% budget</p>
                                           <p className="text-xs text-muted-foreground">Portion control and waste reduction paid off</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$1,100</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Smoked Salmon Benedict sold 145 units</p>
                                           <p className="text-xs text-muted-foreground">New special performed exceptionally well</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+40 vs forecast</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Beverage cost held steady at 4.8%</p>
                                           <p className="text-xs text-muted-foreground">Good inventory management on bar stock</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">under 5%</span>
                                  </div>
                               </>
                            )}
                         </div>
                      </div>
                   </section>

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
                                              <p className="text-xs text-muted-foreground">Produce prices spiked: Avocados +37%, Limes +28%</p>
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
                                                          <p className="text-sm font-medium text-gray-900">Switch Avocado Supplier</p>
                                                          <p className="text-xs text-gray-500">COGS • Produce</p>
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
                                  {/* Produce Cost Missed Target with Dropdown */}
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
                                                 Produce costs spiked:{' '}
                                                 <span className="text-amber-700">Avocados +37%, Limes +28%</span>
                                              </p>
                                              <p className="text-xs text-muted-foreground">Evaluate alternative suppliers or menu adjustments</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$800</span>
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
                                                          <p className="text-sm font-medium text-gray-900">Switch to Restaurant Depot for avocados</p>
                                                          <p className="text-xs text-gray-500">Produce • Avocados</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$400/mo</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                                       <div>
                                                          <p className="text-sm font-medium text-gray-900">Feature lime-free specials through Q1</p>
                                                          <p className="text-xs text-gray-500">Menu Engineering • Seasonal</p>
                                                       </div>
                                                       <span className="text-sm font-semibold text-emerald-600">+$200/mo</span>
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
                            {/* Owner Action Items */}
                            {selectedRole === "owner" && (
                               <>
                                  <button 
                                     data-testid="curated-action-delivery"
                                     onClick={() => handleInsightClick("Help me renegotiate DoorDash delivery commission to save $400/mo")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-blue-900">Renegotiate delivery commission with DoorDash</p>
                                           <p className="text-xs text-gray-500">Impact: $400/mo potential savings</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                                  </button>
                                  <button 
                                     data-testid="curated-action-overview"
                                     onClick={() => handleInsightClick("Help me prepare for the monthly P&L review meeting with management")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-blue-900">Review monthly P&L with management team</p>
                                           <p className="text-xs text-gray-500">Schedule for first week of January</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                                  </button>
                               </>
                            )}
                            {/* GM Action Items */}
                            {selectedRole === "gm" && (
                               <>
                                  <button 
                                     data-testid="curated-action-ot"
                                     onClick={() => handleInsightClick("Analyze our overtime policy and suggest ways to reduce 142 hours of OT")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-purple-900">Review OT policy — 142 hours is unsustainable</p>
                                           <p className="text-xs text-gray-500">Impact: $1,500/mo potential savings</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-purple-500 flex-shrink-0" />
                                  </button>
                                  <button 
                                     data-testid="curated-action-hvac"
                                     onClick={() => handleInsightClick("Help me understand if the HVAC repair is a one-time expense or recurring")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-purple-900">Investigate HVAC repair — one-time or recurring?</p>
                                           <p className="text-xs text-gray-500">Impact: Budgeting clarity for January</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-purple-500 flex-shrink-0" />
                                  </button>
                                  <button 
                                     data-testid="curated-action-scheduling"
                                     onClick={() => handleInsightClick("Help me create a tighter FOH schedule to hit 31% labor target")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-purple-900">Tighten FOH scheduling for January</p>
                                           <p className="text-xs text-gray-500">Target 31% labor by end of month</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-purple-500 flex-shrink-0" />
                                  </button>
                               </>
                            )}
                            {/* Chef Action Items */}
                            {selectedRole === "chef" && (
                               <>
                                  <button 
                                     data-testid="curated-action-produce"
                                     onClick={() => handleInsightClick("Find alternative avocado suppliers to reduce costs by $800/mo")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-orange-900">Review produce supplier pricing — avocado costs up 37%</p>
                                           <p className="text-xs text-gray-500">Impact: $800/mo potential savings</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0" />
                                  </button>
                                  <button 
                                     data-testid="curated-action-menu"
                                     onClick={() => handleInsightClick("Suggest menu changes to reduce high-cost produce items")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-orange-900">Evaluate menu adjustments for high-cost produce items</p>
                                           <p className="text-xs text-gray-500">Consider seasonal alternatives</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0" />
                                  </button>
                                  <button 
                                     data-testid="curated-action-boh"
                                     onClick={() => handleInsightClick("Help coordinate with Sysco for better delivery timing to prevent BOH overtime")}
                                     className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all group text-left"
                                  >
                                     <div className="flex items-start gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                           <p className="font-medium text-gray-900 group-hover:text-orange-900">Coordinate with Sysco on delivery timing</p>
                                           <p className="text-xs text-gray-500">Prevent unplanned BOH overtime</p>
                                        </div>
                                     </div>
                                     <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-orange-500 flex-shrink-0" />
                                  </button>
                               </>
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
                />
              </motion.div>
            )}
          </AnimatePresence>
       </div>
    </Layout>
  );
}
