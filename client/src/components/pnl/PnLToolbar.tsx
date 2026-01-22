import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Layers,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePnL, type RoleType, type ViewTab } from "@/contexts/PnLContext";

interface PnLToolbarProps {
  onBack?: () => void;
  onSync?: () => void;
  tocDropdownOpen?: boolean;
  setTocDropdownOpen?: (open: boolean) => void;
  tocDropdownRef?: React.RefObject<HTMLDivElement>;
  tocSections?: Array<{ id: string; title: string; icon: React.ReactNode }>;
  onSectionClick?: (sectionId: string) => void;
}

export function PnLToolbar({
  onBack,
  onSync,
  tocDropdownOpen = false,
  setTocDropdownOpen,
  tocDropdownRef,
  tocSections = [],
  onSectionClick,
}: PnLToolbarProps) {
  const {
    period,
    locationName,
    isOwnerView,
    canEdit,
    selectedRole,
    setSelectedRole,
    activeTab,
    setActiveTab,
    showChat,
    setShowChat,
    isEditMode,
    setIsEditMode,
    showSectionsSidebar,
    setShowSectionsSidebar,
    isSyncing,
    handleRelease,
    navigate,
  } = usePnL();

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    navigate(`/finance/pnl-release?view=${role}`);
  };

  return (
    <div className="bg-white border-b border-gray-200 shrink-0">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack || (() => navigate(isOwnerView ? "/insight/home" : "/finance/pnl-release"))}
            className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-serif text-xl font-bold text-gray-900">{period} Report</h1>
            <p className="text-xs text-muted-foreground">
              {locationName} {canEdit ? "• Draft" : "• Prepared by Accountant"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Role Toggle - Always visible */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              data-testid="button-role-owner"
              onClick={() => handleRoleChange("owner")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                selectedRole === "owner" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Owner
            </button>
            <button
              data-testid="button-role-gm"
              onClick={() => handleRoleChange("gm")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                selectedRole === "gm" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              GM
            </button>
            <button
              data-testid="button-role-chef"
              onClick={() => handleRoleChange("chef")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                selectedRole === "chef" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Chef
            </button>
          </div>

          {/* Edit Controls - Only for accountants */}
          {canEdit && (
            <>
              {isSyncing ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </div>
              ) : (
                <button
                  onClick={onSync}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" /> Sync Data
                </button>
              )}
              <div className="h-6 w-px bg-gray-200" />
              {activeTab === "detailed" && (
                <>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                      "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
                      isEditMode
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    )}
                    data-testid="button-toggle-edit-mode"
                  >
                    {isEditMode ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    {isEditMode ? "Editing" : "Edit"}
                  </button>
                  <button
                    onClick={() => setShowSectionsSidebar(!showSectionsSidebar)}
                    className={cn(
                      "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
                      showSectionsSidebar
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    )}
                    data-testid="button-toggle-sections-sidebar"
                  >
                    <Layers className="h-4 w-4" /> Sections
                  </button>
                  <div className="h-6 w-px bg-gray-200" />
                </>
              )}
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                <Save className="h-4 w-4" /> Save Draft
              </button>
              <div className="h-6 w-px bg-gray-200" />
            </>
          )}

          {/* Download - Always visible */}
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

          {/* Assistant Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
              showChat
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            )}
            data-testid="button-toggle-assistant"
          >
            <Sparkles className="h-4 w-4" /> Assistant
          </button>

          {/* Review & Send - Only for accountants */}
          {canEdit && (
            <button
              onClick={handleRelease}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              Review & Send <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="px-6 flex gap-1 border-t border-gray-100">
        <button
          data-testid="tab-curated-view"
          onClick={() => setActiveTab("curated")}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "curated"
              ? "border-black text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Curated View
          </div>
        </button>

        <div
          ref={tocDropdownRef}
          className="relative group"
          onMouseEnter={() => setTocDropdownOpen?.(true)}
          onMouseLeave={() => setTocDropdownOpen?.(false)}
        >
          <button
            data-testid="tab-detailed-view"
            onClick={() => setActiveTab("detailed")}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "detailed"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Detailed View
              {tocSections.length > 0 && (
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-150",
                    tocDropdownOpen && "rotate-180"
                  )}
                />
              )}
            </div>
          </button>

          {/* TOC Dropdown Menu */}
          {tocSections.length > 0 && (
            <div
              className={cn(
                "absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-150 ease-out",
                tocDropdownOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 -translate-y-1 invisible"
              )}
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Document Outline
                </span>
              </div>
              {tocSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab("detailed");
                    onSectionClick?.(section.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
