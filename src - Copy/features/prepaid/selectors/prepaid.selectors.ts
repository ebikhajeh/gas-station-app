import type { DailyEntry } from "../../../domain/daily/daily.model";

export type Status = "missing" | "ok" | "check";

const EPS = 0.01;

export type PrepaidCheck = {
  ready: boolean;
  diff: number | null;
  ok: boolean;
};

export const computePrepaidCheck = (entry: DailyEntry | null): PrepaidCheck => {
  if (!entry) {
    return {
      ready: false,
      diff: null,
      ok: false,
    };
  }

  const prepaid = entry.prepaidInput;
  const end1 = entry.endOfDayInput1;
  const end2 = entry.endOfDayInput2;

  const ready = prepaid !== null && end1 !== null && end2 !== null;

  if (!ready) {
    return {
      ready: false,
      diff: null,
      ok: false,
    };
  }

  const diff = end1 + end2 - prepaid;
  const ok = Math.abs(diff) < EPS;

  return {
    ready: true,
    diff,
    ok,
  };
};

export const computePrepaidStatus = (entry: DailyEntry | null): Status => {
  if (!entry) return "missing";

  if (entry.prepaidInput === null) return "missing";

  const check = computePrepaidCheck(entry);
  return check.ok ? "ok" : "check";
};

export const computePrepaidDiff = (entry: DailyEntry | null): number => {
  const check = computePrepaidCheck(entry);
  return check.diff ?? 0;
};