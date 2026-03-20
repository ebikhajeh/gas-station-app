import type { BcpIvReportResult } from "../types/reports.types";

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const calcHeaderClass = "table-success";
const derivedHeaderClass = "table-warning";

const BcpIvReportTable = ({
  data,
}: {
  data: BcpIvReportResult;
}) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="p-3 border-bottom bg-light fw-semibold">BCP IV</div>

        {data.days.length === 0 ? (
          <div className="p-4">
            <div className="alert alert-light border mb-0">
              No BCP IV records found for the selected date range.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th className="table-light" style={{ minWidth: 120 }}>
                    Date
                  </th>

                  <th className={calcHeaderClass} style={{ minWidth: 140 }}>
                    Fuel Sales
                  </th>
                  <th className={calcHeaderClass} style={{ minWidth: 140 }}>
                    Gift Card
                  </th>
                  <th className="table-light" style={{ minWidth: 140 }}>
                    Pump Tests
                  </th>
                  <th className="table-light" style={{ minWidth: 140 }}>
                    Item Sales
                  </th>
                  <th className="table-light" style={{ minWidth: 150 }}>
                    Wrong Shelf Price
                  </th>
                  <th className="table-light" style={{ minWidth: 150 }}>
                    Damaged Product
                  </th>
                  <th className="table-light" style={{ minWidth: 150 }}>
                    Employee Discount
                  </th>
                  <th className="table-light" style={{ minWidth: 120 }}>
                    GST
                  </th>
                  <th className="table-light" style={{ minWidth: 120 }}>
                    GSTV
                  </th>
                  <th className="table-light" style={{ minWidth: 120 }}>
                    PST
                  </th>
                  <th className="table-light" style={{ minWidth: 120 }}>
                    PSTV
                  </th>
                  <th className="table-light" style={{ minWidth: 140 }}>
                    Penny Rounding
                  </th>

                  <th className={calcHeaderClass} style={{ minWidth: 140 }}>
                    Total POS
                  </th>
                  <th className="table-light" style={{ minWidth: 140 }}>
                    Pump Over Run
                  </th>
                  <th className="table-light" style={{ minWidth: 140 }}>
                    Delivery App
                  </th>
                  <th className={calcHeaderClass} style={{ minWidth: 140 }}>
                    Redemptions
                  </th>
                  <th className="table-light" style={{ minWidth: 150 }}>
                    Cigarettes 02
                  </th>
                  <th className="table-light" style={{ minWidth: 160 }}>
                    Other Tobacco 03
                  </th>

                  <th className="table-light" style={{ minWidth: 140 }}>
                    Cash Drops
                  </th>
                  <th className="table-light" style={{ minWidth: 140 }}>
                    Till Differ
                  </th>

                  <th className={derivedHeaderClass} style={{ minWidth: 140 }}>
                    BCP IV
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.days.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>

                    <td>{formatMoney(row.endOfDayFuelSales)}</td>
                    <td>{formatMoney(row.endOfDayEssoGift925)}</td>
                    <td>{formatMoney(row.endOfDayPumpTests)}</td>
                    <td>{formatMoney(row.endOfDayItemSales)}</td>
                    <td>{formatMoney(row.endOfDayWrongShelfPrice)}</td>
                    <td>{formatMoney(row.endOfDayDamagedProduct)}</td>
                    <td>{formatMoney(row.endOfDayEmployeeDiscount)}</td>
                    <td>{formatMoney(row.endOfDayGst)}</td>
                    <td>{formatMoney(row.endOfDayGstv)}</td>
                    <td>{formatMoney(row.endOfDayPst)}</td>
                    <td>{formatMoney(row.endOfDayPstv)}</td>
                    <td>{formatMoney(row.endOfDayPennyRounding)}</td>

                    <td>{formatMoney(row.endOfDayTotalPos)}</td>
                    <td>{formatMoney(row.endOfDayPumpOverRun)}</td>
                    <td>{formatMoney(row.endOfDayDeliveryApp)}</td>
                    <td>{formatMoney(row.endOfDayRedemptions)}</td>
                    <td>{formatMoney(row.endOfDayCigarettes02)}</td>
                    <td>{formatMoney(row.endOfDayOtherTobacco03)}</td>

                    <td>{formatMoney(row.cashDrops)}</td>
                    <td>{formatMoney(row.tillDiffer)}</td>

                    <td className="fw-semibold">{formatMoney(row.bcpIv)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="table-light">
                <tr>
                  <th>Total</th>

                  <th>{formatMoney(data.totals.endOfDayFuelSales)}</th>
                  <th>{formatMoney(data.totals.endOfDayEssoGift925)}</th>
                  <th>{formatMoney(data.totals.endOfDayPumpTests)}</th>
                  <th>{formatMoney(data.totals.endOfDayItemSales)}</th>
                  <th>{formatMoney(data.totals.endOfDayWrongShelfPrice)}</th>
                  <th>{formatMoney(data.totals.endOfDayDamagedProduct)}</th>
                  <th>{formatMoney(data.totals.endOfDayEmployeeDiscount)}</th>
                  <th>{formatMoney(data.totals.endOfDayGst)}</th>
                  <th>{formatMoney(data.totals.endOfDayGstv)}</th>
                  <th>{formatMoney(data.totals.endOfDayPst)}</th>
                  <th>{formatMoney(data.totals.endOfDayPstv)}</th>
                  <th>{formatMoney(data.totals.endOfDayPennyRounding)}</th>

                  <th>{formatMoney(data.totals.endOfDayTotalPos)}</th>
                  <th>{formatMoney(data.totals.endOfDayPumpOverRun)}</th>
                  <th>{formatMoney(data.totals.endOfDayDeliveryApp)}</th>
                  <th>{formatMoney(data.totals.endOfDayRedemptions)}</th>
                  <th>{formatMoney(data.totals.endOfDayCigarettes02)}</th>
                  <th>{formatMoney(data.totals.endOfDayOtherTobacco03)}</th>

                  <th>{formatMoney(data.totals.cashDrops)}</th>
                  <th>{formatMoney(data.totals.tillDiffer)}</th>

                  <th>{formatMoney(data.totals.bcpIv)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BcpIvReportTable;