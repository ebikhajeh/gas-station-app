import type { DailyEntry } from "../../../domain/daily/daily.model";
import { CASHIER_LIST } from "../../cash/constants/cashierList";
import { cigaretteListA } from "../data/cigaretteListA";
import { cigaretteListB } from "../data/cigaretteListB";

export type CigarettesStatus = "missing" | "check" | "ok";

export type CigaretteRowValues = {
  morningSingle: number | null;
  morningCartons: number | null;
  deliveryCartons: number | null;
  eveningSingle: number | null;
  eveningCartons: number | null;
  bulkSale: number | null;
};

const n = (value: number | null | undefined): number => value ?? 0;

const isFilled = (value: number | null | undefined): boolean =>
  value !== null && value !== undefined && Number.isFinite(value);

const getCashierLabel = (id: string | null | undefined): string => {
  if (!id) return "";
  return CASHIER_LIST.find((c) => c.id === id)?.label ?? id;
};

export const getCigarettesMorningCashierLabel = (entry: DailyEntry): string =>
  getCashierLabel(entry.cashMorningCashierName);

export const getCigarettesEveningCashierLabel = (entry: DailyEntry): string =>
  getCashierLabel(entry.cashEveningCashierName);

/*
---------------------------------------
List selection by day
Odd day   -> List A
Even day  -> List B
---------------------------------------
*/

export const getCigaretteListForDate = (date: string) => {
  const day = Number(date.slice(-2));
  if (!Number.isFinite(day)) return cigaretteListA;
  return day % 2 === 1 ? cigaretteListA : cigaretteListB;
};

/*
---------------------------------------
Calculations
---------------------------------------
*/

export const cartonsToSingles = (cartons: number | null | undefined): number => {
  return n(cartons) * 10;
};

export const computeCigaretteItemsSold = (row: CigaretteRowValues): number => {
  return (
    n(row.morningSingle) +
    cartonsToSingles(row.morningCartons) +
    cartonsToSingles(row.deliveryCartons) -
    n(row.eveningSingle) -
    cartonsToSingles(row.eveningCartons)
  );
};

export const computeCigaretteOverShort = (row: CigaretteRowValues): number => {
  return n(row.bulkSale) - computeCigaretteItemsSold(row);
};

/*
---------------------------------------
Status
Rule:
- missing => absolutely no numeric input anywhere
- check   => at least one numeric input exists
- ok      => every over/short is zero
---------------------------------------
*/

export const computeCigarettesStatus = (
  entry: DailyEntry | null | undefined,
  date: string
): CigarettesStatus => {
  if (!entry) return "missing";

  const activeList = getCigaretteListForDate(date);

  const allRows = activeList.map((item) => {
    const key = item.code || item.name;
    return {
      morningSingle: entry.cigarettesMorningSingles?.[key] ?? null,
      morningCartons: entry.cigarettesMorningCartons?.[key] ?? null,
      deliveryCartons: entry.cigarettesDeliveryCartons?.[key] ?? null,
      eveningSingle: entry.cigarettesEveningSingles?.[key] ?? null,
      eveningCartons: entry.cigarettesEveningCartons?.[key] ?? null,
      bulkSale: entry.cigarettesBulkSale?.[key] ?? null,
    };
  });

  const hasAnyInput = allRows.some((row) =>
    [
      row.morningSingle,
      row.morningCartons,
      row.deliveryCartons,
      row.eveningSingle,
      row.eveningCartons,
      row.bulkSale,
    ].some((value) => isFilled(value) && n(value) !== 0)
  );

  if (!hasAnyInput) {
    return "missing";
  }

  const everyOverShortIsZero = allRows.every(
    (row) => computeCigaretteOverShort(row) === 0
  );

  if (everyOverShortIsZero) {
    return "ok";
  }

  return "check";
};