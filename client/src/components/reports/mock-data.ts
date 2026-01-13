
export type ReportType = 'profitability' | 'labor' | 'sales' | 'inventory';

export interface ReportData {
  title: string;
  dateRange: string;
  entity: string;
  dataSources: string[];
  summary: string[];
  metrics: {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  tableData: {
    headers: string[];
    rows: (string | number)[][];
  };
  analysis: string;
  recommendations?: string[];
}

export const MOCK_REPORTS: Record<ReportType, ReportData> = {
  profitability: {
    title: "Profitability Analysis",
    dateRange: "October 1 - October 31, 2024",
    entity: "Downtown Location",
    dataSources: ["P&L (Accrual)", "POS Sales"],
    summary: [
      "Net margin declined 2.3% MoM primarily due to labor inefficiency.",
      "Food cost remained stable at 28.4%, well within target.",
      "Beverage sales increased 5% driven by the new cocktail menu."
    ],
    metrics: [
      { label: "Revenue", value: "$142,500", change: "+4.2%", trend: "up" },
      { label: "Gross Profit", value: "$98,325", change: "+3.8%", trend: "up" },
      { label: "Net Profit", value: "$18,525", change: "-8.4%", trend: "down" },
      { label: "Net Margin", value: "13.0%", change: "-2.3%", trend: "down" }
    ],
    tableData: {
      headers: ["Category", "Oct 2024", "Sep 2024", "Variance", "Var %"],
      rows: [
        ["Total Revenue", "$142,500", "$136,750", "+$5,750", "+4.2%"],
        ["COGS - Food", "$29,925", "$28,717", "+$1,208", "+4.2%"],
        ["COGS - Bev", "$14,250", "$12,991", "+$1,259", "+9.7%"],
        ["Gross Profit", "$98,325", "$95,042", "+$3,283", "+3.5%"],
        ["Labor Cost", "$49,875", "$43,760", "+$6,115", "+14.0%"],
        ["OpEx", "$29,925", "$31,050", "-$1,125", "-3.6%"],
        ["Net Income", "$18,525", "$20,232", "-$1,707", "-8.4%"]
      ]
    },
    analysis: "While revenue growth remains strong (+4.2%), profitability was impacted significantly by a 14% increase in labor costs. This outpaced revenue growth, causing a margin compression. The increase appears to be driven by overtime hours in the kitchen and front-of-house staffing levels that did not align with actual demand patterns on Tuesdays and Wednesdays.",
    recommendations: [
      "Audit schedule vs. actual hours for BOH staff.",
      "Implement stricter overtime approval process.",
      "Review menu pricing on high-cost items."
    ]
  },
  labor: {
    title: "Labor Efficiency Report",
    dateRange: "October 1 - October 31, 2024",
    entity: "Downtown Location",
    dataSources: ["Payroll Summary", "Time & Attendance"],
    summary: [
      "Labor cost % hit 35%, exceeding the 32% target.",
      "Overtime hours increased by 45% vs. previous month.",
      "Sales per Labor Hour (SPLH) dropped to $45.20 (Target: $50+)."
    ],
    metrics: [
      { label: "Total Labor Cost", value: "$49,875", change: "+14.0%", trend: "up" },
      { label: "Labor %", value: "35.0%", change: "+3.2%", trend: "up" },
      { label: "Overtime Hours", value: "142 hrs", change: "+45%", trend: "up" },
      { label: "SPLH", value: "$45.20", change: "-$4.80", trend: "down" }
    ],
    tableData: {
      headers: ["Department", "Regular Hours", "OT Hours", "Total Cost", "% of Sales"],
      rows: [
        ["FOH Server", "1,250", "12", "$18,750", "13.2%"],
        ["FOH Bar", "420", "5", "$8,400", "5.9%"],
        ["BOH Kitchen", "850", "95", "$17,850", "12.5%"],
        ["BOH Prep", "200", "30", "$3,500", "2.5%"],
        ["Management", "160", "0", "$4,800", "3.4%"]
      ]
    },
    analysis: "The primary driver of labor variance is overtime in the Kitchen (BOH), which accounted for 67% of all overtime hours. This suggests either understaffing leading to burnout or inefficient prep processes. FOH labor remains relatively efficient, though Server hours on weekdays could be trimmed.",
    recommendations: [
      "Hire 1 additional line cook to reduce OT reliance.",
      "Cross-train prep staff to cover line shifts.",
      "Adjust server in-times for weekday lunch shifts."
    ]
  },
  sales: {
    title: "Sales Performance Report",
    dateRange: "October 1 - October 31, 2024",
    entity: "Downtown Location",
    dataSources: ["POS Sales", "Product Mix"],
    summary: [
      "Total sales up 4.2% driven by weekend dinner traffic.",
      "New seasonal menu items are performing above expectations.",
      "Lunch daypart is lagging, down 2% YoY."
    ],
    metrics: [
      { label: "Total Sales", value: "$142,500", change: "+4.2%", trend: "up" },
      { label: "Check Average", value: "$42.50", change: "+$1.50", trend: "up" },
      { label: "Guest Count", value: "3,352", change: "+1.1%", trend: "up" },
      { label: "Lunch Sales", value: "$32,400", change: "-2.0%", trend: "down" }
    ],
    tableData: {
      headers: ["Category", "Sales", "% Mix", "Item Count", "Avg Price"],
      rows: [
        ["Entrees", "$65,200", "45.8%", "2,100", "$31.05"],
        ["Appetizers", "$28,500", "20.0%", "1,900", "$15.00"],
        ["Alcohol", "$35,625", "25.0%", "2,850", "$12.50"],
        ["Dessert", "$7,125", "5.0%", "712", "$10.00"],
        ["N/A Bev", "$6,050", "4.2%", "1,512", "$4.00"]
      ]
    },
    analysis: "The increase in check average (+$1.50) correlates directly with the new cocktail menu launch, which has increased alcohol mix by 3%. However, lunch traffic is softening, likely due to construction on Main St. impacting foot traffic.",
    recommendations: [
      "Launch 'Express Lunch' menu to attract office workers.",
      "Run happy hour promotion earlier (3pm) to bridge lunch/dinner.",
      "Continue promoting high-margin seasonal cocktails."
    ]
  },
  inventory: {
    title: "Inventory Status Report",
    dateRange: "As of October 31, 2024",
    entity: "Downtown Location",
    dataSources: ["Inventory Count", "Invoice Data"],
    summary: [
      "Total inventory value is $18,500 (down 5% from last month).",
      "Food waste tracked at 1.2% of sales (Excellent).",
      "High variance detected in top-shelf liquor."
    ],
    metrics: [
      { label: "Total Value", value: "$18,500", change: "-5.0%", trend: "down" },
      { label: "Food Inv", value: "$8,200", change: "-2.1%", trend: "down" },
      { label: "Bev Inv", value: "$10,300", change: "-7.2%", trend: "down" },
      { label: "Days on Hand", value: "6.5", change: "-0.5", trend: "down" }
    ],
    tableData: {
      headers: ["Category", "Beginning", "Purchases", "Ending", "Usage", "Waste"],
      rows: [
        ["Meat/Seafood", "$2,500", "$8,000", "$2,200", "$8,300", "$120"],
        ["Produce", "$800", "$3,500", "$750", "$3,550", "$250"],
        ["Dairy", "$400", "$1,200", "$380", "$1,220", "$40"],
        ["Liquor", "$6,500", "$4,000", "$6,100", "$4,400", "$50"],
        ["Wine", "$3,200", "$2,500", "$3,100", "$2,600", "$10"]
      ]
    },
    analysis: "Inventory levels are healthy and days-on-hand is improving (decreasing), meaning capital is not tied up on shelves. However, the liquor category shows a $300 variance between theoretical and actual usage, suggesting potential shrinkage or over-pouring.",
    recommendations: [
      "Conduct weekly spot checks on high-value liquor.",
      "Review pouring protocols with bar staff.",
      "Maintain current par levels for food items."
    ]
  }
};
