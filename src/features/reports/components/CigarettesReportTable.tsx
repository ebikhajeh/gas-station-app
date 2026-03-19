import type { CigarettesReportResult } from "../types/reports.types";

const getColorClass = (value: number) => {
  if (value > 0) return "text-success fw-semibold";
  if (value < 0) return "text-danger fw-semibold";
  return "text-dark fw-semibold";
};

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CigarettesReportTable = ({
  data,
}: {
  data: CigarettesReportResult;
}) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="p-3 border-bottom bg-light fw-semibold">
          Cigarettes Report
        </div>

        {data.days.length === 0 ? (
          <div className="p-4">
            <div className="alert alert-light border mb-0">
              No cigarettes records found for the selected date range.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 130 }}>Date</th>
                  <th style={{ minWidth: 140 }}>Opening</th>
                  <th style={{ minWidth: 140 }}>Closing</th>
                  <th style={{ minWidth: 140 }}>Sale</th>
                  <th style={{ minWidth: 140 }}>Bulk</th>
                  <th style={{ minWidth: 140 }}>Difference</th>
                </tr>
              </thead>

              <tbody>
                {data.days.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{formatAmount(row.opening)}</td>
                    <td>{formatAmount(row.closing)}</td>
                    <td>{formatAmount(row.sale)}</td>
                    <td>{formatAmount(row.bulk)}</td>
                    <td className={getColorClass(row.difference)}>
                      {formatAmount(row.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="table-light">
                <tr>
                  <th>Total</th>
                  <th>{formatAmount(data.totals.opening)}</th>
                  <th>{formatAmount(data.totals.closing)}</th>
                  <th>{formatAmount(data.totals.sale)}</th>
                  <th>{formatAmount(data.totals.bulk)}</th>
                  <th className={getColorClass(data.totals.difference)}>
                    {formatAmount(data.totals.difference)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CigarettesReportTable;