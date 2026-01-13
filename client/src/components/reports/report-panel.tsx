
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  FileText, 
  Copy
} from "lucide-react";
import { ReportData } from "./mock-data";
import { toast } from "@/hooks/use-toast";
import { ReportContent } from "./report-content";

interface ReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportData | null;
}

export function ReportPanel({ isOpen, onClose, data }: ReportPanelProps) {
  if (!data) return null;

  const handleCopy = () => {
    // Generate a simple markdown representation
    const text = `
# ${data.title}
${data.dateRange} | ${data.entity}

## Executive Summary
${data.summary.map(s => `- ${s}`).join('\n')}

## Key Metrics
${data.metrics.map(m => `- ${m.label}: ${m.value} (${m.change})`).join('\n')}

## Analysis
${data.analysis}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({
      title: "Report Copied",
      description: "Report summary copied to clipboard in Markdown format.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Generating PDF report... (Simulation)",
    });
    setTimeout(() => {
        toast({
            title: "Export Complete",
            description: "Report downloaded as PDF.",
            variant: "default",
        });
    }, 1500);
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting CSV",
      description: "Generating CSV data... (Simulation)",
    });
    setTimeout(() => {
        toast({
            title: "Export Complete",
            description: "Table data downloaded as CSV.",
            variant: "default",
        });
    }, 1000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl sm:w-[800px] overflow-hidden flex flex-col p-0 gap-0 border-l border-border shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-gray-50/50">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        AI Generated Report
                    </div>
                    <SheetTitle className="text-2xl font-serif font-medium">{data.title}</SheetTitle>
                    <SheetDescription className="mt-1">
                        {data.dateRange} • {data.entity}
                    </SheetDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleCopy} title="Copy to Clipboard">
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export CSV">
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm" onClick={handleExportPDF} className="gap-2">
                        <Download className="h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>
            
            <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-semibold">Sources:</span>
                {data.dataSources.join(", ")}
            </div>
        </div>

        <ScrollArea className="flex-1">
            <div className="p-6">
                <ReportContent data={data} />
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
