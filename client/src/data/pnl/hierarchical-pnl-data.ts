// P&L Hierarchy Types
export type VarianceLevel = 'critical' | 'attention' | 'favorable' | 'normal';
export type LineItemType = 'revenue' | 'expense' | 'subtotal';

export interface PnLLineItem {
  id: string;
  name: string;
  current: number;
  prior: number;
  type: LineItemType;
  children?: PnLLineItem[];
  relatedMetrics?: { id: string; name: string }[];
}

export interface VarianceInfo {
  level: VarianceLevel;
  reason: string;
  variance: number;
  variancePct: number;
}

// Hierarchical P&L data structure - Complete Excel Coverage (October 2025 vs September 2025)
export const hierarchicalPnlData: PnLLineItem[] = [
  {
    id: 'income',
    name: 'Revenue',
    current: 146662.43,
    prior: 133041.81,
    type: 'revenue',
    relatedMetrics: [{ id: 'cogs', name: 'COGS' }],
    children: [
      { id: 'food-sales', name: 'Food Sales', current: 113360.78, prior: 103461.46, type: 'revenue' },
      { id: 'beverage-sales', name: 'Beverage Sales', current: 19998.35, prior: 17698.00, type: 'revenue',
        children: [
          { id: 'alcohol-bevs', name: 'Alcohol Beverages', current: 2300.00, prior: 2622.00, type: 'revenue' },
          { id: 'n-a-beverage', name: 'N/A Beverage', current: 17698.35, prior: 15076.00, type: 'revenue' },
        ]
      },
      { id: 'delivery-sales', name: 'Delivery Sales', current: 20341.37, prior: 19727.58, type: 'revenue',
        children: [
          { id: 'classpass', name: 'ClassPass', current: 61.66, prior: 192.04, type: 'revenue' },
          { id: 'doordash', name: 'DoorDash', current: 4458.87, prior: 5269.80, type: 'revenue' },
          { id: 'ezcater', name: 'ezCater', current: 0, prior: 1890.00, type: 'revenue' },
          { id: 'fantuan', name: 'Fantuan', current: 484.90, prior: 215.75, type: 'revenue' },
          { id: 'grubhub', name: 'GrubHub', current: 2212.00, prior: 1784.00, type: 'revenue' },
          { id: 'hungrypanda', name: 'HungryPanda', current: 528.03, prior: 64.70, type: 'revenue' },
          { id: 'ubereats', name: 'UberEats', current: 10553.88, prior: 10311.29, type: 'revenue' },
        ]
      },
      { id: 'events-offpremise', name: 'Events / Off-Premise Sales', current: 0, prior: 0, type: 'revenue' },
      { id: 'comps-discount', name: 'Comps / Discount', current: -7038.07, prior: -7845.23, type: 'revenue' },
    ]
  },
  {
    id: 'cogs',
    name: 'Cost of Goods Sold',
    current: 66075.18,
    prior: 52536.14,
    type: 'expense',
    relatedMetrics: [{ id: 'income', name: 'Revenue' }],
    children: [
      { id: 'food-cost', name: 'Food Cost', current: 7699.12, prior: 5184.83, type: 'expense',
        children: [
          { id: 'dairy', name: 'Dairy', current: 1958.16, prior: 1858.85, type: 'expense' },
          { id: 'dry-goods', name: 'Dry Goods', current: 3189.78, prior: 1533.06, type: 'expense' },
          { id: 'produce', name: 'Produce', current: 2551.18, prior: 1792.92, type: 'expense' },
        ]
      },
      { id: 'beverage-cost', name: 'Beverage Cost', current: 2693.99, prior: 2393.45, type: 'expense',
        children: [
          { id: 'beer-wine-cider', name: 'Beer/Wine/Cider', current: 910.70, prior: 976.12, type: 'expense' },
          { id: 'coffee-tea', name: 'Coffee/Tea', current: 1341.49, prior: 995.37, type: 'expense' },
          { id: 'juice-soda-water', name: 'Juice/Soda/Water', current: 441.80, prior: 421.96, type: 'expense' },
        ]
      },
      { id: 'commissary-food', name: 'Commissary Food', current: 28104.50, prior: 19847.40, type: 'expense',
        children: [
          { id: 'ice-cream', name: 'Ice Cream', current: 12117.00, prior: 8954.41, type: 'expense' },
        ]
      },
      { id: 'direct-labor-cost', name: 'Direct Labor Cost', current: 15460.57, prior: 16156.05, type: 'expense',
        children: [
          { id: 'dishwasher', name: 'Dishwasher', current: 3115.56, prior: 3087.86, type: 'expense' },
          { id: 'dishwasher-overtime', name: 'Dishwasher Overtime', current: 198.01, prior: 278.45, type: 'expense' },
          { id: 'server-plater', name: 'Server/Plater', current: 12029.43, prior: 12731.99, type: 'expense' },
          { id: 'server-plater-overtime', name: 'Server/Plater Overtime', current: 117.57, prior: 57.75, type: 'expense' },
        ]
      },
    ]
  },
  {
    id: 'gross-profit',
    name: 'Gross Profit',
    current: 80587.25,
    prior: 80505.67,
    type: 'subtotal',
  },
  {
    id: 'expenses',
    name: 'Operating Expenses',
    current: 75471.70,
    prior: 61429.50,
    type: 'expense',
    children: [
      { id: 'payroll-expenses', name: 'Payroll Expenses', current: 21250, prior: 16948.93, type: 'expense',
        children: [
           { id: 'salaries-wages', name: 'Salaries & Wages', current: 18000, prior: 14249.14, type: 'expense' },
        ]
      },
      { id: 'direct-operating-costs', name: 'Direct Operating Costs', current: 26000, prior: 21379.69, type: 'expense',
        children: [
          { id: 'delivery-service-fees', name: 'Delivery Service Fees', current: 6500, prior: 5241.57, type: 'expense' },
          { id: 'marketing-pr', name: 'Marketing & PR', current: 1200, prior: 989.25, type: 'expense' },
        ]
      },
      { id: 'general-admin', name: 'General & Administrative', current: 5000, prior: 3870.86, type: 'expense',
        children: [
          { id: 'general-liability', name: 'General Liability Insurance', current: 900, prior: 900, type: 'expense' },
          { id: 'workers-comp', name: 'Workers Comp', current: 800, prior: 800, type: 'expense' },
        ]
      },
      { id: 'licenses-permits', name: 'Licenses & Permits', current: 125.82, prior: 145.35, type: 'expense',
        children: [
          { id: 'health-permit', name: 'Health Permit', current: 125.82, prior: 145.35, type: 'expense' },
          { id: 'liquor-license', name: 'Liquor License Tax', current: 0, prior: 0, type: 'expense' },
        ]
      },
      { id: 'professional-fees', name: 'Professional Fees', current: 379, prior: 359, type: 'expense',
        children: [
          { id: 'accounting', name: 'Accounting', current: 379, prior: 359, type: 'expense' },
        ]
      },
      { id: 'research-development', name: 'Research & Development', current: 0, prior: 0, type: 'expense' },
    ]
  },
  { id: 'occupancy', name: 'Occupancy', current: 17053.5, prior: 19305.08, type: 'expense',
    children: [
      { id: 'real-estate-taxes', name: 'Real Estate Taxes', current: 1857.65, prior: 3836.5, type: 'expense' },
      { id: 'rent', name: 'Rent', current: 12000, prior: 12400, type: 'expense' },
      { id: 'utilities', name: 'Utilities', current: 3195.85, prior: 3068.58, type: 'expense',
        children: [
          { id: 'electricity', name: 'Electricity', current: 2195.85, prior: 2068.58, type: 'expense' },
          { id: 'telephone-internet', name: 'Telephone & Internet', current: 500, prior: 500, type: 'expense' },
          { id: 'water-sewer', name: 'Water/Sewer', current: 500, prior: 500, type: 'expense' },
        ]
      },
    ]
  },
  {
    id: 'net-income',
    name: 'Net Operating Income',
    current: 5115.55,
    prior: 19076.17,
    type: 'subtotal',
  }
];
