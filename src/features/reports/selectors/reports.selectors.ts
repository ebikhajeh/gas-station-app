import type { DailyEntry } from "../../../domain/daily/daily.model";
import {
  computeCashMorningOverShort,
  computeCashEveningOverShort,
} from "../../cash/selectors/cash.selectors";
import { CASHIER_LIST } from "../../cash/constants/cashierList";
import {
  computePrintedOverShort,
  computeScratchOverShort,
  computeValidationOverShort,
} from "../../lotto/selectors/lotto.selectors";
import {
  cartonsToSingles,
  computeCigaretteItemsSold,
  computeCigaretteOverShort,
  getCigaretteListForDate,
} from "../../cigarettes/selectors/cigarettes.selectors";
import type {
  CashierPerformanceResult,
  CashierSummary,
  LottoSummary,
  CigarettesReportResult,
} from "../types/reports.types";

const getCashierLabel = (cashierId: string): string => {
  const found = CASHIER_LIST.find((item) => item.id === cashierId);
  return found?.label ?? cashierId;
};

const sortCashierSummary = <T extends CashierSummary | LottoSummary>(items: T[]): T[] => {
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

  const lottoPrintedTotals: Record<string, number> = {};
  const lottoScratchTotals: Record<string, number> = {};
  const lottoValidationTotals: Record<string, number> = {};

  dates.forEach((date) => {
    const entry = byDate[date];
    if (!entry) return;

    const cashierMorning = entry.cashMorningCashierName ?? null;
    const cashierEvening = entry.cashEveningCashierName ?? null;

    const morningValue = computeCashMorningOverShort(entry);
    const eveningValue = computeCashEveningOverShort(entry);
    const total = morningValue + eveningValue;

    const lottoPrinted = computePrintedOverShort(entry);
    const lottoScratch = computeScratchOverShort(entry);
    const lottoValidation = computeValidationOverShort(entry);

    if (cashierMorning) {
      morningTotals[cashierMorning] =
        (morningTotals[cashierMorning] ?? 0) + morningValue;
    }

    if (cashierEvening) {
      eveningTotals[cashierEvening] =
        (eveningTotals[cashierEvening] ?? 0) + eveningValue;
    }

    if (cashierEvening && lottoPrinted !== null) {
      lottoPrintedTotals[cashierEvening] =
        (lottoPrintedTotals[cashierEvening] ?? 0) + lottoPrinted;
    }

    if (cashierEvening && lottoScratch !== null) {
      lottoScratchTotals[cashierEvening] =
        (lottoScratchTotals[cashierEvening] ?? 0) + lottoScratch;
    }

    if (cashierEvening && lottoValidation !== null) {
      lottoValidationTotals[cashierEvening] =
        (lottoValidationTotals[cashierEvening] ?? 0) + lottoValidation;
    }

    days.push({
      date,
      cashierMorning: cashierMorning ? getCashierLabel(cashierMorning) : null,
      cashierEvening: cashierEvening ? getCashierLabel(cashierEvening) : null,
      morningValue,
      eveningValue,
      total,
      lottoPrinted,
      lottoScratch,
      lottoValidation,
    });
  });

  const summaryMorning = sortCashierSummary(
    Object.entries(morningTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  const summaryEvening = sortCashierSummary(
    Object.entries(eveningTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  const lottoPrintedSummary = sortCashierSummary(
    Object.entries(lottoPrintedTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  const lottoScratchSummary = sortCashierSummary(
    Object.entries(lottoScratchTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  const lottoValidationSummary = sortCashierSummary(
    Object.entries(lottoValidationTotals).map(([cashierId, total]) => ({
      cashierId,
      cashierLabel: getCashierLabel(cashierId),
      total,
    }))
  );

  return {
    days,
    summaryMorning,
    summaryEvening,
    lottoPrintedSummary,
    lottoScratchSummary,
    lottoValidationSummary,
  };
};

export const buildCigarettesReport = (
  byDate: Record<string, DailyEntry>,
  startDate: string,
  endDate: string
): CigarettesReportResult => {
  const dates = Object.keys(byDate)
    .filter((date) => date >= startDate && date <= endDate)
    .sort();

  const days: CigarettesReportResult["days"] = [];

  let totalOpening = 0;
  let totalClosing = 0;
  let totalSale = 0;
  let totalBulk = 0;
  let totalDifference = 0;

  dates.forEach((date) => {
    const entry = byDate[date];
    if (!entry) return;

    const activeList = getCigaretteListForDate(date);

    let opening = 0;
    let closing = 0;
    let sale = 0;
    let bulk = 0;
    let difference = 0;

    activeList.forEach((item) => {
      const key = item.code || item.name;

      const row = {
        morningSingle: entry.cigarettesMorningSingles?.[key] ?? null,
        morningCartons: entry.cigarettesMorningCartons?.[key] ?? null,
        deliveryCartons: entry.cigarettesDeliveryCartons?.[key] ?? null,
        eveningSingle: entry.cigarettesEveningSingles?.[key] ?? null,
        eveningCartons: entry.cigarettesEveningCartons?.[key] ?? null,
        bulkSale: entry.cigarettesBulkSale?.[key] ?? null,
      };

      opening += (row.morningSingle ?? 0) + cartonsToSingles(row.morningCartons);
      closing += (row.eveningSingle ?? 0) + cartonsToSingles(row.eveningCartons);
      sale += computeCigaretteItemsSold(row);
      bulk += row.bulkSale ?? 0;
      difference += computeCigaretteOverShort(row);
    });

    totalOpening += opening;
    totalClosing += closing;
    totalSale += sale;
    totalBulk += bulk;
    totalDifference += difference;

    days.push({
      date,
      opening,
      closing,
      sale,
      bulk,
      difference,
    });
  });

  return {
    days,
    totals: {
      opening: totalOpening,
      closing: totalClosing,
      sale: totalSale,
      bulk: totalBulk,
      difference: totalDifference,
    },
  };
};