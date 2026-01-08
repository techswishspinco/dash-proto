import React, { useState } from "react";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Sparkles,
  Zap,
  UserPlus,
  Building2
} from "lucide-react";

function ActionButton({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "outline" | "ghost" }) {
  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    outline: "border border-border bg-white hover:bg-gray-50 text-foreground",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-gray-50",
  };
  
  return (
    <button className={cn("px-4 py-2 text-sm font-medium transition-colors font-sans", variants[variant])}>
      {children}
    </button>
  );
}

export default function Teams() {
  const [activeTab, setActiveTab] = useState<"departments" | "staff">("departments");

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-8 max-w-7xl mx-auto space-y-12 w-full">
          
          {/* Top Navigation Context */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-6">
              <span className="font-serif text-2xl font-medium" data-testid="text-chain-name">KOQ LLC</span>
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full" data-testid="text-date">Jan 8, 2026</span>
            </div>
            
            <nav className="flex gap-1" data-testid="teams-tabs">
              <button
                onClick={() => setActiveTab("departments")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === "departments"
                    ? "bg-black text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                )}
                data-testid="tab-departments"
              >
                Departments
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === "staff"
                    ? "bg-black text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                )}
                data-testid="tab-staff"
              >
                Staff
              </button>
            </nav>
          </div>

          {/* Hero / AI Overview */}
          <div className="bg-gray-50 border border-border relative overflow-hidden min-h-[180px] p-8">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Users size={200} />
            </div>

            <div className="flex items-start gap-4 mb-2 relative z-10 w-full">
              <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-medium">Team Overview</h2>
                </div>

                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  {activeTab === "departments" ? (
                    <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight mb-8">
                      You have <span className="bg-emerald-50 text-emerald-700 px-1 border border-emerald-100 rounded">4 active departments</span> with <span className="bg-sky-50 text-sky-700 px-1 border border-sky-100 rounded">27 team members</span> across all locations.
                    </h1>
                  ) : (
                    <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight mb-8">
                      <span className="bg-emerald-50 text-emerald-700 px-1 border border-emerald-100 rounded">26 active staff</span> members, <span className="bg-amber-50 text-amber-700 px-1 border border-amber-100 rounded">1 on leave</span>. Kitchen is your largest department.
                    </h1>
                  )}
                  
                  <div className="flex gap-3">
                    {activeTab === "departments" ? (
                      <ActionButton>Add Department</ActionButton>
                    ) : (
                      <ActionButton>Add Staff Member</ActionButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on tab */}
          {activeTab === "departments" && (
            <div data-testid="content-departments">
              <h3 className="font-serif text-lg font-medium mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> All Departments
              </h3>
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Department</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Roles</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Members</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-department-kitchen">
                      <td className="px-6 py-4 font-medium">Kitchen</td>
                      <td className="px-6 py-4 text-muted-foreground">Line Cook, Prep Cook, Head Chef</td>
                      <td className="px-6 py-4">8</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-department-foh">
                      <td className="px-6 py-4 font-medium">Front of House</td>
                      <td className="px-6 py-4 text-muted-foreground">Server, Host, Busser</td>
                      <td className="px-6 py-4">12</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-department-bar">
                      <td className="px-6 py-4 font-medium">Bar</td>
                      <td className="px-6 py-4 text-muted-foreground">Bartender, Barback</td>
                      <td className="px-6 py-4">4</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-department-management">
                      <td className="px-6 py-4 font-medium">Management</td>
                      <td className="px-6 py-4 text-muted-foreground">GM, Assistant Manager</td>
                      <td className="px-6 py-4">3</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div data-testid="content-staff">
              <h3 className="font-serif text-lg font-medium mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> All Staff
              </h3>
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Name</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Role</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Department</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-staff-1">
                      <td className="px-6 py-4 font-medium">Sarah Chen</td>
                      <td className="px-6 py-4 text-muted-foreground">Head Chef</td>
                      <td className="px-6 py-4">Kitchen</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-staff-2">
                      <td className="px-6 py-4 font-medium">Marcus Johnson</td>
                      <td className="px-6 py-4 text-muted-foreground">GM</td>
                      <td className="px-6 py-4">Management</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-staff-3">
                      <td className="px-6 py-4 font-medium">Emily Rodriguez</td>
                      <td className="px-6 py-4 text-muted-foreground">Server</td>
                      <td className="px-6 py-4">Front of House</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-staff-4">
                      <td className="px-6 py-4 font-medium">David Kim</td>
                      <td className="px-6 py-4 text-muted-foreground">Bartender</td>
                      <td className="px-6 py-4">Bar</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">On Leave</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-staff-5">
                      <td className="px-6 py-4 font-medium">Lisa Park</td>
                      <td className="px-6 py-4 text-muted-foreground">Host</td>
                      <td className="px-6 py-4">Front of House</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" data-testid="row-staff-6">
                      <td className="px-6 py-4 font-medium">James Wilson</td>
                      <td className="px-6 py-4 text-muted-foreground">Line Cook</td>
                      <td className="px-6 py-4">Kitchen</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Sticky Footer / Impact Bar */}
        <div className="sticky bottom-0 bg-black text-white py-4 px-8 flex justify-between items-center z-30 mt-auto">
          <div className="flex gap-8 text-sm">
            <div>
              <span className="text-gray-400 mr-2">Total Staff:</span>
              <span className="font-mono">27</span>
            </div>
            <div>
              <span className="text-gray-400 mr-2">Departments:</span>
              <span className="font-mono">4</span>
            </div>
            <div>
              <span className="text-gray-400 mr-2">Active Today:</span>
              <span className="font-mono text-emerald-400">18</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
