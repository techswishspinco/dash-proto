import type { MetricTrendData } from "@/components/pnl/TrendChartModal";

// Real data from Excel file (Jan-Oct 2025)
export const healthSnapshotTrendData: MetricTrendData[] = [
  {
    id: 'net-sales',
    name: 'Net Sales',
    description: 'Revenue after discounts and returns',
    unit: 'currency',
    data: [
      { month: 'Jan', year: 2025, actual: 163530, target: 160000, variance: 3530, variancePct: 2.2 },
      { month: 'Feb', year: 2025, actual: 139832, target: 145000, variance: -5168, variancePct: -3.6 },
      { month: 'Mar', year: 2025, actual: 163042, target: 160000, variance: 3042, variancePct: 1.9 },
      { month: 'Apr', year: 2025, actual: 162828, target: 160000, variance: 2828, variancePct: 1.8 },
      { month: 'May', year: 2025, actual: 161381, target: 160000, variance: 1381, variancePct: 0.9 },
      { month: 'Jun', year: 2025, actual: 149995, target: 155000, variance: -5005, variancePct: -3.2 },
      { month: 'Jul', year: 2025, actual: 142042, target: 150000, variance: -7958, variancePct: -5.3 },
      { month: 'Aug', year: 2025, actual: 154351, target: 155000, variance: -649, variancePct: -0.4 },
      { month: 'Sep', year: 2025, actual: 133042, target: 150000, variance: -16958, variancePct: -11.3 },
      { month: 'Oct', year: 2025, actual: 146662, target: 150000, variance: -3338, variancePct: -2.2 },
    ],
    drilldown: {
      title: 'Sales by Channel',
      items: [
        { id: 'food-sales', name: 'Food Sales', actual: 113360, target: 115000, variance: -1640, variancePct: -1.4, isOnTrack: true },
        { id: 'beverage-sales', name: 'Beverage Sales', actual: 19998, target: 20000, variance: -2, variancePct: 0.0, isOnTrack: true },
        { id: 'delivery-sales', name: 'Delivery Sales', actual: 20341, target: 18000, variance: 2341, variancePct: 13.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'prime-cost',
    name: 'Prime Cost %',
    description: '(COGS + Labor) ÷ Net Sales',
    unit: 'percentage',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 50.5, target: 50.0, variance: 0.5, variancePct: 1.0 },
      { month: 'Feb', year: 2025, actual: 51.9, target: 50.0, variance: 1.9, variancePct: 3.8 },
      { month: 'Mar', year: 2025, actual: 47.1, target: 50.0, variance: -2.9, variancePct: -5.8 },
      { month: 'Apr', year: 2025, actual: 50.0, target: 50.0, variance: 0.0, variancePct: 0.0 },
      { month: 'May', year: 2025, actual: 47.8, target: 50.0, variance: -2.2, variancePct: -4.4 },
      { month: 'Jun', year: 2025, actual: 52.0, target: 50.0, variance: 2.0, variancePct: 4.0 },
      { month: 'Jul', year: 2025, actual: 54.8, target: 50.0, variance: 4.8, variancePct: 9.6 },
      { month: 'Aug', year: 2025, actual: 49.2, target: 50.0, variance: -0.8, variancePct: -1.6 },
      { month: 'Sep', year: 2025, actual: 54.0, target: 50.0, variance: 4.0, variancePct: 8.0 },
      { month: 'Oct', year: 2025, actual: 55.6, target: 50.0, variance: 5.6, variancePct: 11.2 },
    ],
    drilldown: {
      title: 'Prime Cost Breakdown',
      items: [
        { id: 'labor-pct', name: 'Direct Labor %', actual: 10.5, target: 12.0, variance: -1.5, variancePct: -12.5, isOnTrack: true },
        { id: 'cogs-pct', name: 'COGS %', actual: 45.1, target: 38.0, variance: 7.1, variancePct: 18.7, isOnTrack: false },
      ]
    }
  },
  {
    id: 'labor',
    name: 'Labor %',
    description: 'Direct Labor ÷ Net Sales',
    unit: 'percentage',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 11.0, target: 12.0, variance: -1.0, variancePct: -8.3 },
      { month: 'Feb', year: 2025, actual: 11.0, target: 12.0, variance: -1.0, variancePct: -8.3 },
      { month: 'Mar', year: 2025, actual: 10.9, target: 12.0, variance: -1.1, variancePct: -9.2 },
      { month: 'Apr', year: 2025, actual: 11.5, target: 12.0, variance: -0.5, variancePct: -4.2 },
      { month: 'May', year: 2025, actual: 11.1, target: 12.0, variance: -0.9, variancePct: -7.5 },
      { month: 'Jun', year: 2025, actual: 12.4, target: 12.0, variance: 0.4, variancePct: 3.3 },
      { month: 'Jul', year: 2025, actual: 12.4, target: 12.0, variance: 0.4, variancePct: 3.3 },
      { month: 'Aug', year: 2025, actual: 11.9, target: 12.0, variance: -0.1, variancePct: -0.8 },
      { month: 'Sep', year: 2025, actual: 12.1, target: 12.0, variance: 0.1, variancePct: 0.8 },
      { month: 'Oct', year: 2025, actual: 10.5, target: 12.0, variance: -1.5, variancePct: -12.5 },
    ],
    drilldown: {
      title: 'Labor by Role',
      items: [
        { id: 'server-plater', name: 'Server/Plater', actual: 8.2, target: 9.0, variance: -0.8, variancePct: -8.9, isOnTrack: true },
        { id: 'dishwasher', name: 'Dishwasher', actual: 2.1, target: 2.5, variance: -0.4, variancePct: -16.0, isOnTrack: true },
        { id: 'overtime', name: 'Overtime', actual: 0.2, target: 0.5, variance: -0.3, variancePct: -60.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'cogs',
    name: 'COGS %',
    description: 'COGS ÷ Net Sales',
    unit: 'percentage',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 39.5, target: 38.0, variance: 1.5, variancePct: 3.9 },
      { month: 'Feb', year: 2025, actual: 40.9, target: 38.0, variance: 2.9, variancePct: 7.6 },
      { month: 'Mar', year: 2025, actual: 36.1, target: 38.0, variance: -1.9, variancePct: -5.0 },
      { month: 'Apr', year: 2025, actual: 38.5, target: 38.0, variance: 0.5, variancePct: 1.3 },
      { month: 'May', year: 2025, actual: 36.7, target: 38.0, variance: -1.3, variancePct: -3.4 },
      { month: 'Jun', year: 2025, actual: 39.6, target: 38.0, variance: 1.6, variancePct: 4.2 },
      { month: 'Jul', year: 2025, actual: 42.4, target: 38.0, variance: 4.4, variancePct: 11.6 },
      { month: 'Aug', year: 2025, actual: 37.2, target: 38.0, variance: -0.8, variancePct: -2.1 },
      { month: 'Sep', year: 2025, actual: 41.8, target: 38.0, variance: 3.8, variancePct: 10.0 },
      { month: 'Oct', year: 2025, actual: 45.1, target: 38.0, variance: 7.1, variancePct: 18.7 },
    ],
    drilldown: {
      title: 'COGS by Category',
      items: [
        { id: 'commissary', name: 'Commissary Food', actual: 19.1, target: 15.0, variance: 4.1, variancePct: 27.3, isOnTrack: false },
        { id: 'food-cost', name: 'Food Cost', actual: 5.2, target: 4.0, variance: 1.2, variancePct: 30.0, isOnTrack: false },
        { id: 'beverage-cost', name: 'Beverage Cost', actual: 1.8, target: 1.5, variance: 0.3, variancePct: 20.0, isOnTrack: false },
        { id: 'delivery-fees', name: 'Online Delivery Fees', actual: 2.4, target: 2.0, variance: 0.4, variancePct: 20.0, isOnTrack: false },
      ]
    }
  },
  {
    id: 'net-income',
    name: 'Net Margin %',
    description: 'Net Operating Income ÷ Net Sales',
    unit: 'percentage',
    data: [
      { month: 'Jan', year: 2025, actual: 16.0, target: 15.0, variance: 1.0, variancePct: 6.7 },
      { month: 'Feb', year: 2025, actual: 16.5, target: 15.0, variance: 1.5, variancePct: 10.0 },
      { month: 'Mar', year: 2025, actual: 22.9, target: 15.0, variance: 7.9, variancePct: 52.7 },
      { month: 'Apr', year: 2025, actual: 18.0, target: 15.0, variance: 3.0, variancePct: 20.0 },
      { month: 'May', year: 2025, actual: 21.9, target: 15.0, variance: 6.9, variancePct: 46.0 },
      { month: 'Jun', year: 2025, actual: 19.3, target: 15.0, variance: 4.3, variancePct: 28.7 },
      { month: 'Jul', year: 2025, actual: 11.1, target: 15.0, variance: -3.9, variancePct: -26.0 },
      { month: 'Aug', year: 2025, actual: 18.8, target: 15.0, variance: 3.8, variancePct: 25.3 },
      { month: 'Sep', year: 2025, actual: 13.3, target: 15.0, variance: -1.7, variancePct: -11.3 },
      { month: 'Oct', year: 2025, actual: 3.5, target: 15.0, variance: -11.5, variancePct: -76.6 },
    ],
    drilldown: {
      title: 'Margin Drivers',
      items: [
        { id: 'gross-margin', name: 'Gross Margin', actual: 54.9, target: 60.0, variance: -5.1, variancePct: -8.5, isOnTrack: false },
        { id: 'operating-expenses', name: 'Operating Expenses %', actual: 51.5, target: 45.0, variance: 6.5, variancePct: 14.4, isOnTrack: false },
        { id: 'cogs-impact', name: 'COGS Impact', actual: -45.1, target: -38.0, variance: -7.1, variancePct: 18.7, isOnTrack: false },
      ]
    }
  },
  {
    id: 'gross-profit',
    name: 'Gross Profit',
    description: 'Revenue minus COGS',
    unit: 'currency',
    data: [
      { month: 'Jan', year: 2025, actual: 98854, target: 99200, variance: -346, variancePct: -0.3 },
      { month: 'Feb', year: 2025, actual: 82689, target: 89900, variance: -7211, variancePct: -8.0 },
      { month: 'Mar', year: 2025, actual: 104157, target: 99200, variance: 4957, variancePct: 5.0 },
      { month: 'Apr', year: 2025, actual: 100076, target: 99200, variance: 876, variancePct: 0.9 },
      { month: 'May', year: 2025, actual: 102178, target: 99200, variance: 2978, variancePct: 3.0 },
      { month: 'Jun', year: 2025, actual: 90529, target: 96100, variance: -5571, variancePct: -5.8 },
      { month: 'Jul', year: 2025, actual: 81796, target: 93000, variance: -11204, variancePct: -12.0 },
      { month: 'Aug', year: 2025, actual: 96857, target: 96100, variance: 757, variancePct: 0.8 },
      { month: 'Sep', year: 2025, actual: 77372, target: 93000, variance: -15628, variancePct: -16.8 },
      { month: 'Oct', year: 2025, actual: 80587, target: 95000, variance: -14413, variancePct: -15.2 },
    ],
    drilldown: {
      title: 'Gross Profit Components',
      items: [
        { id: 'revenue', name: 'Total Revenue', actual: 146662, target: 150000, variance: -3338, variancePct: -2.2, isOnTrack: true },
        { id: 'cogs', name: 'Total COGS', actual: -66075, target: -57000, variance: -9075, variancePct: -15.9, isOnTrack: false },
      ]
    }
  },
  {
    id: 'marketing',
    name: 'Marketing Spend',
    description: 'Total marketing and advertising expenses',
    unit: 'currency',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 3500, target: 4000, variance: -500, variancePct: -12.5 },
      { month: 'Feb', year: 2025, actual: 3800, target: 4000, variance: -200, variancePct: -5.0 },
      { month: 'Mar', year: 2025, actual: 4200, target: 4000, variance: 200, variancePct: 5.0 },
      { month: 'Apr', year: 2025, actual: 3600, target: 4000, variance: -400, variancePct: -10.0 },
      { month: 'May', year: 2025, actual: 3400, target: 4000, variance: -600, variancePct: -15.0 },
      { month: 'Jun', year: 2025, actual: 3900, target: 4000, variance: -100, variancePct: -2.5 },
      { month: 'Jul', year: 2025, actual: 4100, target: 4000, variance: 100, variancePct: 2.5 },
      { month: 'Aug', year: 2025, actual: 3700, target: 4000, variance: -300, variancePct: -7.5 },
      { month: 'Sep', year: 2025, actual: 3200, target: 4000, variance: -800, variancePct: -20.0 },
      { month: 'Oct', year: 2025, actual: 4200, target: 4000, variance: 200, variancePct: 5.0 },
    ],
    drilldown: {
      title: 'Marketing Channels',
      items: [
        { id: 'digital-ads', name: 'Digital Ads', actual: 2800, target: 2000, variance: 800, variancePct: 40.0, isOnTrack: false },
        { id: 'social-media', name: 'Social Media', actual: 1000, target: 1000, variance: 0, variancePct: 0.0, isOnTrack: true },
        { id: 'local-promo', name: 'Local Promotions', actual: 400, target: 1000, variance: -600, variancePct: -60.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Net operating cash balance',
    unit: 'currency',
    data: [
      { month: 'Jan', year: 2025, actual: 42000, target: 40000, variance: 2000, variancePct: 5.0 },
      { month: 'Feb', year: 2025, actual: 38500, target: 40000, variance: -1500, variancePct: -3.8 },
      { month: 'Mar', year: 2025, actual: 45200, target: 42000, variance: 3200, variancePct: 7.6 },
      { month: 'Apr', year: 2025, actual: 44800, target: 42000, variance: 2800, variancePct: 6.7 },
      { month: 'May', year: 2025, actual: 47500, target: 45000, variance: 2500, variancePct: 5.6 },
      { month: 'Jun', year: 2025, actual: 43200, target: 45000, variance: -1800, variancePct: -4.0 },
      { month: 'Jul', year: 2025, actual: 39800, target: 42000, variance: -2200, variancePct: -5.2 },
      { month: 'Aug', year: 2025, actual: 44600, target: 45000, variance: -400, variancePct: -0.9 },
      { month: 'Sep', year: 2025, actual: 48200, target: 45000, variance: 3200, variancePct: 7.1 },
      { month: 'Oct', year: 2025, actual: 38000, target: 45000, variance: -7000, variancePct: -15.6 },
    ],
    drilldown: {
      title: 'Cash Flow Sources',
      items: [
        { id: 'operating-cash', name: 'Operating Cash', actual: 25000, target: 30000, variance: -5000, variancePct: -16.7, isOnTrack: false },
        { id: 'receivables', name: 'Receivables', actual: 8000, target: 10000, variance: -2000, variancePct: -20.0, isOnTrack: false },
        { id: 'reserve', name: 'Cash Reserve', actual: 5000, target: 5000, variance: 0, variancePct: 0.0, isOnTrack: true },
      ]
    }
  },
  {
    id: 'controllable-expenses',
    name: 'Controllable Expenses',
    description: 'Total controllable operating expenses',
    unit: 'currency',
    isInverse: true,
    data: [
      { month: 'Jan', year: 2025, actual: 42500, target: 45000, variance: -2500, variancePct: -5.6 },
      { month: 'Feb', year: 2025, actual: 43800, target: 45000, variance: -1200, variancePct: -2.7 },
      { month: 'Mar', year: 2025, actual: 41200, target: 45000, variance: -3800, variancePct: -8.4 },
      { month: 'Apr', year: 2025, actual: 44100, target: 45000, variance: -900, variancePct: -2.0 },
      { month: 'May', year: 2025, actual: 43600, target: 45000, variance: -1400, variancePct: -3.1 },
      { month: 'Jun', year: 2025, actual: 46200, target: 45000, variance: 1200, variancePct: 2.7 },
      { month: 'Jul', year: 2025, actual: 47800, target: 45000, variance: 2800, variancePct: 6.2 },
      { month: 'Aug', year: 2025, actual: 44900, target: 45000, variance: -100, variancePct: -0.2 },
      { month: 'Sep', year: 2025, actual: 44500, target: 45000, variance: -500, variancePct: -1.1 },
      { month: 'Oct', year: 2025, actual: 58000, target: 45000, variance: 13000, variancePct: 28.9 },
    ],
    drilldown: {
      title: 'Expense Categories',
      items: [
        { id: 'marketing-exp', name: 'Marketing', actual: 4200, target: 4000, variance: 200, variancePct: 5.0, isOnTrack: false },
        { id: 'repairs-exp', name: 'Repairs & Maintenance', actual: 9500, target: 8000, variance: 1500, variancePct: 18.8, isOnTrack: false },
        { id: 'utilities-exp', name: 'Utilities', actual: 13200, target: 12000, variance: 1200, variancePct: 10.0, isOnTrack: false },
        { id: 'cc-fees-exp', name: 'CC Fees', actual: 5800, target: 5500, variance: 300, variancePct: 5.5, isOnTrack: false },
        { id: 'delivery-exp', name: 'Delivery Fees', actual: 16500, target: 15500, variance: 1000, variancePct: 6.5, isOnTrack: false },
      ]
    }
  }
];
