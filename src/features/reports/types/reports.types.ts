export interface CashierDayRecord {
  date: string;
  cashierMorning: string | null;
  cashierEvening: string | null;
  morningValue: number;
  eveningValue: number;
  total: number;
}

export interface CashierSummary {
  cashier: string;
  total: number;
}

export interface CashierPerformanceResult {
  days: CashierDayRecord[];
  summaryMorning: CashierSummary[];
  summaryEvening: CashierSummary[];
}