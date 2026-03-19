type ReportType =
  | ""
  | "cashierPerformance"
  | "cigarettesReport"
  | "monthlyOverShort"
  | "missingDays"
  | "fuelAnalysis";

interface Props {
  reportType: ReportType;
  startDate: string;
  endDate: string;
  onReportTypeChange: (value: ReportType) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

const ReportHeader = ({
  reportType,
  startDate,
  endDate,
  onReportTypeChange,
  onStartChange,
  onEndChange,
}: Props) => {
  return (
    <div className="row g-3 align-items-end">
      <div className="col-12 col-lg-4">
        <label className="form-label fw-semibold">Report Type</label>
        <select
          className="form-select"
          value={reportType}
          onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
        >
          <option value="">Select report</option>
          <option value="cashierPerformance">Cashier Performance</option>
          <option value="cigarettesReport">Cigarettes Report</option>
          <option value="monthlyOverShort">Monthly Over / Short</option>
          <option value="missingDays">Missing Days</option>
          <option value="fuelAnalysis">Fuel Analysis</option>
        </select>
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label fw-semibold">Start Date</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          disabled={reportType === ""}
        />
      </div>

      <div className="col-12 col-md-6 col-lg-4">
        <label className="form-label fw-semibold">End Date</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          disabled={reportType === ""}
        />
      </div>
    </div>
  );
};

export default ReportHeader;