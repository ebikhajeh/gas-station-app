import { useMemo } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { buildCashdropsReport } from "../selectors/reports.selectors";

export const useCashdropsReport = (startDate: string, endDate: string) => {
  const byDate = useDailyStore((s) => s.byDate);

  return useMemo(() => {
    return buildCashdropsReport(byDate, startDate, endDate);
  }, [byDate, startDate, endDate]);
};