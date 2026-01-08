import React, { useState } from "react";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronRight, Search } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface JobRole {
  id: string;
  name: string;
  departmentId: string;
  baseRate: number;
  payType: "hourly" | "salaried";
  selected: boolean;
}

interface Staff {
  id: string;
  name: string;
  initials: string;
}

const initialDepartments: Department[] = [
  { id: "1", name: "Front of House" },
  { id: "2", name: "Back of House" },
  { id: "3", name: "Bar" },
  { id: "4", name: "Management" },
  { id: "5", name: "Catering" },
  { id: "6", name: "Events" },
  { id: "7", name: "Maintenance" },
];

const initialJobRoles: JobRole[] = [
  { id: "1", name: "Server", departmentId: "1", baseRate: 18, payType: "hourly", selected: true },
  { id: "2", name: "Host", departmentId: "1", baseRate: 16, payType: "hourly", selected: false },
  { id: "3", name: "Busser", departmentId: "1", baseRate: 15, payType: "hourly", selected: true },
  { id: "4", name: "Food Runner", departmentId: "1", baseRate: 15, payType: "hourly", selected: false },
  { id: "5", name: "Line Cook", departmentId: "2", baseRate: 20, payType: "hourly", selected: true },
  { id: "6", name: "Prep Cook", departmentId: "2", baseRate: 17, payType: "hourly", selected: false },
  { id: "7", name: "Dishwasher", departmentId: "2", baseRate: 15, payType: "hourly", selected: true },
  { id: "8", name: "Sous Chef", departmentId: "2", baseRate: 28, payType: "hourly", selected: false },
  { id: "9", name: "Bartender", departmentId: "3", baseRate: 20, payType: "hourly", selected: true },
  { id: "10", name: "Barback", departmentId: "3", baseRate: 16, payType: "hourly", selected: false },
  { id: "11", name: "General Manager", departmentId: "4", baseRate: 75000, payType: "salaried", selected: true },
  { id: "12", name: "Assistant Manager", departmentId: "4", baseRate: 55000, payType: "salaried", selected: false },
];

const initialStaff: Staff[] = [
  { id: "1", name: "Alice Johnson", initials: "AJ" },
  { id: "2", name: "Bob Smith", initials: "BS" },
  { id: "3", name: "Charlie Davis", initials: "CD" },
  { id: "4", name: "Diana Martinez", initials: "DM" },
  { id: "5", name: "Eric Thompson", initials: "ET" },
  { id: "6", name: "Fiona Garcia", initials: "FG" },
  { id: "7", name: "George Wilson", initials: "GW" },
  { id: "8", name: "Hannah Brown", initials: "HB" },
];

export default function Teams() {
  const [activeTab, setActiveTab] = useState<"departments" | "staff">("departments");
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(initialJobRoles);
  const [staff] = useState<Staff[]>(initialStaff);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("1");
  const [selectedJob, setSelectedJob] = useState<string>("1");
  const [assignedStaff, setAssignedStaff] = useState<Record<string, string[]>>({
    "1": ["1"],
    "2": [],
    "3": ["3"],
    "4": [],
    "5": ["5"],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
    "11": [],
    "12": [],
  });

  const [showAddDepartmentSheet, setShowAddDepartmentSheet] = useState(false);
  const [showAddJobSheet, setShowAddJobSheet] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentWageExpense, setNewDepartmentWageExpense] = useState("");
  const [newJobName, setNewJobName] = useState("");
  const [newJobDepartment, setNewJobDepartment] = useState("");
  const [newJobRate, setNewJobRate] = useState("");
  const [newJobPayType, setNewJobPayType] = useState("hourly");
  const [jobSearch, setJobSearch] = useState("");
  const [personnelSearch, setPersonnelSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [deptJobSearch, setDeptJobSearch] = useState("");

  const filteredJobs = jobRoles.filter(
    (job) => job.departmentId === selectedDepartment
  );

  const assignedToSelectedJob = assignedStaff[selectedJob] || [];

  const toggleJobSelection = (jobId: string) => {
    setJobRoles((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, selected: !job.selected } : job
      )
    );
  };

  const isStaffAssignedElsewhere = (staffId: string) => {
    return Object.entries(assignedStaff).some(
      ([jobId, staffIds]) => jobId !== selectedJob && staffIds.includes(staffId)
    );
  };

  const toggleStaffAssignment = (staffId: string) => {
    if (isStaffAssignedElsewhere(staffId)) {
      return;
    }
    setAssignedStaff((prev) => {
      const current = prev[selectedJob] || [];
      if (current.includes(staffId)) {
        return { ...prev, [selectedJob]: current.filter((id) => id !== staffId) };
      } else {
        return { ...prev, [selectedJob]: [...current, staffId] };
      }
    });
  };

  const handleAddDepartment = () => {
    if (newDepartmentName.trim()) {
      const newId = (departments.length + 1).toString();
      setDepartments([...departments, { id: newId, name: newDepartmentName.trim() }]);
      setNewDepartmentName("");
      setNewDepartmentWageExpense("");
      setShowAddDepartmentSheet(false);
    }
  };

  const handleAddJobRole = () => {
    if (newJobName.trim() && newJobDepartment && newJobRate) {
      const newId = (jobRoles.length + 1).toString();
      setJobRoles([...jobRoles, {
        id: newId,
        name: newJobName.trim(),
        departmentId: newJobDepartment,
        baseRate: parseFloat(newJobRate),
        payType: newJobPayType as "hourly" | "salaried",
        selected: false
      }]);
      setAssignedStaff(prev => ({ ...prev, [newId]: [] }));
      setNewJobName("");
      setNewJobDepartment("");
      setNewJobPayType("hourly");
      setNewJobRate("");
      setShowAddJobSheet(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-6">
            <span className="font-serif text-2xl font-medium" data-testid="text-page-title">Team</span>
          </div>
          
          <div className="flex gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab("departments")}
              className={cn(
                "pb-1 transition-colors",
                activeTab === "departments"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="tab-departments"
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={cn(
                "pb-1 transition-colors",
                activeTab === "staff"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="tab-staff"
            >
              Staff
            </button>
          </div>
        </div>

        {activeTab === "departments" && (
        <div className="space-y-6">
          <Card data-testid="card-departments-jobs">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg">Departments & Jobs</CardTitle>
                <CardDescription>Manage units and role assignments</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowAddDepartmentSheet(true)}
                  data-testid="button-add-department"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowAddJobSheet(true)}
                  data-testid="button-add-job-role"
                >
                  <Plus className="h-4 w-4" />
                  Add Job Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 border-t">
                <div className="border-r">
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departments</span>
                  </div>
                  <div className="px-3 py-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search departments..."
                        value={deptSearch}
                        onChange={(e) => setDeptSearch(e.target.value)}
                        className="h-8 pl-7 text-xs"
                        data-testid="input-search-departments"
                      />
                    </div>
                  </div>
                  {departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase())).slice(0, 5).map((dept, index, arr) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-3 h-14 text-left transition-colors",
                        selectedDepartment === dept.id
                          ? "bg-muted"
                          : "hover:bg-gray-50",
                        index !== arr.length - 1 && "border-b"
                      )}
                      data-testid={`button-department-${dept.id}`}
                    >
                      <span className="font-medium text-sm">{dept.name}</span>
                      {selectedDepartment === dept.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                  {departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase())).length > 5 && (
                    <div className="px-6 py-2 text-xs text-muted-foreground text-center border-t">
                      +{departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase())).length - 5} more
                    </div>
                  )}
                </div>

                <div>
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jobs</span>
                  </div>
                  <div className="px-3 py-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs..."
                        value={deptJobSearch}
                        onChange={(e) => setDeptJobSearch(e.target.value)}
                        className="h-8 pl-7 text-xs"
                        data-testid="input-search-dept-jobs"
                      />
                    </div>
                  </div>
                  {filteredJobs.filter(j => j.name.toLowerCase().includes(deptJobSearch.toLowerCase())).slice(0, 5).map((job, index, arr) => (
                    <label
                      key={job.id}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 h-14 hover:bg-gray-50 cursor-pointer transition-colors",
                        index !== arr.length - 1 && "border-b"
                      )}
                      data-testid={`label-job-${job.id}`}
                    >
                      <Checkbox
                        checked={job.selected}
                        onCheckedChange={() => toggleJobSelection(job.id)}
                        data-testid={`checkbox-job-${job.id}`}
                      />
                      <span className="text-sm font-medium">{job.name}</span>
                    </label>
                  ))}
                  {filteredJobs.filter(j => j.name.toLowerCase().includes(deptJobSearch.toLowerCase())).length === 0 && (
                    <div className="px-6 py-4 text-sm text-muted-foreground">
                      No job roles found
                    </div>
                  )}
                  {filteredJobs.filter(j => j.name.toLowerCase().includes(deptJobSearch.toLowerCase())).length > 5 && (
                    <div className="px-6 py-2 text-xs text-muted-foreground text-center border-t">
                      +{filteredJobs.filter(j => j.name.toLowerCase().includes(deptJobSearch.toLowerCase())).length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-staff-assignment">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Job Assignment</CardTitle>
              <CardDescription>Link employees to job roles</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 border-t">
                <div className="border-r">
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jobs</span>
                  </div>
                  <div className="px-3 py-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs..."
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        className="h-8 pl-7 text-xs"
                        data-testid="input-search-jobs"
                      />
                    </div>
                  </div>
                  {jobRoles.filter(job => job.name.toLowerCase().includes(jobSearch.toLowerCase())).slice(0, 5).map((job, index, arr) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-3 h-14 text-left transition-colors",
                        selectedJob === job.id
                          ? "bg-muted"
                          : "hover:bg-gray-50",
                        index !== arr.length - 1 && "border-b"
                      )}
                      data-testid={`button-select-job-${job.id}`}
                    >
                      <div>
                        <div className="font-medium text-sm">{job.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.payType === "salaried" ? `$${job.baseRate.toLocaleString()}/YR` : `$${job.baseRate}/HR`}
                        </div>
                      </div>
                      {selectedJob === job.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                  {jobRoles.filter(job => job.name.toLowerCase().includes(jobSearch.toLowerCase())).length > 5 && (
                    <div className="px-6 py-2 text-xs text-muted-foreground text-center border-t">
                      +{jobRoles.filter(job => job.name.toLowerCase().includes(jobSearch.toLowerCase())).length - 5} more
                    </div>
                  )}
                </div>

                <div>
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Staff</span>
                  </div>
                  <div className="px-3 py-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search staff..."
                        value={personnelSearch}
                        onChange={(e) => setPersonnelSearch(e.target.value)}
                        className="h-8 pl-7 text-xs"
                        data-testid="input-search-personnel"
                      />
                    </div>
                  </div>
                  {staff.filter(person => person.name.toLowerCase().includes(personnelSearch.toLowerCase())).slice(0, 5).map((person, index, arr) => {
                    const isAssigned = assignedToSelectedJob.includes(person.id);
                    const assignedElsewhere = isStaffAssignedElsewhere(person.id);
                    const assignedToJobId = Object.entries(assignedStaff).find(
                      ([_, staffIds]) => staffIds.includes(person.id)
                    )?.[0];
                    const assignedToJob = assignedToJobId ? jobRoles.find(j => j.id === assignedToJobId) : null;
                    
                    return (
                      <div
                        key={person.id}
                        className={cn(
                          "flex items-center gap-3 px-6 py-3 h-14 transition-colors",
                          assignedElsewhere ? "opacity-50" : "hover:bg-gray-50",
                          index !== arr.length - 1 && "border-b"
                        )}
                        data-testid={`staff-row-${person.id}`}
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => toggleStaffAssignment(person.id)}
                          disabled={assignedElsewhere}
                          data-testid={`checkbox-staff-${person.id}`}
                        />
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gray-400">
                          {person.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{person.name}</div>
                          <div className="h-5 flex items-center justify-between gap-2">
                            {isAssigned ? (
                              <>
                                <span className="text-xs text-muted-foreground uppercase">Assigned</span>
                                <button 
                                  className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                                  data-testid={`button-view-rates-${person.id}`}
                                >
                                  View Earning Rates →
                                </button>
                              </>
                            ) : assignedElsewhere ? (
                              <span className="text-xs text-muted-foreground">Assigned to {assignedToJob?.name}</span>
                            ) : (
                              <span className="text-xs text-transparent">Placeholder</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {staff.filter(person => person.name.toLowerCase().includes(personnelSearch.toLowerCase())).length > 5 && (
                    <div className="px-6 py-2 text-xs text-muted-foreground text-center border-t">
                      +{staff.filter(person => person.name.toLowerCase().includes(personnelSearch.toLowerCase())).length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {activeTab === "staff" && (
          <div className="border border-border rounded-lg min-h-[400px] flex flex-col items-center justify-center py-16 bg-[#fafafa]" data-testid="content-staff">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-3">Staff</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              This module is currently under development. Check back soon for updates.
            </p>
            <span className="px-4 py-1.5 text-sm text-muted-foreground border border-border rounded-full">
              Status: Development Preview
            </span>
          </div>
        )}
      </div>

      <Sheet open={showAddDepartmentSheet} onOpenChange={setShowAddDepartmentSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Department</SheetTitle>
            <SheetDescription>
              Create a new department to organize your team and map to accounting
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                placeholder="e.g., Front of House"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                data-testid="input-department-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-wage-expense">Wage Expense Account</Label>
              <Input
                id="department-wage-expense"
                placeholder="e.g., 6000 - Wages Expense"
                value={newDepartmentWageExpense}
                onChange={(e) => setNewDepartmentWageExpense(e.target.value)}
                data-testid="input-department-wage-expense"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowAddDepartmentSheet(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment} disabled={!newDepartmentName.trim()} data-testid="button-save-department">
              Add Department
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={showAddJobSheet} onOpenChange={setShowAddJobSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Job Role</SheetTitle>
            <SheetDescription>
              Create a new job role with pay rates and payroll mappings
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-name">Job Title</Label>
              <Input
                id="job-name"
                placeholder="e.g., Server, Line Cook"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                data-testid="input-job-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-department">Department</Label>
              <Select value={newJobDepartment} onValueChange={setNewJobDepartment}>
                <SelectTrigger data-testid="select-job-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pay Type</Label>
              <Select value={newJobPayType} onValueChange={setNewJobPayType}>
                <SelectTrigger data-testid="select-job-pay-type">
                  <SelectValue placeholder="Select pay type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-rate">{newJobPayType === "salaried" ? "Annual Salary ($)" : "Base Hourly Rate ($)"}</Label>
              <Input
                id="job-rate"
                type="number"
                placeholder={newJobPayType === "salaried" ? "e.g., 65000" : "e.g., 18.00"}
                value={newJobRate}
                onChange={(e) => setNewJobRate(e.target.value)}
                data-testid="input-job-rate"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowAddJobSheet(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddJobRole} 
              disabled={!newJobName.trim() || !newJobDepartment || !newJobRate}
              data-testid="button-save-job"
            >
              Add Job Role
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
