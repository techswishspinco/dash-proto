import React, { useState } from "react";
import { X, ChevronDown, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

// Types
export interface MonthlyDataPoint {
  month: string;
  year: number;
  actual: number;
  target: number;
  variance: number;
  variancePct: number;
}

export interface DrilldownItem {
  id: string;
  name: string;
  actual: number;
  target: number;
  variance: number;
  variancePct: number;
  isOnTrack: boolean;
}

export interface MetricTrendData {
  id: string;
  name: string;
  description: string;
  unit: 'currency' | 'percentage';
  isInverse?: boolean;
  data: MonthlyDataPoint[];
  drilldown?: {
    title: string;
    items: DrilldownItem[];
  };
}

// Helper function to check if metric is on track
export const isMetricOnTrack = (metric: MetricTrendData): boolean => {
  const latest = metric.data[metric.data.length - 1];
  if (!latest) return true;

  if (metric.isInverse) {
    return latest.actual <= latest.target;
  }
  return latest.actual >= latest.target;
};

// Status icon component
function StatusIcon({ isOnTrack, size = 'sm' }: { isOnTrack: boolean; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'md' ? 'h-6 w-6' : 'h-4 w-4';
  const containerClasses = size === 'md' ? 'p-1.5' : 'p-1';

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center",
      containerClasses,
      isOnTrack ? "bg-emerald-100" : "bg-red-100"
    )}>
      {isOnTrack ? (
        <Check className={cn(sizeClasses, "text-emerald-600")} />
      ) : (
        <AlertTriangle className={cn(sizeClasses, "text-red-600")} />
      )}
    </div>
  );
}

export interface TrendChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricTrendData | null;
}

export function TrendChartModal({ isOpen, onClose, metric }: TrendChartModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!isOpen || !metric) return null;

  const data = metric.data;
  const currentMonth = data[data.length - 1];
  const lastMonth = data[data.length - 2];
  const firstMonth = data[0];
  const onTrack = isMetricOnTrack(metric);

  // Calculate MoM change
  const momChange = lastMonth
    ? ((currentMonth.actual - lastMonth.actual) / lastMonth.actual * 100).toFixed(1)
    : '0';

  // Calculate 6-month change
  const sixMonthChange = ((currentMonth.actual - firstMonth.actual) / firstMonth.actual * 100).toFixed(1);

  // Format value based on unit type
  const formatValue = (value: number, isCurrency?: boolean) => {
    const useCurrency = isCurrency ?? metric.unit === 'currency';
    if (useCurrency) {
      return Math.abs(value) >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toLocaleString()}`;
    }
    return `${value.toFixed(1)}%`;
  };

  const formatFullValue = (value: number, isCurrency?: boolean) => {
    const useCurrency = isCurrency ?? metric.unit === 'currency';
    if (useCurrency) {
      return `$${value.toLocaleString()}`;
    }
    return `${value.toFixed(1)}%`;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm">
          <p className="font-semibold text-gray-900">{dataPoint.month} {dataPoint.year}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-gray-700">Actual: <span className="font-medium">{formatFullValue(dataPoint.actual)}</span></p>
            <p className="text-gray-500">Target: {formatFullValue(dataPoint.target)}</p>
            <p className={cn(
              "font-medium",
              metric.isInverse
                ? (dataPoint.variance <= 0 ? "text-emerald-600" : "text-red-600")
                : (dataPoint.variance >= 0 ? "text-emerald-600" : "text-red-600")
            )}>
              {dataPoint.variance >= 0 ? '+' : ''}{metric.unit === 'currency' ? `$${dataPoint.variance.toLocaleString()}` : `${dataPoint.variance.toFixed(1)}pts`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 mx-4">
        {/* Header with Status */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <StatusIcon isOnTrack={onTrack} size="md" />
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">{metric.name} Trend</h2>
              <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-trend-modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Stats with Status */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
          <div className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Current ({currentMonth.month.substring(0, 3)})
            </p>
            <div className="flex items-center justify-center gap-2">
              <StatusIcon isOnTrack={onTrack} />
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(currentMonth.actual)}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Target: {formatValue(currentMonth.target)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              vs Last Month
            </p>
            <p className={cn(
              "text-2xl font-bold",
              metric.isInverse
                ? (Number(momChange) <= 0 ? "text-emerald-600" : "text-red-600")
                : (Number(momChange) >= 0 ? "text-emerald-600" : "text-red-600")
            )}>
              {Number(momChange) >= 0 ? '+' : ''}{momChange}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {lastMonth?.month.substring(0, 3)} → {currentMonth.month.substring(0, 3)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              6-Month Change
            </p>
            <p className={cn(
              "text-2xl font-bold",
              metric.isInverse
                ? (Number(sixMonthChange) <= 0 ? "text-emerald-600" : "text-red-600")
                : (Number(sixMonthChange) >= 0 ? "text-emerald-600" : "text-red-600")
            )}>
              {Number(sixMonthChange) >= 0 ? '+' : ''}{sixMonthChange}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {firstMonth.month.substring(0, 3)} → {currentMonth.month.substring(0, 3)}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Chart */}
          <div className="p-6 border-b border-gray-100">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => metric.unit === 'currency' ? `$${(value / 1000).toFixed(0)}k` : `${value}%`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={onTrack ? "#10b981" : "#ef4444"}
                    strokeWidth={3}
                    dot={{ fill: onTrack ? '#10b981' : '#ef4444', strokeWidth: 0, r: 5 }}
                    activeDot={{ fill: onTrack ? '#10b981' : '#ef4444', strokeWidth: 0, r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drilldown Section */}
          {metric.drilldown && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection('drilldown')}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                data-testid="toggle-drilldown"
                aria-expanded={expandedSections.has('drilldown')}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-500 transition-transform",
                    expandedSections.has('drilldown') ? "" : "-rotate-90"
                  )} />
                  <span className="font-medium text-gray-900">{metric.drilldown.title}</span>
                  <span className="text-xs text-gray-500">({metric.drilldown.items.length} items)</span>
                </div>
                <span className="text-xs text-gray-500">Click to {expandedSections.has('drilldown') ? 'collapse' : 'expand'}</span>
              </button>

              <AnimatePresence>
                {expandedSections.has('drilldown') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left px-4 py-2 font-medium text-gray-500">Sub-Category</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-500">Actual</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-500">Target</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-500">% Revenue</th>
                              <th className="text-center px-4 py-2 font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {metric.drilldown.items.map((item) => (
                              <tr key={item.id} className="bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-900">{item.name}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                                  {metric.unit === 'currency' && item.actual >= 1000
                                    ? `$${item.actual.toLocaleString()}`
                                    : `${item.actual.toFixed(1)}%`
                                  }
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-500">
                                  {metric.unit === 'currency' && item.target >= 1000
                                    ? `$${item.target.toLocaleString()}`
                                    : `${item.target.toFixed(1)}%`
                                  }
                                </td>
                                <td className={cn(
                                  "px-4 py-2.5 text-right font-medium",
                                  item.isOnTrack ? "text-emerald-600" : "text-red-600"
                                )}>
                                  {item.variance >= 0 ? '+' : ''}{item.variancePct.toFixed(1)}%
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <StatusIcon isOnTrack={item.isOnTrack} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Monthly Data Table */}
          <div>
            <button
              onClick={() => toggleSection('monthly')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              data-testid="toggle-monthly-data"
              aria-expanded={expandedSections.has('monthly')}
            >
              <div className="flex items-center gap-2">
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  expandedSections.has('monthly') ? "" : "-rotate-90"
                )} />
                <span className="font-medium text-gray-900">Monthly Breakdown</span>
                <span className="text-xs text-gray-500">({data.length} months)</span>
              </div>
              <span className="text-xs text-gray-500">Click to {expandedSections.has('monthly') ? 'collapse' : 'expand'}</span>
            </button>

            <AnimatePresence>
              {expandedSections.has('monthly') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left px-4 py-2 font-medium text-gray-500">Month</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">Actual</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">Target</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">vs Target</th>
                            <th className="text-right px-4 py-2 font-medium text-gray-500">MoM %</th>
                            <th className="text-center px-4 py-2 font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[...data].reverse().map((point, idx) => {
                            const prevPoint = data[data.length - 2 - idx];
                            const momPct = prevPoint
                              ? ((point.actual - prevPoint.actual) / prevPoint.actual * 100).toFixed(1)
                              : null;
                            const pointOnTrack = metric.isInverse
                              ? point.actual <= point.target
                              : point.actual >= point.target;
                            return (
                              <tr key={point.month} className="bg-white hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-900">{point.month} {point.year}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                                  {formatFullValue(point.actual)}
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-500">
                                  {formatFullValue(point.target)}
                                </td>
                                <td className={cn(
                                  "px-4 py-2.5 text-right font-medium",
                                  pointOnTrack ? "text-emerald-600" : "text-red-600"
                                )}>
                                  {point.variance >= 0 ? '+' : ''}{point.variancePct.toFixed(1)}%
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-500">
                                  {momPct ? `${Number(momPct) >= 0 ? '+' : ''}${momPct}%` : '—'}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <StatusIcon isOnTrack={pointOnTrack} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
