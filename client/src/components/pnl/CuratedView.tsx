import React, { useState } from "react";
import { usePnL } from "@/contexts/PnLContext";
import {
  LayoutDashboard,
  Sparkles,
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  Package,
  CreditCard,
  Wallet,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  Mail,
  Pencil,
  Plus,
  Loader2,
  Send,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PrimaryInsightCard, getPrimaryInsightForRole } from "@/components/pnl/PrimaryInsightCard";
import { FinancialOverview, ownerGoals, gmGoals, chefGoals } from "@/components/pnl/FinancialOverview";
import { GoalProgress } from "@/components/pnl/GoalProgress";
import { InsightListSection, type InsightItem } from "@/components/pnl/InsightListSection";
import {
  getFilterOptionsForRole,
  chefPrimaryInsight,
  chefPlateMetrics,
} from "@/data/pnl/curated-view-config";
import { healthSnapshotTrendData } from "@/data/pnl/health-snapshot-data";
import { TrendChartModal } from "@/components/pnl/TrendChartModal";
import { format, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";

// Period Navigator Component
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

export function CuratedView() {
  const ctx = usePnL();
  const {
    selectedRole,
    setSelectedRole,
    canEdit,
    isOwnerView,
    urlRole,
    handleGenerateOwnerInsightReport,
    handleGenerateGMInsightReport,
    handleGenerateChefInsightReport,
    handleInsightClick,
    healthComparisonPeriod,
    setHealthComparisonPeriod,
    aggregatedTrends,
    gmTimeRange,
    setGmTimeRange,
    selectedGMDate,
    setSelectedGMDate,
    chefTimeRange,
    setChefTimeRange,
    selectedChefDate,
    setSelectedChefDate,
    curatedPrefs,
    setCuratedPrefs,
    getDashboardMetrics,
    period,
    activeGMFilter,
    setActiveGMFilter,
    PERIOD_REVENUE,
    handleAddActionItem,
    openTrendModal,
    setActiveTab,
    navigateToPnlNode,
    isProfitabilityExpanded,
    setIsProfitabilityExpanded,
    setShowEmailReportModal,
    trendModalMetric,
    setTrendModalMetric,
    showEmailReportModal,
    emailRecipients,
    setEmailRecipients,
    showEmailPreview,
    setShowEmailPreview,
    toast,
  } = ctx;

  // Compute dashboard metrics from context
  const dashboardMetrics = getDashboardMetrics(period, aggregatedTrends);

  // Get goals based on role
  const roleGoals = selectedRole === "owner" ? ownerGoals : selectedRole === "gm" ? gmGoals : chefGoals;

  // Get filter options for current role
  const filterOptions = getFilterOptionsForRole(selectedRole);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Local state for actions and modals
  const [expandedMissedTarget, setExpandedMissedTarget] = useState<string | null>(null);
  const [showCompletedActions, setShowCompletedActions] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionTitle, setEditingActionTitle] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null);

  // Email Report state
  const [newRecipient, setNewRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("Manager Scoreboard Report - Q3 2025");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Report sent successfully",
        description: `Email sent to ${emailRecipients.length} recipient${emailRecipients.length > 1 ? 's' : ''}`
      });
      setShowEmailReportModal(false);
      setShowEmailPreview(false);
    } catch {
      toast({
        title: "Failed to send report",
        description: "Please try again later",
      });
    } finally {
      setEmailSending(false);
    }
  };
  const [assignModalTitle, setAssignModalTitle] = useState("");
  const [assignModalOwner, setAssignModalOwner] = useState("");
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  // Mock action items data with priority and impact
  const [activeActions, setActiveActions] = useState([
    { id: "1", title: "Review October food cost variance", owner: "Owner", completed: false, priority: "high" as const, impact: "+$800/mo" },
    { id: "2", title: "Schedule staff meeting for scheduling review", owner: "GM", completed: false, priority: "medium" as const, impact: "+$400/mo" },
    { id: "3", title: "Audit steak portioning", owner: "Executive Chef", completed: false, priority: "high" as const, impact: "+$350/mo" },
  ]);
  const [completedActions, setCompletedActions] = useState<typeof activeActions>([]);

  const toggleActionComplete = (id: string) => {
    const action = activeActions.find(a => a.id === id);
    if (action) {
      setActiveActions(prev => prev.filter(a => a.id !== id));
      setCompletedActions(prev => [...prev, { ...action, completed: true }]);
    } else {
      const completed = completedActions.find(a => a.id === id);
      if (completed) {
        setCompletedActions(prev => prev.filter(a => a.id !== id));
        setActiveActions(prev => [...prev, { ...completed, completed: false }]);
      }
    }
  };

  const startEditingAction = (id: string, title: string) => {
    setEditingActionId(id);
    setEditingActionTitle(title);
  };

  const saveActionEdit = () => {
    if (editingActionId) {
      setActiveActions(prev => prev.map(a =>
        a.id === editingActionId ? { ...a, title: editingActionTitle } : a
      ));
      setEditingActionId(null);
      setEditingActionTitle("");
    }
  };

  const openAssignModal = (id: string, title: string, owner: string) => {
    setAssignModalOpen(id);
    setAssignModalTitle(title);
    setAssignModalOwner(owner);
  };

  return (
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
       onAskAI={(query) => handleInsightClick(query)}
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
            onAskAI={(query) => handleInsightClick(query)}
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
                           handleInsightClick(`Analyze ${chefPrimaryInsight.metrics[1].label} variance for me`);
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
                     handleInsightClick(contextByRange[chefTimeRange as keyof typeof contextByRange]);
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
                     handleInsightClick(contextByRange[chefTimeRange as keyof typeof contextByRange]);
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
                     handleInsightClick(contextByRange[chefTimeRange as keyof typeof contextByRange]);
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

      {/* Trend Chart Modal */}
      <TrendChartModal
        isOpen={trendModalMetric !== null}
        metric={trendModalMetric}
        onClose={() => setTrendModalMetric(null)}
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
                            <button onClick={() => removeRecipient(email)} className="hover:text-gray-900">
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
                        />
                        <button
                          onClick={addRecipient}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                      />
                    </div>

                    {/* Report Preview Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900">Report Summary</span>
                        <button
                          onClick={() => setShowEmailPreview(true)}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
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
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendEmailReport}
                      disabled={emailSending || emailRecipients.length === 0}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
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
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Edit
                    </button>
                    <button
                      onClick={sendEmailReport}
                      disabled={emailSending || emailRecipients.length === 0}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Assign Action Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={() => setAssignModalOpen(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Assign Action</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[250px]">{assignModalTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalOpen(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Assign to</label>
                  <div className="space-y-2">
                    {["Owner", "GM", "Executive Chef"].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveActions(prev => prev.map(a =>
                            a.id === assignModalOpen ? { ...a, owner: role } : a
                          ));
                          toast({ title: "Action Reassigned", description: `Assigned to ${role}` });
                          setAssignModalOpen(null);
                        }}
                        className={cn(
                          "w-full p-3 text-left rounded-lg border transition-colors flex items-center justify-between",
                          assignModalOwner === role
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <span className="font-medium text-gray-900">{role}</span>
                        {assignModalOwner === role && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
</div>
  );
}
