import { useMemo } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { buildCashierPerformance } from "../selectors/reports.selectors";

export const useCashierPerformance = (startDate: string, endDate: string) => {
  const byDate = useDailyStore((s) => s.byDate);

  return useMemo(() => {
    return buildCashierPerformance(byDate, startDate, endDate);
  }, [byDate, startDate, endDate]);
};