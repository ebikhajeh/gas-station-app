export interface CashierDayRecord {
  date: string;
  cashierMorning: string | null;
  cashierEvening: string | null;
  morningValue: number;
  eveningValue: number;
  total: number;

  lottoPrinted: number | null;
  lottoScratch: number | null;
  lottoValidation: number | null;
}

export interface CashierSummary {
  cashierId: string;
  cashierLabel: string;
  total: number;
}

export interface LottoSummary {
  cashierId: string;
  cashierLabel: string;
  total: number;
}

export interface CashierPerformanceResult {
  days: CashierDayRecord[];
  summaryMorning: CashierSummary[];
  summaryEvening: CashierSummary[];

  lottoPrintedSummary: LottoSummary[];
  lottoScratchSummary: LottoSummary[];
  lottoValidationSummary: LottoSummary[];
}