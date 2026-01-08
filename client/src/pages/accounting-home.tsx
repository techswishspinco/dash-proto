import React, { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  Target,
  Sparkles,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

// --- Components ---

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

function IntelligenceCard({ title, confidence, children, actions, type = "default" }: { title: string, confidence?: string, children: React.ReactNode, actions: React.ReactNode, type?: "default" | "alert" }) {
  return (
    <div className="bg-white border border-border p-6 flex flex-col justify-between h-full">
       <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
          {confidence && <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 font-medium">Confidence: {confidence}</span>}
       </div>
       
       <div className="flex-1">
          {children}
       </div>

       <div className="mt-6 flex gap-3">
          {actions}
       </div>
    </div>
  );
}

function MissionProgressBar({ value }: { value: number }) {
  return (
    <div className="flex gap-1 h-2 w-full mt-2 mb-4">
       {[...Array(10)].map((_, i) => (
         <div key={i} className={cn("flex-1", i < value / 10 ? "bg-black" : "bg-gray-200")} />
       ))}
    </div>
  );
}

export default function AccountingHome() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [showPnlBanner, setShowPnlBanner] = useState(false);
  const [pnlPeriod, setPnlPeriod] = useState("");

  // Check for released P&L on mount
  React.useEffect(() => {
    const released = localStorage.getItem("munch_pnl_released");
    const period = localStorage.getItem("munch_pnl_period");
    
    if (released === "true" && period) {
       setShowPnlBanner(true);
       setPnlPeriod(period);
       // Clear it so it doesn't persist forever in this prototype session
       localStorage.removeItem("munch_pnl_released");
    }
  }, []);

  const dailyData = [
    { day: 'Mon', sales: 2400, labor: 800 },
    { day: 'Tue', sales: 1800, labor: 600 },
    { day: 'Wed', sales: 3200, labor: 1100 },
    { day: 'Thu', sales: 4100, labor: 1300 },
    { day: 'Fri', sales: 5800, labor: 1800 },
    { day: 'Sat', sales: 6200, labor: 2100 },
    { day: 'Sun', sales: 4500, labor: 1500 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/insight/assistant?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickAsk = (q: string) => {
    setLocation(`/insight/assistant?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        <div className="flex-1 p-8 max-w-7xl mx-auto space-y-12 w-full">
          
          {/* 1. Top Navigation Context */}
          <div className="flex items-center justify-between border-b border-border pb-4">
             <div className="flex items-center gap-6">
                <span className="font-serif text-2xl font-medium">Showing All Locations</span>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today, Oct 24</span>
             </div>
             
             <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                <button className="hover:text-foreground transition-colors">Locations <span className="text-[10px] ml-1">▼</span></button>
                <button className="hover:text-foreground transition-colors">Bonuses</button>
                <button className="hover:text-foreground transition-colors">Reports</button>
                <button className="hover:text-foreground transition-colors">Settings</button>
             </div>
          </div>

          {/* 2. Hero / AI Command Feed */}
          <div className={cn(
             "bg-gray-50 border border-border relative overflow-hidden min-h-[220px] transition-all duration-300", 
             showPnlBanner ? "pt-20 px-8 pb-8" : "p-8"
          )}>
             {/* P&L Banner */}
             {showPnlBanner && (
                <div className="absolute top-0 left-0 right-0 bg-black text-white px-4 py-2 flex items-center justify-between z-20 animate-in slide-in-from-top duration-500">
                   <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-emerald-400">📊</span>
                      <span>{pnlPeriod} P&L available · Net margin: 9.2%</span>
                   </div>
                   <button 
                     onClick={() => setLocation("/finance/pnl-release?view=owner")}
                     className="text-xs font-medium hover:text-gray-300 transition-colors flex items-center gap-1"
                   >
                      View <ArrowUpRight className="h-3 w-3" />
                   </button>
                </div>
             )}

             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Sparkles size={200} />
             </div>

             <div className="flex items-start gap-4 mb-2 relative z-10 w-full">
                <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                   <Sparkles className="h-4 w-4" />
                </div>
                <div className="w-full">
                   <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-xl font-medium">Quick Overview</h2>
                   </div>

                   <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                      <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight mb-8">
                         Revenue is tracking <span className="bg-emerald-50 text-emerald-700 px-1 border border-emerald-100 rounded">12% ahead of forecast</span>, but labor costs are <span className="bg-red-50 text-red-700 px-1 border border-red-100 rounded">trending high</span> for the dinner shift.
                      </h1>
                      
                      <div className="flex gap-3">
                          <ActionButton>Fix Labor Risk</ActionButton>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* One Big Question Interface */}
          <div className="max-w-4xl mx-auto text-center space-y-6">
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-100 via-sky-100 to-amber-100 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <form onSubmit={handleSearch}>
                    <input 
                      type="text" 
                      value={query}
                      autoFocus
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask anything about your restaurant..." 
                      className="w-full text-center text-xl py-6 px-8 bg-white border border-gray-200 rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-serif placeholder:text-muted-foreground/50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <button type="submit" className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:scale-105 active:scale-95">
                          <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>
             </div>
             
             <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => handleQuickAsk("Who's my top performer this week?")} className="text-sm font-medium text-muted-foreground hover:text-black hover:bg-white hover:shadow-sm hover:border-black/20 bg-gray-50/80 border border-border/60 px-4 py-2 rounded-full transition-all">
                   "Who's my top performer this week?"
                </button>
                <button onClick={() => handleQuickAsk("Am I overstaffed tonight?")} className="text-sm font-medium text-muted-foreground hover:text-black hover:bg-white hover:shadow-sm hover:border-black/20 bg-gray-50/80 border border-border/60 px-4 py-2 rounded-full transition-all">
                   "Am I overstaffed tonight?"
                </button>
                <button onClick={() => handleQuickAsk("Why did labor spike on Tuesday?")} className="text-sm font-medium text-muted-foreground hover:text-black hover:bg-white hover:shadow-sm hover:border-black/20 bg-gray-50/80 border border-border/60 px-4 py-2 rounded-full transition-all">
                   "Why did labor spike on Tuesday?"
                </button>
             </div>
          </div>

          {/* 5. Portfolio Overview */}
          <div>
             <h3 className="font-serif text-lg font-medium mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> Portfolio Overview
             </h3>
             <div className="bg-white border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Location</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Payroll</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">P&L</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Journals</th>
                      <th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">Bonuses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">Little Mo BK</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Needs Review</span></td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                      <td className="px-6 py-4 text-muted-foreground">-</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">Little Mo DC</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                      <td className="px-6 py-4 text-muted-foreground">-</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">Flagged</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">KOQ LLC</td>
                      <td className="px-6 py-4 text-muted-foreground">-</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Up to date</span></td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>
        </div>
        
        {/* Sticky Footer / Impact Bar */}
        <div className="sticky bottom-0 bg-black text-white py-4 px-8 flex justify-between items-center z-30 mt-auto">
           <div className="flex gap-8 text-sm">
              <div>
                 <span className="text-gray-400 mr-2">Time Saved This Month:</span>
                 <span className="font-mono">17.4 hrs</span>
              </div>
              <div>
                 <span className="text-gray-400 mr-2">Revenue Shared:</span>
                 <span className="font-mono text-emerald-400">+$4,230</span>
              </div>
              <div>
                 <span className="text-gray-400 mr-2">Reports Generated:</span>
                 <span className="font-mono">12</span>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
