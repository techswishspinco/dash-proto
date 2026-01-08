import React, { useState } from "react";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [departments] = useState<Department[]>(initialDepartments);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(initialJobRoles);
  const [staff] = useState<Staff[]>(initialStaff);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("1");
  const [selectedJob, setSelectedJob] = useState<string>("1");
  const [assignedStaff, setAssignedStaff] = useState<Record<string, string[]>>({
    "1": ["1"],
    "2": [],
    "3": [],
  });

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

  const toggleStaffAssignment = (staffId: string) => {
    setAssignedStaff((prev) => {
      const current = prev[selectedJob] || [];
      if (current.includes(staffId)) {
        return { ...prev, [selectedJob]: current.filter((id) => id !== staffId) };
      } else {
        return { ...prev, [selectedJob]: [...current, staffId] };
      }
    });
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-6">
            <span className="font-serif text-2xl font-medium" data-testid="text-page-title">Team</span>
          </div>
        </div>

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
                  data-testid="button-add-department"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
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
                  {departments.map((dept, index) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 text-left transition-colors",
                        selectedDepartment === dept.id
                          ? "bg-foreground text-background"
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
              <CardTitle className="text-lg">Staff Assignment</CardTitle>
              <CardDescription>Link employees to job roles</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 border-t">
                <div className="border-r">
                  <div className="px-6 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Job</span>
                  </div>
                  {jobRoles.map((job, index) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 text-left transition-colors",
                        selectedJob === job.id
                          ? "bg-foreground text-background"
                          : "hover:bg-gray-50",
                        index !== jobRoles.length - 1 && "border-b"
                      )}
                      data-testid={`button-select-job-${job.id}`}
                    >
                      <div>
                        <div className="font-medium text-sm">{job.name}</div>
                        <div className={cn(
                          "text-xs mt-0.5",
                          selectedJob === job.id ? "text-gray-400" : "text-muted-foreground"
                        )}>
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
                    return (
                      <div
                        key={person.id}
                        className={cn(
                          "flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors",
                          index !== staff.length - 1 && "border-b"
                        )}
                        data-testid={`staff-row-${person.id}`}
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => toggleStaffAssignment(person.id)}
                          data-testid={`checkbox-staff-${person.id}`}
                        />
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                          isAssigned ? "bg-foreground" : "bg-gray-400"
                        )}>
                          {person.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{person.name}</div>
                          {isAssigned && (
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground uppercase">Assigned</span>
                              <button 
                                className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                                data-testid={`button-view-rates-${person.id}`}
                              >
                                View Earning Rates →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
