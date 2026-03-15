import type { DailyEntry } from "../../../domain/daily/daily.model";

export type PropaneStatus = "missing" | "ok" | "check";

export type PropaneCheck = {
  ready: boolean;

  salesFill: number | null;
  salesTotal: number | null;

  overShortFill: number | null;
  overShortTotal: number | null;

  ok: boolean;
};

export const computePropaneCheck = (entry: DailyEntry | null): PropaneCheck => {
  if (!entry) {
    return {
      ready: false,
      salesFill: null,
      salesTotal: null,
      overShortFill: null,
      overShortTotal: null,
      ok: false,
    };
  }

  const {
    fillOpening,
    fillDelivery,
    fillClosing,
    totalOpening,
    totalDelivery,
    totalClosing,
    propaneExchange,
    propaneNew,
  } = entry;

  const requiredReady =
    fillOpening !== null &&
    fillClosing !== null &&
    totalOpening !== null &&
    totalClosing !== null;

  const posReady =
    propaneExchange !== null &&
    propaneNew !== null;

  if (!requiredReady || !posReady) {
    return {
      ready: false,
      salesFill: null,
      salesTotal: null,
      overShortFill: null,
      overShortTotal: null,
      ok: false,
    };
  }

  const salesFill = fillOpening + (fillDelivery ?? 0) - fillClosing;
  const salesTotal = totalOpening + (totalDelivery ?? 0) - totalClosing;

  const overShortFill = propaneExchange - salesFill;
  const overShortTotal = propaneNew - salesTotal;

  const ok = overShortFill === 0 && overShortTotal === 0;

  return {
    ready: true,
    salesFill,
    salesTotal,
    overShortFill,
    overShortTotal,
    ok,
  };
};

export const computePropaneStatus = (entry: DailyEntry | null): PropaneStatus => {
  if (!entry) return "missing";

  const requiredCountsMissing =
    entry.fillOpening === null ||
    entry.fillClosing === null ||
    entry.totalOpening === null ||
    entry.totalClosing === null;

  if (requiredCountsMissing) return "missing";

  const check = computePropaneCheck(entry);
  return check.ok ? "ok" : "check";
}; 