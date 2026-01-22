// Local data for DetailedView component

export const ticketTimeData = {
  today: {
    label: "Day",
    xAxisKey: "hour",
    data: [
      { hour: '10am', green: 12, yellow: 2, red: 0 },
      { hour: '11am', green: 28, yellow: 5, red: 1 },
      { hour: '12pm', green: 45, yellow: 12, red: 3 },
      { hour: '1pm', green: 52, yellow: 15, red: 5 },
      { hour: '2pm', green: 38, yellow: 8, red: 2 },
      { hour: '3pm', green: 18, yellow: 4, red: 1 },
      { hour: '4pm', green: 15, yellow: 3, red: 0 },
      { hour: '5pm', green: 32, yellow: 6, red: 2 },
      { hour: '6pm', green: 48, yellow: 14, red: 6 },
      { hour: '7pm', green: 55, yellow: 18, red: 9 },
      { hour: '8pm', green: 42, yellow: 12, red: 4 },
      { hour: '9pm', green: 25, yellow: 6, red: 2 },
    ],
    summary: { greenPct: 78, yellowPct: 16, redPct: 6 },
    xLabel: "Tickets by hour"
  },
  week: {
    label: "Week",
    xAxisKey: "day",
    data: [
      { day: 'Mon', green: 410, yellow: 87, red: 35 },
      { day: 'Tue', green: 385, yellow: 72, red: 28 },
      { day: 'Wed', green: 420, yellow: 95, red: 42 },
      { day: 'Thu', green: 445, yellow: 88, red: 38 },
      { day: 'Fri', green: 520, yellow: 125, red: 55 },
      { day: 'Sat', green: 580, yellow: 140, red: 68 },
      { day: 'Sun', green: 380, yellow: 78, red: 32 },
    ],
    summary: { greenPct: 76, yellowPct: 17, redPct: 7 },
    xLabel: "Tickets by day (WTD)"
  },
  month: {
    label: "Month",
    xAxisKey: "day",
    data: [
      { day: 'Jan 1', green: 385, yellow: 72, red: 28 },
      { day: 'Jan 2', green: 410, yellow: 87, red: 35 },
      { day: 'Jan 3', green: 520, yellow: 125, red: 55 },
      { day: 'Jan 4', green: 580, yellow: 140, red: 68 },
      { day: 'Jan 5', green: 380, yellow: 78, red: 32 },
      { day: 'Jan 6', green: 410, yellow: 87, red: 35 },
      { day: 'Jan 7', green: 385, yellow: 72, red: 28 },
      { day: 'Jan 8', green: 420, yellow: 95, red: 42 },
      { day: 'Jan 9', green: 445, yellow: 88, red: 38 },
      { day: 'Jan 10', green: 520, yellow: 125, red: 55 },
      { day: 'Jan 11', green: 580, yellow: 140, red: 68 },
      { day: 'Jan 12', green: 410, yellow: 105, red: 35 },
    ],
    summary: { greenPct: 75, yellowPct: 18, redPct: 7 },
    xLabel: "Tickets by day (MTD)"
  },
  year: {
    label: "Year",
    xAxisKey: "month",
    data: [
      { month: 'Jan', green: 5520, yellow: 1214, red: 519 },
    ],
    summary: { greenPct: 76, yellowPct: 17, redPct: 7 },
    xLabel: "Tickets by month (YTD)"
  }
};

export const gmTimeRangeData = {
  today: {
    label: "Today",
    dateLabel: "Monday, Jan 12",
    sales: { value: 4820, avg: 5180, variance: -6.9, avgLabel: "Avg Monday" },
    cogs: { value: 32.4, avg: 30.8, variance: 1.6, avgLabel: "Avg Monday" },
    labor: { value: 31.8, avg: 29.3, variance: 2.5, avgLabel: "Avg Monday" },
    primeCost: { value: 64.2, avg: 60.1, variance: 4.1, avgLabel: "Avg Monday" }
  },
  week: {
    label: "Week",
    dateLabel: "Week of Jan 6–12 (WTD)",
    sales: { value: 28450, avg: 31200, variance: -8.8, avgLabel: "Avg Week" },
    cogs: { value: 31.2, avg: 30.5, variance: 0.7, avgLabel: "Avg Week" },
    labor: { value: 30.8, avg: 29.0, variance: 1.8, avgLabel: "Avg Week" },
    primeCost: { value: 62.0, avg: 59.5, variance: 2.5, avgLabel: "Avg Week" }
  },
  month: {
    label: "Month",
    dateLabel: "January 2026 (MTD)",
    sales: { value: 42680, avg: 48500, variance: -12.0, avgLabel: "Avg MTD" },
    cogs: { value: 30.8, avg: 30.2, variance: 0.6, avgLabel: "Avg MTD" },
    labor: { value: 30.2, avg: 29.1, variance: 1.1, avgLabel: "Avg MTD" },
    primeCost: { value: 61.0, avg: 59.3, variance: 1.7, avgLabel: "Avg MTD" }
  },
  year: {
    label: "Year",
    dateLabel: "2026 (YTD)",
    sales: { value: 42680, avg: 48500, variance: -12.0, avgLabel: "Avg YTD" },
    cogs: { value: 30.5, avg: 30.0, variance: 0.5, avgLabel: "Avg YTD" },
    labor: { value: 29.8, avg: 29.2, variance: 0.6, avgLabel: "Avg YTD" },
    primeCost: { value: 60.3, avg: 59.2, variance: 1.1, avgLabel: "Avg YTD" }
  }
};

export type TimeRangeType = "today" | "week" | "month" | "year";
