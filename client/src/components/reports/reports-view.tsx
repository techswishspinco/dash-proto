
import React, { useState } from "react";
import { ReportData, MOCK_REPORTS, ReportType } from "./mock-data";
import { ReportContent } from "./report-content";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, ArrowRight, Clock, ChevronRight, TrendingUp, ChevronLeft, PanelLeftClose, PanelLeftOpen, Search, Archive, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsViewProps {
  reports: Array<{
      id: string, 
      type: string, 
      data: ReportData, 
      createdAt: number,
      status: 'active' | 'archived',
      source?: 'manual' | 'curated_insight',
      role?: string
  }>;
  activeReportId: string | null;
  onSelectReport: (id: string | null) => void;
  onGenerateReport: (type: ReportType) => void;
  onArchiveReport: (id: string) => void;
  onRestoreReport: (id: string) => void;
}

export function ReportsView({ reports, activeReportId, onSelectReport, onGenerateReport, onArchiveReport, onRestoreReport }: ReportsViewProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const activeReport = reports.find(r => r.id === activeReportId);

  const filteredReports = reports.filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.data.title.toLowerCase().includes(q) || 
             r.type.toLowerCase().includes(q) ||
             (r.role && r.role.toLowerCase().includes(q));
  });

  const activeReportsList = filteredReports.filter(r => r.status !== 'archived');
  const archivedReportsList = filteredReports.filter(r => r.status === 'archived');

  // Helper for Sidebar List Item
  const SidebarItem = ({ report, isActive, onClick }: { report: any, isActive: boolean, onClick: () => void }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-3 py-3 rounded-lg text-sm transition-colors border relative",
                isActive
                    ? "bg-indigo-50 border-indigo-100 text-indigo-900 shadow-sm"
                    : "bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"
            )}
        >
            <div className="flex items-center justify-between mb-1">
                <div className="font-medium truncate pr-6">{report.data.title}</div>
                {report.status === 'archived' && (
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Archived</span>
                )}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
        </button>
        {report.status !== 'archived' && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onArchiveReport(report.id);
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Archive Report"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        )}
    </div>
  );

  // If a report is active, show it
  if (activeReport) {
    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Sidebar List */}
            <div 
                className={cn(
                    "border-r border-gray-200 bg-white h-full overflow-y-auto hidden md:block transition-all duration-300 ease-in-out relative flex flex-col",
                    isSidebarCollapsed ? "w-12" : "w-80"
                )}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute top-3 right-3 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                    title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>

                {isSidebarCollapsed ? (
                    // Collapsed View
                    <div className="flex flex-col items-center py-4 space-y-4 pt-14">
                        <button
                            onClick={() => onSelectReport(null)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to Overview"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        <div className="w-8 h-px bg-gray-200" />
                        
                        {filteredReports.map(report => (
                            <button
                                key={report.id}
                                onClick={() => onSelectReport(report.id)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors relative group",
                                    activeReportId === report.id
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                )}
                                title={report.data.title}
                            >
                                <FileText className="h-5 w-5" />
                                {report.status === 'archived' && (
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400 rounded-full border border-white" />
                                )}
                                {/* Tooltip for collapsed item */}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                                    {report.data.title} {report.status === 'archived' ? '(Archived)' : ''}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    // Expanded View
                    <>
                        <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-serif font-bold text-gray-900">Reports</h2>
                                <div className="w-6" /> {/* Spacer for toggle button */}
                            </div>
                            {/* Search in Sidebar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                             <button
                                onClick={() => onSelectReport(null)}
                                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 mb-2"
                             >
                                <ChevronRight className="h-4 w-4 rotate-180" /> Back to Overview
                             </button>

                             {activeReportsList.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active</div>
                                    <div className="space-y-1">
                                        {activeReportsList.map(report => (
                                            <SidebarItem 
                                                key={report.id} 
                                                report={report} 
                                                isActive={activeReportId === report.id} 
                                                onClick={() => onSelectReport(report.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                             )}

                             {archivedReportsList.length > 0 && (
                                <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Archived</div>
                                    <div className="space-y-1">
                                        {archivedReportsList.map(report => (
                                            <SidebarItem 
                                                key={report.id} 
                                                report={report} 
                                                isActive={activeReportId === report.id} 
                                                onClick={() => onSelectReport(report.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                             )}
                             
                             {activeReportsList.length === 0 && archivedReportsList.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    No reports found
                                </div>
                             )}
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto h-full p-8">
                 <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[80vh]">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <div>
                            <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> 
                                {activeReport.source === 'curated_insight' ? 'Curated Insight Report' : 'AI Generated Report'}
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{activeReport.data.title}</h1>
                            <div className="text-sm text-gray-500">
                                {activeReport.data.dateRange} • {activeReport.data.entity}
                                {activeReport.status === 'archived' && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        Archived
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-gray-400">
                                Generated {new Date(activeReport.createdAt).toLocaleString()}
                            </div>
                            {/* Archive/Restore Actions */}
                            {activeReport.status === 'archived' && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onRestoreReport(activeReport.id)}
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restore Report
                                </Button>
                            )}
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
    <div className="max-w-6xl mx-auto p-8 h-full">
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
        
        {/* Unified Search Bar */}
        {reports.length > 0 && (
            <div className="mb-8 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search all reports (active & archived)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
            </div>
        )}

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
            <div className="space-y-12">
                {/* Active Reports Section */}
                {activeReportsList.length > 0 && (
                    <section>
                         <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Active Reports
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{activeReportsList.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeReportsList.map(report => (
                                <ReportCard 
                                    key={report.id} 
                                    report={report} 
                                    onClick={() => onSelectReport(report.id)} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Archived Reports Section */}
                {archivedReportsList.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Archived Reports
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{archivedReportsList.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedReportsList.map(report => (
                                <ReportCard 
                                    key={report.id} 
                                    report={report} 
                                    onClick={() => onSelectReport(report.id)}
                                    isArchived 
                                />
                            ))}
                        </div>
                    </section>
                )}
                
                {filteredReports.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium">No reports found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}

function ReportCard({ report, onClick, isArchived }: { report: any, onClick: () => void, isArchived?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group flex flex-col bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all text-left h-full relative overflow-hidden",
                isArchived ? "bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300" : "hover:border-indigo-200"
            )}
        >
            {isArchived && (
                <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-xl text-xs font-medium text-gray-500 border-b border-l border-gray-200">
                    Archived
                </div>
            )}
            <div className="flex items-start justify-between w-full mb-4">
                <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isArchived ? "bg-gray-100" : "bg-gray-50 group-hover:bg-indigo-50"
                )}>
                    <FileText className={cn(
                        "h-5 w-5",
                        isArchived ? "text-gray-400" : "text-gray-500 group-hover:text-indigo-600"
                    )} />
                </div>
                {!isArchived && (
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                )}
            </div>
            <h3 className={cn(
                "text-lg font-semibold mb-2 transition-colors",
                isArchived ? "text-gray-600" : "text-gray-900 group-hover:text-indigo-700"
            )}>
                {report.data.title}
            </h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
                {report.data.summary[0]}
            </p>
            <div className={cn(
                "flex items-center text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform",
                isArchived ? "text-gray-500" : "text-indigo-600"
            )}>
                View Report <ArrowRight className="h-4 w-4 ml-1" />
            </div>
        </button>
    )
}
