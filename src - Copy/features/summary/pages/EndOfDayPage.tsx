import { useEffect, useMemo, useRef, useState } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { toNumberOrNull } from "../../../utils/number";

type Props = {
  date: string;
};

const isDigitsOnly = (s: string) => /^\d*$/.test(s);

const normalizeIntString = (raw: string): string => {
  const t = raw.trim();
  if (t === "") return "";
  if (!isDigitsOnly(t)) return "";
  return String(Number(t));
};

const EndOfDayPage = ({ date }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const syncStatus = useDailyStore((s) => s.getSyncStatus(date));

  const setEnd1 = useDailyStore((s) => s.setEndOfDayInput1);
  const setEnd2 = useDailyStore((s) => s.setEndOfDayInput2);
  const setPropaneExchange = useDailyStore((s) => s.setPropaneExchange);
  const setPropaneNew = useDailyStore((s) => s.setPropaneNew);

  const entry = useMemo(() => {
    return byDate[date] ?? null;
  }, [byDate, date]);

  const [input1Value, setInput1Value] = useState("");
  const [input2Value, setInput2Value] = useState("");
  const [propaneExchangeValue, setPropaneExchangeValue] = useState("");
  const [propaneNewValue, setPropaneNewValue] = useState("");

  const input2Ref = useRef<HTMLInputElement | null>(null);
  const propaneExchangeRef = useRef<HTMLInputElement | null>(null);
  const propaneNewRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInput1Value(entry?.endOfDayInput1 == null ? "" : String(entry.endOfDayInput1));
  }, [date, entry?.endOfDayInput1]);

  useEffect(() => {
    setInput2Value(entry?.endOfDayInput2 == null ? "" : String(entry.endOfDayInput2));
  }, [date, entry?.endOfDayInput2]);

  useEffect(() => {
    setPropaneExchangeValue(entry?.propaneExchange == null ? "" : String(entry.propaneExchange));
  }, [date, entry?.propaneExchange]);

  useEffect(() => {
    setPropaneNewValue(entry?.propaneNew == null ? "" : String(entry.propaneNew));
  }, [date, entry?.propaneNew]);

  const handleInput1Change = (raw: string) => {
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setInput1Value(raw);
    setEnd1(date, toNumberOrNull(raw));
  };

  const handleInput2Change = (raw: string) => {
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setInput2Value(raw);
    setEnd2(date, toNumberOrNull(raw));
  };

  const handlePropaneExchangeChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setPropaneExchangeValue(raw);
    setPropaneExchange(date, raw.trim() === "" ? null : Number(raw));
  };

  const handlePropaneNewChange = (raw: string) => {
    if (!isDigitsOnly(raw)) return;
    setPropaneNewValue(raw);
    setPropaneNew(date, raw.trim() === "" ? null : Number(raw));
  };

  const handleInput1Blur = () => {
    const parsed = toNumberOrNull(input1Value);
    setInput1Value(parsed === null ? "" : String(parsed));
  };

  const handleInput2Blur = () => {
    const parsed = toNumberOrNull(input2Value);
    setInput2Value(parsed === null ? "" : String(parsed));
  };

  const handlePropaneExchangeBlur = () => {
    setPropaneExchangeValue(normalizeIntString(propaneExchangeValue));
  };

  const handlePropaneNewBlur = () => {
    setPropaneNewValue(normalizeIntString(propaneNewValue));
  };

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

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div className="fw-semibold">End of Day Summary</div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-light border">{date}</span>
          <span className={`small ${syncTextClass}`}>{syncText}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="h6 mb-3">POS Inputs (Manual for now)</div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">End of Day Input 1</label>
            <input
              type="text"
              inputMode="decimal"
              className="form-control"
              value={input1Value}
              onChange={(e) => handleInput1Change(e.target.value)}
              onBlur={handleInput1Blur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  input2Ref.current?.focus();
                }
              }}
              placeholder="0.00"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">End of Day Input 2</label>
            <input
              ref={input2Ref}
              type="text"
              inputMode="decimal"
              className="form-control"
              value={input2Value}
              onChange={(e) => handleInput2Change(e.target.value)}
              onBlur={handleInput2Blur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  propaneExchangeRef.current?.focus();
                }
              }}
              placeholder="0.00"
            />
          </div>
        </div>

        <hr />

        <div className="h6 mb-3">Propane POS (from Shift Inquiry)</div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Propane Exchange (Code 22)</label>
            <input
              ref={propaneExchangeRef}
              type="text"
              inputMode="numeric"
              className="form-control"
              value={propaneExchangeValue}
              onChange={(e) => handlePropaneExchangeChange(e.target.value)}
              onBlur={handlePropaneExchangeBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  propaneNewRef.current?.focus();
                }
              }}
              placeholder="0"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Propane New (Code 22)</label>
            <input
              ref={propaneNewRef}
              type="text"
              inputMode="numeric"
              className="form-control"
              value={propaneNewValue}
              onChange={(e) => handlePropaneNewChange(e.target.value)}
              onBlur={handlePropaneNewBlur}
              placeholder="0"
            />
          </div>
        </div>

        <hr />

        <div className="text-muted small">
          Auto-save is enabled. Changes are saved per selected date.
        </div>
      </div>
    </div>
  );
};

export default EndOfDayPage;