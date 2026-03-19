import type { BclcReportResult } from "../types/reports.types";

const getColorClass = (value: number) => {
  if (value > 0) return "text-success fw-semibold";
  if (value < 0) return "text-danger fw-semibold";
  return "text-dark fw-semibold";
};

const formatMoney = (value: number | null) => {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const BclcReportTable = ({
  data,
}: {
  data: BclcReportResult;
}) => {
  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-3 border-bottom bg-light fw-semibold">
            BCLC Summary
          </div>

          {data.days.length === 0 ? (
            <div className="p-4">
              <div className="alert alert-light border mb-0">
                No BCLC records found for the selected date range.
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 110 }}>Date</th>
                    <th style={{ minWidth: 150 }}>Sales - On Demand</th>
                    <th style={{ minWidth: 160 }}>Sales - S&amp;W Activation</th>
                    <th style={{ minWidth: 150 }}>Sales - FT On Demand</th>
                    <th style={{ minWidth: 130 }}>Sales - FT S&amp;W</th>
                    <th style={{ minWidth: 120 }}>Discounts</th>
                    <th style={{ minWidth: 160 }}>Printed Cancellation</th>
                    <th style={{ minWidth: 160 }}>Scratch Cancellation</th>
                    <th style={{ minWidth: 170 }}>Val - Cash on Demand</th>
                    <th style={{ minWidth: 140 }}>Val - Cash S&amp;W</th>
                    <th style={{ minWidth: 150 }}>Val - FT on Demand</th>
                    <th style={{ minWidth: 130 }}>Val - FT S&amp;W</th>
                    <th style={{ minWidth: 130 }}>Val - Vouchers</th>
                  </tr>
                </thead>

                <tbody>
                  {data.days.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{formatMoney(row.salesOnDemand)}</td>
                      <td>{formatMoney(row.salesSwActivation)}</td>
                      <td>{formatMoney(row.salesFtOnDemand)}</td>
                      <td>{formatMoney(row.salesFtSw)}</td>
                      <td>{formatMoney(row.discounts)}</td>
                      <td>{formatMoney(row.printedCancellation)}</td>
                      <td>{formatMoney(row.scratchCancellation)}</td>
                      <td>{formatMoney(row.valCashOnDemand)}</td>
                      <td>{formatMoney(row.valCashSw)}</td>
                      <td>{formatMoney(row.valFtOnDemand)}</td>
                      <td>{formatMoney(row.valFtSw)}</td>
                      <td>{formatMoney(row.valVouchers)}</td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="table-light">
                  <tr>
                    <th>Total</th>
                    <th>{formatMoney(data.totals.salesOnDemand)}</th>
                    <th>{formatMoney(data.totals.salesSwActivation)}</th>
                    <th>{formatMoney(data.totals.salesFtOnDemand)}</th>
                    <th>{formatMoney(data.totals.salesFtSw)}</th>
                    <th>{formatMoney(data.totals.discounts)}</th>
                    <th>{formatMoney(data.totals.printedCancellation)}</th>
                    <th>{formatMoney(data.totals.scratchCancellation)}</th>
                    <th>{formatMoney(data.totals.valCashOnDemand)}</th>
                    <th>{formatMoney(data.totals.valCashSw)}</th>
                    <th>{formatMoney(data.totals.valFtOnDemand)}</th>
                    <th>{formatMoney(data.totals.valFtSw)}</th>
                    <th>{formatMoney(data.totals.valVouchers)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-3 border-bottom bg-light fw-semibold">
            Over / Short
          </div>

          {data.days.length === 0 ? (
            <div className="p-4">
              <div className="alert alert-light border mb-0">
                No over / short records found for the selected date range.
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 110 }}>Date</th>
                    <th style={{ minWidth: 160 }}>Sale on Demand</th>
                    <th style={{ minWidth: 130 }}>S&amp;W</th>
                    <th style={{ minWidth: 130 }}>Payout</th>
                  </tr>
                </thead>

                <tbody>
                  {data.days.map((row) => (
                    <tr key={`os-${row.date}`}>
                      <td>{row.date}</td>
                      <td
                        className={
                          row.overShortSalesOnDemand !== null
                            ? getColorClass(row.overShortSalesOnDemand)
                            : ""
                        }
                      >
                        {formatMoney(row.overShortSalesOnDemand)}
                      </td>
                      <td
                        className={
                          row.overShortSw !== null
                            ? getColorClass(row.overShortSw)
                            : ""
                        }
                      >
                        {formatMoney(row.overShortSw)}
                      </td>
                      <td
                        className={
                          row.overShortPayout !== null
                            ? getColorClass(row.overShortPayout)
                            : ""
                        }
                      >
                        {formatMoney(row.overShortPayout)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="table-light">
                  <tr>
                    <th>Total</th>
                    <th className={getColorClass(data.totals.overShortSalesOnDemand)}>
                      {formatMoney(data.totals.overShortSalesOnDemand)}
                    </th>
                    <th className={getColorClass(data.totals.overShortSw)}>
                      {formatMoney(data.totals.overShortSw)}
                    </th>
                    <th className={getColorClass(data.totals.overShortPayout)}>
                      {formatMoney(data.totals.overShortPayout)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BclcReportTable;