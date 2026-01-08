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
import { Plus, ChevronRight } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface JobRole {
  id: string;
  name: string;
  departmentId: string;
  baseRate: number;
  selected: boolean;
}

interface Staff {
  id: string;
  name: string;
  initials: string;
}

const initialDepartments: Department[] = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Product" },
];

const initialJobRoles: JobRole[] = [
  { id: "1", name: "Senior Developer", departmentId: "1", baseRate: 85, selected: true },
  { id: "2", name: "Product Manager", departmentId: "2", baseRate: 75, selected: false },
  { id: "3", name: "QA Engineer", departmentId: "1", baseRate: 65, selected: true },
];

const initialStaff: Staff[] = [
  { id: "1", name: "Alice Johnson", initials: "A" },
  { id: "2", name: "Bob Smith", initials: "B" },
  { id: "3", name: "Charlie Davis", initials: "C" },
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
    "3": [],
  });

  const [showAddDepartmentSheet, setShowAddDepartmentSheet] = useState(false);
  const [showAddJobSheet, setShowAddJobSheet] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newJobName, setNewJobName] = useState("");
  const [newJobDepartment, setNewJobDepartment] = useState("");
  const [newJobRate, setNewJobRate] = useState("");

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
        selected: false
      }]);
      setAssignedStaff(prev => ({ ...prev, [newId]: [] }));
      setNewJobName("");
      setNewJobDepartment("");
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
                  {departments.map((dept, index) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 text-left transition-colors",
                        selectedDepartment === dept.id
                          ? "bg-muted"
                          : "hover:bg-gray-50",
                        index !== departments.length - 1 && "border-b"
                      )}
                      data-testid={`button-department-${dept.id}`}
                    >
                      <span className="font-medium">{dept.name}</span>
                      {selectedDepartment === dept.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jobs</span>
                  </div>
                  {filteredJobs.map((job, index) => (
                    <label
                      key={job.id}
                      className={cn(
                        "flex items-center gap-3 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors",
                        index !== filteredJobs.length - 1 && "border-b"
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
                  {filteredJobs.length === 0 && (
                    <div className="px-6 py-4 text-sm text-muted-foreground">
                      No job roles in this department
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
                  {jobRoles.map((job, index) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 text-left transition-colors",
                        selectedJob === job.id
                          ? "bg-muted"
                          : "hover:bg-gray-50",
                        index !== jobRoles.length - 1 && "border-b"
                      )}
                      data-testid={`button-select-job-${job.id}`}
                    >
                      <div>
                        <div className="font-medium text-sm">{job.name}</div>
                        <div className="text-xs mt-0.5 text-muted-foreground">
                          BASE: ${job.baseRate}/HR
                        </div>
                      </div>
                      {selectedJob === job.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Personnel</span>
                  </div>
                  {staff.map((person, index) => {
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
                          "flex items-center gap-3 px-6 py-4 transition-colors",
                          assignedElsewhere ? "opacity-50" : "hover:bg-gray-50",
                          index !== staff.length - 1 && "border-b"
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
              Create a new department to organize your team
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                placeholder="e.g., Marketing"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                data-testid="input-department-name"
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
              Create a new job role and assign it to a department
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-name">Job Title</Label>
              <Input
                id="job-name"
                placeholder="e.g., Software Engineer"
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
              <Label htmlFor="job-rate">Base Hourly Rate ($)</Label>
              <Input
                id="job-rate"
                type="number"
                placeholder="e.g., 50"
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
