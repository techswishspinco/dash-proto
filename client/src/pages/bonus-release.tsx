import React, { useState } from "react";
import Layout from "@/components/layout";
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type BonusType = "upsell" | "manager";

interface BonusEntry {
  id: string;
  period: string;
  isApproved: boolean;
  totalBonus: number;
  salesBasis: number;
  exportedAt: string | null;
  status: "exported" | "pending" | "error";
}

const mockUpsellData: BonusEntry[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `upsell-${i}`,
  period: new Date(2025, 11, 28 - (i * 7)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " - " + new Date(2025, 11, 28 - (i * 7) + 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  isApproved: true,
  totalBonus: 150 + Math.random() * 500,
  salesBasis: 5000 + Math.random() * 2000,
  exportedAt: i < 5 ? null : new Date(2025, 11, 29 - i).toLocaleDateString(),
  status: i < 5 ? "pending" : "exported"
}));

const mockManagerData: BonusEntry[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `mgr-${i}`,
  period: new Date(2025, 11 - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  isApproved: true,
  totalBonus: 500 + Math.random() * 1000,
  salesBasis: 80000 + Math.random() * 20000,
  exportedAt: i < 3 ? null : new Date(2025, 11, 29 - i).toLocaleDateString(),
  status: i < 3 ? "pending" : "exported"
}));

export default function BonusRelease() {
  const [activeTab, setActiveTab] = useState<BonusType>("upsell");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  const getData = () => {
    switch (activeTab) {
      case "upsell": return mockUpsellData;
      case "manager": return mockManagerData;
    }
  };

  const data = getData();

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedEntries);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEntries(newSet);
  };

  const toggleAll = () => {
    if (selectedEntries.size === data.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(data.map(d => d.id)));
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50/30">
        
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Bonus Release</h1>
              <p className="text-sm text-muted-foreground">View calculated {activeTab} bonuses and export them to payroll.</p>
            </div>
          </div>

          {/* Bonus Type Switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
            <button
              onClick={() => setActiveTab("upsell")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === "upsell" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-gray-900"
              )}
            >
              Upsell Bonus
            </button>
            <button
              onClick={() => setActiveTab("manager")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === "manager" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-gray-900"
              )}
            >
              Manager Bonus
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 text-gray-700">
              <span>28-43 Jackson Ave</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Nov 28 - Dec 28, 2025</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>

            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 text-gray-700">
              <Download className="h-4 w-4 text-gray-500" />
              <span>Exported</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>

            <div className="ml-auto flex gap-3">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-black"
                 />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                 <span>Push to Payroll</span>
                 <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                   <tr>
                      <th className="px-6 py-4 w-12">
                         <input 
                           type="checkbox" 
                           checked={selectedEntries.size === data.length && data.length > 0}
                           onChange={toggleAll}
                           className="rounded border-gray-300 text-black focus:ring-black"
                         />
                      </th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Period ↓</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Approved?</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">Bonus Amount</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900">Sales Basis</th>
                      <th className="px-6 py-4 font-semibold text-gray-900">Exported At</th>
                      <th className="px-6 py-4"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {data.map((entry) => (
                     <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                           <input 
                             type="checkbox" 
                             checked={selectedEntries.has(entry.id)}
                             onChange={() => toggleSelection(entry.id)}
                             className="rounded border-gray-300 text-black focus:ring-black"
                           />
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">{entry.period}</td>
                        <td className="px-6 py-4">
                           {entry.isApproved ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                               <CheckCircle2 className="h-3 w-3" /> Yes
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                               <AlertCircle className="h-3 w-3" /> No
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-gray-600">${entry.totalBonus.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono text-gray-600">${entry.salesBasis.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500">
                           {entry.exportedAt ? (
                             entry.exportedAt
                           ) : (
                             <span className="text-gray-400 italic">Not exported</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-md transition-all text-gray-400 hover:text-black">
                              <ArrowUpRight className="h-4 w-4" />
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
          
          <div className="mt-4 flex justify-between text-xs text-gray-500 px-2">
             <span>Showing {data.length} entries</span>
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
