import { useMemo } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { buildCigarettesReport } from "../selectors/reports.selectors";

export const useCigarettesReport = (startDate: string, endDate: string) => {
  const byDate = useDailyStore((s) => s.byDate);

  return useMemo(() => {
    return buildCigarettesReport(byDate, startDate, endDate);
  }, [byDate, startDate, endDate]);
};