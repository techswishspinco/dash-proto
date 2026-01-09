import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Users,
  Clock,
  FileText,
  CheckCircle2,
  Upload,
  Download,
  FileSpreadsheet,
  Edit3,
  Zap,
  Loader2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type RunPayrollStep = 1 | 2 | 3 | 4;

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  type: "Hourly" | "Salary";
  hourlyRate?: number;
  selected: boolean;
  regularHours: number;
  overtimeHours: number;
  spreadOfHours: number;
}

interface Earning {
  id: string;
  type: string;
  description: string;
  amount: number;
}

const mockEmployees: Employee[] = [
  { id: "1", firstName: "Sarah", lastName: "Mascot", role: "Server", type: "Hourly", hourlyRate: 22.00, selected: true, regularHours: 40, overtimeHours: 5, spreadOfHours: 0 },
  { id: "2", firstName: "Jeff", lastName: "Golden", role: "Line Cook", type: "Hourly", hourlyRate: 18.50, selected: true, regularHours: 38, overtimeHours: 0, spreadOfHours: 2 },
  { id: "3", firstName: "Sean", lastName: "Manimi", role: "Bartender", type: "Hourly", hourlyRate: 20.00, selected: true, regularHours: 35, overtimeHours: 2, spreadOfHours: 0 },
  { id: "4", firstName: "Josh", lastName: "Andrews", role: "Host", type: "Hourly", hourlyRate: 16.00, selected: false, regularHours: 32, overtimeHours: 0, spreadOfHours: 0 },
  { id: "5", firstName: "Maria", lastName: "Garcia", role: "Manager", type: "Salary", selected: true, regularHours: 0, overtimeHours: 0, spreadOfHours: 0 },
];

const defaultEarnings: Record<string, Earning[]> = {
  "1": [
    { id: "e1", type: "Bonus", description: "Performance bonus", amount: 50.00 },
    { id: "e2", type: "Tip Out", description: "Tip out credit", amount: 125.00 },
  ],
  "2": [
    { id: "e3", type: "Upsell Credit", description: "Weekly upsell bonus", amount: 35.00 },
  ],
  "3": [
    { id: "e4", type: "Tip Out", description: "Tip out credit", amount: 180.00 },
  ],
};

const steps = [
  { number: 1, label: "Select Employees" },
  { number: 2, label: "Edit Hours" },
  { number: 3, label: "Review Pay" },
  { number: 4, label: "Confirm & Pay" },
];

function updateTaskStep(stepIndex: number) {
  const stored = localStorage.getItem("activeTask");
  if (!stored) return;
  
  try {
    const task = JSON.parse(stored);
    if (task.steps && task.steps[stepIndex]) {
      task.steps[stepIndex].completed = true;
      localStorage.setItem("activeTask", JSON.stringify(task));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {}
}

const failedEmployees = [
  { id: "f1", name: "Emily Rodriguez", issue: "Missing SSN", location: "NYC - Brooklyn" },
  { id: "f2", name: "James Wilson", issue: "Missing W-4 form", location: "NYC - Brooklyn" },
  { id: "f3", name: "Ashley Thompson", issue: "Invalid tax withholding", location: "NYC - Queens" },
];

export default function PayrollRun() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<RunPayrollStep>(1);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [earnings, setEarnings] = useState<Record<string, Earning[]>>(defaultEarnings);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [hoursEntryMode, setHoursEntryMode] = useState<"select" | "import" | "manual" | "auto">("select");
  const [autoImportLoading, setAutoImportLoading] = useState(false);
  const [expandedConfirmEmployee, setExpandedConfirmEmployee] = useState<string | null>(null);
  const [showFailedPayroll, setShowFailedPayroll] = useState(false);
  const [reviewedDetails, setReviewedDetails] = useState(false);
  
  useEffect(() => {
    const stored = localStorage.getItem("activeTask");
    if (stored) {
      try {
        const task = JSON.parse(stored);
        if (task.title && task.title.includes("failed")) {
          setShowFailedPayroll(true);
        }
      } catch {}
    }
  }, []);

  const handleReviewComplete = () => {
    setReviewedDetails(true);
    updateTaskStep(0);
  };
  
  // Check if Auto Import is enabled (simulating NY location)
  const urlParams = new URLSearchParams(window.location.search);
  const autoImportEnabled = urlParams.get("autoImport") === "true";

  const selectedEmployees = employees.filter(e => e.selected);
  const payPeriod = "Jan 6, 2026 - Jan 12, 2026";
  const payday = "Jan 15, 2026";

  const toggleEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const toggleAllEmployees = () => {
    const allSelected = employees.every(e => e.selected);
    setEmployees(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const updateHours = (id: string, field: "regularHours" | "overtimeHours" | "spreadOfHours", value: number) => {
    setEmployees(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleAutoImport = () => {
    setAutoImportLoading(true);
    setTimeout(() => {
      setEmployees(prev => prev.map(e => ({
        ...e,
        regularHours: e.type === "Hourly" ? Math.floor(Math.random() * 10) + 35 : 0,
        overtimeHours: e.type === "Hourly" ? Math.floor(Math.random() * 8) : 0,
        spreadOfHours: e.type === "Hourly" && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
      })));
      setAutoImportLoading(false);
      setHoursEntryMode("manual");
      setCurrentStep(3);
    }, 2000);
  };

  const calculatePay = (employee: Employee) => {
    if (employee.type === "Salary") return 2500;
    const regular = employee.regularHours * (employee.hourlyRate || 0);
    const overtime = employee.overtimeHours * (employee.hourlyRate || 0) * 1.5;
    const spreadPay = employee.spreadOfHours * (employee.hourlyRate || 0);
    const employeeEarnings = earnings[employee.id] || [];
    const earningsTotal = employeeEarnings.reduce((sum, e) => sum + e.amount, 0);
    return regular + overtime + spreadPay + earningsTotal;
  };

  const calculateDeductions = (grossPay: number) => ({
    federalTax: grossPay * 0.12,
    stateTax: grossPay * 0.05,
    socialSecurity: grossPay * 0.062,
    medicare: grossPay * 0.0145,
    health: 125,
    dental: 25,
    vision: 10,
    retirement401k: grossPay * 0.04,
  });

  const getEmployeeIssues = (employee: Employee, grossPay: number, netPay: number): string[] => {
    const issues: string[] = [];
    if (employee.type === "Hourly") {
      if (employee.regularHours === 0 && employee.overtimeHours === 0) {
        issues.push("No hours entered");
      }
      if (!employee.hourlyRate || employee.hourlyRate === 0) {
        issues.push("Missing hourly rate");
      }
    }
    if (netPay <= 0) {
      issues.push("Negative or zero net pay");
    }
    if (grossPay > 5000) {
      issues.push("Unusually high gross pay");
    }
    return issues;
  };

  const addEarning = (employeeId: string) => {
    const newEarning: Earning = {
      id: `new-${Date.now()}`,
      type: "Bonus",
      description: "",
      amount: 0,
    };
    setEarnings(prev => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), newEarning],
    }));
  };

  const updateEarning = (employeeId: string, earningId: string, field: keyof Earning, value: string | number) => {
    setEarnings(prev => ({
      ...prev,
      [employeeId]: (prev[employeeId] || []).map(e => 
        e.id === earningId ? { ...e, [field]: value } : e
      ),
    }));
  };

  const removeEarning = (employeeId: string, earningId: string) => {
    setEarnings(prev => ({
      ...prev,
      [employeeId]: (prev[employeeId] || []).filter(e => e.id !== earningId),
    }));
  };

  const totalGrossPay = selectedEmployees.reduce((sum, e) => sum + calculatePay(e), 0);
  const estimatedTaxes = totalGrossPay * 0.15;
  const totalCost = totalGrossPay + estimatedTaxes;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as RunPayrollStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RunPayrollStep);
    } else {
      setLocation("/payroll/home");
    }
  };

  const handleApprove = () => {
    toast({
      title: "Payroll submitted!",
      description: `Payroll for ${selectedEmployees.length} employees has been approved. Funds will be disbursed on ${payday}.`,
    });
    setLocation("/payroll/home");
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        {showFailedPayroll && !reviewedDetails ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  <Button variant="link" className="p-0 h-auto text-muted-foreground" onClick={() => setLocation("/payroll/home")}>
                    Payroll
                  </Button>
                  <span className="mx-2">›</span>
                  <span className="text-red-600">Failed Payroll Run</span>
                </div>
                <h1 className="text-2xl font-bold text-red-600">Payroll Run Failed</h1>
                <p className="text-muted-foreground">January 8, 2026 - PR-2026-01-08</p>
              </div>
            </div>

            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 text-lg">Payroll could not be processed</h3>
                    <p className="text-red-700 mt-1">
                      3 employees are missing required tax information. This must be resolved before payroll can be re-run.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employees with Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground bg-gray-50">
                      <th className="px-6 py-3 font-medium">Employee</th>
                      <th className="px-6 py-3 font-medium">Location</th>
                      <th className="px-6 py-3 font-medium">Issue</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50" data-testid={`row-failed-${emp.id}`}>
                        <td className="px-6 py-4 font-medium">{emp.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{emp.location}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {emp.issue}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/teams?employee=${emp.name.toLowerCase().replace(" ", "-")}`)}
                            data-testid={`button-fix-${emp.id}`}
                          >
                            Fix Issue <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Run Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Attempted</p>
                    <p className="text-2xl font-bold">Jan 8, 2026 9:00 AM</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setLocation("/payroll/home")}>
                Back to Payroll Home
              </Button>
              <Button onClick={handleReviewComplete} data-testid="button-reviewed">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I've Reviewed the Details
              </Button>
            </div>
          </>
        ) : (
        <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              <Button variant="link" className="p-0 h-auto text-muted-foreground" onClick={() => setLocation("/payroll/home")}>
                Payroll
              </Button>
              <span className="mx-2">›</span>
              <span className="text-primary">Run Payroll</span>
            </div>
            <h1 className="text-2xl font-bold">Create Payroll</h1>
            <p className="text-muted-foreground">{payPeriod}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} data-testid="button-back">
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={(currentStep === 1 && selectedEmployees.length === 0) || (currentStep === 2 && hoursEntryMode === "select")} data-testid="button-next">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-approve">
                Approve & Pay
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep > step.number 
                    ? "bg-emerald-500 text-white" 
                    : currentStep === step.number 
                      ? "bg-black text-white" 
                      : "bg-gray-200 text-gray-500"
                )}>
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > step.number ? "bg-emerald-500" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employees
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-3 border-b bg-gray-50 flex items-center gap-3">
                <Checkbox 
                  checked={employees.every(e => e.selected)}
                  onCheckedChange={toggleAllEmployees}
                  data-testid="checkbox-select-all"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedEmployees.length} of {employees.length} selected
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-6 py-3 w-12"></th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr 
                      key={employee.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleEmployee(employee.id)}
                      data-testid={`row-employee-${employee.id}`}
                    >
                      <td className="px-6 py-4">
                        <Checkbox 
                          checked={employee.selected}
                          onCheckedChange={() => toggleEmployee(employee.id)}
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`checkbox-employee-${employee.id}`}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{employee.firstName} {employee.lastName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{employee.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={employee.type === "Hourly" ? "text-blue-600 border-blue-200" : "text-purple-600 border-purple-200"}>
                          {employee.type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {hoursEntryMode === "select" && (
              <div className="grid grid-cols-3 gap-6">
{autoImportEnabled ? (
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => { setHoursEntryMode("auto"); handleAutoImport(); }}
                  data-testid="card-auto-import"
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Zap className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Auto Import</h3>
                    <p className="text-sm text-muted-foreground">
                      Import hours directly from Toast POS integration
                    </p>
                  </CardContent>
                </Card>
                ) : (
                <Card 
                  className="cursor-not-allowed opacity-60"
                  data-testid="card-auto-import"
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Zap className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-500">Auto Import</h3>
                    <p className="text-sm text-muted-foreground">
                      Import hours directly from Toast POS integration
                    </p>
                    <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                      Complete POS & Payroll mappings on the Payroll Home page to enable
                    </div>
                  </CardContent>
                </Card>
                )}
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setHoursEntryMode("import")}
                  data-testid="card-import-template"
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Import with Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV or Excel file with employee hours data
                    </p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setHoursEntryMode("manual")}
                  data-testid="card-enter-manually"
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <Edit3 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Enter Manually</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter hours for each employee directly in the form
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {hoursEntryMode === "auto" && autoImportLoading && (
              <Card>
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Importing from Toast...</h3>
                  <p className="text-sm text-muted-foreground">
                    Fetching employee hours from your Toast POS integration
                  </p>
                </CardContent>
              </Card>
            )}

            {hoursEntryMode === "import" && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Import from CSV/Excel
                    </CardTitle>
                    <Button variant="outline" onClick={() => setHoursEntryMode("select")} data-testid="button-back-to-select">
                      Change Method
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">File Format Requirements</h4>
                    <p className="text-sm text-blue-700">
                      The file must contain employee_id, hours, and overtime_hours columns. Download the template for the correct format.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Required Columns</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">employee_id</Badge>
                      <Badge variant="outline">hours</Badge>
                      <Badge variant="outline">overtime_hours</Badge>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-1">Drag and drop your CSV or Excel file</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <Button variant="outline" data-testid="button-browse-file">
                      Browse Files
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" data-testid="button-download-template">
                      <Download className="h-4 w-4 mr-2" /> Download Template
                    </Button>
                    <Button 
                      onClick={() => setHoursEntryMode("manual")} 
                      variant="ghost"
                      data-testid="button-skip-import"
                    >
                      Skip & Enter Manually
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {hoursEntryMode === "manual" && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Employee Hours
                    </CardTitle>
                    <Button variant="outline" onClick={() => setHoursEntryMode("select")} data-testid="button-change-method">
                      Change Method
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Regular</th>
                        <th className="px-6 py-3 font-medium">Overtime</th>
                        <th className="px-6 py-3 font-medium">Spread of hours</th>
                        <th className="px-6 py-3 font-medium text-right">Est. Gross Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b" data-testid={`row-hours-${employee.id}`}>
                          <td className="px-6 py-4">
                            <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                            <div className="text-sm text-muted-foreground">{employee.role}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={employee.type === "Hourly" ? "text-blue-600 border-blue-200" : "text-purple-600 border-purple-200"}>
                              {employee.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {employee.type === "Hourly" ? (
                              <Input 
                                type="number" 
                                value={employee.regularHours}
                                onChange={(e) => updateHours(employee.id, "regularHours", parseFloat(e.target.value) || 0)}
                                className="w-20"
                                data-testid={`input-regular-hours-${employee.id}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {employee.type === "Hourly" ? (
                              <Input 
                                type="number" 
                                value={employee.overtimeHours}
                                onChange={(e) => updateHours(employee.id, "overtimeHours", parseFloat(e.target.value) || 0)}
                                className="w-20"
                                data-testid={`input-overtime-hours-${employee.id}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {employee.type === "Hourly" ? (
                              <Input 
                                type="number" 
                                value={employee.spreadOfHours}
                                onChange={(e) => updateHours(employee.id, "spreadOfHours", parseFloat(e.target.value) || 0)}
                                className="w-20"
                                data-testid={`input-spread-hours-${employee.id}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            ${calculatePay(employee).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review Employee Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-6 py-3 font-medium w-8"></th>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Regular</th>
                    <th className="px-6 py-3 font-medium">Overtime</th>
                    <th className="px-6 py-3 font-medium">Spread of Hours</th>
                    <th className="px-6 py-3 font-medium text-right">Gross Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmployees.map((employee) => {
                    const employeeEarnings = earnings[employee.id] || [];
                    const isExpanded = expandedEmployee === employee.id;
                    const basePay = employee.type === "Salary" 
                      ? 2500 
                      : (employee.regularHours * (employee.hourlyRate || 0)) + (employee.overtimeHours * (employee.hourlyRate || 0) * 1.5) + (employee.spreadOfHours * (employee.hourlyRate || 0));
                    
                    return (
                      <React.Fragment key={employee.id}>
                        <tr 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setExpandedEmployee(isExpanded ? null : employee.id)}
                          data-testid={`row-review-${employee.id}`}
                        >
                          <td className="px-6 py-4">
                            <span className={cn("transition-transform inline-block", isExpanded && "rotate-90")}>›</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                            <div className="text-sm text-muted-foreground">{employee.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            {employee.type === "Hourly" ? (
                              <Input 
                                type="number" 
                                value={employee.regularHours}
                                onChange={(e) => { e.stopPropagation(); updateHours(employee.id, "regularHours", parseFloat(e.target.value) || 0); }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 h-8"
                                data-testid={`input-review-regular-${employee.id}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {employee.type === "Hourly" ? (
                              <Input 
                                type="number" 
                                value={employee.overtimeHours}
                                onChange={(e) => { e.stopPropagation(); updateHours(employee.id, "overtimeHours", parseFloat(e.target.value) || 0); }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 h-8"
                                data-testid={`input-review-overtime-${employee.id}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {employee.type === "Hourly" ? (
                              <Input 
                                type="number" 
                                value={employee.spreadOfHours}
                                onChange={(e) => { e.stopPropagation(); updateHours(employee.id, "spreadOfHours", parseFloat(e.target.value) || 0); }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 h-8"
                                data-testid={`input-review-spread-${employee.id}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            ${calculatePay(employee).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Earnings Breakdown</div>
                                
                                {employee.type === "Hourly" && (
                                  <>
                                    <div className="flex items-center gap-3 py-2 border-b">
                                      <span className="font-medium w-32">Regular</span>
                                      <div className="flex items-center gap-1">
                                        <Input 
                                          type="number"
                                          value={employee.regularHours}
                                          onChange={(e) => updateHours(employee.id, "regularHours", parseFloat(e.target.value) || 0)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-16 h-8"
                                          data-testid={`input-breakdown-regular-${employee.id}`}
                                        />
                                        <span className="text-muted-foreground text-sm">hrs × ${employee.hourlyRate}/hr</span>
                                      </div>
                                      <span className="ml-auto font-medium">${(employee.regularHours * (employee.hourlyRate || 0)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-2 border-b">
                                      <span className="font-medium w-32">Overtime</span>
                                      <div className="flex items-center gap-1">
                                        <Input 
                                          type="number"
                                          value={employee.overtimeHours}
                                          onChange={(e) => updateHours(employee.id, "overtimeHours", parseFloat(e.target.value) || 0)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-16 h-8"
                                          data-testid={`input-breakdown-overtime-${employee.id}`}
                                        />
                                        <span className="text-muted-foreground text-sm">hrs × ${((employee.hourlyRate || 0) * 1.5).toFixed(2)}/hr</span>
                                      </div>
                                      <span className="ml-auto font-medium">${(employee.overtimeHours * (employee.hourlyRate || 0) * 1.5).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-2 border-b">
                                      <span className="font-medium w-32">Spread of Hours</span>
                                      <div className="flex items-center gap-1">
                                        <Input 
                                          type="number"
                                          value={employee.spreadOfHours}
                                          onChange={(e) => updateHours(employee.id, "spreadOfHours", parseFloat(e.target.value) || 0)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-16 h-8"
                                          data-testid={`input-breakdown-spread-${employee.id}`}
                                        />
                                        <span className="text-muted-foreground text-sm">hrs × ${employee.hourlyRate}/hr</span>
                                      </div>
                                      <span className="ml-auto font-medium">${(employee.spreadOfHours * (employee.hourlyRate || 0)).toFixed(2)}</span>
                                    </div>
                                  </>
                                )}

                                {employeeEarnings.map((earning) => (
                                  <div key={earning.id} className="flex items-center gap-3 py-2 border-b">
                                    <Select 
                                      value={earning.type} 
                                      onValueChange={(val) => updateEarning(employee.id, earning.id, "type", val)}
                                    >
                                      <SelectTrigger className="w-[130px] h-8" data-testid={`select-earning-type-${earning.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Bonus">Bonus</SelectItem>
                                        <SelectItem value="Tip Out">Tip Out</SelectItem>
                                        <SelectItem value="Upsell Credit">Upsell Credit</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input 
                                      value={earning.description}
                                      onChange={(e) => updateEarning(employee.id, earning.id, "description", e.target.value)}
                                      placeholder="Description"
                                      className="flex-1 h-8"
                                      data-testid={`input-earning-desc-${earning.id}`}
                                    />
                                    <div className="flex items-center">
                                      <span className="text-muted-foreground mr-1">$</span>
                                      <Input 
                                        type="number"
                                        value={earning.amount}
                                        onChange={(e) => updateEarning(employee.id, earning.id, "amount", parseFloat(e.target.value) || 0)}
                                        className="w-24 h-8"
                                        data-testid={`input-earning-amount-${earning.id}`}
                                      />
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500 hover:text-red-700"
                                      onClick={(e) => { e.stopPropagation(); removeEarning(employee.id, earning.id); }}
                                      data-testid={`button-remove-earning-${earning.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}

                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => { e.stopPropagation(); addEarning(employee.id); }}
                                  data-testid={`button-add-earning-${employee.id}`}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add Earning
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (() => {
          const totalDeductions = calculateDeductions(totalGrossPay);
          const employeeCount = selectedEmployees.length;
          const totalTaxDeductions = totalDeductions.federalTax + totalDeductions.stateTax + totalDeductions.socialSecurity + totalDeductions.medicare;
          const totalBenefitDeductions = (totalDeductions.health + totalDeductions.dental + totalDeductions.vision) * employeeCount + totalDeductions.retirement401k;
          const totalDeductionsAmount = totalTaxDeductions + totalBenefitDeductions;
          return (
          <div className="space-y-6">
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Approval Deadline</div>
                    <div className="text-xl font-bold">Jan 13, 2026</div>
                    <div className="text-sm text-muted-foreground">8:00 PM</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Gross Pay</div>
                    <div className="text-xl font-bold">${totalGrossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Deductions</div>
                    <div className="text-xl font-bold">${totalDeductionsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Net Pay</div>
                    <div className="text-2xl font-bold text-emerald-600">${(totalGrossPay - totalDeductionsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Employee Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="px-6 py-3 font-medium w-8"></th>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Gross Pay</th>
                      <th className="px-6 py-3 font-medium text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployees.map((employee) => {
                      const employeeEarnings = earnings[employee.id] || [];
                      const grossPay = calculatePay(employee);
                      const deductions = calculateDeductions(grossPay);
                      const totalBenefits = deductions.health + deductions.dental + deductions.vision + deductions.retirement401k;
                      const totalEmployeeDeductions = deductions.federalTax + deductions.stateTax + deductions.socialSecurity + deductions.medicare + totalBenefits;
                      const netPay = grossPay - totalEmployeeDeductions;
                      const issues = getEmployeeIssues(employee, grossPay, netPay);
                      const hasIssues = issues.length > 0;
                      const isExpanded = expandedConfirmEmployee === employee.id;
                      
                      return (
                        <React.Fragment key={employee.id}>
                          <tr 
                            className={cn(
                              "border-b cursor-pointer hover:bg-gray-50",
                              hasIssues && "bg-amber-50 hover:bg-amber-100"
                            )}
                            onClick={() => setExpandedConfirmEmployee(isExpanded ? null : employee.id)}
                            data-testid={`row-confirm-${employee.id}`}
                          >
                            <td className="px-6 py-4">
                              <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {hasIssues && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                                <div>
                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                  <div className="text-sm text-muted-foreground">{employee.type}</div>
                                </div>
                              </div>
                              {hasIssues && (
                                <div className="mt-1">
                                  {issues.map((issue, i) => (
                                    <Badge key={i} variant="outline" className="text-xs mr-1 bg-amber-100 text-amber-700 border-amber-300">
                                      {issue}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium">${grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 text-right font-medium text-emerald-600">${netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                          {isExpanded && (
                            <tr className={cn("bg-gray-50", hasIssues && "bg-amber-50/50")}>
                              <td colSpan={4} className="px-6 py-4">
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-muted-foreground mb-3">Earnings</div>
                                  
                                  {employee.type === "Hourly" && (
                                    <>
                                      <div className="flex items-center justify-between text-sm py-1">
                                        <span>Regular ({employee.regularHours} hrs × ${employee.hourlyRate}/hr)</span>
                                        <span>${(employee.regularHours * (employee.hourlyRate || 0)).toFixed(2)}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm py-1">
                                        <span>Overtime ({employee.overtimeHours} hrs × ${((employee.hourlyRate || 0) * 1.5).toFixed(2)}/hr)</span>
                                        <span>${(employee.overtimeHours * (employee.hourlyRate || 0) * 1.5).toFixed(2)}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm py-1">
                                        <span>Spread of Hours ({employee.spreadOfHours} hrs × ${employee.hourlyRate}/hr)</span>
                                        <span>${(employee.spreadOfHours * (employee.hourlyRate || 0)).toFixed(2)}</span>
                                      </div>
                                    </>
                                  )}

                                  {employee.type === "Salary" && (
                                    <div className="flex items-center justify-between text-sm py-1">
                                      <span>Salary (per period)</span>
                                      <span>$2,500.00</span>
                                    </div>
                                  )}

                                  {employeeEarnings.map((earning) => (
                                    <div key={earning.id} className="flex items-center justify-between text-sm py-1">
                                      <span>{earning.type}{earning.description && ` - ${earning.description}`}</span>
                                      <span>${earning.amount.toFixed(2)}</span>
                                    </div>
                                  ))}

                                  <div className="flex items-center justify-between text-sm py-2 font-semibold border-t mt-2">
                                    <span>Gross Pay</span>
                                    <span>${grossPay.toFixed(2)}</span>
                                  </div>

                                  <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">Deductions</div>
                                  
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Federal Tax</span>
                                      <span className="text-red-600">-${deductions.federalTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Health</span>
                                      <span className="text-red-600">-${deductions.health.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>State Tax</span>
                                      <span className="text-red-600">-${deductions.stateTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Dental</span>
                                      <span className="text-red-600">-${deductions.dental.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Social Security</span>
                                      <span className="text-red-600">-${deductions.socialSecurity.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Vision</span>
                                      <span className="text-red-600">-${deductions.vision.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Medicare</span>
                                      <span className="text-red-600">-${deductions.medicare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>401(k)</span>
                                      <span className="text-red-600">-${deductions.retirement401k.toFixed(2)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-sm py-2 font-semibold border-t mt-3 text-emerald-700">
                                    <span>Net Pay</span>
                                    <span>${netPay.toFixed(2)}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-emerald-900">Ready to submit</div>
                  <div className="text-sm text-emerald-700">
                    Payday: {payday} • {selectedEmployees.length} employees will be paid
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          );
        })()}
        </>
        )}
      </div>
    </Layout>
  );
}
