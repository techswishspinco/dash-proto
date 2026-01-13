import sepDataRaw from './source-sep-2025.json';
import octDataRaw from './source-oct-2025.json';

// Types for Source Data (Sep 2025 - Array Based)
interface SepMonthlyData {
  current: number | null;
  percent_of_income: number | null;
}

interface SepAccount {
  account: string;
  monthly_data: Record<string, SepMonthlyData>;
}

interface SepFile {
  metadata: any;
  accounts: SepAccount[];
}

// Types for Source Data (Oct 2025 - Object/Section Based)
interface OctMonthlyData {
  current: number | null;
  percent: number | null;
}

// Recursive type for nested sections
type OctSection = {
    [key: string]: OctSection | OctMonthlyData | any; 
};

interface OctFile {
  sections: Record<string, OctSection>;
}

const SEP_SOURCE = sepDataRaw as SepFile;
const OCT_SOURCE = octDataRaw as unknown as OctFile; // Type assertion needed due to complex structure

// Canonical Types
export interface CanonicalMonthlyValue {
  value: number;
  percentOfRevenue: number;
}

export interface CanonicalAccount {
  id: string; // normalized ID (lowercase, no codes)
  name: string; // Display name (no codes)
  code?: string; // Internal use only
  indentationLevel: number; // 0 for root, 1 for child, etc.
  isTotal: boolean;
  months: Record<string, CanonicalMonthlyValue>;
  children?: CanonicalAccount[];
}

export interface CanonicalPL {
  income: CanonicalAccount;
  cogs: CanonicalAccount;
  labor: CanonicalAccount;
  operating: CanonicalAccount; // Direct Operating Costs
  payroll: CanonicalAccount;   // Payroll Expenses
  general: CanonicalAccount;   // General & Admin
  totals: {
    totalIncome: Record<string, number>;
    totalCOGS: Record<string, number>;
    totalLabor: Record<string, number>;
    totalPrimeCost: Record<string, number>;
    grossProfit: Record<string, number>;
    netIncome: Record<string, number>;
  };
}

// Helper: Normalize Account Name (Strip codes)
export function normalizeAccountName(rawName: string): string {
  // Removes "400-000 " prefix pattern
  return rawName.replace(/^\d{3}-\d{3}\s*/, '').trim();
}

// Helper: Get Account Code
export function getAccountCode(rawName: string): string | undefined {
  const match = rawName.match(/^(\d{3}-\d{3})/);
  return match ? match[1] : undefined;
}

// Helper: Normalize ID
export function normalizeId(name: string): string {
  return normalizeAccountName(name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Helper: Get Data from Sep File for a specific month
function getSepDataForMonth(accountName: string, accountCode: string | undefined, longMonth: string): CanonicalMonthlyValue {
  // 1. Try exact match
  let account = SEP_SOURCE.accounts.find(a => a.account === accountName);
  
  // 2. Try code match
  if (!account && accountCode) {
    account = SEP_SOURCE.accounts.find(a => a.account.startsWith(accountCode));
  }

  // 3. Try normalized name match
  if (!account) {
    const normName = normalizeAccountName(accountName);
    account = SEP_SOURCE.accounts.find(a => normalizeAccountName(a.account) === normName);
  }

  if (account && account.monthly_data[longMonth]) {
    return {
      value: account.monthly_data[longMonth].current || 0,
      percentOfRevenue: account.monthly_data[longMonth].percent_of_income || 0
    };
  }

  return { value: 0, percentOfRevenue: 0 };
}

// Wrapper for simple Sep 2025 access (Backward compatibility for internal helpers)
function getSepData(accountName: string): CanonicalMonthlyValue {
    return getSepDataForMonth(accountName, getAccountCode(accountName), "September 2025");
}

// Helper: Traverse Oct File recursively to find data and build hierarchy
function processOctSection(
  sectionData: any, 
  sectionName: string, 
  depth: number = 0
): CanonicalAccount[] {
  const accounts: CanonicalAccount[] = [];

  Object.entries(sectionData).forEach(([key, value]) => {
    // Skip if it's metadata or monthly data key itself
    // In Oct file, if the value has "Oct 2025", it's an account line.
    const valObj = value as any;
    const isAccount = valObj && (valObj["Oct 2025"] !== undefined || valObj["Total"] !== undefined);
    
    if (!isAccount && key !== "Total") {
       // It might be just a container node? Or maybe structure is different.
       // Inspecting the file: keys are Account Names, values are objects containing Months.
    }

    const isTotal = key === "Total" || key.startsWith("Total for");
    const name = isTotal ? "Total" : normalizeAccountName(key);
    const code = getAccountCode(key);
    const id = normalizeId(name);

    // Build Monthly Data Map
    const months: Record<string, CanonicalMonthlyValue> = {};
    
    // List of months to process
    const monthMap = [
        { short: "Jan 2025", long: "January 2025" },
        { short: "Feb 2025", long: "February 2025" },
        { short: "Mar 2025", long: "March 2025" },
        { short: "Apr 2025", long: "April 2025" },
        { short: "May 2025", long: "May 2025" },
        { short: "Jun 2025", long: "June 2025" },
        { short: "Jul 2025", long: "July 2025" },
        { short: "Aug 2025", long: "August 2025" },
        { short: "Sep 2025", long: "September 2025" },
        { short: "Oct 2025", long: "October 2025" },
    ];

    monthMap.forEach(m => {
        if (m.short === "Sep 2025") {
             // Rule: Use September from September JSON
             months[m.short] = getSepDataForMonth(key, code, m.long);
        } else if (m.short === "Oct 2025") {
             // Rule: Use October from October JSON
             if (valObj["Oct 2025"]) {
                 months[m.short] = {
                     value: valObj["Oct 2025"].current || 0,
                     percentOfRevenue: valObj["Oct 2025"].percent || 0
                 };
             } else {
                 months[m.short] = { value: 0, percentOfRevenue: 0 };
             }
        } else {
             // Other months: Prefer Oct JSON (Jan-Aug) if available, fallback to Sep JSON
             // Oct JSON uses short names "Jan 2025"
             if (valObj[m.short]) {
                 months[m.short] = {
                     value: valObj[m.short].current || 0,
                     percentOfRevenue: valObj[m.short].percent || 0
                 };
             } else {
                 // Fallback to Sep File
                 months[m.short] = getSepDataForMonth(key, code, m.long);
             }
        }
    });

    const account: CanonicalAccount = {
      id,
      name,
      code,
      indentationLevel: depth,
      isTotal,
      months
    };

    // Recursively process children
    const potentialChildren: Record<string, any> = {};
    if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subVal]) => {
            // Heuristic to identify child accounts
            if (subKey !== "current" && subKey !== "percent" && !subKey.match(/^[A-Z][a-z]{2} \d{4}$/) && subKey !== "Total") {
                potentialChildren[subKey] = subVal;
            }
        });
    }

    if (Object.keys(potentialChildren).length > 0) {
        account.children = processOctSection(potentialChildren, key, depth + 1);
    }
    
    accounts.push(account);
  });

  return accounts;
}


// MAIN PARSER
let CACHED_CANONICAL_DATA: CanonicalPL | null = null;

// Helper to build hierarchy from flat Sep data for missing sections
function buildHierarchyFromSep(sectionPrefix: string, rootId: string, rootName: string): CanonicalAccount {
    const relevantAccounts = SEP_SOURCE.accounts.filter(a => a.account.startsWith(sectionPrefix));
    
    const children: CanonicalAccount[] = relevantAccounts.map(a => {
        const name = normalizeAccountName(a.account);
        const code = getAccountCode(a.account);
        const id = normalizeId(name);
        
        const months: Record<string, CanonicalMonthlyValue> = {};
        const monthMap = [
            { short: "Jan 2025", long: "January 2025" },
            { short: "Feb 2025", long: "February 2025" },
            { short: "Mar 2025", long: "March 2025" },
            { short: "Apr 2025", long: "April 2025" },
            { short: "May 2025", long: "May 2025" },
            { short: "Jun 2025", long: "June 2025" },
            { short: "Jul 2025", long: "July 2025" },
            { short: "Aug 2025", long: "August 2025" },
            { short: "Sep 2025", long: "September 2025" },
            { short: "Oct 2025", long: "October 2025" },
        ];
        
        monthMap.forEach(m => {
            if (m.short === "Oct 2025") {
                months[m.short] = { value: 0, percentOfRevenue: 0 }; // Missing in Oct file
            } else {
                months[m.short] = {
                    value: a.monthly_data[m.long]?.current || 0,
                    percentOfRevenue: a.monthly_data[m.long]?.percent_of_income || 0
                };
            }
        });

        return {
            id,
            name,
            code,
            indentationLevel: 1,
            isTotal: a.account.toLowerCase().includes("total"),
            months
        };
    });

    const rootMonths: Record<string, CanonicalMonthlyValue> = {};
     const monthMap = [
            { short: "Jan 2025", long: "January 2025" },
            { short: "Feb 2025", long: "February 2025" },
            { short: "Mar 2025", long: "March 2025" },
            { short: "Apr 2025", long: "April 2025" },
            { short: "May 2025", long: "May 2025" },
            { short: "Jun 2025", long: "June 2025" },
            { short: "Jul 2025", long: "July 2025" },
            { short: "Aug 2025", long: "August 2025" },
            { short: "Sep 2025", long: "September 2025" },
            { short: "Oct 2025", long: "October 2025" },
    ];
    
    monthMap.forEach(m => {
        if (m.short === "Oct 2025") {
             rootMonths[m.short] = { value: 0, percentOfRevenue: 0 };
        } else {
             rootMonths[m.short] = getSepDataForMonth(`Total for ${sectionPrefix} ${rootName}`, undefined, m.long) || getSepDataForMonth(rootName, undefined, m.long);
        }
    });

    return {
        id: rootId,
        name: rootName,
        indentationLevel: 0,
        isTotal: true,
        months: rootMonths,
        children
    };
}

export function getCanonicalPL(): CanonicalPL {
  if (CACHED_CANONICAL_DATA) return CACHED_CANONICAL_DATA;

  // We primarily drive structure from the OCT file as it seems more hierarchical in the JSON
  // But we map strict sections.

  // INCOME
  const incomeAccounts = processOctSection(OCT_SOURCE.sections["Income"], "Income");
  const incomeRoot: CanonicalAccount = {
      id: "income",
      name: "Income",
      indentationLevel: 0,
      isTotal: true,
      months: {
          "Sep 2025": getSepData("Income"), 
          "Oct 2025": { 
              value: (OCT_SOURCE.sections["Income"] as any)?.Total?.current || 0,
              percentOfRevenue: 100 
          },
          // Should ideally populate other months too for consistency, but for root it's computed
      },
      children: incomeAccounts
  };

  // COGS
  const cogsAccounts = processOctSection(OCT_SOURCE.sections["Cost of Goods Sold"], "Cost of Goods Sold");
  const cogsRoot: CanonicalAccount = {
      id: "cogs",
      name: "Cost of Goods Sold",
      indentationLevel: 0,
      isTotal: true,
      months: {
          "Sep 2025": getSepData("Total for Cost of Goods Sold"),
           "Oct 2025": { 
               value: (OCT_SOURCE.sections["Cost of Goods Sold"] as any)?.Total?.current || 0,
               percentOfRevenue: (OCT_SOURCE.sections["Cost of Goods Sold"] as any)?.Total?.percent || 0
           }
      },
      children: cogsAccounts
  };
  
  // SECTIONS MISSING IN OCT FILE (Reconstructed from Sep File)
  // Payroll (599-350)
  const payrollRoot = buildHierarchyFromSep("599-350", "payroll", "Payroll Expenses");
  
  // Direct Operating Costs (600-100)
  const operatingRoot = buildHierarchyFromSep("600-100", "operating", "Direct Operating Costs");
  
  // General & Admin (600-800?? Need to check Sep file for code)
  // Checking Sep grep... didn't grep G&A. Assuming standard or maybe it's "Admin/Marketing" (599-670) which is under Payroll?
  // Let's use a generic catch-all or just placeholder if unsure. 
  // pl-parser.ts had "Direct Operating Costs" and "Payroll".
  const generalRoot: CanonicalAccount = { 
      id: "general", 
      name: "General & Admin", 
      indentationLevel: 0, 
      isTotal: true, 
      months: { "Sep 2025": {value:0, percentOfRevenue:0}, "Oct 2025": {value:0, percentOfRevenue:0} } 
  };
  
  // Calculate Totals
  const totalIncomeSep = getSepData("Total for Income").value || getSepData("Income").value;
  const totalIncomeOct = (OCT_SOURCE.sections["Total Income"] as any)?.["Oct 2025"]?.current || 0;

  CACHED_CANONICAL_DATA = {
      income: incomeRoot,
      cogs: cogsRoot,
      labor: { id: "labor", name: "Labor", indentationLevel: 0, isTotal: true, months: {} }, // Labor is likely inside COGS/Payroll in this chart of accounts
      operating: operatingRoot,
      payroll: payrollRoot,
      general: generalRoot,
      totals: {
          totalIncome: { "Sep 2025": totalIncomeSep, "Oct 2025": totalIncomeOct },
          totalCOGS: { "Sep 2025": cogsRoot.months["Sep 2025"].value, "Oct 2025": cogsRoot.months["Oct 2025"].value },
          totalLabor: { "Sep 2025": 0, "Oct 2025": 0 }, // Would need to extract from COGS/Payroll if needed
          totalPrimeCost: { "Sep 2025": 0, "Oct 2025": 0 },
          grossProfit: { "Sep 2025": totalIncomeSep - cogsRoot.months["Sep 2025"].value, "Oct 2025": totalIncomeOct - cogsRoot.months["Oct 2025"].value },
          netIncome: { "Sep 2025": 0, "Oct 2025": 0 }
      }
  };

  return CACHED_CANONICAL_DATA;
}

// ACCESSOR METHODS FOR REPORTS

// Search recursively for an account by ID or Name
function findAccount(nodes: CanonicalAccount[], searchName: string): CanonicalAccount | null {
    const normSearch = normalizeId(searchName);
    for (const node of nodes) {
        if (node.id === normSearch || normalizeAccountName(node.name).toLowerCase() === normSearch) {
            return node;
        }
        if (node.children) {
            const found = findAccount(node.children, searchName);
            if (found) return found;
        }
    }
    return null;
}

export function getAccountValue(accountName: string, month: string): number {
    const data = getCanonicalPL();
    // Search in all main sections
    const sections = [data.income, data.cogs, data.payroll, data.operating, data.general];
    const account = findAccount(sections, accountName);
    // Handle partial match or normalization if needed
    // month should be "Sep 2025" or "Oct 2025"
    if (account && account.months[month]) {
        return account.months[month].value;
    }
    return 0;
}

export function getAccountPercent(accountName: string, month: string): number {
    const data = getCanonicalPL();
    const sections = [data.income, data.cogs, data.payroll, data.operating, data.general];
    const account = findAccount(sections, accountName);
    if (account && account.months[month]) {
        return account.months[month].percentOfRevenue;
    }
    return 0;
}

// Helper to flatten hierarchy for table views
export function flattenCanonicalHierarchy(root: CanonicalAccount): CanonicalAccount[] {
    let flat: CanonicalAccount[] = [root];
    if (root.children) {
        root.children.forEach(child => {
            flat = flat.concat(flattenCanonicalHierarchy(child));
        });
    }
    return flat;
}
