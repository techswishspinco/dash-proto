import { useState } from "react";
import Layout from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  User,
  Building2,
  MapPin,
  Calendar,
  ArrowUpRight,
  AlertCircle,
  Banknote,
  Users,
  FileWarning,
  RefreshCw,
  Bell,
  CircleDot,
  Pause,
  X,
  ExternalLink,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "critical" | "high" | "medium" | "low";
type Status = "open" | "in_progress" | "snoozed" | "resolved";
type TaskType = "onboarding" | "mapping" | "payroll" | "tax" | "anomaly";
type Role = "operator" | "manager" | "accountant" | "support" | "onboarding_specialist";

interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: Priority;
  status: Status;
  assignedTo: { name: string; initials: string; role: Role }[];
  createdAt: string;
  dueDate: string;
  company?: string;
  location?: string;
  employees?: number;
  payrollRun?: string;
  escalationHistory?: { date: string; from: Priority; to: Priority }[];
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Payroll run failed for 2026-01-08",
    description: "The scheduled payroll run for January 8th failed due to missing tax information for 3 employees. This requires immediate attention to ensure employees are paid on time.",
    type: "payroll",
    priority: "critical",
    status: "open",
    assignedTo: [
      { name: "Sarah Chen", initials: "SC", role: "support" },
      { name: "Michael Park", initials: "MP", role: "accountant" },
    ],
    createdAt: "2026-01-08T09:00:00",
    dueDate: "2026-01-08T18:00:00",
    company: "KOQ LLC",
    location: "Downtown Seattle",
    payrollRun: "PR-2026-01-08",
    escalationHistory: [
      { date: "2026-01-08T12:00:00", from: "high", to: "critical" },
    ],
  },
  {
    id: "2",
    title: "Complete Employee Onboarding — 12 employees",
    description: "12 employees from the POS system have not been mapped to payroll records. Complete their onboarding to include them in the next payroll run.",
    type: "onboarding",
    priority: "high",
    status: "in_progress",
    assignedTo: [
      { name: "Emily Rodriguez", initials: "ER", role: "onboarding_specialist" },
    ],
    createdAt: "2026-01-05T14:30:00",
    dueDate: "2026-01-10T17:00:00",
    company: "KOQ LLC",
    location: "Capitol Hill",
    employees: 12,
  },
  {
    id: "3",
    title: "7 days until next payroll run",
    description: "Verify timesheets and exports for the January 15th payroll run. Ensure all employee hours are correctly synced from POS.",
    type: "payroll",
    priority: "high",
    status: "open",
    assignedTo: [
      { name: "James Wilson", initials: "JW", role: "manager" },
      { name: "Michael Park", initials: "MP", role: "accountant" },
    ],
    createdAt: "2026-01-08T08:00:00",
    dueDate: "2026-01-15T09:00:00",
    company: "KOQ LLC",
    payrollRun: "PR-2026-01-15",
  },
  {
    id: "4",
    title: "State Tax Registration Missing — Washington",
    description: "Washington state tax registration is incomplete. This must be resolved within 30 days to maintain compliance.",
    type: "tax",
    priority: "high",
    status: "open",
    assignedTo: [
      { name: "Michael Park", initials: "MP", role: "accountant" },
    ],
    createdAt: "2026-01-02T10:00:00",
    dueDate: "2026-02-01T17:00:00",
    company: "KOQ LLC",
  },
  {
    id: "5",
    title: "POS ↔ Payroll sync incomplete",
    description: "The latest sync between Toast POS and payroll system failed to complete. 47 timesheets were not imported correctly.",
    type: "anomaly",
    priority: "medium",
    status: "open",
    assignedTo: [
      { name: "James Wilson", initials: "JW", role: "manager" },
    ],
    createdAt: "2026-01-07T16:45:00",
    dueDate: "2026-01-12T17:00:00",
    company: "KOQ LLC",
    location: "All Locations",
  },
  {
    id: "6",
    title: "Map 5 employees at Ballard location",
    description: "5 new employees at Ballard location are in POS but not yet mapped to payroll. Their first scheduled shift is January 12th.",
    type: "mapping",
    priority: "medium",
    status: "open",
    assignedTo: [
      { name: "Emily Rodriguez", initials: "ER", role: "onboarding_specialist" },
    ],
    createdAt: "2026-01-06T11:00:00",
    dueDate: "2026-01-11T17:00:00",
    company: "KOQ LLC",
    location: "Ballard",
    employees: 5,
  },
  {
    id: "7",
    title: "Quarterly 941 Tax Filing Due",
    description: "Federal quarterly 941 tax form filing deadline approaching. Ensure all payroll data is accurate before submission.",
    type: "tax",
    priority: "medium",
    status: "snoozed",
    assignedTo: [
      { name: "Michael Park", initials: "MP", role: "accountant" },
    ],
    createdAt: "2026-01-01T09:00:00",
    dueDate: "2026-01-31T17:00:00",
    company: "KOQ LLC",
  },
  {
    id: "8",
    title: "Review tip allocation discrepancies",
    description: "Minor discrepancies detected in tip allocation at Downtown Seattle. Review and confirm or correct allocations.",
    type: "anomaly",
    priority: "low",
    status: "open",
    assignedTo: [
      { name: "James Wilson", initials: "JW", role: "manager" },
    ],
    createdAt: "2026-01-05T13:20:00",
    dueDate: "2026-01-20T17:00:00",
    company: "KOQ LLC",
    location: "Downtown Seattle",
  },
  {
    id: "9",
    title: "Update pay schedule for Q1",
    description: "Optional: Review and confirm pay schedule settings for the first quarter. No changes required unless adjustments needed.",
    type: "onboarding",
    priority: "low",
    status: "resolved",
    assignedTo: [
      { name: "Sarah Chen", initials: "SC", role: "support" },
    ],
    createdAt: "2025-12-28T10:00:00",
    dueDate: "2026-01-05T17:00:00",
    company: "KOQ LLC",
  },
];

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; icon: typeof AlertCircle }> = {
  critical: { label: "Critical", color: "text-red-600", bgColor: "bg-red-50 border-red-200", icon: AlertCircle },
  high: { label: "High", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200", icon: AlertTriangle },
  medium: { label: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200", icon: Clock },
  low: { label: "Low", color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
};

const typeConfig: Record<TaskType, { label: string; icon: typeof Users }> = {
  onboarding: { label: "Onboarding", icon: Users },
  mapping: { label: "Mapping", icon: RefreshCw },
  payroll: { label: "Payroll", icon: Banknote },
  tax: { label: "Tax & Compliance", icon: FileWarning },
  anomaly: { label: "Anomaly", icon: AlertTriangle },
};

const statusConfig: Record<Status, { label: string; icon: typeof CircleDot }> = {
  open: { label: "Open", icon: CircleDot },
  in_progress: { label: "In Progress", icon: Clock },
  snoozed: { label: "Snoozed", icon: Pause },
  resolved: { label: "Resolved", icon: CheckCircle2 },
};

const roleLabels: Record<Role, string> = {
  operator: "Operator",
  manager: "Manager",
  accountant: "Accountant",
  support: "Internal Support",
  onboarding_specialist: "Onboarding Specialist",
};

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const priority = priorityConfig[task.priority];
  const type = typeConfig[task.type];
  const PriorityIcon = priority.icon;
  const TypeIcon = type.icon;

  return (
    <div
      data-testid={`task-card-${task.id}`}
      onClick={onClick}
      className={cn(
        "group p-4 bg-white border rounded-sm cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-gray-300",
        task.priority === "critical" && "border-l-4 border-l-red-500",
        task.priority === "high" && "border-l-4 border-l-orange-500",
        task.priority === "medium" && "border-l-4 border-l-yellow-500",
        task.priority === "low" && "border-l-4 border-l-emerald-500"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("text-xs font-medium", priority.bgColor, priority.color)}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {priority.label}
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              <TypeIcon className="h-3 w-3 mr-1" />
              {type.label}
            </Badge>
          </div>

          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {task.title}
          </h3>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {task.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {task.company}
              </span>
            )}
            {task.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {task.location}
              </span>
            )}
            {task.employees && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {task.employees} employees
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((person, i) => (
              <Avatar key={i} className="h-7 w-7 border-2 border-white">
                <AvatarFallback className="text-[10px] bg-gray-100">
                  {person.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-muted-foreground">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Created {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}

function TaskDetailPanel({ task, onClose, onResolve, onSnooze, onReassign }: {
  task: Task;
  onClose: () => void;
  onResolve: () => void;
  onSnooze: () => void;
  onReassign: () => void;
}) {
  const priority = priorityConfig[task.priority];
  const type = typeConfig[task.type];
  const status = statusConfig[task.status];
  const PriorityIcon = priority.icon;
  const TypeIcon = type.icon;
  const StatusIcon = status.icon;

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
      <DialogHeader className="p-6 pb-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={cn("text-xs font-medium", priority.bgColor, priority.color)}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priority.label}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <TypeIcon className="h-3 w-3 mr-1" />
                {type.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-serif">{task.title}</DialogTitle>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-foreground">{task.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Related Items</h4>
              <div className="space-y-2">
                {task.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{task.company}</span>
                  </div>
                )}
                {task.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{task.location}</span>
                  </div>
                )}
                {task.employees && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{task.employees} employees affected</span>
                  </div>
                )}
                {task.payrollRun && (
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span>{task.payrollRun}</span>
                    <ExternalLink className="h-3 w-3 text-primary cursor-pointer" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due</span>
                  <span className={cn(new Date(task.dueDate) < new Date() && task.status !== "resolved" && "text-red-600 font-medium")}>
                    {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Assigned To</h4>
            <div className="space-y-2">
              {task.assignedTo.map((person, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-gray-200">{person.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[person.role]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {task.escalationHistory && task.escalationHistory.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Escalation History
                </h4>
                <div className="space-y-2">
                  {task.escalationHistory.map((escalation, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm p-2 bg-red-50 rounded-sm border border-red-100">
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                      <span>
                        Priority escalated from <Badge variant="outline" className="text-xs mx-1">{priorityConfig[escalation.from].label}</Badge>
                        to <Badge variant="outline" className={cn("text-xs mx-1", priorityConfig[escalation.to].bgColor, priorityConfig[escalation.to].color)}>{priorityConfig[escalation.to].label}</Badge>
                      </span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(escalation.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <Button variant="outline" onClick={onClose} data-testid="button-close-task">
          Close
        </Button>
        <div className="flex items-center gap-2">
          {task.status !== "snoozed" && task.status !== "resolved" && (
            <Button variant="outline" onClick={onSnooze} data-testid="button-snooze-task">
              <Pause className="h-4 w-4 mr-2" />
              Snooze
            </Button>
          )}
          <Button variant="outline" onClick={onReassign} data-testid="button-reassign-task">
            <User className="h-4 w-4 mr-2" />
            Reassign
          </Button>
          {task.status !== "resolved" && (
            <Button onClick={onResolve} data-testid="button-resolve-task">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

function PriorityBadgeCount({ priority, count }: { priority: Priority; count: number }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  if (count === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium", config.bgColor, config.color)}>
      <Icon className="h-3 w-3" />
      <span>{count}</span>
    </div>
  );
}

export default function WorkQueue() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "open" && task.status !== "open") return false;
    if (activeTab === "in_progress" && task.status !== "in_progress") return false;
    if (activeTab === "snoozed" && task.status !== "snoozed") return false;
    if (activeTab === "resolved" && task.status !== "resolved") return false;

    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (typeFilter !== "all" && task.type !== typeFilter) return false;
    if (roleFilter !== "all" && !task.assignedTo.some((a) => a.role === roleFilter)) return false;

    return true;
  });

  const groupedByPriority = {
    critical: filteredTasks.filter((t) => t.priority === "critical"),
    high: filteredTasks.filter((t) => t.priority === "high"),
    medium: filteredTasks.filter((t) => t.priority === "medium"),
    low: filteredTasks.filter((t) => t.priority === "low"),
  };

  const counts = {
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    snoozed: tasks.filter((t) => t.status === "snoozed").length,
    resolved: tasks.filter((t) => t.status === "resolved").length,
  };

  const priorityCounts = {
    critical: tasks.filter((t) => t.status !== "resolved" && t.priority === "critical").length,
    high: tasks.filter((t) => t.status !== "resolved" && t.priority === "high").length,
    medium: tasks.filter((t) => t.status !== "resolved" && t.priority === "medium").length,
    low: tasks.filter((t) => t.status !== "resolved" && t.priority === "low").length,
  };

  const handleResolve = () => {
    if (!selectedTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, status: "resolved" as Status } : t))
    );
    setSelectedTask(null);
  };

  const handleSnooze = () => {
    if (!selectedTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, status: "snoozed" as Status } : t))
    );
    setSelectedTask(null);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Work Queue</h1>
              <p className="text-muted-foreground mt-1">
                Your prioritized task queue — always know what to work on next
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadgeCount priority="critical" count={priorityCounts.critical} />
              <PriorityBadgeCount priority="high" count={priorityCounts.high} />
              <PriorityBadgeCount priority="medium" count={priorityCounts.medium} />
              <PriorityBadgeCount priority="low" count={priorityCounts.low} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-tasks"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-priority-filter">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-type-filter">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="mapping">Mapping</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="tax">Tax & Compliance</SelectItem>
              <SelectItem value="anomaly">Anomaly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-role-filter">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="support">Internal Support</SelectItem>
              <SelectItem value="onboarding_specialist">Onboarding Specialist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="open" className="gap-2" data-testid="tab-open">
              Open
              {counts.open > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{counts.open}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2" data-testid="tab-in-progress">
              In Progress
              {counts.in_progress > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{counts.in_progress}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="snoozed" className="gap-2" data-testid="tab-snoozed">
              Snoozed
              {counts.snoozed > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{counts.snoozed}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="resolved" className="gap-2" data-testid="tab-resolved">
              Resolved
              {counts.resolved > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{counts.resolved}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 bg-white border rounded-sm">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No tasks match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {(["critical", "high", "medium", "low"] as Priority[]).map((priority) => {
                  const tasksForPriority = groupedByPriority[priority];
                  if (tasksForPriority.length === 0) return null;

                  const config = priorityConfig[priority];

                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn("h-2 w-2 rounded-full", {
                          "bg-red-500": priority === "critical",
                          "bg-orange-500": priority === "high",
                          "bg-yellow-500": priority === "medium",
                          "bg-emerald-500": priority === "low",
                        })} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {config.label} Priority
                        </h3>
                        <span className="text-xs text-muted-foreground">({tasksForPriority.length})</span>
                      </div>
                      <div className="space-y-3">
                        {tasksForPriority.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => setSelectedTask(task)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onResolve={handleResolve}
            onSnooze={handleSnooze}
            onReassign={() => {}}
          />
        )}
      </Dialog>
    </Layout>
  );
}
