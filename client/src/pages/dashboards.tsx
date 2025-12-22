import React, { useState } from "react";
import Layout from "@/components/layout";
import { 
  Search, 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Utensils,
  Clock,
  AlertCircle,
  Filter,
  ArrowRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

// --- Mock Data ---
const dailySales = [
  { name: "Mon", value: 2400 },
  { name: "Tue", value: 1398 },
  { name: "Wed", value: 9800 },
  { name: "Thu", value: 3908 },
  { name: "Fri", value: 4800 },
  { name: "Sat", value: 3800 },
  { name: "Sun", value: 4300 },
];

const laborData = [
  { name: "12pm", scheduled: 4, actual: 4 },
  { name: "2pm", scheduled: 2, actual: 3 },
  { name: "4pm", scheduled: 3, actual: 3 },
  { name: "6pm", scheduled: 8, actual: 9 },
  { name: "8pm", scheduled: 8, actual: 7 },
  { name: "10pm", scheduled: 4, actual: 4 },
];

// --- Components ---

function AIExplanation({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-emerald-900 mt-2">
      <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}

function MetricCard({ title, value, trend, trendValue, icon: Icon, color = "emerald", explanation }: any) {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    red: "text-red-600 bg-red-50 border-red-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-serif font-medium mt-1">{value}</h3>
          </div>
          <div className={cn("p-2 rounded-lg", colors[color as keyof typeof colors])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm mb-4">
          <span className={cn("font-medium", trend === "up" ? "text-emerald-600" : "text-red-600")}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      </div>
      {explanation && <AIExplanation text={explanation} />}
    </div>
  );
}

function DashboardPreview({ title, description, role, tags, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
        active 
          ? "bg-black text-white border-black ring-2 ring-black ring-offset-2" 
          : "bg-white border-gray-200 hover:border-gray-300 text-foreground"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          active ? "bg-white/20" : "bg-gray-100"
        )}>
          <LayoutDashboard className="h-5 w-5" />
        </div>
        {active && <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">Active</span>}
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className={cn("text-sm mb-4 line-clamp-2", active ? "text-gray-300" : "text-muted-foreground")}>
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className={cn(
          "text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider",
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
        )}>
          {role}
        </span>
        {tags.map((tag: string) => (
          <span key={tag} className={cn(
            "text-[10px] px-2 py-1 rounded-md border",
            active ? "border-white/20 text-gray-300" : "border-gray-200 text-gray-500"
          )}>
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function Dashboards() {
  const [selectedDashboard, setSelectedDashboard] = useState<string>("owner_overview");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [customDashboard, setCustomDashboard] = useState<any>(null);

  const presets = [
    {
      id: "owner_overview",
      title: "Owner's Daily Overview",
      description: "High-level metrics on sales, labor cost, and net profitability.",
      role: "Owner",
      tags: ["Profit", "Sales", "Labor"],
      layout: "profit"
    },
    {
      id: "labor_control",
      title: "Labor Control Center",
      description: "Detailed breakdown of scheduled vs actual hours, overtime risk, and SPLH.",
      role: "GM",
      tags: ["Labor", "Efficiency", "Staffing"],
      layout: "labor"
    },
    {
      id: "menu_engineering",
      title: "Menu Engineering",
      description: "Analysis of item popularity vs profitability to optimize menu mix.",
      role: "Chef",
      tags: ["Food Cost", "Menu", "Sales"],
      layout: "menu"
    },
    {
      id: "server_performance",
      title: "Server Performance",
      description: "Individual sales performance, tip averages, and table turnover rates.",
      role: "Manager",
      tags: ["Staff", "Sales", "Service"],
      layout: "server"
    }
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGenerating(true);
    setGenerationStep("Analyzing your query...");
    
    // Simulate AI generation sequence
    setTimeout(() => {
      setGenerationStep("Identifying key metrics...");
    }, 800);

    setTimeout(() => {
      setGenerationStep("Fetching relevant data sources...");
    }, 1600);

    setTimeout(() => {
      setGenerationStep("Constructing visualizations...");
    }, 2400);

    setTimeout(() => {
      setCustomDashboard({
        id: "custom_generated",
        title: `Analysis: "${searchQuery}"`,
        description: "Custom dashboard generated by AI to address your specific query.",
        role: "Custom",
        tags: ["AI Generated", "Specific"],
        layout: "custom"
      });
      setSelectedDashboard("custom_generated");
      setIsGenerating(false);
      setGenerationStep("");
      setSearchQuery("");
    }, 3200);
  };

  const filteredPresets = presets.filter(p => filterRole === "all" || p.role === filterRole);
  const allDashboards = customDashboard ? [customDashboard, ...filteredPresets] : filteredPresets;

  const currentDashboard = allDashboards.find(d => d.id === selectedDashboard) || presets[0];

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        
        {/* Sidebar: Dashboard List */}
        <div className="w-80 border-r border-border bg-gray-50/50 flex flex-col">
          <div className="p-6 border-b border-border">
             <h1 className="font-serif text-2xl font-bold mb-4">Dashboards</h1>
             
             {/* AI Generator Input */}
             <div className="relative mb-6">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg blur opacity-40"></div>
               <form onSubmit={handleGenerate} className="relative flex shadow-sm">
                 <input 
                    type="text" 
                    placeholder="Describe a problem..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-emerald-200 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                 />
                 <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
                 <button 
                    type="submit" 
                    disabled={isGenerating}
                    className="bg-black text-white px-3 py-2 rounded-r-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2"
                 >
                   {isGenerating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                 </button>
               </form>
               {isGenerating && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm border border-emerald-100 p-3 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                   <Sparkles className="h-3 w-3 animate-pulse" />
                   {generationStep}
                 </div>
               )}
             </div>

             {/* Filters */}
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {["all", "Owner", "GM", "Manager", "Chef"].map(role => (
                 <button
                   key={role}
                   onClick={() => setFilterRole(role)}
                   className={cn(
                     "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                     filterRole === role 
                       ? "bg-gray-900 text-white" 
                       : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                   )}
                 >
                   {role === "all" ? "All Roles" : role}
                 </button>
               ))}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {allDashboards.map(dashboard => (
               <DashboardPreview 
                  key={dashboard.id}
                  {...dashboard}
                  active={selectedDashboard === dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard.id)}
               />
             ))}
             
             <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all flex flex-col items-center justify-center gap-2">
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Create New Dashboard</span>
             </button>
          </div>
        </div>

        {/* Main Content: Active Dashboard */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8">
           <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                       <LayoutDashboard className="h-4 w-4" />
                       <span>{currentDashboard.role} View</span>
                       <span>•</span>
                       <span>Last updated: Just now</span>
                    </div>
                    <h2 className="text-3xl font-serif font-medium text-gray-900">{currentDashboard.title}</h2>
                    <p className="text-muted-foreground mt-1">{currentDashboard.description}</p>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                       <Filter className="h-4 w-4" /> Filters
                    </button>
                    <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                       <ArrowRight className="h-4 w-4" /> Export
                    </button>
                 </div>
              </div>

              {/* Dynamic Content Based on Layout */}
              {currentDashboard.layout === "profit" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <MetricCard title="Net Sales" value="$28,450" trend="up" trendValue="12%" icon={DollarSign} color="emerald" />
                      <MetricCard title="Labor Cost" value="28.4%" trend="up" trendValue="2.1%" icon={Users} color="red" />
                      <MetricCard title="Food Cost" value="22.1%" trend="down" trendValue="0.5%" icon={Utensils} color="blue" />
                      <MetricCard title="Net Profit" value="$4,200" trend="up" trendValue="8%" icon={TrendingUp} color="emerald" />
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                         <h3 className="font-medium text-lg mb-6">Revenue vs Labor Trend</h3>
                         <div className="h-80">
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={dailySales}>
                               <defs>
                                 <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                             </AreaChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                         <h3 className="font-medium text-lg mb-6">Cost Breakdown</h3>
                         <div className="space-y-4">
                            {[
                              { label: "COGS", value: "32%", color: "bg-blue-500" },
                              { label: "Labor", value: "28%", color: "bg-red-500" },
                              { label: "Rent/Ops", value: "15%", color: "bg-gray-500" },
                              { label: "Margin", value: "25%", color: "bg-emerald-500" },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">{item.label}</span>
                                  <span className="font-medium">{item.value}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full", item.color)} style={{ width: item.value }}></div>
                                </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {currentDashboard.layout === "labor" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <MetricCard title="Current Labor %" value="24.5%" trend="down" trendValue="1.2%" icon={Clock} color="emerald" />
                      <MetricCard title="Overtime Risk" value="4 hrs" trend="up" trendValue="2 hrs" icon={AlertCircle} color="amber" />
                      <MetricCard title="SPLH" value="$65.20" trend="up" trendValue="$4.00" icon={TrendingUp} color="emerald" />
                   </div>
                   
                   <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-medium text-lg mb-6">Scheduled vs Actual Hours</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={laborData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                             <YAxis axisLine={false} tickLine={false} />
                             <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                             <Bar dataKey="scheduled" name="Scheduled" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={40} />
                             <Bar dataKey="actual" name="Actual" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>
              )}

              {currentDashboard.layout === "custom" && (
                <div className="space-y-6 animate-in fade-in duration-700">
                   <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-6">
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                            <Sparkles className="h-5 w-5 text-emerald-700" />
                         </div>
                         <div>
                            <h3 className="font-medium text-emerald-900">AI Analysis</h3>
                            <p className="text-sm text-emerald-800/80 mt-1 leading-relaxed">
                               I've analyzed your data focusing on the query. Here are the most relevant metrics that impact this problem area, along with explanations of why they matter for your specific situation.
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <MetricCard 
                        title="Impact Metric" 
                        value="High" 
                        trend="up" 
                        trendValue="Critical" 
                        icon={AlertCircle} 
                        color="red"
                        explanation="This metric is directly correlated with the problem you described. It's trending upward, indicating the issue is worsening."
                      />
                      <MetricCard 
                        title="Related Cost" 
                        value="$1,240" 
                        trend="up" 
                        trendValue="$420" 
                        icon={DollarSign} 
                        color="amber"
                        explanation="The financial impact of this inefficiency over the last 30 days. Addressing this could save approx. $300/week."
                      />
                      <MetricCard 
                        title="Efficiency Score" 
                        value="68%" 
                        trend="down" 
                        trendValue="4%" 
                        icon={TrendingUp} 
                        color="blue"
                        explanation="Your operational efficiency in this specific area is lagging behind the industry benchmark of 75%."
                      />
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                         <h3 className="font-medium text-lg mb-4">Trend Analysis</h3>
                         <div className="flex-1 min-h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={dailySales}>
                               <defs>
                                 <linearGradient id="colorCustom" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                               <YAxis axisLine={false} tickLine={false} />
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCustom)" />
                             </AreaChart>
                           </ResponsiveContainer>
                         </div>
                         <AIExplanation text="I've plotted the problem variance over the last week. Notice the spikes on Wednesday and Friday? These correlate with your busiest shifts, suggesting a capacity bottleneck rather than a chronic issue." />
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                         <h3 className="font-medium text-lg mb-4">Root Cause Breakdown</h3>
                         <div className="flex-1 flex items-center justify-center min-h-[300px]">
                            {/* Simple visualization for breakdown */}
                            <div className="w-full space-y-4">
                               {[
                                 { label: "Staffing Inefficiency", value: 45, color: "bg-red-500" },
                                 { label: "Inventory Waste", value: 30, color: "bg-amber-500" },
                                 { label: "Process Delay", value: 15, color: "bg-blue-500" },
                                 { label: "Other", value: 10, color: "bg-gray-300" }
                               ].map((item, i) => (
                                 <div key={i}>
                                   <div className="flex justify-between text-sm mb-1 font-medium">
                                     <span>{item.label}</span>
                                     <span>{item.value}%</span>
                                   </div>
                                   <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                     <div className={cn("h-full", item.color)} style={{ width: `${item.value}%` }} />
                                   </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <AIExplanation text="Based on your operational logs, nearly half of the issue stems from staffing inefficiencies during peak hours. Fixing your schedule could resolve 45% of this problem immediately." />
                      </div>
                   </div>
                </div>
              )}

              {/* Fallback for other layouts */}
              {(currentDashboard.layout !== "profit" && currentDashboard.layout !== "labor" && currentDashboard.layout !== "custom") && (
                 <div className="bg-white border border-gray-200 rounded-xl p-12 text-center animate-in fade-in duration-500">
                    <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                       <LayoutDashboard className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Dashboard Template</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                       This is a placeholder for the <strong>{currentDashboard.title}</strong> view. In a real application, this would contain charts and metrics specific to {currentDashboard.role.toLowerCase()}s.
                    </p>
                 </div>
              )}

           </div>
        </div>
      </div>
    </Layout>
  );
}