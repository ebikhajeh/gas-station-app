import { useMemo } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { buildBcpIvReport } from "../selectors/reports.selectors";

export const useBcpIvReport = (startDate: string, endDate: string) => {
  const byDate = useDailyStore((s) => s.byDate);

  return useMemo(() => {
    return buildBcpIvReport(byDate, startDate, endDate);
  }, [byDate, startDate, endDate]);
};