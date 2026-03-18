import { useState } from "react";
import ReportHeader from "../components/ReportHeader";
import CashierPerformanceTable from "../components/CashierPerformanceTable";
import { useCashierPerformance } from "../hooks/useCashierPerformance";

const today = new Date().toISOString().slice(0, 10);

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const data = useCashierPerformance(startDate, endDate);

  return (
    <div className="card p-4 border-0">
      <h4 className="mb-3">Reports</h4>

      <ReportHeader
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
      />

      <CashierPerformanceTable data={data} />
    </div>
  );
};

export default ReportsPage;