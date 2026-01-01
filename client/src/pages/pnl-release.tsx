import React, { useState, useEffect } from "react";
import Layout from "@/components/layout";
import confetti from "canvas-confetti";
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
  Target,
  Trophy,
  AlertTriangle,
  ArrowUp,
  ArrowDown
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

const navigationYears = [
  { year: 2024, months: ["October", "September", "August", "July", "June", "May"] },
  { year: 2023, months: ["December", "November", "October", "September"] }
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

function GoalProgress({ label, current, target, unit = "%", inverted = false }: { label: string, current: number, target: number, unit?: string, inverted?: boolean }) {
  const progress = Math.min((current / target) * 100, 100);
  const isGood = inverted ? current <= target : current >= target;
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-all">
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif">{current}{unit}</span>
            <span className="text-xs text-muted-foreground mb-1">/ {target}{unit} Goal</span>
          </div>
        </div>
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
          isGood ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}>
          {isGood ? <Check className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
        </div>
      </div>
      
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative z-10">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", isGood ? "bg-emerald-500" : "bg-red-500")}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isGood && (
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
          <Trophy className="h-24 w-24 text-emerald-500 transform rotate-12" />
        </div>
      )}
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
    } else if (text.toLowerCase().includes("email")) {
       responseText = "Drafting email to the team:\n\nSubject: Great work on Labor!\n\nTeam,\n\nI wanted to highlight the excellent work on managing labor costs this month. Thanks to the optimized scheduling on Tues/Wed, we beat our efficiency goals by 6%. Let's keep this momentum going!\n\nBest,\nOwner";
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
                   "max-w-[85%] py-2 px-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
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
  const [goalsMet, setGoalsMet] = useState(true); // Mock state for confetti
  
  useEffect(() => {
    if (isOwnerView && goalsMet) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOwnerView, goalsMet]);

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
              
              {/* Left Navigation (Google Docs Style) */}
              <div className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col h-full overflow-y-auto">
                 <div className="p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Report Archive</h2>
                    <div className="space-y-6">
                       {navigationYears.map((group) => (
                          <div key={group.year}>
                             <h3 className="text-sm font-serif font-bold text-gray-900 mb-2">{group.year}</h3>
                             <div className="space-y-1">
                                {group.months.map((m) => {
                                   const isCurrent = group.year === 2024 && m === "October";
                                   const isGoalMet = Math.random() > 0.5; // Mock data
                                   
                                   return (
                                      <button 
                                         key={m}
                                         className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                            isCurrent ? "bg-emerald-50 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                                         )}
                                      >
                                         <span>{m}</span>
                                         {isGoalMet && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Goals Met" />
                                         )}
                                      </button>
                                   );
                                })}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Main Content Area - Shrinks when chat is open */}
              <div className={cn(
                  "flex-1 flex justify-center overflow-y-auto transition-all duration-300",
                  showChat ? "mr-[400px]" : ""
              )}>
                 <div className="w-full max-w-4xl bg-white shadow-sm border-x border-gray-200 min-h-screen pb-32">
                    {/* Header */}
                    <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
                       <div className="flex items-center gap-4">
                          <button onClick={() => setLocation("/insight/home")} className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                             <ArrowLeft className="h-5 w-5" />
                          </button>
                          <div>
                             <h1 className="font-serif text-xl font-bold text-gray-900">{period} Report</h1>
                             <p className="text-xs text-muted-foreground flex items-center gap-2">
                                {locationName} <span className="w-1 h-1 rounded-full bg-gray-300" /> Prepared by Accountant
                             </p>
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

                    <div className="p-8 space-y-10">
                       
                       {/* 1. Goal Summary Section */}
                       <section>
                          <div className="flex items-center gap-3 mb-6">
                             <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Target className="h-5 w-5" />
                             </div>
                             <div>
                                <h2 className="text-lg font-serif font-bold text-gray-900">Goal Progress</h2>
                                <p className="text-sm text-muted-foreground">Tracking against your monthly targets</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <GoalProgress label="Prime Cost (COGS + Labor)" current={58} target={60} inverted />
                             <GoalProgress label="Monthly Sales" current={124.5} target={118} unit="k" />
                          </div>
                       </section>

                       {/* 2. Key Insights Breakdown */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <TrendingUp className="h-5 w-5 text-black" /> Performance Analysis
                          </h3>
                          
                          <div className="grid gap-4">
                             <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                                <h4 className="font-medium text-emerald-900 mb-3 flex items-center gap-2">
                                   <ArrowUp className="h-4 w-4" /> Wins (What's working)
                                </h4>
                                <ul className="space-y-3">
                                   <li className="flex gap-3 text-sm text-gray-700">
                                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <span>Labor efficiency improved: <strong>Dinner shifts on Tue/Wed</strong> operated with 1 less runner, saving 40 hours.</span>
                                   </li>
                                   <li className="flex gap-3 text-sm text-gray-700">
                                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <span>Sales goal exceeded: <strong>$6.3k variance</strong> driven by strong weekend brunch traffic.</span>
                                   </li>
                                </ul>
                             </div>

                             <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                                <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                                   <AlertTriangle className="h-4 w-4" /> Opportunities (Where we lost out)
                                </h4>
                                <ul className="space-y-3">
                                   <li className="flex gap-3 text-sm text-gray-700">
                                      <ArrowDown className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <span>COGS spike in Produce: <strong>Avocados & Limes</strong> prices increased 15%. (Impact: -$1,200)</span>
                                   </li>
                                   <li className="flex gap-3 text-sm text-gray-700">
                                      <ArrowDown className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <span>Overtime hours: Kitchen prep hit <strong>12 hours overtime</strong> due to late delivery arrival on 10/14.</span>
                                   </li>
                                </ul>
                             </div>
                          </div>
                       </section>

                       {/* 3. Shopping Cart / Impact Analysis */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">Impact Analysis</h3>
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                             <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">If you had adjusted these items...</span>
                                <span className="text-xs text-muted-foreground">Est. Margin Impact</span>
                             </div>
                             <div className="divide-y divide-gray-100">
                                <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setShowChat(true)}>
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                         <X className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">Cut 10hrs of Prep Overtime</p>
                                         <p className="text-xs text-muted-foreground">Kitchen Staff • Oct 14</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className="text-sm font-medium text-emerald-600">+$350</span>
                                      <span className="text-xs text-gray-400 block group-hover:text-black transition-colors">Ask AI why →</span>
                                   </div>
                                </div>
                                <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setShowChat(true)}>
                                   <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                         <X className="h-4 w-4" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-medium text-gray-900">Switch Avocado Supplier</p>
                                         <p className="text-xs text-muted-foreground">COGS • Produce</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className="text-sm font-medium text-emerald-600">+$800</span>
                                      <span className="text-xs text-gray-400 block group-hover:text-black transition-colors">Ask AI for options →</span>
                                   </div>
                                </div>
                             </div>
                             <div className="p-4 bg-emerald-50/30 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900">Potential Net Income Increase</span>
                                <span className="text-lg font-serif font-bold text-emerald-700">+$1,150</span>
                             </div>
                          </div>
                       </section>

                       {/* 4. Team Context & Links */}
                       <section>
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">Team Context</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Manager Goals</h4>
                                <p className="text-xs text-gray-600 mb-3">Sarah met her "Labor Efficiency" goal this month.</p>
                                <div className="flex items-center gap-2">
                                   <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">S</div>
                                   <span className="text-xs font-medium text-emerald-600">Bonus Eligible</span>
                                </div>
                             </div>
                             <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Staff Upsell</h4>
                                <p className="text-xs text-gray-600 mb-3">FOH team achieved 18% upsell rate on specials.</p>
                                <div className="flex items-center gap-2">
                                   <TrendingUp className="h-4 w-4 text-emerald-500" />
                                   <span className="text-xs font-medium text-emerald-600">+4.2% vs Last Month</span>
                                </div>
                             </div>
                          </div>
                       </section>

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
                                       <Loader2 className="h-3 w-3" /> Ready
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-gray-500">{item.sentDate || "—"}</td>
                              <td className="px-6 py-4">
                                 {item.viewed ? (
                                    <span className="text-gray-900 text-xs font-medium">Viewed by Owner</span>
                                 ) : (
                                    <span className="text-gray-400 text-xs">Not viewed</span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors ml-auto" />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </Layout>
    );
  }

  // --- Step 2: Accountant View (Editing) ---
  return (
    <Layout>
       <div className="flex h-full bg-gray-50">
          
          {/* Main Editing Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             
             {/* Toolbar */}
             <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <button onClick={() => setStep(1)} className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                      <ArrowLeft className="h-5 w-5" />
                   </button>
                   <div>
                      <h1 className="font-serif text-xl font-bold text-gray-900">{period} Report</h1>
                      <p className="text-xs text-muted-foreground">{locationName} • Draft</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   {isSyncing ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                         <Loader2 className="h-4 w-4 animate-spin" />
                         Syncing with QuickBooks...
                      </div>
                   ) : (
                      <button 
                         onClick={handleSync}
                         className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                         <RefreshCw className="h-4 w-4" /> Sync Data
                      </button>
                   )}
                   <div className="h-6 w-px bg-gray-200" />
                   <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                      <Save className="h-4 w-4" /> Save Draft
                   </button>
                   <button 
                      onClick={handleRelease}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                   >
                      Review & Send <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                   
                   {/* 1. Headline & Summary */}
                   <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Executive Summary</h2>
                      
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Headline (Auto-generated)</label>
                            <textarea 
                               value={headline}
                               onChange={(e) => setHeadline(e.target.value)}
                               className="w-full text-lg font-serif font-medium text-gray-900 border-0 border-b border-gray-200 focus:border-black focus:ring-0 px-0 py-2 resize-none bg-transparent placeholder:text-gray-300"
                               rows={2}
                            />
                         </div>

                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-3">Key Insights</label>
                            <div className="space-y-3">
                               {insights.map((insight) => (
                                  <InsightCard 
                                    key={insight.id} 
                                    insight={insight} 
                                    onDelete={() => setInsights(insights.filter(i => i.id !== insight.id))}
                                    onUpdate={(val) => setInsights(insights.map(i => i.id === insight.id ? { ...i, text: val } : i))}
                                  />
                               ))}
                               <button 
                                 onClick={() => setInsights([...insights, { id: Date.now(), text: "New insight...", tag: "Neutral" }])}
                                 className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1"
                               >
                                  <Plus className="h-4 w-4" /> Add Insight
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* 2. Visualizations */}
                   <div className="grid grid-cols-2 gap-6">
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

                      <VisualizationCard 
                        title="Margin Trend" 
                        active={visualizations.trend}
                        onToggle={() => setVisualizations({...visualizations, trend: !visualizations.trend})}
                      >
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                               <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                               <YAxis hide domain={[0, 15]} />
                               <Tooltip />
                               <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} dot={{r: 4, fill: "#10b981"}} />
                            </LineChart>
                         </ResponsiveContainer>
                      </VisualizationCard>
                   </div>

                   {/* 3. Financial Table Preview */}
                   <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                         <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Financial Highlights</h2>
                         <button className="text-xs text-gray-500 hover:text-black">Edit Data</button>
                      </div>
                      <table className="w-full text-sm text-left">
                         <thead className="text-xs text-gray-500 uppercase font-medium bg-gray-50/50">
                            <tr>
                               <th className="px-6 py-3">Category</th>
                               <th className="px-6 py-3 text-right">Current</th>
                               <th className="px-6 py-3 text-right">Prior Month</th>
                               <th className="px-6 py-3 text-right">Variance</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {pnlData.map((row) => (
                               <tr key={row.category} className={cn("hover:bg-gray-50", row.category === "Net Income" ? "font-bold bg-gray-50" : "")}>
                                  <td className="px-6 py-4 font-medium">{row.category}</td>
                                  <td className="px-6 py-4 text-right">${row.current.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right text-gray-500">${row.prior.toLocaleString()}</td>
                                  <td className={cn("px-6 py-4 text-right font-medium", row.variance > 0 ? "text-emerald-600" : "text-red-600")}>
                                     {row.variance > 0 ? "+" : ""}{row.variance.toLocaleString()}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>

                   {/* 4. Accountant Note */}
                   <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Note from Accountant</h2>
                      <textarea 
                         value={note}
                         onChange={(e) => setNote(e.target.value)}
                         placeholder="Add any specific context, action items, or clarifications..."
                         className="w-full text-sm border border-gray-200 rounded-lg p-4 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                   </div>

                </div>
             </div>
          </div>

          {/* Right Sidebar: AI Assist */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
             <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                   <Sparkles className="h-4 w-4 text-emerald-600" />
                   <h2 className="font-serif font-bold text-gray-900">AI Analysis</h2>
                </div>
             </div>
             <div className="flex-1 overflow-auto p-4 space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4 text-sm text-emerald-900 border border-emerald-100">
                   <strong>Insight:</strong> Labor is down 6.1% despite flat sales. This indicates improved scheduling efficiency.
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-900 border border-amber-100">
                   <strong>Alert:</strong> COGS in the Produce category is trending 8% higher than the 3-month average.
                </div>
                <div className="text-xs text-gray-500 text-center mt-4">
                   AI analyzes variances greater than 5% automatically.
                </div>
             </div>
          </div>

          <ReleaseModal 
             isOpen={showReleaseModal} 
             onClose={() => setShowReleaseModal(false)}
             data={{
                period,
                headline,
                insights
             }}
             onConfirm={confirmRelease}
          />
       </div>
    </Layout>
  );
}
