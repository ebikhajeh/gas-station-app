import { useEffect, useMemo, useRef, useState } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { computePropaneCheck, computePropaneStatus } from "../selectors/propane.selectors";

type Props = {
  date: string;
};

type FieldKey =
  | "fillOpening"
  | "fillDelivery"
  | "fillClosing"
  | "totalOpening"
  | "totalDelivery"
  | "totalClosing";

const inputOrder: FieldKey[] = [
  "fillOpening",
  "fillDelivery",
  "fillClosing",
  "totalOpening",
  "totalDelivery",
  "totalClosing",
];

const prevDateStr = (date: string) => {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const isDigitsOnly = (s: string) => /^\d*$/.test(s);

const toIntOrNull = (raw: string): number | null => {
  const t = raw.trim();
  if (t === "") return null;
  if (!isDigitsOnly(t)) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
};

const normalizeIntString = (raw: string): string => {
  const n = toIntOrNull(raw);
  return n === null ? "" : String(n);
};

const emptyPropaneEntry = {
  fillOpening: null as number | null,
  fillDelivery: null as number | null,
  fillClosing: null as number | null,
  totalOpening: null as number | null,
  totalDelivery: null as number | null,
  totalClosing: null as number | null,
  propaneExchange: null as number | null,
  propaneNew: null as number | null,
};

const PropanePage = ({ date }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const syncStatus = useDailyStore((s) => s.getSyncStatus(date));

  const setFillOpening = useDailyStore((s) => s.setFillOpening);
  const setFillDelivery = useDailyStore((s) => s.setFillDelivery);
  const setFillClosing = useDailyStore((s) => s.setFillClosing);

  const setTotalOpening = useDailyStore((s) => s.setTotalOpening);
  const setTotalDelivery = useDailyStore((s) => s.setTotalDelivery);
  const setTotalClosing = useDailyStore((s) => s.setTotalClosing);

  const entry = useMemo(() => {
    return byDate[date] ?? emptyPropaneEntry;
  }, [byDate, date]);

  const prevEntry = useMemo(() => {
    return byDate[prevDateStr(date)] ?? emptyPropaneEntry;
  }, [byDate, date]);

  const [fillOpeningStr, setFillOpeningStr] = useState("");
  const [fillDeliveryStr, setFillDeliveryStr] = useState("");
  const [fillClosingStr, setFillClosingStr] = useState("");

  const [totalOpeningStr, setTotalOpeningStr] = useState("");
  const [totalDeliveryStr, setTotalDeliveryStr] = useState("");
  const [totalClosingStr, setTotalClosingStr] = useState("");

  useEffect(() => {
    setFillOpeningStr(entry.fillOpening === null ? "" : String(entry.fillOpening));
  }, [date, entry.fillOpening]);

  useEffect(() => {
    setFillDeliveryStr(entry.fillDelivery === null ? "" : String(entry.fillDelivery));
  }, [date, entry.fillDelivery]);

  useEffect(() => {
    setFillClosingStr(entry.fillClosing === null ? "" : String(entry.fillClosing));
  }, [date, entry.fillClosing]);

  useEffect(() => {
    setTotalOpeningStr(entry.totalOpening === null ? "" : String(entry.totalOpening));
  }, [date, entry.totalOpening]);

  useEffect(() => {
    setTotalDeliveryStr(entry.totalDelivery === null ? "" : String(entry.totalDelivery));
  }, [date, entry.totalDelivery]);

  useEffect(() => {
    setTotalClosingStr(entry.totalClosing === null ? "" : String(entry.totalClosing));
  }, [date, entry.totalClosing]);

  const inputRefs = useRef<Record<FieldKey, HTMLInputElement | null>>({
    fillOpening: null,
    fillDelivery: null,
    fillClosing: null,
    totalOpening: null,
    totalDelivery: null,
    totalClosing: null,
  });

  const focusNext = (key: FieldKey) => {
    const currentIndex = inputOrder.indexOf(key);
    if (currentIndex === -1) return;

    const nextKey = inputOrder[currentIndex + 1];
    if (!nextKey) return;

    const nextRef = inputRefs.current[nextKey];
    if (nextRef) {
      nextRef.focus();
      nextRef.select?.();
    }
  };

  const handleEnter =
    (key: FieldKey) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNext(key);
      }
    };

  const handleFillOpeningChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setFillOpeningStr(raw);
    setFillOpening(date, toIntOrNull(raw));
  };

  const handleFillDeliveryChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setFillDeliveryStr(raw);
    setFillDelivery(date, toIntOrNull(raw));
  };

  const handleFillClosingChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setFillClosingStr(raw);
    setFillClosing(date, toIntOrNull(raw));
  };

  const handleTotalOpeningChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setTotalOpeningStr(raw);
    setTotalOpening(date, toIntOrNull(raw));
  };

  const handleTotalDeliveryChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setTotalDeliveryStr(raw);
    setTotalDelivery(date, toIntOrNull(raw));
  };

  const handleTotalClosingChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setTotalClosingStr(raw);
    setTotalClosing(date, toIntOrNull(raw));
  };

  const check = useMemo(() => computePropaneCheck(entry), [entry]);
  const status = useMemo(() => computePropaneStatus(entry), [entry]);

  const syncText =
    syncStatus === "idle"
      ? "AutoSave"
      : syncStatus === "saving"
      ? "Saving..."
      : syncStatus === "saved"
      ? "Saved"
      : "Save failed";

  const syncTextClass =
    syncStatus === "idle"
      ? "text-muted"
      : syncStatus === "saving"
      ? "text-warning"
      : syncStatus === "saved"
      ? "text-success"
      : "text-danger";

  const osClass = (n: number | null) =>
    n === null ? "text-muted" : n === 0 ? "text-success" : "text-danger";

  const alertClass =
    status === "ok"
      ? "alert-success"
      : status === "missing"
      ? "alert-warning"
      : "alert-danger";

  const prevFill = prevEntry.fillClosing;
  const prevTotal = prevEntry.totalClosing;

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div className="fw-semibold">Propane</div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-light border">{date}</span>
          <span className={`small ${syncTextClass}`}>{syncText}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="text-muted small">
          Sales = Opening + Delivery − Closing
          <br />
          Delivery is optional. Opening and Closing are required.
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 150 }}>Type</th>
                <th style={{ width: 140 }}>Previous Day</th>
                <th style={{ width: 140 }}>Opening *</th>
                <th style={{ width: 140 }}>Delivery</th>
                <th style={{ width: 140 }}>Closing *</th>
                <th style={{ width: 120 }}>Sales</th>
                <th style={{ width: 160 }}>Bulk (from Summary)</th>
                <th style={{ width: 140 }}>Over/Short</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="fw-semibold">Fill Tank</td>

                <td className="fw-semibold">{prevFill === null ? "—" : prevFill}</td>

                <td>
                  <input
                    ref={(node) => {
                      inputRefs.current.fillOpening = node;
                    }}
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={fillOpeningStr}
                    onChange={(e) => handleFillOpeningChange(e.target.value)}
                    onBlur={() => setFillOpeningStr(normalizeIntString(fillOpeningStr))}
                    onKeyDown={handleEnter("fillOpening")}
                    placeholder="required"
                  />
                </td>

                <td>
                  <input
                    ref={(node) => {
                      inputRefs.current.fillDelivery = node;
                    }}
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={fillDeliveryStr}
                    onChange={(e) => handleFillDeliveryChange(e.target.value)}
                    onBlur={() => setFillDeliveryStr(normalizeIntString(fillDeliveryStr))}
                    onKeyDown={handleEnter("fillDelivery")}
                    placeholder="optional"
                  />
                </td>

                <td>
                  <input
                    ref={(node) => {
                      inputRefs.current.fillClosing = node;
                    }}
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={fillClosingStr}
                    onChange={(e) => handleFillClosingChange(e.target.value)}
                    onBlur={() => setFillClosingStr(normalizeIntString(fillClosingStr))}
                    onKeyDown={handleEnter("fillClosing")}
                    placeholder="required"
                  />
                </td>

                <td className="fw-semibold">
                  {check.ready && check.salesFill !== null ? check.salesFill : "—"}
                </td>

                <td className="fw-semibold">
                  {entry.propaneExchange === null ? "—" : entry.propaneExchange}
                </td>

                <td className={`fw-bold ${osClass(check.overShortFill)}`}>
                  {check.ready && check.overShortFill !== null ? check.overShortFill : "—"}
                </td>
              </tr>

              <tr>
                <td className="fw-semibold">Total Tank</td>

                <td className="fw-semibold">{prevTotal === null ? "—" : prevTotal}</td>

                <td>
                  <input
                    ref={(node) => {
                      inputRefs.current.totalOpening = node;
                    }}
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={totalOpeningStr}
                    onChange={(e) => handleTotalOpeningChange(e.target.value)}
                    onBlur={() => setTotalOpeningStr(normalizeIntString(totalOpeningStr))}
                    onKeyDown={handleEnter("totalOpening")}
                    placeholder="required"
                  />
                </td>

                <td>
                  <input
                    ref={(node) => {
                      inputRefs.current.totalDelivery = node;
                    }}
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={totalDeliveryStr}
                    onChange={(e) => handleTotalDeliveryChange(e.target.value)}
                    onBlur={() => setTotalDeliveryStr(normalizeIntString(totalDeliveryStr))}
                    onKeyDown={handleEnter("totalDelivery")}
                    placeholder="optional"
                  />
                </td>

                <td>
                  <input
                    ref={(node) => {
                      inputRefs.current.totalClosing = node;
                    }}
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    value={totalClosingStr}
                    onChange={(e) => handleTotalClosingChange(e.target.value)}
                    onBlur={() => setTotalClosingStr(normalizeIntString(totalClosingStr))}
                    onKeyDown={handleEnter("totalClosing")}
                    placeholder="required"
                  />
                </td>

                <td className="fw-semibold">
                  {check.ready && check.salesTotal !== null ? check.salesTotal : "—"}
                </td>

                <td className="fw-semibold">
                  {entry.propaneNew === null ? "—" : entry.propaneNew}
                </td>

                <td className={`fw-bold ${osClass(check.overShortTotal)}`}>
                  {check.ready && check.overShortTotal !== null ? check.overShortTotal : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <div className={`alert ${alertClass} mb-0`}>
            {status === "missing" ? (
              <>⏳ MISSING — Enter Opening/Closing and make sure Propane POS is filled in End of Day.</>
            ) : status === "ok" ? (
              <>✅ OK — Over/Short is zero for both rows.</>
            ) : (
              <>⚠️ CHECK — Over/Short is not zero. Please review counts or POS values.</>
            )}
          </div>
        </div>

        <div className="text-muted small mt-3">
          Previous Day shows yesterday’s closing for reference only.
        </div>
      </div>
    </div>
  );
};

export default PropanePage;