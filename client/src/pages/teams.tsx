import React, { useState } from "react";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight, Search, UserPlus, Mail, Phone, MapPin, Briefcase, Shield, Link2, AlertCircle, Check, X, Edit2, UserX, ChevronLeft } from "lucide-react";

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

interface JobAssignment {
  locationId: string;
  jobRoleId: string;
}

interface Staff {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  role: "admin" | "manager" | "employee";
  jobAssignments: JobAssignment[];
  posEmployeeIds: string[];
  payrollEmployeeIds: string[];
  startDate: string;
  avatarColor: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

interface POSEmployee {
  id: string;
  name: string;
  email: string;
  posSystem: string;
}

interface PayrollEmployee {
  id: string;
  name: string;
  email: string;
  payrollSystem: string;
}

const initialLocations: Location[] = [
  { id: "1", name: "Downtown", address: "123 Main St, Seattle, WA" },
  { id: "2", name: "Capitol Hill", address: "456 Pine St, Seattle, WA" },
  { id: "3", name: "Ballard", address: "789 Market St, Seattle, WA" },
];

const mockPOSEmployees: POSEmployee[] = [
  { id: "pos-1", name: "Alice J.", email: "alice.j@restaurant.com", posSystem: "Toast" },
  { id: "pos-2", name: "Bob Smith", email: "bob.smith@restaurant.com", posSystem: "Toast" },
  { id: "pos-3", name: "Charlie D.", email: "charlie.d@restaurant.com", posSystem: "Toast" },
  { id: "pos-4", name: "Diana M.", email: "diana.m@restaurant.com", posSystem: "Toast" },
  { id: "pos-5", name: "Eric T.", email: "eric.t@restaurant.com", posSystem: "Toast" },
  { id: "pos-6", name: "F. Garcia", email: "f.garcia@restaurant.com", posSystem: "Toast" },
  { id: "pos-7", name: "G. Wilson", email: "g.wilson@restaurant.com", posSystem: "Toast" },
  { id: "pos-8", name: "Hannah B.", email: "hannah.b@restaurant.com", posSystem: "Toast" },
  { id: "pos-unmatched-1", name: "John Doe (Unmatched)", email: "john.doe@restaurant.com", posSystem: "Toast" },
  { id: "pos-unmatched-2", name: "Jane Smith (Unmatched)", email: "jane.smith@restaurant.com", posSystem: "Toast" },
];

const mockPayrollEmployees: PayrollEmployee[] = [
  { id: "pay-1", name: "Johnson, Alice", email: "alice.johnson@payroll.com", payrollSystem: "Olive Garden Seattle LLC" },
  { id: "pay-2", name: "Smith, Robert", email: "robert.smith@payroll.com", payrollSystem: "Olive Garden Seattle LLC" },
  { id: "pay-3", name: "Davis, Charles", email: "charles.davis@payroll.com", payrollSystem: "Olive Garden Seattle LLC" },
  { id: "pay-4", name: "Martinez, Diana", email: "diana.martinez@payroll.com", payrollSystem: "Capitol Dining Group Inc" },
  { id: "pay-5", name: "Thompson, Eric", email: "eric.thompson@payroll.com", payrollSystem: "Capitol Dining Group Inc" },
  { id: "pay-6", name: "Garcia, Fiona", email: "fiona.garcia@payroll.com", payrollSystem: "Ballard Restaurant Holdings" },
  { id: "pay-7", name: "Wilson, George", email: "george.wilson@payroll.com", payrollSystem: "Ballard Restaurant Holdings" },
  { id: "pay-8", name: "Brown, Hannah", email: "hannah.brown@payroll.com", payrollSystem: "Olive Garden Seattle LLC" },
  { id: "pay-unmatched-1", name: "Williams, Mark (Unmatched)", email: "mark.williams@payroll.com", payrollSystem: "Capitol Dining Group Inc" },
  { id: "pay-unmatched-2", name: "Anderson, Lisa (Unmatched)", email: "lisa.anderson@payroll.com", payrollSystem: "Ballard Restaurant Holdings" },
];

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", 
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500"
];

const initialDepartments: Department[] = [
  { id: "1", name: "Front of House" },
  { id: "2", name: "Back of House" },
  { id: "3", name: "Bar" },
  { id: "4", name: "Management" },
  { id: "5", name: "Catering" },
  { id: "6", name: "Events" },
  { id: "7", name: "Maintenance" },
  { id: "8", name: "Marketing" },
  { id: "9", name: "Finance" },
  { id: "10", name: "Human Resources" },
  { id: "11", name: "Operations" },
  { id: "12", name: "Purchasing" },
  { id: "13", name: "Training" },
  { id: "14", name: "Quality Control" },
  { id: "15", name: "Guest Services" },
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
  { id: "13", name: "Catering Manager", departmentId: "5", baseRate: 60000, payType: "salaried", selected: true },
  { id: "14", name: "Events Coordinator", departmentId: "6", baseRate: 52000, payType: "salaried", selected: false },
  { id: "15", name: "Marketing Director", departmentId: "8", baseRate: 85000, payType: "salaried", selected: true },
];

const initialStaff: Staff[] = [
  { id: "1", name: "Alice Johnson", initials: "AJ", email: "alice@example.com", phone: "(206) 555-0101", status: "active", role: "manager", jobAssignments: [{ locationId: "1", jobRoleId: "1" }, { locationId: "2", jobRoleId: "1" }, { locationId: "2", jobRoleId: "2" }], posEmployeeIds: ["pos-1", "pos-2"], payrollEmployeeIds: ["pay-1", "pay-2"], startDate: "2023-03-15", avatarColor: avatarColors[0] },
  { id: "2", name: "Bob Smith", initials: "BS", email: "bob@example.com", phone: "(206) 555-0102", status: "active", role: "employee", jobAssignments: [{ locationId: "1", jobRoleId: "5" }], posEmployeeIds: ["pos-3"], payrollEmployeeIds: ["pay-3"], startDate: "2023-06-01", avatarColor: avatarColors[1] },
  { id: "3", name: "Charlie Davis", initials: "CD", email: "charlie@example.com", phone: "(206) 555-0103", status: "active", role: "employee", jobAssignments: [{ locationId: "2", jobRoleId: "3" }], posEmployeeIds: ["pos-4", "pos-5", "pos-6"], payrollEmployeeIds: ["pay-4", "pay-5"], startDate: "2023-07-20", avatarColor: avatarColors[2] },
  { id: "4", name: "Diana Martinez", initials: "DM", email: "diana@example.com", phone: "(206) 555-0104", status: "active", role: "employee", jobAssignments: [{ locationId: "3", jobRoleId: "9" }], posEmployeeIds: ["pos-7"], payrollEmployeeIds: ["pay-6"], startDate: "2024-01-10", avatarColor: avatarColors[3] },
  { id: "5", name: "Eric Thompson", initials: "ET", email: "eric@example.com", phone: "(206) 555-0105", status: "active", role: "employee", jobAssignments: [{ locationId: "1", jobRoleId: "5" }, { locationId: "3", jobRoleId: "6" }], posEmployeeIds: ["pos-8"], payrollEmployeeIds: ["pay-7", "pay-8"], startDate: "2022-11-05", avatarColor: avatarColors[4] },
  { id: "6", name: "Fiona Garcia", initials: "FG", email: "fiona@example.com", phone: "(206) 555-0106", status: "active", role: "admin", jobAssignments: [{ locationId: "1", jobRoleId: "11" }, { locationId: "2", jobRoleId: "11" }, { locationId: "3", jobRoleId: "11" }], posEmployeeIds: [], payrollEmployeeIds: [], startDate: "2021-01-15", avatarColor: avatarColors[5] },
  { id: "7", name: "George Wilson", initials: "GW", email: "george@example.com", phone: "(206) 555-0107", status: "inactive", role: "employee", jobAssignments: [{ locationId: "2", jobRoleId: "7" }], posEmployeeIds: [], payrollEmployeeIds: [], startDate: "2023-04-01", avatarColor: avatarColors[6] },
  { id: "8", name: "Hannah Brown", initials: "HB", email: "hannah@example.com", phone: "(206) 555-0108", status: "active", role: "employee", jobAssignments: [{ locationId: "1", jobRoleId: "1" }, { locationId: "1", jobRoleId: "2" }], posEmployeeIds: [], payrollEmployeeIds: [], startDate: "2024-02-01", avatarColor: avatarColors[7] },
];

export default function Teams() {
  const [activeTab, setActiveTab] = useState<"departments" | "staff">("departments");
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(initialJobRoles);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [locations] = useState<Location[]>(initialLocations);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("1");
  const [selectedJob, setSelectedJob] = useState<string>("1");
  const [selectedJobRole, setSelectedJobRole] = useState<string>("1");
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
  const [jobAssignmentLocation, setJobAssignmentLocation] = useState("1"); // Location filter for job assignment card
  
  const [deptScrolledToBottom, setDeptScrolledToBottom] = useState(false);
  const [deptJobScrolledToBottom, setDeptJobScrolledToBottom] = useState(false);
  const [jobScrolledToBottom, setJobScrolledToBottom] = useState(false);
  const [staffScrolledToBottom, setStaffScrolledToBottom] = useState(false);

  // Staff tab state
  const [staffSearch, setStaffSearch] = useState("");
  const [staffStatusFilter, setStaffStatusFilter] = useState<"active" | "inactive">("active");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showStaffDetail, setShowStaffDetail] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [staffDetailTab, setStaffDetailTab] = useState("overview");

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "employee" as "admin" | "manager" | "employee",
    jobAssignments: [] as JobAssignment[],
    selectedLocations: [] as string[],
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    email: "",
    phone: "",
    role: "employee" as "admin" | "manager" | "employee",
    jobAssignments: [] as JobAssignment[],
    selectedLocations: [] as string[],
  });

  // Mapping dialogs
  const [showAddPOSMappingDialog, setShowAddPOSMappingDialog] = useState(false);
  const [showAddPayrollMappingDialog, setShowAddPayrollMappingDialog] = useState(false);
  const [pendingPOSMappings, setPendingPOSMappings] = useState<string[]>([]);
  const [pendingPayrollMappings, setPendingPayrollMappings] = useState<string[]>([]);
  const [posSearchQuery, setPosSearchQuery] = useState("");
  const [payrollSearchQuery, setPayrollSearchQuery] = useState("");

  // Edit job dialog
  const [showEditJobDialog, setShowEditJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRole | null>(null);
  const [editJobForm, setEditJobForm] = useState({
    name: "",
    baseRate: "",
    payType: "hourly" as "hourly" | "salaried",
    departmentId: "",
  });

  const openEditJobDialog = (job: JobRole) => {
    setEditingJob(job);
    setEditJobForm({
      name: job.name,
      baseRate: job.baseRate.toString(),
      payType: job.payType,
      departmentId: job.departmentId,
    });
    setShowEditJobDialog(true);
  };

  const handleSaveJob = () => {
    if (editingJob) {
      setJobRoles(prev => prev.map(job => 
        job.id === editingJob.id 
          ? { ...job, name: editJobForm.name, baseRate: parseFloat(editJobForm.baseRate) || 0, payType: editJobForm.payType, departmentId: editJobForm.departmentId }
          : job
      ));
      setShowEditJobDialog(false);
      setEditingJob(null);
    }
  };


  const handleScroll = (e: React.UIEvent<HTMLDivElement>, setter: (v: boolean) => void) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
    setter(isAtBottom);
  };

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

  // Staff tab handlers
  const filteredStaff = staff.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      person.email.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesStatus = person.status === staffStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const openStaffDetail = (person: Staff) => {
    setSelectedStaff(person);
    setShowStaffDetail(true);
    setStaffDetailTab("overview");
  };

  const openEditDialog = (person: Staff) => {
    const uniqueLocations = Array.from(new Set(person.jobAssignments.map(ja => ja.locationId)));
    setEditForm({
      email: person.email,
      phone: person.phone,
      role: person.role,
      jobAssignments: [...person.jobAssignments],
      selectedLocations: uniqueLocations,
    });
    setSelectedStaff(person);
    setShowEditDialog(true);
  };

  const handleInviteStaff = () => {
    if (inviteForm.firstName && inviteForm.lastName && inviteForm.email) {
      const initials = `${inviteForm.firstName[0]}${inviteForm.lastName[0]}`.toUpperCase();
      const newStaff: Staff = {
        id: (staff.length + 1).toString(),
        name: `${inviteForm.firstName} ${inviteForm.lastName}`,
        initials,
        email: inviteForm.email,
        phone: inviteForm.phone,
        status: "active",
        role: inviteForm.role,
        jobAssignments: inviteForm.jobAssignments,
        posEmployeeIds: [],
        payrollEmployeeIds: [],
        startDate: new Date().toISOString().split('T')[0],
        avatarColor: avatarColors[staff.length % avatarColors.length],
      };
      setStaff([...staff, newStaff]);
      setInviteForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "employee",
        jobAssignments: [],
        selectedLocations: [],
      });
      setShowInviteDialog(false);
    }
  };

  const handleSaveEdit = () => {
    if (selectedStaff) {
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, ...editForm }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, ...editForm });
      setShowEditDialog(false);
    }
  };

  const handleRevokeAccess = () => {
    if (selectedStaff) {
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, status: "inactive" as const }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, status: "inactive" });
      setShowRevokeDialog(false);
    }
  };

  const handleReactivateAccess = () => {
    if (selectedStaff) {
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, status: "active" as const }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, status: "active" });
    }
  };

  const addPOSMapping = (posId: string) => {
    if (selectedStaff && !selectedStaff.posEmployeeIds.includes(posId)) {
      const newPosIds = [...selectedStaff.posEmployeeIds, posId];
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, posEmployeeIds: newPosIds }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, posEmployeeIds: newPosIds });
    }
  };

  const removePOSMapping = (posId: string) => {
    if (selectedStaff) {
      const newPosIds = selectedStaff.posEmployeeIds.filter(id => id !== posId);
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, posEmployeeIds: newPosIds }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, posEmployeeIds: newPosIds });
    }
  };

  const addPayrollMapping = (payrollId: string) => {
    if (selectedStaff && !selectedStaff.payrollEmployeeIds.includes(payrollId)) {
      const newPayrollIds = [...selectedStaff.payrollEmployeeIds, payrollId];
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, payrollEmployeeIds: newPayrollIds }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, payrollEmployeeIds: newPayrollIds });
    }
  };

  const removePayrollMapping = (payrollId: string) => {
    if (selectedStaff) {
      const newPayrollIds = selectedStaff.payrollEmployeeIds.filter(id => id !== payrollId);
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, payrollEmployeeIds: newPayrollIds }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, payrollEmployeeIds: newPayrollIds });
    }
  };

  const confirmAddPOSMapping = () => {
    if (pendingPOSMappings.length > 0 && selectedStaff) {
      const newPosIds = [...selectedStaff.posEmployeeIds, ...pendingPOSMappings.filter(id => !selectedStaff.posEmployeeIds.includes(id))];
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, posEmployeeIds: newPosIds }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, posEmployeeIds: newPosIds });
      setPendingPOSMappings([]);
      setPosSearchQuery("");
      setShowAddPOSMappingDialog(false);
    }
  };

  const confirmAddPayrollMapping = () => {
    if (pendingPayrollMappings.length > 0 && selectedStaff) {
      const newPayrollIds = [...selectedStaff.payrollEmployeeIds, ...pendingPayrollMappings.filter(id => !selectedStaff.payrollEmployeeIds.includes(id))];
      setStaff(staff.map(s => 
        s.id === selectedStaff.id 
          ? { ...s, payrollEmployeeIds: newPayrollIds }
          : s
      ));
      setSelectedStaff({ ...selectedStaff, payrollEmployeeIds: newPayrollIds });
      setPendingPayrollMappings([]);
      setPayrollSearchQuery("");
      setShowAddPayrollMappingDialog(false);
    }
  };

  const togglePOSSelection = (id: string) => {
    setPendingPOSMappings(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const togglePayrollSelection = (id: string) => {
    setPendingPayrollMappings(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getPOSEmployee = (id: string) => {
    return mockPOSEmployees.find(e => e.id === id);
  };

  const getPayrollEmployee = (id: string) => {
    return mockPayrollEmployees.find(e => e.id === id);
  };

  // Calculate unmapped counts
  const allMappedPOSIds = staff.flatMap(s => s.posEmployeeIds);
  const unmappedPOSEmployees = mockPOSEmployees.filter(e => !allMappedPOSIds.includes(e.id));
  const allMappedPayrollIds = staff.flatMap(s => s.payrollEmployeeIds);
  const unmappedPayrollEmployees = mockPayrollEmployees.filter(e => !allMappedPayrollIds.includes(e.id));
  const usersWithoutPayrollMapping = staff.filter(s => s.status !== "inactive" && s.payrollEmployeeIds.length === 0);

  const getJobRoleNames = (assignments: JobAssignment[]) => {
    const uniqueJobIds = Array.from(new Set(assignments.map(a => a.jobRoleId)));
    return uniqueJobIds.map(id => jobRoles.find(j => j.id === id)?.name || "Unknown").join(", ");
  };
  
  const getLocationNames = (assignments: JobAssignment[]) => {
    const uniqueLocIds = Array.from(new Set(assignments.map(a => a.locationId)));
    return uniqueLocIds.map(id => locations.find(l => l.id === id)?.name || "Unknown").join(", ");
  };

  const getStatusBadgeColor = (status: Staff["status"]) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "inactive": return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getRoleBadgeColor = (role: Staff["role"]) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "manager": return "bg-blue-100 text-blue-700 border-blue-200";
      case "employee": return "bg-gray-100 text-gray-600 border-gray-200";
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
          {/* Location Selector & Action Buttons */}
          <div className="flex items-center justify-between">
            <Select value={jobAssignmentLocation} onValueChange={setJobAssignmentLocation}>
              <SelectTrigger className="w-48 bg-white" data-testid="select-location-main">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                className="gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white"
                size="sm"
                onClick={() => setShowAddDepartmentSheet(true)}
                data-testid="button-add-department"
              >
                <Plus className="h-4 w-4" />
                Add Department
              </Button>
              <Button
                className="gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white"
                size="sm"
                onClick={() => setShowAddJobSheet(true)}
                data-testid="button-add-job-role"
              >
                <Plus className="h-4 w-4" />
                Add Job Role
              </Button>
            </div>
          </div>

          {/* Unified 3-Column Layout */}
          <Card data-testid="card-unified-management">
            <CardContent className="p-0">
              <div className="grid grid-cols-12 border-b">
                {/* Column 1: Departments (Chain-wide) - Narrow */}
                <div className="col-span-3 border-r">
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departments</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">Chain-wide</span>
                  </div>
                  <div className="relative border-b h-10 flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="h-full pl-8 text-sm w-full border-0 shadow-none focus-visible:ring-0 rounded-none"
                      data-testid="input-search-departments"
                    />
                  </div>
                  <div className="relative">
                    <div className="max-h-[400px] overflow-y-auto scrollable-list" onScroll={(e) => handleScroll(e, setDeptScrolledToBottom)}>
                      {departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase())).map((dept, index, arr) => (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDepartment(dept.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 h-[48px] text-left transition-colors",
                            selectedDepartment === dept.id
                              ? "bg-muted"
                              : "hover:bg-gray-50",
                            index !== arr.length - 1 && "border-b"
                          )}
                          data-testid={`button-department-${dept.id}`}
                        >
                          <span className="font-medium text-sm truncate">{dept.name}</span>
                          {selectedDepartment === dept.id && (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Jobs */}
                <div className="col-span-4 border-r">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jobs</span>
                  </div>
                  <div className="relative border-b h-10 flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="h-full pl-8 text-sm w-full border-0 shadow-none focus-visible:ring-0 rounded-none"
                      data-testid="input-search-jobs"
                    />
                  </div>
                  <div className="relative">
                    <div className="max-h-[400px] overflow-y-auto scrollable-list" onScroll={(e) => handleScroll(e, setJobScrolledToBottom)}>
                      {filteredJobs.filter(j => j.name.toLowerCase().includes(jobSearch.toLowerCase())).map((job, index, arr) => {
                        const staffAtJob = staff.filter(s => 
                          s.status === "active" && 
                          s.jobAssignments.some(ja => ja.jobRoleId === job.id && ja.locationId === jobAssignmentLocation)
                        ).length;
                        return (
                          <button
                            key={job.id}
                            onClick={() => setSelectedJobRole(job.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 h-[48px] text-left transition-colors group",
                              selectedJobRole === job.id
                                ? "bg-muted"
                                : "hover:bg-gray-50",
                              index !== arr.length - 1 && "border-b"
                            )}
                            data-testid={`button-job-${job.id}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{job.name}</div>
                              <div className="text-xs text-muted-foreground">${job.baseRate}/hr</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {staffAtJob > 0 && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{staffAtJob}</span>
                              )}
                              <Edit2 
                                className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
                                onClick={(e) => { e.stopPropagation(); openEditJobDialog(job); }}
                              />
                              {selectedJobRole === job.id && (
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {filteredJobs.length === 0 && (
                        <div className="px-4 py-8 text-sm text-muted-foreground text-center">
                          No jobs in {departments.find(d => d.id === selectedDepartment)?.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Staff Assignment */}
                <div className="col-span-5">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Staff</span>
                  </div>
                  <div className="relative border-b h-10 flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={personnelSearch}
                      onChange={(e) => setPersonnelSearch(e.target.value)}
                      className="h-full pl-8 text-sm w-full border-0 shadow-none focus-visible:ring-0 rounded-none"
                      data-testid="input-search-staff-assignment"
                    />
                  </div>
                  <div className="relative">
                    <div className="max-h-[400px] overflow-y-auto scrollable-list" onScroll={(e) => handleScroll(e, setStaffScrolledToBottom)}>
                      {staff.filter(s => s.status === "active" && s.name.toLowerCase().includes(personnelSearch.toLowerCase())).map((person, index, arr) => {
                        const isAssignedHere = person.jobAssignments.some(ja => ja.jobRoleId === selectedJobRole && ja.locationId === jobAssignmentLocation);
                        
                        const handleToggleAssignment = () => {
                          setStaff(prev => prev.map(s => {
                            if (s.id !== person.id) return s;
                            if (isAssignedHere) {
                              return { ...s, jobAssignments: s.jobAssignments.filter(ja => !(ja.jobRoleId === selectedJobRole && ja.locationId === jobAssignmentLocation)) };
                            } else {
                              return { ...s, jobAssignments: [...s.jobAssignments, { locationId: jobAssignmentLocation, jobRoleId: selectedJobRole }] };
                            }
                          }));
                        };
                        
                        return (
                          <div
                            key={person.id}
                            className={cn(
                              "flex items-center gap-3 px-4 h-[48px] transition-colors hover:bg-gray-50 cursor-pointer",
                              index !== arr.length - 1 && "border-b"
                            )}
                            onClick={handleToggleAssignment}
                            data-testid={`row-staff-assignment-${person.id}`}
                          >
                            <Checkbox 
                              checked={isAssignedHere}
                              className={cn(isAssignedHere && "bg-emerald-600 border-emerald-600 text-white")}
                              data-testid={`checkbox-assign-${person.id}`}
                            />
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium", person.avatarColor)}>
                              {person.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{person.name}</div>
                              {isAssignedHere && (
                                <div className="text-xs text-emerald-600 font-medium">ASSIGNED</div>
                              )}
                            </div>
                            {isAssignedHere && (
                              <button 
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                                onClick={(e) => { e.stopPropagation(); openStaffDetail(person); }}
                              >
                                Rates <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {activeTab === "staff" && (
          <div className="space-y-6" data-testid="content-staff">
            {/* Header with invite button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name or email..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-staff"
                  />
                </div>
                <Select value={staffStatusFilter} onValueChange={(v) => setStaffStatusFilter(v as typeof staffStatusFilter)}>
                  <SelectTrigger className="w-36" data-testid="select-staff-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowInviteDialog(true)} className="gap-2" data-testid="button-invite-staff">
                <UserPlus className="h-4 w-4" />
                Invite Staff
              </Button>
            </div>

            {/* Staff list */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredStaff.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      No staff members found matching your criteria.
                    </div>
                  ) : (
                    filteredStaff.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => openStaffDetail(person)}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                        data-testid={`button-staff-${person.id}`}
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium", person.avatarColor)}>
                          {person.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{person.name}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", getRoleBadgeColor(person.role))}>
                              {person.role}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {person.email} • {getJobRoleNames(person.jobAssignments) || "No jobs assigned"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {(person.posEmployeeIds.length === 0 || person.payrollEmployeeIds.length === 0) && (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Mapping needed
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
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

      {/* Staff Detail Sheet */}
      <Sheet open={showStaffDetail} onOpenChange={setShowStaffDetail}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedStaff && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-medium", selectedStaff.avatarColor)}>
                    {selectedStaff.initials}
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedStaff.name}</SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", getRoleBadgeColor(selectedStaff.role))}>
                        {selectedStaff.role}
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <Tabs value={staffDetailTab} onValueChange={setStaffDetailTab} className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1" data-testid="tab-staff-overview">Overview</TabsTrigger>
                  <TabsTrigger value="mappings" className="flex-1" data-testid="tab-staff-mappings">Mappings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStaff.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedStaff.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{getJobRoleNames(selectedStaff.jobAssignments) || "No jobs assigned"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getLocationNames(selectedStaff.jobAssignments) || "No locations assigned"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{selectedStaff.role} Access</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Button variant="outline" className="w-full gap-2" onClick={() => openEditDialog(selectedStaff)} data-testid="button-edit-staff">
                      <Edit2 className="h-4 w-4" />
                      Edit Staff Details
                    </Button>
                    {selectedStaff.status !== "inactive" ? (
                      <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setShowRevokeDialog(true)} data-testid="button-revoke-access">
                        <UserX className="h-4 w-4" />
                        Revoke Access
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={handleReactivateAccess} data-testid="button-reactivate-access">
                        <Check className="h-4 w-4" />
                        Reactivate Access
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="mappings" className="mt-4 space-y-6">
                  {/* POS Mapping */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">POS Employee Mappings</Label>
                      {selectedStaff.posEmployeeIds.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <Check className="h-3 w-3" />
                          {selectedStaff.posEmployeeIds.length} linked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          Not mapped
                        </span>
                      )}
                    </div>
                    
                    <div className="border rounded-lg divide-y">
                      {selectedStaff.posEmployeeIds.length > 0 ? (
                        selectedStaff.posEmployeeIds.map((posId) => {
                          const posEmp = getPOSEmployee(posId);
                          return (
                            <div key={posId} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                  <Link2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{posEmp?.name}</span>
                                    <span className="text-xs text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded">{posEmp?.posSystem}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">{posEmp?.email}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => removePOSMapping(posId)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                                data-testid={`button-remove-pos-mapping-${posId}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No POS employees linked
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        setPendingPOSMappings([]);
                        setShowAddPOSMappingDialog(true);
                      }}
                      data-testid="button-add-pos-mapping"
                    >
                      <Plus className="h-4 w-4" />
                      Add POS Mapping
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Link this staff member to their POS employee records for time tracking and sales attribution.
                    </p>
                  </div>

                  {/* Payroll Mapping */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Payroll Employee Mappings</Label>
                      {selectedStaff.payrollEmployeeIds.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <Check className="h-3 w-3" />
                          {selectedStaff.payrollEmployeeIds.length} mapped
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          Not mapped
                        </span>
                      )}
                    </div>
                    
                    <div className="border rounded-lg divide-y">
                      {selectedStaff.payrollEmployeeIds.length > 0 ? (
                        selectedStaff.payrollEmployeeIds.map((payrollId) => {
                          const payrollEmp = getPayrollEmployee(payrollId);
                          return (
                            <div key={payrollId} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                  <Link2 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{payrollEmp?.name}</span>
                                    <span className="text-xs text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded truncate max-w-32">{payrollEmp?.payrollSystem}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">{payrollEmp?.email}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => removePayrollMapping(payrollId)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                                data-testid={`button-remove-payroll-mapping-${payrollId}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No payroll employees linked
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        setPendingPayrollMappings([]);
                        setShowAddPayrollMappingDialog(true);
                      }}
                      data-testid="button-add-payroll-mapping"
                    >
                      <Plus className="h-4 w-4" />
                      Add Payroll Mapping
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Link this staff member to their payroll records across different legal entities.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Staff Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new team member and assign their roles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-first-name">First Name</Label>
                <Input
                  id="invite-first-name"
                  placeholder="John"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  data-testid="input-invite-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-last-name">Last Name</Label>
                <Input
                  id="invite-last-name"
                  placeholder="Doe"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  data-testid="input-invite-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="john@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                data-testid="input-invite-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-phone">Phone (optional)</Label>
              <Input
                id="invite-phone"
                type="tel"
                placeholder="(206) 555-0100"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                data-testid="input-invite-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v as typeof inviteForm.role })}>
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Locations</Label>
              <p className="text-xs text-muted-foreground mb-2">Select locations, then assign job roles</p>
              <div className="grid grid-cols-3 gap-2">
                {locations.map((loc) => {
                  const jobsAtLocation = inviteForm.jobAssignments.filter(ja => ja.locationId === loc.id).length;
                  return (
                    <label key={loc.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border hover:bg-gray-50">
                      <Checkbox
                        checked={inviteForm.selectedLocations.includes(loc.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setInviteForm({ ...inviteForm, selectedLocations: [...inviteForm.selectedLocations, loc.id] });
                          } else {
                            setInviteForm({ 
                              ...inviteForm, 
                              selectedLocations: inviteForm.selectedLocations.filter(l => l !== loc.id),
                              jobAssignments: inviteForm.jobAssignments.filter(ja => ja.locationId !== loc.id)
                            });
                          }
                        }}
                        data-testid={`checkbox-invite-location-${loc.id}`}
                      />
                      <span className="flex-1">{loc.name}</span>
                      {jobsAtLocation > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{jobsAtLocation}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Roles by Location</Label>
              {inviteForm.selectedLocations.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-4 text-center">
                  Select at least one location to assign job roles
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                  {inviteForm.selectedLocations.map((locId) => {
                    const location = locations.find(l => l.id === locId);
                    return (
                      <div key={locId} className="p-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {location?.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {jobRoles.map((job) => {
                            const isAssigned = inviteForm.jobAssignments.some(ja => ja.locationId === locId && ja.jobRoleId === job.id);
                            return (
                              <label key={`${locId}-${job.id}`} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setInviteForm({ 
                                        ...inviteForm, 
                                        jobAssignments: [...inviteForm.jobAssignments, { locationId: locId, jobRoleId: job.id }] 
                                      });
                                    } else {
                                      setInviteForm({ 
                                        ...inviteForm, 
                                        jobAssignments: inviteForm.jobAssignments.filter(ja => !(ja.locationId === locId && ja.jobRoleId === job.id))
                                      });
                                    }
                                  }}
                                  data-testid={`checkbox-invite-job-${locId}-${job.id}`}
                                />
                                <span className="truncate">{job.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteStaff} 
              disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email}
              data-testid="button-send-invite"
            >
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
            <DialogDescription>
              Update information for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as typeof editForm.role })}>
                <SelectTrigger data-testid="select-edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Locations</Label>
              <p className="text-xs text-muted-foreground mb-2">Select locations where this person works</p>
              <div className="grid grid-cols-3 gap-2">
                {locations.map((loc) => {
                  const jobsAtLocation = editForm.jobAssignments.filter(ja => ja.locationId === loc.id).length;
                  return (
                    <label key={loc.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded border hover:bg-gray-50 transition-colors">
                      <Checkbox
                        checked={editForm.selectedLocations.includes(loc.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditForm({ ...editForm, selectedLocations: [...editForm.selectedLocations, loc.id] });
                          } else {
                            setEditForm({ 
                              ...editForm, 
                              selectedLocations: editForm.selectedLocations.filter(l => l !== loc.id),
                              jobAssignments: editForm.jobAssignments.filter(ja => ja.locationId !== loc.id)
                            });
                          }
                        }}
                        data-testid={`checkbox-edit-location-${loc.id}`}
                      />
                      <div className="flex-1">
                        <span>{loc.name}</span>
                      </div>
                      {jobsAtLocation > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{jobsAtLocation}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Roles by Location</Label>
              {editForm.selectedLocations.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-4 text-center">
                  Select at least one location to assign job roles
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto border rounded-lg divide-y">
                  {editForm.selectedLocations.map((locId) => {
                    const location = locations.find(l => l.id === locId);
                    return (
                      <div key={locId} className="p-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {location?.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {jobRoles.map((job) => {
                            const isAssigned = editForm.jobAssignments.some(ja => ja.locationId === locId && ja.jobRoleId === job.id);
                            return (
                              <label key={`${locId}-${job.id}`} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setEditForm({ 
                                        ...editForm, 
                                        jobAssignments: [...editForm.jobAssignments, { locationId: locId, jobRoleId: job.id }] 
                                      });
                                    } else {
                                      setEditForm({ 
                                        ...editForm, 
                                        jobAssignments: editForm.jobAssignments.filter(ja => !(ja.locationId === locId && ja.jobRoleId === job.id))
                                      });
                                    }
                                  }}
                                  data-testid={`checkbox-edit-job-${locId}-${job.id}`}
                                />
                                <span className="truncate">{job.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">{job.payType === "salaried" ? `$${(job.baseRate/1000).toFixed(0)}k` : `$${job.baseRate}/hr`}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} data-testid="button-save-edit">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Access Confirmation */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke access for {selectedStaff?.name}? They will no longer be able to log in or access any systems. This action can be undone by reactivating their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAccess} className="bg-red-600 hover:bg-red-700" data-testid="button-confirm-revoke">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add POS Mapping Dialog */}
      <Dialog open={showAddPOSMappingDialog} onOpenChange={(open) => {
        setShowAddPOSMappingDialog(open);
        if (!open) {
          setPendingPOSMappings([]);
          setPosSearchQuery("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add POS Employee Mapping</DialogTitle>
            <DialogDescription>
              Select POS employees to link to {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={posSearchQuery}
                onChange={(e) => setPosSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-pos-search"
              />
            </div>
            <div className="border rounded-lg max-h-72 overflow-y-auto divide-y">
              {mockPOSEmployees
                .filter(emp => !selectedStaff?.posEmployeeIds.includes(emp.id))
                .filter(emp => 
                  emp.name.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                  emp.email.toLowerCase().includes(posSearchQuery.toLowerCase())
                )
                .map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => togglePOSSelection(emp.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    pendingPOSMappings.includes(emp.id) ? "bg-blue-50" : "hover:bg-gray-50"
                  )}
                  data-testid={`button-select-pos-${emp.id}`}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                    pendingPOSMappings.includes(emp.id) ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  )}>
                    {pendingPOSMappings.includes(emp.id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{emp.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{emp.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{emp.posSystem}</div>
                  </div>
                </button>
              ))}
              {mockPOSEmployees.filter(emp => !selectedStaff?.posEmployeeIds.includes(emp.id)).filter(emp => 
                emp.name.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(posSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {posSearchQuery ? "No matching employees found" : "All POS employees are already mapped"}
                </div>
              )}
            </div>
            {pendingPOSMappings.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {pendingPOSMappings.length} employee{pendingPOSMappings.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPOSMappingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddPOSMapping} disabled={pendingPOSMappings.length === 0} data-testid="button-confirm-pos-mapping">
              Confirm Mapping{pendingPOSMappings.length > 0 ? ` (${pendingPOSMappings.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payroll Mapping Dialog */}
      <Dialog open={showAddPayrollMappingDialog} onOpenChange={(open) => {
        setShowAddPayrollMappingDialog(open);
        if (!open) {
          setPendingPayrollMappings([]);
          setPayrollSearchQuery("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Payroll Employee Mapping</DialogTitle>
            <DialogDescription>
              Select payroll employees to link to {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={payrollSearchQuery}
                onChange={(e) => setPayrollSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-payroll-search"
              />
            </div>
            <div className="border rounded-lg max-h-72 overflow-y-auto divide-y">
              {mockPayrollEmployees
                .filter(emp => !selectedStaff?.payrollEmployeeIds.includes(emp.id))
                .filter(emp => 
                  emp.name.toLowerCase().includes(payrollSearchQuery.toLowerCase()) ||
                  emp.email.toLowerCase().includes(payrollSearchQuery.toLowerCase())
                )
                .map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => togglePayrollSelection(emp.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    pendingPayrollMappings.includes(emp.id) ? "bg-emerald-50" : "hover:bg-gray-50"
                  )}
                  data-testid={`button-select-payroll-${emp.id}`}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                    pendingPayrollMappings.includes(emp.id) ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                  )}>
                    {pendingPayrollMappings.includes(emp.id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{emp.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{emp.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{emp.payrollSystem}</div>
                  </div>
                </button>
              ))}
              {mockPayrollEmployees.filter(emp => !selectedStaff?.payrollEmployeeIds.includes(emp.id)).filter(emp => 
                emp.name.toLowerCase().includes(payrollSearchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(payrollSearchQuery.toLowerCase())
              ).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {payrollSearchQuery ? "No matching employees found" : "All payroll employees are already mapped"}
                </div>
              )}
            </div>
            {pendingPayrollMappings.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {pendingPayrollMappings.length} employee{pendingPayrollMappings.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPayrollMappingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddPayrollMapping} disabled={pendingPayrollMappings.length === 0} data-testid="button-confirm-payroll-mapping">
              Confirm Mapping{pendingPayrollMappings.length > 0 ? ` (${pendingPayrollMappings.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={showEditJobDialog} onOpenChange={setShowEditJobDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Role</DialogTitle>
            <DialogDescription>
              Update the job name and pay rate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-job-name">Job Name</Label>
              <Input
                id="edit-job-name"
                value={editJobForm.name}
                onChange={(e) => setEditJobForm({ ...editJobForm, name: e.target.value })}
                data-testid="input-edit-job-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select 
                value={editJobForm.departmentId} 
                onValueChange={(v) => setEditJobForm({ ...editJobForm, departmentId: v })}
              >
                <SelectTrigger data-testid="select-edit-job-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pay Type</Label>
              <Select 
                value={editJobForm.payType} 
                onValueChange={(v) => setEditJobForm({ ...editJobForm, payType: v as "hourly" | "salaried" })}
              >
                <SelectTrigger data-testid="select-edit-job-pay-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-job-rate">
                {editJobForm.payType === "hourly" ? "Hourly Rate ($)" : "Annual Salary ($)"}
              </Label>
              <Input
                id="edit-job-rate"
                type="number"
                value={editJobForm.baseRate}
                onChange={(e) => setEditJobForm({ ...editJobForm, baseRate: e.target.value })}
                data-testid="input-edit-job-rate"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditJobDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveJob} disabled={!editJobForm.name || !editJobForm.baseRate} data-testid="button-save-job">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
