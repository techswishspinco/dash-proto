import React, { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  Download,
  FileText,
  Filter,
  Search,
  Users,
  AlertCircle,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReminderSection {
  id: string;
  title: string;
  items: string[];
}

interface CompanyDocument {
  id: string;
  filedOn: string;
  documentType: string;
  documentName: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  primaryLocation: string;
  employment: string;
  onboardStatus: "complete" | "pending" | "incomplete";
  residentialLocation: string;
}

const reminderSections: ReminderSection[] = [
  {
    id: "team-info",
    title: "Review and update your team's information",
    items: [
      "Ask your employees and contractors to review and update their information including SSNs, legal names, addresses and electronic consent.",
      "Double check your team roster includes everyone you've paid this year, including any terminated employees or contractors."
    ]
  },
  {
    id: "outside-payrolls",
    title: "Input payrolls run outside of Munch Insights",
    items: [
      "Did you migrate to Munch Insights payroll this year? If so, double check all historical payrolls from your previous provider were properly loaded.",
      "Be sure to report any payrolls run outside of Munch Insights. This might include contractor payments or irregular payrolls like bonuses or commissions.",
      "Pay date determines tax year. If a payroll's pay period is in 2026 but it's paid in 2027, it won't be included in your 2026 tax filings."
    ]
  },
  {
    id: "benefit-data",
    title: "Review and report missing benefit data",
    items: [
      "Review vacation hours, including used and unused time.",
      "Report disability benefits, if applicable.",
      "You may need to report group term life insurance exceeding $50,000 or medical benefits for 2% S-Corp shareholders if you do not track this on a per payroll basis."
    ]
  }
];

const companyDocuments: CompanyDocument[] = [
  { id: "1", filedOn: "Jan 5, 2026", documentType: "Tax Return", documentName: "Q4 2025 Federal 941" },
  { id: "2", filedOn: "Jan 5, 2026", documentType: "Tax Return", documentName: "Q4 2025 CA DE 9" },
  { id: "3", filedOn: "Oct 5, 2025", documentType: "Tax Return", documentName: "Q3 2025 Federal 941" },
  { id: "4", filedOn: "Jul 5, 2025", documentType: "Tax Return", documentName: "Q2 2025 Federal 941" },
];

const employees: Employee[] = [
  { id: "1", name: "John Smith", email: "john@example.com", employeeId: "EMP-001", primaryLocation: "SF Downtown", employment: "Employed", onboardStatus: "complete", residentialLocation: "San Francisco, CA" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", employeeId: "EMP-002", primaryLocation: "SF Downtown", employment: "Employed", onboardStatus: "complete", residentialLocation: "Oakland, CA" },
  { id: "3", name: "Mike Davis", email: "mike@example.com", employeeId: "EMP-003", primaryLocation: "Oakland", employment: "Employed", onboardStatus: "pending", residentialLocation: "Berkeley, CA" },
  { id: "4", name: "Emily Chen", email: "emily@example.com", employeeId: "EMP-004", primaryLocation: "SF Downtown", employment: "Employed", onboardStatus: "complete", residentialLocation: "San Francisco, CA" },
  { id: "5", name: "Robert Wilson", email: "robert@example.com", employeeId: "EMP-005", primaryLocation: "Oakland", employment: "Not Employed", onboardStatus: "incomplete", residentialLocation: "Alameda, CA" },
];

const onboardStatusColors = {
  complete: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  incomplete: "bg-red-100 text-red-700",
};

const entities = [
  { id: "koq-llc", name: "KOQ Restaurant Group LLC" },
  { id: "koq-sf", name: "KOQ SF Inc." },
];

interface TaxInfoItem {
  id: string;
  label: string;
  value: string;
  isComplete: boolean;
}

interface TaxInfoSection {
  id: string;
  title: string;
  completedCount: number;
  totalCount: number;
  items: TaxInfoItem[];
}

const federalTaxInfo: TaxInfoSection = {
  id: "federal",
  title: "Federal",
  completedCount: 3,
  totalCount: 3,
  items: [
    { id: "fein", label: "Federal Employer Identification Number (FEIN)", value: "53-1111111", isComplete: true },
    { id: "nonprofit", label: "Is your organization categorized as a 501(c)(3) non-profit entity by the IRS, and if so, what type?", value: "My organization is not a non-profit", isComplete: true },
    { id: "agricultural", label: "Is your organization recognized as an agricultural employer by the IRS?", value: "My organization IS NOT an agricultural employer", isComplete: true },
  ]
};

const stateTaxInfo: TaxInfoSection = {
  id: "texas",
  title: "Texas",
  completedCount: 2,
  totalCount: 2,
  items: [
    { id: "unemployment-id", label: "Texas Employer Unemployment Employer Identification Number", value: "14-555555-5", isComplete: true },
    { id: "unemployment-rate", label: "Texas Employer Unemployment Tax Rate", value: "3.7% - Effective since 01/01/1900", isComplete: true },
  ]
};

export default function PayrollTaxCenter() {
  const [selectedCompanyDocs, setSelectedCompanyDocs] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [companyDocSearch, setCompanyDocSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [employeeYearFilter, setEmployeeYearFilter] = useState("all");
  const [showEmployeeDrawer, setShowEmployeeDrawer] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEntity, setSelectedEntity] = useState("koq-llc");
  const [expandedFederal, setExpandedFederal] = useState(false);
  const [expandedState, setExpandedState] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState<string[]>([]);

  const handleCompanyDocSelect = (docId: string) => {
    setSelectedCompanyDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDrawer(true);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  const toggleReminder = (id: string) => {
    setExpandedReminders(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const filteredCompanyDocs = companyDocuments.filter(doc => 
    doc.documentName.toLowerCase().includes(companyDocSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const currentEntity = entities.find(e => e.id === selectedEntity);

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-6">
            <span className="font-serif text-2xl font-medium" data-testid="text-location-title">{currentEntity?.name || "Select Location"}</span>
            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full" data-testid="text-date">Today, Jan 8</span>
          </div>
          
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="border-0 bg-transparent p-0 h-auto gap-0 hover:text-foreground transition-colors focus:ring-0 focus:ring-offset-0 [&>svg]:hidden" data-testid="select-entity">
                <span>Locations <span className="text-[10px]">▼</span></span>
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
            <Card>
              <CardHeader>
                <CardTitle>Legal Entity Documents</CardTitle>
                <CardDescription>Download tax documents and filings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Filter by document name..." 
                      className="pl-10"
                      value={companyDocSearch}
                      onChange={(e) => setCompanyDocSearch(e.target.value)}
                      data-testid="input-company-doc-search"
                    />
                  </div>
                  <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-doc-type">
                      <SelectValue placeholder="Document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="tax-return">Tax Return</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="select-year">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    disabled={selectedCompanyDocs.length === 0}
                    data-testid="button-download-company-docs"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download ({selectedCompanyDocs.length})
                  </Button>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 w-10">
                        <Checkbox 
                          checked={selectedCompanyDocs.length === filteredCompanyDocs.length && filteredCompanyDocs.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCompanyDocs(filteredCompanyDocs.map(d => d.id));
                            } else {
                              setSelectedCompanyDocs([]);
                            }
                          }}
                          data-testid="checkbox-select-all-docs"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Filed On</th>
                      <th className="px-4 py-3 font-medium">Document Type</th>
                      <th className="px-4 py-3 font-medium">Document</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanyDocs.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50" data-testid={`row-doc-${doc.id}`}>
                        <td className="px-4 py-3">
                          <Checkbox 
                            checked={selectedCompanyDocs.includes(doc.id)}
                            onCheckedChange={() => handleCompanyDocSelect(doc.id)}
                            data-testid={`checkbox-doc-${doc.id}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{doc.filedOn}</td>
                        <td className="px-4 py-3">{doc.documentType}</td>
                        <td className="px-4 py-3 font-medium">{doc.documentName}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" data-testid={`button-download-doc-${doc.id}`}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Tax Documents</CardTitle>
                <CardDescription>Manage and download employee tax forms.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by employee..." 
                      className="pl-10"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      data-testid="input-employee-search"
                    />
                  </div>
                  <Select value={employeeYearFilter} onValueChange={setEmployeeYearFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="select-employee-year">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    disabled={selectedEmployees.length === 0}
                    data-testid="button-download-employee-docs"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download Tax Documents ({selectedEmployees.length})
                  </Button>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 w-10">
                        <Checkbox 
                          checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees(filteredEmployees.map(e => e.id));
                            } else {
                              setSelectedEmployees([]);
                            }
                          }}
                          data-testid="checkbox-select-all-employees"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Employee Name</th>
                      <th className="px-4 py-3 font-medium">Primary Location</th>
                      <th className="px-4 py-3 font-medium">Employment</th>
                      <th className="px-4 py-3 font-medium">Onboard Status</th>
                      <th className="px-4 py-3 font-medium">Residential</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEmployeeClick(emp)}
                        data-testid={`row-employee-${emp.id}`}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedEmployees.includes(emp.id)}
                            onCheckedChange={() => handleEmployeeSelect(emp.id)}
                            data-testid={`checkbox-employee-${emp.id}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-sm text-muted-foreground">{emp.email}</div>
                        </td>
                        <td className="px-4 py-3">{emp.primaryLocation}</td>
                        <td className="px-4 py-3">{emp.employment}</td>
                        <td className="px-4 py-3">
                          <Badge className={cn("font-normal capitalize", onboardStatusColors[emp.onboardStatus])}>
                            {emp.onboardStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{emp.residentialLocation}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" data-testid={`button-download-emp-${emp.id}`}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="w-80 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Reminders</CardTitle>
                <CardDescription className="text-sm">
                  Take the following steps to ensure your W-2s, 1099s and legal entity tax returns reflect accurate data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reminderSections.map((section) => (
                  <div key={section.id} className="border rounded-lg">
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleReminder(section.id)}
                      data-testid={`button-expand-reminder-${section.id}`}
                    >
                      <span className="font-medium text-sm">{section.title}</span>
                      {expandedReminders.includes(section.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {expandedReminders.includes(section.id) && (
                      <div className="border-t px-3 pb-3">
                        <ul className="list-disc pl-4 pt-2 space-y-1 text-xs text-muted-foreground">
                          {section.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Legal Entity Tax Information</CardTitle>
                <CardDescription className="text-sm">Federal and state tax setup.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedFederal(!expandedFederal)}
                    data-testid="button-expand-federal"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-sm">{federalTaxInfo.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {federalTaxInfo.completedCount}/{federalTaxInfo.totalCount}
                      </span>
                    </div>
                    {expandedFederal ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {expandedFederal && (
                    <div className="border-t px-3 pb-3 space-y-3">
                      {federalTaxInfo.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 pt-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs">{item.label}</div>
                            <div className="text-xs text-blue-600 truncate">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedState(!expandedState)}
                    data-testid="button-expand-state"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-sm">{stateTaxInfo.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {stateTaxInfo.completedCount}/{stateTaxInfo.totalCount}
                      </span>
                    </div>
                    {expandedState ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {expandedState && (
                    <div className="border-t px-3 pb-3 space-y-3">
                      {stateTaxInfo.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 pt-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs">{item.label}</div>
                            <div className="text-xs text-blue-600 truncate">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Sheet open={showEmployeeDrawer} onOpenChange={setShowEmployeeDrawer}>
          <SheetContent className="w-[500px] sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Employee Tax Documents</SheetTitle>
              <SheetDescription>
                {selectedEmployee?.name} ({selectedEmployee?.employeeId})
              </SheetDescription>
            </SheetHeader>
            {selectedEmployee && (
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">2025 Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">W-2</div>
                          <div className="text-sm text-muted-foreground">Wage and Tax Statement</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-download-w2">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Pay Stubs</div>
                          <div className="text-sm text-muted-foreground">All pay stubs for 2025</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-download-paystubs">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">2024 Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">W-2</div>
                          <div className="text-sm text-muted-foreground">Wage and Tax Statement</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-download-w2-2024">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full" data-testid="button-download-all-employee-docs">
                  <Download className="h-4 w-4 mr-2" /> Download All Documents
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
