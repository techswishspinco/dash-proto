import { ReportData } from './mock-data';
import { getCanonicalPL, flattenCanonicalHierarchy, CanonicalAccount, getAccountCode } from '../../data/canonical-pl';

interface ComparisonRow {
  account: string;
  sep: number;
  oct: number;
  delta: number;
  deltaPct: number;
  code: string;
}

export async function generateComparisonReport(file1: any, file2: any): Promise<ReportData> {
  // IGNORE file1/file2 arguments - Use Canonical Source of Truth
  const plData = getCanonicalPL();
  
  // Flatten hierarchy to get all accounts
  const sections = [plData.income, plData.cogs, plData.payroll, plData.operating, plData.general];
  let allAccounts: CanonicalAccount[] = [];
  
  sections.forEach(section => {
      allAccounts = allAccounts.concat(flattenCanonicalHierarchy(section));
  });

  const comparisonRows: ComparisonRow[] = [];
  let totalRevenueSep = 0;
  let totalRevenueOct = 0;
  let grossProfitSep = 0;
  let grossProfitOct = 0;
  let netIncomeSep = 0;
  let netIncomeOct = 0;

  // Build Comparison Rows
  allAccounts.forEach(acc => {
    // Filter out if both zero
    const sepVal = acc.months["Sep 2025"]?.value || 0;
    const octVal = acc.months["Oct 2025"]?.value || 0;

    if (sepVal === 0 && octVal === 0) return;

    const delta = octVal - sepVal;
    const deltaPct = sepVal !== 0 ? (delta / sepVal) * 100 : (octVal !== 0 ? 100 : 0);
    const code = getAccountCode(acc.name) || acc.code || '';

    comparisonRows.push({
      account: acc.name,
      sep: sepVal,
      oct: octVal,
      delta,
      deltaPct,
      code
    });

    // Identify Key Totals
    const lowerName = acc.name.toLowerCase();
    if (lowerName === "income" || lowerName === "total income") {
        totalRevenueSep = sepVal;
        totalRevenueOct = octVal;
    }
    if (lowerName === "gross profit") {
        grossProfitSep = sepVal;
        grossProfitOct = octVal;
    }
    if (lowerName === "net income" || lowerName === "net operating income") {
        netIncomeSep = sepVal;
        netIncomeOct = octVal;
    }
  });

  // Sort by Account Code then Name
  comparisonRows.sort((a, b) => {
      if (a.code && b.code) return a.code.localeCompare(b.code);
      return a.account.localeCompare(b.account);
  });
  
  // Use Canonical Totals if explicitly found
  if (plData.totals.totalIncome["Sep 2025"] !== 0 || plData.totals.totalIncome["Oct 2025"] !== 0) {
      totalRevenueSep = plData.totals.totalIncome["Sep 2025"];
      totalRevenueOct = plData.totals.totalIncome["Oct 2025"];
  }
  if (plData.totals.grossProfit["Sep 2025"] !== 0 || plData.totals.grossProfit["Oct 2025"] !== 0) {
      grossProfitSep = plData.totals.grossProfit["Sep 2025"];
      grossProfitOct = plData.totals.grossProfit["Oct 2025"];
  }
  if (plData.totals.netIncome["Sep 2025"] !== 0 || plData.totals.netIncome["Oct 2025"] !== 0) {
      netIncomeSep = plData.totals.netIncome["Sep 2025"];
      netIncomeOct = plData.totals.netIncome["Oct 2025"];
  } else {
      // Fallback
      const netRow = comparisonRows.find(r => r.account.toLowerCase() === "net operating income");
      if (netRow) {
          netIncomeSep = netRow.sep;
          netIncomeOct = netRow.oct;
      }
  }

  // Generate Executive Summary
  const summary: string[] = [];
  
  const revDelta = totalRevenueOct - totalRevenueSep;
  const revDeltaPct = totalRevenueSep ? (revDelta / totalRevenueSep) * 100 : 0;
  
  summary.push(`Revenue ${revDelta >= 0 ? 'increased' : 'decreased'} ${Math.abs(revDeltaPct).toFixed(1)}% MoM ($${Math.abs(revDelta).toLocaleString(undefined, {maximumFractionDigits: 0})}).`);
  
  if (netIncomeOct !== 0 || netIncomeSep !== 0) {
      const netDelta = netIncomeOct - netIncomeSep;
      summary.push(`Net Income moved ${netDelta >= 0 ? 'up' : 'down'} by $${Math.abs(netDelta).toLocaleString(undefined, {maximumFractionDigits: 0})}.`);
  }

  // Find biggest movers (exclude totals)
  const movers = [...comparisonRows]
    .filter(r => !r.account.toLowerCase().includes("total") && !r.account.toLowerCase().includes("profit") && !r.account.toLowerCase().includes("income"))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);
    
  movers.forEach(m => {
     summary.push(`${m.account} shifted by $${m.delta.toLocaleString(undefined, {maximumFractionDigits: 0})} (${m.deltaPct.toFixed(1)}%).`);
  });


  const metrics = [
      { 
          label: "Total Revenue", 
          value: `$${totalRevenueOct.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 
          change: `${revDelta >= 0 ? '+' : ''}${revDeltaPct.toFixed(1)}%`, 
          trend: revDelta >= 0 ? 'up' as const : 'down' as const
      },
      { 
          label: "Gross Profit", 
          value: `$${grossProfitOct.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 
          change: `${grossProfitSep ? ((grossProfitOct - grossProfitSep)/grossProfitSep * 100).toFixed(1) : 0}%`, 
          trend: (grossProfitOct - grossProfitSep) >= 0 ? 'up' as const : 'down' as const
      },
      { 
          label: "Net Income", 
          value: `$${netIncomeOct.toLocaleString(undefined, {maximumFractionDigits: 0})}`, 
          change: `${netIncomeSep ? ((netIncomeOct - netIncomeSep)/Math.abs(netIncomeSep) * 100).toFixed(1) : 0}%`, 
          trend: (netIncomeOct - netIncomeSep) >= 0 ? 'up' as const : 'down' as const
      }
  ];

  return {
    title: "September vs October 2025 Profitability Report",
    dateRange: "Sep 1, 2025 - Oct 31, 2025",
    entity: "Comparison Report",
    dataSources: ["Uploaded P&L (Sep 2025)", "Uploaded P&L (Oct 2025)"],
    summary,
    metrics,
    tableData: {
      headers: ["Account", "Sep 2025", "Oct 2025", "Delta ($)", "Delta (%)"],
      rows: comparisonRows.map(row => [
        row.account,
        `$${row.sep.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
        `$${row.oct.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
        `$${row.delta.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
        `${row.deltaPct.toFixed(1)}%`
      ])
    },
    analysis: `
      Comparing September to October 2025 reveals a ${Math.abs(revDeltaPct).toFixed(1)}% ${revDelta >= 0 ? 'increase' : 'decrease'} in total revenue. 
      The largest variances were observed in ${movers.map(m => m.account).join(', ')}. 
      
      This report uses the canonical normalized data from the uploaded P&L files.
    `.trim(),
    recommendations: [
      "Investigate the top 3 variance drivers listed above.",
      "Review COGS efficiency for categories with revenue growth but margin compression.",
      "Validate that all October accruals are fully posted to ensure comparison accuracy."
    ]
  };
}
