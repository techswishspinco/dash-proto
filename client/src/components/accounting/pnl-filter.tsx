import React from "react";
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";

export type { DateRange };

interface PnLFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  
  // We can derive the preset from the range or track it separately.
  // Tracking separately allows "Custom" to be explicit.
  activePreset?: string;
  onPresetChange?: (preset: string) => void;

  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  
  selectedOwners: string[];
  onOwnerChange: (owners: string[]) => void;
}

const PRESETS = [
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last Month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "Quarter to Date", getValue: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: "Year to Date", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "Draft", color: "bg-gray-100 text-gray-700" },
  { label: "In Review", value: "Ready to Sync", color: "bg-amber-100 text-amber-700" }, // Mapping "In Review" to "Ready to Sync" based on existing data
  { label: "Finalized", value: "Sent", color: "bg-emerald-100 text-emerald-700" }, // Mapping "Finalized" to "Sent"
  { label: "Released", value: "Released", color: "bg-blue-100 text-blue-700" },
];

const OWNER_OPTIONS = [
  { label: "Not Sent", value: "Not Sent" }, // Mapping based on screenshot, assuming "Not Sent" matches one of the data states or needs to be added?
  // Let's stick to existing values but map labels if needed. 
  // Screenshot shows: Not Sent, Sent, Viewed, Approved, Changes Requested
  // My previous OWNER_OPTIONS were: Accountant, Manager, Owner, System.
  // I should probably stick to what I had or update if the user implies these are the options.
  // The screenshot specifically shows "FILTER BY OWNER STATUS" with options: Not Sent, Sent, Viewed, Approved, Changes Requested.
  // I will update the options to match the screenshot as much as possible given the data I saw in pnl-release.tsx.
  // In pnl-release.tsx, owner status logic is: item.viewed ? "Viewed" : item.status === "Sent" ? "Unread" : item.owner
  // "Unread" is roughly "Sent" (but not viewed). "Not Sent" is likely Draft status.
  // Let's use the options from the screenshot but map them to values that make sense or just use string matching if the parent handles it.
  // For now, I'll update to match screenshot labels.
  { label: "Not Sent", value: "Not Sent" },
  { label: "Sent", value: "Sent" },
  { label: "Viewed", value: "Viewed" },
  { label: "Approved", value: "Approved" },
  { label: "Changes Requested", value: "Changes Requested" },
];

export function PnLFilter({
  dateRange,
  onDateRangeChange,
  activePreset,
  onPresetChange,
  selectedStatuses,
  onStatusChange,
  selectedOwners,
  onOwnerChange
}: PnLFilterProps) {
  const [isFromOpen, setIsFromOpen] = React.useState(false);
  const [isToOpen, setIsToOpen] = React.useState(false);

  const handleStatusToggle = (value: string) => {
    if (selectedStatuses.includes(value)) {
      onStatusChange(selectedStatuses.filter(s => s !== value));
    } else {
      onStatusChange([...selectedStatuses, value]);
    }
  };

  const handleOwnerToggle = (value: string) => {
    if (selectedOwners.includes(value)) {
      onOwnerChange(selectedOwners.filter(o => o !== value));
    } else {
      onOwnerChange([...selectedOwners, value]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Date Range Split Filter */}
      <div className="flex items-center gap-1 bg-white rounded-md">
        <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "h-9 px-3 font-normal hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all", 
                        !dateRange?.from && "text-muted-foreground",
                        isFromOpen && "border-blue-600 ring-1 ring-blue-600 bg-blue-50/50"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {dateRange?.from ? format(dateRange.from, "MM/dd/yyyy") : <span>Start Date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => {
                        onDateRangeChange({ from: date, to: dateRange?.to });
                        setIsFromOpen(false);
                        if (activePreset !== "Custom") onPresetChange?.("Custom");
                    }}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                    className="p-3 pointer-events-auto"
                    classNames={{
                      caption_label: "hidden", // Hide the default caption label to use dropdowns
                      dropdowns: "flex w-full items-center gap-1.5",
                      dropdown: "flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                      dropdown_root: "relative flex items-center"
                    }}
                    formatters={{
                      formatWeekdayName: (date) => date.toLocaleDateString("en-US", { weekday: "narrow" }),
                    }}
                />
                <div className="flex items-center justify-between border-t border-border p-3">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => {
                      onDateRangeChange({ from: undefined, to: dateRange?.to });
                      setIsFromOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-xs font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
                    onClick={() => {
                      onDateRangeChange({ from: new Date(), to: dateRange?.to });
                      setIsFromOpen(false);
                      if (activePreset !== "Custom") onPresetChange?.("Custom");
                    }}
                  >
                    Today
                  </Button>
                </div>
            </PopoverContent>
        </Popover>

        <span className="text-gray-300 px-1">-</span>

        <Popover open={isToOpen} onOpenChange={setIsToOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "h-9 px-3 font-normal hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all", 
                        !dateRange?.to && "text-muted-foreground",
                        isToOpen && "border-blue-600 ring-1 ring-blue-600 bg-blue-50/50"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {dateRange?.to ? format(dateRange.to, "MM/dd/yyyy") : <span>End Date</span>}
                </Button>
            </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateRange?.to}
                    onSelect={(date) => {
                        onDateRangeChange({ from: dateRange?.from, to: date });
                        setIsToOpen(false);
                        if (activePreset !== "Custom") onPresetChange?.("Custom");
                    }}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                    className="p-3 pointer-events-auto"
                    classNames={{
                      caption_label: "hidden", 
                      dropdowns: "flex w-full items-center gap-1.5",
                      dropdown: "flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                      dropdown_root: "relative flex items-center"
                    }}
                    formatters={{
                      formatWeekdayName: (date) => date.toLocaleDateString("en-US", { weekday: "narrow" }),
                    }}
                />
                <div className="flex items-center justify-between border-t border-border p-3">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => {
                      onDateRangeChange({ from: dateRange?.from, to: undefined });
                      setIsToOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-xs font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
                    onClick={() => {
                      onDateRangeChange({ from: dateRange?.from, to: new Date() });
                      setIsToOpen(false);
                      if (activePreset !== "Custom") onPresetChange?.("Custom");
                    }}
                  >
                    Today
                  </Button>
                </div>
            </PopoverContent>
        </Popover>
      </div>

      <div className="h-4 w-[1px] bg-gray-200 mx-2" />

      {/* 2. Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 px-3 border-gray-200 hover:bg-gray-50 border-dashed data-[state=open]:border-blue-600 data-[state=open]:ring-1 data-[state=open]:ring-blue-600 data-[state=open]:bg-white data-[state=open]:border-solid"
          >
            <span>P&L Status</span>
            {selectedStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal bg-gray-100 text-gray-600 h-5">
                  {selectedStatuses.length}
                </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
            <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">FILTER BY P&L STATUS</h4>
            </div>
            <div className="p-2 flex flex-col gap-1">
                {STATUS_OPTIONS.map((option) => (
                    <div 
                        key={option.value} 
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleStatusToggle(option.value)}
                    >
                        <Checkbox 
                            id={`status-${option.value}`} 
                            checked={selectedStatuses.includes(option.value)}
                            onCheckedChange={() => handleStatusToggle(option.value)}
                            className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-[4px]"
                        />
                        <Label 
                            htmlFor={`status-${option.value}`} 
                            className="cursor-pointer flex-1 font-normal text-sm text-gray-700"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </PopoverContent>
      </Popover>

      {/* 3. Owner Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="h-10 px-3 border-gray-200 hover:bg-gray-50 border-dashed data-[state=open]:border-blue-600 data-[state=open]:ring-1 data-[state=open]:ring-blue-600 data-[state=open]:bg-white data-[state=open]:border-solid"
          >
            <span>Owner Status</span>
            {selectedOwners.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal bg-gray-100 text-gray-600 h-5">
                  {selectedOwners.length}
                </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
            <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">FILTER BY OWNER STATUS</h4>
            </div>
            <div className="p-2 flex flex-col gap-1">
                {OWNER_OPTIONS.map((option) => (
                    <div 
                        key={option.value} 
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleOwnerToggle(option.value)}
                    >
                        <Checkbox 
                            id={`owner-${option.value}`} 
                            checked={selectedOwners.includes(option.value)}
                            onCheckedChange={() => handleOwnerToggle(option.value)}
                            className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-[4px]"
                        />
                        <Label 
                            htmlFor={`owner-${option.value}`} 
                            className="cursor-pointer flex-1 font-normal text-sm text-gray-700"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </PopoverContent>
      </Popover>
      
      {(selectedStatuses.length > 0 || selectedOwners.length > 0 || activePreset === "Custom") && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
                onStatusChange([]);
                onOwnerChange([]);
                const defaultRange = PRESETS[0].getValue();
                onDateRangeChange(defaultRange);
                onPresetChange?.(PRESETS[0].label);
            }}
            className="h-8 px-2 lg:px-3 text-gray-500 hover:text-gray-900"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
      )}
    </div>
  );
}
