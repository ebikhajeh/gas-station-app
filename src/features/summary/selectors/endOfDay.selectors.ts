import type { DailyEntry } from "../../../domain/daily/daily.model";
import {
  computeCashEveningOverShort,
  computeCashEveningSafeDropBills,
  computeCashEveningSafeDropCoins,
  computeCashMorningOverShort,
  computeCashMorningSafeDropBills,
  computeCashMorningSafeDropCoins,
} from "../../cash/selectors/cash.selectors";
import { computePrintedOverShort, computeScratchOverShort, computeValidationOverShort } from "../../lotto/selectors/lotto.selectors";
import { computePrepaidDiff } from "../../prepaid/selectors/prepaid.selectors";

export type EndOfDayStatus = "missing" | "check" | "ok";

const n = (value: number | null | undefined): number => value ?? 0;

const isFilled = (value: number | null | undefined): boolean =>
  value !== null && value !== undefined && Number.isFinite(value);

/*
---------------------------------------
Required End Of Day inputs
All of these must be filled for status = ok
---------------------------------------
*/

export const getEndOfDayRequiredValues = (entry: DailyEntry) => [
  entry.endOfDayInput1, // UI label: 33 prepaid gift
  entry.endOfDayInput2, // UI label: 85 Activation fee ONLY
  entry.onlineLotto41,
  entry.scratchLotto27,
  entry.payouts,
];

/*
---------------------------------------
Status
- missing => none of required fields filled
- check   => some filled, but not all
- ok      => all required fields filled
---------------------------------------
*/

export const computeEndOfDayStatus = (
  entry: DailyEntry | null | undefined
): EndOfDayStatus => {
  if (!entry) return "missing";

  const requiredValues = getEndOfDayRequiredValues(entry);
  const filledCount = requiredValues.filter(isFilled).length;

  if (filledCount === 0) return "missing";
  if (filledCount === requiredValues.length) return "ok";
  return "check";
};

/*
---------------------------------------
Computed boxes
---------------------------------------
*/

export const computeEndAndBeginDiffer = (entry: DailyEntry): number => {
  return (
    n(entry.cashMorningEndingTray) +
    n(entry.cashEveningEndingTray) -
    n(entry.cashMorningBeginTray) -
    n(entry.cashEveningBeginTray)
  );
};

export const computeEndOfDayCanadianCash = (entry: DailyEntry): number => {
  return n(entry.cashMorningCanadianCash) + n(entry.cashEveningCanadianCash);
};

export const computeEndOfDayCashDrop = (entry: DailyEntry): number => {
  return (
    computeCashMorningSafeDropBills(entry) +
    computeCashEveningSafeDropBills(entry) +
    computeCashMorningSafeDropCoins(entry) +
    computeCashEveningSafeDropCoins(entry) +
    n(entry.cashMorningOther) +
    n(entry.cashEveningOther) +
    computeEndAndBeginDiffer(entry)
  );
};

/*
---------------------------------------
Final Over / Short
cash morning
cash evening
lotto scratch
lotto printed
lotto payouts / validation
prepaid
---------------------------------------
*/

export const computeEndOfDayOverShort = (entry: DailyEntry): number => {
  return (
    computeCashMorningOverShort(entry) +
    computeCashEveningOverShort(entry) +
    n(computeScratchOverShort(entry)) +
    n(computePrintedOverShort(entry)) +
    n(computeValidationOverShort(entry)) +
    n(computePrepaidDiff(entry))
  );
};