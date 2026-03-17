import { useEffect, useMemo, useRef, useState } from "react";
import { makeEmptyDailyEntry } from "../../../domain/daily/daily.model";
import { useDailyStore } from "../../../store/daily/daily.store";
import { CASHIER_LIST } from "../constants/cashierList";
import {
  computeCashEveningBalance,
  computeCashEveningDrop1Total,
  computeCashEveningDrop2Total,
  computeCashEveningOverShort,
  computeCashEveningSafeDropBills,
  computeCashEveningSafeDropCoins,
  computeCashEveningUsdDropTotal,
  computeCashMorningBalance,
  computeCashMorningDrop1Total,
  computeCashMorningDrop2Total,
  computeCashMorningOverShort,
  computeCashMorningSafeDropBills,
  computeCashMorningSafeDropCoins,
  computeCashMorningUsdDropTotal,
  computeCashStatus,
  computeCashTotalForDay,
} from "../selectors/cash.selectors";
import { getPrevDateInput } from "../../../utils/date";

type Status = "missing" | "check" | "ok";
type SyncStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  date: string;
  onStatusChange?: (status: Status) => void;
}

type FieldKey =
  | "morningOther"
  | "morningEndingTray"
  | "morningCanadianCash"
  | "morningDrop1_5"
  | "morningDrop1_10"
  | "morningDrop1_20"
  | "morningDrop1_50"
  | "morningDrop1_100"
  | "morningDrop2_5"
  | "morningDrop2_10"
  | "morningDrop2_20"
  | "morningDrop2_50"
  | "morningDrop2_100"
  | "morningCoins1"
  | "morningCoins2"
  | "morningCoins3"
  | "morningUsDrop"
  | "eveningOther"
  | "eveningEndingTray"
  | "eveningCanadianCash"
  | "eveningDrop1_5"
  | "eveningDrop1_10"
  | "eveningDrop1_20"
  | "eveningDrop1_50"
  | "eveningDrop1_100"
  | "eveningDrop2_5"
  | "eveningDrop2_10"
  | "eveningDrop2_20"
  | "eveningDrop2_50"
  | "eveningDrop2_100"
  | "eveningCoins1"
  | "eveningCoins2"
  | "eveningCoins3"
  | "eveningUsDrop"
  | "comment1"
  | "comment2"
  | "comment3";

const inputOrder: FieldKey[] = [
  "morningOther",
  "morningEndingTray",
  "morningCanadianCash",
  "morningDrop1_5",
  "morningDrop1_10",
  "morningDrop1_20",
  "morningDrop1_50",
  "morningDrop1_100",
  "morningDrop2_5",
  "morningDrop2_10",
  "morningDrop2_20",
  "morningDrop2_50",
  "morningDrop2_100",
  "morningCoins1",
  "morningCoins2",
  "morningCoins3",
  "morningUsDrop",
  "eveningOther",
  "eveningEndingTray",
  "eveningCanadianCash",
  "eveningDrop1_5",
  "eveningDrop1_10",
  "eveningDrop1_20",
  "eveningDrop1_50",
  "eveningDrop1_100",
  "eveningDrop2_5",
  "eveningDrop2_10",
  "eveningDrop2_20",
  "eveningDrop2_50",
  "eveningDrop2_100",
  "eveningCoins1",
  "eveningCoins2",
  "eveningCoins3",
  "eveningUsDrop",
  "comment1",
  "comment2",
  "comment3",
];

const BILL_DENOMS = [5, 10, 20, 50, 100] as const;

type BillDenom = (typeof BILL_DENOMS)[number];

type FocusableElement = HTMLInputElement | HTMLTextAreaElement;

type InputBinding = {
  inputRef: (node: HTMLInputElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

type ShiftInputBindings = {
  other: InputBinding;
  endingTray: InputBinding;
  canadianCash: InputBinding;
  drop1: Record<BillDenom, InputBinding>;
  drop2: Record<BillDenom, InputBinding>;
  coin1: InputBinding;
  coin2: InputBinding;
  coin3: InputBinding;
  usDrop: InputBinding;
};

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

const formatIntegerInput = (value: string) => {
  if (value.trim() === "") return "";
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return value;
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

const toIntegerOrNull = (value: string): number | null => {
  const v = value.trim();
  if (v === "") return null;
  const parsed = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
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

const overShortClass = (value: number) => {
  if (value === 0) return "text-success fw-semibold";
  if (value < 0) return "text-danger fw-semibold";
  return "text-primary fw-semibold";
};

const cardShellStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
};

const morningSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#c6adad",
};

const eveningSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#99b1de",
};

const totalSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#74967b",
};

const commentsSectionStyle: React.CSSProperties = {
  ...cardShellStyle,
  background: "#f28888",
};

type NumberInputProps = {
  label?: string;
  value: string;
  onRawChange: (raw: string) => void;
  placeholder?: string;
  decimal?: boolean;
  disabled?: boolean;
  inputRef?: (node: HTMLInputElement | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const NumberInput = ({
  label,
  value,
  onRawChange,
  placeholder,
  decimal = true,
  disabled = false,
  inputRef,
  onKeyDown,
}: NumberInputProps) => {
  return (
    <div>
      {label ? <label className="form-label fw-semibold mb-2">{label}</label> : null}
      <input
        ref={inputRef}
        className="form-control"
        value={decimal ? formatDecimalInput(value) : formatIntegerInput(value)}
        onChange={(e) => onRawChange(normalizeRawInput(e.target.value))}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode="decimal"
        disabled={disabled}
        style={{ height: 44, borderRadius: 10 }}
      />
    </div>
  );
};

type ShiftSectionProps = {
  title: string;
  sectionStyle: React.CSSProperties;
  cashierValue: string;
  onCashierChange: (value: string | null) => void;
  beginTrayDisplay: number | null;
  otherInput: string;
  onOtherChange: (raw: string) => void;
  endingTrayInput: string;
  onEndingTrayChange: (raw: string) => void;
  canadianCashInput: string;
  onCanadianCashChange: (raw: string) => void;

  drop1Values: Record<BillDenom, string>;
  onDrop1Change: (denom: BillDenom, raw: string) => void;
  drop1Total: number;

  drop2Values: Record<BillDenom, string>;
  onDrop2Change: (denom: BillDenom, raw: string) => void;
  drop2Total: number;

  coinValues: {
    coin1: string;
    coin2: string;
    coin3: string;
  };
  onCoin1Change: (raw: string) => void;
  onCoin2Change: (raw: string) => void;
  onCoin3Change: (raw: string) => void;

  usDropInput: string;
  onUsDropChange: (raw: string) => void;
  usDropTotal: number;

  safeDropBills: number;
  safeDropCoins: number;
  balance: number;
  overShort: number;
  inputBindings: ShiftInputBindings;
};

const ShiftSection = ({
  title,
  sectionStyle,
  cashierValue,
  onCashierChange,
  beginTrayDisplay,
  otherInput,
  onOtherChange,
  endingTrayInput,
  onEndingTrayChange,
  canadianCashInput,
  onCanadianCashChange,
  drop1Values,
  onDrop1Change,
  drop1Total,
  drop2Values,
  onDrop2Change,
  drop2Total,
  coinValues,
  onCoin1Change,
  onCoin2Change,
  onCoin3Change,
  usDropInput,
  onUsDropChange,
  usDropTotal,
  safeDropBills,
  safeDropCoins,
  balance,
  overShort,
  inputBindings,
}: ShiftSectionProps) => {
  return (
    <div className="p-3 p-lg-4" style={sectionStyle}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div style={sectionTitleStyle}>{title}</div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold mb-2">Cashier Name</label>
              <select
                className="form-select"
                value={cashierValue ?? ""}
                onChange={(e) => onCashierChange(e.target.value || null)}
                style={{ height: 44, borderRadius: 10 }}
              >
                <option value="">Select cashier</option>
                {CASHIER_LIST.map((cashier) => (
                  <option key={cashier.id} value={cashier.id}>
                    {cashier.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold mb-2">Begin Tray</label>
              <div
                className="form-control d-flex align-items-center bg-white"
                style={{ height: 44, borderRadius: 10 }}
              >
                {formatDisplayNumber(beginTrayDisplay)}
              </div>
            </div>

            <div className="col-12">
              <NumberInput
                label="Other"
                value={otherInput}
                onRawChange={onOtherChange}
                placeholder="Optional"
                decimal
                inputRef={inputBindings.other.inputRef}
                onKeyDown={inputBindings.other.onKeyDown}
              />
            </div>

            <div className="col-12">
              <NumberInput
                label="Ending Tray *"
                value={endingTrayInput}
                onRawChange={onEndingTrayChange}
                placeholder="Required"
                decimal
                inputRef={inputBindings.endingTray.inputRef}
                onKeyDown={inputBindings.endingTray.onKeyDown}
              />
            </div>

            <div className="col-12">
              <NumberInput
                label="Canadian Cash *"
                value={canadianCashInput}
                onRawChange={onCanadianCashChange}
                placeholder="Required"
                decimal
                inputRef={inputBindings.canadianCash.inputRef}
                onKeyDown={inputBindings.canadianCash.onKeyDown}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="mb-4">
            <div className="fw-semibold mb-2">Drop 1</div>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0 bg-white">
                <thead className="table-light">
                  <tr>
                    {BILL_DENOMS.map((denom) => (
                      <th key={`drop1-head-${denom}`}>${denom}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {BILL_DENOMS.map((denom) => (
                      <td key={`drop1-${denom}`}>
                        <input
                          ref={inputBindings.drop1[denom].inputRef}
                          className="form-control"
                          value={formatIntegerInput(drop1Values[denom])}
                          onChange={(e) =>
                            onDrop1Change(denom, normalizeRawInput(e.target.value))
                          }
                          onKeyDown={inputBindings.drop1[denom].onKeyDown}
                          inputMode="numeric"
                          style={{ minWidth: 80 }}
                        />
                      </td>
                    ))}
                    <td className="fw-semibold">{formatDisplayNumber(drop1Total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <div className="fw-semibold mb-2">Drop 2</div>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0 bg-white">
                <thead className="table-light">
                  <tr>
                    {BILL_DENOMS.map((denom) => (
                      <th key={`drop2-head-${denom}`}>${denom}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {BILL_DENOMS.map((denom) => (
                      <td key={`drop2-${denom}`}>
                        <input
                          ref={inputBindings.drop2[denom].inputRef}
                          className="form-control"
                          value={formatIntegerInput(drop2Values[denom])}
                          onChange={(e) =>
                            onDrop2Change(denom, normalizeRawInput(e.target.value))
                          }
                          onKeyDown={inputBindings.drop2[denom].onKeyDown}
                          inputMode="numeric"
                          style={{ minWidth: 80 }}
                        />
                      </td>
                    ))}
                    <td className="fw-semibold">{formatDisplayNumber(drop2Total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <NumberInput
                label="Coins Drop 1"
                value={coinValues.coin1}
                onRawChange={onCoin1Change}
                placeholder="Optional"
                decimal={false}
                inputRef={inputBindings.coin1.inputRef}
                onKeyDown={inputBindings.coin1.onKeyDown}
              />
            </div>
            <div className="col-12 col-md-4">
              <NumberInput
                label="Coins Drop 2"
                value={coinValues.coin2}
                onRawChange={onCoin2Change}
                placeholder="Optional"
                decimal={false}
                inputRef={inputBindings.coin2.inputRef}
                onKeyDown={inputBindings.coin2.onKeyDown}
              />
            </div>
            <div className="col-12 col-md-4">
              <NumberInput
                label="Coins Drop 3"
                value={coinValues.coin3}
                onRawChange={onCoin3Change}
                placeholder="Optional"
                decimal={false}
                inputRef={inputBindings.coin3.inputRef}
                onKeyDown={inputBindings.coin3.onKeyDown}
              />
            </div>

            <div className="col-12 col-md-4">
              <NumberInput
                label="US Drop"
                value={usDropInput}
                onRawChange={onUsDropChange}
                placeholder="Optional"
                decimal
                inputRef={inputBindings.usDrop.inputRef}
                onKeyDown={inputBindings.usDrop.onKeyDown}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold mb-2">US Drop Total</label>
              <div
                className="form-control d-flex align-items-center bg-white"
                style={{ height: 44, borderRadius: 10 }}
              >
                {formatDisplayNumber(usDropTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-2">
        <div className="col-12 col-md-3">
          <div className="p-3 bg-white rounded-3 h-100">
            <div className="text-muted small mb-1">Safe Drop Bills</div>
            <div className="fw-bold">{formatDisplayNumber(safeDropBills)}</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white rounded-3 h-100">
            <div className="text-muted small mb-1">Safe Drop Coins</div>
            <div className="fw-bold">{formatDisplayNumber(safeDropCoins)}</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white rounded-3 h-100">
            <div className="text-muted small mb-1">Balance</div>
            <div className="fw-bold">{formatDisplayNumber(balance)}</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="p-3 bg-white rounded-3 h-100">
            <div className="text-muted small mb-1">Over / Short</div>
            <div className={overShortClass(overShort)}>
              {formatDisplayNumber(overShort)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CashDropsPage = ({ date, onStatusChange }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const getSyncStatus = useDailyStore((s) => s.getSyncStatus);

  const setCashMorningCashierName = useDailyStore((s) => s.setCashMorningCashierName);
  const setCashMorningBeginTray = useDailyStore((s) => s.setCashMorningBeginTray);
  const setCashMorningOther = useDailyStore((s) => s.setCashMorningOther);
  const setCashMorningEndingTray = useDailyStore((s) => s.setCashMorningEndingTray);
  const setCashMorningCanadianCash = useDailyStore((s) => s.setCashMorningCanadianCash);
  const setCashMorningDrop1_5 = useDailyStore((s) => s.setCashMorningDrop1_5);
  const setCashMorningDrop1_10 = useDailyStore((s) => s.setCashMorningDrop1_10);
  const setCashMorningDrop1_20 = useDailyStore((s) => s.setCashMorningDrop1_20);
  const setCashMorningDrop1_50 = useDailyStore((s) => s.setCashMorningDrop1_50);
  const setCashMorningDrop1_100 = useDailyStore((s) => s.setCashMorningDrop1_100);
  const setCashMorningDrop2_5 = useDailyStore((s) => s.setCashMorningDrop2_5);
  const setCashMorningDrop2_10 = useDailyStore((s) => s.setCashMorningDrop2_10);
  const setCashMorningDrop2_20 = useDailyStore((s) => s.setCashMorningDrop2_20);
  const setCashMorningDrop2_50 = useDailyStore((s) => s.setCashMorningDrop2_50);
  const setCashMorningDrop2_100 = useDailyStore((s) => s.setCashMorningDrop2_100);
  const setCashMorningCoinsDrop1 = useDailyStore((s) => s.setCashMorningCoinsDrop1);
  const setCashMorningCoinsDrop2 = useDailyStore((s) => s.setCashMorningCoinsDrop2);
  const setCashMorningCoinsDrop3 = useDailyStore((s) => s.setCashMorningCoinsDrop3);
  const setCashMorningUsDrop = useDailyStore((s) => s.setCashMorningUsDrop);

  const setCashEveningCashierName = useDailyStore((s) => s.setCashEveningCashierName);
  const setCashEveningBeginTray = useDailyStore((s) => s.setCashEveningBeginTray);
  const setCashEveningOther = useDailyStore((s) => s.setCashEveningOther);
  const setCashEveningEndingTray = useDailyStore((s) => s.setCashEveningEndingTray);
  const setCashEveningCanadianCash = useDailyStore((s) => s.setCashEveningCanadianCash);
  const setCashEveningDrop1_5 = useDailyStore((s) => s.setCashEveningDrop1_5);
  const setCashEveningDrop1_10 = useDailyStore((s) => s.setCashEveningDrop1_10);
  const setCashEveningDrop1_20 = useDailyStore((s) => s.setCashEveningDrop1_20);
  const setCashEveningDrop1_50 = useDailyStore((s) => s.setCashEveningDrop1_50);
  const setCashEveningDrop1_100 = useDailyStore((s) => s.setCashEveningDrop1_100);
  const setCashEveningDrop2_5 = useDailyStore((s) => s.setCashEveningDrop2_5);
  const setCashEveningDrop2_10 = useDailyStore((s) => s.setCashEveningDrop2_10);
  const setCashEveningDrop2_20 = useDailyStore((s) => s.setCashEveningDrop2_20);
  const setCashEveningDrop2_50 = useDailyStore((s) => s.setCashEveningDrop2_50);
  const setCashEveningDrop2_100 = useDailyStore((s) => s.setCashEveningDrop2_100);
  const setCashEveningCoinsDrop1 = useDailyStore((s) => s.setCashEveningCoinsDrop1);
  const setCashEveningCoinsDrop2 = useDailyStore((s) => s.setCashEveningCoinsDrop2);
  const setCashEveningCoinsDrop3 = useDailyStore((s) => s.setCashEveningCoinsDrop3);
  const setCashEveningUsDrop = useDailyStore((s) => s.setCashEveningUsDrop);

  const setCashComment1 = useDailyStore((s) => s.setCashComment1);
  const setCashComment2 = useDailyStore((s) => s.setCashComment2);
  const setCashComment3 = useDailyStore((s) => s.setCashComment3);

  const entry = useMemo(() => byDate[date] ?? makeEmptyDailyEntry(), [byDate, date]);
  const prevDate = useMemo(() => getPrevDateInput(date), [date]);
  const prevEntry = useMemo(() => byDate[prevDate] ?? makeEmptyDailyEntry(), [byDate, prevDate]);

  const sync = getSyncStatus(date);
  const status = useMemo(() => computeCashStatus(entry), [entry]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const nextMorningBegin = prevEntry.cashMorningEndingTray ?? null;
    if (entry.cashMorningBeginTray !== nextMorningBegin) {
      setCashMorningBeginTray(date, nextMorningBegin);
    }
  }, [date, entry.cashMorningBeginTray, prevEntry.cashMorningEndingTray, setCashMorningBeginTray]);

  useEffect(() => {
    const nextEveningBegin = prevEntry.cashEveningEndingTray ?? null;
    if (entry.cashEveningBeginTray !== nextEveningBegin) {
      setCashEveningBeginTray(date, nextEveningBegin);
    }
  }, [date, entry.cashEveningBeginTray, prevEntry.cashEveningEndingTray, setCashEveningBeginTray]);

  const morningDrop1Total = useMemo(() => computeCashMorningDrop1Total(entry), [entry]);
  const morningDrop2Total = useMemo(() => computeCashMorningDrop2Total(entry), [entry]);
  const morningUsdDropTotal = useMemo(() => computeCashMorningUsdDropTotal(entry), [entry]);
  const morningSafeDropBills = useMemo(() => computeCashMorningSafeDropBills(entry), [entry]);
  const morningSafeDropCoins = useMemo(() => computeCashMorningSafeDropCoins(entry), [entry]);
  const morningBalance = useMemo(() => computeCashMorningBalance(entry), [entry]);
  const morningOverShort = useMemo(() => computeCashMorningOverShort(entry), [entry]);

  const eveningDrop1Total = useMemo(() => computeCashEveningDrop1Total(entry), [entry]);
  const eveningDrop2Total = useMemo(() => computeCashEveningDrop2Total(entry), [entry]);
  const eveningUsdDropTotal = useMemo(() => computeCashEveningUsdDropTotal(entry), [entry]);
  const eveningSafeDropBills = useMemo(() => computeCashEveningSafeDropBills(entry), [entry]);
  const eveningSafeDropCoins = useMemo(() => computeCashEveningSafeDropCoins(entry), [entry]);
  const eveningBalance = useMemo(() => computeCashEveningBalance(entry), [entry]);
  const eveningOverShort = useMemo(() => computeCashEveningOverShort(entry), [entry]);

  const totalForDay = useMemo(() => computeCashTotalForDay(entry), [entry]);

  const [cashMorningOtherInput, setCashMorningOtherInput] = useState("");
  const [cashMorningEndingTrayInput, setCashMorningEndingTrayInput] = useState("");
  const [cashMorningCanadianCashInput, setCashMorningCanadianCashInput] = useState("");
  const [cashMorningDrop1_5Input, setCashMorningDrop1_5Input] = useState("");
  const [cashMorningDrop1_10Input, setCashMorningDrop1_10Input] = useState("");
  const [cashMorningDrop1_20Input, setCashMorningDrop1_20Input] = useState("");
  const [cashMorningDrop1_50Input, setCashMorningDrop1_50Input] = useState("");
  const [cashMorningDrop1_100Input, setCashMorningDrop1_100Input] = useState("");
  const [cashMorningDrop2_5Input, setCashMorningDrop2_5Input] = useState("");
  const [cashMorningDrop2_10Input, setCashMorningDrop2_10Input] = useState("");
  const [cashMorningDrop2_20Input, setCashMorningDrop2_20Input] = useState("");
  const [cashMorningDrop2_50Input, setCashMorningDrop2_50Input] = useState("");
  const [cashMorningDrop2_100Input, setCashMorningDrop2_100Input] = useState("");
  const [cashMorningCoinsDrop1Input, setCashMorningCoinsDrop1Input] = useState("");
  const [cashMorningCoinsDrop2Input, setCashMorningCoinsDrop2Input] = useState("");
  const [cashMorningCoinsDrop3Input, setCashMorningCoinsDrop3Input] = useState("");
  const [cashMorningUsDropInput, setCashMorningUsDropInput] = useState("");

  const [cashEveningOtherInput, setCashEveningOtherInput] = useState("");
  const [cashEveningEndingTrayInput, setCashEveningEndingTrayInput] = useState("");
  const [cashEveningCanadianCashInput, setCashEveningCanadianCashInput] = useState("");
  const [cashEveningDrop1_5Input, setCashEveningDrop1_5Input] = useState("");
  const [cashEveningDrop1_10Input, setCashEveningDrop1_10Input] = useState("");
  const [cashEveningDrop1_20Input, setCashEveningDrop1_20Input] = useState("");
  const [cashEveningDrop1_50Input, setCashEveningDrop1_50Input] = useState("");
  const [cashEveningDrop1_100Input, setCashEveningDrop1_100Input] = useState("");
  const [cashEveningDrop2_5Input, setCashEveningDrop2_5Input] = useState("");
  const [cashEveningDrop2_10Input, setCashEveningDrop2_10Input] = useState("");
  const [cashEveningDrop2_20Input, setCashEveningDrop2_20Input] = useState("");
  const [cashEveningDrop2_50Input, setCashEveningDrop2_50Input] = useState("");
  const [cashEveningDrop2_100Input, setCashEveningDrop2_100Input] = useState("");
  const [cashEveningCoinsDrop1Input, setCashEveningCoinsDrop1Input] = useState("");
  const [cashEveningCoinsDrop2Input, setCashEveningCoinsDrop2Input] = useState("");
  const [cashEveningCoinsDrop3Input, setCashEveningCoinsDrop3Input] = useState("");
  const [cashEveningUsDropInput, setCashEveningUsDropInput] = useState("");

  const [cashComment1Input, setCashComment1Input] = useState("");
  const [cashComment2Input, setCashComment2Input] = useState("");
  const [cashComment3Input, setCashComment3Input] = useState("");

  useEffect(() => {
    setCashMorningOtherInput(entry.cashMorningOther?.toString() ?? "");
    setCashMorningEndingTrayInput(entry.cashMorningEndingTray?.toString() ?? "");
    setCashMorningCanadianCashInput(entry.cashMorningCanadianCash?.toString() ?? "");
    setCashMorningDrop1_5Input(entry.cashMorningDrop1_5?.toString() ?? "");
    setCashMorningDrop1_10Input(entry.cashMorningDrop1_10?.toString() ?? "");
    setCashMorningDrop1_20Input(entry.cashMorningDrop1_20?.toString() ?? "");
    setCashMorningDrop1_50Input(entry.cashMorningDrop1_50?.toString() ?? "");
    setCashMorningDrop1_100Input(entry.cashMorningDrop1_100?.toString() ?? "");
    setCashMorningDrop2_5Input(entry.cashMorningDrop2_5?.toString() ?? "");
    setCashMorningDrop2_10Input(entry.cashMorningDrop2_10?.toString() ?? "");
    setCashMorningDrop2_20Input(entry.cashMorningDrop2_20?.toString() ?? "");
    setCashMorningDrop2_50Input(entry.cashMorningDrop2_50?.toString() ?? "");
    setCashMorningDrop2_100Input(entry.cashMorningDrop2_100?.toString() ?? "");
    setCashMorningCoinsDrop1Input(entry.cashMorningCoinsDrop1?.toString() ?? "");
    setCashMorningCoinsDrop2Input(entry.cashMorningCoinsDrop2?.toString() ?? "");
    setCashMorningCoinsDrop3Input(entry.cashMorningCoinsDrop3?.toString() ?? "");
    setCashMorningUsDropInput(entry.cashMorningUsDrop?.toString() ?? "");

    setCashEveningOtherInput(entry.cashEveningOther?.toString() ?? "");
    setCashEveningEndingTrayInput(entry.cashEveningEndingTray?.toString() ?? "");
    setCashEveningCanadianCashInput(entry.cashEveningCanadianCash?.toString() ?? "");
    setCashEveningDrop1_5Input(entry.cashEveningDrop1_5?.toString() ?? "");
    setCashEveningDrop1_10Input(entry.cashEveningDrop1_10?.toString() ?? "");
    setCashEveningDrop1_20Input(entry.cashEveningDrop1_20?.toString() ?? "");
    setCashEveningDrop1_50Input(entry.cashEveningDrop1_50?.toString() ?? "");
    setCashEveningDrop1_100Input(entry.cashEveningDrop1_100?.toString() ?? "");
    setCashEveningDrop2_5Input(entry.cashEveningDrop2_5?.toString() ?? "");
    setCashEveningDrop2_10Input(entry.cashEveningDrop2_10?.toString() ?? "");
    setCashEveningDrop2_20Input(entry.cashEveningDrop2_20?.toString() ?? "");
    setCashEveningDrop2_50Input(entry.cashEveningDrop2_50?.toString() ?? "");
    setCashEveningDrop2_100Input(entry.cashEveningDrop2_100?.toString() ?? "");
    setCashEveningCoinsDrop1Input(entry.cashEveningCoinsDrop1?.toString() ?? "");
    setCashEveningCoinsDrop2Input(entry.cashEveningCoinsDrop2?.toString() ?? "");
    setCashEveningCoinsDrop3Input(entry.cashEveningCoinsDrop3?.toString() ?? "");
    setCashEveningUsDropInput(entry.cashEveningUsDrop?.toString() ?? "");

    setCashComment1Input(entry.cashComment1 ?? "");
    setCashComment2Input(entry.cashComment2 ?? "");
    setCashComment3Input(entry.cashComment3 ?? "");
  }, [date]);

  const inputRefs = useRef<Record<FieldKey, FocusableElement | null>>({
    morningOther: null,
    morningEndingTray: null,
    morningCanadianCash: null,
    morningDrop1_5: null,
    morningDrop1_10: null,
    morningDrop1_20: null,
    morningDrop1_50: null,
    morningDrop1_100: null,
    morningDrop2_5: null,
    morningDrop2_10: null,
    morningDrop2_20: null,
    morningDrop2_50: null,
    morningDrop2_100: null,
    morningCoins1: null,
    morningCoins2: null,
    morningCoins3: null,
    morningUsDrop: null,
    eveningOther: null,
    eveningEndingTray: null,
    eveningCanadianCash: null,
    eveningDrop1_5: null,
    eveningDrop1_10: null,
    eveningDrop1_20: null,
    eveningDrop1_50: null,
    eveningDrop1_100: null,
    eveningDrop2_5: null,
    eveningDrop2_10: null,
    eveningDrop2_20: null,
    eveningDrop2_50: null,
    eveningDrop2_100: null,
    eveningCoins1: null,
    eveningCoins2: null,
    eveningCoins3: null,
    eveningUsDrop: null,
    comment1: null,
    comment2: null,
    comment3: null,
  });

  const focusNext = (key: FieldKey) => {
    const currentIndex = inputOrder.indexOf(key);
    if (currentIndex === -1) return;

    const nextKey = inputOrder[currentIndex + 1];
    if (!nextKey) return;

    const nextRef = inputRefs.current[nextKey];
    if (nextRef) {
      nextRef.focus();
      if ("select" in nextRef && typeof nextRef.select === "function") {
        nextRef.select();
      }
    }
  };

  const handleEnter =
    (key: FieldKey) =>
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNext(key);
      }
    };

  const bindInput = (key: FieldKey): InputBinding => ({
    inputRef: (node) => {
      inputRefs.current[key] = node;
    },
    onKeyDown: handleEnter(key) as (e: React.KeyboardEvent<HTMLInputElement>) => void,
  });

  const morningBindings: ShiftInputBindings = {
    other: bindInput("morningOther"),
    endingTray: bindInput("morningEndingTray"),
    canadianCash: bindInput("morningCanadianCash"),
    drop1: {
      5: bindInput("morningDrop1_5"),
      10: bindInput("morningDrop1_10"),
      20: bindInput("morningDrop1_20"),
      50: bindInput("morningDrop1_50"),
      100: bindInput("morningDrop1_100"),
    },
    drop2: {
      5: bindInput("morningDrop2_5"),
      10: bindInput("morningDrop2_10"),
      20: bindInput("morningDrop2_20"),
      50: bindInput("morningDrop2_50"),
      100: bindInput("morningDrop2_100"),
    },
    coin1: bindInput("morningCoins1"),
    coin2: bindInput("morningCoins2"),
    coin3: bindInput("morningCoins3"),
    usDrop: bindInput("morningUsDrop"),
  };

  const eveningBindings: ShiftInputBindings = {
    other: bindInput("eveningOther"),
    endingTray: bindInput("eveningEndingTray"),
    canadianCash: bindInput("eveningCanadianCash"),
    drop1: {
      5: bindInput("eveningDrop1_5"),
      10: bindInput("eveningDrop1_10"),
      20: bindInput("eveningDrop1_20"),
      50: bindInput("eveningDrop1_50"),
      100: bindInput("eveningDrop1_100"),
    },
    drop2: {
      5: bindInput("eveningDrop2_5"),
      10: bindInput("eveningDrop2_10"),
      20: bindInput("eveningDrop2_20"),
      50: bindInput("eveningDrop2_50"),
      100: bindInput("eveningDrop2_100"),
    },
    coin1: bindInput("eveningCoins1"),
    coin2: bindInput("eveningCoins2"),
    coin3: bindInput("eveningCoins3"),
    usDrop: bindInput("eveningUsDrop"),
  };

  return (
    <div className="card border-0" style={cardShellStyle}>
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start align-items-md-center flex-column flex-md-row gap-2 pt-4 px-4">
        <div>
          <h5 className="mb-1">Cash & Drops</h5>
          <div className="text-muted small">
            Morning and evening cashier cash handling, drops and totals
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
        <div className="mb-4">
          <ShiftSection
            title="Morning Shift"
            sectionStyle={morningSectionStyle}
            cashierValue={entry.cashMorningCashierName ?? ""}
            onCashierChange={(value) => setCashMorningCashierName(date, value)}
            beginTrayDisplay={entry.cashMorningBeginTray}
            otherInput={cashMorningOtherInput}
            onOtherChange={(raw) => {
              setCashMorningOtherInput(raw);
              setCashMorningOther(date, toNumberOrNull(raw));
            }}
            endingTrayInput={cashMorningEndingTrayInput}
            onEndingTrayChange={(raw) => {
              setCashMorningEndingTrayInput(raw);
              setCashMorningEndingTray(date, toNumberOrNull(raw));
            }}
            canadianCashInput={cashMorningCanadianCashInput}
            onCanadianCashChange={(raw) => {
              setCashMorningCanadianCashInput(raw);
              setCashMorningCanadianCash(date, toNumberOrNull(raw));
            }}
            drop1Values={{
              5: cashMorningDrop1_5Input,
              10: cashMorningDrop1_10Input,
              20: cashMorningDrop1_20Input,
              50: cashMorningDrop1_50Input,
              100: cashMorningDrop1_100Input,
            }}
            onDrop1Change={(denom, raw) => {
              if (denom === 5) {
                setCashMorningDrop1_5Input(raw);
                setCashMorningDrop1_5(date, toIntegerOrNull(raw));
              }
              if (denom === 10) {
                setCashMorningDrop1_10Input(raw);
                setCashMorningDrop1_10(date, toIntegerOrNull(raw));
              }
              if (denom === 20) {
                setCashMorningDrop1_20Input(raw);
                setCashMorningDrop1_20(date, toIntegerOrNull(raw));
              }
              if (denom === 50) {
                setCashMorningDrop1_50Input(raw);
                setCashMorningDrop1_50(date, toIntegerOrNull(raw));
              }
              if (denom === 100) {
                setCashMorningDrop1_100Input(raw);
                setCashMorningDrop1_100(date, toIntegerOrNull(raw));
              }
            }}
            drop1Total={morningDrop1Total}
            drop2Values={{
              5: cashMorningDrop2_5Input,
              10: cashMorningDrop2_10Input,
              20: cashMorningDrop2_20Input,
              50: cashMorningDrop2_50Input,
              100: cashMorningDrop2_100Input,
            }}
            onDrop2Change={(denom, raw) => {
              if (denom === 5) {
                setCashMorningDrop2_5Input(raw);
                setCashMorningDrop2_5(date, toIntegerOrNull(raw));
              }
              if (denom === 10) {
                setCashMorningDrop2_10Input(raw);
                setCashMorningDrop2_10(date, toIntegerOrNull(raw));
              }
              if (denom === 20) {
                setCashMorningDrop2_20Input(raw);
                setCashMorningDrop2_20(date, toIntegerOrNull(raw));
              }
              if (denom === 50) {
                setCashMorningDrop2_50Input(raw);
                setCashMorningDrop2_50(date, toIntegerOrNull(raw));
              }
              if (denom === 100) {
                setCashMorningDrop2_100Input(raw);
                setCashMorningDrop2_100(date, toIntegerOrNull(raw));
              }
            }}
            drop2Total={morningDrop2Total}
            coinValues={{
              coin1: cashMorningCoinsDrop1Input,
              coin2: cashMorningCoinsDrop2Input,
              coin3: cashMorningCoinsDrop3Input,
            }}
            onCoin1Change={(raw) => {
              setCashMorningCoinsDrop1Input(raw);
              setCashMorningCoinsDrop1(date, toIntegerOrNull(raw));
            }}
            onCoin2Change={(raw) => {
              setCashMorningCoinsDrop2Input(raw);
              setCashMorningCoinsDrop2(date, toIntegerOrNull(raw));
            }}
            onCoin3Change={(raw) => {
              setCashMorningCoinsDrop3Input(raw);
              setCashMorningCoinsDrop3(date, toIntegerOrNull(raw));
            }}
            usDropInput={cashMorningUsDropInput}
            onUsDropChange={(raw) => {
              setCashMorningUsDropInput(raw);
              setCashMorningUsDrop(date, toNumberOrNull(raw));
            }}
            usDropTotal={morningUsdDropTotal}
            safeDropBills={morningSafeDropBills}
            safeDropCoins={morningSafeDropCoins}
            balance={morningBalance}
            overShort={morningOverShort}
            inputBindings={morningBindings}
          />
        </div>

        <div className="mb-4">
          <ShiftSection
            title="Evening Shift"
            sectionStyle={eveningSectionStyle}
            cashierValue={entry.cashEveningCashierName ?? ""}
            onCashierChange={(value) => setCashEveningCashierName(date, value)}
            beginTrayDisplay={entry.cashEveningBeginTray}
            otherInput={cashEveningOtherInput}
            onOtherChange={(raw) => {
              setCashEveningOtherInput(raw);
              setCashEveningOther(date, toNumberOrNull(raw));
            }}
            endingTrayInput={cashEveningEndingTrayInput}
            onEndingTrayChange={(raw) => {
              setCashEveningEndingTrayInput(raw);
              setCashEveningEndingTray(date, toNumberOrNull(raw));
            }}
            canadianCashInput={cashEveningCanadianCashInput}
            onCanadianCashChange={(raw) => {
              setCashEveningCanadianCashInput(raw);
              setCashEveningCanadianCash(date, toNumberOrNull(raw));
            }}
            drop1Values={{
              5: cashEveningDrop1_5Input,
              10: cashEveningDrop1_10Input,
              20: cashEveningDrop1_20Input,
              50: cashEveningDrop1_50Input,
              100: cashEveningDrop1_100Input,
            }}
            onDrop1Change={(denom, raw) => {
              if (denom === 5) {
                setCashEveningDrop1_5Input(raw);
                setCashEveningDrop1_5(date, toIntegerOrNull(raw));
              }
              if (denom === 10) {
                setCashEveningDrop1_10Input(raw);
                setCashEveningDrop1_10(date, toIntegerOrNull(raw));
              }
              if (denom === 20) {
                setCashEveningDrop1_20Input(raw);
                setCashEveningDrop1_20(date, toIntegerOrNull(raw));
              }
              if (denom === 50) {
                setCashEveningDrop1_50Input(raw);
                setCashEveningDrop1_50(date, toIntegerOrNull(raw));
              }
              if (denom === 100) {
                setCashEveningDrop1_100Input(raw);
                setCashEveningDrop1_100(date, toIntegerOrNull(raw));
              }
            }}
            drop1Total={eveningDrop1Total}
            drop2Values={{
              5: cashEveningDrop2_5Input,
              10: cashEveningDrop2_10Input,
              20: cashEveningDrop2_20Input,
              50: cashEveningDrop2_50Input,
              100: cashEveningDrop2_100Input,
            }}
            onDrop2Change={(denom, raw) => {
              if (denom === 5) {
                setCashEveningDrop2_5Input(raw);
                setCashEveningDrop2_5(date, toIntegerOrNull(raw));
              }
              if (denom === 10) {
                setCashEveningDrop2_10Input(raw);
                setCashEveningDrop2_10(date, toIntegerOrNull(raw));
              }
              if (denom === 20) {
                setCashEveningDrop2_20Input(raw);
                setCashEveningDrop2_20(date, toIntegerOrNull(raw));
              }
              if (denom === 50) {
                setCashEveningDrop2_50Input(raw);
                setCashEveningDrop2_50(date, toIntegerOrNull(raw));
              }
              if (denom === 100) {
                setCashEveningDrop2_100Input(raw);
                setCashEveningDrop2_100(date, toIntegerOrNull(raw));
              }
            }}
            drop2Total={eveningDrop2Total}
            coinValues={{
              coin1: cashEveningCoinsDrop1Input,
              coin2: cashEveningCoinsDrop2Input,
              coin3: cashEveningCoinsDrop3Input,
            }}
            onCoin1Change={(raw) => {
              setCashEveningCoinsDrop1Input(raw);
              setCashEveningCoinsDrop1(date, toIntegerOrNull(raw));
            }}
            onCoin2Change={(raw) => {
              setCashEveningCoinsDrop2Input(raw);
              setCashEveningCoinsDrop2(date, toIntegerOrNull(raw));
            }}
            onCoin3Change={(raw) => {
              setCashEveningCoinsDrop3Input(raw);
              setCashEveningCoinsDrop3(date, toIntegerOrNull(raw));
            }}
            usDropInput={cashEveningUsDropInput}
            onUsDropChange={(raw) => {
              setCashEveningUsDropInput(raw);
              setCashEveningUsDrop(date, toNumberOrNull(raw));
            }}
            usDropTotal={eveningUsdDropTotal}
            safeDropBills={eveningSafeDropBills}
            safeDropCoins={eveningSafeDropCoins}
            balance={eveningBalance}
            overShort={eveningOverShort}
            inputBindings={eveningBindings}
          />
        </div>

        <div className="p-3 p-lg-4 mb-4" style={totalSectionStyle}>
          <div className="mb-3" style={sectionTitleStyle}>
            Total for Day
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Begin Tray</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.beginTray)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Safe Drop Bills</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.safeDropBills)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Safe Drop Coins</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.safeDropCoins)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Other</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.other)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Ending Tray</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.endingTray)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Balance</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.balance)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Canadian Cash</div>
                <div className="fw-bold">{formatDisplayNumber(totalForDay.canadianCash)}</div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="p-3 bg-white rounded-3 h-100">
                <div className="text-muted small mb-1">Over / Short</div>
                <div className={overShortClass(totalForDay.overShort)}>
                  {formatDisplayNumber(totalForDay.overShort)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 p-lg-4" style={commentsSectionStyle}>
          <div className="mb-3" style={sectionTitleStyle}>
            Comments
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold mb-2">Comment 1</label>
              <textarea
                ref={(node) => {
                  inputRefs.current.comment1 = node;
                }}
                className="form-control"
                rows={3}
                value={cashComment1Input}
                onChange={(e) => {
                  const value = e.target.value;
                  setCashComment1Input(value);
                  setCashComment1(date, value || null);
                }}
                onKeyDown={handleEnter("comment1")}
                style={{ borderRadius: 10 }}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold mb-2">Comment 2</label>
              <textarea
                ref={(node) => {
                  inputRefs.current.comment2 = node;
                }}
                className="form-control"
                rows={3}
                value={cashComment2Input}
                onChange={(e) => {
                  const value = e.target.value;
                  setCashComment2Input(value);
                  setCashComment2(date, value || null);
                }}
                onKeyDown={handleEnter("comment2")}
                style={{ borderRadius: 10 }}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold mb-2">Comment 3</label>
              <textarea
                ref={(node) => {
                  inputRefs.current.comment3 = node;
                }}
                className="form-control"
                rows={3}
                value={cashComment3Input}
                onChange={(e) => {
                  const value = e.target.value;
                  setCashComment3Input(value);
                  setCashComment3(date, value || null);
                }}
                onKeyDown={handleEnter("comment3")}
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashDropsPage;