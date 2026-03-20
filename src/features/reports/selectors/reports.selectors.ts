import type { DailyEntry } from "../../../domain/daily/daily.model";
import {
  computeCashMorningOverShort,
  computeCashEveningOverShort,
  computeCashMorningDrop1Total,
  computeCashMorningDrop2Total,
  computeCashEveningDrop1Total,
  computeCashEveningDrop2Total,
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
  CigarettesReportResult,
  BclcReportResult,
  CashdropsReportResult,
} from "../types/reports.types";

const n = (value: number | null | undefined): number => value ?? 0;

const getCashierLabel = (cashierId: string): string => {
  const found = CASHIER_LIST.find((item) => item.id === cashierId);
  return found?.label ?? cashierId;
};

const sortCashierSummary = (items: CashierSummary[]): CashierSummary[] => {
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

  return {
    days,
    summaryMorning,
    summaryEvening,
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

export const buildBclcReport = (
  byDate: Record<string, DailyEntry>,
  startDate: string,
  endDate: string
): BclcReportResult => {
  const dates = Object.keys(byDate)
    .filter((date) => date >= startDate && date <= endDate)
    .sort();

  const days: BclcReportResult["days"] = [];

  let totalSalesOnDemand = 0;
  let totalSalesSwActivation = 0;
  let totalSalesFtOnDemand = 0;
  let totalSalesFtSw = 0;
  let totalDiscounts = 0;

  let totalPrintedCancellation = 0;
  let totalScratchCancellation = 0;

  let totalValCashOnDemand = 0;
  let totalValCashSw = 0;
  let totalValFtOnDemand = 0;
  let totalValFtSw = 0;
  let totalValVouchers = 0;

  let totalOverShortSalesOnDemand = 0;
  let totalOverShortSw = 0;
  let totalOverShortPayout = 0;

  dates.forEach((date) => {
    const entry = byDate[date];
    if (!entry) return;

    const salesOnDemand = n(entry.lottoPrintedTotalOnDemand);
    const salesSwActivation = n(entry.lottoScratchTotalSwActivation);
    const salesFtOnDemand = n(entry.lottoPrintedTotalFtOnDemand);
    const salesFtSw = n(entry.lottoScratchTotalFtSw);
    const discounts = n(entry.lottoPrintedTotalDiscounts);

    const printedCancellation = n(entry.lottoPrintedTotalCancellation);
    const scratchCancellation = n(entry.lottoScratchTotalCancellation);

    const valCashOnDemand = n(entry.lottoValidationTotalCashOnDemand);
    const valCashSw = n(entry.lottoValidationTotalCashSw);
    const valFtOnDemand = n(entry.lottoValidationTotalFtOnDemand);
    const valFtSw = n(entry.lottoValidationTotalFtSw);
    const valVouchers = n(entry.lottoValidationTotalVouchers);

    const overShortSalesOnDemand = computePrintedOverShort(entry);
    const overShortSw = computeScratchOverShort(entry);
    const overShortPayout = computeValidationOverShort(entry);

    totalSalesOnDemand += salesOnDemand;
    totalSalesSwActivation += salesSwActivation;
    totalSalesFtOnDemand += salesFtOnDemand;
    totalSalesFtSw += salesFtSw;
    totalDiscounts += discounts;

    totalPrintedCancellation += printedCancellation;
    totalScratchCancellation += scratchCancellation;

    totalValCashOnDemand += valCashOnDemand;
    totalValCashSw += valCashSw;
    totalValFtOnDemand += valFtOnDemand;
    totalValFtSw += valFtSw;
    totalValVouchers += valVouchers;

    totalOverShortSalesOnDemand += overShortSalesOnDemand ?? 0;
    totalOverShortSw += overShortSw ?? 0;
    totalOverShortPayout += overShortPayout ?? 0;

    days.push({
      date,
      salesOnDemand,
      salesSwActivation,
      salesFtOnDemand,
      salesFtSw,
      discounts,
      printedCancellation,
      scratchCancellation,
      valCashOnDemand,
      valCashSw,
      valFtOnDemand,
      valFtSw,
      valVouchers,
      overShortSalesOnDemand,
      overShortSw,
      overShortPayout,
    });
  });

  return {
    days,
    totals: {
      salesOnDemand: totalSalesOnDemand,
      salesSwActivation: totalSalesSwActivation,
      salesFtOnDemand: totalSalesFtOnDemand,
      salesFtSw: totalSalesFtSw,
      discounts: totalDiscounts,
      printedCancellation: totalPrintedCancellation,
      scratchCancellation: totalScratchCancellation,
      valCashOnDemand: totalValCashOnDemand,
      valCashSw: totalValCashSw,
      valFtOnDemand: totalValFtOnDemand,
      valFtSw: totalValFtSw,
      valVouchers: totalValVouchers,
      overShortSalesOnDemand: totalOverShortSalesOnDemand,
      overShortSw: totalOverShortSw,
      overShortPayout: totalOverShortPayout,
    },
  };
};

export const buildCashdropsReport = (
  byDate: Record<string, DailyEntry>,
  startDate: string,
  endDate: string
): CashdropsReportResult => {
  const dates = Object.keys(byDate)
    .filter((date) => date >= startDate && date <= endDate)
    .sort();

  const days: CashdropsReportResult["days"] = [];

  let totalMorningCashdrops = 0;
  let totalEveningCashdrops = 0;
  let totalForDayTotal = 0;
  let totalCoins = 0;
  let totalUs = 0;
  let totalOthers = 0;

  dates.forEach((date) => {
    const entry = byDate[date];
    if (!entry) return;

    const morningCashdrops =
      computeCashMorningDrop1Total(entry) + computeCashMorningDrop2Total(entry);

    const eveningCashdrops =
      computeCashEveningDrop1Total(entry) + computeCashEveningDrop2Total(entry);

    const totalForDay = morningCashdrops + eveningCashdrops;

    const coins =
      n(entry.cashMorningCoinsDrop1) +
      n(entry.cashMorningCoinsDrop2) +
      n(entry.cashMorningCoinsDrop3) +
      n(entry.cashEveningCoinsDrop1) +
      n(entry.cashEveningCoinsDrop2) +
      n(entry.cashEveningCoinsDrop3);

    const us = n(entry.cashMorningUsDrop) + n(entry.cashEveningUsDrop);

    const others = n(entry.cashMorningOther) + n(entry.cashEveningOther);

    const notes = [entry.cashComment1, entry.cashComment2, entry.cashComment3]
      .map((item) => item?.trim() ?? "")
      .filter(Boolean)
      .join(" | ");

    totalMorningCashdrops += morningCashdrops;
    totalEveningCashdrops += eveningCashdrops;
    totalForDayTotal += totalForDay;
    totalCoins += coins;
    totalUs += us;
    totalOthers += others;

    days.push({
      date,
      cashierMorning: entry.cashMorningCashierName
        ? getCashierLabel(entry.cashMorningCashierName)
        : null,
      cashierEvening: entry.cashEveningCashierName
        ? getCashierLabel(entry.cashEveningCashierName)
        : null,
      morningCashdrops,
      eveningCashdrops,
      totalForDay,
      coins,
      us,
      others,
      note: notes,
    });
  });

  return {
    days,
    totals: {
      morningCashdrops: totalMorningCashdrops,
      eveningCashdrops: totalEveningCashdrops,
      totalForDay: totalForDayTotal,
      coins: totalCoins,
      us: totalUs,
      others: totalOthers,
    },
  };
};