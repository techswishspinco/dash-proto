import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { stateBenchmarks, type StateBenchmark } from "@/data/pnl/state-benchmarks";
import { healthSnapshotTrendData } from "@/data/pnl/health-snapshot-data";
import { getAggregatedTrends, type RoleType } from "@/components/pnl/PrimaryInsightCard";
import type { MetricTrendData } from "@/components/pnl/TrendChartModal";
import type { ActionItem } from "@/components/assistant/SidePanelAssistant";
import type { CuratedFilterId } from "@/data/pnl/curated-view-config";
import { getDefaultFiltersForRole } from "@/data/pnl/curated-view-config";
import type { PrimaryInsight } from "@/components/pnl/PrimaryInsightCard";
import { getYTDSummary } from "@/data/pl-parser";

export interface EditableSection {
  id: string;
  label: string;
  visible: boolean;
}

export interface Report {
  id: string;
  title: string;
  content: string;
}

export interface CuratedViewPrefs {
  owner: CuratedFilterId[];
  gm: CuratedFilterId[];
  chef: CuratedFilterId[];
  hasSeenHint: boolean;
}

export const defaultSections: EditableSection[] = [
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

interface PnLContextValue {
  locationName: string;
  period: string;
  canEdit: boolean;
  isOwnerView: boolean;
  urlRole: RoleType | null;
  selectedRole: RoleType;
  setSelectedRole: (role: RoleType) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  floatingChatTrigger: string | null;
  setFloatingChatTrigger: (trigger: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportTabs: Report[];
  setReportTabs: React.Dispatch<React.SetStateAction<Report[]>>;
  actionItems: ActionItem[];
  setActionItems: React.Dispatch<React.SetStateAction<ActionItem[]>>;
  showActionCart: boolean;
  setShowActionCart: (show: boolean) => void;
  handleAddActionItem: (item: Omit<ActionItem, "id" | "createdAt" | "status">) => void;
  handleRemoveActionItem: (id: string) => void;
  sections: EditableSection[];
  setSections: React.Dispatch<React.SetStateAction<EditableSection[]>>;
  isSectionVisible: (sectionId: string) => boolean;
  getSectionOrderIndex: (sectionId: string) => number;
  toggleSectionVisibility: (sectionId: string) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  showSectionsSidebar: boolean;
  setShowSectionsSidebar: (show: boolean) => void;
  selectedState: StateBenchmark | null;
  setSelectedState: (state: StateBenchmark | null) => void;
  grossProfitExpanded: boolean;
  setGrossProfitExpanded: (expanded: boolean) => void;
  netIncomeExpanded: boolean;
  setNetIncomeExpanded: (expanded: boolean) => void;
  expandedRows: Set<string>;
  toggleRow: (rowId: string) => void;
  isProfitabilityExpanded: boolean;
  setIsProfitabilityExpanded: (expanded: boolean) => void;
  note: string;
  setNote: (note: string) => void;
  healthTargets: Record<string, { pct: number; dollar: number }>;
  setHealthTargets: React.Dispatch<React.SetStateAction<Record<string, { pct: number; dollar: number }>>>;
  updateHealthTarget: (metricId: string, field: 'pct' | 'dollar', value: number) => void;
  healthActuals: Record<string, { pct: number; dollar: number }>;
  getHealthVariance: (metricId: string, isInverse?: boolean) => any;
  healthSnapshotMode: "percentage" | "actual";
  setHealthSnapshotMode: (mode: "percentage" | "actual") => void;
  laborBudgetPct: number;
  isCustomLaborBudget: boolean;
  laborActuals: Record<string, number>;
  getLaborBudgetForCategory: (id: string, revenue: number) => number;
  getLaborVariance: (id: string, revenue?: number) => any;
  handleLaborBudgetChange: (newPct: number) => void;
  resetLaborBudgetToDefault: () => void;
  laborEfficiencyTargets: Record<string, number>;
  setLaborEfficiencyTargets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  laborEfficiencyActuals: Record<string, number>;
  getLaborEfficiencyStatus: (id: string, isInverse?: boolean) => any;
  handleEfficiencyTargetChange: (id: string, value: number) => void;
  resetEfficiencyTarget: (id: string) => void;
  isCustomEfficiencyTargets: Record<string, boolean>;
  cogsBudgetPct: number;
  isCustomCogsBudget: boolean;
  cogsActuals: Record<string, number>;
  getCogsBudgetForCategory: (id: string) => number;
  getCogsVariance: (id: string) => any;
  handleCogsBudgetChange: (newPct: number) => void;
  resetCogsBudgetToDefault: () => void;
  primeCostTargetLower: number;
  primeCostTargetUpper: number;
  isCustomPrimeCostTarget: boolean;
  handlePrimeCostTargetChange: (type: "lower" | "upper", value: number) => void;
  resetPrimeCostTarget: () => void;
  getPrimeCostTargetLabel: () => string;
  controllableBudgets: Record<string, number>;
  setControllableBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  controllableActuals: Record<string, number>;
  getControllableVariance: (id: string) => any;
  occupancyBudgets: Record<string, number>;
  setOccupancyBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  occupancyActuals: Record<string, number>;
  getOccupancyVariance: (id: string) => any;
  healthSnapshotTrendData: MetricTrendData[];
  aggregatedTrends: MetricTrendData[];
  healthComparisonPeriod: "week" | "month" | "quarter" | "year";
  setHealthComparisonPeriod: (period: "week" | "month" | "quarter" | "year") => void;
  trendModalMetric: MetricTrendData | null;
  setTrendModalMetric: (metric: MetricTrendData | null) => void;
  openTrendModal: (metricId: string) => void;
  activeGMFilter: string | null;
  setActiveGMFilter: (filter: string | null) => void;
  gmTimeRange: string;
  setGmTimeRange: (range: string) => void;
  selectedGMDate: Date;
  setSelectedGMDate: (date: Date) => void;
  chefTimeRange: string;
  setChefTimeRange: (range: string) => void;
  selectedChefDate: Date;
  setSelectedChefDate: (date: Date) => void;
  insightModalMetric: string | null;
  setInsightModalMetric: (metric: string | null) => void;
  handleGenerateChefInsightReport: () => void;
  handleGenerateOwnerInsightReport: (insight: PrimaryInsight) => void;
  handleGenerateGMInsightReport: (insight: PrimaryInsight) => void;
  handleGenerateFoodCostReport: () => void;
  handleOpenReport: (report: Report) => void;
  viewModes: Record<string, "data" | "chart">;
  setViewModes: React.Dispatch<React.SetStateAction<Record<string, "data" | "chart">>>;
  curatedPrefs: CuratedViewPrefs;
  setCuratedPrefs: React.Dispatch<React.SetStateAction<CuratedViewPrefs>>;
  showEmailReportModal: boolean;
  setShowEmailReportModal: (show: boolean) => void;
  emailRecipients: string[];
  setEmailRecipients: React.Dispatch<React.SetStateAction<string[]>>;
  emailSending: boolean;
  setEmailSending: (sending: boolean) => void;
  showEmailPreview: boolean;
  setShowEmailPreview: (show: boolean) => void;
  getDashboardMetrics: (period: string, trends: MetricTrendData[]) => any;
  PERIOD_REVENUE: number;
  editableContent: Record<string, string>;
  setEditableContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  toast: ReturnType<typeof useToast>["toast"];
  reportsList: any[];
  setReportsList: React.Dispatch<React.SetStateAction<any[]>>;
  activeReportId: string | null;
  setActiveReportId: (id: string | null) => void;
  handleInsightClick: (query: string) => void;
  removeSection: (sectionId: string) => void;
  scrollToSection: (sectionId: string) => void;
  highlightedPnlNodeId: string | null;
  setHighlightedPnlNodeId: (id: string | null) => void;
  navigateToPnlNode: (metricKey: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const PnLContext = createContext<PnLContextValue | null>(null);

export function usePnL() {
  const context = useContext(PnLContext);
  if (!context) throw new Error("usePnL must be used within PnLProvider");
  return context;
}

interface PnLProviderProps {
  children: ReactNode;
  canEdit: boolean;
  isOwnerView: boolean;
  urlRole: RoleType | null;
  locationName: string;
  period: string;
}

export function PnLProvider({ children, canEdit, isOwnerView, urlRole, locationName, period }: PnLProviderProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleType>(urlRole || "owner");
  const [showChat, setShowChat] = useState(true);
  const [floatingChatTrigger, setFloatingChatTrigger] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("curated");
  const [reportTabs, setReportTabs] = useState<Report[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [showActionCart, setShowActionCart] = useState(false);
  const [sections, setSections] = useState<EditableSection[]>(defaultSections);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSectionsSidebar, setShowSectionsSidebar] = useState(false);
  const [selectedState, setSelectedState] = useState<StateBenchmark | null>(stateBenchmarks.find(s => s.code === "NY") || null);
  const [grossProfitExpanded, setGrossProfitExpanded] = useState(false);
  const [netIncomeExpanded, setNetIncomeExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["boh-labor", "foh-labor"]));
  const [isProfitabilityExpanded, setIsProfitabilityExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [healthTargets, setHealthTargets] = useState<Record<string, { pct: number; dollar: number }>>({ "net-sales": { pct: 100.0, dollar: 150000 }, "prime-cost": { pct: 50.0, dollar: 66521 }, "labor": { pct: 12.0, dollar: 15965 }, "cogs": { pct: 38.0, dollar: 50556 }, "net-income": { pct: 15.0, dollar: 19956 }, "gross-profit": { pct: 62.0, dollar: 93000 } });
  const healthActuals = { "net-sales": { pct: 100.0, dollar: 133042 }, "prime-cost": { pct: 54.0, dollar: 71826 }, "labor": { pct: 12.1, dollar: 16156 }, "cogs": { pct: 41.8, dollar: 55670 }, "net-income": { pct: 13.3, dollar: 17722 }, "gross-profit": { pct: 58.2, dollar: 77372 } };
  const [healthSnapshotMode, setHealthSnapshotMode] = useState<"percentage" | "actual">("percentage");
  const [laborBudgetPct, setLaborBudgetPct] = useState(30);
  const [isCustomLaborBudget, setIsCustomLaborBudget] = useState(false);
  const ytdSummary = getYTDSummary();
  const PERIOD_REVENUE = Math.round(ytdSummary.income);
  const totalLabor = Math.round(ytdSummary.labor);
  const laborActuals: Record<string, number> = {
    "total-labor": totalLabor,
    "boh-labor": Math.round(totalLabor * 0.40),
    "line-cook": Math.round(totalLabor * 0.18),
    "prep-cook": Math.round(totalLabor * 0.12),
    "dishwasher": Math.round(totalLabor * 0.10),
    "foh-labor": Math.round(totalLabor * 0.32),
    "server": Math.round(totalLabor * 0.16),
    "bartender": Math.round(totalLabor * 0.10),
    "host": Math.round(totalLabor * 0.06),
    "management": Math.round(totalLabor * 0.18),
    "gm": Math.round(totalLabor * 0.10),
    "supervisor": Math.round(totalLabor * 0.08),
    "payroll-taxes": Math.round(totalLabor * 0.10)
  };
  const [laborEfficiencyTargets, setLaborEfficiencyTargets] = useState<Record<string, number>>({ "sales-per-hour": 50.0, "hours-per-guest": 0.68, "overtime-pct": 4.0 });
  const [isCustomEfficiencyTargets, setIsCustomEfficiencyTargets] = useState<Record<string, boolean>>({
    "sales-per-hour": false,
    "hours-per-guest": false,
    "overtime-pct": false
  });
  const laborEfficiencyActuals = { "sales-per-hour": 48.2, "hours-per-guest": 0.71, "overtime-pct": 7.4 };
  const [cogsBudgetPct, setCogsBudgetPct] = useState(25);
  const [isCustomCogsBudget, setIsCustomCogsBudget] = useState(false);
  const cogsActuals: Record<string, number> = {
    "total-cogs": Math.round(ytdSummary.cogs),
    "food-cost": Math.round(ytdSummary.cogs * 0.65),
    "beverage-cost": Math.round(ytdSummary.cogs * 0.25),
    "paper-supplies": Math.round(ytdSummary.cogs * 0.10)
  };
  const isNYLocation = selectedState?.code === "NY";
  const [primeCostTargetLower, setPrimeCostTargetLower] = useState(isNYLocation ? 58 : 55);
  const [primeCostTargetUpper, setPrimeCostTargetUpper] = useState(isNYLocation ? 65 : 60);
  const [isCustomPrimeCostTarget, setIsCustomPrimeCostTarget] = useState(false);
  const [controllableBudgets, setControllableBudgets] = useState<Record<string, number>>({
    "total-controllable": 39800,
    "marketing": 4500,
    "repairs": 4000,
    "utilities": 9000,
    "cc-fees": 12300,
    "delivery": 10000
  });
  const controllableActuals: Record<string, number> = {
    "total-controllable": 38600,
    "marketing": 4200,
    "repairs": 3800,
    "utilities": 8500,
    "cc-fees": 12100,
    "delivery": 10000
  };
  const [occupancyBudgets, setOccupancyBudgets] = useState<Record<string, number>>({
    "total-occupancy": 28500,
    "rent": 15000,
    "cam": 3500,
    "insurance": 4500,
    "depreciation": 5500
  });
  const occupancyActuals: Record<string, number> = {
    "total-occupancy": 28500,
    "rent": 15000,
    "cam": 3500,
    "insurance": 4500,
    "depreciation": 5500
  };
  const [healthComparisonPeriod, setHealthComparisonPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [trendModalMetric, setTrendModalMetric] = useState<MetricTrendData | null>(null);
  const [activeGMFilter, setActiveGMFilter] = useState<string | null>(null);
  const [gmTimeRange, setGmTimeRange] = useState("month");
  const [selectedGMDate, setSelectedGMDate] = useState(new Date(2025, 8, 1));
  const [chefTimeRange, setChefTimeRange] = useState("month");
  const [selectedChefDate, setSelectedChefDate] = useState(new Date(2025, 8, 1));
  const [insightModalMetric, setInsightModalMetric] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, "data" | "chart">>({ revenueDrivers: "data" });
  const [curatedPrefs, setCuratedPrefs] = useState<CuratedViewPrefs>({ owner: getDefaultFiltersForRole("owner"), gm: getDefaultFiltersForRole("gm"), chef: getDefaultFiltersForRole("chef"), hasSeenHint: false });
  const [showEmailReportModal, setShowEmailReportModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [editableContent, setEditableContent] = useState<Record<string, string>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const aggregatedTrends = getAggregatedTrends(healthComparisonPeriod, healthSnapshotTrendData);

  const toggleRow = useCallback((rowId: string) => setExpandedRows(prev => { const n = new Set(prev); n.has(rowId) ? n.delete(rowId) : n.add(rowId); return n; }), []);
  const isSectionVisible = useCallback((id: string) => sections.find(s => s.id === id)?.visible ?? true, [sections]);
  const getSectionOrderIndex = useCallback((id: string) => sections.findIndex(s => s.id === id), [sections]);
  const toggleSectionVisibility = useCallback((id: string) => setSections(p => p.map(s => s.id === id ? { ...s, visible: !s.visible } : s)), []);
  const getHealthVariance = useCallback((metricId: string) => {
    const actual = healthActuals[metricId as keyof typeof healthActuals];
    const target = healthTargets[metricId as keyof typeof healthTargets];
    if (!actual || !target) return { dollarVar: 0, pctVar: 0, status: "ON TRACK" };
    return { dollarVar: actual.dollar - target.dollar, pctVar: actual.pct - target.pct, status: "ON TRACK" };
  }, [healthTargets]);
  const updateHealthTarget = useCallback((metricId: string, field: 'pct' | 'dollar', value: number) => {
    setHealthTargets(prev => ({ ...prev, [metricId]: { ...prev[metricId], [field]: value } }));
  }, []);
  const getLaborBudgetForCategory = useCallback((id: string, revenue: number) => Math.round(revenue * (laborBudgetPct / 100)), [laborBudgetPct]);
  const getLaborVariance = useCallback((id: string, revenue = 293000) => ({ varianceDollar: 0, formattedDollar: "$0", color: "text-gray-600" }), []);
  const handleLaborBudgetChange = useCallback((v: number) => { setLaborBudgetPct(v); setIsCustomLaborBudget(true); }, []);
  const resetLaborBudgetToDefault = useCallback(() => { setLaborBudgetPct(30); setIsCustomLaborBudget(false); }, []);
  const getLaborEfficiencyStatus = useCallback(() => ({ status: "ON TRACK", color: "bg-emerald-100" }), []);
  const handleEfficiencyTargetChange = useCallback((id: string, value: number) => {
    setLaborEfficiencyTargets(prev => ({ ...prev, [id]: value }));
    setIsCustomEfficiencyTargets(prev => ({ ...prev, [id]: true }));
  }, []);
  const resetEfficiencyTarget = useCallback((id: string) => {
    const defaults: Record<string, number> = { "sales-per-hour": 50.0, "hours-per-guest": 0.68, "overtime-pct": 4.0 };
    setLaborEfficiencyTargets(prev => ({ ...prev, [id]: defaults[id] ?? prev[id] }));
    setIsCustomEfficiencyTargets(prev => ({ ...prev, [id]: false }));
  }, []);
  const getCogsBudgetForCategory = useCallback((id: string) => Math.round(PERIOD_REVENUE * (cogsBudgetPct / 100)), [PERIOD_REVENUE, cogsBudgetPct]);
  const getCogsVariance = useCallback(() => ({ varianceDollar: 0, formattedDollar: "$0", color: "text-gray-600" }), []);
  const handleCogsBudgetChange = useCallback((v: number) => { setCogsBudgetPct(v); setIsCustomCogsBudget(true); }, []);
  const resetCogsBudgetToDefault = useCallback(() => { setCogsBudgetPct(25); setIsCustomCogsBudget(false); }, []);
  const handlePrimeCostTargetChange = useCallback((type: "lower" | "upper", v: number) => { type === "lower" ? setPrimeCostTargetLower(v) : setPrimeCostTargetUpper(v); setIsCustomPrimeCostTarget(true); }, []);
  const resetPrimeCostTarget = useCallback(() => { setPrimeCostTargetLower(55); setPrimeCostTargetUpper(60); setIsCustomPrimeCostTarget(false); }, []);
  const getPrimeCostTargetLabel = useCallback(() => isCustomPrimeCostTarget ? "Custom" : "Industry Default", [isCustomPrimeCostTarget]);
  const getControllableVariance = useCallback((id: string) => ({ variance: 0, formatted: "$0", color: "text-gray-600" }), []);
  const getOccupancyVariance = useCallback((id: string) => ({ variance: 0, formatted: "$0", color: "text-gray-600" }), []);
  const openTrendModal = useCallback((metricId: string) => { const m = healthSnapshotTrendData.find(t => t.id === metricId); if (m) setTrendModalMetric(m); }, []);
  const getDashboardMetrics = useCallback((period: string, trends: MetricTrendData[]) => {
    const getVal = (id: string) => {
      const metric = trends.find(t => t.id === id);
      if (!metric || !metric.data.length) return { actual: 0, target: 0, variance: 0, variancePct: 0 };
      return metric.data[0];
    };
    const sales = getVal('net-sales');
    const marketing = getVal('marketing');
    const scale = period === 'week' ? 0.25 : period === 'month' ? 1 : period === 'quarter' ? 3 : 9;
    return {
      income: { value: sales.actual, variancePct: sales.variancePct, trend: sales.variance >= 0 ? 'up' as const : 'down' as const },
      marketing: { value: marketing.actual, percentOfRev: sales.actual ? (marketing.actual / sales.actual) * 100 : 0, trend: marketing.variancePct },
      opex: { value: 44500 * scale, percentOfRev: 35.7 },
      growth: { value: sales.variancePct, trend: sales.variancePct >= 0 ? 'up' as const : 'down' as const },
      cashFlow: { balance: 48200 + (8450 * (scale - 1)), change: 8450 * scale, coverage: 2.4 },
      compensation: { executive: 12400 * scale, manager: 18600 * scale, total: 31000 * scale },
      kpis: {
        sales: { current: sales.actual / 1000, target: sales.target / 1000 },
        netProfit: { current: getVal('net-income').actual, target: getVal('net-income').target },
        cogs: { current: getVal('cogs').actual, target: getVal('cogs').target },
        labor: { current: getVal('labor').actual, target: getVal('labor').target },
        fohLabor: { current: 14.3, target: 14 },
        foodCost: { current: 23.3, target: 24 },
        bohLabor: { current: 13, target: 12.5 },
        beverageCost: { current: 4.8, target: 5 },
        ticketTime: { current: 14, target: 12 },
        throughput: { current: 85, target: 80 }
      }
    };
  }, []);
  const handleAddActionItem = useCallback((item: Omit<ActionItem, "id" | "createdAt" | "status">) => { setActionItems(p => [{ ...item, id: String(Date.now()), status: "new", createdAt: Date.now() }, ...p]); toast({ title: "Added" }); }, [toast]);
  const handleRemoveActionItem = useCallback((id: string) => { setActionItems(p => p.filter(i => i.id !== id)); }, []);
  const handleReportGenerated = useCallback((report: any) => { setReportsList(p => [report, ...p]); setActiveReportId(report.id); setActiveTab("reports"); }, []);

  const handleGenerateChefInsightReport = useCallback(() => {
    toast({ title: "Generating Chef Insight Report", description: "Analyzing food costs and inventory..." });
    setTimeout(() => {
      const newReport = {
        id: `report-insight-chef-${Date.now()}`,
        type: 'inventory',
        data: {
          title: "Insight Report: Food Cost Analysis",
          dateRange: "September 2025",
          entity: locationName,
          dataSources: ["Commissary Price List", "Recipe Cards", "Inventory"],
          summary: [
            "Food cost variance driven by key items in pastry category.",
            "Milky Puff and Matcha Lava are primary cost outliers.",
            "Recommend re-costing recipes and auditing portion sizes."
          ],
          metrics: [
            { label: "Food Cost %", value: "31.2%", change: "+1.2%", trend: "up" },
            { label: "Waste %", value: "2.8%", change: "-0.3%", trend: "down" },
            { label: "Inventory Turn", value: "4.2x", change: "+0.1x", trend: "up" }
          ],
          tableData: {
            headers: ["Item", "Category", "Cost", "Target", "Variance"],
            rows: [
              ["Milky Puff", "Pastry", "$4.53", "$4.01", "Critical"],
              ["Matcha Lava", "Pastry", "$4.19", "$3.84", "Warning"],
              ["Cookie Camp", "Pastry", "$4.01", "$4.01", "On Target"]
            ]
          },
          analysis: "The 'Milky Puff' item is the primary outlier, running at 31% food cost against a target of 28%. This is driven by recent price increases in dairy and specialty chocolate ingredients.",
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
  }, [handleReportGenerated, locationName, toast]);

  const handleGenerateOwnerInsightReport = useCallback((insight: PrimaryInsight) => {
    toast({ title: "Generating Owner Insight Report", description: "Analyzing business health and profitability..." });
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
            { label: "Net Income", value: "$28.5K", change: "+12%", trend: "up" },
            { label: "Prime Cost", value: "58.2%", change: "-1.8%", trend: "down" },
            { label: "Revenue", value: "$142K", change: "+8%", trend: "up" }
          ],
          tableData: {
            headers: ["Metric", "Actual", "Target", "Variance", "Status"],
            rows: [
              ["Revenue", "$142K", "$135K", "+5.2%", "Good"],
              ["Net Income", "$28.5K", "$25K", "+14%", "Good"],
              ["Labor %", "24.8%", "25%", "-0.2%", "Good"],
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
  }, [handleReportGenerated, locationName, toast]);

  const handleGenerateGMInsightReport = useCallback((insight: PrimaryInsight) => {
    toast({ title: "Generating GM Insight Report", description: "Analyzing operational efficiency..." });
    setTimeout(() => {
      const newReport = {
        id: `report-insight-gm-${Date.now()}`,
        type: 'labor',
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
  }, [handleReportGenerated, locationName, toast]);

  const handleGenerateFoodCostReport = useCallback(() => {
    toast({ title: "Generating Food Cost Report", description: "Analyzing commissary prices and plate costs..." });
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
          analysis: "Top Item Breakdown: Milky Puff - Total Food Cost Per Plate: $4.53 (31% of $14.45 Selling Price). Primary cost drivers are specialty ingredients from commissary.",
          recommendations: [
            "Negotiate bulk pricing for Puff Pastry Choux.",
            "Evaluate alternative sources for White Chocolate.",
            "Consider portion size adjustment for high-cost items."
          ]
        },
        createdAt: Date.now(),
        status: 'active' as const,
        source: 'curated_insight' as const,
        role: 'chef'
      };
      handleReportGenerated(newReport);
    }, 1500);
  }, [handleReportGenerated, locationName, toast]);
  const handleOpenReport = useCallback((report: Report) => { setReportTabs(p => p.find(t => t.id === report.id) ? p : [...p, report]); setActiveTab(report.id); }, []);

  // New handlers for extracted views
  const [highlightedPnlNodeId, setHighlightedPnlNodeId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("executive-narrative");

  const handleInsightClick = useCallback((query: string) => {
    setFloatingChatTrigger(query + " " + Date.now());
    setShowChat(true);
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, visible: false } : s));
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  }, []);

  const METRIC_TO_PNL_NODE: Record<string, { nodeId: string }> = {
    "net-income": { nodeId: "net-income" },
    "income": { nodeId: "income" },
    "direct-labor-cost": { nodeId: "direct-labor-cost" },
    "cogs": { nodeId: "cogs" },
    "prime-cost": { nodeId: "prime-cost" },
    "gross-profit": { nodeId: "gross-profit" },
  };

  const navigateToPnlNode = useCallback((metricKey: string) => {
    const mapping = METRIC_TO_PNL_NODE[metricKey];
    if (mapping) {
      setHighlightedPnlNodeId(mapping.nodeId);
      setTimeout(() => {
        const pnlSection = document.getElementById("pnl-dashboard");
        if (pnlSection) {
          pnlSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  }, []);

  const value: PnLContextValue = {
    locationName, period, canEdit, isOwnerView, urlRole, selectedRole, setSelectedRole, showChat, setShowChat,
    floatingChatTrigger, setFloatingChatTrigger, activeTab, setActiveTab, reportTabs, setReportTabs,
    actionItems, setActionItems, showActionCart, setShowActionCart, handleAddActionItem, handleRemoveActionItem,
    sections, setSections, isSectionVisible, getSectionOrderIndex, toggleSectionVisibility,
    isEditMode, setIsEditMode, showSectionsSidebar, setShowSectionsSidebar, selectedState, setSelectedState,
    grossProfitExpanded, setGrossProfitExpanded, netIncomeExpanded, setNetIncomeExpanded, expandedRows, toggleRow,
    isProfitabilityExpanded, setIsProfitabilityExpanded, note, setNote, healthTargets, setHealthTargets, updateHealthTarget, healthActuals, getHealthVariance,
    healthSnapshotMode, setHealthSnapshotMode, laborBudgetPct, isCustomLaborBudget, laborActuals,
    getLaborBudgetForCategory, getLaborVariance, handleLaborBudgetChange, resetLaborBudgetToDefault,
    laborEfficiencyTargets, setLaborEfficiencyTargets, laborEfficiencyActuals, getLaborEfficiencyStatus, handleEfficiencyTargetChange, resetEfficiencyTarget, isCustomEfficiencyTargets,
    cogsBudgetPct, isCustomCogsBudget, cogsActuals, getCogsBudgetForCategory, getCogsVariance, handleCogsBudgetChange, resetCogsBudgetToDefault,
    primeCostTargetLower, primeCostTargetUpper, isCustomPrimeCostTarget, handlePrimeCostTargetChange, resetPrimeCostTarget, getPrimeCostTargetLabel,
    controllableBudgets, setControllableBudgets, controllableActuals, getControllableVariance,
    occupancyBudgets, setOccupancyBudgets, occupancyActuals, getOccupancyVariance,
    healthSnapshotTrendData, aggregatedTrends, healthComparisonPeriod, setHealthComparisonPeriod,
    trendModalMetric, setTrendModalMetric, openTrendModal, activeGMFilter, setActiveGMFilter, gmTimeRange, setGmTimeRange,
    selectedGMDate, setSelectedGMDate, chefTimeRange, setChefTimeRange, selectedChefDate, setSelectedChefDate,
    insightModalMetric, setInsightModalMetric, handleGenerateChefInsightReport, handleGenerateOwnerInsightReport,
    handleGenerateGMInsightReport, handleGenerateFoodCostReport, handleOpenReport, viewModes, setViewModes,
    curatedPrefs, setCuratedPrefs, showEmailReportModal, setShowEmailReportModal, emailRecipients, setEmailRecipients,
    emailSending, setEmailSending, showEmailPreview, setShowEmailPreview, getDashboardMetrics, PERIOD_REVENUE,
    editableContent, setEditableContent, scrollContainerRef, toast, reportsList, setReportsList, activeReportId, setActiveReportId,
    handleInsightClick, removeSection, scrollToSection, highlightedPnlNodeId, setHighlightedPnlNodeId, navigateToPnlNode, activeSection, setActiveSection
  };

  return <PnLContext.Provider value={value}>{children}</PnLContext.Provider>;
}
