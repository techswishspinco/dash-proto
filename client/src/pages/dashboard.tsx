import React from "react";
import { 
  Check, 
  ChevronDown, 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Users, 
  Search,
  Bell,
  MoreHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// --- Components ---

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "neutral" | "warning", className?: string }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    neutral: "bg-gray-50 text-gray-600 border border-gray-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
  };
  
  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium tracking-wide uppercase", variants[variant], className)}>
      {children}
    </span>
  );
}

function StatusIndicator({ status }: { status: "verified" | "active" | "found" | "none" }) {
  if (status === "none") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>No hits</span>
        <div className="h-4 w-4 border border-emerald-200 bg-emerald-50 flex items-center justify-center">
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
        </div>
      </div>
    );
  }
  
  const labels = {
    verified: "Verified",
    active: "Active",
    found: "Found"
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
      <span>{labels[status]}</span>
      <div className="h-4 w-4 bg-emerald-100 flex items-center justify-center text-emerald-700">
        <Check className="h-3 w-3" />
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "h-10 flex items-center transition-all duration-300 mb-2 rounded-md mx-2",
      "justify-center group-hover:justify-start group-hover:px-3",
      "w-10 group-hover:w-[calc(100%-1rem)]", 
      active ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
    )}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap overflow-hidden opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 delay-75">
        {label}
      </span>
    </button>
  );
}

// --- Main Page ---

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      {/* Sidebar - Minimalist strip */}
      <aside className="group w-16 hover:w-64 flex-shrink-0 bg-white border-r border-border flex flex-col transition-all duration-500 ease-in-out py-6 sticky top-0 h-screen z-20 shadow-[1px_0_20px_rgba(0,0,0,0)] hover:shadow-[1px_0_40px_rgba(0,0,0,0.05)]">
        <div className="mb-8 flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all duration-300">
          <div className="h-8 w-8 bg-black text-white flex items-center justify-center font-serif font-bold text-lg flex-shrink-0 rounded-sm">
            M
          </div>
          <span className="ml-3 font-serif text-xl font-bold opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-500 delay-100">
            Mosaic
          </span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 w-full">
          <SidebarItem icon={Check} label="Verification" active />
          <SidebarItem icon={ArrowUpRight} label="Analytics" />
          <SidebarItem icon={FileText} label="Reports" />
          <SidebarItem icon={Users} label="Team" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-border sticky top-0 z-10">
           <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <span className="font-serif text-foreground text-lg italic">Restaurant Intelligence</span>
           </div>
           
           <div className="flex items-center gap-6">
             <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</button>
             <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</button>
             <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-xs font-medium">
               JD
             </div>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
          
          {/* Left Column: Insights Summary */}
          <div className="col-span-12 lg:col-span-3 space-y-8">
            <div className="bg-white p-6 border border-border shadow-sm">
              <h2 className="font-serif text-2xl font-medium mb-8">Insights</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">Business name</span>
                  <StatusIndicator status="verified" />
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">Office address</span>
                  <StatusIndicator status="verified" />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">SOS filings</span>
                  <StatusIndicator status="active" />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">TIN match</span>
                  <StatusIndicator status="found" />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">Watchlists</span>
                  <StatusIndicator status="none" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 text-white p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck size={100} />
               </div>
               <h3 className="font-serif text-xl mb-2 relative z-10">Risk Score</h3>
               <div className="text-4xl font-light mb-4 relative z-10">Low</div>
               <p className="text-emerald-200 text-sm relative z-10">
                 This entity shows strong compliance indicators and matched records.
               </p>
            </div>
          </div>

          {/* Right Column: Detailed Data */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* People Card */}
            <div className="bg-white border border-border shadow-sm">
              <div className="p-6 border-b border-border flex items-baseline justify-between">
                <h2 className="font-serif text-xl font-medium">People</h2>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Last updated on 08 Aug</span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-12 gap-4 text-xs text-muted-foreground uppercase tracking-wider mb-4 px-2">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Submitted</div>
                  <div className="col-span-3">Sources</div>
                  <div className="col-span-3">Notes</div>
                </div>
                
                <div className="group relative">
                  <div className="grid grid-cols-12 gap-4 py-4 px-2 items-center hover:bg-secondary/30 transition-colors border-b border-border/50">
                    <div className="col-span-3 font-serif text-lg text-foreground">Michael Richards</div>
                    <div className="col-span-3 text-sm font-mono text-muted-foreground">82-4159401</div>
                    <div className="col-span-3 text-sm">NM · SOS</div>
                    <div className="col-span-3 text-sm">Organizer</div>
                  </div>
                  
                  <div className="pt-4 px-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                      View details <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Watchlists Card */}
            <div className="bg-white border border-border shadow-sm">
              <div className="p-6 border-b border-border flex items-baseline justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-serif text-xl font-medium">Watchlists</h2>
                  <Badge variant="success">No Hits</Badge>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Last updated on 08 Aug</span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-12 gap-4 text-xs text-muted-foreground uppercase tracking-wider mb-4 px-2">
                  <div className="col-span-3">Business names</div>
                  <div className="col-span-3">People</div>
                  <div className="col-span-3">Sources</div>
                  <div className="col-span-3">Screened</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-4 px-2 items-center border-b border-border/50">
                  <div className="col-span-3 font-serif text-lg text-foreground">Paseo Inc.</div>
                  <div className="col-span-3 text-sm font-mono text-muted-foreground">82-4159401</div>
                  <div className="col-span-3 text-sm">NM · SOS</div>
                  <div className="col-span-3 text-sm">Yes</div>
                </div>

                <div className="mt-4 bg-gray-50/50 p-3 flex items-center gap-2 text-sm text-gray-600 border border-border/50">
                   <div className="h-3 w-3 border border-emerald-300 bg-emerald-100 flex items-center justify-center">
                     <div className="h-1 w-1 bg-emerald-600 rounded-full" />
                   </div>
                   No hits found
                </div>
              </div>
            </div>

            {/* Additional Data Section (Mocking more content for realism) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-border shadow-sm p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-serif text-lg">Compliance</h3>
                   <Building2 className="text-muted-foreground h-5 w-5" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                       <span className="text-muted-foreground">Registration Date</span>
                       <span className="font-mono">2021-03-15</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                       <span className="text-muted-foreground">State of Inc.</span>
                       <span>New Mexico (NM)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-2">
                       <span className="text-muted-foreground">Status</span>
                       <span className="text-emerald-700 font-medium">Good Standing</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-border shadow-sm p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-serif text-lg">Alerts</h3>
                   <Bell className="text-muted-foreground h-5 w-5" />
                 </div>
                 <div className="space-y-3">
                    <div className="bg-amber-50 border-l-2 border-amber-500 p-3 text-sm text-amber-900">
                       License renewal upcoming in 45 days.
                    </div>
                    <div className="bg-blue-50 border-l-2 border-blue-500 p-3 text-sm text-blue-900">
                       Quarterly report filed successfully.
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
