import plData from './pl-data.json';

export interface MonthlyValue {
  current: number | null;
  percent_of_income: number;
}

export interface AccountData {
  account: string;
  monthly_data: Record<string, MonthlyValue>;
}

export interface PLMetadata {
  report_title: string;
  company: string;
  location: string;
  period: string;
  generated: string;
}

export interface PLData {
  metadata: PLMetadata;
  accounts: AccountData[];
}

const data = plData as PLData;

const MONTHS = [
  'January 2025', 'February 2025', 'March 2025', 'April 2025',
  'May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025'
];

const TOTAL_KEY = 'Total (Jan 1 - Sep 30 2025)';

function getAccount(name: string): AccountData | undefined {
  return data.accounts.find(a => a.account === name || a.account.includes(name));
}

function getValue(account: AccountData | undefined, month: string): number {
  if (!account) return 0;
  const val = account.monthly_data[month]?.current;
  return val ?? 0;
}

function getPct(account: AccountData | undefined, month: string): number {
  if (!account) return 0;
  return account.monthly_data[month]?.percent_of_income ?? 0;
}

export function getMetadata() {
  return data.metadata;
}

export function getMonths() {
  return MONTHS;
}

export function getIncomeByMonth(month: string): number {
  const account = getAccount('Total for Income');
  return getValue(account, month);
}

export function getTotalIncome(): number {
  const account = getAccount('Total for Income');
  return getValue(account, TOTAL_KEY);
}

export function getCOGSByMonth(month: string): number {
  const account = getAccount('Total for Cost of Goods Sold');
  return getValue(account, month);
}

export function getCOGSPctByMonth(month: string): number {
  const account = getAccount('Total for Cost of Goods Sold');
  return getPct(account, month);
}

export function getTotalCOGS(): number {
  const account = getAccount('Total for Cost of Goods Sold');
  return getValue(account, TOTAL_KEY);
}

export function getTotalCOGSPct(): number {
  const account = getAccount('Total for Cost of Goods Sold');
  return getPct(account, TOTAL_KEY);
}

export function getLaborByMonth(month: string): number {
  const account = getAccount('Total for 500-400 Direct Labor Cost');
  return getValue(account, month);
}

export function getLaborPctByMonth(month: string): number {
  const account = getAccount('Total for 500-400 Direct Labor Cost');
  return getPct(account, month);
}

export function getTotalLabor(): number {
  const account = getAccount('Total for 500-400 Direct Labor Cost');
  return getValue(account, TOTAL_KEY);
}

export function getTotalLaborPct(): number {
  const account = getAccount('Total for 500-400 Direct Labor Cost');
  return getPct(account, TOTAL_KEY);
}

export function getPrimeCostByMonth(month: string): number {
  return getCOGSByMonth(month) + getLaborByMonth(month);
}

export function getPrimeCostPctByMonth(month: string): number {
  const income = getIncomeByMonth(month);
  if (income === 0) return 0;
  return (getPrimeCostByMonth(month) / income) * 100;
}

export function getTotalPrimeCost(): number {
  return getTotalCOGS() + getTotalLabor();
}

export function getTotalPrimeCostPct(): number {
  const income = getTotalIncome();
  if (income === 0) return 0;
  return (getTotalPrimeCost() / income) * 100;
}

export function getFoodSalesByMonth(month: string): number {
  const account = getAccount('400-000 Food Sales');
  return getValue(account, month);
}

export function getBeverageSalesByMonth(month: string): number {
  const account = getAccount('Total for 400-200 Beverage Sales');
  return getValue(account, month);
}

export function getDeliverySalesByMonth(month: string): number {
  const account = getAccount('Total for 400-500 Delivery Sales');
  return getValue(account, month);
}

export function getCompsDiscountsByMonth(month: string): number {
  const account = getAccount('400-400 Comps / Discount');
  return getValue(account, month);
}

export function getFoodCostByMonth(month: string): number {
  const account = getAccount('500-000 Food Cost');
  return getValue(account, month);
}

export function getBeverageCostByMonth(month: string): number {
  const account = getAccount('500-200 Beverage Cost');
  return getValue(account, month);
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

export function getYTDSummary() {
  const income = getTotalIncome();
  const cogs = getTotalCOGS();
  const labor = getTotalLabor();
  const primeCost = cogs + labor;
  
  return {
    income,
    cogs,
    cogsPct: getTotalCOGSPct(),
    labor,
    laborPct: getTotalLaborPct(),
    primeCost,
    primeCostPct: income > 0 ? (primeCost / income) * 100 : 0,
    grossProfit: income - cogs,
    grossProfitPct: income > 0 ? ((income - cogs) / income) * 100 : 0,
  };
}

export function getMonthlyTrend() {
  return MONTHS.map(month => getMonthlySummary(month));
}

export function getLatestMonth() {
  return MONTHS[MONTHS.length - 1];
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
