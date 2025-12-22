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

function MetricCard({ title, value, trend, trendValue, icon: Icon, color = "emerald" }: any) {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    red: "text-red-600 bg-red-50 border-red-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-serif font-medium mt-1">{value}</h3>
        </div>
        <div className={cn("p-2 rounded-lg", colors[color as keyof typeof colors])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("font-medium", trend === "up" ? "text-emerald-600" : "text-red-600")}>
          {trend === "up" ? "↑" : "↓"} {trendValue}
        </span>
        <span className="text-muted-foreground">vs last week</span>
      </div>
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
  const [generationStep, setGenerationStep] = useState(0);
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
    setGenerationStep(0);
    
    // Create the dashboard shell immediately
    const newDashboard = {
      id: "custom_generated",
      title: `Analysis: "${searchQuery}"`,
      description: "AI is analyzing your data to build a custom view...",
      role: "Custom",
      tags: ["AI Generated"],
      layout: "custom"
    };
    
    setCustomDashboard(newDashboard);
    setSelectedDashboard("custom_generated");
    
    // Simulate progressive generation
    setTimeout(() => {
      setGenerationStep(1); // Metrics
    }, 800);

    setTimeout(() => {
      setGenerationStep(2); // Chart
    }, 2000);

    setTimeout(() => {
      setGenerationStep(3); // Breakdown
    }, 3500);

    setTimeout(() => {
      setGenerationStep(4); // Recommendations
      setIsGenerating(false);
      setCustomDashboard(prev => ({
        ...prev,
        description: "Custom dashboard generated based on your specific query."
      }));
    }, 5000);
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
                    className="bg-black text-white px-3 py-2 rounded-r-lg hover:bg-gray-800 disabled:opacity-70"
                 >
                   {isGenerating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                 </button>
               </form>
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
                <div className="space-y-8">
                  {/* Step 1: Metrics */}
                  {generationStep >= 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div className="flex items-center gap-2 mb-3 text-emerald-700 font-medium text-sm animate-pulse">
                        <Sparkles className="h-4 w-4" /> 
                        {generationStep === 1 ? "Analyzing key performance metrics..." : "Key Metrics Identified"}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard title="Impact Score" value="High" trend="up" trendValue="Critical" icon={AlertCircle} color="red" />
                        <MetricCard title="Est. Loss" value="$450" trend="up" trendValue="Daily" icon={DollarSign} color="amber" />
                        <MetricCard title="Frequency" value="4x" trend="up" trendValue="Weekly" icon={Clock} color="blue" />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Main Chart */}
                  {generationStep >= 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                      <div className="flex items-center gap-2 mb-3 text-emerald-700 font-medium text-sm animate-pulse">
                        <TrendingUp className="h-4 w-4" /> 
                        {generationStep === 2 ? "Correlating data points across time..." : "Trend Analysis"}
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-medium text-lg mb-6">Anomaly Detection</h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailySales}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={2} dot={{r: 4, fill: "#000"}} activeDot={{r: 6}} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Breakdown/Insights */}
                  {generationStep >= 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                      <div className="flex items-center gap-2 mb-3 text-emerald-700 font-medium text-sm animate-pulse">
                         <Filter className="h-4 w-4" /> 
                         {generationStep === 3 ? "Isolating root causes..." : "Root Cause Analysis"}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <h3 className="font-medium text-lg mb-4">Contributing Factors</h3>
                          <ul className="space-y-3">
                            <li className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                               <span className="text-sm font-medium text-red-900">Inventory Variance</span>
                               <span className="text-sm font-bold text-red-700">42%</span>
                            </li>
                            <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                               <span className="text-sm font-medium text-gray-700">Portion Control</span>
                               <span className="text-sm font-bold text-gray-900">28%</span>
                            </li>
                            <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                               <span className="text-sm font-medium text-gray-700">Waste Tracking</span>
                               <span className="text-sm font-bold text-gray-900">15%</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-sm flex flex-col justify-center relative overflow-hidden">
                           <Sparkles className="h-24 w-24 text-emerald-800 absolute -top-4 -right-4 opacity-20" />
                           <h3 className="font-medium text-lg mb-2 relative z-10">AI Insight</h3>
                           <p className="text-emerald-100 leading-relaxed relative z-10">
                              Based on the data, this issue appears to be primarily driven by <strong>Inventory Variance</strong> on weekends. This correlates with the shift overlap between 4pm-5pm.
                           </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Final Recommendation */}
                  {generationStep >= 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                       <div className="bg-black text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                          <div>
                             <h3 className="font-medium text-lg mb-1">Recommended Action</h3>
                             <p className="text-gray-400 text-sm">Implement blind counts for high-value items during shift change.</p>
                          </div>
                          <button className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
                             Create Task
                          </button>
                       </div>
                    </div>
                  )}
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