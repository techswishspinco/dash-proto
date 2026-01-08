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
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full" data-testid="text-date">Today, Jan 8</span>
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

        </div>
      </div>
    </Layout>
  );
}
