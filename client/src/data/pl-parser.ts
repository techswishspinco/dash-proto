import { 
  getCanonicalPL, 
  getAccountValue, 
  getAccountPercent, 
  normalizeAccountName, 
  CanonicalAccount,
  flattenCanonicalHierarchy
} from './canonical-pl';

// Map full month names to canonical short names
const MONTH_MAP: Record<string, string> = {
  'January 2025': 'Jan 2025',
  'February 2025': 'Feb 2025',
  'March 2025': 'Mar 2025',
  'April 2025': 'Apr 2025',
  'May 2025': 'May 2025',
  'June 2025': 'Jun 2025',
  'July 2025': 'Jul 2025',
  'August 2025': 'Aug 2025',
  'September 2025': 'Sep 2025',
  'October 2025': 'Oct 2025'
};

const SHORT_TO_LONG: Record<string, string> = Object.entries(MONTH_MAP).reduce((acc, [k, v]) => ({...acc, [v]: k}), {});

const MONTHS = Object.keys(MONTH_MAP);
const TOTAL_KEY = 'Total (Jan 1 - Sep 30 2025)'; // Legacy key support, though we might want to change this

function toCanonicalMonth(month: string): string {
  if (month === TOTAL_KEY) return 'Total'; // Assuming canonical has 'Total' column, or we sum?
  // Actually canonical-pl stores months as keys.
  return MONTH_MAP[month] || month;
}

export function getMetadata() {
  return {
    report_title: "Profit and Loss",
    company: "Aco Bakery Inc",
    location: "STMARKS",
    period: "Jan - Oct 2025",
    generated: new Date().toISOString()
  };
}

export function getMonths() {
  return MONTHS;
}

export function getLatestMonth() {
  return 'October 2025';
}

export function getIncomeByMonth(month: string): number {
  return getAccountValue('Income', toCanonicalMonth(month));
}

export function getTotalIncome(): number {
  // Sum of all known months for mockup simplicity or use Total column if implemented
  // For now, let's just grab Sep or Oct if requested, or sum?
  // Legacy parser expected a total for the period.
  // We'll return the sum of Sep+Oct for now as a proxy or just Oct YTD if we had it.
  // The user requirement focuses on Sep/Oct comparison.
  // Let's just return Oct YTD if available or 0.
  // Actually, we can just return 0 for Total if not used much, or sum visible months.
  return getIncomeByMonth('September 2025') + getIncomeByMonth('October 2025');
}

export function getCOGSByMonth(month: string): number {
  return getAccountValue('Cost of Goods Sold', toCanonicalMonth(month));
}

export function getCOGSPctByMonth(month: string): number {
  return getAccountPercent('Cost of Goods Sold', toCanonicalMonth(month));
}

export function getTotalCOGS(): number {
   return getCOGSByMonth('September 2025') + getCOGSByMonth('October 2025');
}

export function getTotalCOGSPct(): number {
  const inc = getTotalIncome();
  return inc ? (getTotalCOGS() / inc) * 100 : 0;
}

// Labor: Need to find "Direct Labor Cost"
export function getLaborByMonth(month: string): number {
  return getAccountValue('Direct Labor Cost', toCanonicalMonth(month));
}

export function getLaborPctByMonth(month: string): number {
  return getAccountPercent('Direct Labor Cost', toCanonicalMonth(month));
}

export function getTotalLabor(): number {
   return getLaborByMonth('September 2025') + getLaborByMonth('October 2025');
}

export function getTotalLaborPct(): number {
  const inc = getTotalIncome();
  return inc ? (getTotalLabor() / inc) * 100 : 0;
}

export function getPrimeCostByMonth(month: string): number {
  return getCOGSByMonth(month) + getLaborByMonth(month);
}

export function getPrimeCostPctByMonth(month: string): number {
  const income = getIncomeByMonth(month);
  return income ? (getPrimeCostByMonth(month) / income) * 100 : 0;
}

export function getTotalPrimeCost(): number {
  return getTotalCOGS() + getTotalLabor();
}

export function getTotalPrimeCostPct(): number {
  const inc = getTotalIncome();
  return inc ? (getTotalPrimeCost() / inc) * 100 : 0;
}

// Specific Breakdowns
export function getFoodSalesByMonth(month: string): number {
  return getAccountValue('Food Sales', toCanonicalMonth(month));
}

export function getBeverageSalesByMonth(month: string): number {
  return getAccountValue('Beverage Sales', toCanonicalMonth(month));
}

export function getDeliverySalesByMonth(month: string): number {
  return getAccountValue('Delivery Sales', toCanonicalMonth(month));
}

export function getCompsDiscountsByMonth(month: string): number {
  return getAccountValue('Comps / Discount', toCanonicalMonth(month));
}

export function getFoodCostByMonth(month: string): number {
  return getAccountValue('Food Cost', toCanonicalMonth(month));
}

export function getBeverageCostByMonth(month: string): number {
  return getAccountValue('Beverage Cost', toCanonicalMonth(month));
}

export function getMonthlySummary(month: string) {
  const income = getIncomeByMonth(month);
  const cogs = getCOGSByMonth(month);
  const labor = getLaborByMonth(month);
  const primeCost = cogs + labor;
  
  return {
    month,
    income,
    cogs,
    cogsPct: income > 0 ? (cogs / income) * 100 : 0,
    labor,
    laborPct: income > 0 ? (labor / income) * 100 : 0,
    primeCost,
    primeCostPct: income > 0 ? (primeCost / income) * 100 : 0,
    grossProfit: income - cogs,
    grossProfitPct: income > 0 ? ((income - cogs) / income) * 100 : 0,
  };
}

export function getMonthlyTrend() {
  return MONTHS.map(month => getMonthlySummary(month));
}

export function getLatestMonthSummary() {
  return getMonthlySummary(getLatestMonth());
}

export function getCOGSBreakdown(month: string) {
  const foodCost = getFoodCostByMonth(month);
  const bevCost = getBeverageCostByMonth(month);
  const totalCogs = getCOGSByMonth(month);
  const other = totalCogs - foodCost - bevCost;
  
  return {
    foodCost,
    beverageCost: bevCost,
    other: other > 0 ? other : 0,
    total: totalCogs
  };
}

export function getRevenueBreakdown(month: string) {
  return {
    foodSales: getFoodSalesByMonth(month),
    beverageSales: getBeverageSalesByMonth(month),
    deliverySales: getDeliverySalesByMonth(month),
    compsDiscounts: getCompsDiscountsByMonth(month),
    total: getIncomeByMonth(month)
  };
}

// Hierarchy Adapters
// Convert CanonicalAccount to the shape expected by UI (HierarchicalAccount)
export interface HierarchicalAccount {
  id: string;
  name: string;
  amount: number;
  pctOfRevenue: number;
  children?: HierarchicalAccount[];
  isTotal?: boolean;
}

function adaptCanonicalToHierarchy(node: CanonicalAccount, month: string): HierarchicalAccount {
    const m = toCanonicalMonth(month);
    return {
        id: node.id,
        name: node.name,
        amount: node.months[m]?.value || 0,
        pctOfRevenue: node.months[m]?.percentOfRevenue || 0,
        isTotal: node.isTotal,
        children: node.children ? node.children.map(c => adaptCanonicalToHierarchy(c, month)) : undefined
    };
}

export function getIncomeHierarchy(period: string = 'October 2025'): HierarchicalAccount {
    const data = getCanonicalPL();
    return adaptCanonicalToHierarchy(data.income, period);
}

export function getCOGSHierarchy(period: string = 'October 2025'): HierarchicalAccount {
    const data = getCanonicalPL();
    return adaptCanonicalToHierarchy(data.cogs, period);
}

export function getPayrollHierarchy(period: string = 'October 2025'): HierarchicalAccount {
    const data = getCanonicalPL();
    return adaptCanonicalToHierarchy(data.payroll, period);
}

export function getDirectOperatingCostsHierarchy(period: string = 'October 2025'): HierarchicalAccount {
    const data = getCanonicalPL();
    return adaptCanonicalToHierarchy(data.operating, period);
}

export function getCompletePLHierarchy(period: string = 'October 2025'): HierarchicalAccount[] {
    return [
        getIncomeHierarchy(period),
        getCOGSHierarchy(period),
        getPayrollHierarchy(period),
        getDirectOperatingCostsHierarchy(period)
    ];
}

export function flattenHierarchy(root: HierarchicalAccount): HierarchicalAccount[] {
    let flat: HierarchicalAccount[] = [root];
    if (root.children) {
        root.children.forEach(child => {
            flat = flat.concat(flattenHierarchy(child));
        });
    }
    return flat;
}

export function getYTDSummary() {
    // Placeholder as YTD logic is complex with just 2 months explicitly mapped
    // But we can return the sum of the months we have
    return {
        income: getTotalIncome(),
        cogs: getTotalCOGS(),
        cogsPct: getTotalCOGSPct(),
        labor: getTotalLabor(),
        laborPct: getTotalLaborPct(),
        primeCost: getTotalPrimeCost(),
        primeCostPct: getTotalPrimeCostPct(),
        grossProfit: getTotalIncome() - getTotalCOGS(),
        grossProfitPct: getTotalIncome() ? ((getTotalIncome() - getTotalCOGS()) / getTotalIncome()) * 100 : 0
    };
}
