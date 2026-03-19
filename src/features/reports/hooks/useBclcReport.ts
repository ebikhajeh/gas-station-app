import { useMemo } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { buildBclcReport } from "../selectors/reports.selectors";

export const useBclcReport = (startDate: string, endDate: string) => {
  const byDate = useDailyStore((s) => s.byDate);

  return useMemo(() => {
    return buildBclcReport(byDate, startDate, endDate);
  }, [byDate, startDate, endDate]);
};