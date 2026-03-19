import { useState } from "react";
import { getTodayLocalDateInput } from "../../../utils/date";
import ReportHeader from "../components/ReportHeader";
import CashierPerformanceTable from "../components/CashierPerformanceTable";
import CigarettesReportTable from "../components/CigarettesReportTable";
import BclcReportTable from "../components/BclcReportTable";
import { useCashierPerformance } from "../hooks/useCashierPerformance";
import { useCigarettesReport } from "../hooks/useCigarettesReport";
import { useBclcReport } from "../hooks/useBclcReport";

type ReportType =
  | ""
  | "cashierPerformance"
  | "cigarettesReport"
  | "bclc"
  | "monthlyOverShort"
  | "missingDays"
  | "fuelAnalysis";

const today = getTodayLocalDateInput();

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const cashierPerformanceData = useCashierPerformance(startDate, endDate);
  const cigarettesReportData = useCigarettesReport(startDate, endDate);
  const bclcReportData = useBclcReport(startDate, endDate);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="mb-4">
          <h4 className="mb-1">Reports</h4>
          <div className="text-muted small">
            Choose a report type, then apply your date range.
          </div>
        </div>

        <ReportHeader
          reportType={reportType}
          startDate={startDate}
          endDate={endDate}
          onReportTypeChange={setReportType}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />

        {reportType === "" && (
          <div className="alert alert-light border mt-4 mb-0">
            Please select a report type to view the report.
          </div>
        )}

        {reportType === "cashierPerformance" && (
          <div className="mt-4">
            <CashierPerformanceTable data={cashierPerformanceData} />
          </div>
        )}

        {reportType === "cigarettesReport" && (
          <div className="mt-4">
            <CigarettesReportTable data={cigarettesReportData} />
          </div>
        )}

        {reportType === "bclc" && (
          <div className="mt-4">
            <BclcReportTable data={bclcReportData} />
          </div>
        )}

        {reportType === "monthlyOverShort" && (
          <div className="alert alert-light border mt-4 mb-0">
            Monthly Over / Short report will be added next.
          </div>
        )}

        {reportType === "missingDays" && (
          <div className="alert alert-light border mt-4 mb-0">
            Missing Days report will be added next.
          </div>
        )}

        {reportType === "fuelAnalysis" && (
          <div className="alert alert-light border mt-4 mb-0">
            Fuel Analysis report will be added next.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;