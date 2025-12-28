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
  X 
} from "lucide-react";
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

// --- Mock Data ---

const pnlPeriods = [
  { id: "oct-24", period: "October 2024", location: "Little Mo BK", status: "Ready to Sync", sentDate: null, viewed: false },
  { id: "sep-24", period: "September 2024", location: "Little Mo BK", status: "Sent", sentDate: "Oct 15, 2024", viewed: true },
  { id: "aug-24", period: "August 2024", location: "Little Mo BK", status: "Sent", sentDate: "Sep 12, 2024", viewed: true },
  { id: "jul-24", period: "July 2024", location: "Little Mo BK", status: "Sent", sentDate: "Aug 14, 2024", viewed: true },
  { id: "jun-24", period: "June 2024", location: "Little Mo BK", status: "Sent", sentDate: "Jul 10, 2024", viewed: false },
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

// --- Main Page Component ---

export default function PnlRelease() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [locationName, setLocationName] = useState("Little Mo BK");
  const [period, setPeriod] = useState("October 2024");
  
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
      setLocation("/");
    }, 1000);
  };

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
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 text-gray-700">
                     <span>Little Mo BK</span>
                     <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                  
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 text-gray-700">
                     <Calendar className="h-4 w-4 text-gray-500" />
                     <span>Last 6 Months</span>
                     <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>

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
                        {pnlPeriods.map((item) => (
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
                                    <span className="text-gray-300">—</span>
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
                  <span>Showing {pnlPeriods.length} entries</span>
                  <div className="flex gap-2">
                     <button className="hover:text-gray-900 disabled:opacity-50">Previous</button>
                     <span>Page 1 of 1</span>
                     <button className="hover:text-gray-900 disabled:opacity-50">Next</button>
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
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
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
            
            {/* Section A: AI Headline */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm group relative">
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-600" /> AI Generated
                  </span>
               </div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Executive Summary</label>
               <textarea 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-3xl md:text-4xl font-serif font-medium leading-tight border-none p-0 focus:ring-0 resize-none bg-transparent placeholder:text-gray-300"
                  rows={2}
               />
            </div>

            {/* Section B: Key Insights */}
            <div>
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

            {/* Section C: Accountant's Note */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <label className="block text-sm font-medium text-gray-900 mb-2">Add a note for the owner</label>
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

            {/* Section D: Visualizations */}
            <div>
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

            {/* Section E: Full P&L Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
               <button 
                 onClick={() => setShowFullPnl(!showFullPnl)}
                 className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
               >
                  <span className="font-medium text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" /> View Full P&L Details
                  </span>
                  {showFullPnl ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
               </button>
               
               {showFullPnl && (
                 <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                          <tr>
                             <th className="px-6 py-4">Category</th>
                             <th className="px-6 py-4 text-right">Current</th>
                             <th className="px-6 py-4 text-right">Prior Period</th>
                             <th className="px-6 py-4 text-right">Variance</th>
                             <th className="px-6 py-4 text-right">%</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {pnlData.map((row) => (
                             <tr key={row.category} className={cn("hover:bg-gray-50 transition-colors", row.category === "Net Income" ? "bg-gray-50 font-bold" : "")}>
                                <td className="px-6 py-4 font-medium">{row.category}</td>
                                <td className="px-6 py-4 text-right">${row.current.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-gray-500">${row.prior.toLocaleString()}</td>
                                <td className={cn("px-6 py-4 text-right font-medium", row.variance > 0 ? (row.category === "Revenue" || row.category === "Net Income" ? "text-emerald-600" : "text-red-600") : (row.category === "Revenue" || row.category === "Net Income" ? "text-red-600" : "text-emerald-600"))}>
                                   {row.variance > 0 ? "+" : ""}{row.variance.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500">{row.pct}%</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
            </div>
            
            <div className="h-12"></div> {/* Spacer */}

          </div>
        </div>
      </div>

      {/* Step 3: Release Confirmation Modal (REMOVED - Replaced by ReleaseModal) */}
    </Layout>
  );
}
