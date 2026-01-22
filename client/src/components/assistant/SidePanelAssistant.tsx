import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Maximize2,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ReportPanel } from "@/components/reports/report-panel";
import { MOCK_REPORTS, ReportData, ReportType } from "@/components/reports/mock-data";
import { generateComparisonReport } from "@/components/reports/comparison-generator";
import { Wand } from "@/components/ui/wand";
import {
  generateMockResponse,
  generateReportContent,
  type FollowUpAction,
} from "@/lib/pnl/mock-responses";

// Types
export type FloatingMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: boolean;
  report?: ReportData;
  followUpQuestions?: FollowUpAction[];
  toolCall?: {
    state: "running" | "completed" | "pending_confirmation" | "denied";
    toolName: string;
    args?: Record<string, unknown>;
    result?: string;
    denialReason?: string;
  };
};

export interface Report {
  id: string;
  title: string;
  query: string;
  content: string;
}

export interface ActionItem {
  id: string;
  title: string;
  source: "pnl_insight" | "ai_suggestion" | "user_click";
  metric?: string;
  context?: string;
  status: "new" | "assigned" | "dismissed";
  createdAt: number;
}

interface SidePanelAssistantProps {
  onClose: () => void;
  triggerQuery?: string | null;
  onOpenReport?: (report: Report) => void;
  onReportGenerated?: (report: {
    id: string;
    type: string;
    data: ReportData;
    createdAt: number;
  }) => void;
  actionItems: ActionItem[];
  onAddActionItem: (item: Omit<ActionItem, "id" | "createdAt" | "status">) => void;
  onRemoveActionItem: (id: string) => void;
  showActionCart: boolean;
  onToggleActionCart: (show: boolean) => void;
  onUpdateActionItems: (items: ActionItem[]) => void;
}

export function SidePanelAssistant({
  onClose,
  triggerQuery,
  onOpenReport,
  onReportGenerated,
  actionItems,
  onAddActionItem,
  onRemoveActionItem,
  showActionCart,
  onToggleActionCart,
  onUpdateActionItems,
}: SidePanelAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isReportMode, setIsReportMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [processedTrigger, setProcessedTrigger] = useState<string | null>(null);

  // Report State
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);

  // Load Mock Files (Simulated)
  const loadMockComparison = async () => {
    try {
      // Fallback Mock Data
      const mockFile1 = {
        accounts: [
          {
            account: "400-000 Food Sales",
            monthly_data: { "September 2025": { current: 103461.46 } },
          },
          {
            account: "400-200 Beverage Sales",
            monthly_data: { "September 2025": { current: 17698.0 } },
          },
          {
            account: "Total Income",
            monthly_data: { "September 2025": { current: 133042.5 } },
          },
        ],
      };
      const mockFile2 = {
        sections: {
          Income: {
            "400-000 Food Sales": { "Oct 2025": { current: 113360.78 } },
            "400-200 Beverage Sales": { "Oct 2025": { current: 19998.35 } },
            "Total Income": { "Oct 2025": { current: 142500.0 } },
          },
        },
      };

      const report = await generateComparisonReport(mockFile1, mockFile2);
      setCurrentReport(report);
      setIsReportPanelOpen(true);

      // Notify Parent
      if (onReportGenerated) {
        onReportGenerated({
          id: `report-${Date.now()}`,
          type: "comparison",
          data: report,
          createdAt: Date.now(),
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
      const cleanQuery = hasTimestamp
        ? queryParts.slice(0, -1).join(" ")
        : triggerQuery;

      handleSend(cleanQuery, true);
      setProcessedTrigger(triggerQuery);
    }
  }, [triggerQuery]);

  const handleSend = async (text: string, isInstant: boolean = false) => {
    if (!text.trim()) return;

    const userMsg: FloatingMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => inputRef.current?.focus(), 50);

    // Simulate thinking
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    // Check for Report Intent
    const lowerText = text.toLowerCase();
    let reportType: ReportType | null = null;

    if (
      lowerText.includes("profit") ||
      lowerText.includes("margin") ||
      lowerText.includes("p&l")
    )
      reportType = "profitability";
    else if (
      lowerText.includes("labor") ||
      lowerText.includes("staff") ||
      lowerText.includes("overtime")
    )
      reportType = "labor";
    else if (
      lowerText.includes("sales") ||
      lowerText.includes("revenue") ||
      lowerText.includes("perform")
    )
      reportType = "sales";
    else if (lowerText.includes("inventory") || lowerText.includes("stock"))
      reportType = "inventory";

    if (reportType) {
      // Initial brief answer
      const initialResponse: FloatingMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          reportType === "profitability"
            ? "Net margin declined 2.3% MoM, primarily due to higher labor costs in the kitchen."
            : reportType === "labor"
            ? "Labor costs are running 14% over budget this month, largely driven by overtime."
            : reportType === "sales"
            ? "Sales are up 4.2% overall, with strong performance in the dinner shift."
            : "Inventory levels are healthy, though there is some variance in liquor stocks.",
      };
      setMessages((prev) => [...prev, initialResponse]);

      await new Promise((r) => setTimeout(r, 600));

      // Determine relevant follow-ups
      let followUpQuestions: FollowUpAction[] = [];
      if (reportType === "profitability") {
        followUpQuestions = [
          {
            type: "report",
            label: "Break down COGS",
            report_type: "cogs_breakdown",
            params: { focus: "savings" },
          },
          {
            type: "report",
            label: "Margin impact analysis",
            report_type: "margin_decomposition",
            params: { period: "current" },
          },
          {
            type: "chat",
            label: "Sustainable?",
            intent: "Is this margin sustainable next month?",
          },
        ];
      } else if (reportType === "labor") {
        followUpQuestions = [
          {
            type: "report",
            label: "Overtime by role",
            report_type: "overtime_analysis",
            params: { role_breakdown: true },
          },
          {
            type: "report",
            label: "Labor efficiency vs LY",
            report_type: "labor_efficiency",
            params: { compare: "last_year" },
          },
          {
            type: "chat",
            label: "Hourly rate changes",
            intent: "Analyze hourly rate changes",
          },
        ];
      } else if (reportType === "sales") {
        followUpQuestions = [
          {
            type: "report",
            label: "Sales growth drivers",
            report_type: "sales_drivers",
            params: { decomposition: true },
          },
          {
            type: "report",
            label: "Forecast validation",
            report_type: "forecast_validation",
            params: { horizon: "30d" },
          },
          {
            type: "chat",
            label: "Lunch vs Dinner",
            intent: "Compare lunch and dinner performance",
          },
        ];
      } else {
        // inventory
        followUpQuestions = [
          {
            type: "report",
            label: "Top 3 expenses",
            report_type: "expense_ranking",
            params: { limit: 3 },
          },
          {
            type: "report",
            label: "Food cost per plate",
            report_type: "food_cost_per_plate",
            params: { sort: "variance" },
          },
          {
            type: "chat",
            label: "Controllable expenses trend",
            intent: "Analyze controllable expenses trend",
          },
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
          args: { type: reportType },
        },
        followUpQuestions: followUpQuestions,
      };
      setMessages((prev) => [...prev, offerMsg]);
      setIsTyping(false);
      return;
    }

    // Check for Comparison Intent
    if (
      lowerText.includes("compare") &&
      lowerText.includes("september") &&
      lowerText.includes("october")
    ) {
      const initialResponse: FloatingMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I can compare the September and October P&L files for you. I found both files in your history.",
      };
      setMessages((prev) => [...prev, initialResponse]);

      await new Promise((r) => setTimeout(r, 600));

      const offerMsg: FloatingMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Would you like a side-by-side comparison report?",
        toolCall: {
          state: "pending_confirmation",
          toolName: "generate_comparison",
          args: { type: "comparison", file1: "Sep 2025", file2: "Oct 2025" },
        },
      };
      setMessages((prev) => [...prev, offerMsg]);
      setIsTyping(false);
      return;
    }

    // Check for Correlation Intent
    if (
      lowerText.includes("correlation") ||
      lowerText.includes("affect") ||
      lowerText.includes("impact") ||
      (lowerText.includes("relationship") && lowerText.includes("between")) ||
      (lowerText.includes("did") && lowerText.includes("cause"))
    ) {
      const initialResponse: FloatingMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Analyzing data correlation across the last 3 periods...",
      };
      setMessages((prev) => [...prev, initialResponse]);

      await new Promise((r) => setTimeout(r, 1500));

      // Mock Correlation Logic
      let correlationMsg = "";

      if (
        (lowerText.includes("labor") && lowerText.includes("profit")) ||
        (lowerText.includes("labor") && lowerText.includes("margin"))
      ) {
        correlationMsg =
          "**Strong Negative Correlation Detected (-0.85)**\n\nWhen Labor Cost % increases, Net Profit Margin consistently decreases. This suggests labor overruns are directly eating into profitability, rather than driving sufficient additional revenue to cover the cost.";
      } else if (lowerText.includes("sales") && lowerText.includes("labor")) {
        correlationMsg =
          "**Moderate Positive Correlation (+0.62)**\n\nHigher sales volumes generally drive higher labor costs, but the efficiency varies. On peak Friday nights, labor efficiency improves (sales rise faster than labor costs), whereas Tuesday lunch shifts show poor efficiency.";
      } else if (
        (lowerText.includes("marketing") || lowerText.includes("promo")) &&
        lowerText.includes("sales")
      ) {
        correlationMsg =
          "**Weak Positive Correlation (+0.24)**\n\nMarketing spend shows a delayed impact on sales. Promotions run in Week 1 typically correlate with sales lifts in Week 2, but the immediate same-week impact is minimal.";
      } else {
        correlationMsg =
          "**Analysis Complete**\n\nI've analyzed the relationship between these metrics. Over the last quarter, they move relatively independently (Correlation: 0.12), suggesting other factors (like seasonality or COGS variance) are driving the changes you're seeing.";
      }

      const resultMsg: FloatingMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: correlationMsg,
        followUpQuestions: [
          {
            type: "report",
            label: "View Efficiency Report",
            report_type: "labor_efficiency",
            params: { compare: "last_year" },
          },
          {
            type: "chat",
            label: "Identify outliers",
            intent: "Show me the specific days with worst labor efficiency",
          },
        ],
      };
      setMessages((prev) => [...prev, resultMsg]);
      setIsTyping(false);
      return;
    }

    let content = "";
    let artifact = false;
    let report = undefined;
    let followUpQuestions: FollowUpAction[] | undefined;

    if (isReportMode) {
      const reportId = `report-${Date.now()}`;
      content =
        "I've generated a detailed report analyzing your question. Click below to view the full analysis.";
      // Mock ReportData compliant object
      const reportData: ReportData = {
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
        tableData: { headers: [], rows: [] },
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
      followUpQuestions: followUpQuestions,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleFollowUpAction = (action: FollowUpAction) => {
    if (action.type === "chat") {
      handleSend(action.intent);
    } else if (action.type === "report") {
      const reportId = `report-${Date.now()}`;
      const content = generateReportContent(action.report_type);
      const reportData: ReportData = {
        id: reportId,
        title: action.label,
        dateRange: "Oct 1 - Oct 31, 2025",
        entity: "Downtown Location",
        dataSources: ["POS", "Labor"],
        summary: [content],
        metrics: [],
        status: "active" as const,
        createdAt: Date.now(),
        type: "analysis",
        tableData: { headers: [], rows: [] },
      };

      setCurrentReport(reportData);
      setIsReportPanelOpen(true);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've generated the **${action.label}** for you.`,
          report: reportData,
        },
      ]);
    }
  };

  const handleConfirmTool = async (
    msgId: string,
    toolName: string,
    args: Record<string, unknown>
  ) => {
    // Update to running
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, toolCall: { ...m.toolCall!, state: "running" as const } }
          : m
      )
    );
    setIsTyping(true);

    // Tool "running" pause
    await new Promise((r) => setTimeout(r, 1500));

    // Handle Report Generation
    if (toolName === "generate_report") {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                toolCall: {
                  ...m.toolCall!,
                  state: "completed" as const,
                  result: "Report generated successfully.",
                },
              }
            : m
        )
      );

      const type = args.type as ReportType;
      const reportData = MOCK_REPORTS[type];

      // Notify Parent
      if (onReportGenerated) {
        onReportGenerated({
          id: `report-${Date.now()}`,
          type,
          data: reportData,
          createdAt: Date.now(),
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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  toolCall: {
                    ...m.toolCall!,
                    state: "completed" as const,
                    result: "Comparison report generated successfully.",
                  },
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  toolCall: {
                    ...m.toolCall!,
                    state: "denied" as const,
                    denialReason: "Failed to load files.",
                  },
                }
              : m
          )
        );
      }
      setIsTyping(false);
      return;
    }
  };

  const handleDenyTool = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              toolCall: {
                ...m.toolCall!,
                state: "denied" as const,
                denialReason: "User cancelled action",
              },
            }
          : m
      )
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            <Sparkles className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              Munch Assistant
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              AI Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Action Cart Toggle */}
          <button
            onClick={() => onToggleActionCart(!showActionCart)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors relative",
              showActionCart
                ? "bg-black text-white border-black"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
            title="Action Cart"
          >
            <div className="relative">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {actionItems.length > 0 && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white" />
              )}
            </div>
            <span>
              Actions {actionItems.length > 0 && `(${actionItems.length})`}
            </span>
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

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Cart Panel */}
      {showActionCart && (
        <div className="border-b border-gray-200 bg-gray-50 p-4 space-y-3 max-h-[40vh] overflow-y-auto shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Action Cart
            </h4>
            {actionItems.length > 0 && (
              <button
                onClick={() => {
                  // Mock "Do All" functionality
                  const updatedItems = actionItems.map((item) => ({
                    ...item,
                    status: "assigned" as const,
                    context: item.context || "Bulk Assigned",
                  }));
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
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.context}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium border border-gray-200 uppercase">
                          {item.source === "ai_suggestion"
                            ? "AI Suggestion"
                            : item.source === "user_click"
                            ? "Manual"
                            : "Insight"}
                        </span>
                        {item.metric && (
                          <span className="text-[10px] text-gray-400">
                            {item.metric}
                          </span>
                        )}
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
                    <span className="text-xs text-gray-500 font-medium shrink-0">
                      You
                    </span>
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
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i} className="font-semibold text-gray-900">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
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
                            <span className="font-medium text-sm">
                              Confirm Action
                            </span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Action
                          </div>
                          <div className="text-sm font-medium">
                            {msg.toolCall.toolName === "generate_report"
                              ? "Generate Report"
                              : msg.toolCall.toolName === "generate_comparison"
                              ? "Compare Files"
                              : msg.toolCall.toolName}
                          </div>

                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Type
                          </div>
                          <div className="text-sm font-medium capitalize">
                            {(msg.toolCall.args?.type as string) || "Standard"}
                            {msg.toolCall.args?.file1 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Files: {msg.toolCall.args.file1 as string} vs{" "}
                                {msg.toolCall.args.file2 as string}
                              </div>
                            )}
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
                            onClick={() =>
                              handleConfirmTool(
                                msg.id,
                                msg.toolCall!.toolName,
                                msg.toolCall!.args || {}
                              )
                            }
                            className="flex-1 py-2 text-xs font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors shadow-sm"
                          >
                            {msg.toolCall.toolName === "generate_comparison"
                              ? "Generate Comparison"
                              : "Generate Report"}
                          </button>
                        </div>
                      </div>
                    ) : msg.toolCall.state === "denied" ? (
                      <div className="inline-flex items-center gap-2 text-xs font-mono bg-gray-50 border border-gray-200 px-3 py-2 rounded-md opacity-70">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="text-muted-foreground decoration-line-through">
                          Action cancelled
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-xs font-mono bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
                        {msg.toolCall.state === "running" ? (
                          <>
                            <Wand />
                            <span className="text-muted-foreground">
                              Generating report...
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-muted-foreground">
                              Report Generated
                            </span>
                            <button
                              onClick={() => setIsReportPanelOpen(true)}
                              className="ml-1 underline text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              View
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up Questions */}
                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Suggested Follow-ups
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.followUpQuestions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFollowUpAction(action)}
                          className={cn(
                            "text-left px-3 py-2 bg-white border rounded-lg text-xs transition-colors shadow-sm flex items-center gap-2",
                            action.type === "report"
                              ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {action.type === "report" && (
                            <FileText className="h-3 w-3" />
                          )}
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
                      {
                        id: "review-pastry",
                        title: "Review Pastry Supplier",
                        desc: "Alternative supplier offers 15% discount on White Chocolate",
                        impact: 600,
                        icon: "arrow",
                        color: "amber",
                      },
                      {
                        id: "adjust-delivery",
                        title: "Adjust Delivery Window",
                        desc: "Move Sysco to 8-10AM to avoid overtime",
                        impact: 350,
                        icon: "clock",
                        color: "purple",
                      },
                      {
                        id: "lock-scheduling",
                        title: "Lock Mid-Shift Cuts",
                        desc: "Make Tue/Wed staffing changes permanent",
                        impact: 480,
                        icon: "users",
                        color: "blue",
                      },
                    ].map((action) => (
                      <div
                        key={action.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 hover:border-gray-300 transition-colors cursor-pointer group"
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            action.color === "amber"
                              ? "bg-amber-50"
                              : action.color === "purple"
                              ? "bg-purple-50"
                              : "bg-blue-50"
                          )}
                        >
                          {action.icon === "arrow" && (
                            <ArrowRight
                              className={cn(
                                "h-5 w-5",
                                action.color === "amber"
                                  ? "text-amber-600"
                                  : "text-gray-600"
                              )}
                            />
                          )}
                          {action.icon === "clock" && (
                            <Clock className="h-5 w-5 text-purple-600" />
                          )}
                          {action.icon === "users" && (
                            <Users className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900">
                            {action.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {action.desc}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-emerald-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">
                              +${action.impact}/mo
                            </span>
                          </div>
                        </div>
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-gray-400 shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Report Card */}
                {msg.report && (
                  <div
                    className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group cursor-pointer hover:border-indigo-300 transition-all"
                    onClick={() => onOpenReport?.(msg.report as Report)}
                  >
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 border border-indigo-200">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {msg.report.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Comprehensive Analysis Generated
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="p-3 bg-gray-50/30">
                      <button className="w-full py-2 bg-white border border-gray-200 group-hover:border-indigo-200 group-hover:text-indigo-600 rounded-lg text-sm font-medium text-gray-700 transition-all shadow-sm flex items-center justify-center gap-2">
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
              <div
                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        {messages.length === 0 && !isTyping && (
          <div className="py-6">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Ask me anything about your P&L
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">
                Suggested
              </p>
              {[
                "Why did labor costs increase this month?",
                "How can I improve my food cost percentage?",
                "What's driving the change in net profit?",
                "Compare this month to last month",
                "Did labor affect profit?",
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
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
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
