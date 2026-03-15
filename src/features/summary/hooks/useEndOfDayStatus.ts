import { useMemo } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { computeEndOfDayStatus } from "../selectors/endOfDay.selectors";

export type EndOfDayStatus = "missing" | "check" | "ok";

export const useEndOfDayStatus = (date: string): EndOfDayStatus => {
  const entry = useDailyStore((s) => s.byDate[date]);

  const status = useMemo(() => {
    return computeEndOfDayStatus(entry);
  }, [entry]);

  return status;
};