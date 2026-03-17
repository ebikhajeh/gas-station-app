import { useEffect, useMemo, useRef, useState } from "react";
import { useDailyStore } from "../../../store/daily/daily.store";
import {
  computeFuelDifferences,
  computeFuelDipLiters,
  computeFuelEstimatedInventory,
  computeFuelNextOpening,
  computeFuelSalesTotals,
  computeFuelStatus,
} from "../selectors/fuel.selectors";
import { toNumberOrNull } from "../../../utils/number";
import { makeEmptyDailyEntry } from "../../../domain/daily/daily.model";

type Status = "missing" | "check" | "ok";

interface Props {
  date: string;
  onStatusChange?: (status: Status) => void;
}

type FieldKey =
  | "openingReg"
  | "openingSup93"
  | "openingDsl"
  | "deliveryReg"
  | "deliverySup93"
  | "deliveryDsl"
  | "salesRegMorning"
  | "salesEx89Morning"
  | "salesSup91Morning"
  | "salesSup93Morning"
  | "salesDslMorning"
  | "salesRegEvening"
  | "salesEx89Evening"
  | "salesSup91Evening"
  | "salesSup93Evening"
  | "salesDslEvening"
  | "closingDipRegT1"
  | "closingDipRegT2"
  | "closingDipSup"
  | "closingDipDsl";

const formatDisplayNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
  }).format(value);
};

const formatInputNumber = (value: string) => {
  if (value.trim() === "") return "";
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 20,
  }).format(parsed);
};

const normalizeRawInput = (value: string) => value.replace(/,/g, "");

const statusBadgeClass = (status: Status) => {
  if (status === "ok") return "bg-success";
  if (status === "check") return "bg-warning text-dark";
  return "bg-secondary";
};

const diffClass = (value: number) => {
  if (value === 0) return "text-success fw-semibold";
  if (value < 0) return "text-danger fw-semibold";
  return "text-primary fw-semibold";
};

const syncText = (status: "idle" | "saving" | "saved" | "error") => {
  if (status === "saving") return "Saving...";
  if (status === "saved") return "Saved";
  if (status === "error") return "Save failed";
  return "AutoSave";
};

const fuelTheme = {
  regular: {
    label: "REG",
    badgeStyle: {
      backgroundColor: "#ffffff",
      color: "#111827",
      border: "1px solid #d1d5db",
    } as const,
    panelStyle: {
      backgroundColor: "#ffffff",
      border: "1px solid #dee2e6",
    } as const,
  },
  extra89: {
    label: "EX 89",
    badgeStyle: {
      backgroundColor: "#0b5ed7",
      color: "#ffffff",
      border: "1px solid #0b5ed7",
    } as const,
    panelStyle: {
      backgroundColor: "#e8f1ff",
      border: "1px solid #b6d4fe",
    } as const,
  },
  sup91: {
    label: "SUP 91",
    badgeStyle: {
      backgroundColor: "#9ec5fe",
      color: "#052c65",
      border: "1px solid #9ec5fe",
    } as const,
    panelStyle: {
      backgroundColor: "#eef6ff",
      border: "1px solid #cfe2ff",
    } as const,
  },
  sup93: {
    label: "SUP 93",
    badgeStyle: {
      backgroundColor: "#dc3545",
      color: "#ffffff",
      border: "1px solid #dc3545",
    } as const,
    panelStyle: {
      backgroundColor: "#fdebec",
      border: "1px solid #f5c2c7",
    } as const,
  },
  diesel: {
    label: "DSL",
    badgeStyle: {
      backgroundColor: "#fff3cd",
      color: "#664d03",
      border: "1px solid #ffe69c",
    } as const,
    panelStyle: {
      backgroundColor: "#fffdf2",
      border: "1px solid #ffe69c",
    } as const,
  },
};

const cardShellStyle = {
  borderRadius: 16,
  border: "1px solid #97aad1",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
} as const;

const sectionTitleStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
} as const;

const labelPillBase = {
  minWidth: 88,
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 700,
  textAlign: "center",
} as const;

const valueCardBase = {
  borderRadius: 14,
  padding: "14px 16px",
  minHeight: 92,
} as const;

const metricLabelStyle = {
  fontSize: 13,
  color: "#6b7280",
  marginBottom: 8,
  fontWeight: 600,
} as const;

const metricValueStyle = {
  fontSize: 28,
  lineHeight: 1.1,
  fontWeight: 800,
  color: "#111827",
} as const;

const smallMutedStyle = {
  fontSize: 12,
  color: "#6b7280",
} as const;

type FuelInputRowProps = {
  label: string;
  rawValue: string;
  onRawChange: (raw: string) => void;
  themeStyle: React.CSSProperties;
  placeholder?: string;
  inputRef?: (node: HTMLInputElement | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const FuelInputRow = ({
  label,
  rawValue,
  onRawChange,
  themeStyle,
  placeholder = "Enter",
  inputRef,
  onKeyDown,
}: FuelInputRowProps) => {
  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      <div style={{ ...labelPillBase, ...themeStyle }}>{label}</div>

      <input
        ref={inputRef}
        className="form-control"
        value={formatInputNumber(rawValue)}
        onChange={(e) => {
          const raw = normalizeRawInput(e.target.value);
          onRawChange(raw);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode="decimal"
        style={{ height: 46, borderRadius: 10 }}
      />
    </div>
  );
};

type SalesRowProps = {
  label: string;
  themeStyle: React.CSSProperties;
  morningRaw: string;
  eveningRaw: string;
  onMorningChange: (raw: string) => void;
  onEveningChange: (raw: string) => void;
  total: number;
  morningInputRef?: (node: HTMLInputElement | null) => void;
  eveningInputRef?: (node: HTMLInputElement | null) => void;
  onMorningKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onEveningKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const SalesRow = ({
  label,
  themeStyle,
  morningRaw,
  eveningRaw,
  onMorningChange,
  onEveningChange,
  total,
  morningInputRef,
  eveningInputRef,
  onMorningKeyDown,
  onEveningKeyDown,
}: SalesRowProps) => {
  return (
    <div
      className="d-grid align-items-center gap-3 py-3 border-bottom"
      style={{
        gridTemplateColumns: "120px minmax(120px,1fr) minmax(120px,1fr) 120px",
      }}
    >
      <div style={{ ...labelPillBase, ...themeStyle }}>{label}</div>

      <input
        ref={morningInputRef}
        className="form-control"
        value={formatInputNumber(morningRaw)}
        onChange={(e) => onMorningChange(normalizeRawInput(e.target.value))}
        onKeyDown={onMorningKeyDown}
        inputMode="decimal"
        placeholder="Morning"
        style={{ height: 46, borderRadius: 10 }}
      />

      <input
        ref={eveningInputRef}
        className="form-control"
        value={formatInputNumber(eveningRaw)}
        onChange={(e) => onEveningChange(normalizeRawInput(e.target.value))}
        onKeyDown={onEveningKeyDown}
        inputMode="decimal"
        placeholder="Evening"
        style={{ height: 46, borderRadius: 10 }}
      />

      <div
        className="d-flex align-items-center justify-content-center fw-bold"
        style={{
          height: 46,
          borderRadius: 10,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        {formatDisplayNumber(total)}
      </div>
    </div>
  );
};

type DipCardProps = {
  title: string;
  tankText: string;
  themeStyle: React.CSSProperties;
  rawValue: string;
  liters: number | null;
  onChange: (raw: string) => void;
  difference?: number;
  showDifference?: boolean;
  inputRef?: (node: HTMLInputElement | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const DipCard = ({
  title,
  tankText,
  themeStyle,
  rawValue,
  liters,
  onChange,
  difference,
  showDifference = false,
  inputRef,
  onKeyDown,
}: DipCardProps) => {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div
        className="h-100 p-3"
        style={{
          ...cardShellStyle,
          background: "#ffffff",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div style={sectionTitleStyle}>{title}</div>
          <div style={{ ...labelPillBase, ...themeStyle, minWidth: 84, padding: "6px 10px" }}>
            {tankText}
          </div>
        </div>

        <label className="form-label fw-semibold mb-2">Dip</label>
        <input
          ref={inputRef}
          className="form-control mb-3"
          value={formatInputNumber(rawValue)}
          onChange={(e) => onChange(normalizeRawInput(e.target.value))}
          onKeyDown={onKeyDown}
          inputMode="decimal"
          placeholder="Enter dip"
          style={{ height: 48, borderRadius: 10 }}
        />

        <div className="row g-2">
          <div className="col-12">
            <div
              className="p-3"
              style={{
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={metricLabelStyle}>Liters</div>
              <div style={{ ...metricValueStyle, fontSize: 24 }}>
                {formatDisplayNumber(liters)}
              </div>
            </div>
          </div>

          {showDifference && (
            <div className="col-12">
              <div
                className="p-3"
                style={{
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={metricLabelStyle}>Difference</div>
                <div
                  className={diffClass(difference ?? 0)}
                  style={{ fontSize: 24, lineHeight: 1.1 }}
                >
                  {formatDisplayNumber(difference ?? null)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type MetricBoxProps = {
  label: string;
  value: number | null | undefined;
  panelStyle?: React.CSSProperties;
  valueClassName?: string;
};

const MetricBox = ({
  label,
  value,
  panelStyle,
  valueClassName,
}: MetricBoxProps) => {
  return (
    <div className="col-12 col-md-4">
      <div
        style={{
          ...valueCardBase,
          ...panelStyle,
        }}
      >
        <div style={metricLabelStyle}>{label}</div>
        <div className={valueClassName} style={metricValueStyle}>
          {formatDisplayNumber(value)}
        </div>
      </div>
    </div>
  );
};

const FuelPage = ({ date, onStatusChange }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const getSyncStatus = useDailyStore((s) => s.getSyncStatus);

  const setFuelOpeningRegTotal = useDailyStore((s) => s.setFuelOpeningRegTotal);
  const setFuelOpeningSup93 = useDailyStore((s) => s.setFuelOpeningSup93);
  const setFuelOpeningDsl = useDailyStore((s) => s.setFuelOpeningDsl);

  const setFuelDeliveryRegTotal = useDailyStore((s) => s.setFuelDeliveryRegTotal);
  const setFuelDeliverySup93 = useDailyStore((s) => s.setFuelDeliverySup93);
  const setFuelDeliveryDsl = useDailyStore((s) => s.setFuelDeliveryDsl);

  const setFuelSalesReg87Morning = useDailyStore((s) => s.setFuelSalesReg87Morning);
  const setFuelSalesReg87Evening = useDailyStore((s) => s.setFuelSalesReg87Evening);
  const setFuelSalesEx89Morning = useDailyStore((s) => s.setFuelSalesEx89Morning);
  const setFuelSalesEx89Evening = useDailyStore((s) => s.setFuelSalesEx89Evening);
  const setFuelSalesSup91Morning = useDailyStore((s) => s.setFuelSalesSup91Morning);
  const setFuelSalesSup91Evening = useDailyStore((s) => s.setFuelSalesSup91Evening);
  const setFuelSalesSup93Morning = useDailyStore((s) => s.setFuelSalesSup93Morning);
  const setFuelSalesSup93Evening = useDailyStore((s) => s.setFuelSalesSup93Evening);
  const setFuelSalesDslMorning = useDailyStore((s) => s.setFuelSalesDslMorning);
  const setFuelSalesDslEvening = useDailyStore((s) => s.setFuelSalesDslEvening);

  const setFuelClosingDipRegT1 = useDailyStore((s) => s.setFuelClosingDipRegT1);
  const setFuelClosingDipRegT2 = useDailyStore((s) => s.setFuelClosingDipRegT2);
  const setFuelClosingDipSup = useDailyStore((s) => s.setFuelClosingDipSup);
  const setFuelClosingDipDsl = useDailyStore((s) => s.setFuelClosingDipDsl);

  const setFuelCalledScamTransport = useDailyStore((s) => s.setFuelCalledScamTransport);
  const setFuelEnteredOnWebsite = useDailyStore((s) => s.setFuelEnteredOnWebsite);

  const entry = useMemo(() => byDate[date] ?? makeEmptyDailyEntry(), [byDate, date]);
  const sync = getSyncStatus(date);

  const status = useMemo(() => computeFuelStatus(entry), [entry]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const salesTotals = useMemo(() => computeFuelSalesTotals(entry), [entry]);
  const dipLiters = useMemo(() => computeFuelDipLiters(entry), [entry]);
  const estimated = useMemo(() => computeFuelEstimatedInventory(entry), [entry]);
  const diffs = useMemo(() => computeFuelDifferences(entry), [entry]);
  const nextOpening = useMemo(() => computeFuelNextOpening(entry), [entry]);

  const [fuelOpeningRegTotalInput, setFuelOpeningRegTotalInput] = useState("");
  const [fuelOpeningSup93Input, setFuelOpeningSup93Input] = useState("");
  const [fuelOpeningDslInput, setFuelOpeningDslInput] = useState("");

  const [fuelDeliveryRegTotalInput, setFuelDeliveryRegTotalInput] = useState("");
  const [fuelDeliverySup93Input, setFuelDeliverySup93Input] = useState("");
  const [fuelDeliveryDslInput, setFuelDeliveryDslInput] = useState("");

  const [fuelSalesReg87MorningInput, setFuelSalesReg87MorningInput] = useState("");
  const [fuelSalesReg87EveningInput, setFuelSalesReg87EveningInput] = useState("");
  const [fuelSalesEx89MorningInput, setFuelSalesEx89MorningInput] = useState("");
  const [fuelSalesEx89EveningInput, setFuelSalesEx89EveningInput] = useState("");
  const [fuelSalesSup91MorningInput, setFuelSalesSup91MorningInput] = useState("");
  const [fuelSalesSup91EveningInput, setFuelSalesSup91EveningInput] = useState("");
  const [fuelSalesSup93MorningInput, setFuelSalesSup93MorningInput] = useState("");
  const [fuelSalesSup93EveningInput, setFuelSalesSup93EveningInput] = useState("");
  const [fuelSalesDslMorningInput, setFuelSalesDslMorningInput] = useState("");
  const [fuelSalesDslEveningInput, setFuelSalesDslEveningInput] = useState("");

  const [fuelClosingDipRegT1Input, setFuelClosingDipRegT1Input] = useState("");
  const [fuelClosingDipRegT2Input, setFuelClosingDipRegT2Input] = useState("");
  const [fuelClosingDipSupInput, setFuelClosingDipSupInput] = useState("");
  const [fuelClosingDipDslInput, setFuelClosingDipDslInput] = useState("");

  useEffect(() => {
    setFuelOpeningRegTotalInput(entry.fuelOpeningRegTotal?.toString() ?? "");
    setFuelOpeningSup93Input(entry.fuelOpeningSup93?.toString() ?? "");
    setFuelOpeningDslInput(entry.fuelOpeningDsl?.toString() ?? "");

    setFuelDeliveryRegTotalInput(entry.fuelDeliveryRegTotal?.toString() ?? "");
    setFuelDeliverySup93Input(entry.fuelDeliverySup93?.toString() ?? "");
    setFuelDeliveryDslInput(entry.fuelDeliveryDsl?.toString() ?? "");

    setFuelSalesReg87MorningInput(entry.fuelSalesReg87Morning?.toString() ?? "");
    setFuelSalesReg87EveningInput(entry.fuelSalesReg87Evening?.toString() ?? "");
    setFuelSalesEx89MorningInput(entry.fuelSalesEx89Morning?.toString() ?? "");
    setFuelSalesEx89EveningInput(entry.fuelSalesEx89Evening?.toString() ?? "");
    setFuelSalesSup91MorningInput(entry.fuelSalesSup91Morning?.toString() ?? "");
    setFuelSalesSup91EveningInput(entry.fuelSalesSup91Evening?.toString() ?? "");
    setFuelSalesSup93MorningInput(entry.fuelSalesSup93Morning?.toString() ?? "");
    setFuelSalesSup93EveningInput(entry.fuelSalesSup93Evening?.toString() ?? "");
    setFuelSalesDslMorningInput(entry.fuelSalesDslMorning?.toString() ?? "");
    setFuelSalesDslEveningInput(entry.fuelSalesDslEvening?.toString() ?? "");

    setFuelClosingDipRegT1Input(entry.fuelClosingDipRegT1?.toString() ?? "");
    setFuelClosingDipRegT2Input(entry.fuelClosingDipRegT2?.toString() ?? "");
    setFuelClosingDipSupInput(entry.fuelClosingDipSup?.toString() ?? "");
    setFuelClosingDipDslInput(entry.fuelClosingDipDsl?.toString() ?? "");
  }, [entry]);

  const inputRefs = useRef<Record<FieldKey, HTMLInputElement | null>>({
    openingReg: null,
    openingSup93: null,
    openingDsl: null,
    deliveryReg: null,
    deliverySup93: null,
    deliveryDsl: null,
    salesRegMorning: null,
    salesEx89Morning: null,
    salesSup91Morning: null,
    salesSup93Morning: null,
    salesDslMorning: null,
    salesRegEvening: null,
    salesEx89Evening: null,
    salesSup91Evening: null,
    salesSup93Evening: null,
    salesDslEvening: null,
    closingDipRegT1: null,
    closingDipRegT2: null,
    closingDipSup: null,
    closingDipDsl: null,
  });

  const nextFieldMap: Partial<Record<FieldKey, FieldKey>> = {
    openingReg: "openingSup93",
    openingSup93: "openingDsl",
    openingDsl: "salesRegMorning",

    deliveryReg: "deliverySup93",
    deliverySup93: "deliveryDsl",
    deliveryDsl: "salesRegMorning",

    salesRegMorning: "salesEx89Morning",
    salesEx89Morning: "salesSup91Morning",
    salesSup91Morning: "salesSup93Morning",
    salesSup93Morning: "salesDslMorning",

    salesDslMorning: "salesRegEvening",

    salesRegEvening: "salesEx89Evening",
    salesEx89Evening: "salesSup91Evening",
    salesSup91Evening: "salesSup93Evening",
    salesSup93Evening: "salesDslEvening",

    salesDslEvening: "closingDipRegT1",

    closingDipRegT1: "closingDipRegT2",
    closingDipRegT2: "closingDipSup",
    closingDipSup: "closingDipDsl",
  };

  const focusNext = (key: FieldKey) => {
    const nextKey = nextFieldMap[key];
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

  return (
    <div className="card border-0" style={cardShellStyle}>
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start align-items-md-center flex-column flex-md-row gap-2 pt-4 px-4">
        <div>
          <h5 className="mb-1">Fuel</h5>
          <div className="text-muted small">
            Opening, delivery, sales, closing dip and checklist
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
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-4">
            <div className="h-100 p-3 p-lg-4 bg-white" style={cardShellStyle}>
              <div className="mb-3" style={sectionTitleStyle}>
                Opening
              </div>

              <FuelInputRow
                label="REG"
                rawValue={fuelOpeningRegTotalInput}
                onRawChange={(raw) => {
                  setFuelOpeningRegTotalInput(raw);
                  setFuelOpeningRegTotal(date, toNumberOrNull(raw));
                }}
                themeStyle={fuelTheme.regular.badgeStyle}
                inputRef={(node) => {
                  inputRefs.current.openingReg = node;
                }}
                onKeyDown={handleEnter("openingReg")}
              />

              <FuelInputRow
                label="SUP 93"
                rawValue={fuelOpeningSup93Input}
                onRawChange={(raw) => {
                  setFuelOpeningSup93Input(raw);
                  setFuelOpeningSup93(date, toNumberOrNull(raw));
                }}
                themeStyle={fuelTheme.sup93.badgeStyle}
                inputRef={(node) => {
                  inputRefs.current.openingSup93 = node;
                }}
                onKeyDown={handleEnter("openingSup93")}
              />

              <FuelInputRow
                label="DSL"
                rawValue={fuelOpeningDslInput}
                onRawChange={(raw) => {
                  setFuelOpeningDslInput(raw);
                  setFuelOpeningDsl(date, toNumberOrNull(raw));
                }}
                themeStyle={fuelTheme.diesel.badgeStyle}
                inputRef={(node) => {
                  inputRefs.current.openingDsl = node;
                }}
                onKeyDown={handleEnter("openingDsl")}
              />
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="h-100 p-3 p-lg-4 bg-white" style={cardShellStyle}>
              <div className="mb-3" style={sectionTitleStyle}>
                Delivery
              </div>

              <FuelInputRow
                label="REG"
                rawValue={fuelDeliveryRegTotalInput}
                onRawChange={(raw) => {
                  setFuelDeliveryRegTotalInput(raw);
                  setFuelDeliveryRegTotal(date, toNumberOrNull(raw));
                }}
                themeStyle={fuelTheme.regular.badgeStyle}
                inputRef={(node) => {
                  inputRefs.current.deliveryReg = node;
                }}
                onKeyDown={handleEnter("deliveryReg")}
              />

              <FuelInputRow
                label="SUP 93"
                rawValue={fuelDeliverySup93Input}
                onRawChange={(raw) => {
                  setFuelDeliverySup93Input(raw);
                  setFuelDeliverySup93(date, toNumberOrNull(raw));
                }}
                themeStyle={fuelTheme.sup93.badgeStyle}
                inputRef={(node) => {
                  inputRefs.current.deliverySup93 = node;
                }}
                onKeyDown={handleEnter("deliverySup93")}
              />

              <FuelInputRow
                label="DSL"
                rawValue={fuelDeliveryDslInput}
                onRawChange={(raw) => {
                  setFuelDeliveryDslInput(raw);
                  setFuelDeliveryDsl(date, toNumberOrNull(raw));
                }}
                themeStyle={fuelTheme.diesel.badgeStyle}
                inputRef={(node) => {
                  inputRefs.current.deliveryDsl = node;
                }}
                onKeyDown={handleEnter("deliveryDsl")}
              />
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div
              className="h-100 p-3 p-lg-4"
              style={{
                ...cardShellStyle,
                background:
                  "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)",
              }}
            >
              <div className="mb-3" style={sectionTitleStyle}>
                Checklist
              </div>

              <div
                className="p-3 mb-3"
                style={{
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div className="form-check">
                  <input
                    id="fuelCalledScamTransport"
                    className="form-check-input"
                    type="checkbox"
                    checked={entry.fuelCalledScamTransport}
                    onChange={(e) => setFuelCalledScamTransport(date, e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="fuelCalledScamTransport">
                    Called Scamp Transport
                  </label>
                </div>
              </div>

              <div
                className="p-3"
                style={{
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div className="form-check">
                  <input
                    id="fuelEnteredOnWebsite"
                    className="form-check-input"
                    type="checkbox"
                    checked={entry.fuelEnteredOnWebsite}
                    onChange={(e) => setFuelEnteredOnWebsite(date, e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="fuelEnteredOnWebsite">
                    Entered on Website
                  </label>
                </div>
              </div>

              <div className="mt-3" style={smallMutedStyle}>
                When all required fields are entered, status becomes CHECK. With both checkboxes,
                it becomes OK.
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 p-lg-4 mb-4 bg-white" style={cardShellStyle}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div style={sectionTitleStyle}>Sales</div>
          </div>

          <div
            className="d-grid gap-3 px-2 pb-2 mb-2 text-muted fw-semibold"
            style={{
              gridTemplateColumns: "120px minmax(120px,1fr) minmax(120px,1fr) 120px",
              fontSize: 13,
            }}
          >
            <div />
            <div>Morning</div>
            <div>Evening</div>
            <div>Total</div>
          </div>

          <SalesRow
            label="REG"
            themeStyle={fuelTheme.regular.badgeStyle}
            morningRaw={fuelSalesReg87MorningInput}
            eveningRaw={fuelSalesReg87EveningInput}
            onMorningChange={(raw) => {
              setFuelSalesReg87MorningInput(raw);
              setFuelSalesReg87Morning(date, toNumberOrNull(raw));
            }}
            onEveningChange={(raw) => {
              setFuelSalesReg87EveningInput(raw);
              setFuelSalesReg87Evening(date, toNumberOrNull(raw));
            }}
            total={salesTotals.reg87}
            morningInputRef={(node) => {
              inputRefs.current.salesRegMorning = node;
            }}
            eveningInputRef={(node) => {
              inputRefs.current.salesRegEvening = node;
            }}
            onMorningKeyDown={handleEnter("salesRegMorning")}
            onEveningKeyDown={handleEnter("salesRegEvening")}
          />

          <SalesRow
            label="89"
            themeStyle={fuelTheme.extra89.badgeStyle}
            morningRaw={fuelSalesEx89MorningInput}
            eveningRaw={fuelSalesEx89EveningInput}
            onMorningChange={(raw) => {
              setFuelSalesEx89MorningInput(raw);
              setFuelSalesEx89Morning(date, toNumberOrNull(raw));
            }}
            onEveningChange={(raw) => {
              setFuelSalesEx89EveningInput(raw);
              setFuelSalesEx89Evening(date, toNumberOrNull(raw));
            }}
            total={salesTotals.ex89}
            morningInputRef={(node) => {
              inputRefs.current.salesEx89Morning = node;
            }}
            eveningInputRef={(node) => {
              inputRefs.current.salesEx89Evening = node;
            }}
            onMorningKeyDown={handleEnter("salesEx89Morning")}
            onEveningKeyDown={handleEnter("salesEx89Evening")}
          />

          <SalesRow
            label="91"
            themeStyle={fuelTheme.sup91.badgeStyle}
            morningRaw={fuelSalesSup91MorningInput}
            eveningRaw={fuelSalesSup91EveningInput}
            onMorningChange={(raw) => {
              setFuelSalesSup91MorningInput(raw);
              setFuelSalesSup91Morning(date, toNumberOrNull(raw));
            }}
            onEveningChange={(raw) => {
              setFuelSalesSup91EveningInput(raw);
              setFuelSalesSup91Evening(date, toNumberOrNull(raw));
            }}
            total={salesTotals.sup91}
            morningInputRef={(node) => {
              inputRefs.current.salesSup91Morning = node;
            }}
            eveningInputRef={(node) => {
              inputRefs.current.salesSup91Evening = node;
            }}
            onMorningKeyDown={handleEnter("salesSup91Morning")}
            onEveningKeyDown={handleEnter("salesSup91Evening")}
          />

          <SalesRow
            label="93"
            themeStyle={fuelTheme.sup93.badgeStyle}
            morningRaw={fuelSalesSup93MorningInput}
            eveningRaw={fuelSalesSup93EveningInput}
            onMorningChange={(raw) => {
              setFuelSalesSup93MorningInput(raw);
              setFuelSalesSup93Morning(date, toNumberOrNull(raw));
            }}
            onEveningChange={(raw) => {
              setFuelSalesSup93EveningInput(raw);
              setFuelSalesSup93Evening(date, toNumberOrNull(raw));
            }}
            total={salesTotals.sup93}
            morningInputRef={(node) => {
              inputRefs.current.salesSup93Morning = node;
            }}
            eveningInputRef={(node) => {
              inputRefs.current.salesSup93Evening = node;
            }}
            onMorningKeyDown={handleEnter("salesSup93Morning")}
            onEveningKeyDown={handleEnter("salesSup93Evening")}
          />

          <SalesRow
            label="DSL"
            themeStyle={fuelTheme.diesel.badgeStyle}
            morningRaw={fuelSalesDslMorningInput}
            eveningRaw={fuelSalesDslEveningInput}
            onMorningChange={(raw) => {
              setFuelSalesDslMorningInput(raw);
              setFuelSalesDslMorning(date, toNumberOrNull(raw));
            }}
            onEveningChange={(raw) => {
              setFuelSalesDslEveningInput(raw);
              setFuelSalesDslEvening(date, toNumberOrNull(raw));
            }}
            total={salesTotals.dsl}
            morningInputRef={(node) => {
              inputRefs.current.salesDslMorning = node;
            }}
            eveningInputRef={(node) => {
              inputRefs.current.salesDslEvening = node;
            }}
            onMorningKeyDown={handleEnter("salesDslMorning")}
            onEveningKeyDown={handleEnter("salesDslEvening")}
          />
        </div>

        <div className="p-3 p-lg-4 mb-4 bg-white" style={cardShellStyle}>
          <div className="mb-3" style={sectionTitleStyle}>
            Closing Dip
          </div>

          <div className="row g-4">
            <DipCard
              title="Regular T1"
              tankText="REG T1"
              themeStyle={fuelTheme.regular.badgeStyle}
              rawValue={fuelClosingDipRegT1Input}
              liters={dipLiters.REG_T1}
              onChange={(raw) => {
                setFuelClosingDipRegT1Input(raw);
                setFuelClosingDipRegT1(date, toNumberOrNull(raw));
              }}
              inputRef={(node) => {
                inputRefs.current.closingDipRegT1 = node;
              }}
              onKeyDown={handleEnter("closingDipRegT1")}
            />

            <DipCard
              title="Regular T2"
              tankText="REG T2"
              themeStyle={fuelTheme.regular.badgeStyle}
              rawValue={fuelClosingDipRegT2Input}
              liters={dipLiters.REG_T2}
              onChange={(raw) => {
                setFuelClosingDipRegT2Input(raw);
                setFuelClosingDipRegT2(date, toNumberOrNull(raw));
              }}
              difference={diffs.diffReg}
              showDifference
              inputRef={(node) => {
                inputRefs.current.closingDipRegT2 = node;
              }}
              onKeyDown={handleEnter("closingDipRegT2")}
            />

            <DipCard
              title="Supreme"
              tankText="SUP"
              themeStyle={fuelTheme.sup93.badgeStyle}
              rawValue={fuelClosingDipSupInput}
              liters={dipLiters.SUP}
              onChange={(raw) => {
                setFuelClosingDipSupInput(raw);
                setFuelClosingDipSup(date, toNumberOrNull(raw));
              }}
              difference={diffs.diffSup}
              showDifference
              inputRef={(node) => {
                inputRefs.current.closingDipSup = node;
              }}
              onKeyDown={handleEnter("closingDipSup")}
            />

            <DipCard
              title="Diesel"
              tankText="DSL"
              themeStyle={fuelTheme.diesel.badgeStyle}
              rawValue={fuelClosingDipDslInput}
              liters={dipLiters.DSL}
              onChange={(raw) => {
                setFuelClosingDipDslInput(raw);
                setFuelClosingDipDsl(date, toNumberOrNull(raw));
              }}
              difference={diffs.diffDsl}
              showDifference
              inputRef={(node) => {
                inputRefs.current.closingDipDsl = node;
              }}
              onKeyDown={handleEnter("closingDipDsl")}
            />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="p-3 p-lg-4 bg-white h-100" style={cardShellStyle}>
              <div className="mb-3" style={sectionTitleStyle}>
                Inventory & Difference
              </div>

              <div className="mb-3">
                <div className="row g-3 mb-3">
                  <MetricBox
                    label="Regular Estimated"
                    value={estimated.reg}
                    panelStyle={fuelTheme.regular.panelStyle}
                  />
                  <MetricBox
                    label="Regular Closing"
                    value={diffs.closingRegTotal}
                    panelStyle={fuelTheme.regular.panelStyle}
                  />
                  <MetricBox
                    label="Regular Difference"
                    value={diffs.diffReg}
                    panelStyle={fuelTheme.regular.panelStyle}
                    valueClassName={diffClass(diffs.diffReg)}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <MetricBox
                    label="Supreme Estimated"
                    value={estimated.sup}
                    panelStyle={fuelTheme.sup93.panelStyle}
                  />
                  <MetricBox
                    label="Supreme Closing"
                    value={diffs.closingSup}
                    panelStyle={fuelTheme.sup93.panelStyle}
                  />
                  <MetricBox
                    label="Supreme Difference"
                    value={diffs.diffSup}
                    panelStyle={fuelTheme.sup93.panelStyle}
                    valueClassName={diffClass(diffs.diffSup)}
                  />
                </div>

                <div className="row g-3">
                  <MetricBox
                    label="Diesel Estimated"
                    value={estimated.dsl}
                    panelStyle={fuelTheme.diesel.panelStyle}
                  />
                  <MetricBox
                    label="Diesel Closing"
                    value={diffs.closingDsl}
                    panelStyle={fuelTheme.diesel.panelStyle}
                  />
                  <MetricBox
                    label="Diesel Difference"
                    value={diffs.diffDsl}
                    panelStyle={fuelTheme.diesel.panelStyle}
                    valueClassName={diffClass(diffs.diffDsl)}
                  />
                </div>
              </div>

              <div style={smallMutedStyle}>
                Difference is based on Closing minus Estimated.
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="p-3 p-lg-4 bg-white h-100" style={cardShellStyle}>
              <div className="mb-3" style={sectionTitleStyle}>
                Opening for Tomorrow
              </div>

              <div className="row g-3">
                <MetricBox
                  label="REG"
                  value={nextOpening.reg}
                  panelStyle={fuelTheme.regular.panelStyle}
                />
                <MetricBox
                  label="SUP"
                  value={nextOpening.sup}
                  panelStyle={fuelTheme.sup93.panelStyle}
                />
                <MetricBox
                  label="DSL"
                  value={nextOpening.dsl}
                  panelStyle={fuelTheme.diesel.panelStyle}
                />
              </div>

              <div className="mt-3" style={smallMutedStyle}>
                Next-day opening uses closing liters from the dip values.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelPage;