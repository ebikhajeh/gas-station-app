import type { CashierPerformanceResult } from "../types/reports.types";

const getColor = (v: number) => {
  if (v > 0) return "text-success fw-semibold";
  if (v < 0) return "text-danger fw-semibold";
  return "";
};

const CashierPerformanceTable = ({ data }: { data: CashierPerformanceResult }) => {
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Morning Cashier</th>
            <th>Morning</th>
            <th>Evening Cashier</th>
            <th>Evening</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {data.days.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.cashierMorning ?? "—"}</td>
              <td className={getColor(d.morningValue)}>{d.morningValue}</td>
              <td>{d.cashierEvening ?? "—"}</td>
              <td className={getColor(d.eveningValue)}>{d.eveningValue}</td>
              <td className={getColor(d.total)}>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-4">Morning Summary</h5>
      <table className="table table-bordered">
        <tbody>
          {data.summaryMorning.map((s) => (
            <tr key={s.cashier}>
              <td>{s.cashier}</td>
              <td className={getColor(s.total)}>{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-4">Evening Summary</h5>
      <table className="table table-bordered">
        <tbody>
          {data.summaryEvening.map((s) => (
            <tr key={s.cashier}>
              <td>{s.cashier}</td>
              <td className={getColor(s.total)}>{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CashierPerformanceTable;