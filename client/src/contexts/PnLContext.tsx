import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { stateBenchmarks, type StateBenchmark } from "@/data/pnl/state-benchmarks";
import type { ReportData } from "@/components/reports/mock-data";

// Types
export type RoleType = "owner" | "gm" | "chef";
export type ViewTab = "curated" | "detailed" | "reports";
export type Step = 1 | 2 | 3;

export interface ActionItem {
  id: string;
  title: string;
  source: "ai_suggestion" | "user_click" | "pnl_insight";
  metric?: string;
  context?: string;
  createdAt: number;
  status: "pending" | "assigned" | "completed" | "new";
}

export interface Report {
  id: string;
  title: string;
  query?: string;
  content?: string;
  dateRange?: string;
  entity?: string;
  dataSources?: string[];
  summary?: string[];
  metrics?: unknown[];
  status?: "active" | "archived";
  createdAt?: number;
  type?: string;
  tableData?: { headers: string[]; rows: unknown[][] };
}

export interface ReportListItem {
  id: string;
  type: string;
  data: ReportData;
  createdAt: number;
  status: "active" | "archived";
  source?: "manual" | "curated_insight";
  role?: string;
}

interface PnLContextValue {
  // Navigation
  step: Step;
  setStep: (step: Step) => void;

  // View Mode
  isOwnerView: boolean;
  canEdit: boolean;
  selectedRole: RoleType;
  setSelectedRole: (role: RoleType) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;

  // Content
  period: string;
  setPeriod: (period: string) => void;
  locationName: string;
  setLocationName: (name: string) => void;

  // UI State
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  showSectionsSidebar: boolean;
  setShowSectionsSidebar: (show: boolean) => void;
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;

  // State Benchmark
  selectedState: StateBenchmark | null;
  setSelectedState: (state: StateBenchmark | null) => void;

  // Action Cart
  actionItems: ActionItem[];
  setActionItems: React.Dispatch<React.SetStateAction<ActionItem[]>>;
  showActionCart: boolean;
  setShowActionCart: (show: boolean) => void;
  handleAddActionItem: (item: Omit<ActionItem, "id" | "createdAt" | "status">) => void;
  handleRemoveActionItem: (id: string) => void;

  // Reports
  reportsList: ReportListItem[];
  setReportsList: React.Dispatch<React.SetStateAction<ReportListItem[]>>;
  activeReportId: string | null;
  setActiveReportId: (id: string | null) => void;
  handleReportGenerated: (report: ReportListItem) => void;
  handleArchiveReport: (id: string) => void;
  handleRestoreReport: (id: string) => void;

  // Chat Triggers
  chatTrigger: string | null;
  setChatTrigger: (trigger: string | null) => void;
  handleInsightClick: (query: string) => void;

  // Trend Modal
  trendModalMetric: string | null;
  setTrendModalMetric: (metric: string | null) => void;
  openTrendModal: (metricId: string) => void;
  closeTrendModal: () => void;

  // Release Modal
  showReleaseModal: boolean;
  setShowReleaseModal: (show: boolean) => void;
  handleRelease: () => void;
  handleReleaseConfirm: () => void;

  // Router
  navigate: (path: string) => void;

  // Toast
  toast: ReturnType<typeof useToast>["toast"];
}

const PnLContext = createContext<PnLContextValue | null>(null);

export function PnLProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Check view mode from URL params
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const viewParam = searchParams.get("view");
  const isOwnerView = viewParam === "owner" || viewParam === "gm" || viewParam === "chef";
  const canEdit = !isOwnerView;
  const urlRole = viewParam as RoleType | null;

  // Core Navigation State
  const [step, setStep] = useState<Step>(isOwnerView ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState<RoleType>(urlRole || "owner");
  const [activeTab, setActiveTab] = useState<ViewTab>("curated");

  // Content State
  const [period, setPeriod] = useState("September 2025");
  const [locationName, setLocationName] = useState("STMARKS");

  // UI State
  const [showChat, setShowChat] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSectionsSidebar, setShowSectionsSidebar] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // State Benchmark
  const [selectedState, setSelectedState] = useState<StateBenchmark | null>(
    stateBenchmarks.find(s => s.code === "NY") || null
  );

  // Action Cart
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [showActionCart, setShowActionCart] = useState(false);

  // Reports
  const [reportsList, setReportsList] = useState<ReportListItem[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Chat Triggers
  const [chatTrigger, setChatTrigger] = useState<string | null>(null);

  // Trend Modal
  const [trendModalMetric, setTrendModalMetric] = useState<string | null>(null);

  // Release Modal
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  // Sync URL role with state
  useEffect(() => {
    if (urlRole && urlRole !== selectedRole) {
      setSelectedRole(urlRole);
    }
  }, [urlRole]);

  // Auto-navigate to step 2 for owner view
  useEffect(() => {
    if (isOwnerView && step === 1) {
      setStep(2);
    }
  }, [isOwnerView]);

  // Handlers
  const handleAddActionItem = useCallback((item: Omit<ActionItem, "id" | "createdAt" | "status">) => {
    const newItem: ActionItem = {
      ...item,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "new",
      createdAt: Date.now()
    };
    setActionItems(prev => [newItem, ...prev]);
    toast({
      title: "Added to Actions",
      description: "Item added to your Action Cart.",
    });
  }, [toast]);

  const handleRemoveActionItem = useCallback((id: string) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Removed",
      description: "Action item removed.",
    });
  }, [toast]);

  const handleReportGenerated = useCallback((report: ReportListItem) => {
    setReportsList(prev => [report, ...prev]);
    setActiveReportId(report.id);
    setActiveTab("reports");
    toast({
      title: "Report Generated",
      description: "New report added to your Reports tab.",
    });
  }, [toast]);

  const handleArchiveReport = useCallback((id: string) => {
    setReportsList(prev => prev.map(report =>
      report.id === id ? { ...report, status: "archived" as const } : report
    ));
    toast({
      title: "Report Archived",
      description: "Report moved to archive.",
    });
    if (activeReportId === id) {
      setActiveReportId(null);
    }
  }, [activeReportId, toast]);

  const handleRestoreReport = useCallback((id: string) => {
    setReportsList(prev => prev.map(report =>
      report.id === id ? { ...report, status: "active" as const } : report
    ));
    toast({
      title: "Report Restored",
      description: "Report moved back to active reports.",
    });
  }, [toast]);

  const handleInsightClick = useCallback((query: string) => {
    setChatTrigger(query);
    setShowChat(true);
  }, []);

  const openTrendModal = useCallback((metricId: string) => {
    setTrendModalMetric(metricId);
  }, []);

  const closeTrendModal = useCallback(() => {
    setTrendModalMetric(null);
  }, []);

  const handleRelease = useCallback(() => {
    setShowReleaseModal(true);
  }, []);

  const handleReleaseConfirm = useCallback(() => {
    setShowReleaseModal(false);
    toast({
      title: "Report Released",
      description: "The P&L report has been sent to the owner.",
    });
  }, [toast]);

  const navigate = useCallback((path: string) => {
    setLocation(path);
  }, [setLocation]);

  const value: PnLContextValue = {
    // Navigation
    step,
    setStep,

    // View Mode
    isOwnerView,
    canEdit,
    selectedRole,
    setSelectedRole,
    activeTab,
    setActiveTab,

    // Content
    period,
    setPeriod,
    locationName,
    setLocationName,

    // UI State
    showChat,
    setShowChat,
    isEditMode,
    setIsEditMode,
    showSectionsSidebar,
    setShowSectionsSidebar,
    isSyncing,
    setIsSyncing,

    // State Benchmark
    selectedState,
    setSelectedState,

    // Action Cart
    actionItems,
    setActionItems,
    showActionCart,
    setShowActionCart,
    handleAddActionItem,
    handleRemoveActionItem,

    // Reports
    reportsList,
    setReportsList,
    activeReportId,
    setActiveReportId,
    handleReportGenerated,
    handleArchiveReport,
    handleRestoreReport,

    // Chat Triggers
    chatTrigger,
    setChatTrigger,
    handleInsightClick,

    // Trend Modal
    trendModalMetric,
    setTrendModalMetric,
    openTrendModal,
    closeTrendModal,

    // Release Modal
    showReleaseModal,
    setShowReleaseModal,
    handleRelease,
    handleReleaseConfirm,

    // Router
    navigate,

    // Toast
    toast,
  };

  return (
    <PnLContext.Provider value={value}>
      {children}
    </PnLContext.Provider>
  );
}

export function usePnL() {
  const context = useContext(PnLContext);
  if (!context) {
    throw new Error("usePnL must be used within a PnLProvider");
  }
  return context;
}
