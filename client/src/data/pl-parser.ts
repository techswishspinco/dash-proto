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

// Strip account code prefix (e.g., "400-000 Food Sales" -> "Food Sales")
function stripAccountCode(name: string): string {
  return name.replace(/^\d{3}-\d{3}\s*/, '').trim();
}

// Get value by exact account name
function getValueByName(accountName: string, period: string = TOTAL_KEY): number {
  const account = data.accounts.find(a => a.account === accountName);
  return getValue(account, period);
}

function getPctByName(accountName: string, period: string = TOTAL_KEY): number {
  const account = data.accounts.find(a => a.account === accountName);
  return getPct(account, period);
}

export interface HierarchicalAccount {
  id: string;
  name: string;
  amount: number;
  pctOfRevenue: number;
  children?: HierarchicalAccount[];
  isTotal?: boolean;
}

// ===== INCOME SECTION =====
export function getIncomeHierarchy(period: string = TOTAL_KEY): HierarchicalAccount {
  return {
    id: 'income',
    name: 'Income',
    amount: getValueByName('Total for Income', period),
    pctOfRevenue: 100,
    isTotal: true,
    children: [
      {
        id: 'food-sales',
        name: 'Food Sales',
        amount: getValueByName('400-000 Food Sales', period),
        pctOfRevenue: getPctByName('400-000 Food Sales', period),
      },
      {
        id: 'beverage-sales',
        name: 'Beverage Sales',
        amount: getValueByName('Total for 400-200 Beverage Sales', period),
        pctOfRevenue: getPctByName('Total for 400-200 Beverage Sales', period),
        children: [
          {
            id: 'alcohol-bevs',
            name: 'Alcohol Beverages',
            amount: getValueByName('400-210 Alcohol Bevs', period),
            pctOfRevenue: getPctByName('400-210 Alcohol Bevs', period),
          },
          {
            id: 'na-beverage',
            name: 'N/A Beverage',
            amount: getValueByName('400-240 N/A Beverage', period),
            pctOfRevenue: getPctByName('400-240 N/A Beverage', period),
          },
        ]
      },
      {
        id: 'delivery-sales',
        name: 'Delivery Sales',
        amount: getValueByName('Total for 400-500 Delivery Sales', period),
        pctOfRevenue: getPctByName('Total for 400-500 Delivery Sales', period),
        children: [
          {
            id: 'classpass',
            name: 'ClassPass',
            amount: getValueByName('400-510 ClassPass', period),
            pctOfRevenue: getPctByName('400-510 ClassPass', period),
          },
          {
            id: 'doordash',
            name: 'DoorDash',
            amount: getValueByName('400-540 DoorDash', period),
            pctOfRevenue: getPctByName('400-540 DoorDash', period),
          },
          {
            id: 'ezcater',
            name: 'ezCater',
            amount: getValueByName('400-550 ezCater', period),
            pctOfRevenue: getPctByName('400-550 ezCater', period),
          },
          {
            id: 'fantuan',
            name: 'Fantuan',
            amount: getValueByName('400-560 Fantuan', period),
            pctOfRevenue: getPctByName('400-560 Fantuan', period),
          },
          {
            id: 'grubhub',
            name: 'GrubHub',
            amount: getValueByName('400-580 GrubHub', period),
            pctOfRevenue: getPctByName('400-580 GrubHub', period),
          },
          {
            id: 'hungrypanda',
            name: 'HungryPanda',
            amount: getValueByName('400-590 HungryPanda', period),
            pctOfRevenue: getPctByName('400-590 HungryPanda', period),
          },
          {
            id: 'ubereats',
            name: 'UberEats',
            amount: getValueByName('400-600 UberEats', period),
            pctOfRevenue: getPctByName('400-600 UberEats', period),
          },
          {
            id: 'grubhub-deli-promo',
            name: 'GrubHub - Deli Promo',
            amount: getValueByName('GrubHub - Deli Promo (excl.tax)', period),
            pctOfRevenue: getPctByName('GrubHub - Deli Promo (excl.tax)', period),
          },
          {
            id: 'ubereats-deli-promo',
            name: 'UberEats - Deli Promo',
            amount: getValueByName('UberEats -Deli Promo (excl.tax)', period),
            pctOfRevenue: getPctByName('UberEats -Deli Promo (excl.tax)', period),
          },
        ]
      },
      {
        id: 'events-offpremise',
        name: 'Events / Off-Premise Sales',
        amount: getValueByName('400-800 Events\\\\ Off-Premise Sales', period),
        pctOfRevenue: getPctByName('400-800 Events\\\\ Off-Premise Sales', period),
      },
      {
        id: 'comps-discounts',
        name: 'Comps / Discounts',
        amount: getValueByName('400-400 Comps / Discount', period),
        pctOfRevenue: getPctByName('400-400 Comps / Discount', period),
      },
    ]
  };
}

// ===== COST OF GOODS SOLD SECTION =====
export function getCOGSHierarchy(period: string = TOTAL_KEY): HierarchicalAccount {
  return {
    id: 'cogs',
    name: 'Cost of Goods Sold',
    amount: getValueByName('Total for Cost of Goods Sold', period),
    pctOfRevenue: getPctByName('Total for Cost of Goods Sold', period),
    isTotal: true,
    children: [
      {
        id: 'food-cost',
        name: 'Food Cost',
        amount: getValueByName('Total for 500-000 Food Cost', period),
        pctOfRevenue: getPctByName('Total for 500-000 Food Cost', period),
        children: [
          {
            id: 'dairy',
            name: 'Dairy',
            amount: getValueByName('500-003 Dairy', period),
            pctOfRevenue: getPctByName('500-003 Dairy', period),
          },
          {
            id: 'dry-goods',
            name: 'Dry Goods',
            amount: getValueByName('500-004 Dry Goods', period),
            pctOfRevenue: getPctByName('500-004 Dry Goods', period),
          },
          {
            id: 'produce',
            name: 'Produce',
            amount: getValueByName('500-006 Produce', period),
            pctOfRevenue: getPctByName('500-006 Produce', period),
          },
        ]
      },
      {
        id: 'beverage-cost',
        name: 'Beverage Cost',
        amount: getValueByName('Total for 500-200 Beverage Cost', period),
        pctOfRevenue: getPctByName('Total for 500-200 Beverage Cost', period),
        children: [
          {
            id: 'beer-wine-cider',
            name: 'Beer/Wine/Cider',
            amount: getValueByName('500-201 Beer/Wine/Cider', period),
            pctOfRevenue: getPctByName('500-201 Beer/Wine/Cider', period),
          },
          {
            id: 'coffee-tea',
            name: 'Coffee/Tea',
            amount: getValueByName('500-202 Coffee/Tea', period),
            pctOfRevenue: getPctByName('500-202 Coffee/Tea', period),
          },
          {
            id: 'juice-soda-water',
            name: 'Juice/Soda/Water',
            amount: getValueByName('500-203 Juice/Soda/Water', period),
            pctOfRevenue: getPctByName('500-203 Juice/Soda/Water', period),
          },
        ]
      },
      {
        id: 'commissary-food',
        name: 'Commissary Food',
        amount: getValueByName('500-300 Commissary Food', period),
        pctOfRevenue: getPctByName('500-300 Commissary Food', period),
        children: [
          {
            id: 'ice-cream',
            name: 'Ice Cream',
            amount: getValueByName('500-303 Ice Cream', period),
            pctOfRevenue: getPctByName('500-303 Ice Cream', period),
          },
        ]
      },
      {
        id: 'direct-labor-cost',
        name: 'Direct Labor Cost',
        amount: getValueByName('Total for 500-400 Direct Labor Cost', period),
        pctOfRevenue: getPctByName('Total for 500-400 Direct Labor Cost', period),
        children: [
          {
            id: 'dishwasher',
            name: 'Dishwasher',
            amount: getValueByName('500-501 Dishwasher', period),
            pctOfRevenue: getPctByName('500-501 Dishwasher', period),
          },
          {
            id: 'dishwasher-ot',
            name: 'Dishwasher Overtime',
            amount: getValueByName('500-502 Dishwasher OVERTIME', period),
            pctOfRevenue: getPctByName('500-502 Dishwasher OVERTIME', period),
          },
          {
            id: 'server-plater',
            name: 'Server/Plater',
            amount: getValueByName('500-533 Server/ Plater', period),
            pctOfRevenue: getPctByName('500-533 Server/ Plater', period),
          },
          {
            id: 'server-plater-ot',
            name: 'Server/Plater Overtime',
            amount: getValueByName('500-534 Server/ Plater OVERTIME', period),
            pctOfRevenue: getPctByName('500-534 Server/ Plater OVERTIME', period),
          },
        ]
      },
      {
        id: 'online-delivery-fees',
        name: 'Online Delivery Fees',
        amount: getValueByName('Total for Online Delivery Fees', period),
        pctOfRevenue: getPctByName('Total for Online Delivery Fees', period),
        children: [
          {
            id: 'grubhub-fees-cogs',
            name: 'GrubHub Fees',
            amount: getValueByName('GrubHub Fees', period),
            pctOfRevenue: getPctByName('GrubHub Fees', period),
          },
          {
            id: 'ubereats-fees-cogs',
            name: 'UberEats Fees',
            amount: getValueByName('UberEats Fees', period),
            pctOfRevenue: getPctByName('UberEats Fees', period),
          },
        ]
      },
    ]
  };
}

// ===== PAYROLL EXPENSES SECTION =====
export function getPayrollHierarchy(period: string = TOTAL_KEY): HierarchicalAccount {
  return {
    id: 'payroll-expenses',
    name: 'Payroll Expenses',
    amount: getValueByName('Total for 599-350 Payroll Expenses', period),
    pctOfRevenue: getPctByName('Total for 599-350 Payroll Expenses', period),
    isTotal: true,
    children: [
      {
        id: 'payroll-processing-fees',
        name: 'Payroll Processing Fees',
        amount: getValueByName('599-440 Payroll Processing Fees', period),
        pctOfRevenue: getPctByName('599-440 Payroll Processing Fees', period),
      },
      {
        id: 'payroll-taxes-benefits',
        name: 'Payroll Taxes & Benefits',
        amount: getValueByName('Total for 599-450 Payroll Taxes & Benefits', period),
        pctOfRevenue: getPctByName('Total for 599-450 Payroll Taxes & Benefits', period),
        children: [
          {
            id: 'federal-unemployment',
            name: 'Federal Unemployment Insurance',
            amount: getValueByName('599-500 Federal Unemployment Ins', period),
            pctOfRevenue: getPctByName('599-500 Federal Unemployment Ins', period),
          },
          {
            id: 'fica',
            name: 'FICA Expense',
            amount: getValueByName('599-510 FICA Expense', period),
            pctOfRevenue: getPctByName('599-510 FICA Expense', period),
          },
          {
            id: 'state-unemployment',
            name: 'State Unemployment Insurance',
            amount: getValueByName('599-650 State Unemployment Ins', period),
            pctOfRevenue: getPctByName('599-650 State Unemployment Ins', period),
          },
        ]
      },
      {
        id: 'salaries-wages',
        name: 'Salaries & Wages',
        amount: getValueByName('Total for 599-660 Salaries & Wages', period),
        pctOfRevenue: getPctByName('Total for 599-660 Salaries & Wages', period),
        children: [
          {
            id: 'admin-marketing',
            name: 'Admin/Marketing',
            amount: getValueByName('599-670 Admin/ Marketing', period),
            pctOfRevenue: getPctByName('599-670 Admin/ Marketing', period),
          },
          {
            id: 'management',
            name: 'Management',
            amount: getValueByName('599-890 Management', period),
            pctOfRevenue: getPctByName('599-890 Management', period),
          },
        ]
      },
    ]
  };
}

// ===== DIRECT OPERATING COSTS SECTION =====
export function getDirectOperatingCostsHierarchy(period: string = TOTAL_KEY): HierarchicalAccount {
  return {
    id: 'direct-operating-costs',
    name: 'Direct Operating Costs',
    amount: getValueByName('Total for 600-100 Direct Operating Costs', period),
    pctOfRevenue: getPctByName('Total for 600-100 Direct Operating Costs', period),
    isTotal: true,
    children: [
      {
        id: 'chace-depot-delivery',
        name: 'Chace Depot Delivery Fees',
        amount: getValueByName('600-102 Chace Depot Delivery Fees', period),
        pctOfRevenue: getPctByName('600-102 Chace Depot Delivery Fees', period),
      },
      {
        id: 'chace-royalty',
        name: 'Chace Royalty Fees',
        amount: getValueByName('600-103 Chace Royalty Fees', period),
        pctOfRevenue: getPctByName('600-103 Chace Royalty Fees', period),
      },
      {
        id: 'contract-services',
        name: 'Contract Service Companies',
        amount: getValueByName('Total for 600-107 Contract Service Companies', period),
        pctOfRevenue: getPctByName('Total for 600-107 Contract Service Companies', period),
        children: [
          {
            id: 'dishwashing-company',
            name: 'Dishwashing Company',
            amount: getValueByName('600-111 Dishwashing Company', period),
            pctOfRevenue: getPctByName('600-111 Dishwashing Company', period),
          },
          {
            id: 'garbage-removal',
            name: 'Garbage Removal',
            amount: getValueByName('600-116 Garbage Removal', period),
            pctOfRevenue: getPctByName('600-116 Garbage Removal', period),
          },
          {
            id: 'grease-removal',
            name: 'Grease Removal',
            amount: getValueByName('600-117 Grease Removal', period),
            pctOfRevenue: getPctByName('600-117 Grease Removal', period),
          },
          {
            id: 'pest-control',
            name: 'Pest Control',
            amount: getValueByName('600-118 Pest Control', period),
            pctOfRevenue: getPctByName('600-118 Pest Control', period),
          },
        ]
      },
      {
        id: 'credit-card-fees',
        name: 'Credit Card Fees',
        amount: getValueByName('600-120 Credit Card Fees', period),
        pctOfRevenue: getPctByName('600-120 Credit Card Fees', period),
      },
      {
        id: 'delivery-service-fees',
        name: 'Delivery Service Fees',
        amount: getValueByName('Total for 600-121 Delivery Service Fees', period),
        pctOfRevenue: getPctByName('Total for 600-121 Delivery Service Fees', period),
        children: [
          {
            id: 'classpass-fees',
            name: 'ClassPass Fees',
            amount: getValueByName('600-122 ClassPass Fees', period),
            pctOfRevenue: getPctByName('600-122 ClassPass Fees', period),
          },
          {
            id: 'doordash-fees',
            name: 'DoorDash Fees',
            amount: getValueByName('600-124 DoorDash Fees', period),
            pctOfRevenue: getPctByName('600-124 DoorDash Fees', period),
          },
          {
            id: 'ezcater-fees',
            name: 'ezCater Fees',
            amount: getValueByName('600-125 ezCater Fees', period),
            pctOfRevenue: getPctByName('600-125 ezCater Fees', period),
          },
          {
            id: 'fantuan-fees',
            name: 'Fantuan Fees',
            amount: getValueByName('600-126 Fantuan Fees', period),
            pctOfRevenue: getPctByName('600-126 Fantuan Fees', period),
          },
          {
            id: 'grubhub-fees-inactive',
            name: 'GrubHub Fees',
            amount: getValueByName('600-127 GrubHub Fees  (will be inactive)', period),
            pctOfRevenue: getPctByName('600-127 GrubHub Fees  (will be inactive)', period),
          },
          {
            id: 'hungrypanda-fees',
            name: 'HungryPanda Fees',
            amount: getValueByName('600-128 HungryPanda Fees', period),
            pctOfRevenue: getPctByName('600-128 HungryPanda Fees', period),
          },
          {
            id: 'grubhub-bogo',
            name: 'GrubHub - BOGO Promo',
            amount: getValueByName('GrubHub - BOGO Promo', period),
            pctOfRevenue: getPctByName('GrubHub - BOGO Promo', period),
          },
          {
            id: 'ubereats-bogo',
            name: 'UberEats Fees - BOGO Promo',
            amount: getValueByName('UberEats Fees - BOGO Promo', period),
            pctOfRevenue: getPctByName('UberEats Fees - BOGO Promo', period),
          },
          {
            id: 'ubereats-mkt-ads',
            name: 'UberEats Fees - Mkt/Ads Promo',
            amount: getValueByName('UberEats Fees - Mkt/ Ads Promo', period),
            pctOfRevenue: getPctByName('UberEats Fees - Mkt/ Ads Promo', period),
          },
        ]
      },
      {
        id: 'marketing-pr',
        name: 'Marketing & PR',
        amount: getValueByName('Total for 600-300 Marketing & PR', period),
        pctOfRevenue: getPctByName('Total for 600-300 Marketing & PR', period),
        children: [
          {
            id: 'advertising-promo',
            name: 'Advertising and Promotion',
            amount: getValueByName('600-400 Advertising and Promotion', period),
            pctOfRevenue: getPctByName('600-400 Advertising and Promotion', period),
          },
          {
            id: 'branding',
            name: 'Branding',
            amount: getValueByName('600-401 Branding', period),
            pctOfRevenue: getPctByName('600-401 Branding', period),
          },
          {
            id: 'custom-packaging',
            name: 'Custom Packaging Design',
            amount: getValueByName('600-402 Custom Packaging Design', period),
            pctOfRevenue: getPctByName('600-402 Custom Packaging Design', period),
          },
          {
            id: 'photography',
            name: 'Photography',
            amount: getValueByName('600-405 Photography', period),
            pctOfRevenue: getPctByName('600-405 Photography', period),
          },
          {
            id: 'printing',
            name: 'Printing, Cutting, Laminating',
            amount: getValueByName('600-406 Printing, Cutting, Laminating', period),
            pctOfRevenue: getPctByName('600-406 Printing, Cutting, Laminating', period),
          },
          {
            id: 'social-media',
            name: 'Social Media',
            amount: getValueByName('600-407 Social Media', period),
            pctOfRevenue: getPctByName('600-407 Social Media', period),
          },
          {
            id: 'website',
            name: 'Website',
            amount: getValueByName('600-408 Website', period),
            pctOfRevenue: getPctByName('600-408 Website', period),
          },
        ]
      },
      {
        id: 'repairs-maintenance',
        name: 'Repairs & Maintenance',
        amount: getValueByName('Total for 600-500 Repairs & Maintenance', period),
        pctOfRevenue: getPctByName('Total for 600-500 Repairs & Maintenance', period),
        children: [
          {
            id: 'kitchen-repairs',
            name: 'Kitchen Repairs',
            amount: getValueByName('600-504 Kitchen Repairs', period),
            pctOfRevenue: getPctByName('600-504 Kitchen Repairs', period),
          },
          {
            id: 'labor-repair',
            name: 'Labor, Repair/Maint (internal)',
            amount: getValueByName('600-505 Labor, Repair/Maint (internal)', period),
            pctOfRevenue: getPctByName('600-505 Labor, Repair/Maint (internal)', period),
          },
          {
            id: 'tools-materials',
            name: 'Tools & Materials',
            amount: getValueByName('600-506 Tools & Materials', period),
            pctOfRevenue: getPctByName('600-506 Tools & Materials', period),
          },
        ]
      },
      {
        id: 'restaurant-supplies',
        name: 'Restaurant/Kitchen Supplies',
        amount: getValueByName('Total for 600-600 Restaurant/Kitchen Supplies', period),
        pctOfRevenue: getPctByName('Total for 600-600 Restaurant/Kitchen Supplies', period),
        children: [
          {
            id: 'cleaning-supplies',
            name: 'Cleaning Supplies',
            amount: getValueByName('600-601 Cleaning Supplies', period),
            pctOfRevenue: getPctByName('600-601 Cleaning Supplies', period),
          },
          {
            id: 'disposables',
            name: 'Disposables',
            amount: getValueByName('600-602 Disposables', period),
            pctOfRevenue: getPctByName('600-602 Disposables', period),
          },
          {
            id: 'linen',
            name: 'Linen',
            amount: getValueByName('600-603 Linen', period),
            pctOfRevenue: getPctByName('600-603 Linen', period),
          },
          {
            id: 'office-supplies',
            name: 'Office Supplies',
            amount: getValueByName('600-605 Office Supplies', period),
            pctOfRevenue: getPctByName('600-605 Office Supplies', period),
          },
          {
            id: 'smallware',
            name: 'Smallware',
            amount: getValueByName('600-606 Smallware', period),
            pctOfRevenue: getPctByName('600-606 Smallware', period),
          },
          {
            id: 'tools-equipment',
            name: 'Tools/Equipment/General',
            amount: getValueByName('600-607 Tools/Equipments/General', period),
            pctOfRevenue: getPctByName('600-607 Tools/Equipments/General', period),
          },
          {
            id: 'uniforms',
            name: 'Uniforms',
            amount: getValueByName('600-608 Uniforms', period),
            pctOfRevenue: getPctByName('600-608 Uniforms', period),
          },
        ]
      },
    ]
  };
}

// ===== GENERAL & ADMINISTRATIVE SECTION =====
export function getGAHierarchy(period: string = TOTAL_KEY): HierarchicalAccount {
  return {
    id: 'general-admin',
    name: 'General & Administrative',
    amount: getValueByName('Total for 601-000 General & Administrative', period),
    pctOfRevenue: getPctByName('Total for 601-000 General & Administrative', period),
    isTotal: true,
    children: [
      {
        id: 'expenses-misc',
        name: 'Expenses - Misc.',
        amount: getValueByName('Total for 601-100 Expenses - Misc.', period),
        pctOfRevenue: getPctByName('Total for 601-100 Expenses - Misc.', period),
        children: [
          {
            id: 'year-end-party',
            name: 'Annual Year End Party',
            amount: getValueByName('601-200 Annual Year End Party', period),
            pctOfRevenue: getPctByName('601-200 Annual Year End Party', period),
          },
          {
            id: 'bank-service-charges',
            name: 'Bank Service Charges',
            amount: getValueByName('601-210 Bank Service Charges', period),
            pctOfRevenue: getPctByName('601-210 Bank Service Charges', period),
          },
          {
            id: 'ground-transportation',
            name: 'Ground Transportation',
            amount: getValueByName('601-240 Ground Transportation', period),
            pctOfRevenue: getPctByName('601-240 Ground Transportation', period),
          },
          {
            id: 'meals-entertainment',
            name: 'Meals and Entertainment',
            amount: getValueByName('601-250 Meals and Entertainment', period),
            pctOfRevenue: getPctByName('601-250 Meals and Entertainment', period),
          },
          {
            id: 'over-short',
            name: 'Over/Short',
            amount: getValueByName('601-270 Over/Short', period),
            pctOfRevenue: getPctByName('601-270 Over/Short', period),
          },
        ]
      },
      {
        id: 'it',
        name: 'Information Technology',
        amount: getValueByName('Total for 601-290 Informational Technology', period),
        pctOfRevenue: getPctByName('Total for 601-290 Informational Technology', period),
        children: [
          {
            id: 'hardware',
            name: 'Hardware',
            amount: getValueByName('601-300 Hardware', period),
            pctOfRevenue: getPctByName('601-300 Hardware', period),
          },
          {
            id: 'pos-it-support',
            name: 'POS System Repair / IT Support',
            amount: getValueByName('601-310 POS System Repair / IT Support', period),
            pctOfRevenue: getPctByName('601-310 POS System Repair / IT Support', period),
          },
          {
            id: 'software',
            name: 'Software',
            amount: getValueByName('601-320 Software', period),
            pctOfRevenue: getPctByName('601-320 Software', period),
          },
        ]
      },
      {
        id: 'insurance',
        name: 'Insurance Expense',
        amount: getValueByName('Total for 601-350 Insurance Expense', period),
        pctOfRevenue: getPctByName('Total for 601-350 Insurance Expense', period),
        children: [
          {
            id: 'disability-pfl',
            name: 'Disability / PFL',
            amount: getValueByName('601-360 Disability / PFL', period),
            pctOfRevenue: getPctByName('601-360 Disability / PFL', period),
          },
          {
            id: 'general-liability',
            name: 'General Liability Insurance',
            amount: getValueByName('601-380 General Liability Insurance', period),
            pctOfRevenue: getPctByName('601-380 General Liability Insurance', period),
          },
          {
            id: 'workers-comp',
            name: 'Workers Comp',
            amount: getValueByName('601-400 Workers Comp', period),
            pctOfRevenue: getPctByName('601-400 Workers Comp', period),
          },
        ]
      },
      {
        id: 'licenses-permits',
        name: 'Licenses & Permits',
        amount: getValueByName('Total for 601-450 Licenses & Permits', period),
        pctOfRevenue: getPctByName('Total for 601-450 Licenses & Permits', period),
        children: [
          {
            id: 'health-permit',
            name: 'Health Permit',
            amount: getValueByName('601-530 Health Permit', period),
            pctOfRevenue: getPctByName('601-530 Health Permit', period),
          },
          {
            id: 'liquor-license',
            name: 'Liquor License Tax',
            amount: getValueByName('601-550 Liquor License Tax', period),
            pctOfRevenue: getPctByName('601-550 Liquor License Tax', period),
          },
        ]
      },
      {
        id: 'professional-fees',
        name: 'Professional Fees',
        amount: getValueByName('Total for 601-570 Professional Fees', period),
        pctOfRevenue: getPctByName('Total for 601-570 Professional Fees', period),
        children: [
          {
            id: 'accounting',
            name: 'Accounting',
            amount: getValueByName('601-580 Accounting', period),
            pctOfRevenue: getPctByName('601-580 Accounting', period),
          },
        ]
      },
      {
        id: 'research-development',
        name: 'Research & Development',
        amount: getValueByName('601-710 Research & Development', period),
        pctOfRevenue: getPctByName('601-710 Research & Development', period),
      },
    ]
  };
}

// ===== OCCUPANCY SECTION =====
export function getOccupancyHierarchy(period: string = TOTAL_KEY): HierarchicalAccount {
  return {
    id: 'occupancy',
    name: 'Occupancy',
    amount: getValueByName('Total for 602-000 Occupancy', period),
    pctOfRevenue: getPctByName('Total for 602-000 Occupancy', period),
    isTotal: true,
    children: [
      {
        id: 'real-estate-taxes',
        name: 'Real Estate Taxes',
        amount: getValueByName('602-040 Real Estate Taxes', period),
        pctOfRevenue: getPctByName('602-040 Real Estate Taxes', period),
      },
      {
        id: 'rent',
        name: 'Rent',
        amount: getValueByName('602-100 Rent', period),
        pctOfRevenue: getPctByName('602-100 Rent', period),
      },
      {
        id: 'utilities',
        name: 'Utilities',
        amount: getValueByName('Total for 602-200 Utilities', period),
        pctOfRevenue: getPctByName('Total for 602-200 Utilities', period),
        children: [
          {
            id: 'electricity',
            name: 'Electricity',
            amount: getValueByName('602-210 Electricity', period),
            pctOfRevenue: getPctByName('602-210 Electricity', period),
          },
          {
            id: 'telephone-internet',
            name: 'Telephone & Internet',
            amount: getValueByName('602-280 Telephone & Internet', period),
            pctOfRevenue: getPctByName('602-280 Telephone & Internet', period),
          },
          {
            id: 'water-sewer',
            name: 'Water/Sewer',
            amount: getValueByName('602-330 Water/Sewer', period),
            pctOfRevenue: getPctByName('602-330 Water/Sewer', period),
          },
        ]
      },
    ]
  };
}

// ===== COMPLETE P&L HIERARCHY =====
export function getCompletePLHierarchy(period: string = TOTAL_KEY) {
  const income = getIncomeHierarchy(period);
  const cogs = getCOGSHierarchy(period);
  const grossProfit = income.amount - cogs.amount;
  const payroll = getPayrollHierarchy(period);
  const directOps = getDirectOperatingCostsHierarchy(period);
  const ga = getGAHierarchy(period);
  const occupancy = getOccupancyHierarchy(period);
  
  const totalExpenses = payroll.amount + directOps.amount + ga.amount + occupancy.amount;
  const netOperatingIncome = grossProfit - totalExpenses;
  
  return {
    income,
    cogs,
    grossProfit: {
      id: 'gross-profit',
      name: 'Gross Profit',
      amount: grossProfit,
      pctOfRevenue: income.amount > 0 ? (grossProfit / income.amount) * 100 : 0,
      isTotal: true,
    },
    expenses: {
      id: 'expenses',
      name: 'Expenses',
      amount: totalExpenses,
      pctOfRevenue: income.amount > 0 ? (totalExpenses / income.amount) * 100 : 0,
      isTotal: true,
      children: [payroll, directOps, ga, occupancy]
    },
    netOperatingIncome: {
      id: 'net-operating-income',
      name: 'Net Operating Income',
      amount: netOperatingIncome,
      pctOfRevenue: income.amount > 0 ? (netOperatingIncome / income.amount) * 100 : 0,
      isTotal: true,
    }
  };
}

// ===== HELPER: Flatten hierarchy for listing =====
export function flattenHierarchy(account: HierarchicalAccount, depth: number = 0): Array<HierarchicalAccount & { depth: number }> {
  const result: Array<HierarchicalAccount & { depth: number }> = [];
  result.push({ ...account, depth });
  if (account.children) {
    for (const child of account.children) {
      result.push(...flattenHierarchy(child, depth + 1));
    }
  }
  return result;
}

// ===== SUMMARY FUNCTIONS FOR QUICK ACCESS =====
export function getTotalExpenses(period: string = TOTAL_KEY): number {
  return getValueByName('Total for Expenses', period);
}

export function getNetOperatingIncome(period: string = TOTAL_KEY): number {
  return getValueByName('Net Operating Income', period);
}

export function getGrossProfit(period: string = TOTAL_KEY): number {
  return getValueByName('Gross Profit', period);
}
