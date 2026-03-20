export interface CashierDayRecord {
  date: string;
  cashierMorning: string | null;
  cashierEvening: string | null;
  morningValue: number;
  eveningValue: number;
  total: number;
}

export interface CashierSummary {
  cashierId: string;
  cashierLabel: string;
  total: number;
}

export interface CashierPerformanceResult {
  days: CashierDayRecord[];
  summaryMorning: CashierSummary[];
  summaryEvening: CashierSummary[];
}

export interface CigarettesDayRecord {
  date: string;
  opening: number;
  closing: number;
  sale: number;
  bulk: number;
  difference: number;
}

export interface CigarettesReportTotals {
  opening: number;
  closing: number;
  sale: number;
  bulk: number;
  difference: number;
}

export interface CigarettesReportResult {
  days: CigarettesDayRecord[];
  totals: CigarettesReportTotals;
}

export interface BclcDayRecord {
  date: string;

  salesOnDemand: number;
  salesSwActivation: number;
  salesFtOnDemand: number;
  salesFtSw: number;
  discounts: number;

  printedCancellation: number;
  scratchCancellation: number;

  valCashOnDemand: number;
  valCashSw: number;
  valFtOnDemand: number;
  valFtSw: number;
  valVouchers: number;

  overShortSalesOnDemand: number | null;
  overShortSw: number | null;
  overShortPayout: number | null;
}

export interface BclcReportTotals {
  salesOnDemand: number;
  salesSwActivation: number;
  salesFtOnDemand: number;
  salesFtSw: number;
  discounts: number;

  printedCancellation: number;
  scratchCancellation: number;

  valCashOnDemand: number;
  valCashSw: number;
  valFtOnDemand: number;
  valFtSw: number;
  valVouchers: number;

  overShortSalesOnDemand: number;
  overShortSw: number;
  overShortPayout: number;
}

export interface BclcReportResult {
  days: BclcDayRecord[];
  totals: BclcReportTotals;
}

export interface CashdropsDayRecord {
  date: string;
  cashierMorning: string | null;
  cashierEvening: string | null;
  morningCashdrops: number;
  eveningCashdrops: number;
  totalForDay: number;
  coins: number;
  us: number;
  others: number;
  note: string;
}

export interface CashdropsReportTotals {
  morningCashdrops: number;
  eveningCashdrops: number;
  totalForDay: number;
  coins: number;
  us: number;
  others: number;
}

export interface CashdropsReportResult {
  days: CashdropsDayRecord[];
  totals: CashdropsReportTotals;
}