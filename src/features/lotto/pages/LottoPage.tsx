import { useEffect, useMemo, useRef, useState } from "react";
import { makeEmptyDailyEntry } from "../../../domain/daily/daily.model";
import { useDailyStore } from "../../../store/daily/daily.store";
import {
  computeLottoStatus,
  computePrintedMorningActualSales,
  computePrintedOverShort,
  computePrintedPmDerived,
  computePrintedTotalActualSales,
  computeScratchMorningActualSales,
  computeScratchOverShort,
  computeScratchPmDerived,
  computeScratchTotalActualSales,
  computeValidationMorningTotal,
  computeValidationOverShort,
  computeValidationPmDerived,
  computeValidationTotal,
  getLottoEveningCashierLabel,
  getLottoMorningCashierLabel,
} from "../selectors/lotto.selectors";

type Status = "missing" | "check" | "ok";
type SyncStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  date: string;
  onStatusChange?: (status: Status) => void;
}

const formatDisplayNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDecimalInput = (value: string) => {
  if (value.trim() === "") return "";
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return value;

  const hasTrailingDot = normalized.endsWith(".");
  const decimalPart = normalized.split(".")[1] ?? "";

  if (hasTrailingDot) {
    return `${new Intl.NumberFormat("en-CA", {
      maximumFractionDigits: 0,
    }).format(Number(normalized.slice(0, -1) || "0"))}.`;
  }

  if (decimalPart.length > 0) {
    return `${new Intl.NumberFormat("en-CA", {
      maximumFractionDigits: 0,
    }).format(Number(normalized.split(".")[0] || "0"))}.${decimalPart}`;
  }

  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
  }).format(parsed);
};

const normalizeRawInput = (value: string) => value.replace(/,/g, "");

const toNumberOrNull = (value: string): number | null => {
  const v = value.trim();
  if (v === "") return null;
  const parsed = Number(v.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const syncText = (status: SyncStatus) => {
  if (status === "saving") return "Saving...";
  if (status === "saved") return "Saved";
  if (status === "error") return "Save failed";
  return "AutoSave";
};

const statusBadgeClass = (status: Status) => {
  if (status === "ok") return "bg-success";
  if (status === "check") return "bg-warning text-dark";
  return "bg-secondary";
};

const overShortClass = (value: number | null) => {
  if (value === null) return "text-muted fw-semibold";
  if (value === 0) return "text-success fw-semibold";
  if (value < 0) return "text-danger fw-semibold";
  return "text-primary fw-semibold";
};

const cardShellStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
};

const printedSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#6fa7f1",
};

const scratchSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#f1c08c",
};

const validationSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#a4e287",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
};

type LottoInputProps = {
  value: string;
  onRawChange: (raw: string) => void;
  inputRef?: (node: HTMLInputElement | null) => void;
  onEnterKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const LottoInput = ({
  value,
  onRawChange,
  inputRef,
  onEnterKeyDown,
}: LottoInputProps) => {
  return (
    <input
      ref={inputRef}
      className="form-control"
      value={formatDecimalInput(value)}
      onChange={(e) => onRawChange(normalizeRawInput(e.target.value))}
      onKeyDown={onEnterKeyDown}
      inputMode="decimal"
      style={{ minWidth: 100 }}
    />
  );
};

type LottoReadonlyProps = {
  value: number | null | undefined;
};

const LottoReadonly = ({ value }: LottoReadonlyProps) => {
  return <div className="fw-semibold">{formatDisplayNumber(value)}</div>;
};

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  sectionStyle?: React.CSSProperties;
};

const SectionCard = ({ title, children, sectionStyle }: SectionCardProps) => {
  return (
    <div className="p-3 p-lg-4 mb-4" style={sectionStyle ?? cardShellStyle}>
      <div className="mb-3" style={sectionTitleStyle}>
        {title}
      </div>
      {children}
    </div>
  );
};

const LottoPage = ({ date, onStatusChange }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const getSyncStatus = useDailyStore((s) => s.getSyncStatus);

  const setLottoPrintedMorningOnDemand = useDailyStore((s) => s.setLottoPrintedMorningOnDemand);
  const setLottoPrintedMorningFtOnDemand = useDailyStore((s) => s.setLottoPrintedMorningFtOnDemand);
  const setLottoPrintedMorningCancellation = useDailyStore((s) => s.setLottoPrintedMorningCancellation);
  const setLottoPrintedMorningDiscounts = useDailyStore((s) => s.setLottoPrintedMorningDiscounts);
  const setLottoPrintedTotalOnDemand = useDailyStore((s) => s.setLottoPrintedTotalOnDemand);
  const setLottoPrintedTotalFtOnDemand = useDailyStore((s) => s.setLottoPrintedTotalFtOnDemand);
  const setLottoPrintedTotalCancellation = useDailyStore((s) => s.setLottoPrintedTotalCancellation);
  const setLottoPrintedTotalDiscounts = useDailyStore((s) => s.setLottoPrintedTotalDiscounts);

  const setLottoScratchMorningSwActivation = useDailyStore((s) => s.setLottoScratchMorningSwActivation);
  const setLottoScratchMorningFtSw = useDailyStore((s) => s.setLottoScratchMorningFtSw);
  const setLottoScratchMorningCancellation = useDailyStore((s) => s.setLottoScratchMorningCancellation);
  const setLottoScratchTotalSwActivation = useDailyStore((s) => s.setLottoScratchTotalSwActivation);
  const setLottoScratchTotalFtSw = useDailyStore((s) => s.setLottoScratchTotalFtSw);
  const setLottoScratchTotalCancellation = useDailyStore((s) => s.setLottoScratchTotalCancellation);

  const setLottoValidationMorningCashOnDemand = useDailyStore((s) => s.setLottoValidationMorningCashOnDemand);
  const setLottoValidationMorningCashSw = useDailyStore((s) => s.setLottoValidationMorningCashSw);
  const setLottoValidationMorningFtOnDemand = useDailyStore((s) => s.setLottoValidationMorningFtOnDemand);
  const setLottoValidationMorningFtSw = useDailyStore((s) => s.setLottoValidationMorningFtSw);
  const setLottoValidationMorningVouchers = useDailyStore((s) => s.setLottoValidationMorningVouchers);
  const setLottoValidationTotalCashOnDemand = useDailyStore((s) => s.setLottoValidationTotalCashOnDemand);
  const setLottoValidationTotalCashSw = useDailyStore((s) => s.setLottoValidationTotalCashSw);
  const setLottoValidationTotalFtOnDemand = useDailyStore((s) => s.setLottoValidationTotalFtOnDemand);
  const setLottoValidationTotalFtSw = useDailyStore((s) => s.setLottoValidationTotalFtSw);
  const setLottoValidationTotalVouchers = useDailyStore((s) => s.setLottoValidationTotalVouchers);

  const entry = useMemo(() => byDate[date] ?? makeEmptyDailyEntry(), [byDate, date]);
  const sync = getSyncStatus(date);
  const status = useMemo(() => computeLottoStatus(entry), [entry]);

  const lottoInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusNextLottoInput = (index: number) => {
    const next = lottoInputRefs.current[index + 1];
    if (next) {
      next.focus();
      next.select?.();
    }
  };

  const handleLottoEnter =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNextLottoInput(index);
      }
    };

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const morningCashierLabel = useMemo(() => getLottoMorningCashierLabel(entry), [entry]);
  const eveningCashierLabel = useMemo(() => getLottoEveningCashierLabel(entry), [entry]);

  const printedPm = useMemo(() => computePrintedPmDerived(entry), [entry]);
  const scratchPm = useMemo(() => computeScratchPmDerived(entry), [entry]);
  const validationPm = useMemo(() => computeValidationPmDerived(entry), [entry]);

  const printedMorningActual = useMemo(() => computePrintedMorningActualSales(entry), [entry]);
  const printedTotalActual = useMemo(() => computePrintedTotalActualSales(entry), [entry]);
  const printedOS = useMemo(() => computePrintedOverShort(entry), [entry]);

  const scratchMorningActual = useMemo(() => computeScratchMorningActualSales(entry), [entry]);
  const scratchTotalActual = useMemo(() => computeScratchTotalActualSales(entry), [entry]);
  const scratchOS = useMemo(() => computeScratchOverShort(entry), [entry]);

  const validationMorningTotal = useMemo(() => computeValidationMorningTotal(entry), [entry]);
  const validationTotal = useMemo(() => computeValidationTotal(entry), [entry]);
  const validationOS = useMemo(() => computeValidationOverShort(entry), [entry]);

  const [lottoPrintedMorningOnDemandInput, setLottoPrintedMorningOnDemandInput] = useState("");
  const [lottoPrintedMorningFtOnDemandInput, setLottoPrintedMorningFtOnDemandInput] = useState("");
  const [lottoPrintedMorningCancellationInput, setLottoPrintedMorningCancellationInput] = useState("");
  const [lottoPrintedMorningDiscountsInput, setLottoPrintedMorningDiscountsInput] = useState("");
  const [lottoPrintedTotalOnDemandInput, setLottoPrintedTotalOnDemandInput] = useState("");
  const [lottoPrintedTotalFtOnDemandInput, setLottoPrintedTotalFtOnDemandInput] = useState("");
  const [lottoPrintedTotalCancellationInput, setLottoPrintedTotalCancellationInput] = useState("");
  const [lottoPrintedTotalDiscountsInput, setLottoPrintedTotalDiscountsInput] = useState("");

  const [lottoScratchMorningSwActivationInput, setLottoScratchMorningSwActivationInput] = useState("");
  const [lottoScratchMorningFtSwInput, setLottoScratchMorningFtSwInput] = useState("");
  const [lottoScratchMorningCancellationInput, setLottoScratchMorningCancellationInput] = useState("");
  const [lottoScratchTotalSwActivationInput, setLottoScratchTotalSwActivationInput] = useState("");
  const [lottoScratchTotalFtSwInput, setLottoScratchTotalFtSwInput] = useState("");
  const [lottoScratchTotalCancellationInput, setLottoScratchTotalCancellationInput] = useState("");

  const [lottoValidationMorningCashOnDemandInput, setLottoValidationMorningCashOnDemandInput] = useState("");
  const [lottoValidationMorningCashSwInput, setLottoValidationMorningCashSwInput] = useState("");
  const [lottoValidationMorningFtOnDemandInput, setLottoValidationMorningFtOnDemandInput] = useState("");
  const [lottoValidationMorningFtSwInput, setLottoValidationMorningFtSwInput] = useState("");
  const [lottoValidationMorningVouchersInput, setLottoValidationMorningVouchersInput] = useState("");
  const [lottoValidationTotalCashOnDemandInput, setLottoValidationTotalCashOnDemandInput] = useState("");
  const [lottoValidationTotalCashSwInput, setLottoValidationTotalCashSwInput] = useState("");
  const [lottoValidationTotalFtOnDemandInput, setLottoValidationTotalFtOnDemandInput] = useState("");
  const [lottoValidationTotalFtSwInput, setLottoValidationTotalFtSwInput] = useState("");
  const [lottoValidationTotalVouchersInput, setLottoValidationTotalVouchersInput] = useState("");

  useEffect(() => {
    setLottoPrintedMorningOnDemandInput(entry.lottoPrintedMorningOnDemand?.toString() ?? "");
    setLottoPrintedMorningFtOnDemandInput(entry.lottoPrintedMorningFtOnDemand?.toString() ?? "");
    setLottoPrintedMorningCancellationInput(entry.lottoPrintedMorningCancellation?.toString() ?? "");
    setLottoPrintedMorningDiscountsInput(entry.lottoPrintedMorningDiscounts?.toString() ?? "");
    setLottoPrintedTotalOnDemandInput(entry.lottoPrintedTotalOnDemand?.toString() ?? "");
    setLottoPrintedTotalFtOnDemandInput(entry.lottoPrintedTotalFtOnDemand?.toString() ?? "");
    setLottoPrintedTotalCancellationInput(entry.lottoPrintedTotalCancellation?.toString() ?? "");
    setLottoPrintedTotalDiscountsInput(entry.lottoPrintedTotalDiscounts?.toString() ?? "");

    setLottoScratchMorningSwActivationInput(entry.lottoScratchMorningSwActivation?.toString() ?? "");
    setLottoScratchMorningFtSwInput(entry.lottoScratchMorningFtSw?.toString() ?? "");
    setLottoScratchMorningCancellationInput(entry.lottoScratchMorningCancellation?.toString() ?? "");
    setLottoScratchTotalSwActivationInput(entry.lottoScratchTotalSwActivation?.toString() ?? "");
    setLottoScratchTotalFtSwInput(entry.lottoScratchTotalFtSw?.toString() ?? "");
    setLottoScratchTotalCancellationInput(entry.lottoScratchTotalCancellation?.toString() ?? "");

    setLottoValidationMorningCashOnDemandInput(entry.lottoValidationMorningCashOnDemand?.toString() ?? "");
    setLottoValidationMorningCashSwInput(entry.lottoValidationMorningCashSw?.toString() ?? "");
    setLottoValidationMorningFtOnDemandInput(entry.lottoValidationMorningFtOnDemand?.toString() ?? "");
    setLottoValidationMorningFtSwInput(entry.lottoValidationMorningFtSw?.toString() ?? "");
    setLottoValidationMorningVouchersInput(entry.lottoValidationMorningVouchers?.toString() ?? "");
    setLottoValidationTotalCashOnDemandInput(entry.lottoValidationTotalCashOnDemand?.toString() ?? "");
    setLottoValidationTotalCashSwInput(entry.lottoValidationTotalCashSw?.toString() ?? "");
    setLottoValidationTotalFtOnDemandInput(entry.lottoValidationTotalFtOnDemand?.toString() ?? "");
    setLottoValidationTotalFtSwInput(entry.lottoValidationTotalFtSw?.toString() ?? "");
    setLottoValidationTotalVouchersInput(entry.lottoValidationTotalVouchers?.toString() ?? "");
  }, [date]);

  return (
    <div className="card border-0" style={cardShellStyle}>
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start align-items-md-center flex-column flex-md-row gap-2 pt-4 px-4">
        <div>
          <h5 className="mb-1">Lotto</h5>
          <div className="text-muted small">
            Printed Lotto, Scratch Lotto and Validation
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">{syncText(sync)}</span>
          <span className={`badge ${statusBadgeClass(status)}`}>
            {status === "ok" ? "OK" : status === "check" ? "CHECK" : "MISSING"}
          </span>
        </div>
      </div>

      <div className="card-body px-4 pb-4">
        <SectionCard title="Printed Lotto" sectionStyle={printedSectionStyle}>
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0 bg-white">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 180 }}>Field</th>
                  <th style={{ minWidth: 180 }}>{morningCashierLabel || "Morning Cashier"}</th>
                  <th style={{ minWidth: 180 }}>{eveningCashierLabel || "Evening Cashier"}</th>
                  <th style={{ minWidth: 180 }}>Total for Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>On Demand</th>
                  <td>
                    <LottoInput
                      value={lottoPrintedMorningOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoPrintedMorningOnDemandInput(raw);
                        setLottoPrintedMorningOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[0] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(0)}
                    />
                  </td>
                  <td><LottoReadonly value={printedPm.onDemand} /></td>
                  <td>
                    <LottoInput
                      value={lottoPrintedTotalOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoPrintedTotalOnDemandInput(raw);
                        setLottoPrintedTotalOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[12] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(12)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>FT On Demand</th>
                  <td>
                    <LottoInput
                      value={lottoPrintedMorningFtOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoPrintedMorningFtOnDemandInput(raw);
                        setLottoPrintedMorningFtOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[1] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(1)}
                    />
                  </td>
                  <td><LottoReadonly value={printedPm.ftOnDemand} /></td>
                  <td>
                    <LottoInput
                      value={lottoPrintedTotalFtOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoPrintedTotalFtOnDemandInput(raw);
                        setLottoPrintedTotalFtOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[13] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(13)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>Cancellation</th>
                  <td>
                    <LottoInput
                      value={lottoPrintedMorningCancellationInput}
                      onRawChange={(raw) => {
                        setLottoPrintedMorningCancellationInput(raw);
                        setLottoPrintedMorningCancellation(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[2] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(2)}
                    />
                  </td>
                  <td><LottoReadonly value={printedPm.cancellation} /></td>
                  <td>
                    <LottoInput
                      value={lottoPrintedTotalCancellationInput}
                      onRawChange={(raw) => {
                        setLottoPrintedTotalCancellationInput(raw);
                        setLottoPrintedTotalCancellation(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[14] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(14)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>Discounts</th>
                  <td>
                    <LottoInput
                      value={lottoPrintedMorningDiscountsInput}
                      onRawChange={(raw) => {
                        setLottoPrintedMorningDiscountsInput(raw);
                        setLottoPrintedMorningDiscounts(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[3] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(3)}
                    />
                  </td>
                  <td><LottoReadonly value={printedPm.discounts} /></td>
                  <td>
                    <LottoInput
                      value={lottoPrintedTotalDiscountsInput}
                      onRawChange={(raw) => {
                        setLottoPrintedTotalDiscountsInput(raw);
                        setLottoPrintedTotalDiscounts(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[15] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(15)}
                    />
                  </td>
                </tr>

                <tr className="table-light">
                  <th>Actual Sales</th>
                  <td><LottoReadonly value={printedMorningActual} /></td>
                  <td><LottoReadonly value={printedPm.actualSales} /></td>
                  <td><LottoReadonly value={printedTotalActual} /></td>
                </tr>

                <tr>
                  <th>Online Lotto 41</th>
                  <td colSpan={2}></td>
                  <td><LottoReadonly value={entry.onlineLotto41} /></td>
                </tr>

                <tr>
                  <th>Over / Short</th>
                  <td colSpan={2}></td>
                  <td className={overShortClass(printedOS)}>
                    {formatDisplayNumber(printedOS)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Scratch Lotto" sectionStyle={scratchSectionStyle}>
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0 bg-white">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 180 }}>Field</th>
                  <th style={{ minWidth: 180 }}>{morningCashierLabel || "Morning Cashier"}</th>
                  <th style={{ minWidth: 180 }}>{eveningCashierLabel || "Evening Cashier"}</th>
                  <th style={{ minWidth: 180 }}>Total for Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>SW Activation</th>
                  <td>
                    <LottoInput
                      value={lottoScratchMorningSwActivationInput}
                      onRawChange={(raw) => {
                        setLottoScratchMorningSwActivationInput(raw);
                        setLottoScratchMorningSwActivation(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[4] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(4)}
                    />
                  </td>
                  <td><LottoReadonly value={scratchPm.swActivation} /></td>
                  <td>
                    <LottoInput
                      value={lottoScratchTotalSwActivationInput}
                      onRawChange={(raw) => {
                        setLottoScratchTotalSwActivationInput(raw);
                        setLottoScratchTotalSwActivation(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[16] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(16)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>FT SW</th>
                  <td>
                    <LottoInput
                      value={lottoScratchMorningFtSwInput}
                      onRawChange={(raw) => {
                        setLottoScratchMorningFtSwInput(raw);
                        setLottoScratchMorningFtSw(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[5] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(5)}
                    />
                  </td>
                  <td><LottoReadonly value={scratchPm.ftSw} /></td>
                  <td>
                    <LottoInput
                      value={lottoScratchTotalFtSwInput}
                      onRawChange={(raw) => {
                        setLottoScratchTotalFtSwInput(raw);
                        setLottoScratchTotalFtSw(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[17] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(17)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>Cancellation</th>
                  <td>
                    <LottoInput
                      value={lottoScratchMorningCancellationInput}
                      onRawChange={(raw) => {
                        setLottoScratchMorningCancellationInput(raw);
                        setLottoScratchMorningCancellation(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[6] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(6)}
                    />
                  </td>
                  <td><LottoReadonly value={scratchPm.cancellation} /></td>
                  <td>
                    <LottoInput
                      value={lottoScratchTotalCancellationInput}
                      onRawChange={(raw) => {
                        setLottoScratchTotalCancellationInput(raw);
                        setLottoScratchTotalCancellation(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[18] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(18)}
                    />
                  </td>
                </tr>

                <tr className="table-light">
                  <th>Actual Sales</th>
                  <td><LottoReadonly value={scratchMorningActual} /></td>
                  <td><LottoReadonly value={scratchPm.actualSales} /></td>
                  <td><LottoReadonly value={scratchTotalActual} /></td>
                </tr>

                <tr>
                  <th>Scratch Lotto 27</th>
                  <td colSpan={2}></td>
                  <td><LottoReadonly value={entry.scratchLotto27} /></td>
                </tr>

                <tr>
                  <th>Over / Short</th>
                  <td colSpan={2}></td>
                  <td className={overShortClass(scratchOS)}>
                    {formatDisplayNumber(scratchOS)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Validation" sectionStyle={validationSectionStyle}>
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0 bg-white">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 180 }}>Field</th>
                  <th style={{ minWidth: 180 }}>{morningCashierLabel || "Morning Cashier"}</th>
                  <th style={{ minWidth: 180 }}>{eveningCashierLabel || "Evening Cashier"}</th>
                  <th style={{ minWidth: 180 }}>Total for Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Cash On Demand</th>
                  <td>
                    <LottoInput
                      value={lottoValidationMorningCashOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoValidationMorningCashOnDemandInput(raw);
                        setLottoValidationMorningCashOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[7] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(7)}
                    />
                  </td>
                  <td><LottoReadonly value={validationPm.cashOnDemand} /></td>
                  <td>
                    <LottoInput
                      value={lottoValidationTotalCashOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoValidationTotalCashOnDemandInput(raw);
                        setLottoValidationTotalCashOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[19] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(19)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>Cash SW</th>
                  <td>
                    <LottoInput
                      value={lottoValidationMorningCashSwInput}
                      onRawChange={(raw) => {
                        setLottoValidationMorningCashSwInput(raw);
                        setLottoValidationMorningCashSw(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[8] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(8)}
                    />
                  </td>
                  <td><LottoReadonly value={validationPm.cashSw} /></td>
                  <td>
                    <LottoInput
                      value={lottoValidationTotalCashSwInput}
                      onRawChange={(raw) => {
                        setLottoValidationTotalCashSwInput(raw);
                        setLottoValidationTotalCashSw(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[20] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(20)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>FT On Demand</th>
                  <td>
                    <LottoInput
                      value={lottoValidationMorningFtOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoValidationMorningFtOnDemandInput(raw);
                        setLottoValidationMorningFtOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[9] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(9)}
                    />
                  </td>
                  <td><LottoReadonly value={validationPm.ftOnDemand} /></td>
                  <td>
                    <LottoInput
                      value={lottoValidationTotalFtOnDemandInput}
                      onRawChange={(raw) => {
                        setLottoValidationTotalFtOnDemandInput(raw);
                        setLottoValidationTotalFtOnDemand(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[21] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(21)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>FT SW</th>
                  <td>
                    <LottoInput
                      value={lottoValidationMorningFtSwInput}
                      onRawChange={(raw) => {
                        setLottoValidationMorningFtSwInput(raw);
                        setLottoValidationMorningFtSw(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[10] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(10)}
                    />
                  </td>
                  <td><LottoReadonly value={validationPm.ftSw} /></td>
                  <td>
                    <LottoInput
                      value={lottoValidationTotalFtSwInput}
                      onRawChange={(raw) => {
                        setLottoValidationTotalFtSwInput(raw);
                        setLottoValidationTotalFtSw(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[22] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(22)}
                    />
                  </td>
                </tr>

                <tr>
                  <th>Vouchers</th>
                  <td>
                    <LottoInput
                      value={lottoValidationMorningVouchersInput}
                      onRawChange={(raw) => {
                        setLottoValidationMorningVouchersInput(raw);
                        setLottoValidationMorningVouchers(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[11] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(11)}
                    />
                  </td>
                  <td><LottoReadonly value={validationPm.vouchers} /></td>
                  <td>
                    <LottoInput
                      value={lottoValidationTotalVouchersInput}
                      onRawChange={(raw) => {
                        setLottoValidationTotalVouchersInput(raw);
                        setLottoValidationTotalVouchers(date, toNumberOrNull(raw));
                      }}
                      inputRef={(node) => {
                        lottoInputRefs.current[23] = node;
                      }}
                      onEnterKeyDown={handleLottoEnter(23)}
                    />
                  </td>
                </tr>

                <tr className="table-light">
                  <th>Total</th>
                  <td><LottoReadonly value={validationMorningTotal} /></td>
                  <td><LottoReadonly value={validationPm.total} /></td>
                  <td><LottoReadonly value={validationTotal} /></td>
                </tr>

                <tr>
                  <th>Payouts</th>
                  <td colSpan={2}></td>
                  <td><LottoReadonly value={entry.payouts} /></td>
                </tr>

                <tr>
                  <th>Over / Short</th>
                  <td colSpan={2}></td>
                  <td className={overShortClass(validationOS)}>
                    {formatDisplayNumber(validationOS)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default LottoPage;