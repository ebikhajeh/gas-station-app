import type { DailyEntry } from "../../../domain/daily/daily.model";
import {
  computeCashMorningOverShort,
  computeCashEveningOverShort,
} from "../../cash/selectors/cash.selectors";
import { CASHIER_LIST } from "../../cash/constants/cashierList";
import type { CashierPerformanceResult, CashierSummary } from "../types/reports.types";

const getCashierLabel = (cashierId: string): string => {
  const found = CASHIER_LIST.find((item) => item.id === cashierId);
  return found?.label ?? cashierId;
};

const sortByLabel = (items: CashierSummary[]): CashierSummary[] => {
  return [...items].sort((a, b) => a.cashierLabel.localeCompare(b.cashierLabel));
};

export const buildCashierPerformance = (
  byDate: Record<string, DailyEntry>,
  startDate: string,
  endDate: string
): CashierPerformanceResult => {
  const dates = Object.keys(byDate)
    .filter((date) => date >= startDate && date <= endDate)
    .sort();

  const days: CashierPerformanceResult["days"] = [];

  const morningTotals: Record<string, number> = {};
  const eveningTotals: Record<string, number> = {};

  dates.forEach((date) => {
    const entry = byDate[date];
    if (!entry) return;

    const cashierMorning = entry.cashMorningCashierName ?? null;
    const cashierEvening = entry.cashEveningCashierName ?? null;

    const morningValue = computeCashMorningOverShort(entry);
    const eveningValue = computeCashEveningOverShort(entry);
    const total = morningValue + eveningValue;

    if (cashierMorning) {
      morningTotals[cashierMorning] =
        (morningTotals[cashierMorning] ?? 0) + morningValue;
    }

    if (cashierEvening) {
      eveningTotals[cashierEvening] =
        (eveningTotals[cashierEvening] ?? 0) + eveningValue;
    }

    days.push({
      date,
      cashierMorning: cashierMorning ? getCashierLabel(cashierMorning) : null,
      cashierEvening: cashierEvening ? getCashierLabel(cashierEvening) : null,
      morningValue,
      eveningValue,
      total,
    });
  });

  const summaryMorning = sortByLabel(
    Object.entries(morningTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  const summaryEvening = sortByLabel(
    Object.entries(eveningTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  return {
    days,
    summaryMorning,
    summaryEvening,
  };
};