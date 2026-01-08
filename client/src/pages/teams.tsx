import React, { useState } from "react";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";

export default function Teams() {
  const [activeTab, setActiveTab] = useState<"departments" | "staff">("departments");

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        <div className="bg-white border-b border-border sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="font-serif text-2xl font-medium" data-testid="text-chain-name">KOQ LLC</h1>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full" data-testid="text-date">Jan 8, 2026</span>
              </div>
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
        </div>

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {activeTab === "departments" && (
            <div className="space-y-6" data-testid="content-departments">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Departments</h2>
                <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors" data-testid="button-add-department">
                  Add Department
                </button>
              </div>

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
            <div className="space-y-6" data-testid="content-staff">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Staff</h2>
                <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors" data-testid="button-add-staff">
                  Add Staff Member
                </button>
              </div>

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
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
