import React, { useState } from "react";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";

export default function Teams() {
  const [activeTab, setActiveTab] = useState<"departments" | "staff">("departments");

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-8 max-w-7xl mx-auto space-y-12 w-full">
          
          {/* Top Navigation Context */}
          <div className="flex items-center justify-between border-b border-border pb-4">
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

          {/* Tab Content */}
          {activeTab === "departments" && (
            <div className="border border-border rounded-lg min-h-[400px] flex flex-col items-center justify-center py-16 bg-[#fafafa]" data-testid="content-departments">
              <h2 className="font-serif text-2xl font-medium text-foreground mb-3">Departments</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                This module is currently under development. Check back soon for updates.
              </p>
              <span className="px-4 py-1.5 text-sm text-muted-foreground border border-border rounded-full">
                Status: Development Preview
              </span>
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
      </div>
    </Layout>
  );
}
