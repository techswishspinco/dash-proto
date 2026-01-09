import React, { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Download,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Settings,
  Users,
  FileText,
  Banknote,
  CheckCircle2,
  Zap,
  Lock,
  AlertCircle,
  Link2
} from "lucide-react";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type PayrollStatus = "draft" | "ready" | "pending" | "paid";

interface PayrollRun {
  id: string;
  payday: string;
  approvalDeadline: string;
  type: string;
  status: PayrollStatus;
  employeePay?: number;
  companyTaxes?: number;
  total?: number;
}

interface PaySchedule {
  id: string;
  name: string;
  frequency: string;
  nextPayDate: string;
}

interface ActionItem {
  id: string;
  label: string;
  type: "blocking" | "attention" | "info";
  count?: number;
}

interface EmployeeOnboarding {
  id: string;
  name: string;
  location: string;
  status: "blocking" | "attention";
  issues?: string[];
}

interface CompanyIssue {
  id: string;
  label: string;
  completed: boolean;
}

const upcomingPayroll: PayrollRun = { 
  id: "1", 
  payday: "Jan 15, 2026", 
  approvalDeadline: "Jan 13, 2026", 
  type: "Regular", 
  status: "ready" 
};

const recentPayrolls: PayrollRun[] = [
  { id: "3", payday: "Jan 1, 2026", type: "Regular", status: "paid", employeePay: 45230.50, companyTaxes: 8240.12, total: 53470.62, approvalDeadline: "" },
  { id: "4", payday: "Dec 15, 2025", type: "Regular", status: "paid", employeePay: 44890.00, companyTaxes: 8180.50, total: 53070.50, approvalDeadline: "" },
  { id: "5", payday: "Dec 1, 2025", type: "Regular", status: "paid", employeePay: 43560.25, companyTaxes: 7940.80, total: 51501.05, approvalDeadline: "" },
  { id: "6", payday: "Nov 15, 2025", type: "Bonus", status: "paid", employeePay: 12500.00, companyTaxes: 2280.00, total: 14780.00, approvalDeadline: "" },
  { id: "7", payday: "Nov 1, 2025", type: "Regular", status: "paid", employeePay: 44120.75, companyTaxes: 8050.25, total: 52171.00, approvalDeadline: "" },
];

const paySchedules: PaySchedule[] = [
  { id: "1", name: "Non-Salaried Staff", frequency: "Bi-weekly", nextPayDate: "Jan 15, 2026" },
  { id: "2", name: "Salaried", frequency: "Semi-monthly", nextPayDate: "Jan 15, 2026" },
];

const employeesNeedingOnboarding: EmployeeOnboarding[] = [
  { id: "1", name: "Alan Huang", location: "Little Shop", status: "attention", issues: ["W-4 form incomplete", "Direct deposit pending"] },
  { id: "2", name: "Contact Obao", location: "Little Shop", status: "blocking", issues: ["Missing SSN", "I-9 verification required", "State tax form missing"] },
  { id: "3", name: "Joseph Chen", location: "Little Shop", status: "blocking", issues: ["Employment eligibility not verified", "Missing banking information"] },
];

const companyBlockingIssues: CompanyIssue[] = [
  { id: "1", label: "Bank account not linked", completed: false },
  { id: "2", label: "Bank account not verified", completed: false },
  { id: "3", label: "Debit authorization not submitted", completed: false },
  { id: "4", label: "New York tax parameters incomplete", completed: false },
  { id: "5", label: "Federal tax parameters incomplete", completed: false },
  { id: "6", label: "Federal Form 8655 not submitted", completed: false },
  { id: "7", label: "New York TR-579-WT not submitted", completed: false },
  { id: "8", label: "New York TR-2000 not submitted", completed: false },
];

const actionItems: ActionItem[] = [
  { id: "1", label: "Complete legal entity profile", type: "blocking", count: companyBlockingIssues.filter(i => !i.completed).length },
  { id: "2", label: "Onboard employee", type: "attention", count: employeesNeedingOnboarding.length },
];

const statusColors: Record<PayrollStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  ready: "bg-amber-100 text-amber-700",
  pending: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<PayrollStatus, string> = {
  draft: "Draft",
  ready: "Ready to Run",
  pending: "Pending",
  paid: "Paid",
};

const entities = [
  { id: "koq-sf", name: "KOQ SF Inc.", email: "payroll@koqsf.com", isComplete: false },
  { id: "koq-llc", name: "KOQ Restaurant Group LLC", email: "payroll@koqrestaurant.com", isComplete: true },
];

// Mock staff data for mapping approval
interface StaffMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  posEmployeeIds: string[];
  payrollEmployeeId: string | null;
}

interface POSEmployee {
  id: string;
  name: string;
  posSystem: string;
}

interface PayrollEmployee {
  id: string;
  name: string;
  payrollSystem: string;
}

const mockStaff: StaffMember[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@restaurant.com", initials: "SC", avatarColor: "bg-blue-600", posEmployeeIds: ["pos-1"], payrollEmployeeId: "pay-1" },
  { id: "2", name: "Michael Torres", email: "michael@restaurant.com", initials: "MT", avatarColor: "bg-emerald-600", posEmployeeIds: ["pos-2", "pos-3"], payrollEmployeeId: "pay-2" },
  { id: "3", name: "Emily Johnson", email: "emily@restaurant.com", initials: "EJ", avatarColor: "bg-purple-600", posEmployeeIds: ["pos-4"], payrollEmployeeId: "pay-3" },
  { id: "4", name: "David Kim", email: "david@restaurant.com", initials: "DK", avatarColor: "bg-amber-600", posEmployeeIds: [], payrollEmployeeId: null },
];

const mockPOSEmployees: POSEmployee[] = [
  { id: "pos-1", name: "Sarah C.", posSystem: "Toast" },
  { id: "pos-2", name: "Mike T.", posSystem: "Toast" },
  { id: "pos-3", name: "M. Torres (Bar)", posSystem: "Toast" },
  { id: "pos-4", name: "Emily J.", posSystem: "Toast" },
  { id: "pos-5", name: "New Hire - Toast", posSystem: "Toast" },
];

const mockPayrollEmployees: PayrollEmployee[] = [
  { id: "pay-1", name: "Sarah Chen", payrollSystem: "Gusto" },
  { id: "pay-2", name: "Michael Torres", payrollSystem: "Gusto" },
  { id: "pay-3", name: "Emily Johnson", payrollSystem: "Gusto" },
  { id: "pay-4", name: "David Kim", payrollSystem: "Gusto" },
];

export default function PayrollHome() {
  const [, setLocation] = useLocation();
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRun | null>(null);
  const [showPayrollDrawer, setShowPayrollDrawer] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PaySchedule | null>(null);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState("koq-sf");
  const [showCompanyIssuesSheet, setShowCompanyIssuesSheet] = useState(false);
  const [showEmployeeOnboardingSheet, setShowEmployeeOnboardingSheet] = useState(false);
  const [selectedOnboardingEmployee, setSelectedOnboardingEmployee] = useState<EmployeeOnboarding | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Auto Import mapping approval state
  const [showMappingApproval, setShowMappingApproval] = useState(false);
  const [mappingApprovalType, setMappingApprovalType] = useState<"pos" | "payroll">("pos");
  const [approvedPOSMappings, setApprovedPOSMappings] = useState<Set<string>>(new Set());
  const [approvedPayrollMappings, setApprovedPayrollMappings] = useState<Set<string>>(new Set());

  // Calculate mapping approval status
  const allMappedPOSIds = mockStaff.flatMap(s => s.posEmployeeIds);
  const unmappedPOSEmployees = mockPOSEmployees.filter(e => !allMappedPOSIds.includes(e.id));
  const usersWithoutPayrollMapping = mockStaff.filter(s => !s.payrollEmployeeId);
  
  const existingPOSMappings = mockStaff.filter(s => s.posEmployeeIds.length > 0);
  const existingPayrollMappings = mockStaff.filter(s => s.payrollEmployeeId !== null);
  const unapprovedPOSMappings = existingPOSMappings.filter(s => !approvedPOSMappings.has(s.id));
  const unapprovedPayrollMappings = existingPayrollMappings.filter(s => !approvedPayrollMappings.has(s.id));
  
  const allPOSMappingsApproved = unapprovedPOSMappings.length === 0 && existingPOSMappings.length > 0;
  const allPayrollMappingsApproved = unapprovedPayrollMappings.length === 0 && existingPayrollMappings.length > 0;
  
  // For complete entities, Auto Import is already enabled
  const currentEntity = entities.find(e => e.id === selectedEntity);
  const isEntityComplete = currentEntity?.isComplete ?? false;
  const canEnableAutoImport = isEntityComplete || (allPOSMappingsApproved && allPayrollMappingsApproved && unmappedPOSEmployees.length === 0 && usersWithoutPayrollMapping.length === 0);

  const openMappingApproval = (type: "pos" | "payroll") => {
    setMappingApprovalType(type);
    setShowMappingApproval(true);
  };

  const approvePOSMapping = (staffId: string) => {
    setApprovedPOSMappings(prev => new Set([...prev, staffId]));
  };

  const approvePayrollMapping = (staffId: string) => {
    setApprovedPayrollMappings(prev => new Set([...prev, staffId]));
  };

  const approveAllPOSMappings = () => {
    const allIds = existingPOSMappings.map(s => s.id);
    setApprovedPOSMappings(new Set(allIds));
  };

  const approveAllPayrollMappings = () => {
    const allIds = existingPayrollMappings.map(s => s.id);
    setApprovedPayrollMappings(new Set(allIds));
  };

  const getPOSEmployee = (id: string) => mockPOSEmployees.find(e => e.id === id);
  const getPayrollEmployee = (id: string | null) => id ? mockPayrollEmployees.find(e => e.id === id) : null;

  const handleUpcomingPayrollClick = (payroll: PayrollRun) => {
    setLocation("/payroll/run");
  };

  const handleRecentPayrollClick = (payroll: PayrollRun) => {
    setSelectedPayroll(payroll);
    setShowPayrollDrawer(true);
  };

  const handleEditSchedule = (schedule: PaySchedule) => {
    setSelectedSchedule(schedule);
    setShowEditScheduleModal(true);
  };

  const displayedRecentPayrolls = showAllRecent ? recentPayrolls : recentPayrolls.slice(0, 2);

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-6">
            <span className="font-serif text-2xl font-medium" data-testid="text-page-title">Payroll Home</span>
          </div>
          
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="border-0 bg-transparent p-0 h-auto gap-0 hover:text-foreground transition-colors focus:ring-0 focus:ring-offset-0 focus:outline-none shadow-none [&>svg]:hidden" data-testid="select-entity">
                <span>{currentEntity?.name || "Select Location"} <span className="text-[10px]">▼</span></span>
              </SelectTrigger>
              <SelectContent>
                {entities.map((ent) => (
                  <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            {!isEntityComplete && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle>Getting Started</CardTitle>
                      <CardDescription>Complete the following steps to start running payroll</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="text-sm font-medium text-muted-foreground mb-3">Required steps</div>
                    {companyBlockingIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          issue.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                        )}>
                          {issue.completed && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={cn("text-sm", issue.completed ? "text-muted-foreground line-through" : "text-foreground")}>
                          {issue.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" onClick={() => setLocation("/payroll/onboarding?step=setup")} data-testid="button-complete-profile">
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {isEntityComplete && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg">Upcoming Payrolls</CardTitle>
                  <Button variant="ghost" size="icon" data-testid="button-payroll-settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="px-6 py-3 font-medium">Payday</th>
                        <th className="px-6 py-3 font-medium">Approval Deadline</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleUpcomingPayrollClick(upcomingPayroll)}
                        data-testid={`row-payroll-${upcomingPayroll.id}`}
                      >
                        <td className="px-6 py-4 font-medium">{upcomingPayroll.payday}</td>
                        <td className="px-6 py-4 text-muted-foreground">{upcomingPayroll.approvalDeadline}</td>
                        <td className="px-6 py-4">{upcomingPayroll.type}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn("font-normal", statusColors[upcomingPayroll.status])}>
                            {statusLabels[upcomingPayroll.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" data-testid={`button-menu-${upcomingPayroll.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPayroll(upcomingPayroll); setShowPayrollDrawer(true); }}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation("/payroll/run"); }}>Run Payroll</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {isEntityComplete && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg">Recent Payrolls</CardTitle>
                  {displayedRecentPayrolls.length > 2 && (
                    <Button 
                      variant="link" 
                      className="text-sm"
                      onClick={() => setShowAllRecent(!showAllRecent)}
                      data-testid="button-view-all-recent"
                    >
                      {showAllRecent ? "Collapse" : "View all"}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className={displayedRecentPayrolls.length > 0 ? "p-0" : "py-8"}>
                  {displayedRecentPayrolls.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="px-6 py-3 font-medium">Payday</th>
                          <th className="px-6 py-3 font-medium">Employee Pay</th>
                          <th className="px-6 py-3 font-medium">Company Taxes</th>
                          <th className="px-6 py-3 font-medium">Total</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRecentPayrolls.map((payroll) => (
                          <tr 
                            key={payroll.id} 
                            className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleRecentPayrollClick(payroll)}
                            data-testid={`row-recent-${payroll.id}`}
                          >
                            <td className="px-6 py-4 font-medium">{payroll.payday}</td>
                            <td className="px-6 py-4">${payroll.employeePay?.toLocaleString()}</td>
                            <td className="px-6 py-4">${payroll.companyTaxes?.toLocaleString()}</td>
                            <td className="px-6 py-4 font-medium">${payroll.total?.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <Badge className={cn("font-normal", statusColors[payroll.status])}>
                                {statusLabels[payroll.status]}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" data-testid={`button-menu-recent-${payroll.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPayroll(payroll); setShowPayrollDrawer(true); }}>View Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Download Journal</DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Download Summary</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No recent payrolls yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isEntityComplete && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Pay Schedules</CardTitle>
                </CardHeader>
                <CardContent className={paySchedules.length > 0 ? "p-0" : "py-8"}>
                  {paySchedules.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="px-6 py-3 font-medium">Name</th>
                          <th className="px-6 py-3 font-medium">Pay Frequency</th>
                          <th className="px-6 py-3 font-medium">Next Pay Date</th>
                          <th className="px-6 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paySchedules.map((schedule) => (
                          <tr 
                            key={schedule.id} 
                            className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            data-testid={`row-schedule-${schedule.id}`}
                          >
                            <td className="px-6 py-4 font-medium">{schedule.name}</td>
                            <td className="px-6 py-4">{schedule.frequency}</td>
                            <td className="px-6 py-4">{schedule.nextPayDate}</td>
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" data-testid={`button-schedule-menu-${schedule.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedSchedule(schedule); setShowCalendarModal(true); }}>
                                    <Calendar className="h-4 w-4 mr-2" /> View Calendar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No pay schedules configured yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="w-80 space-y-6">
            {isEntityComplete && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Actions Needed</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* POS Mapping Approval */}
                  <button
                    onClick={() => openMappingApproval("pos")}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left border-b"
                    data-testid="button-action-pos-mappings"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        allPOSMappingsApproved && unmappedPOSEmployees.length === 0 
                          ? "bg-emerald-500" 
                          : "bg-amber-500"
                      )} />
                      <span className="text-sm">POS Mappings</span>
                      {(unapprovedPOSMappings.length > 0 || unmappedPOSEmployees.length > 0) && (
                        <Badge variant="secondary" className="text-xs">
                          {unapprovedPOSMappings.length + unmappedPOSEmployees.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Payroll Mapping Approval */}
                  <button
                    onClick={() => openMappingApproval("payroll")}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left border-b"
                    data-testid="button-action-payroll-mappings"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        allPayrollMappingsApproved && usersWithoutPayrollMapping.length === 0 
                          ? "bg-emerald-500" 
                          : "bg-amber-500"
                      )} />
                      <span className="text-sm">Payroll Mappings</span>
                      {(unapprovedPayrollMappings.length > 0 || usersWithoutPayrollMapping.length > 0) && (
                        <Badge variant="secondary" className="text-xs">
                          {unapprovedPayrollMappings.length + usersWithoutPayrollMapping.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Employee Onboarding */}
                  {actionItems.filter(item => item.id === "2").map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                      onClick={() => setShowEmployeeOnboardingSheet(true)}
                      data-testid={`button-action-${item.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          item.type === "blocking" ? "bg-red-500" : 
                          item.type === "attention" ? "bg-amber-500" : "bg-gray-300"
                        )} />
                        <span className="text-sm">{item.label}</span>
                        {item.count && item.count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.count}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Legal Entity Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{currentEntity?.name}</div>
                    <div className="text-muted-foreground">Legal Name</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{currentEntity?.email}</div>
                    <div className="text-muted-foreground">Email</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">123 Main Street, Suite 100</div>
                    <div className="text-muted-foreground">San Francisco, CA 94102</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">(415) 555-0123</div>
                    <div className="text-muted-foreground">Phone</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {canEnableAutoImport ? "Enabled" : "Disabled"}
                      <div className={cn("h-2 w-2 rounded-full", canEnableAutoImport ? "bg-emerald-500" : "bg-gray-400")} />
                    </div>
                    <div className="text-muted-foreground">Auto Import Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Sheet open={showPayrollDrawer} onOpenChange={setShowPayrollDrawer}>
          <SheetContent className="w-[500px] sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Payroll Run</SheetTitle>
              <SheetDescription>
                {selectedPayroll?.type} payroll for {selectedPayroll?.payday}
              </SheetDescription>
            </SheetHeader>
            {selectedPayroll && (
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">Pay Period</span>
                    <span className="font-medium">Dec 16 - Dec 31, 2025</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">Pay Date</span>
                    <span className="font-medium">{selectedPayroll.payday}</span>
                  </div>
                  {selectedPayroll.approvalDeadline && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-muted-foreground">Approval Deadline</span>
                      <span className="font-medium">{selectedPayroll.approvalDeadline}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={cn("font-normal", statusColors[selectedPayroll.status])}>
                      {statusLabels[selectedPayroll.status]}
                    </Badge>
                  </div>
                </div>

                {selectedPayroll.status === "paid" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employee Pay</span>
                        <span className="font-medium">${selectedPayroll.employeePay?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company Taxes</span>
                        <span className="font-medium">${selectedPayroll.companyTaxes?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">${selectedPayroll.total?.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" data-testid="button-download-journal">
                      <Download className="h-4 w-4 mr-2" /> Download Journal
                    </Button>
                    <Button className="w-full" variant="outline" data-testid="button-download-summary">
                      <Download className="h-4 w-4 mr-2" /> Download Summary
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => setLocation("/payroll/run")} data-testid="button-run-payroll">
                      Run Payroll
                    </Button>
                    <Button className="w-full" variant="outline" data-testid="button-approve-payroll">
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>

        <Dialog open={showEditScheduleModal} onOpenChange={setShowEditScheduleModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pay Schedule</DialogTitle>
              <DialogDescription>Modify the pay schedule settings.</DialogDescription>
            </DialogHeader>
            {selectedSchedule && (
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Schedule Name</Label>
                  <Input defaultValue={selectedSchedule.name} data-testid="input-schedule-name" />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <select className="w-full h-10 px-3 border rounded-md" defaultValue={selectedSchedule.frequency} data-testid="select-schedule-frequency">
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Semi-monthly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Next 3 Pay Cycles</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Jan 15, 2026
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Jan 31, 2026
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Feb 15, 2026
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditScheduleModal(false)} data-testid="button-cancel-schedule">
                    Cancel
                  </Button>
                  <Button data-testid="button-save-schedule">Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pay Calendar</DialogTitle>
              <DialogDescription>
                {selectedSchedule?.name} - {selectedSchedule?.frequency}
              </DialogDescription>
            </DialogHeader>
            {selectedSchedule && (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">15</div>
                    <div className="text-sm text-muted-foreground">Jan 2026</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-700">Next Pay</Badge>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold">31</div>
                    <div className="text-sm text-muted-foreground">Jan 2026</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold">15</div>
                    <div className="text-sm text-muted-foreground">Feb 2026</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold">28</div>
                    <div className="text-sm text-muted-foreground">Feb 2026</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold">15</div>
                    <div className="text-sm text-muted-foreground">Mar 2026</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold">31</div>
                    <div className="text-sm text-muted-foreground">Mar 2026</div>
                  </div>
                </div>
                <div className="pt-2 text-center text-sm text-muted-foreground">
                  Showing next 6 pay dates
                </div>
                <Button className="w-full" variant="outline" onClick={() => setShowCalendarModal(false)} data-testid="button-close-calendar">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Sheet open={showCompanyIssuesSheet} onOpenChange={setShowCompanyIssuesSheet}>
          <SheetContent className="w-[500px] sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Legal Entity Onboarding</SheetTitle>
              <SheetDescription>
                Complete these items to start running payroll
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Blocking Issues
                </div>
                <p className="text-sm text-red-700">
                  These items must be completed before you can process payroll.
                </p>
              </div>
              <ul className="space-y-2 pl-4">
                {companyBlockingIssues.map((issue) => (
                  <li 
                    key={issue.id}
                    className="flex items-center gap-2 text-sm"
                    data-testid={`issue-${issue.id}`}
                  >
                    <span className="text-red-500">•</span>
                    <span>{issue.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={showEmployeeOnboardingSheet} onOpenChange={(open) => {
          setShowEmployeeOnboardingSheet(open);
          if (!open) setSelectedOnboardingEmployee(null);
        }}>
          <SheetContent className="w-[500px] sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>
                {selectedOnboardingEmployee ? selectedOnboardingEmployee.name : "Employee Onboarding"}
              </SheetTitle>
              <SheetDescription>
                {selectedOnboardingEmployee 
                  ? "Complete these items to finish onboarding" 
                  : `${employeesNeedingOnboarding.length} employees need attention`}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {!selectedOnboardingEmployee ? (
                <div className="space-y-2">
                  {employeesNeedingOnboarding.map((emp) => (
                    <button
                      key={emp.id}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border transition-colors text-left"
                      onClick={() => setSelectedOnboardingEmployee(emp)}
                      data-testid={`employee-onboard-${emp.id}`}
                    >
                      <div>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-muted-foreground">{emp.location}</div>
                      </div>
                      <Badge className={cn(
                        "font-normal",
                        emp.status === "blocking" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {emp.status === "blocking" ? "Blocking" : "Needs Attention"}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <Button 
                    variant="ghost" 
                    className="mb-4 -ml-2"
                    onClick={() => setSelectedOnboardingEmployee(null)}
                    data-testid="button-back-to-list"
                  >
                    ← Back to list
                  </Button>
                  <div className={cn(
                    "p-4 rounded-lg mb-6",
                    selectedOnboardingEmployee.status === "blocking" 
                      ? "bg-red-50 border border-red-200" 
                      : "bg-amber-50 border border-amber-200"
                  )}>
                    <div className={cn(
                      "flex items-center gap-2 font-medium mb-2",
                      selectedOnboardingEmployee.status === "blocking" ? "text-red-800" : "text-amber-800"
                    )}>
                      <AlertTriangle className="h-4 w-4" />
                      {selectedOnboardingEmployee.status === "blocking" ? "Blocking Issues" : "Needs Attention"}
                    </div>
                    <p className={cn(
                      "text-sm",
                      selectedOnboardingEmployee.status === "blocking" ? "text-red-700" : "text-amber-700"
                    )}>
                      {selectedOnboardingEmployee.status === "blocking" 
                        ? "These items must be completed before this employee can be paid."
                        : "These items should be resolved soon."}
                    </p>
                  </div>
                  <ul className="space-y-2 pl-4">
                    {selectedOnboardingEmployee.issues?.map((issue, index) => (
                      <li 
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className={selectedOnboardingEmployee.status === "blocking" ? "text-red-500" : "text-amber-500"}>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" data-testid="button-complete-onboarding">
                    Complete Onboarding
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Mapping Approval Sheet */}
        <Sheet open={showMappingApproval} onOpenChange={setShowMappingApproval}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {mappingApprovalType === "pos" ? "Review POS Employee Mappings" : "Review Payroll Employee Mappings"}
              </SheetTitle>
              <SheetDescription>
                {mappingApprovalType === "pos" 
                  ? "Review and approve how POS employees from Toast are linked to user accounts. Auto import cannot be enabled until all mappings are approved."
                  : "Review and approve how payroll employees from Gusto are linked to user accounts. Auto import cannot be enabled until all mappings are approved."
                }
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Approve All Button */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {mappingApprovalType === "pos" 
                    ? `${existingPOSMappings.length - unapprovedPOSMappings.length} of ${existingPOSMappings.length} approved`
                    : `${existingPayrollMappings.length - unapprovedPayrollMappings.length} of ${existingPayrollMappings.length} approved`
                  }
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={mappingApprovalType === "pos" ? approveAllPOSMappings : approveAllPayrollMappings}
                  data-testid="button-approve-all-mappings"
                >
                  Approve All
                </Button>
              </div>

              {/* Mappings List */}
              <div className="space-y-3">
                {mappingApprovalType === "pos" ? (
                  <>
                    {existingPOSMappings.map((person) => {
                      const isApproved = approvedPOSMappings.has(person.id);
                      return (
                        <div 
                          key={person.id}
                          className={cn(
                            "border rounded-lg p-4 transition-colors",
                            isApproved ? "bg-emerald-50 border-emerald-200" : "bg-white"
                          )}
                          data-testid={`mapping-approval-${person.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium", person.avatarColor)}>
                                {person.initials}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{person.name}</div>
                                <div className="text-xs text-muted-foreground">{person.email}</div>
                              </div>
                            </div>
                            {isApproved ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Check className="h-4 w-4" />
                                Approved
                              </span>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => approvePOSMapping(person.id)}
                                data-testid={`button-approve-${person.id}`}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs text-muted-foreground mb-2">Linked POS Employees:</div>
                            <div className="space-y-2">
                              {person.posEmployeeIds.map(posId => {
                                const posEmp = getPOSEmployee(posId);
                                return (
                                  <div key={posId} className="flex items-center gap-2 text-sm">
                                    <Link2 className="h-3 w-3 text-blue-600" />
                                    <span>{posEmp?.name}</span>
                                    <span className="text-xs text-muted-foreground">({posEmp?.posSystem})</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Unmapped POS Employees */}
                    {unmappedPOSEmployees.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-3 text-amber-700">Unmapped POS Employees</div>
                        <div className="space-y-2">
                          {unmappedPOSEmployees.map(emp => (
                            <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <span className="text-sm">{emp.name}</span>
                                <span className="text-xs text-muted-foreground">({emp.posSystem})</span>
                              </div>
                              <span className="text-xs text-amber-600">Needs mapping</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {existingPayrollMappings.map((person) => {
                      const isApproved = approvedPayrollMappings.has(person.id);
                      const payrollEmp = getPayrollEmployee(person.payrollEmployeeId);
                      return (
                        <div 
                          key={person.id}
                          className={cn(
                            "border rounded-lg p-4 transition-colors",
                            isApproved ? "bg-emerald-50 border-emerald-200" : "bg-white"
                          )}
                          data-testid={`mapping-approval-${person.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium", person.avatarColor)}>
                                {person.initials}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{person.name}</div>
                                <div className="text-xs text-muted-foreground">{person.email}</div>
                              </div>
                            </div>
                            {isApproved ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Check className="h-4 w-4" />
                                Approved
                              </span>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => approvePayrollMapping(person.id)}
                                data-testid={`button-approve-${person.id}`}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs text-muted-foreground mb-2">Linked Payroll Employee:</div>
                            <div className="flex items-center gap-2 text-sm">
                              <Link2 className="h-3 w-3 text-emerald-600" />
                              <span>{payrollEmp?.name}</span>
                              <span className="text-xs text-muted-foreground">({payrollEmp?.payrollSystem})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Users without Payroll Mapping */}
                    {usersWithoutPayrollMapping.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="text-sm font-medium mb-3 text-amber-700">Users Without Payroll Mapping</div>
                        <div className="space-y-2">
                          {usersWithoutPayrollMapping.map(person => (
                            <div key={person.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium", person.avatarColor)}>
                                  {person.initials}
                                </div>
                                <span className="text-sm">{person.name}</span>
                              </div>
                              <span className="text-xs text-amber-600">Needs mapping</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowMappingApproval(false)}>
                Close
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
