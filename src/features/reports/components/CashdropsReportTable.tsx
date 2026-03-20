import type { CashdropsReportResult } from "../types/reports.types";

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const CashdropsReportTable = ({
  data,
}: {
  data: CashdropsReportResult;
}) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="p-3 border-bottom bg-light fw-semibold">
          Cashdrops Report
        </div>

        {data.days.length === 0 ? (
          <div className="p-4">
            <div className="alert alert-light border mb-0">
              No cashdrops records found for the selected date range.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th rowSpan={2} style={{ minWidth: 120 }}>
                    Date
                  </th>
                  <th colSpan={2} className="text-center" style={{ minWidth: 370 }}>
                    Morning
                  </th>
                  <th colSpan={2} className="text-center" style={{ minWidth: 370 }}>
                    Evening
                  </th>
                  <th rowSpan={2} style={{ minWidth: 150 }}>
                    Total for Day
                  </th>
                  <th rowSpan={2} style={{ minWidth: 120 }}>
                    Coins
                  </th>
                  <th rowSpan={2} style={{ minWidth: 120 }}>
                    US
                  </th>
                  <th rowSpan={2} style={{ minWidth: 120 }}>
                    Others
                  </th>
                  <th rowSpan={2} style={{ minWidth: 260 }}>
                    Note
                  </th>
                </tr>
                <tr>
                  <th style={{ minWidth: 200 }}>Cashier</th>
                  <th style={{ minWidth: 170 }}>Cashdrops</th>
                  <th style={{ minWidth: 200 }}>Cashier</th>
                  <th style={{ minWidth: 170 }}>Cashdrops</th>
                </tr>
              </thead>

              <tbody>
                {data.days.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.cashierMorning ?? "—"}</td>
                    <td>{formatMoney(row.morningCashdrops)}</td>
                    <td>{row.cashierEvening ?? "—"}</td>
                    <td>{formatMoney(row.eveningCashdrops)}</td>
                    <td>{formatMoney(row.totalForDay)}</td>
                    <td>{formatMoney(row.coins)}</td>
                    <td>{formatMoney(row.us)}</td>
                    <td>{formatMoney(row.others)}</td>
                    <td>{row.note || "—"}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="table-light">
                <tr>
                  <th>Total</th>
                  <th>—</th>
                  <th>{formatMoney(data.totals.morningCashdrops)}</th>
                  <th>—</th>
                  <th>{formatMoney(data.totals.eveningCashdrops)}</th>
                  <th>{formatMoney(data.totals.totalForDay)}</th>
                  <th>{formatMoney(data.totals.coins)}</th>
                  <th>{formatMoney(data.totals.us)}</th>
                  <th>{formatMoney(data.totals.others)}</th>
                  <th>—</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashdropsReportTable;