interface Props {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

const ReportHeader = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: Props) => {
  return (
    <div className="d-flex gap-3 mb-4">
      <div>
        <label className="form-label">Start Date</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
        />
      </div>

      <div>
        <label className="form-label">End Date</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ReportHeader;