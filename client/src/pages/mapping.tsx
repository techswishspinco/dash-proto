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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Link2Off,
  MapPin,
  Filter,
  ChevronRight,
  ExternalLink,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface Employee {
  id: string;
  posName: string;
  posId: string;
  payrollName?: string;
  payrollId?: string;
  location: string;
  status: "mapped" | "unmapped" | "pending";
  lastSync: string;
}

const mockEmployees: Employee[] = [
  { id: "1", posName: "Sarah Johnson", posId: "POS-1234", payrollName: "Sarah M. Johnson", payrollId: "PAY-5678", location: "Downtown Seattle", status: "mapped", lastSync: "2026-01-09T08:30:00" },
  { id: "2", posName: "Michael Chen", posId: "POS-1235", payrollName: "Michael Chen", payrollId: "PAY-5679", location: "Downtown Seattle", status: "mapped", lastSync: "2026-01-09T08:30:00" },
  { id: "3", posName: "Emily Rodriguez", posId: "POS-1236", location: "Capitol Hill", status: "unmapped", lastSync: "2026-01-09T08:30:00" },
  { id: "4", posName: "James Wilson", posId: "POS-1237", location: "Capitol Hill", status: "unmapped", lastSync: "2026-01-09T08:30:00" },
  { id: "5", posName: "Ashley Thompson", posId: "POS-1238", location: "Ballard", status: "unmapped", lastSync: "2026-01-09T08:30:00" },
  { id: "6", posName: "David Kim", posId: "POS-1239", payrollName: "David Kim", payrollId: "PAY-5680", location: "Downtown Seattle", status: "mapped", lastSync: "2026-01-09T08:30:00" },
  { id: "7", posName: "Jessica Lee", posId: "POS-1240", location: "Ballard", status: "pending", lastSync: "2026-01-09T08:30:00" },
  { id: "8", posName: "Robert Brown", posId: "POS-1241", location: "Ballard", status: "unmapped", lastSync: "2026-01-09T08:30:00" },
  { id: "9", posName: "Amanda Martinez", posId: "POS-1242", payrollName: "Amanda Martinez", payrollId: "PAY-5681", location: "Capitol Hill", status: "mapped", lastSync: "2026-01-09T08:30:00" },
  { id: "10", posName: "Chris Taylor", posId: "POS-1243", location: "Ballard", status: "unmapped", lastSync: "2026-01-09T08:30:00" },
];

const relatedTasks = [
  { id: "6", title: "Map 5 employees at Ballard location", priority: "medium" },
];

export default function Mapping() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showMapDialog, setShowMapDialog] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    if (searchQuery && !emp.posName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (locationFilter !== "all" && emp.location !== locationFilter) return false;
    if (statusFilter !== "all" && emp.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: employees.length,
    mapped: employees.filter((e) => e.status === "mapped").length,
    unmapped: employees.filter((e) => e.status === "unmapped").length,
    pending: employees.filter((e) => e.status === "pending").length,
  };

  const locations = Array.from(new Set(employees.map((e) => e.location)));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.filter((e) => e.status === "unmapped").map((e) => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, id]);
    } else {
      setSelectedEmployees(selectedEmployees.filter((eid) => eid !== id));
    }
  };

  const handleBulkMap = () => {
    setEmployees((prev) =>
      prev.map((emp) =>
        selectedEmployees.includes(emp.id) ? { ...emp, status: "pending" as const } : emp
      )
    );
    setSelectedEmployees([]);
    setShowMapDialog(false);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Employee Mapping</h1>
            <p className="text-muted-foreground mt-1">
              Link POS employees to payroll records
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </Button>
        </div>

        {relatedTasks.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-foreground">Related Task: {relatedTasks[0].title}</p>
                  <p className="text-sm text-muted-foreground">Complete mapping to resolve this task</p>
                </div>
              </div>
              <Link href="/work-queue">
                <Button variant="outline" size="sm" className="gap-2">
                  View Task <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.mapped}</p>
                <p className="text-sm text-muted-foreground">Mapped</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Link2Off className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.unmapped}</p>
                <p className="text-sm text-muted-foreground">Unmapped</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-sm p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-employees"
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-location-filter">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="mapped">Mapped</SelectItem>
                  <SelectItem value="unmapped">Unmapped</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedEmployees.length > 0 && (
              <Button onClick={() => setShowMapDialog(true)} data-testid="button-bulk-map">
                Map {selectedEmployees.length} Selected
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEmployees.length > 0 && selectedEmployees.length === filteredEmployees.filter((e) => e.status === "unmapped").length}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead>POS Employee</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Payroll Record</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} data-testid={`row-employee-${emp.id}`}>
                  <TableCell>
                    {emp.status === "unmapped" && (
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(emp.id, !!checked)}
                        data-testid={`checkbox-employee-${emp.id}`}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-gray-100">
                          {emp.posName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.posName}</p>
                        <p className="text-xs text-muted-foreground">{emp.posId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {emp.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emp.payrollName ? (
                      <div>
                        <p className="font-medium">{emp.payrollName}</p>
                        <p className="text-xs text-muted-foreground">{emp.payrollId}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        emp.status === "mapped" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        emp.status === "unmapped" && "bg-red-50 text-red-700 border-red-200",
                        emp.status === "pending" && "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}
                    >
                      {emp.status === "mapped" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {emp.status === "unmapped" && <Link2Off className="h-3 w-3 mr-1" />}
                      {emp.status === "pending" && <RefreshCw className="h-3 w-3 mr-1" />}
                      {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {emp.status === "unmapped" && (
                      <Button variant="outline" size="sm" data-testid={`button-map-${emp.id}`}>
                        <Link2 className="h-4 w-4 mr-1" />
                        Map
                      </Button>
                    )}
                    {emp.status === "mapped" && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map Selected Employees</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            You are about to create payroll records for {selectedEmployees.length} employees.
            They will be marked as pending until the next sync completes.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkMap} data-testid="button-confirm-map">
              Create Payroll Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
