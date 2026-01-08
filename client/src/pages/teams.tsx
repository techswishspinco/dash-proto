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
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Departments & Jobs</CardTitle>
              <CardDescription>Manage units and role assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  className="gap-2 border-dashed"
                  data-testid="button-add-department"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-dashed"
                  data-testid="button-add-job-role"
                >
                  <Plus className="h-4 w-4" />
                  Add Job Role
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all",
                        selectedDepartment === dept.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-foreground hover:bg-gray-100"
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

                <div className="space-y-2">
                  {filteredJobs.map((job) => (
                    <label
                      key={job.id}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
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
                  {jobRoles
                    .filter((job) => job.departmentId !== selectedDepartment)
                    .map((job) => (
                      <label
                        key={job.id}
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        data-testid={`label-job-other-${job.id}`}
                      >
                        <Checkbox
                          checked={job.selected}
                          onCheckedChange={() => toggleJobSelection(job.id)}
                          data-testid={`checkbox-job-other-${job.id}`}
                        />
                        <span className="text-sm font-medium">{job.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-staff-assignment">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Staff Assignment</CardTitle>
              <CardDescription>Link employees to job roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Select Job</div>
                  <div className="space-y-2">
                    {jobRoles.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all",
                          selectedJob === job.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 text-foreground hover:bg-gray-100"
                        )}
                        data-testid={`button-select-job-${job.id}`}
                      >
                        <div>
                          <div className="font-medium text-sm">{job.name}</div>
                          <div className={cn(
                            "text-xs mt-0.5",
                            selectedJob === job.id ? "text-blue-100" : "text-muted-foreground"
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
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Available Personnel</div>
                  <div className="space-y-2">
                    {staff.map((person) => {
                      const isAssigned = assignedToSelectedJob.includes(person.id);
                      return (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          data-testid={`staff-row-${person.id}`}
                        >
                          <Checkbox
                            checked={isAssigned}
                            onCheckedChange={() => toggleStaffAssignment(person.id)}
                            data-testid={`checkbox-staff-${person.id}`}
                          />
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                            isAssigned ? "bg-blue-600" : "bg-gray-400"
                          )}>
                            {person.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{person.name}</div>
                            {isAssigned && (
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground uppercase">Assigned</span>
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
