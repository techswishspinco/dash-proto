import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  HelpCircle,
  Layers,
  Lightbulb,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
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
} from "recharts";
import { cn } from "@/lib/utils";
import {
  hierarchicalPnlData,
  type PnLLineItem,
  type VarianceLevel,
  type VarianceInfo,
} from "@/data/pnl/hierarchical-pnl-data";
import {
  analyzeVariance,
  countFlaggedItems,
  filterItemsByVariance,
} from "@/lib/pnl/variance-analysis";

// Types
export interface Suggestion {
  icon: React.ReactNode;
  text: string;
  action: "comparison" | "trend" | "breakdown" | "ai_explain" | "compare_metrics";
  params: Record<string, unknown>;
}

// Get contextual suggestions based on line item
export const getSuggestions = (
  lineItem: PnLLineItem,
  varianceInfo: VarianceInfo
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const iconClass = "h-3.5 w-3.5";

  // Always show "Why did this change?" first
  suggestions.push({
    icon: <HelpCircle className={iconClass} />,
    text: "Why did this change?",
    action: "ai_explain",
    params: { metric: lineItem.id, variance: varianceInfo },
  });

  // If flagged with variance, add additional analysis options
  if (varianceInfo.level === "critical" || varianceInfo.level === "attention") {
    suggestions.push({
      icon: <BarChart3 className={iconClass} />,
      text: "Compare to last 3 months",
      action: "comparison",
      params: { metric: lineItem.id, periods: 3, type: "month" },
    });

    suggestions.push({
      icon: <CalendarDays className={iconClass} />,
      text: "See daily breakdown",
      action: "breakdown",
      params: { metric: lineItem.id, granularity: "day" },
    });
  }

  // Always available
  suggestions.push({
    icon: <TrendingUp className={iconClass} />,
    text: "Show trend",
    action: "trend",
    params: { metric: lineItem.id, periods: 12 },
  });

  // If related metrics exist
  if (lineItem.relatedMetrics && lineItem.relatedMetrics.length > 0) {
    suggestions.push({
      icon: <GitCompare className={iconClass} />,
      text: `Compare to ${lineItem.relatedMetrics[0].name}`,
      action: "compare_metrics",
      params: {
        primary: lineItem.id,
        secondary: lineItem.relatedMetrics[0].id,
      },
    });
  }

  // Add breakdown if has children
  if (lineItem.children && lineItem.children.length > 0) {
    suggestions.push({
      icon: <Layers className={iconClass} />,
      text: "Drill down into subcategories",
      action: "breakdown",
      params: { metric: lineItem.id, granularity: "category" },
    });
  }

  return suggestions.slice(0, 5);
};

// Analysis Panel for drill-down insights
interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lineItem: PnLLineItem | null;
  analysisType: string;
  onSuggestionClick: (suggestion: Suggestion) => void;
  netProfit: number;
}

export function AnalysisPanel({
  isOpen,
  onClose,
  lineItem,
  analysisType,
  onSuggestionClick,
  netProfit,
}: AnalysisPanelProps) {
  if (!isOpen || !lineItem) return null;

  const variance = analyzeVariance(lineItem, netProfit);
  const suggestions = getSuggestions(lineItem, variance);

  const mockTrendData = [
    { month: "Sep", value: lineItem.prior * 0.95 },
    { month: "Oct", value: lineItem.prior * 0.98 },
    { month: "Nov", value: lineItem.prior },
    { month: "Dec", value: lineItem.current },
  ];

  const mockBreakdownData =
    lineItem.children?.map((child) => ({
      name: child.name.replace(lineItem.name, "").trim() || child.name,
      value: child.current,
      prior: child.prior,
    })) || [];

  const getInsightText = () => {
    if (analysisType === "comparison" || analysisType === "trend") {
      const trend = variance.variance > 0 ? "increased" : "decreased";
      return `${lineItem.name} ${trend} by ${Math.abs(
        variance.variancePct
      ).toFixed(1)}% ($${Math.abs(variance.variance).toLocaleString()}) compared to last period. ${
        variance.level === "critical"
          ? "This is a significant variance that requires immediate attention."
          : variance.level === "attention"
          ? "This variance should be monitored closely."
          : "Performance is tracking well."
      }`;
    }
    if (analysisType === "ai_explain") {
      return `The primary driver of the ${lineItem.name} variance appears to be ${
        lineItem.type === "expense" ? "increased costs" : "volume changes"
      } during weeks 3-4. ${
        lineItem.children
          ? `The ${lineItem.children[0].name} subcategory contributed most significantly to this change.`
          : ""
      } Consider reviewing operational patterns during peak periods.`;
    }
    return `${lineItem.name} shows a ${
      variance.variancePct > 0 ? "positive" : "negative"
    } trend. Current value: $${lineItem.current.toLocaleString()} vs Prior: $${lineItem.prior.toLocaleString()}.`;
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
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-xl font-serif font-bold text-gray-900">
              {lineItem.name}:{" "}
              {analysisType === "comparison"
                ? "Last 3 Months"
                : analysisType === "trend"
                ? "Trend Analysis"
                : analysisType === "ai_explain"
                ? "Variance Explained"
                : "Breakdown"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {analysisType === "breakdown" && mockBreakdownData.length > 0 ? (
                <BarChart data={mockBreakdownData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="prior"
                    fill="#e5e7eb"
                    name="Prior"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="value"
                    fill={
                      variance.level === "favorable"
                        ? "#10b981"
                        : variance.level === "critical"
                        ? "#ef4444"
                        : "#f59e0b"
                    }
                    name="Current"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      variance.level === "favorable"
                        ? "#10b981"
                        : variance.level === "critical"
                        ? "#ef4444"
                        : "#3b82f6"
                    }
                    strokeWidth={2}
                    dot={{ fill: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 flex gap-3 rounded-r-lg">
            <Sparkles className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {getInsightText()}
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 rounded-lg -mx-2 px-2 py-3">
            <div className="p-3 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Current
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${(lineItem.current / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Prior
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${(lineItem.prior / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Change
              </p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  variance.variance > 0 ? "text-red-600" : "text-emerald-600"
                )}
              >
                {variance.variance > 0 ? "+" : ""}
                {variance.variancePct.toFixed(1)}%
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Next Steps
            </h4>
            <div className="space-y-2">
              {suggestions
                .filter((s) => s.action !== analysisType)
                .slice(0, 4)
                .map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    data-testid={`panel-suggestion-${idx}`}
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {suggestion.text}
                    </span>
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

export function PnLTreeItem({
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
  highlightedNodeId,
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

    if (e.key === "Tab") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSuggestionAccept(item, suggestions[selectedSuggestionIndex]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const varianceColor = {
    critical: "bg-red-500",
    attention: "bg-amber-500",
    favorable: "bg-emerald-500",
    normal: "bg-transparent",
  };

  const varianceBorder = {
    critical: "border-l-red-500",
    attention: "border-l-amber-500",
    favorable: "border-l-emerald-500",
    normal: "border-l-transparent",
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
        onClick={() =>
          hasChildren ? onToggleExpand(item.id) : onSelectItem(item.id)
        }
        tabIndex={0}
        data-testid={`pnl-item-${item.id}`}
        data-pnl-id={item.id}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
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

          <span
            className={cn(
              "font-medium truncate",
              depth === 0 ? "text-gray-900" : "text-gray-700",
              item.type === "subtotal" && "font-bold"
            )}
          >
            {item.name}
          </span>

          {variance.level !== "normal" && (
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full flex-shrink-0",
                varianceColor[variance.level]
              )}
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
          <span
            className={cn(
              "font-medium w-20 text-right",
              variance.variance > 0
                ? item.type === "expense"
                  ? "text-red-600"
                  : "text-emerald-600"
                : item.type === "expense"
                ? "text-emerald-600"
                : "text-red-600"
            )}
          >
            {variance.variance > 0 ? "+" : ""}
            {variance.variancePct.toFixed(1)}%
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-gray-50 border-l-4 border-l-gray-900 px-4 py-3"
            style={{ marginLeft: `${16 + depth * 24}px` }}
            onMouseEnter={handleSuggestionAreaEnter}
            onMouseLeave={handleSuggestionAreaLeave}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">
                Suggestions
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                Tab to cycle, Enter to select
              </span>
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
            animate={{ opacity: 1, height: "auto" }}
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
export const findParentIdsForSearch = (
  items: PnLLineItem[],
  searchTerm: string,
  parentIds: string[] = []
): string[] => {
  const matchingParentIds: string[] = [];

  items.forEach((item) => {
    const itemMatches = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (item.children && item.children.length > 0) {
      const childMatchIds = findParentIdsForSearch(item.children, searchTerm, [
        ...parentIds,
        item.id,
      ]);
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
export const filterItemsBySearch = (
  items: PnLLineItem[],
  searchTerm: string
): PnLLineItem[] => {
  if (!searchTerm.trim()) return items;

  return items.reduce<PnLLineItem[]>((acc, item) => {
    const itemMatches = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const filteredChildren = item.children
      ? filterItemsBySearch(item.children, searchTerm)
      : [];

    if (itemMatches || filteredChildren.length > 0) {
      acc.push({
        ...item,
        children:
          filteredChildren.length > 0 ? filteredChildren : item.children,
      });
    }

    return acc;
  }, []);
};

// Mapping from P&L line item IDs to Health Snapshot trend metric IDs
export const PNL_TO_TREND_METRIC: Record<string, string> = {
  // Revenue items -> Net Sales
  revenue: "net-sales",
  "dine-in": "net-sales",
  delivery: "net-sales",
  takeout: "net-sales",
  doordash: "net-sales",
  ubereats: "net-sales",
  grubhub: "net-sales",

  // COGS items -> COGS %
  cogs: "cogs",
  "food-costs": "cogs",
  "beverage-costs": "cogs",
  proteins: "cogs",
  produce: "cogs",
  dairy: "cogs",
  "dry-goods": "cogs",
  packaging: "cogs",

  // Labor items -> Labor %
  labor: "labor",
  "boh-labor": "labor",
  "foh-labor": "labor",
  "kitchen-staff": "labor",
  "prep-team": "labor",
  management: "labor",
  "payroll-taxes": "labor",

  // Operating expenses -> Prime Cost % (as proxy for overall cost efficiency)
  "operating-expenses": "prime-cost",
  rent: "prime-cost",
  utilities: "prime-cost",
  marketing: "prime-cost",
  insurance: "prime-cost",
  repairs: "prime-cost",
  "other-ops": "prime-cost",

  // Bottom line -> Net Income %
  "net-income": "net-income",
};

// Find all ancestor IDs for a given node
export const findAncestorIds = (
  items: PnLLineItem[],
  targetId: string,
  currentPath: string[] = []
): string[] => {
  for (const item of items) {
    if (item.id === targetId) {
      return currentPath;
    }
    if (item.children) {
      const result = findAncestorIds(item.children, targetId, [
        ...currentPath,
        item.id,
      ]);
      if (result.length > 0 || item.children.some((c) => c.id === targetId)) {
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

export function PnLDashboard({
  onInsightClick,
  highlightedNodeId,
  onHighlightClear,
  onTrendClick,
}: PnLDashboardProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["revenue", "cogs", "labor"])
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [analysisPanel, setAnalysisPanel] = useState<{
    isOpen: boolean;
    item: PnLLineItem | null;
    type: string;
  }>({
    isOpen: false,
    item: null,
    type: "",
  });
  const [filterLevel, setFilterLevel] = useState<VarianceLevel | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Comparison Period State
  const [comparisonPeriod, setComparisonPeriod] = useState({
    currentMonth: "September",
    currentYear: "2025",
    priorMonth: "August",
    priorYear: "2025",
  });
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = ["2023", "2024", "2025", "2026"];

  // Use net profit for variance analysis (Net Operating Income)
  const netProfit =
    hierarchicalPnlData.find((item) => item.id === "net-income")?.current ||
    17722.37;
  const flagCounts = countFlaggedItems(hierarchicalPnlData, netProfit);

  // Auto-expand parents when search matches nested items
  useEffect(() => {
    if (searchTerm.trim()) {
      const parentIds = findParentIdsForSearch(hierarchicalPnlData, searchTerm);
      if (parentIds.length > 0) {
        setExpandedItems((prev) => {
          const next = new Set(prev);
          parentIds.forEach((id) => next.add(id));
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
        setExpandedItems((prev) => {
          const next = new Set(prev);
          ancestors.forEach((id) => next.add(id));
          return next;
        });
      }

      // Expand if collapsed
      setIsCollapsed(false);

      // Scroll to the element after a short delay to allow expansion
      setTimeout(() => {
        const element = document.querySelector(
          `[data-pnl-id="${highlightedNodeId}"]`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
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
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSuggestionAccept = (
    item: PnLLineItem,
    suggestion: Suggestion
  ) => {
    // If action is 'trend' and we have a mapping, open the trend modal
    if (suggestion.action === "trend" && onTrendClick) {
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
      setAnalysisPanel((prev) => ({ ...prev, type: suggestion.action }));
    }
  };

  // Apply both variance filter and search filter
  let filteredItems =
    filterLevel === "all"
      ? hierarchicalPnlData
      : filterItemsByVariance(hierarchicalPnlData, filterLevel, netProfit);

  if (searchTerm.trim()) {
    filteredItems = filterItemsBySearch(filteredItems, searchTerm);
  }

  return (
    <section id="pnl-dashboard" className="scroll-mt-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-serif font-bold text-gray-900">
          P&L Dashboard
        </h2>

        {/* Comparison Period - Inline with header */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Comparing
          </span>
          <select
            data-testid="select-current-month"
            value={comparisonPeriod.currentMonth}
            onChange={(e) =>
              setComparisonPeriod((prev) => ({
                ...prev,
                currentMonth: e.target.value,
              }))
            }
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            data-testid="select-current-year"
            value={comparisonPeriod.currentYear}
            onChange={(e) =>
              setComparisonPeriod((prev) => ({
                ...prev,
                currentYear: e.target.value,
              }))
            }
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select
            data-testid="select-prior-month"
            value={comparisonPeriod.priorMonth}
            onChange={(e) =>
              setComparisonPeriod((prev) => ({
                ...prev,
                priorMonth: e.target.value,
              }))
            }
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            data-testid="select-prior-year"
            value={comparisonPeriod.priorYear}
            onChange={(e) =>
              setComparisonPeriod((prev) => ({
                ...prev,
                priorYear: e.target.value,
              }))
            }
            className="text-sm font-medium text-gray-700 bg-transparent border-none px-1 py-0.5 focus:outline-none focus:ring-0 cursor-pointer hover:text-gray-900"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
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
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <button
          onClick={() => setFilterLevel("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          data-testid="filter-all"
        >
          All Items
        </button>
        <button
          onClick={() => setFilterLevel("critical")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === "critical"
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          )}
          data-testid="filter-critical"
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {flagCounts.critical} Critical
        </button>
        <button
          onClick={() => setFilterLevel("attention")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === "attention"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          )}
          data-testid="filter-attention"
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {flagCounts.attention} Attention
        </button>
        <button
          onClick={() => setFilterLevel("favorable")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterLevel === "favorable"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
        <span>
          Hover over any line item to see AI suggestions - Tab to cycle - Enter
          to select
        </span>
        <button
          onClick={() => setExpandedItems(new Set())}
          className="hover:text-gray-700 transition-colors"
        >
          Collapse All
        </button>
      </div>

      <AnalysisPanel
        isOpen={analysisPanel.isOpen}
        onClose={() => setAnalysisPanel({ isOpen: false, item: null, type: "" })}
        lineItem={analysisPanel.item}
        analysisType={analysisPanel.type}
        onSuggestionClick={handlePanelSuggestionClick}
        netProfit={netProfit}
      />
    </section>
  );
}
