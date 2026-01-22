import React from "react";
import { usePnL } from "@/contexts/PnLContext";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  X,
  Target,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Package
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
  Cell
} from "recharts";
import { hierarchicalPnlData } from "@/data/pnl/hierarchical-pnl-data";
import { ticketTimeData, gmTimeRangeData, type TimeRangeType } from "@/data/pnl/detailed-view-data";
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";

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

export function DetailedView() {
  const ctx = usePnL();
  const {
    selectedRole,
    isSectionVisible,
    getSectionOrderIndex,
    grossProfitExpanded,
    setGrossProfitExpanded,
    netIncomeExpanded,
    setNetIncomeExpanded,
    isEditMode,
    editableContent,
    setEditableContent,
    handleInsightClick,
    navigateToPnlNode,
    removeSection,
    healthSnapshotMode,
    setHealthSnapshotMode,
    healthTargets,
    healthActuals,
    getHealthVariance,
    updateHealthTarget,
    openTrendModal,
    viewModes,
    setViewModes,
    expandedRows,
    toggleRow,
    note,
    setNote,
    selectedState,
    setSelectedState,
    primeCostTargetLower,
    primeCostTargetUpper,
    isCustomPrimeCostTarget,
    getPrimeCostTargetLabel,
    laborBudgetPct,
    isCustomLaborBudget,
    laborActuals,
    getLaborBudgetForCategory,
    getLaborVariance,
    handleLaborBudgetChange,
    resetLaborBudgetToDefault,
    laborEfficiencyTargets,
    laborEfficiencyActuals,
    getLaborEfficiencyStatus,
    handleEfficiencyTargetChange,
    resetEfficiencyTarget,
    isCustomEfficiencyTargets,
    cogsBudgetPct,
    isCustomCogsBudget,
    cogsActuals,
    getCogsBudgetForCategory,
    getCogsVariance,
    handleCogsBudgetChange,
    resetCogsBudgetToDefault,
    controllableBudgets,
    setControllableBudgets,
    controllableActuals,
    getControllableVariance,
    occupancyBudgets,
    setOccupancyBudgets,
    occupancyActuals,
    getOccupancyVariance,
    activeGMFilter,
    setActiveGMFilter,
    gmTimeRange,
    setGmTimeRange,
    selectedGMDate,
    setSelectedGMDate,
    chefTimeRange,
    setChefTimeRange,
    selectedChefDate,
    setSelectedChefDate,
    handleGenerateFoodCostReport,
    PERIOD_REVENUE,
    setInsightModalMetric,
    setFloatingChatTrigger,
    setShowChat,
  } = ctx;

  // Local computed values
  const currentTicketData = ticketTimeData[chefTimeRange as TimeRangeType] || ticketTimeData.month;
  const currentGMData = gmTimeRangeData[gmTimeRange as TimeRangeType] || gmTimeRangeData.month;
  
  // Compute actual prime cost percentage
  const actualPrimeCostPct = 62.1; // From data

  // Additional computed values
  const isNYLocation = selectedState?.code === "NY";
  const primeCostTargetMidpoint = (primeCostTargetLower + primeCostTargetUpper) / 2;
  const laborVariancePts = actualPrimeCostPct * 0.38 - 24; // Approx labor variance
  const cogsVariancePts = actualPrimeCostPct * 0.62 - 30; // Approx COGS variance
  const primeCostVarianceTotal = actualPrimeCostPct - primeCostTargetMidpoint;

  // What Happened narrative data based on time range
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
      default:
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

  return (
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
                       <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusColors[variance.status as keyof typeof statusColors])}>
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
               onPrev={() => setSelectedChefDate((d: Date) => chefTimeRange === 'month' ? subMonths(d, 1) : subWeeks(d, 1))}
               onNext={() => setSelectedChefDate((d: Date) => chefTimeRange === 'month' ? addMonths(d, 1) : addWeeks(d, 1))}
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
               onPrev={() => setSelectedGMDate((d: Date) => gmTimeRange === 'month' ? subMonths(d, 1) : subWeeks(d, 1))}
               onNext={() => setSelectedGMDate((d: Date) => gmTimeRange === 'month' ? addMonths(d, 1) : addWeeks(d, 1))}
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
  );
}
