import React, { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { 
  Calendar, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  Download, 
  FileText, 
  LayoutDashboard, 
  Loader2, 
  MoreHorizontal, 
  PieChart, 
  Plus, 
  RefreshCw, 
  Save, 
  Search, 
  Send, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  X,
  ArrowLeft,
  Share,
  ArrowRight,
  FileSpreadsheet,
  File,
  Utensils,
  Briefcase,
  Users,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from "recharts";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { PnLFilter, DateRange } from "@/components/accounting/pnl-filter";
import { parse, isWithinInterval, startOfMonth, endOfMonth, startOfQuarter, startOfYear } from "date-fns";

// --- Mock Data ---

const pnlPeriods = [
  { id: "oct-24", period: "October 2024", location: "Little Mo BK", status: "Ready to Sync", sentDate: null, viewed: false, owner: "Accountant" },
  { id: "sep-24", period: "September 2024", location: "Little Mo BK", status: "Sent", sentDate: "Oct 15, 2024", viewed: true, owner: "Manager" },
  { id: "aug-24", period: "August 2024", location: "Little Mo BK", status: "Sent", sentDate: "Sep 12, 2024", viewed: true, owner: "Manager" },
  { id: "jul-24", period: "July 2024", location: "Little Mo BK", status: "Sent", sentDate: "Aug 14, 2024", viewed: true, owner: "System" },
  { id: "jun-24", period: "June 2024", location: "Little Mo BK", status: "Sent", sentDate: "Jul 10, 2024", viewed: false, owner: "Owner" },
  { id: "may-24", period: "May 2024", location: "Little Mo BK", status: "Draft", sentDate: null, viewed: false, owner: "Accountant" },
];

const pnlData = [
  { category: "Revenue", current: 124500, prior: 118200, variance: 6300, pct: 5.3 },
  { category: "COGS", current: 38595, prior: 35460, variance: 3135, pct: 8.8 },
  { category: "Labor", current: 41085, prior: 43734, variance: -2649, pct: -6.1 },
  { category: "Rent", current: 8500, prior: 8500, variance: 0, pct: 0.0 },
  { category: "Other Ops", current: 14200, prior: 13800, variance: 400, pct: 2.9 },
  { category: "Net Income", current: 22120, prior: 16706, variance: 5414, pct: 32.4 },
];

const categoryData = [
  { name: 'Labor', value: 33, color: '#ef4444' },
  { name: 'COGS', value: 31, color: '#3b82f6' },
  { name: 'Rent', value: 7, color: '#eab308' },
  { name: 'Other', value: 11, color: '#6b7280' },
  { name: 'Margin', value: 18, color: '#10b981' },
];

const trendData = [
  { month: 'May', margin: 6.2 },
  { month: 'Jun', margin: 7.1 },
  { month: 'Jul', margin: 5.8 },
  { month: 'Aug', margin: 8.4 },
  { month: 'Sep', margin: 7.9 },
  { month: 'Oct', margin: 9.2 },
];

// --- Components ---

// --- Collapsible P&L Dashboard Components ---

type PnLItemType = "section" | "group" | "account";

interface PnLItem {
  id: string;
  name: string;
  current: number;
  prior: number;
  variance: number;
  pct: number;
  type: PnLItemType;
  children?: PnLItem[];
  tag?: "Critical" | "Attention" | "Favorable";
}

const detailedPnLData: PnLItem[] = [
  {
    id: "rev", name: "Revenue", current: 133041.81, prior: 154351.46, variance: -21309.65, pct: -13.8, type: "section", tag: "Critical",
    children: [
      { id: "rev-food", name: "Food Sales", current: 98450.20, prior: 112300.50, variance: -13850.30, pct: -12.3, type: "group", children: [
         { id: "rev-food-din", name: "Dinner", current: 65200.00, prior: 72000.00, variance: -6800.00, pct: -9.4, type: "account" },
         { id: "rev-food-lun", name: "Lunch", current: 22100.00, prior: 28500.00, variance: -6400.00, pct: -22.5, type: "account", tag: "Critical" },
         { id: "rev-food-bru", name: "Brunch", current: 11150.20, prior: 11800.50, variance: -650.30, pct: -5.5, type: "account" },
      ]},
      { id: "rev-bev", name: "Beverage Sales", current: 34591.61, prior: 42050.96, variance: -7459.35, pct: -17.7, type: "group", children: [
         { id: "rev-bev-alc", name: "Alcohol", current: 28500.00, prior: 35000.00, variance: -6500.00, pct: -18.6, type: "account", tag: "Attention" },
         { id: "rev-bev-na", name: "Non-Alcoholic", current: 6091.61, prior: 7050.96, variance: -959.35, pct: -13.6, type: "account" },
      ]}
    ]
  },
  {
    id: "cogs", name: "Cost of Goods Sold", current: 55669.86, prior: 57494.34, variance: -1824.48, pct: -3.2, type: "section", tag: "Favorable",
    children: [
       { id: "cogs-food", name: "Food Cost", current: 28500.40, prior: 26800.50, variance: 1699.90, pct: 6.3, type: "group", tag: "Attention", children: [
          { id: "cogs-food-meat", name: "Meat & Poultry", current: 12400.00, prior: 11200.00, variance: 1200.00, pct: 10.7, type: "account", tag: "Attention" },
          { id: "cogs-food-prod", name: "Produce", current: 5184.83, prior: 4937.50, variance: 247.33, pct: 5.0, type: "account", tag: "Critical" },
          { id: "cogs-food-dry", name: "Dry Goods", current: 3500.00, prior: 3800.00, variance: -300.00, pct: -7.9, type: "account", tag: "Favorable" },
       ]},
       { id: "cogs-bev", name: "Beverage Cost", current: 8500.00, prior: 9200.00, variance: -700.00, pct: -7.6, type: "group", tag: "Favorable", children: [
          { id: "cogs-bev-liq", name: "Liquor", current: 4200.00, prior: 4500.00, variance: -300.00, pct: -6.7, type: "account" },
          { id: "cogs-bev-beer", name: "Beer", current: 2393.45, prior: 1195.39, variance: 1198.06, pct: 100.2, type: "account", tag: "Attention" },
          { id: "cogs-bev-wine", name: "Wine", current: 1906.55, prior: 3504.61, variance: -1598.06, pct: -45.6, type: "account", tag: "Favorable" },
       ]},
       { id: "cogs-comm", name: "Commissary Food", current: 19847.40, prior: 23938.32, variance: -4090.92, pct: -17.1, type: "account", tag: "Favorable" }
    ]
  },
  {
    id: "labor", name: "Labor", current: 45156.05, prior: 48200.13, variance: -3044.08, pct: -6.3, type: "section", tag: "Favorable",
    children: [
       { id: "lab-direct", name: "Direct Labor Cost", current: 16156.05, prior: 18408.13, variance: -2252.08, pct: -12.2, type: "group", tag: "Favorable", children: [
          { id: "lab-foh", name: "FOH Hourly", current: 8500.00, prior: 9800.00, variance: -1300.00, pct: -13.3, type: "account", tag: "Favorable" },
          { id: "lab-boh", name: "BOH Hourly", current: 7656.05, prior: 8608.13, variance: -952.08, pct: -11.1, type: "account" }
       ]},
       { id: "lab-mgmt", name: "Management Salaries", current: 24000.00, prior: 24000.00, variance: 0, pct: 0, type: "account" },
       { id: "lab-taxes", name: "Payroll Taxes", current: 5000.00, prior: 5792.00, variance: -792.00, pct: -13.7, type: "account" }
    ]
  },
  {
     id: "opex", name: "Operating Expenses", current: 18500.00, prior: 17200.00, variance: 1300.00, pct: 7.6, type: "section", tag: "Attention",
     children: [
        { id: "opex-rent", name: "Rent", current: 8500.00, prior: 8500.00, variance: 0, pct: 0, type: "account" },
        { id: "opex-repairs", name: "Repairs & Maintenance", current: 4200.00, prior: 2500.00, variance: 1700.00, pct: 68.0, type: "account", tag: "Critical" },
        { id: "opex-util", name: "Utilities", current: 3200.00, prior: 3100.00, variance: 100.00, pct: 3.2, type: "account" },
        { id: "opex-supplies", name: "Operating Supplies", current: 2600.00, prior: 3100.00, variance: -500.00, pct: -16.1, type: "account", tag: "Favorable" }
     ]
  },
  { id: "ni", name: "Net Income", current: 13715.90, prior: 31456.99, variance: -17741.09, pct: -56.4, type: "section", tag: "Critical" }
];

function PnLRow({ item, level = 0, searchTerm, filterTag }: { item: PnLItem, level?: number, searchTerm: string, filterTag: string }) {
  const [isExpanded, setIsExpanded] = useState(level < 1); // Expand top level by default
  const hasChildren = item.children && item.children.length > 0;
  
  // Search & Filter Logic
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesTag = filterTag === "All" || item.tag === filterTag;
  
  // Recursively check if children match
  const childMatches = item.children ? item.children.some(child => {
     const childNameMatch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
     const childTagMatch = filterTag === "All" || child.tag === filterTag;
     // Deep check
     const deepMatch = child.children ? child.children.some(grandChild => 
        (grandChild.name.toLowerCase().includes(searchTerm.toLowerCase()) && (filterTag === "All" || grandChild.tag === filterTag))
     ) : false;
     
     return (childNameMatch && childTagMatch) || deepMatch;
  }) : false;

  const shouldShow = (matchesSearch && matchesTag) || childMatches;

  // Auto-expand if searching or filtering
  useEffect(() => {
     if ((searchTerm || filterTag !== "All") && childMatches) {
        setIsExpanded(true);
     }
  }, [searchTerm, filterTag, childMatches]);

  if (!shouldShow) return null;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div 
         className={cn(
            "flex items-center py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer select-none",
            level === 0 ? "bg-white font-medium text-gray-900" : "text-gray-700 text-sm",
            level > 0 && "border-l border-gray-100"
         )}
         style={{ paddingLeft: `${(level * 1.5) + 1}rem` }}
         onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
         <div className="flex-1 flex items-center gap-3">
            {hasChildren ? (
               <div className={cn("text-gray-400 transition-transform duration-200", isExpanded ? "rotate-90" : "")}>
                  <ChevronRight className="h-4 w-4" />
               </div>
            ) : <div className="w-4" />}
            
            <span>{item.name}</span>
            
            {item.tag && (
               <span className={cn(
                  "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ml-2",
                  item.tag === "Critical" ? "bg-red-100 text-red-700" :
                  item.tag === "Attention" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
               )}>
                  {item.tag === "Critical" ? <div className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block mr-1" /> : null}
                  {item.tag === "Attention" ? <div className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block mr-1" /> : null}
                  {item.tag === "Favorable" ? <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1" /> : null}
                  {item.tag === "Favorable" ? "" : item.tag}
               </span>
            )}
         </div>
         
         <div className="flex items-center gap-8 text-right font-mono text-xs md:text-sm">
            <div className="w-24 font-medium">${item.current.toLocaleString()}</div>
            <div className="w-24 text-gray-500">${item.prior.toLocaleString()}</div>
            <div className={cn("w-16 font-medium", item.variance > 0 ? (item.type === "section" && (item.name === "Cost of Goods Sold" || item.name === "Labor" || item.name === "Operating Expenses") ? "text-red-600" : "text-emerald-600") : (item.type === "section" && (item.name === "Cost of Goods Sold" || item.name === "Labor" || item.name === "Operating Expenses") ? "text-emerald-600" : "text-red-600"))}>
               {item.pct > 0 ? "+" : ""}{item.pct.toFixed(1)}%
            </div>
         </div>
      </div>
      
      {isExpanded && hasChildren && (
         <div className="animate-in slide-in-from-top-1 duration-200 fade-in-50">
            {item.children?.map(child => (
               <PnLRow key={child.id} item={child} level={level + 1} searchTerm={searchTerm} filterTag={filterTag} />
            ))}
         </div>
      )}
    </div>
  );
}

function PnLDashboard() {
   const [searchTerm, setSearchTerm] = useState("");
   const [filterTag, setFilterTag] = useState("All"); // All, Critical, Attention, Favorable
   
   // Calculate counts for filters
   const countTags = (tag: string) => {
      let count = 0;
      const traverse = (items: PnLItem[]) => {
         items.forEach(item => {
            if (item.tag === tag) count++;
            if (item.children) traverse(item.children);
         });
      };
      traverse(detailedPnLData);
      return count;
   };
   
   const criticalCount = countTags("Critical");
   const attentionCount = countTags("Attention");
   const favorableCount = countTags("Favorable");

   return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         {/* Header / Toolbar */}
         <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               <h3 className="font-serif font-bold text-lg text-gray-900">P&L Dashboard</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
               {/* Search */}
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                     type="text" 
                     placeholder="Search line items..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-black"
                  />
               </div>
               
               {/* Filter Tags */}
               <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  <button 
                     onClick={() => setFilterTag("All")}
                     className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                        filterTag === "All" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                     )}
                  >
                     All Items
                  </button>
                  <button 
                     onClick={() => setFilterTag("Critical")}
                     className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                        filterTag === "Critical" ? "bg-red-100 text-red-800 border border-red-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                     )}
                  >
                     <div className="h-1.5 w-1.5 rounded-full bg-red-500" /> {criticalCount} Critical
                  </button>
                  <button 
                     onClick={() => setFilterTag("Attention")}
                     className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                        filterTag === "Attention" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                     )}
                  >
                     <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {attentionCount} Attention
                  </button>
                  <button 
                     onClick={() => setFilterTag("Favorable")}
                     className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                        filterTag === "Favorable" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                     )}
                  >
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {favorableCount} Favorable
                  </button>
               </div>
            </div>
         </div>
         
         {/* Column Headers */}
         <div className="bg-white border-b border-gray-100 flex items-center py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <div className="flex-1">Line Item</div>
            <div className="flex items-center gap-8 text-right">
               <div className="w-24">Current</div>
               <div className="w-24">Prior</div>
               <div className="w-16">Variance</div>
            </div>
         </div>

         {/* Rows */}
         <div className="divide-y divide-gray-50">
            {detailedPnLData.map(item => (
               <PnLRow key={item.id} item={item} searchTerm={searchTerm} filterTag={filterTag} />
            ))}
         </div>
      </div>
   );
}

function ReleaseModal({ isOpen, onClose, data, onConfirm }: { isOpen: boolean, onClose: () => void, data: any, onConfirm: () => void }) {
   const [message, setMessage] = useState("Here is your P&L report for the period. Highlights included below.");
   const [scheduleDate, setScheduleDate] = useState("");
   const [scheduleTime, setScheduleTime] = useState("");
   
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[80vh] flex overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Left Col: Settings */}
            <div className="w-1/2 p-8 border-r border-gray-200 flex flex-col">
               <div className="mb-6">
                  <h2 className="font-serif text-2xl font-medium mb-2">Finalize Release</h2>
                  <p className="text-muted-foreground text-sm">Review the notification message before sending to the owner.</p>
               </div>

               <div className="space-y-6 flex-1">
                  <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Schedule Send At</label>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                           <input 
                              type="date" 
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-black focus:border-black outline-none"
                           />
                        </div>
                        <div className="relative">
                           <input 
                              type="time" 
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-black focus:border-black outline-none"
                           />
                        </div>
                     </div>
                     <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 
                        {scheduleDate && scheduleTime 
                           ? `Scheduled for ${new Date(scheduleDate).toLocaleDateString()} at ${scheduleTime}`
                           : "Leave blank to send immediately"}
                     </p>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Notification Message</label>
                     <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg focus:ring-black focus:border-black p-3 min-h-[120px] shadow-sm"
                        placeholder="Add a personal message..."
                     />
                     <p className="text-xs text-muted-foreground mt-2">This message will appear in the email body and push notification.</p>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                  <button 
                     onClick={onClose}
                     className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={onConfirm}
                     className="flex-1 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                     {scheduleDate && scheduleTime ? (
                        <>Schedule Release <Calendar className="h-3 w-3" /></>
                     ) : (
                        <>Send & Release <Send className="h-3 w-3" /></>
                     )}
                  </button>
               </div>
            </div>

            {/* Right Col: Preview */}
            <div className="w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  Live Preview
               </div>

               {/* Email Card Preview */}
               <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 transform scale-95 origin-center">
                   {/* Email Header */}
                   <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-white text-black rounded-full flex items-center justify-center font-serif font-bold text-xs">M</div>
                        <span className="font-medium text-sm">Munch Insights</span>
                     </div>
                     <span className="text-xs text-gray-400">Now</span>
                   </div>
                   
                   <div className="p-6">
                     <div className="mb-4">
                        <h3 className="text-lg font-serif font-medium text-gray-900 mb-1">P&L Ready: {data.period}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                     </div>

                     <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                        <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Executive Summary</div>
                        <p className="text-sm font-medium text-gray-900 leading-snug mb-3">{data.headline}</p>
                        
                        <div className="space-y-2">
                           {data.insights.slice(0, 2).map((insight: any) => (
                              <div key={insight.id} className="flex gap-2 items-start">
                                 <div className={cn(
                                    "mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    insight.tag === "Positive" ? "bg-emerald-500" : 
                                    insight.tag === "Negative" ? "bg-red-500" : "bg-gray-400"
                                 )} />
                                 <p className="text-xs text-gray-600 leading-snug line-clamp-2">{insight.text}</p>
                              </div>
                           ))}
                           {data.insights.length > 2 && (
                              <p className="text-[10px] text-muted-foreground pl-3.5">+ {data.insights.length - 2} more insights</p>
                           )}
                        </div>
                     </div>

                     <button className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium">
                        View Full Report
                     </button>
                   </div>
               </div>
            </div>

         </div>
      </div>
   );
}

function InsightCard({ insight, onDelete, onUpdate }: { insight: any, onDelete: () => void, onUpdate: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(insight.text);

  return (
    <div className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all relative">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block",
            insight.tag === "Positive" ? "bg-emerald-100 text-emerald-700" :
            insight.tag === "Negative" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-700"
          )}>
            {insight.tag}
          </span>
          {isEditing ? (
            <textarea 
              className="w-full text-sm border-gray-300 rounded-md focus:ring-black focus:border-black p-2 min-h-[80px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => { setIsEditing(false); onUpdate(text); }}
              autoFocus
            />
          ) : (
            <p 
              className="text-sm text-gray-800 leading-relaxed cursor-text hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {text}
            </p>
          )}
        </div>
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function VisualizationCard({ title, children, active, onToggle }: { title: string, children: React.ReactNode, active: boolean, onToggle: () => void }) {
  return (
    <div className={cn(
      "border rounded-xl transition-all duration-300 overflow-hidden",
      active ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-200 opacity-60 grayscale"
    )}>
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-sm text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{active ? "Included" : "Excluded"}</span>
          <button 
            onClick={onToggle}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              active ? "bg-black" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200",
              active ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>
      <div className="p-4 h-64 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// --- Table of Contents Component ---

function HoverTOC({ children, targetIds }: { children: React.ReactNode, targetIds: { id: string, label: string }[] }) {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsHovered(false);
  };

  return (
    <div 
      className="relative group inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="cursor-pointer">
        {children}
      </div>
      
      {isHovered && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
              Jump to Section
           </div>
           <div className="space-y-0.5">
              {targetIds.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors flex items-center justify-between group/item"
                 >
                    {item.label}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-gray-400" />
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}

// --- Curated View Components ---

function MetricCard({ title, value, subtext, trend, trendVal, icon: Icon, alert }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</div>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-serif text-gray-900">{value}</div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className={cn(
          "text-xs font-medium flex items-center gap-1",
          trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-gray-500"
        )}>
          {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
          {trendVal}
        </div>
        <div className="text-xs text-gray-400">{subtext}</div>
      </div>
      {alert && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-amber-600 font-medium">
          <AlertCircle className="h-3 w-3" />
          {alert}
        </div>
      )}
    </div>
  );
}

function CuratedView({ role, onRoleChange }: { role: string, onRoleChange: (r: string) => void }) {
  const roles = [
    { id: "Owner", icon: Briefcase, label: "Owner" },
    { id: "General Manager", icon: Users, label: "General Manager" },
    { id: "Executive Chef", icon: Utensils, label: "Executive Chef" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Role Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex items-center gap-1 shadow-sm">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => onRoleChange(r.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
              role === r.id 
                ? "bg-black text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <r.icon className="h-4 w-4" />
            {r.label}
          </button>
        ))}
      </div>

      {/* Role Specific Content */}
      {role === "Owner" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Net Income" 
              value="$22,120" 
              trend="up" 
              trendVal="32.4%" 
              subtext="vs last period" 
              icon={Briefcase}
            />
             <MetricCard 
              title="EBITDA Margin" 
              value="18.2%" 
              trend="up" 
              trendVal="2.1%" 
              subtext="vs last period" 
              icon={PieChart}
            />
            <MetricCard 
              title="Labor %" 
              value="33.0%" 
              trend="up" 
              trendVal="-6.1%" 
              subtext="of sales" 
              icon={Users}
            />
            <MetricCard 
              title="Food Cost %" 
              value="31.0%" 
              trend="down" 
              trendVal="+8.8%" 
              subtext="of sales" 
              icon={Utensils}
              alert="Exceeds 30% target"
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-medium text-gray-900 mb-4">Profitability Trend (6 Months)</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={[
                      { month: 'May', income: 15400 },
                      { month: 'Jun', income: 18200 },
                      { month: 'Jul', income: 14500 },
                      { month: 'Aug', income: 21000 },
                      { month: 'Sep', income: 19500 },
                      { month: 'Oct', income: 22120 },
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Net Income"]} />
                      <Line type="monotone" dataKey="income" stroke="#000000" strokeWidth={3} dot={{r: 4, fill: '#000000'}} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {role === "General Manager" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Sales" 
              value="$124,500" 
              trend="up" 
              trendVal="5.3%" 
              subtext="vs forecast" 
              icon={TrendingUp}
            />
            <MetricCard 
              title="Prime Cost" 
              value="64.0%" 
              trend="up" 
              trendVal="-1.2%" 
              subtext="Labor + COGS" 
              icon={PieChart}
            />
            <MetricCard 
              title="Labor Hours" 
              value="1,420" 
              trend="up" 
              trendVal="-40 hrs" 
              subtext="vs last period" 
              icon={Users}
            />
             <MetricCard 
              title="Overtime" 
              value="24 hrs" 
              trend="down" 
              trendVal="+8 hrs" 
              subtext="vs target" 
              icon={AlertCircle}
              alert="Check closing shifts"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-4">Labor vs Sales (Daily)</h3>
                <div className="h-64 w-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                   {/* Placeholder for complex chart */}
                   <span className="text-sm">Daily Labor/Sales Chart</span>
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-4">Controllable Expenses Variance</h3>
                <div className="space-y-4">
                   {[
                      { name: "Kitchen Supplies", val: 420, pct: 12 },
                      { name: "Repairs & Maint.", val: -150, pct: -5 },
                      { name: "Linen", val: 85, pct: 3 },
                      { name: "Utilities", val: 210, pct: 6 }
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                         <span className="text-gray-600">{item.name}</span>
                         <div className="flex items-center gap-3">
                            <span className={item.val > 0 ? "text-red-600" : "text-emerald-600"}>
                               {item.val > 0 ? "+" : ""}{item.val}
                            </span>
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                  className={cn("h-full rounded-full", item.val > 0 ? "bg-red-500" : "bg-emerald-500")} 
                                  style={{ width: `${Math.abs(item.pct) * 5}%` }} 
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {role === "Executive Chef" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Food Cost" 
              value="28.4%" 
              trend="down" 
              trendVal="+1.4%" 
              subtext="vs target (27%)" 
              icon={Utensils}
              alert="Produce pricing up"
            />
            <MetricCard 
              title="Pour Cost" 
              value="18.2%" 
              trend="up" 
              trendVal="-0.5%" 
              subtext="vs target (19%)" 
              icon={Check}
            />
            <MetricCard 
              title="Kitchen Labor" 
              value="14.2%" 
              trend="up" 
              trendVal="-0.8%" 
              subtext="of sales" 
              icon={Users}
            />
             <MetricCard 
              title="Waste Log" 
              value="$420" 
              trend="down" 
              trendVal="+$85" 
              subtext="vs last period" 
              icon={Trash2}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-medium text-gray-900 mb-4">Category Breakdown</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                         <Pie
                            data={[
                               { name: 'Meat', value: 35, color: '#ef4444' },
                               { name: 'Produce', value: 25, color: '#10b981' },
                               { name: 'Dairy', value: 15, color: '#f59e0b' },
                               { name: 'Dry Goods', value: 15, color: '#6b7280' },
                               { name: 'Other', value: 10, color: '#8b5cf6' },
                            ]}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                         >
                            {[
                               { name: 'Meat', value: 35, color: '#ef4444' },
                               { name: 'Produce', value: 25, color: '#10b981' },
                               { name: 'Dairy', value: 15, color: '#f59e0b' },
                               { name: 'Dry Goods', value: 15, color: '#6b7280' },
                               { name: 'Other', value: 10, color: '#8b5cf6' },
                            ].map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip />
                      </RechartsPieChart>
                   </ResponsiveContainer>
                </div>
                <div className="col-span-2 space-y-4">
                   {[
                      { name: "Meat", val: 35, var: -2 },
                      { name: "Produce", val: 25, var: +4 },
                      { name: "Dairy", val: 15, var: 0 },
                      { name: "Dry Goods", val: 15, var: +1 },
                      { name: "Other", val: 10, var: -1 }
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2">
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", 
                               item.name === "Meat" ? "bg-red-500" :
                               item.name === "Produce" ? "bg-emerald-500" :
                               item.name === "Dairy" ? "bg-amber-500" :
                               "bg-gray-400"
                            )} />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-500">{item.val}% of Total</span>
                            <span className={cn("text-sm font-medium w-12 text-right", item.var > 0 ? "text-red-600" : "text-emerald-600")}>
                               {item.var > 0 ? "+" : ""}{item.var}%
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Chat Component for Owner View ---
function OwnerChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise(r => setTimeout(r, 1500));
    
    let responseText = "I can analyze that for you. Based on the data, the main driver was the reduction in overtime hours during the weekdays.";
    
    if (text.toLowerCase().includes("food cost")) {
       responseText = "Food costs rose primarily due to a 15% price increase in avocados and limes from our main supplier. We might want to look into alternative vendors for next month.";
    } else if (text.toLowerCase().includes("labor")) {
       responseText = "Labor is trending well! We saved about 40 hours this month by optimizing the Tuesday/Wednesday dinner shifts.";
    }

    const aiMsg = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: responseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
       <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
             </div>
             <div>
                <h3 className="font-serif font-medium text-sm">Munch Assistant</h3>
                <p className="text-xs text-muted-foreground">Ask anything about this report</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
             <X className="h-4 w-4" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30" ref={scrollRef}>
          {messages.length === 0 && (
             <div className="mt-8 px-4 text-center">
                <p className="text-sm text-gray-500 mb-6">Here are a few things you can ask me:</p>
                <div className="space-y-3">
                   <button onClick={() => handleSend("Why did food costs go up?")} className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all text-sm group">
                      <span className="font-medium text-gray-900 group-hover:text-emerald-700">Why did food costs go up?</span>
                      <span className="block text-xs text-gray-500 mt-1">Analyze COGS variance</span>
                   </button>
                   <button onClick={() => handleSend("Show me the daily labor breakdown")} className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all text-sm group">
                      <span className="font-medium text-gray-900 group-hover:text-emerald-700">Daily labor breakdown</span>
                      <span className="block text-xs text-gray-500 mt-1">View staffing efficiency</span>
                   </button>
                   <button onClick={() => handleSend("Draft an email to the team about this")} className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all text-sm group">
                      <span className="font-medium text-gray-900 group-hover:text-emerald-700">Draft team email</span>
                      <span className="block text-xs text-gray-500 mt-1">Celebrate the wins</span>
                   </button>
                </div>
             </div>
          )}

          {messages.map((msg) => (
             <div key={msg.id} className={cn("flex gap-3", msg.role === "assistant" ? "" : "flex-row-reverse")}>
                <div className={cn(
                   "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                   msg.role === "assistant" ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                )}>
                   {msg.role === "assistant" ? <Sparkles className="h-4 w-4" /> : <div className="font-bold text-xs">You</div>}
                </div>
                <div className={cn(
                   "max-w-[85%] py-2 px-3 rounded-2xl text-sm leading-relaxed",
                   msg.role === "user" ? "bg-gray-100 text-gray-900 rounded-tr-none" : "bg-transparent text-gray-900 px-0"
                )}>
                   {msg.content}
                </div>
             </div>
          ))}
          
          {isTyping && (
             <div className="flex gap-3">
                <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                   <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                   <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                   <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                   <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
             </div>
          )}
       </div>

       <div className="p-4 bg-white border-t border-gray-200">
          <form 
             onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
             className="relative flex items-center"
          >
             <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask follow-up questions..."
                className="w-full py-3 pl-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all text-sm"
             />
             <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
                <Send className="h-3.5 w-3.5" />
             </button>
          </form>
       </div>
    </div>
  );
}

// --- Main Page Component ---

export default function PnlRelease() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if we're in owner view mode
  const searchParams = new URLSearchParams(window.location.search);
  const isOwnerView = searchParams.get("view") === "owner";
  
  // State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [locationName, setLocationName] = useState("Little Mo BK");
  const [period, setPeriod] = useState("October 2024");
  const [showChat, setShowChat] = useState(true); // Default show chat for owner view

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: startOfQuarter(new Date("2024-10-01")),
      to: endOfMonth(new Date("2024-10-01"))
  });
  const [datePreset, setDatePreset] = useState("This Month");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState("Monthly");
  
  const filteredPeriods = pnlPeriods.filter(item => {
    // Date Filter
    const itemDate = parse(item.period, "MMMM yyyy", new Date());
    let inDateRange = true;
    if (dateRange?.from) {
        if (dateRange.to) {
            inDateRange = isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to });
        } else {
            // Assume single month selection matches that month
             inDateRange = itemDate.getMonth() === dateRange.from.getMonth() && itemDate.getFullYear() === dateRange.from.getFullYear();
        }
    }

    // Status Filter
    const inStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

    // Owner Filter
    const inOwner = selectedOwners.length === 0 || selectedOwners.includes(item.owner);
    
    return inDateRange && inStatus && inOwner;
  });

  // Release Data State
  const [headline, setHeadline] = useState("Net margin improved to 9.2%, driven by labor savings. But food costs crept up 1.4%.");
  const [insights, setInsights] = useState([
    { id: 1, text: "Labor costs dropped 6.1% due to better scheduling on Tuesday/Wednesday shifts.", tag: "Positive" },
    { id: 2, text: "COGS increased significantly in produce category, specifically avocados and limes.", tag: "Negative" },
    { id: 3, text: "Revenue up 5.3% year-over-year, beating forecast by $4.2k.", tag: "Positive" },
  ]);
  const [note, setNote] = useState("");
  const [visualizations, setVisualizations] = useState({
    breakdown: true,
    trend: true,
    variance: true
  });
  const [showFullPnl, setShowFullPnl] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [activeView, setActiveView] = useState<"detailed" | "curated">("detailed");
  const [userRole, setUserRole] = useState("Owner");
  
  // Handlers
  const handlePeriodClick = (p: typeof pnlPeriods[0]) => {
     if (p.status === "Ready to Sync") {
        setPeriod(p.period);
        setLocationName(p.location);
        setStep(2); // In real flow, usually triggers sync first, but assuming we jump to draft for this period
     } else {
        // Read only view for sent items - for prototype, we'll just open the same view but maybe read-only? 
        // Or just let them edit it again for the prototype sake.
        setPeriod(p.period);
        setLocationName(p.location);
        setStep(2);
     }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStep(2);
      toast({
        title: "Sync Complete",
        description: "Financial data retrieved from QuickBooks.",
      });
    }, 2000);
  };

  const handleRelease = () => {
    setShowReleaseModal(true);
  };

  const confirmRelease = () => {
    setShowReleaseModal(false);
    
    // Simulate release by setting a flag (in a real app this would be a backend call)
    localStorage.setItem("munch_pnl_released", "true");
    localStorage.setItem("munch_pnl_period", period);
    
    toast({
      title: "P&L Released",
      description: "Owner has been notified via email and app.",
    });
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      setLocation("/insight/home");
    }, 1000);
  };

  // --- Owner View (Customer Facing) ---
  if (isOwnerView) {
     return (
        <Layout>
           <div className="min-h-screen bg-gray-50 flex overflow-hidden">
              {/* Main Content Area - Shrinks when chat is open */}
              <div className={cn(
                  "flex-1 flex justify-center overflow-y-auto transition-all duration-300",
                  showChat ? "mr-[400px]" : ""
              )}>
                 <div className="w-full max-w-3xl bg-white shadow-sm border-x border-gray-200 min-h-screen pb-32">
                    {/* Email-like / Mobile-first Header */}
                    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <button onClick={() => setLocation("/")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                             <ArrowLeft className="h-5 w-5 text-gray-500" />
                          </button>
                          <div>
                             <h1 className="font-serif text-lg font-bold text-gray-900">{period} Report</h1>
                             <p className="text-xs text-muted-foreground">{locationName}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                             onClick={() => setShowChat(!showChat)}
                             className={cn("p-2 rounded-full transition-colors", showChat ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-50")}
                          >
                             <Sparkles className="h-5 w-5" />
                          </button>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full">
                                 <Download className="h-5 w-5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-1" align="end">
                              <div className="grid gap-1">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-md transition-colors">
                                  <File className="h-4 w-4 text-red-500" />
                                  <span>Download PDF</span>
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-md transition-colors">
                                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                  <span>Download Excel</span>
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                       </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                       {/* Headline */}
                       <div>
                          <h2 className="text-3xl font-serif font-medium leading-tight text-gray-900 mb-4">
                             {headline}
                          </h2>
                          
                          {/* CTA Prompt */}
                          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-gray-100 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                               onClick={() => setShowChat(true)}
                          >
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                                   <Sparkles className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Why did food costs increase?</span>
                             </div>
                             <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                          </div>
                       </div>

                       {/* Key Stats Grid */}
                       <div className="grid grid-cols-3 gap-3">
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Revenue</div>
                          <div className="text-2xl font-serif text-gray-900">$124.5k</div>
                          <div className="text-xs text-emerald-600 font-medium mt-1">↑ 5.3% vs forecast</div>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Margin</div>
                          <div className="text-2xl font-serif text-emerald-600">9.2%</div>
                          <div className="text-xs text-emerald-600 font-medium mt-1">↑ 2.1% vs last month</div>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vs Last Month</div>
                          <div className="text-2xl font-serif text-emerald-600">+$5.4k</div>
                          <div className="text-xs text-gray-500 font-medium mt-1">Net Income Growth</div>
                       </div>
                    </div>

                    {/* Note */}
                    <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 flex gap-4">
                       <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold font-serif flex-shrink-0">
                          H
                       </div>
                       <div>
                          <div className="font-bold text-sm text-emerald-900 mb-1">Note from Henry</div>
                          <p className="text-emerald-800 text-sm leading-relaxed italic">
                             "{note || "Great work keeping labor in check this month. Let's keep an eye on food costs next period."}"
                          </p>
                       </div>
                    </div>

                    {/* Insights List */}
                    <div className="space-y-4">
                       <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Key Insights</h3>
                       {insights.map((insight) => (
                          <div key={insight.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                             <div className={cn(
                                "w-1 h-auto rounded-full flex-shrink-0",
                                insight.tag === "Positive" ? "bg-emerald-500" : 
                                insight.tag === "Negative" ? "bg-red-500" : "bg-gray-300"
                             )} />
                             <div>
                                <p className="text-gray-800 leading-relaxed text-sm">{insight.text}</p>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Visualizations (Read Only) */}
                    <div className="space-y-6">
                       {visualizations.breakdown && (
                          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                             <h3 className="font-medium text-sm text-gray-900 mb-4">Cost Breakdown</h3>
                             <div className="h-48 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                   <RechartsPieChart>
                                      <Pie
                                         data={categoryData}
                                         innerRadius={50}
                                         outerRadius={70}
                                         paddingAngle={5}
                                         dataKey="value"
                                      >
                                         {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                         ))}
                                      </Pie>
                                      <Tooltip />
                                   </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="ml-4 space-y-2">
                                   {categoryData.map((cat, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs">
                                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                         <span className="text-gray-600">{cat.name}</span>
                                         <span className="font-medium">{cat.value}%</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}

                       {visualizations.trend && (
                          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                             <h3 className="font-medium text-sm text-gray-900 mb-6">Margin Trend (6 Mo)</h3>
                             <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={trendData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} tick={{fontSize: 12}} />
                                      <Tooltip />
                                      <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                                   </LineChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                       )}

                       {visualizations.variance && (
                          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                             <h3 className="font-medium text-sm text-gray-900 mb-6">Variance Highlights</h3>
                             <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={[
                                      { name: "Labor", val: 2649 },
                                      { name: "COGS", val: -3135 },
                                      { name: "Revenue", val: 6300 },
                                   ]} layout="vertical" margin={{ left: 40 }}>
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12}} width={60} />
                                      <Tooltip cursor={{fill: 'transparent'}} />
                                      <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={20}>
                                        {
                                          [
                                            { name: "Labor", val: 2649 },
                                            { name: "COGS", val: -3135 },
                                            { name: "Revenue", val: 6300 },
                                          ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.val > 0 ? "#10b981" : "#ef4444"} />
                                          ))
                                        }
                                      </Bar>
                                   </BarChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Full Table */}
                    <div className="border-t border-gray-100 pt-8">
                       <button 
                          onClick={() => setShowFullPnl(!showFullPnl)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
                       >
                          <span className="font-medium text-sm flex items-center gap-2">
                             <FileText className="h-4 w-4 text-gray-500" /> Full P&L Detail
                          </span>
                          {showFullPnl ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                       </button>
                       
                       {showFullPnl && (
                          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-medium">
                                   <tr>
                                      <th className="px-4 py-3">Category</th>
                                      <th className="px-4 py-3 text-right">Current</th>
                                      <th className="px-4 py-3 text-right">Var</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                   {pnlData.map((row) => (
                                      <tr key={row.category} className={cn("hover:bg-gray-50", row.category === "Net Income" ? "bg-gray-50 font-bold" : "")}>
                                         <td className="px-4 py-3 font-medium">{row.category}</td>
                                         <td className="px-4 py-3 text-right">${row.current.toLocaleString()}</td>
                                         <td className={cn("px-4 py-3 text-right font-medium", row.variance > 0 ? "text-emerald-600" : "text-red-600")}>
                                            {row.variance > 0 ? "+" : ""}{row.variance.toLocaleString()}
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Split Screen Chat Interface */}
           {showChat && <OwnerChat isOpen={showChat} onClose={() => setShowChat(false)} />}
        </div>
      </Layout>
     );
  }

  // --- Step 1: P&L List Table ---
  if (step === 1) {
    return (
      <Layout>
         <div className="flex flex-col h-full bg-gray-50/30">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">P&L Release</h1>
                     <p className="text-sm text-muted-foreground">Manage and release monthly financial packages to location owners.</p>
                  </div>
                  <button 
                     onClick={() => {
                        setPeriod("November 2024");
                        setStep(2);
                     }}
                     className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                  >
                     <Plus className="h-4 w-4" /> Start New Release
                  </button>
               </div>

               {/* Filters Bar */}
               <div className="flex flex-wrap gap-3 items-center">
                  <PnLFilter 
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    activePreset={datePreset}
                    onPresetChange={setDatePreset}
                    selectedStatuses={selectedStatuses}
                    onStatusChange={setSelectedStatuses}
                    selectedOwners={selectedOwners}
                    onOwnerChange={setSelectedOwners}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />

                  <div className="ml-auto flex gap-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                           type="text" 
                           placeholder="Search periods..." 
                           className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-8">
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-4 font-semibold text-gray-900">Period</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Location</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Sent Date</th>
                           <th className="px-6 py-4 font-semibold text-gray-900">Owner Status</th>
                           <th className="px-6 py-4"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredPeriods.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No periods found matching your filters.
                                </td>
                            </tr>
                        ) : filteredPeriods.map((item) => (
                           <tr 
                              key={item.id} 
                              onClick={() => handlePeriodClick(item)}
                              className="hover:bg-gray-50 transition-colors cursor-pointer group"
                           >
                              <td className="px-6 py-4 font-medium text-gray-900">{item.period}</td>
                              <td className="px-6 py-4 text-gray-600">{item.location}</td>
                              <td className="px-6 py-4">
                                 {item.status === "Sent" ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                       <Check className="h-3 w-3" /> Sent
                                    </span>
                                 ) : item.status === "Draft" ? (
                                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                       <FileText className="h-3 w-3" /> Draft
                                     </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                                       <Sparkles className="h-3 w-3" /> Ready to Sync
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                 {item.sentDate || "—"}
                              </td>
                              <td className="px-6 py-4">
                                 {item.viewed ? (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Viewed
                                    </span>
                                 ) : item.status === "Sent" ? (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                       <div className="h-1.5 w-1.5 rounded-full bg-gray-300" /> Unread
                                    </span>
                                 ) : (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-gray-200" /> {item.owner}
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-md transition-all text-gray-400 hover:text-black">
                                    <ChevronRight className="h-4 w-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               <div className="mt-4 flex justify-between text-xs text-gray-500 px-2">
                  <span>Showing {filteredPeriods.length} entries</span>
                  <div className="flex gap-2">
                     <button className="hover:text-gray-900 disabled:opacity-50" disabled>Previous</button>
                     <span>Page 1 of 1</span>
                     <button className="hover:text-gray-900 disabled:opacity-50" disabled>Next</button>
                  </div>
               </div>
            </div>
         </div>
      </Layout>
    );
  }

  // --- Step 2: Review AI Package ---
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">Draft</span>
                 <span className="text-xs text-muted-foreground">{locationName}</span>
              </div>
              <h1 className="font-serif text-2xl font-medium">{period} P&L</h1>
            </div>
            <div className="flex items-center gap-3">
               <button className="text-sm text-muted-foreground hover:text-black font-medium px-3 py-2">Save Draft</button>
               <button 
                 onClick={handleRelease}
                 className="text-sm text-white bg-black hover:bg-gray-800 font-medium px-6 py-2 rounded-md flex items-center gap-2 shadow-sm"
               >
                  Release <Send className="h-3 w-3" />
               </button>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-6">
            <HoverTOC targetIds={[
               { id: "section-executive-summary", label: "Executive Narrative" },
               { id: "section-key-stats", label: "Key Stats" },
               { id: "section-key-insights", label: "Key Insights" },
               { id: "section-accountant-note", label: "Accountant's Note" },
               { id: "section-visualizations", label: "Visualizations" },
               { id: "section-full-pnl", label: "Full P&L Details" },
            ]}>
              <button 
                  onClick={() => setActiveView('detailed')}
                  className={cn(
                      "pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2", 
                      activeView === 'detailed' ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-900"
                  )}
              >
                  <FileText className="h-4 w-4" /> Detailed View <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
            </HoverTOC>
            <button 
                onClick={() => setActiveView('curated')}
                className={cn(
                    "pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2", 
                    activeView === 'curated' ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-900"
                )}
            >
                <LayoutDashboard className="h-4 w-4" /> Curated View
            </button>
          </div>
        </header>

        {/* Release Modal (New) */}
        <ReleaseModal 
           isOpen={showReleaseModal} 
           onClose={() => setShowReleaseModal(false)} 
           onConfirm={confirmRelease}
           data={{
              period,
              headline,
              insights,
              note
           }} 
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {activeView === 'curated' ? (
               <CuratedView role={userRole} onRoleChange={setUserRole} />
            ) : (
               <>
            
            {/* Section A: Executive Narrative */}
            <div id="section-executive-summary">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Executive Narrative</h3>
                 <button className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-medium flex items-center gap-1 hover:bg-amber-100 transition-colors">
                    <div className="h-3 w-3 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">?</div> Learn
                 </button>
               </div>
               
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex gap-4">
                     <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-gray-500" />
                     </div>
                     <div>
                        <h4 className="font-serif text-lg font-medium text-gray-900 mb-2">Performance Summary</h4>
                        <p className="text-gray-600 leading-relaxed text-sm">
                           {(() => {
                              const rev = pnlData.find(d => d.category === "Revenue");
                              const ni = pnlData.find(d => d.category === "Net Income");
                              const lab = pnlData.find(d => d.category === "Labor");
                              const cogs = pnlData.find(d => d.category === "COGS");
                              
                              if (!rev || !ni || !lab || !cogs) return "Data incomplete.";

                              const margin = (ni.current / rev.current) * 100;
                              const prime = ((lab.current + cogs.current) / rev.current) * 100;
                              
                              return (
                                 <>
                                    {period.split(' ')[0]} net income came in at <span className="font-medium text-gray-900">${ni.current.toLocaleString()}</span> ({margin.toFixed(1)}% margin), {ni.variance > 0 ? "beating" : "missing"} budget by ${Math.abs(ni.variance).toLocaleString()}. 
                                    Strong holiday traffic drove <span className="font-medium text-amber-700">revenue</span> {rev.pct}% {rev.pct > 0 ? "above" : "below"} forecast, 
                                    though <span className="font-medium text-amber-700">labor costs</span> ran {lab.variance > 0 ? "hot" : "efficiently"} during the final two weeks. 
                                    <span className="font-medium text-amber-700">Prime cost</span> landed at {prime.toFixed(1)}%—{prime < 60 ? "within target" : "slightly elevated"} but worth watching as January staffing decisions are made.
                                 </>
                              );
                           })()}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Section B: Key Stats */}
            <div id="section-key-stats">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Key Stats</h3>
               <div className="grid grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Net Revenue</div>
                      <div className="text-3xl font-serif text-gray-900">$124.5k</div>
                      <div className="text-sm text-emerald-600 font-medium mt-1">↑ 5.3% vs forecast</div>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Net Margin</div>
                      <div className="text-3xl font-serif text-emerald-600">9.2%</div>
                      <div className="text-sm text-emerald-600 font-medium mt-1">↑ 2.1% vs last month</div>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Vs Last Month</div>
                      <div className="text-3xl font-serif text-emerald-600">+$5.4k</div>
                      <div className="text-sm text-gray-500 font-medium mt-1">Net Income Growth</div>
                   </div>
               </div>
            </div>

            {/* Section C: Key Insights */}
            <div id="section-key-insights">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Key Insights</h3>
                  <button 
                    onClick={() => setInsights([...insights, { id: Date.now(), text: "New insight...", tag: "Neutral" }])}
                    className="text-xs flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                     <Plus className="h-3 w-3" /> Add Insight
                  </button>
               </div>
               <div className="grid gap-4">
                  {insights.map((insight, idx) => (
                    <InsightCard 
                      key={insight.id} 
                      insight={insight} 
                      onDelete={() => setInsights(insights.filter(i => i.id !== insight.id))}
                      onUpdate={(text) => {
                        const newInsights = [...insights];
                        newInsights[idx].text = text;
                        setInsights(newInsights);
                      }}
                    />
                  ))}
               </div>
            </div>

            {/* Section D: Accountant's Note */}
            <div id="section-accountant-note">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Note from Accountant</h3>
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <textarea 
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     placeholder="Any strategic context or recommendations..."
                     className="w-full text-sm border-gray-200 rounded-lg focus:ring-black focus:border-black p-3 min-h-[100px]"
                  />
                  <div className="flex justify-between items-center mt-2">
                     <span className="text-xs text-muted-foreground">Will appear as "Note from Henry at Chubby Group"</span>
                  </div>
               </div>
            </div>

            {/* Section D: Visualizations */}
            <div id="section-visualizations">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Visualizations</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Breakdown */}
                  <VisualizationCard 
                    title="Category Breakdown" 
                    active={visualizations.breakdown} 
                    onToggle={() => setVisualizations({...visualizations, breakdown: !visualizations.breakdown})}
                  >
                     <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                     </ResponsiveContainer>
                  </VisualizationCard>

                  {/* Chart 2: Monthly Trend */}
                  <VisualizationCard 
                    title="Net Margin Trend (6mo)" 
                    active={visualizations.trend} 
                    onToggle={() => setVisualizations({...visualizations, trend: !visualizations.trend})}
                  >
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                          <Tooltip />
                          <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                        </LineChart>
                     </ResponsiveContainer>
                  </VisualizationCard>

                  {/* Chart 3: Variance Table */}
                  <div className="md:col-span-2">
                     <VisualizationCard 
                       title="Variance Highlights" 
                       active={visualizations.variance} 
                       onToggle={() => setVisualizations({...visualizations, variance: !visualizations.variance})}
                     >
                        <div className="w-full text-sm">
                           <div className="flex justify-between pb-2 border-b border-gray-100 font-medium text-gray-500 text-xs uppercase tracking-wider">
                              <span>Category</span>
                              <span>Variance</span>
                           </div>
                           <div className="space-y-3 mt-3">
                              <div className="flex justify-between items-center">
                                 <span>Produce (COGS)</span>
                                 <span className="text-red-600 font-medium">+$1,240</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span>FOH Labor</span>
                                 <span className="text-emerald-600 font-medium">-$850</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span>Repairs & Maint.</span>
                                 <span className="text-red-600 font-medium">+$420</span>
                              </div>
                           </div>
                        </div>
                     </VisualizationCard>
                  </div>

               </div>
            </div>

            {/* Section E: Fully Collapsible P&L Dashboard */}
            <div id="section-full-pnl">
               <PnLDashboard />
            </div>
            
            <div className="h-12"></div> {/* Spacer */}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Step 3: Release Confirmation Modal (REMOVED - Replaced by ReleaseModal) */}
    </Layout>
  );
}
