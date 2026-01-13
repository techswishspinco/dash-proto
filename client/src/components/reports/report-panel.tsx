
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  FileText, 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { ReportData } from "./mock-data";
import { toast } from "@/hooks/use-toast";

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
            <div className="p-6 space-y-8 pb-20">
                
                {/* Executive Summary */}
                <section className="space-y-3">
                    <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Executive Summary
                    </h3>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 space-y-2">
                        {data.summary.map((item, i) => (
                            <div key={i} className="flex gap-3 text-sm text-emerald-900">
                                <span className="font-bold text-emerald-500/50">•</span>
                                <span className="leading-relaxed">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key Metrics Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data.metrics.map((metric, i) => (
                        <div key={i} className="bg-white border border-border p-3 rounded-lg shadow-sm">
                            <div className="text-xs text-muted-foreground truncate mb-1">{metric.label}</div>
                            <div className="text-xl font-serif font-medium mb-1">{metric.value}</div>
                            <div className={`text-xs font-medium flex items-center gap-1 ${
                                metric.trend === 'up' ? 'text-emerald-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                                {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                                {metric.trend === 'neutral' && <Minus className="h-3 w-3" />}
                                {metric.change}
                            </div>
                        </div>
                    ))}
                </section>

                {/* Main Data Table */}
                <section className="space-y-3">
                    <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Supporting Data
                    </h3>
                    <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    {data.tableData.headers.map((header, i) => (
                                        <TableHead key={i} className="text-xs uppercase font-semibold h-9">{header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.tableData.rows.map((row, i) => (
                                    <TableRow key={i}>
                                        {row.map((cell, j) => (
                                            <TableCell key={j} className="py-2 text-sm font-medium text-gray-700">
                                                {cell}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* Analysis & Commentary */}
                <section className="space-y-3">
                     <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        AI Analysis
                    </h3>
                    <div className="text-sm leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg border border-border">
                        {data.analysis}
                    </div>
                </section>

                {/* Recommendations (Optional) */}
                {data.recommendations && (
                    <section className="space-y-3">
                        <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Recommendations
                        </h3>
                         <div className="space-y-2">
                            {data.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-sm text-amber-900">
                                    <div className="mt-0.5 min-w-[16px] flex justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    </div>
                                    <span>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
