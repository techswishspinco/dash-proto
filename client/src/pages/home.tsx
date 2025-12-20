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

export default function Home() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

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
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        
        {/* 1. Top Navigation Context */}
        <div className="flex items-center justify-between border-b border-border pb-4">
           <div className="flex items-center gap-6">
              <span className="font-serif text-2xl font-medium">Little Mo BK</span>
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
        <div className="bg-gray-50 border border-border p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles size={200} />
           </div>

           <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                 <Sparkles className="h-4 w-4" />
              </div>
              <div>
                 <h2 className="font-serif text-xl font-medium mb-4">AI Summary</h2>
                 <ul className="space-y-2 text-base text-foreground/80 mb-6 font-medium">
                    <li className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                       Labor is <span className="font-bold text-red-600">+2.1%</span> over target → <span className="text-foreground">$312 risk tonight</span>
                    </li>
                    <li className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                       Upsell compliance at <span className="font-bold text-amber-600">68%</span> → <span className="text-foreground">$420 missed revenue</span>
                    </li>
                    <li className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                       Bonus pool: <span className="font-bold text-emerald-600">$1,260</span> available this week
                    </li>
                    <li className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                       Cash runway: <span className="font-bold text-blue-600">9 days</span> at current margin
                    </li>
                 </ul>
                 
                 <div className="flex gap-3">
                    <ActionButton>Fix Labor Risk</ActionButton>
                    <ActionButton variant="outline">Launch Bonus</ActionButton>
                    <ActionButton variant="outline">Boost Upsell</ActionButton>
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

        {/* 3. Top Actions for Today */}
        <div>
           <h3 className="font-serif text-lg font-medium mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> Top Actions for Today
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Action 1 */}
              <div className="bg-white border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                 <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 bg-secondary/50">HIGH CONFIDENCE</div>
                 <div className="text-3xl font-serif mb-4 text-muted-foreground group-hover:text-black transition-colors">1.</div>
                 <h4 className="font-medium text-lg mb-2">Cut 1 server at 3:30pm</h4>
                 <p className="text-sm text-muted-foreground mb-6">Based on forecasted demand drop. Saves <span className="text-emerald-700 font-medium">$312</span> in labor.</p>
                 <ActionButton>Apply Change</ActionButton>
              </div>

              {/* Action 2 */}
              <div className="bg-white border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                 <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 bg-secondary/50">ROI 3.2x</div>
                 <div className="text-3xl font-serif mb-4 text-muted-foreground group-hover:text-black transition-colors">2.</div>
                 <h4 className="font-medium text-lg mb-2">Launch Dessert Upsell Bonus</h4>
                 <p className="text-sm text-muted-foreground mb-6">Team performance lagging. Projected impact <span className="text-emerald-700 font-medium">+$540</span> revenue.</p>
                 <ActionButton>Assign Bonus</ActionButton>
              </div>

              {/* Action 3 */}
              <div className="bg-white border border-border p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                 <div className="text-3xl font-serif mb-4 text-muted-foreground group-hover:text-black transition-colors">3.</div>
                 <h4 className="font-medium text-lg mb-2">Vendor price variance</h4>
                 <p className="text-sm text-muted-foreground mb-6">Sysco invoice #9921 shows chicken price hike. <span className="text-red-600 font-medium">$180</span> weekly leak.</p>
                 <ActionButton>Review Details</ActionButton>
              </div>

           </div>
        </div>

        {/* 4. Core Pillars Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-auto items-stretch">
           
           <IntelligenceCard title="Labor" confidence="74%" actions={<ActionButton variant="outline">Adjust Staffing</ActionButton>}>
              <div className="space-y-3">
                 <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-serif text-red-600">+2.1%</span>
                    <span className="text-sm text-muted-foreground">vs target</span>
                 </div>
                 <ul className="text-sm space-y-2 text-foreground/80">
                    <li className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-red-500" /> Overstaffed 5–7pm
                    </li>
                    <li className="flex items-center gap-2">
                       <AlertCircle className="h-4 w-4 text-amber-500" /> 1 shift at risk
                    </li>
                 </ul>
              </div>
           </IntelligenceCard>

           <IntelligenceCard title="P&L" actions={<ActionButton variant="outline">Simulate Impact</ActionButton>}>
              <div className="space-y-3">
                 <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-serif">8.6%</span>
                    <span className="text-sm text-muted-foreground">Net Margin</span>
                 </div>
                 <ul className="text-sm space-y-2 text-foreground/80">
                    <li className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-red-500" /> Labor +0.8%
                    </li>
                    <li className="flex items-center gap-2">
                       <TrendingDown className="h-4 w-4 text-emerald-500" /> Food Cost -1.3%
                    </li>
                 </ul>
              </div>
           </IntelligenceCard>

           <IntelligenceCard title="Bonuses" actions={<ActionButton variant="outline">View Bonuses</ActionButton>}>
              <div className="space-y-3">
                 <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-serif">2</span>
                    <span className="text-sm text-muted-foreground">Active Missions</span>
                 </div>
                 <ul className="text-sm space-y-2 text-foreground/80">
                    <li className="flex items-center gap-2">
                       <DollarSign className="h-4 w-4 text-emerald-500" /> $1,260 available
                    </li>
                    <li className="flex items-center gap-2">
                       <Target className="h-4 w-4 text-blue-500" /> 68% complete
                    </li>
                 </ul>
              </div>
           </IntelligenceCard>

           <IntelligenceCard title="Upsell" actions={<ActionButton variant="outline">Fix Upsell</ActionButton>}>
              <div className="space-y-3">
                 <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-serif text-amber-600">29%</span>
                    <span className="text-sm text-muted-foreground">Conversion</span>
                 </div>
                 <ul className="text-sm space-y-2 text-foreground/80">
                    <li className="flex items-center gap-2">
                       <AlertCircle className="h-4 w-4 text-amber-500" /> 12 missed desserts
                    </li>
                    <li className="flex items-center gap-2">
                       <DollarSign className="h-4 w-4 text-muted-foreground" /> $610 left behind
                    </li>
                 </ul>
              </div>
           </IntelligenceCard>

        </div>

        {/* 5. Active Bonus Missions (Gamified) */}
        <div>
           <h3 className="font-serif text-lg font-medium mb-6">🎯 Active Bonus Missions</h3>
           <div className="bg-white border border-border p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1 w-full">
                 <div className="flex justify-between items-end mb-2">
                    <h4 className="font-medium text-lg">Upsell Compliance</h4>
                    <span className="text-2xl font-serif">68%</span>
                 </div>
                 <MissionProgressBar value={6.8} />
                 <div className="flex gap-8 text-sm">
                    <div>
                       <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Reward</span>
                       <span className="font-medium">$480</span>
                    </div>
                    <div>
                       <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">ROI</span>
                       <span className="font-medium text-emerald-700">+$1,900</span>
                    </div>
                    <div>
                       <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Eligible</span>
                       <span className="font-medium">Servers (8)</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                 <ActionButton variant="outline">View Details</ActionButton>
                 <ActionButton>Notify Team</ActionButton>
              </div>
           </div>
        </div>

        {/* 6. Labor Intelligence & Upsell (2-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Labor Shift Intel */}
           <div className="bg-white border border-border p-8">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="font-serif text-lg font-medium">📆 Upcoming Shifts</h3>
                    <div className="text-sm text-muted-foreground mt-1">Tonight — Dinner</div>
                 </div>
                 <div className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-1 border border-amber-100">
                    RISK: MEDIUM
                 </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                 <li className="flex gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <span className="text-foreground/80">Forecast demand lower than staffing (15:00 - 18:00)</span>
                 </li>
                 <li className="flex gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span className="text-foreground/80">Alex below upsell average for Friday nights</span>
                 </li>
                 <li className="flex gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span className="text-foreground/80">Bonus opportunity unlocked: "Speed of Service"</span>
                 </li>
              </ul>
              
              <div className="flex gap-3">
                 <ActionButton>Auto-Adjust</ActionButton>
                 <ActionButton variant="outline">Assign Bonus</ActionButton>
              </div>
           </div>

           {/* Upsell Behavior */}
           <div className="bg-white border border-border p-8">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="font-serif text-lg font-medium">🍰 Upsell Moments</h3>
                    <div className="text-sm text-muted-foreground mt-1">Yesterday</div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div>
                    <div className="text-sm text-muted-foreground mb-1">Opportunities</div>
                    <div className="text-2xl font-serif">42</div>
                 </div>
                 <div>
                    <div className="text-sm text-muted-foreground mb-1">Attempts</div>
                    <div className="text-2xl font-serif text-amber-600">18</div>
                 </div>
                 <div>
                    <div className="text-sm text-muted-foreground mb-1">Conversions</div>
                    <div className="text-2xl font-serif">12</div>
                 </div>
                 <div>
                    <div className="text-sm text-muted-foreground mb-1">Missed Rev</div>
                    <div className="text-2xl font-serif text-muted-foreground">$610</div>
                 </div>
              </div>
              
              <div className="flex gap-3">
                 <ActionButton>Send Coaching Tip</ActionButton>
                 <ActionButton variant="outline">Attach Bonus</ActionButton>
              </div>
           </div>

        </div>

      </div>
      
      {/* Sticky Footer / Impact Bar */}
      <div className="sticky bottom-0 bg-black text-white py-4 px-8 flex justify-between items-center z-30">
         <div className="flex gap-8 text-sm">
            <div>
               <span className="text-gray-400 mr-2">Time Saved This Month:</span>
               <span className="font-mono">17.4 hrs</span>
            </div>
            <div>
               <span className="text-gray-400 mr-2">Profit Impact:</span>
               <span className="font-mono text-emerald-400">+$4,230</span>
            </div>
         </div>
      </div>

    </Layout>
  );
}
