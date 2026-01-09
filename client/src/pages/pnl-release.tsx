import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/layout";
import confetti from "canvas-confetti";
import munchCatIcon from "../../../attached_assets/Screenshot_2026-01-08_at_12.59.10_PM_1767895210474.png";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Check, 
  ChevronDown, 
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
  Eye
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
  Pie
} from "recharts";
import { useLocation } from "wouter";
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
  { id: "pnl-dashboard", label: "P&L Dashboard" },
  { id: "health-snapshot", label: "Health Snapshot" },
  { id: "revenue-analysis", label: "Revenue Analysis" },
  { id: "prime-cost-analysis", label: "Prime Cost Analysis" },
  { id: "operating-expenses", label: "Operating Expenses" },
  { id: "bottom-line", label: "Bottom Line" },
  { id: "action-items", label: "Action Items" },
  { id: "accountant-note", label: "Accountant Note" },
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

// Hierarchical P&L data structure - Real data from Excel (September 2025 vs August 2025)
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
          { id: 'alcohol-bevs', name: 'Alcohol Bevs', current: 2622, prior: 2598, type: 'revenue' },
          { id: 'n-a-beverage', name: 'N/A Beverage', current: 15076, prior: 20078.45, type: 'revenue' },
        ]
      },
      { id: 'comps-discount', name: 'Comps / Discount', current: -7845.23, prior: -9039.28, type: 'revenue' },
      { id: 'delivery-sales', name: 'Delivery Sales', current: 19727.58, prior: 18785.77, type: 'revenue',
        children: [
          { id: 'classpass', name: 'ClassPass', current: 192.04, prior: 160.12, type: 'revenue' },
          { id: 'doordash', name: 'DoorDash', current: 5269.8, prior: 5920.7, type: 'revenue' },
          { id: 'fantuan', name: 'Fantuan', current: 215.75, prior: 132.95, type: 'revenue' },
          { id: 'grubhub', name: 'GrubHub', current: 1784, prior: 2063.55, type: 'revenue' },
          { id: 'hungrypanda', name: 'HungryPanda', current: 64.7, prior: 393.5, type: 'revenue' },
          { id: 'ubereats', name: 'UberEats', current: 10311.29, prior: 8337.66, type: 'revenue' },
        ]
      },
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
      { id: 'commissary-food', name: 'Commissary Food', current: 19847.4, prior: 23938.32, type: 'expense' },
      { id: 'direct-labor-cost', name: 'Direct Labor Cost', current: 16156.05, prior: 18408.13, type: 'expense',
        children: [
          { id: 'dishwasher', name: 'Dishwasher', current: 3087.86, prior: 3844.52, type: 'expense' },
          { id: 'dishwasher-overtime', name: 'Dishwasher Overtime', current: 278.45, prior: 383.62, type: 'expense' },
          { id: 'server-plater', name: 'Server/Plater', current: 12731.99, prior: 13510.36, type: 'expense' },
          { id: 'server-plater-overtime', name: 'Server/Plater Overtime', current: 57.75, prior: 669.63, type: 'expense' },
        ]
      },
      { id: 'online-delivery-fees', name: 'Online Delivery Fees', current: 3133.72, prior: 0, type: 'expense' },
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
          { id: 'payroll-taxes-benefits', name: 'Payroll Taxes & Benefits', current: 2413.27, prior: 2684.01, type: 'expense' },
          { id: 'salaries-wages', name: 'Salaries & Wages', current: 14249.14, prior: 16221.94, type: 'expense' },
        ]
      },
      { id: 'direct-operating-costs', name: 'Direct Operating Costs', current: 21379.69, prior: 25018.45, type: 'expense',
        children: [
          { id: 'contract-services', name: 'Contract Services', current: 1543.28, prior: 1398.76, type: 'expense' },
          { id: 'credit-card-fees', name: 'Credit Card Fees', current: 3977.74, prior: 4615.28, type: 'expense' },
          { id: 'delivery-service-fees', name: 'Delivery Service Fees', current: 5241.57, prior: 5046.48, type: 'expense' },
          { id: 'marketing-pr', name: 'Marketing & PR', current: 989.25, prior: 2098.35, type: 'expense' },
          { id: 'repairs-maintenance', name: 'Repairs & Maintenance', current: 1150.28, prior: 1680.45, type: 'expense' },
          { id: 'restaurant-supplies', name: 'Restaurant/Kitchen Supplies', current: 7084.03, prior: 7965.46, type: 'expense' },
        ]
      },
      { id: 'general-admin', name: 'General & Administrative', current: 3870.86, prior: 4318.56, type: 'expense',
        children: [
          { id: 'expenses-misc', name: 'Expenses - Misc.', current: 485.35, prior: 762.18, type: 'expense' },
          { id: 'info-technology', name: 'Information Technology', current: 988.46, prior: 1124.58, type: 'expense' },
          { id: 'insurance-expense', name: 'Insurance Expense', current: 1892.23, prior: 1927.45, type: 'expense' },
          { id: 'licenses-permits', name: 'Licenses & Permits', current: 125.82, prior: 145.35, type: 'expense' },
          { id: 'professional-fees', name: 'Professional Fees', current: 379, prior: 359, type: 'expense' },
        ]
      },
      { id: 'occupancy', name: 'Occupancy', current: 17053.5, prior: 19305.08, type: 'expense',
        children: [
          { id: 'real-estate-taxes', name: 'Real Estate Taxes', current: 1857.65, prior: 3836.5, type: 'expense' },
          { id: 'rent', name: 'Rent', current: 12000, prior: 12400, type: 'expense' },
          { id: 'utilities', name: 'Utilities', current: 3195.85, prior: 3068.58, type: 'expense' },
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

  // If flagged with variance
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

    suggestions.push({
      icon: <HelpCircle className={iconClass} />,
      text: 'Why did this change?',
      action: 'ai_explain',
      params: { metric: lineItem.id, variance: varianceInfo }
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
  'revenue': { nodeId: 'revenue', ancestors: [] },
  'labor': { nodeId: 'labor', ancestors: [] },
  'labor_percent': { nodeId: 'labor', ancestors: [] },
  'cogs': { nodeId: 'cogs', ancestors: [] },
  'cogs_percent': { nodeId: 'cogs', ancestors: [] },
  'prime_cost': { nodeId: 'cogs', ancestors: [] }, // Prime cost = COGS + Labor
  'operating_expenses': { nodeId: 'operating-expenses', ancestors: [] },
  'foh_labor': { nodeId: 'foh-labor', ancestors: ['labor'] },
  'boh_labor': { nodeId: 'boh-labor', ancestors: ['labor'] },
  'food_cost': { nodeId: 'food-costs', ancestors: ['cogs'] },
  'beverage_cost': { nodeId: 'beverage-costs', ancestors: ['cogs'] },
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
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-2">
          <ChevronDown className={cn(
            "h-5 w-5 text-gray-400 transition-transform",
            isCollapsed && "-rotate-90"
          )} />
          <h2 className="text-xl font-serif font-bold text-gray-900">P&L Dashboard</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">September 2025 vs August 2025</span>
        </div>
      </button>

      {!isCollapsed && (
        <>

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
            <div className="w-20 text-right">% Profit</div>
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
        </>
      )}
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
                              <th className="text-right px-4 py-2 font-medium text-gray-500">% Profit</th>
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

function GoalProgress({ label, current, target, unit = "%", inverted = false }: { label: string, current: number, target: number, unit?: string, inverted?: boolean }) {
  const progress = Math.min((current / target) * 100, 100);
  const isGood = inverted ? current <= target : current >= target;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-all">
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif">{current}{unit}</span>
            <span className="text-xs text-muted-foreground mb-1">/ {target}{unit} Goal</span>
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

    await new Promise(r => setTimeout(r, 1500));

    const assistantMsg: FloatingMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Here are some suggested improvements based on your October report:",
      artifact: true
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
              <button 
                onClick={handleCollapse}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
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
                        <p className="text-sm text-gray-700 pt-1.5">{msg.content}</p>
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
  const [showChat, setShowChat] = useState(false); // Disabled - using floating assistant instead
  const [chatTrigger, setChatTrigger] = useState<string | null>(null);
  const [floatingChatTrigger, setFloatingChatTrigger] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"detailed" | "curated">("detailed");
  const [activeSection, setActiveSection] = useState<string>("executive-narrative");
  const [tocDropdownOpen, setTocDropdownOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<StateBenchmark | null>(null);
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
  // Initialize role from URL param if viewing as owner/gm/chef, otherwise default to owner
  const [selectedRole, setSelectedRole] = useState<"owner" | "gm" | "chef">(urlRole || "owner");
  const [showFullPnl, setShowFullPnl] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [goalsMet, setGoalsMet] = useState(true); // Mock state for confetti
  const [highlightedPnlNodeId, setHighlightedPnlNodeId] = useState<string | null>(null);
  const [trendModalMetric, setTrendModalMetric] = useState<MetricTrendData | null>(null);

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
  };

  // --- Owner View (Customer Facing) ---
  if (isOwnerView) {
     return (
        <Layout>
           <div className="min-h-screen bg-gray-50 flex overflow-hidden">

              {/* Left Navigation (Google Docs Style) */}
              <div className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col h-full overflow-y-auto">
                 <div className="p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Report Archive</h2>
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
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex justify-center overflow-y-auto">
                 <div className="w-full max-w-4xl bg-white shadow-sm border-x border-gray-200 min-h-screen pb-32">
                    {/* Header */}
                    <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 z-10">
                       <div className="flex items-center justify-between mb-3">
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
                          <div className="flex gap-2">
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
                       {/* Role Toggle */}
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                             <span>Viewing as:</span>
                             <span className={cn(
                                "font-medium",
                                selectedRole === "owner" ? "text-blue-600" : 
                                selectedRole === "gm" ? "text-purple-600" : 
                                "text-orange-600"
                             )}>
                                {selectedRole === "owner" ? "Owner" : selectedRole === "gm" ? "General Manager" : "Executive Chef"}
                             </span>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                             <button 
                                data-testid="button-owner-role-owner"
                                onClick={() => setLocation("/finance/pnl-release?view=owner")}
                                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", selectedRole === "owner" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                             >
                                Owner
                             </button>
                             <button 
                                data-testid="button-owner-role-gm"
                                onClick={() => setLocation("/finance/pnl-release?view=gm")}
                                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", selectedRole === "gm" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                             >
                                GM
                             </button>
                             <button 
                                data-testid="button-owner-role-chef"
                                onClick={() => setLocation("/finance/pnl-release?view=chef")}
                                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", selectedRole === "chef" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                             >
                                Executive Chef
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 space-y-10">

                       {/* Financial Overview - New Section */}
                       <section>
                          <h2 className="text-lg font-serif font-bold text-gray-900 mb-6">Financial Overview</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <GoalProgress label="Total Sales" current={124.5} target={120} unit="k" />
                             <GoalProgress label="Net Profit %" current={18} target={15} unit="%" />
                             <GoalProgress label="COGS %" current={31} target={30} unit="%" inverted={true} />
                             <GoalProgress label="Labor %" current={33} target={35} unit="%" inverted={true} />
                          </div>
                       </section>

                       {/* 2. Key Insights Breakdown */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <TrendingUp className="h-5 w-5 text-black" /> Performance Analysis
                          </h3>

                          <div className="grid gap-4">
                             <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                                <h4 className="font-medium text-emerald-900 mb-3 flex items-center gap-2">
                                   <ArrowUp className="h-4 w-4" /> Wins (What's working)
                                </h4>
                                <ul className="space-y-4">
                                   <li className="flex gap-3 text-sm text-gray-700 items-start group">
                                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Labor % improved: 35% → 32% <span className="text-emerald-600">(saved $2,400)</span></div>
                                        <p className="text-gray-600">Dinner shifts on Tue/Wed operated with 1 less runner, saving 40 hours. This hit Sarah's "Under 33% Labor" goal — she's now eligible for her <strong>$500 quarterly bonus</strong>.</p>
                                      </div>
                                      <button 
                                        onClick={() => handleInsightClick("Tell me more about the labor efficiency improvements on Tue/Wed")}
                                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ask Assistant for details"
                                      >
                                        <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </li>
                                   <li className="flex gap-3 text-sm text-gray-700 items-start group">
                                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Sales exceeded target: $124.5k vs $120k goal <span className="text-emerald-600">(+$4.5k)</span></div>
                                        <p className="text-gray-600">Weekend brunch traffic was up 12% YoY. The "Smoked Salmon Benedict" special sold 145 units (+40 vs forecast). FOH upsell rate on Mimosas hit 18%, adding $1,200 to revenue.</p>
                                      </div>
                                      <button 
                                        onClick={() => handleInsightClick("Analyze the sales goal variance and weekend brunch performance")}
                                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ask Assistant for details"
                                      >
                                        <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </li>
                                   <li className="flex gap-3 text-sm text-gray-700 items-start group">
                                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Net Profit up: 15% → 18% <span className="text-emerald-600">(+$3,735)</span></div>
                                        <p className="text-gray-600">Combined labor savings and strong sales outpaced the COGS increase, pushing net profit 3 points above target.</p>
                                      </div>
                                      <button 
                                        onClick={() => handleInsightClick("What drove the net profit improvement?")}
                                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ask Assistant for details"
                                      >
                                        <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </li>
                                </ul>
                             </div>

                             <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                                <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                                   <AlertTriangle className="h-4 w-4" /> Opportunities (Where we lost out)
                                </h4>
                                <ul className="space-y-4">
                                   <li className="flex gap-3 text-sm text-gray-700 items-start group">
                                      <ArrowDown className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">COGS % missed target: 31% vs 30% goal <span className="text-amber-600">(-$1,245)</span></div>
                                        <p className="text-gray-600">Produce prices spiked mid-month. <strong>Avocados</strong>: $45 → $62/case (+37%). <strong>Limes</strong>: $32 → $41 (+28%). These two items alone caused $980 of the variance. A local vendor "GreenLeaf" offers avocados at $48/case.</p>
                                      </div>
                                      <button 
                                        onClick={() => handleInsightClick("Why did produce COGS spike? Show me details on Avocados and Limes.")}
                                        className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ask Assistant for details"
                                      >
                                        <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </li>
                                   <li className="flex gap-3 text-sm text-gray-700 items-start group">
                                      <ArrowDown className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 mb-1">Unplanned overtime: 12 hours <span className="text-amber-600">(-$350)</span></div>
                                        <p className="text-gray-600">Kitchen prep team stayed late on 10/14 due to Sysco delivery arriving at 2PM instead of 10AM. Adjusting the delivery window to 8-10AM would prevent this next month.</p>
                                      </div>
                                      <button 
                                        onClick={() => handleInsightClick("Show me the breakdown of overtime hours and who was affected.")}
                                        className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ask Assistant for details"
                                      >
                                        <Lightbulb className="h-4 w-4" />
                                      </button>
                                   </li>
                                </ul>
                                <div className="mt-4 pt-3 border-t border-amber-200">
                                  <p className="text-xs text-amber-800">
                                    <strong>To hit your 30% COGS goal:</strong> Switch avocado supplier (+$600/mo) and negotiate lime pricing (+$180/mo) = 1% savings on COGS.
                                  </p>
                                </div>
                             </div>
                          </div>
                       </section>

                       {/* 3. Shopping Cart / Impact Analysis */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">Impact Analysis</h3>
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                             <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">If you had adjusted these items...</span>
                                <span className="text-xs text-muted-foreground">Est. Margin Impact</span>
                             </div>
                             <div className="divide-y divide-gray-100">
                                <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setShowChat(true)}>
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                         <X className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">Cut 10hrs of Prep Overtime</p>
                                         <p className="text-xs text-muted-foreground">Kitchen Staff • Oct 14</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className="text-sm font-medium text-emerald-600">+$350</span>
                                      <span className="text-xs text-gray-400 block group-hover:text-black transition-colors">Ask AI why →</span>
                                   </div>
                                </div>
                                <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setShowChat(true)}>
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                         <X className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">Switch Avocado Supplier</p>
                                         <p className="text-xs text-muted-foreground">COGS • Produce</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className="text-sm font-medium text-emerald-600">+$800</span>
                                      <span className="text-xs text-gray-400 block group-hover:text-black transition-colors">Ask AI for options →</span>
                                   </div>
                                </div>
                             </div>
                             <div className="p-4 bg-emerald-50/30 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900">Potential Net Income Increase</span>
                                <span className="text-lg font-serif font-bold text-emerald-700">+$1,150</span>
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

                       {/* Full Table */}
                       <div className="border-t border-gray-100 pt-8">
                          <button 
                             onClick={() => setShowFullPnl(!showFullPnl)}
                             className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
                          >
                             <span className="font-medium text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" /> Full P&L Detail
                             </span>
                             {showFullPnl ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                          </button>

                          {showFullPnl && (
                             <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                   <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-medium">
                                      <tr>
                                         <th className="px-4 py-3">Category</th>
                                         <th className="px-4 py-3 text-right">Current</th>
                                         <th className="px-4 py-3 text-right">Var</th>
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-100">
                                      {pnlData.map((row) => (
                                         <tr key={row.category} className={cn("hover:bg-gray-50", row.category === "Net Income" ? "bg-gray-50 font-bold" : "")}>
                                            <td className="px-4 py-3 font-medium">{row.category}</td>
                                            <td className="px-4 py-3 text-right">${row.current.toLocaleString()}</td>
                                            <td className={cn("px-4 py-3 text-right font-medium", row.variance > 0 ? "text-emerald-600" : "text-red-600")}>
                                               {row.variance > 0 ? "+" : ""}{row.variance.toLocaleString()}
                                            </td>
                                         </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Split Screen Chat Interface */}
              <OwnerChat 
                isOpen={showChat} 
                onClose={() => setShowChat(false)} 
                triggerQuery={chatTrigger ? chatTrigger.split(" ").slice(0, -1).join(" ") : null}
              />
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
                        setPeriod("October 2025");
                        setStep(2);
                     }}
                     className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
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
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                         <Save className="h-4 w-4" /> Save Draft
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
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 flex overflow-hidden min-h-0">


                {/* Main Scrollable Content */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto h-full">
                {activeTab === "detailed" ? (
                <div className="p-8">
                      <div className="max-w-5xl mx-auto space-y-8">

                   {/* 1. Executive Narrative */}
                   <section id="executive-narrative" className="scroll-mt-4">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Executive Narrative</h2>
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
                            </div>
                         </div>
                      </div>
                   </section>

                   {/* 2. P&L Dashboard - Intelligent Hierarchical View */}
                   <PnLDashboard 
                     onInsightClick={handleInsightClick} 
                     highlightedNodeId={highlightedPnlNodeId}
                     onHighlightClear={() => setHighlightedPnlNodeId(null)}
                     onTrendClick={openTrendModal}
                   />

                   {/* 3. Health Snapshot */}
                   <section id="health-snapshot" className="scroll-mt-4">
                      <div className="flex items-center justify-between mb-1">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Health Snapshot</h2>
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
                      <p className="text-sm text-muted-foreground mb-4">Key Performance Indicators <span className="text-gray-400">• Click a metric to view trends</span></p>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100">
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Metric</th>
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Actual</th>
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">Target</th>
                                  <th className="text-left px-6 py-4 font-medium text-gray-500">% Profit</th>
                                  <th className="text-right px-6 py-4 font-medium text-gray-500">Status</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr 
                                  onClick={() => openTrendModal('net-sales')} 
                                  className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                  data-testid="health-row-net-sales"
                               >
                                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                    Net Sales
                                    <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">$133,042</td>
                                  <td className="px-6 py-4 text-gray-500">$150,000</td>
                                  <td className="px-6 py-4 text-red-600 font-medium">-11.3%</td>
                                  <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">NEEDS ATTENTION</span></td>
                               </tr>
                               <tr 
                                  onClick={() => openTrendModal('prime-cost')} 
                                  className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                  data-testid="health-row-prime-cost"
                               >
                                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                    Prime Cost %
                                    <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">54.0%</td>
                                  <td className="px-6 py-4 text-gray-500">50.0%</td>
                                  <td className="px-6 py-4 text-red-600 font-medium">+4.0pts</td>
                                  <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">NEEDS ATTENTION</span></td>
                               </tr>
                               <tr 
                                  onClick={() => openTrendModal('labor')} 
                                  className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                  data-testid="health-row-labor"
                               >
                                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                    Labor %
                                    <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">12.1%</td>
                                  <td className="px-6 py-4 text-gray-500">12.0%</td>
                                  <td className="px-6 py-4 text-amber-600 font-medium">+0.1pts</td>
                                  <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">ON TRACK</span></td>
                               </tr>
                               <tr 
                                  onClick={() => openTrendModal('cogs')} 
                                  className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                  data-testid="health-row-cogs"
                               >
                                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                    COGS %
                                    <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">41.8%</td>
                                  <td className="px-6 py-4 text-gray-500">38.0%</td>
                                  <td className="px-6 py-4 text-red-600 font-medium">+3.8pts</td>
                                  <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">NEEDS ATTENTION</span></td>
                               </tr>
                               <tr 
                                  onClick={() => openTrendModal('net-income')} 
                                  className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                  data-testid="health-row-net-income"
                               >
                                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                    Net Margin %
                                    <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">13.3%</td>
                                  <td className="px-6 py-4 text-gray-500">15.0%</td>
                                  <td className="px-6 py-4 text-red-600 font-medium">-1.7pts</td>
                                  <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">MONITOR</span></td>
                               </tr>
                               <tr 
                                  onClick={() => openTrendModal('gross-profit')} 
                                  className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                  data-testid="health-row-gross-profit"
                               >
                                  <td className="px-6 py-4 text-gray-900 flex items-center gap-2">
                                    Gross Profit
                                    <TrendingUp className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">$77,372</td>
                                  <td className="px-6 py-4 text-gray-500">$93,000</td>
                                  <td className="px-6 py-4 text-red-600 font-medium">-$15.6k</td>
                                  <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">NEEDS ATTENTION</span></td>
                               </tr>
                            </tbody>
                         </table>
                      </div>
                   </section>

                   {/* 3. Revenue Analysis */}
                   <section id="revenue-analysis" className="scroll-mt-4">
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

                   {/* 4. Prime Cost Analysis */}
                   <section id="prime-cost-analysis" className="scroll-mt-4">
                      <div className="flex items-center justify-between mb-1">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Prime Cost Analysis</h2>
                         <div className="flex items-center gap-2">
                            {/* State Benchmark Selector */}
                            <div ref={stateDropdownRef} className="relative">
                               <button
                                  data-testid="state-selector-btn"
                                  onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                                  className={cn(
                                     "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                                     selectedState 
                                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                  )}
                               >
                                  <Target className="h-3.5 w-3.5" />
                                  {selectedState ? selectedState.code : "Select State"}
                                  <ChevronDown className={cn(
                                     "h-3 w-3 transition-transform duration-150",
                                     stateDropdownOpen && "rotate-180"
                                  )} />
                               </button>
                               
                               {/* State Dropdown */}
                               {stateDropdownOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                     <div className="px-3 pb-2 border-b border-gray-100">
                                        <div className="relative">
                                           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                           <input
                                              type="text"
                                              placeholder="Search states..."
                                              value={stateSearchQuery}
                                              onChange={(e) => setStateSearchQuery(e.target.value)}
                                              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                              autoFocus
                                           />
                                        </div>
                                     </div>
                                     <div className="max-h-48 overflow-y-auto">
                                        {stateBenchmarks
                                           .filter(s => 
                                              s.name.toLowerCase().includes(stateSearchQuery.toLowerCase()) ||
                                              s.code.toLowerCase().includes(stateSearchQuery.toLowerCase())
                                           )
                                           .map((state) => (
                                              <button
                                                 key={state.code}
                                                 data-testid={`state-option-${state.code}`}
                                                 onClick={() => {
                                                    setSelectedState(state);
                                                    setStateDropdownOpen(false);
                                                    setStateSearchQuery("");
                                                 }}
                                                 className={cn(
                                                    "w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors",
                                                    selectedState?.code === state.code && "bg-blue-50 text-blue-700"
                                                 )}
                                              >
                                                 <span>{state.name}</span>
                                                 <span className="text-gray-400 text-xs">{state.code}</span>
                                              </button>
                                           ))
                                        }
                                     </div>
                                  </div>
                               )}
                            </div>
                            
                            {/* Info Tooltip */}
                            <div className="relative group">
                               <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                                  <HelpCircle className="h-4 w-4" />
                               </button>
                               <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg">
                                  Prime cost benchmarks vary by state based on regional labor costs and food pricing. Select your state to compare your performance against industry standards.
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
                               {selectedState && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                     vs {selectedState.code}
                                  </span>
                               )}
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Budget (61.5%) to Actual (62.1%)</p>
                            <div className="space-y-3">
                               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-gray-600">Budget Prime Cost:</span>
                                  <div className="text-right">
                                     <span className="font-medium text-gray-900">61.5%</span>
                                     <span className="text-gray-500 text-sm ml-2">($161,130)</span>
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
                               {/* State Benchmark Comparison Row */}
                               {selectedState && (
                                  <div className={cn(
                                     "flex justify-between items-center py-3 rounded-lg px-3 mt-2 border",
                                     62.1 <= selectedState.primeCost 
                                        ? "bg-emerald-50 border-emerald-200" 
                                        : 62.1 - selectedState.primeCost <= 2 
                                           ? "bg-amber-50 border-amber-200"
                                           : "bg-red-50 border-red-200"
                                  )}>
                                     <div className="flex items-center gap-2">
                                        <Target className={cn(
                                           "h-4 w-4",
                                           62.1 <= selectedState.primeCost 
                                              ? "text-emerald-600" 
                                              : 62.1 - selectedState.primeCost <= 2 
                                                 ? "text-amber-600"
                                                 : "text-red-600"
                                        )} />
                                        <span className="text-gray-700">{selectedState.code} State Benchmark:</span>
                                     </div>
                                     <div className="text-right flex items-center gap-3">
                                        <span className="font-bold text-gray-900">{selectedState.primeCost}%</span>
                                        <span className={cn(
                                           "text-sm font-medium px-2 py-0.5 rounded",
                                           62.1 <= selectedState.primeCost 
                                              ? "bg-emerald-100 text-emerald-700" 
                                              : 62.1 - selectedState.primeCost <= 2 
                                                 ? "bg-amber-100 text-amber-700"
                                                 : "bg-red-100 text-red-700"
                                        )}>
                                           {62.1 <= selectedState.primeCost 
                                              ? `${(selectedState.primeCost - 62.1).toFixed(1)}% below` 
                                              : `${(62.1 - selectedState.primeCost).toFixed(1)}% above`}
                                        </span>
                                     </div>
                                  </div>
                               )}
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
                         <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actual</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">Budget</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% Profit</th>
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% of Sales</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50 font-semibold">
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
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">FOH Labor</td>
                                  <td className="px-6 py-4 text-right">$42,100</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$37,800</td>
                                  <td className="px-6 py-4 text-right text-red-600">+$4,300</td>
                                  <td className="px-6 py-4 text-right text-gray-600">14.3%</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Management</td>
                                  <td className="px-6 py-4 text-right">$12,600</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$12,600</td>
                                  <td className="px-6 py-4 text-right text-gray-600">$0</td>
                                  <td className="px-6 py-4 text-right text-gray-600">4.3%</td>
                               </tr>
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

                      {/* Labor Efficiency Metrics */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Labor Efficiency Metrics</h3>
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
                                     <td className="py-3 text-right font-medium">$48.20</td>
                                     <td className="py-3 text-right text-gray-500">$50.00</td>
                                     <td className="py-3 text-right"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">MONITOR</span></td>
                                  </tr>
                                  <tr>
                                     <td className="py-3 text-gray-900">Labor Hours / Guest</td>
                                     <td className="py-3 text-right font-medium">0.71</td>
                                     <td className="py-3 text-right text-gray-500">0.68</td>
                                     <td className="py-3 text-right"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">MONITOR</span></td>
                                  </tr>
                                  <tr>
                                     <td className="py-3 text-gray-900">Overtime % of Total</td>
                                     <td className="py-3 text-right font-medium">7.4%</td>
                                     <td className="py-3 text-right text-gray-500">4.0%</td>
                                     <td className="py-3 text-right"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">ATTENTION</span></td>
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
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% Profit</th>
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
                   <section id="operating-expenses" className="scroll-mt-4">
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
                                  <th className="text-right px-6 py-3 font-medium text-gray-500">% Profit</th>
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
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               <tr className="hover:bg-gray-50 font-semibold">
                                  <td className="px-6 py-4 text-gray-900">Total Occupancy</td>
                                  <td className="px-6 py-4 text-right">$28,500</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$28,500</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Rent</td>
                                  <td className="px-6 py-4 text-right">$18,000</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$18,000</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">CAM / Property Tax</td>
                                  <td className="px-6 py-4 text-right">$4,500</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$4,500</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Insurance</td>
                                  <td className="px-6 py-4 text-right">$3,200</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$3,200</td>
                               </tr>
                               <tr className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-gray-700 pl-10">Depreciation</td>
                                  <td className="px-6 py-4 text-right">$2,800</td>
                                  <td className="px-6 py-4 text-right text-gray-500">$2,800</td>
                               </tr>
                            </tbody>
                         </table>
                         <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-600">No variance — as expected for fixed costs</p>
                         </div>
                      </div>
                   </section>

                   {/* 6. Bottom Line */}
                   <section id="bottom-line" className="scroll-mt-4">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-serif font-bold text-gray-900">Bottom Line</h2>
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

                   {/* 7. Action Items & Recommendations */}
                   <section id="action-items" className="scroll-mt-4">
                      <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Action Items & Recommendations</h2>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                         <div className="space-y-4">
                            {/* Priority Action Item 1 */}
                            <div data-testid="action-item-ot-policy" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                               <div className="flex items-start gap-3">
                                  <div data-testid="status-high-priority" className="h-2.5 w-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                  <div>
                                     <p data-testid="text-action-ot-policy" className="font-medium text-gray-900">Review OT policy — 142 hours is unsustainable</p>
                                     <p className="text-sm text-gray-500">Owner: <span className="font-medium">GM</span> &nbsp;•&nbsp; Impact: $1,500/mo potential</p>
                                  </div>
                               </div>
                               <button data-testid="button-assign-ot-policy" className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  Assign
                               </button>
                            </div>

                            {/* Priority Action Item 2 */}
                            <div data-testid="action-item-delivery-commission" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                               <div className="flex items-start gap-3">
                                  <div data-testid="status-medium-priority" className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                  <div>
                                     <p data-testid="text-action-delivery-commission" className="font-medium text-gray-900">Renegotiate delivery commission with DoorDash</p>
                                     <p className="text-sm text-gray-500">Owner: <span className="font-medium">Owner</span> &nbsp;•&nbsp; Impact: $400/mo potential</p>
                                  </div>
                               </div>
                               <button data-testid="button-assign-delivery-commission" className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  Assign
                               </button>
                            </div>

                            {/* Priority Action Item 3 */}
                            <div data-testid="action-item-hvac-repair" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                               <div className="flex items-start gap-3">
                                  <div data-testid="status-low-priority" className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                  <div>
                                     <p data-testid="text-action-hvac-repair" className="font-medium text-gray-900">Investigate HVAC repair — one-time or recurring?</p>
                                     <p className="text-sm text-gray-500">Owner: <span className="font-medium">GM</span> &nbsp;•&nbsp; Impact: Budgeting clarity</p>
                                  </div>
                               </div>
                               <button data-testid="button-assign-hvac-repair" className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  Assign
                               </button>
                            </div>

                            {/* Priority Action Item 4 - Executive Chef */}
                            <div data-testid="action-item-produce-pricing" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                               <div className="flex items-start gap-3">
                                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                  <div>
                                     <p data-testid="text-action-produce-pricing" className="font-medium text-gray-900">Review produce supplier pricing — avocado costs up 37%</p>
                                     <p className="text-sm text-gray-500">Owner: <span className="font-medium">Executive Chef</span> &nbsp;•&nbsp; Impact: $800/mo potential</p>
                                  </div>
                               </div>
                               <button data-testid="button-assign-produce-pricing" className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  Assign
                               </button>
                            </div>
                         </div>
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
                   </section>

                   {/* Accountant Note */}
                   <section id="accountant-note" className="scroll-mt-4">
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

                      </div>
                </div>
                ) : (
                /* Curated View - Role-based Preview */
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
                               <GoalProgress label="Total Sales" current={124.5} target={120} unit="k" />
                               <GoalProgress label="Net Profit %" current={18} target={15} unit="%" />
                               <GoalProgress label="COGS %" current={31} target={30} unit="%" inverted={true} />
                               <GoalProgress label="Labor %" current={33} target={35} unit="%" inverted={true} />
                            </>
                         )}
                         {/* GM sees sales, labor (FOH focus), and operations */}
                         {selectedRole === "gm" && (
                            <>
                               <GoalProgress label="Total Sales" current={124.5} target={120} unit="k" />
                               <GoalProgress label="FOH Labor %" current={14.3} target={14} unit="%" inverted={true} />
                               <GoalProgress label="Table Turns" current={2.4} target={2.2} unit="" />
                               <GoalProgress label="Guest Count" current={8580} target={7800} unit="" />
                            </>
                         )}
                         {/* Executive Chef sees COGS, BOH labor */}
                         {selectedRole === "chef" && (
                            <>
                               <GoalProgress label="COGS %" current={31} target={30} unit="%" inverted={true} />
                               <GoalProgress label="Food Cost %" current={23.3} target={24} unit="%" inverted={true} />
                               <GoalProgress label="BOH Labor %" current={13} target={12.5} unit="%" inverted={true} />
                               <GoalProgress label="Beverage Cost %" current={4.8} target={5} unit="%" inverted={true} />
                            </>
                         )}
                      </div>
                   </section>

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
                                           <p className="text-sm font-medium text-gray-900">Labor % improved: 35% → 32%</p>
                                           <p className="text-xs text-muted-foreground">Dinner shifts on Tue/Wed operated with 1 less runner</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$2,400</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Sales exceeded target: $124.5k vs $120k goal</p>
                                           <p className="text-xs text-muted-foreground">Weekend brunch traffic was up 12% YoY</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$4,500</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                           <Check className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Net Profit up: 15% → 18%</p>
                                           <p className="text-xs text-muted-foreground">Combined labor savings and strong sales outpaced COGS increase</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-emerald-600">+$3,735</span>
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
                                              <p className="text-sm font-medium text-gray-900">COGS % missed target: 31% vs 30% goal</p>
                                              <p className="text-xs text-muted-foreground">Produce prices spiked: Avocados +37%, Limes +28%</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$1,245</span>
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
                                              <p className="text-sm font-medium text-gray-900">Overtime ran high: 142 hrs vs 80 budgeted</p>
                                              <p className="text-xs text-muted-foreground">Holiday weeks drove excess overtime across BOH and FOH</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-sm font-medium text-amber-600">-$3,200</span>
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
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                           <AlertTriangle className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">FOH overtime exceeded budget by 62 hours</p>
                                           <p className="text-xs text-muted-foreground">Need better scheduling for January</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-amber-600">-$1,800</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                           <AlertTriangle className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Week 2 over-scheduled by 2.1 hrs/day</p>
                                           <p className="text-xs text-muted-foreground">Tighter scheduling alignment with traffic patterns</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-amber-600">-$680</span>
                                  </div>
                               </>
                            )}
                            {selectedRole === "chef" && (
                               <>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                           <AlertTriangle className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">Produce costs spiked: Avocados +37%, Limes +28%</p>
                                           <p className="text-xs text-muted-foreground">Evaluate alternative suppliers or menu adjustments</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-amber-600">-$800</span>
                                  </div>
                                  <div className="p-4 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                           <AlertTriangle className="h-4 w-4" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-medium text-gray-900">BOH overtime: 12 unplanned hours</p>
                                           <p className="text-xs text-muted-foreground">Sysco delivery arrived late on 10/14</p>
                                        </div>
                                     </div>
                                     <span className="text-sm font-medium text-amber-600">-$350</span>
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
                      <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
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

          <OwnerChat 
            isOpen={showChat} 
            onClose={() => setShowChat(false)} 
            triggerQuery={chatTrigger ? chatTrigger.split(" ").slice(0, -1).join(" ") : null} 
          />

          <FloatingAssistantBar triggerQuery={floatingChatTrigger} />
       </div>
    </Layout>
  );
}
