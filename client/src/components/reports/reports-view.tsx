
import React from "react";
import { ReportData, MOCK_REPORTS, ReportType } from "./mock-data";
import { ReportContent } from "./report-content";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, ArrowRight, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsViewProps {
  reports: Array<{id: string, type: string, data: ReportData, createdAt: number}>;
  activeReportId: string | null;
  onSelectReport: (id: string | null) => void;
  onGenerateReport: (type: ReportType) => void;
}

export function ReportsView({ reports, activeReportId, onSelectReport, onGenerateReport }: ReportsViewProps) {
  const activeReport = reports.find(r => r.id === activeReportId);

  // If a report is active, show it
  if (activeReport) {
    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Sidebar List (Collapsible on mobile maybe, but fine for desktop) */}
            <div className="w-80 border-r border-gray-200 bg-white h-full overflow-y-auto hidden md:block">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-serif font-bold text-gray-900">Reports</h2>
                </div>
                <div className="p-2 space-y-1">
                     <button
                        onClick={() => onSelectReport(null)}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                     >
                        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Overview
                     </button>
                    {reports.map(report => (
                        <button
                            key={report.id}
                            onClick={() => onSelectReport(report.id)}
                            className={cn(
                                "w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border",
                                activeReportId === report.id
                                    ? "bg-indigo-50 border-indigo-100 text-indigo-900 shadow-sm"
                                    : "bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                            )}
                        >
                            <div className="font-medium truncate">{report.data.title}</div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto h-full p-8">
                 <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[80vh]">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <div>
                            <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> AI Generated Report
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{activeReport.data.title}</h1>
                            <div className="text-sm text-gray-500">
                                {activeReport.data.dateRange} • {activeReport.data.entity}
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            Generated {new Date(activeReport.createdAt).toLocaleString()}
                        </div>
                     </div>
                     <ReportContent data={activeReport.data} />
                 </div>
            </div>
        </div>
    );
  }

  // Default State: List or Empty
  return (
    <div className="max-w-5xl mx-auto p-8 h-full">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Reports</h1>
            {/* Generate CTA */}
            {reports.length > 0 && (
                <Button 
                    onClick={() => onGenerateReport('profitability')} 
                    className="bg-black text-white hover:bg-gray-800"
                >
                    <Sparkles className="h-4 w-4 mr-2" /> Generate New Report
                </Button>
            )}
        </div>

        {reports.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                    <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">No reports yet</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    Generate a report to analyze your P&L performance, track trends, and identify opportunities for improvement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    <button 
                        onClick={() => onGenerateReport('profitability')}
                        className="group flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="p-2 bg-emerald-50 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-900 mb-1">Profitability Analysis</span>
                        <span className="text-xs text-gray-500">Deep dive into margins and profit drivers</span>
                    </button>
                     <button 
                        onClick={() => onGenerateReport('labor')}
                        className="group flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="p-2 bg-blue-50 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 mb-1">Labor Efficiency</span>
                        <span className="text-xs text-gray-500">Analyze staffing costs and productivity</span>
                    </button>
                </div>
            </div>
        ) : (
            // Report List Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <button
                        key={report.id}
                        onClick={() => onSelectReport(report.id)}
                        className="group flex flex-col bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all text-left h-full"
                    >
                        <div className="flex items-start justify-between w-full mb-4">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                <FileText className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                            {report.data.title}
                        </h3>
                         <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
                            {report.data.summary[0]}
                        </p>
                        <div className="flex items-center text-sm font-medium text-indigo-600 mt-auto group-hover:translate-x-1 transition-transform">
                            View Report <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                    </button>
                ))}
            </div>
        )}
    </div>
  );
}
