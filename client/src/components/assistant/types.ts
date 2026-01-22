// Assistant component types

export type FollowUpAction =
  | { type: "chat"; label: string; intent: string }
  | { type: "report"; label: string; report_type: string; params?: Record<string, unknown> };

export type FloatingMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: boolean;
  report?: Report;
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

export interface ActionItem {
  id: string;
  title: string;
  source: "ai_suggestion" | "user_click" | "pnl_insight";
  metric?: string;
  context?: string;
  createdAt: number;
  status: "pending" | "assigned" | "completed";
}
