import type { CashierPerformanceResult } from "../types/reports.types";

const getColorClass = (value: number) => {
  if (value > 0) return "text-success fw-semibold";
  if (value < 0) return "text-danger fw-semibold";
  return "text-dark fw-semibold";
};

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const EmptyState = ({ text }: { text: string }) => {
  return <div className="alert alert-light border mb-0">{text}</div>;
};

const CashierPerformanceTable = ({
  data,
}: {
  data: CashierPerformanceResult;
}) => {
  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-3 border-bottom bg-light fw-semibold">
            Cashier Performance
          </div>

          {data.days.length === 0 ? (
            <div className="p-4">
              <EmptyState text="No cashier records found for the selected date range." />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 130 }}>Date</th>
                    <th style={{ minWidth: 220 }}>Morning Cashier</th>
                    <th style={{ minWidth: 120 }}>Morning</th>
                    <th style={{ minWidth: 220 }}>Evening Cashier</th>
                    <th style={{ minWidth: 120 }}>Evening</th>
                    <th style={{ minWidth: 140 }}>Total for Day</th>
                  </tr>
                </thead>

                <tbody>
                  {data.days.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.cashierMorning ?? "—"}</td>
                      <td className={getColorClass(row.morningValue)}>
                        {formatAmount(row.morningValue)}
                      </td>
                      <td>{row.cashierEvening ?? "—"}</td>
                      <td className={getColorClass(row.eveningValue)}>
                        {formatAmount(row.eveningValue)}
                      </td>
                      <td className={getColorClass(row.total)}>
                        {formatAmount(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-0">
              <div className="p-3 border-bottom bg-light fw-semibold">
                Morning Summary
              </div>

              {data.summaryMorning.length === 0 ? (
                <div className="p-4">
                  <EmptyState text="No morning cashiers found in this date range." />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Cashier</th>
                        <th style={{ width: 160 }}>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.summaryMorning.map((row) => (
                        <tr key={row.cashierId}>
                          <td>{row.cashierLabel}</td>
                          <td className={getColorClass(row.total)}>
                            {formatAmount(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-0">
              <div className="p-3 border-bottom bg-light fw-semibold">
                Evening Summary
              </div>

              {data.summaryEvening.length === 0 ? (
                <div className="p-4">
                  <EmptyState text="No evening cashiers found in this date range." />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Cashier</th>
                        <th style={{ width: 160 }}>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.summaryEvening.map((row) => (
                        <tr key={row.cashierId}>
                          <td>{row.cashierLabel}</td>
                          <td className={getColorClass(row.total)}>
                            {formatAmount(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierPerformanceTable;