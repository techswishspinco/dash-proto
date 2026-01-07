import React from "react";
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  { label: "Accountant", value: "Accountant" },
  { label: "Manager", value: "Manager" },
  { label: "Owner", value: "Owner" },
  { label: "System", value: "System" },
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
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handlePresetSelect = (presetLabel: string) => {
    const preset = PRESETS.find(p => p.label === presetLabel);
    if (preset) {
      onDateRangeChange(preset.getValue());
      onPresetChange?.(presetLabel);
      setIsCalendarOpen(false);
    }
  };

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
      {/* 1. Calendar Filter */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal h-10 px-3 border-gray-200 hover:bg-gray-50",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MM/dd/yyyy")} - {format(dateRange.to, "MM/dd/yyyy")}
                </>
              ) : (
                format(dateRange.from, "MM/dd/yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
            <div className="h-4 w-[1px] bg-gray-200 mx-2" />
            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
              {activePreset || "Custom"}
            </span>
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-0">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                if (activePreset !== "Custom") {
                  onPresetChange?.("Custom");
                }
              }}
              numberOfMonths={1}
            />
            <div className="flex items-center justify-between p-3 border-t border-gray-100">
               <button 
                  onClick={() => {
                     onDateRangeChange(undefined);
                     setIsCalendarOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
               >
                  Clear
               </button>
               <button 
                  onClick={() => {
                     const today = new Date();
                     onDateRangeChange({ from: today, to: today });
                     onPresetChange?.("Custom"); // Or create a "Today" preset
                     setIsCalendarOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
               >
                  Today
               </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* 2. Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 px-3 border-gray-200 hover:bg-gray-50 border-dashed">
            <span>P&L Status</span>
            {selectedStatuses.length > 0 && (
              <>
                <div className="h-4 w-[1px] bg-gray-200 mx-2" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                  {selectedStatuses.length}
                </Badge>
                <div className="hidden lg:flex space-x-1">
                  {selectedStatuses.length > 2 ? (
                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                      {selectedStatuses.length} selected
                    </Badge>
                  ) : (
                    STATUS_OPTIONS.filter((option) => selectedStatuses.includes(option.value)).map(
                      (option) => (
                        <Badge
                          key={option.value}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal bg-gray-100 text-gray-600"
                        >
                          {option.label}
                        </Badge>
                      )
                    )
                  )}
                </div>
              </>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Status" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatuses.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleStatusToggle(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedStatuses.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onStatusChange([])}
                      className="justify-center text-center"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 3. Owner Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 px-3 border-gray-200 hover:bg-gray-50 border-dashed">
            <span>Owner Status</span>
            {selectedOwners.length > 0 && (
              <>
                <div className="h-4 w-[1px] bg-gray-200 mx-2" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                  {selectedOwners.length}
                </Badge>
                <div className="hidden lg:flex space-x-1">
                  {selectedOwners.length > 2 ? (
                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                      {selectedOwners.length} selected
                    </Badge>
                  ) : (
                    OWNER_OPTIONS.filter((option) => selectedOwners.includes(option.value)).map(
                      (option) => (
                        <Badge
                          key={option.value}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal bg-gray-100 text-gray-600"
                        >
                          {option.label}
                        </Badge>
                      )
                    )
                  )}
                </div>
              </>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Owner" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {OWNER_OPTIONS.map((option) => {
                  const isSelected = selectedOwners.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleOwnerToggle(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedOwners.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onOwnerChange([])}
                      className="justify-center text-center"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
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
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
      )}
    </div>
  );
}
