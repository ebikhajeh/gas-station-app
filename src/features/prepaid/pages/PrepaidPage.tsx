import { useEffect, useMemo, useState } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import { toNumberOrNull, money } from "../../../utils/number";
import { computePrepaidCheck } from "../selectors/prepaid.selectors";

type Props = {
  date: string;
};

const PrepaidPage = ({ date }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const syncStatus = useDailyStore((s) => s.getSyncStatus(date));
  const setPrepaidInput = useDailyStore((s) => s.setPrepaidInput);

  const entry = useMemo(() => {
    return byDate[date] ?? null;
  }, [byDate, date]);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(entry?.prepaidInput == null ? "" : String(entry.prepaidInput));
  }, [date, entry?.prepaidInput]);

  const check = useMemo(() => computePrepaidCheck(entry), [entry]);

  const handleChange = (raw: string) => {
    // اجازه‌ی ورود عدد اعشاری
    if (!/^\d*\.?\d*$/.test(raw)) return;

    setInputValue(raw);
    setPrepaidInput(date, toNumberOrNull(raw));
  };

  const handleBlur = () => {
    const parsed = toNumberOrNull(inputValue);
    setInputValue(parsed === null ? "" : String(parsed));
  };

  const diffClass =
    !check.ready || check.diff === null
      ? "text-muted"
      : check.ok
      ? "text-success"
      : check.diff < 0
      ? "text-danger"
      : "text-success";

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
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-2 mb-3">
          <div>
            <h5 className="card-title mb-1">Prepaid</h5>
            <div className="text-muted small">
              Enter prepaid amount for the selected date.
            </div>
          </div>

          <div className={`small fw-semibold ${syncTextClass}`}>{syncText}</div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-5">
            <label className="form-label">Prepaid Amount</label>
            <input
              type="text"
              inputMode="decimal"
              className="form-control form-control-lg"
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="0.00"
            />
          </div>

          <div className="col-12 col-lg-7">
            <div className="border rounded p-3 h-100 bg-light">
              <div className="small text-muted mb-2">Calculated Result</div>

              {check.ready && check.diff !== null ? (
                <>
                  <div className={`display-6 fw-semibold mb-2 ${diffClass}`}>
                    {money(check.diff)}
                  </div>

                  <div className="small text-muted">
                    Formula: (End of Day 1 + End of Day 2) − Prepaid
                  </div>

                  <div className="mt-2">
                    {check.ok ? (
                      <span className="badge text-bg-success">OK</span>
                    ) : (
                      <span className="badge text-bg-danger">CHECK</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-muted">
                    Enter all required values to see the result.
                  </div>
                  <div className="mt-2">
                    <span className="badge text-bg-secondary">MISSING</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrepaidPage;