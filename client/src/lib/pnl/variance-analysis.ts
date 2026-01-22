import type { PnLLineItem, VarianceInfo, VarianceLevel } from "@/data/pnl/hierarchical-pnl-data";

// Variance analysis function - uses % of profit for accurate critical status
export const analyzeVariance = (lineItem: PnLLineItem, netProfit: number): VarianceInfo => {
  const variance = lineItem.current - lineItem.prior;
  const variancePct = lineItem.prior !== 0 ? (variance / lineItem.prior) * 100 : 0;
  // Profit impact: how much does this variance eat into profit?
  const profitImpact = netProfit !== 0 ? Math.abs(variance / netProfit) * 100 : 0;

  const isExpense = lineItem.type === 'expense';
  const isPositiveChange = variance > 0;
  const isFavorable = isExpense ? !isPositiveChange : isPositiveChange;

  // Critical: variance exceeds 25% of profit OR (>15% line variance AND >$3,000)
  if (profitImpact > 25 || (Math.abs(variancePct) > 15 && Math.abs(variance) > 3000)) {
    return {
      level: isFavorable ? 'favorable' : 'critical',
      reason: `${isPositiveChange ? 'Up' : 'Down'} ${Math.abs(variancePct).toFixed(1)}% ($${Math.abs(variance).toLocaleString()}) • ${profitImpact.toFixed(0)}% of profit`,
      variance,
      variancePct
    };
  }

  // Attention: variance is 10-25% of profit OR >$2,000 impact
  if (profitImpact > 10 || Math.abs(variance) > 2000) {
    return {
      level: isFavorable ? 'favorable' : 'attention',
      reason: `${isPositiveChange ? 'Up' : 'Down'} ${Math.abs(variancePct).toFixed(1)}% ($${Math.abs(variance).toLocaleString()}) • ${profitImpact.toFixed(0)}% of profit`,
      variance,
      variancePct
    };
  }

  // Favorable check for improvements >5% of profit
  if (isFavorable && (profitImpact > 5 || Math.abs(variance) > 1000)) {
    return {
      level: 'favorable',
      reason: `${isPositiveChange ? 'Up' : 'Down'} ${Math.abs(variancePct).toFixed(1)}% ($${Math.abs(variance).toLocaleString()})`,
      variance,
      variancePct
    };
  }

  return { level: 'normal', reason: '', variance, variancePct };
};

// Count flagged items
export const countFlaggedItems = (items: PnLLineItem[], netProfit: number): { critical: number; attention: number; favorable: number } => {
  let counts = { critical: 0, attention: 0, favorable: 0 };

  const countRecursive = (lineItems: PnLLineItem[]) => {
    lineItems.forEach(item => {
      const variance = analyzeVariance(item, netProfit);
      if (variance.level === 'critical') counts.critical++;
      else if (variance.level === 'attention') counts.attention++;
      else if (variance.level === 'favorable') counts.favorable++;
      if (item.children) countRecursive(item.children);
    });
  };

  countRecursive(items);
  return counts;
};

// Filter items recursively - keep parent if any child matches
export const filterItemsByVariance = (items: PnLLineItem[], level: VarianceLevel, netProfit: number): PnLLineItem[] => {
  return items.reduce<PnLLineItem[]>((acc, item) => {
    const variance = analyzeVariance(item, netProfit);
    const itemMatches = variance.level === level;

    // Check if any children match
    const filteredChildren = item.children
      ? filterItemsByVariance(item.children, level, netProfit)
      : [];

    // Include item if it matches OR if it has matching children
    if (itemMatches || filteredChildren.length > 0) {
      acc.push({
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : item.children
      });
    }

    return acc;
  }, []);
};
