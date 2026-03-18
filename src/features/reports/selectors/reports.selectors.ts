import type { CashierPerformanceResult } from "../types/reports.types";

export const buildCashierPerformance = (
  byDate: Record<string, any>,
  startDate: string,
  endDate: string
): CashierPerformanceResult => {
  const dates = Object.keys(byDate)
    .filter((d) => d >= startDate && d <= endDate)
    .sort();

  const days: any[] = [];

  const morningTotals: Record<string, number> = {};
  const eveningTotals: Record<string, number> = {};

  dates.forEach((date) => {
    const entry = byDate[date];
    if (!entry) return;

    const morningCashier = entry.cashierMorning ?? null;
    const eveningCashier = entry.cashierEvening ?? null;

    const morningValue = entry.totalMorningOverShort ?? 0;
    const eveningValue = entry.totalEveningOverShort ?? 0;

    const total = morningValue + eveningValue;

    if (morningCashier) {
      morningTotals[morningCashier] =
        (morningTotals[morningCashier] ?? 0) + morningValue;
    }

    if (eveningCashier) {
      eveningTotals[eveningCashier] =
        (eveningTotals[eveningCashier] ?? 0) + eveningValue;
    }

    days.push({
      date,
      cashierMorning: morningCashier,
      cashierEvening: eveningCashier,
      morningValue,
      eveningValue,
      total,
    });
  });

  const summaryMorning = Object.entries(morningTotals).map(([cashier, total]) => ({
    cashier,
    total,
  }));

  const summaryEvening = Object.entries(eveningTotals).map(([cashier, total]) => ({
    cashier,
    total,
  }));

  return {
    days,
    summaryMorning,
    summaryEvening,
  };
};