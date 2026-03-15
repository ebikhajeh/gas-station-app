import type { DailyEntry } from "../../../domain/daily/daily.model";
import { CASHIER_LIST } from "../../cash/constants/cashierList";

export type LottoStatus = "missing" | "check" | "ok";

const n = (value: number | null | undefined): number => value ?? 0;

const isFilled = (value: number | null | undefined): boolean =>
  value !== null && value !== undefined && Number.isFinite(value);

const hasAnyValue = (values: Array<number | null | undefined>): boolean =>
  values.some((value) => isFilled(value) && n(value) !== 0);

const getCashierLabel = (id: string | null | undefined): string => {
  if (!id) return "";
  return CASHIER_LIST.find((c) => c.id === id)?.label ?? id;
};

/*
---------------------------------------
Cashier labels
---------------------------------------
*/

export const getLottoMorningCashierLabel = (entry: DailyEntry): string =>
  getCashierLabel(entry.cashMorningCashierName);

export const getLottoEveningCashierLabel = (entry: DailyEntry): string =>
  getCashierLabel(entry.cashEveningCashierName);

/*
---------------------------------------
Printed Lotto
---------------------------------------
*/

export const computePrintedMorningActualSales = (entry: DailyEntry): number => {
  return (
    n(entry.lottoPrintedMorningOnDemand) +
    n(entry.lottoPrintedMorningFtOnDemand) -
    n(entry.lottoPrintedMorningCancellation) -
    n(entry.lottoPrintedMorningDiscounts)
  );
};

export const computePrintedTotalActualSales = (entry: DailyEntry): number => {
  return (
    n(entry.lottoPrintedTotalOnDemand) +
    n(entry.lottoPrintedTotalFtOnDemand) -
    n(entry.lottoPrintedTotalCancellation) -
    n(entry.lottoPrintedTotalDiscounts)
  );
};

export const computePrintedPmDerived = (entry: DailyEntry) => {
  const onDemand =
    n(entry.lottoPrintedTotalOnDemand) - n(entry.lottoPrintedMorningOnDemand);

  const ftOnDemand =
    n(entry.lottoPrintedTotalFtOnDemand) -
    n(entry.lottoPrintedMorningFtOnDemand);

  const cancellation =
    n(entry.lottoPrintedTotalCancellation) -
    n(entry.lottoPrintedMorningCancellation);

  const discounts =
    n(entry.lottoPrintedTotalDiscounts) -
    n(entry.lottoPrintedMorningDiscounts);

  const actualSales = onDemand + ftOnDemand - cancellation - discounts;

  return {
    onDemand,
    ftOnDemand,
    cancellation,
    discounts,
    actualSales,
  };
};

export const computePrintedOverShort = (entry: DailyEntry): number | null => {
  if (!isFilled(entry.onlineLotto41)) return null;
  return n(entry.onlineLotto41) - computePrintedTotalActualSales(entry);
};

/*
---------------------------------------
Scratch Lotto
---------------------------------------
*/

export const computeScratchMorningActualSales = (entry: DailyEntry): number => {
  return (
    n(entry.lottoScratchMorningSwActivation) +
    n(entry.lottoScratchMorningFtSw) -
    n(entry.lottoScratchMorningCancellation)
  );
};

export const computeScratchTotalActualSales = (entry: DailyEntry): number => {
  return (
    n(entry.lottoScratchTotalSwActivation) +
    n(entry.lottoScratchTotalFtSw) -
    n(entry.lottoScratchTotalCancellation)
  );
};

export const computeScratchPmDerived = (entry: DailyEntry) => {
  const swActivation =
    n(entry.lottoScratchTotalSwActivation) -
    n(entry.lottoScratchMorningSwActivation);

  const ftSw =
    n(entry.lottoScratchTotalFtSw) - n(entry.lottoScratchMorningFtSw);

  const cancellation =
    n(entry.lottoScratchTotalCancellation) -
    n(entry.lottoScratchMorningCancellation);

  const actualSales = swActivation + ftSw - cancellation;

  return {
    swActivation,
    ftSw,
    cancellation,
    actualSales,
  };
};

export const computeScratchOverShort = (entry: DailyEntry): number | null => {
  if (!isFilled(entry.scratchLotto27)) return null;
  return n(entry.scratchLotto27) - computeScratchTotalActualSales(entry);
};

/*
---------------------------------------
Validation
---------------------------------------
*/

export const computeValidationMorningTotal = (entry: DailyEntry): number => {
  return (
    n(entry.lottoValidationMorningCashOnDemand) +
    n(entry.lottoValidationMorningCashSw) +
    n(entry.lottoValidationMorningFtOnDemand) +
    n(entry.lottoValidationMorningFtSw) +
    n(entry.lottoValidationMorningVouchers)
  );
};

export const computeValidationTotal = (entry: DailyEntry): number => {
  return (
    n(entry.lottoValidationTotalCashOnDemand) +
    n(entry.lottoValidationTotalCashSw) +
    n(entry.lottoValidationTotalFtOnDemand) +
    n(entry.lottoValidationTotalFtSw) +
    n(entry.lottoValidationTotalVouchers)
  );
};

export const computeValidationPmDerived = (entry: DailyEntry) => {
  const cashOnDemand =
    n(entry.lottoValidationTotalCashOnDemand) -
    n(entry.lottoValidationMorningCashOnDemand);

  const cashSw =
    n(entry.lottoValidationTotalCashSw) -
    n(entry.lottoValidationMorningCashSw);

  const ftOnDemand =
    n(entry.lottoValidationTotalFtOnDemand) -
    n(entry.lottoValidationMorningFtOnDemand);

  const ftSw =
    n(entry.lottoValidationTotalFtSw) -
    n(entry.lottoValidationMorningFtSw);

  const vouchers =
    n(entry.lottoValidationTotalVouchers) -
    n(entry.lottoValidationMorningVouchers);

  const total = cashOnDemand + cashSw + ftOnDemand + ftSw + vouchers;

  return {
    cashOnDemand,
    cashSw,
    ftOnDemand,
    ftSw,
    vouchers,
    total,
  };
};

export const computeValidationOverShort = (entry: DailyEntry): number | null => {
  if (!isFilled(entry.payouts)) return null;
  return n(entry.payouts) - computeValidationTotal(entry);
};

/*
---------------------------------------
Status
---------------------------------------
*/

export const computeLottoStatus = (
  entry: DailyEntry | null | undefined
): LottoStatus => {
  if (!entry) return "missing";

  const hasLottoData =
    hasAnyValue([
      entry.lottoPrintedMorningOnDemand,
      entry.lottoPrintedMorningFtOnDemand,
      entry.lottoPrintedMorningCancellation,
      entry.lottoPrintedMorningDiscounts,
      entry.lottoPrintedTotalOnDemand,
      entry.lottoPrintedTotalFtOnDemand,
      entry.lottoPrintedTotalCancellation,
      entry.lottoPrintedTotalDiscounts,

      entry.lottoScratchMorningSwActivation,
      entry.lottoScratchMorningFtSw,
      entry.lottoScratchMorningCancellation,
      entry.lottoScratchTotalSwActivation,
      entry.lottoScratchTotalFtSw,
      entry.lottoScratchTotalCancellation,

      entry.lottoValidationMorningCashOnDemand,
      entry.lottoValidationMorningCashSw,
      entry.lottoValidationMorningFtOnDemand,
      entry.lottoValidationMorningFtSw,
      entry.lottoValidationMorningVouchers,
      entry.lottoValidationTotalCashOnDemand,
      entry.lottoValidationTotalCashSw,
      entry.lottoValidationTotalFtOnDemand,
      entry.lottoValidationTotalFtSw,
      entry.lottoValidationTotalVouchers,
    ]);

  if (!hasLottoData) {
    return "missing";
  }

  const printedOS = computePrintedOverShort(entry);
  const scratchOS = computeScratchOverShort(entry);
  const validationOS = computeValidationOverShort(entry);

  const refsComplete =
    printedOS !== null && scratchOS !== null && validationOS !== null;

  if (!refsComplete) {
    return "check";
  }

  if (printedOS === 0 && scratchOS === 0 && validationOS === 0) {
    return "ok";
  }

  return "check";
};