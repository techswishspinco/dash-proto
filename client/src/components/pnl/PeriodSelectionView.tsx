import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout";

// Types
export type PnLStatus = "Draft" | "In Review" | "Finalized" | "Published";
export type OwnerStatus = "Not Sent" | "Sent" | "Viewed" | "Approved" | "Changes Requested";
export type TimeframeType = "Daily" | "Weekly" | "Monthly" | "Yearly";

export interface PnLPeriod {
  id: string;
  period: string;
  location: string;
  pnlStatus: PnLStatus;
  ownerStatus: OwnerStatus;
  sentDate: string | null;
  startDate: Date;
  endDate: Date;
}

export interface PnLFilterState {
  startDate: string;
  endDate: string;
  timeframe: TimeframeType;
  pnlStatuses: PnLStatus[];
  ownerStatuses: OwnerStatus[];
}

export const PNL_STATUS_OPTIONS: PnLStatus[] = ["Draft", "In Review", "Finalized", "Published"];
export const OWNER_STATUS_OPTIONS: OwnerStatus[] = ["Not Sent", "Sent", "Viewed", "Approved", "Changes Requested"];
export const TIMEFRAME_OPTIONS: TimeframeType[] = ["Daily", "Weekly", "Monthly", "Yearly"];

export const PNL_FILTER_KEY = "munch-pnl-filters";

export const pnlPeriods: PnLPeriod[] = [
  { id: "sep-25", period: "September 2025", location: "STMARKS", pnlStatus: "Draft", ownerStatus: "Not Sent", sentDate: null, startDate: new Date(2025, 8, 1), endDate: new Date(2025, 8, 30) },
  { id: "aug-25", period: "August 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Viewed", sentDate: "Sep 15, 2025", startDate: new Date(2025, 7, 1), endDate: new Date(2025, 7, 31) },
  { id: "jul-25", period: "July 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "Aug 12, 2025", startDate: new Date(2025, 6, 1), endDate: new Date(2025, 6, 31) },
  { id: "jun-25", period: "June 2025", location: "STMARKS", pnlStatus: "Finalized", ownerStatus: "Sent", sentDate: "Jul 14, 2025", startDate: new Date(2025, 5, 1), endDate: new Date(2025, 5, 30) },
  { id: "may-25", period: "May 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Changes Requested", sentDate: "Jun 10, 2025", startDate: new Date(2025, 4, 1), endDate: new Date(2025, 4, 31) },
  { id: "apr-25", period: "April 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "May 12, 2025", startDate: new Date(2025, 3, 1), endDate: new Date(2025, 3, 30) },
  { id: "mar-25", period: "March 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "Apr 14, 2025", startDate: new Date(2025, 2, 1), endDate: new Date(2025, 2, 31) },
  { id: "feb-25", period: "February 2025", location: "STMARKS", pnlStatus: "Published", ownerStatus: "Approved", sentDate: "Mar 10, 2025", startDate: new Date(2025, 1, 1), endDate: new Date(2025, 1, 28) },
  { id: "jan-25", period: "January 2025", location: "STMARKS", pnlStatus: "In Review", ownerStatus: "Not Sent", sentDate: null, startDate: new Date(2025, 0, 1), endDate: new Date(2025, 0, 31) },
];

interface PeriodSelectionViewProps {
  filters: PnLFilterState;
  setFilters: React.Dispatch<React.SetStateAction<PnLFilterState>>;
  showTimeframeDropdown: boolean;
  setShowTimeframeDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showPnlStatusDropdown: boolean;
  setShowPnlStatusDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showOwnerStatusDropdown: boolean;
  setShowOwnerStatusDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  getFilterSummary: () => string;
  togglePnlStatus: (status: PnLStatus) => void;
  toggleOwnerStatus: (status: OwnerStatus) => void;
  filteredPeriods: PnLPeriod[];
  onPeriodClick: (p: PnLPeriod) => void;
  showUploadModal: boolean;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  uploadedFile: File | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  isDragOver: boolean;
  handleFileDragOver: (e: React.DragEvent) => void;
  handleFileDragLeave: (e: React.DragEvent) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  handleFileUpload: (file: File) => void;
  startProcessingAnimation: () => void;
  showProcessingAnimation: boolean;
  processingStep: number;
  processingMessages: string[];
}

export function PeriodSelectionView({
  filters,
  setFilters,
  showTimeframeDropdown,
  setShowTimeframeDropdown,
  showPnlStatusDropdown,
  setShowPnlStatusDropdown,
  showOwnerStatusDropdown,
  setShowOwnerStatusDropdown,
  hasActiveFilters,
  clearAllFilters,
  getFilterSummary,
  togglePnlStatus,
  toggleOwnerStatus,
  filteredPeriods,
  onPeriodClick,
  showUploadModal,
  setShowUploadModal,
  uploadedFile,
  setUploadedFile,
  isDragOver,
  handleFileDragOver,
  handleFileDragLeave,
  handleFileDrop,
  handleFileUpload,
  startProcessingAnimation,
  showProcessingAnimation,
  processingStep,
  processingMessages,
}: PeriodSelectionViewProps) {
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
                setUploadedFile(null);
                setShowUploadModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              data-testid="button-start-new-release"
            >
              <Plus className="h-4 w-4" /> Start New Release
            </button>
          </div>

          {/* Unified Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Calendar / Date Range Filter */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-transparent text-sm text-gray-700 border-none focus:outline-none w-28"
                  data-testid="filter-start-date"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-transparent text-sm text-gray-700 border-none focus:outline-none w-28"
                  data-testid="filter-end-date"
                />
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="relative">
                <button
                  onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  data-testid="filter-timeframe"
                >
                  {filters.timeframe}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                {showTimeframeDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    {TIMEFRAME_OPTIONS.map(tf => (
                      <button
                        key={tf}
                        onClick={() => { setFilters(prev => ({ ...prev, timeframe: tf })); setShowTimeframeDropdown(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                          filters.timeframe === tf && "bg-gray-50 font-medium"
                        )}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* P&L Status Filter */}
            <div className="relative">
              <button
                onClick={() => { setShowPnlStatusDropdown(!showPnlStatusDropdown); setShowOwnerStatusDropdown(false); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors",
                  filters.pnlStatuses.length > 0
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
                data-testid="filter-pnl-status"
              >
                <span>P&L Status</span>
                {filters.pnlStatuses.length > 0 && (
                  <span className="bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {filters.pnlStatuses.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              {showPnlStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[180px]">
                  <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by Status</span>
                  </div>
                  {PNL_STATUS_OPTIONS.map(status => (
                    <button
                      key={status}
                      onClick={() => togglePnlStatus(status)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      data-testid={`filter-pnl-status-${status.toLowerCase().replace(" ", "-")}`}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        filters.pnlStatuses.includes(status)
                          ? "bg-black border-black text-white"
                          : "border-gray-300"
                      )}>
                        {filters.pnlStatuses.includes(status) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Owner Status Filter */}
            <div className="relative">
              <button
                onClick={() => { setShowOwnerStatusDropdown(!showOwnerStatusDropdown); setShowPnlStatusDropdown(false); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors",
                  filters.ownerStatuses.length > 0
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
                data-testid="filter-owner-status"
              >
                <span>Owner Status</span>
                {filters.ownerStatuses.length > 0 && (
                  <span className="bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {filters.ownerStatuses.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              {showOwnerStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by Owner Status</span>
                  </div>
                  {OWNER_STATUS_OPTIONS.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleOwnerStatus(status)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      data-testid={`filter-owner-status-${status.toLowerCase().replace(" ", "-")}`}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        filters.ownerStatuses.includes(status)
                          ? "bg-black border-black text-white"
                          : "border-gray-300"
                      )}>
                        {filters.ownerStatuses.includes(status) && <Check className="h-3 w-3" />}
                      </div>
                      <span>{status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                data-testid="clear-filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}

            <div className="ml-auto flex gap-3 items-center">
              {/* Filter Summary */}
              <span className="text-xs text-gray-500 hidden lg:block">
                {getFilterSummary()}
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search periods..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-black"
                  data-testid="search-periods"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.pnlStatuses.map(status => (
                <span
                  key={`pnl-${status}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  {status}
                  <button
                    onClick={() => togglePnlStatus(status)}
                    className="hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.ownerStatuses.map(status => (
                <span
                  key={`owner-${status}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                >
                  {status}
                  <button
                    onClick={() => toggleOwnerStatus(status)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
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
                {filteredPeriods.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onPeriodClick(item)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    data-testid={`pnl-row-${item.id}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{item.period}</td>
                    <td className="px-6 py-4 text-gray-600">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                        item.pnlStatus === "Draft" && "bg-gray-50 text-gray-700 border-gray-200",
                        item.pnlStatus === "In Review" && "bg-blue-50 text-blue-700 border-blue-100",
                        item.pnlStatus === "Finalized" && "bg-amber-50 text-amber-700 border-amber-100",
                        item.pnlStatus === "Published" && "bg-emerald-50 text-emerald-700 border-emerald-100"
                      )}>
                        {item.pnlStatus === "Published" && <Check className="h-3 w-3" />}
                        {item.pnlStatus === "In Review" && <Loader2 className="h-3 w-3" />}
                        {item.pnlStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.sentDate || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        item.ownerStatus === "Approved" && "bg-emerald-50 text-emerald-700",
                        item.ownerStatus === "Viewed" && "bg-blue-50 text-blue-700",
                        item.ownerStatus === "Sent" && "bg-gray-100 text-gray-700",
                        item.ownerStatus === "Not Sent" && "bg-gray-50 text-gray-500",
                        item.ownerStatus === "Changes Requested" && "bg-red-50 text-red-700"
                      )}>
                        {item.ownerStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
                {filteredPeriods.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No P&L reports match the current filters. Try adjusting your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-200"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-gray-900">Upload Financial Data</h3>
                    <p className="text-sm text-gray-500">Import CSV or Excel file</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-close-upload-modal"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Upload Area */}
              <div className="p-5">
                <div
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
                    isDragOver
                      ? "border-gray-900 bg-gray-50"
                      : uploadedFile
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  )}
                  onClick={() => document.getElementById('file-upload-step1')?.click()}
                >
                  <input
                    id="file-upload-step1"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    data-testid="input-file-upload"
                  />

                  {uploadedFile ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                        data-testid="button-remove-file"
                      >
                        Remove file
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
                        isDragOver ? "bg-gray-200" : "bg-gray-100"
                      )}>
                        <FileSpreadsheet className={cn(
                          "h-7 w-7 transition-colors",
                          isDragOver ? "text-gray-700" : "text-gray-400"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {isDragOver ? "Drop your file here" : "Drag & drop or click to upload"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          CSV, XLSX, or XLS files
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  For this demo, you can skip the upload
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </button>
                <button
                  onClick={startProcessingAnimation}
                  className="px-5 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                  data-testid="button-generate-pnl"
                >
                  Generate P&L
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Animation */}
      <AnimatePresence>
        {showProcessingAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white overflow-hidden"
          >
            {/* Subtle grid pattern background */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Floating dots */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-gray-300"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Center content */}
            <div className="relative z-10 text-center px-8">
              {/* Spinning loader */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-gray-200" />
                  <motion.div
                    className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-t-gray-900"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </motion.div>

              {/* Animated Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={processingStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                    {processingMessages[processingStep]}
                  </h1>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 w-64 mx-auto"
              >
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gray-900 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${((processingStep + 1) / processingMessages.length) * 100}%`
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Step {processingStep + 1} of {processingMessages.length}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
