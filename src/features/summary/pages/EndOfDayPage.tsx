import { useEffect, useMemo, useRef, useState } from "react";
import { makeEmptyDailyEntry } from "../../../domain/daily/daily.model";
import { useDailyStore } from "../../../store/daily/daily.store";
import {
  computeEndAndBeginDiffer,
  computeEndOfDayCanadianCash,
  computeEndOfDayCashDrop,
  computeEndOfDayOverShort,
  computeEndOfDayStatus,
} from "../selectors/endOfDay.selectors";

type Status = "missing" | "check" | "ok";
type SyncStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  date: string;
  onStatusChange?: (status: Status) => void;
}

type FieldKey =
  | "fuelSales"
  | "pumpTests"
  | "itemSales"
  | "wrongShelfPrice"
  | "damagedProduct"
  | "employeeDiscount"
  | "gst"
  | "pst"
  | "pstv"
  | "gstv"
  | "pennyRounding"
  | "totalPos"
  | "pumpOverRun"
  | "payouts"
  | "deliveryApp"
  | "redemptions"
  | "cigarettes02"
  | "otherTobacco03"
  | "propaneExchange22"
  | "propaneNew22"
  | "scratchLotto27"
  | "input1"
  | "onlineLotto41"
  | "input2"
  | "essoGift925";

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
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatDisplay = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const cardShellStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
};

const inputOrder: FieldKey[] = [
  "fuelSales",
  "pumpTests",
  "itemSales",
  "wrongShelfPrice",
  "damagedProduct",
  "employeeDiscount",
  "gst",
  "pst",
  "pstv",
  "gstv",
  "pennyRounding",
  "totalPos",
  "pumpOverRun",
  "payouts",
  "deliveryApp",
  "redemptions",
  "cigarettes02",
  "otherTobacco03",
  "propaneExchange22",
  "propaneNew22",
  "scratchLotto27",
  "input1",
  "onlineLotto41",
  "input2",
  "essoGift925",
];

const EndOfDayPage = ({ date, onStatusChange }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const getSyncStatus = useDailyStore((s) => s.getSyncStatus);

  const setEndOfDayInput1 = useDailyStore((s) => s.setEndOfDayInput1);
  const setEndOfDayInput2 = useDailyStore((s) => s.setEndOfDayInput2);

  const setEndOfDayFuelSales = useDailyStore((s) => s.setEndOfDayFuelSales);
  const setEndOfDayPumpTests = useDailyStore((s) => s.setEndOfDayPumpTests);
  const setEndOfDayItemSales = useDailyStore((s) => s.setEndOfDayItemSales);
  const setEndOfDayWrongShelfPrice = useDailyStore((s) => s.setEndOfDayWrongShelfPrice);
  const setEndOfDayDamagedProduct = useDailyStore((s) => s.setEndOfDayDamagedProduct);
  const setEndOfDayEmployeeDiscount = useDailyStore((s) => s.setEndOfDayEmployeeDiscount);
  const setEndOfDayGst = useDailyStore((s) => s.setEndOfDayGst);
  const setEndOfDayPst = useDailyStore((s) => s.setEndOfDayPst);
  const setEndOfDayPstv = useDailyStore((s) => s.setEndOfDayPstv);
  const setEndOfDayGstv = useDailyStore((s) => s.setEndOfDayGstv);
  const setEndOfDayPennyRounding = useDailyStore((s) => s.setEndOfDayPennyRounding);
  const setEndOfDayTotalPos = useDailyStore((s) => s.setEndOfDayTotalPos);
  const setEndOfDayPumpOverRun = useDailyStore((s) => s.setEndOfDayPumpOverRun);
  const setEndOfDayDeliveryApp = useDailyStore((s) => s.setEndOfDayDeliveryApp);
  const setEndOfDayRedemptions = useDailyStore((s) => s.setEndOfDayRedemptions);
  const setEndOfDayCigarettes02 = useDailyStore((s) => s.setEndOfDayCigarettes02);
  const setEndOfDayOtherTobacco03 = useDailyStore((s) => s.setEndOfDayOtherTobacco03);
  const setEndOfDayEssoGift925 = useDailyStore((s) => s.setEndOfDayEssoGift925);

  const setPropaneExchange = useDailyStore((s) => s.setPropaneExchange);
  const setPropaneNew = useDailyStore((s) => s.setPropaneNew);
  const setOnlineLotto41 = useDailyStore((s) => s.setOnlineLotto41);
  const setScratchLotto27 = useDailyStore((s) => s.setScratchLotto27);
  const setPayouts = useDailyStore((s) => s.setPayouts);

  const entry = useMemo(() => byDate[date] ?? makeEmptyDailyEntry(), [byDate, date]);
  const sync = getSyncStatus(date);
  const status = useMemo(() => computeEndOfDayStatus(entry), [entry]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const endAndBeginDiffer = useMemo(() => computeEndAndBeginDiffer(entry), [entry]);
  const canadianCash = useMemo(() => computeEndOfDayCanadianCash(entry), [entry]);
  const cashDrop = useMemo(() => computeEndOfDayCashDrop(entry), [entry]);
  const finalOverShort = useMemo(() => computeEndOfDayOverShort(entry), [entry]);

  const [values, setValues] = useState<Record<FieldKey, string>>({
    fuelSales: "",
    pumpTests: "",
    itemSales: "",
    wrongShelfPrice: "",
    damagedProduct: "",
    employeeDiscount: "",
    gst: "",
    pst: "",
    pstv: "",
    gstv: "",
    pennyRounding: "",
    totalPos: "",
    pumpOverRun: "",
    payouts: "",
    deliveryApp: "",
    redemptions: "",
    cigarettes02: "",
    otherTobacco03: "",
    propaneExchange22: "",
    propaneNew22: "",
    scratchLotto27: "",
    input1: "",
    onlineLotto41: "",
    input2: "",
    essoGift925: "",
  });

  useEffect(() => {
    setValues({
      fuelSales: entry.endOfDayFuelSales?.toString() ?? "",
      pumpTests: entry.endOfDayPumpTests?.toString() ?? "",
      itemSales: entry.endOfDayItemSales?.toString() ?? "",
      wrongShelfPrice: entry.endOfDayWrongShelfPrice?.toString() ?? "",
      damagedProduct: entry.endOfDayDamagedProduct?.toString() ?? "",
      employeeDiscount: entry.endOfDayEmployeeDiscount?.toString() ?? "",
      gst: entry.endOfDayGst?.toString() ?? "",
      pst: entry.endOfDayPst?.toString() ?? "",
      pstv: entry.endOfDayPstv?.toString() ?? "",
      gstv: entry.endOfDayGstv?.toString() ?? "",
      pennyRounding: entry.endOfDayPennyRounding?.toString() ?? "",
      totalPos: entry.endOfDayTotalPos?.toString() ?? "",
      pumpOverRun: entry.endOfDayPumpOverRun?.toString() ?? "",
      payouts: entry.payouts?.toString() ?? "",
      deliveryApp: entry.endOfDayDeliveryApp?.toString() ?? "",
      redemptions: entry.endOfDayRedemptions?.toString() ?? "",
      cigarettes02: entry.endOfDayCigarettes02?.toString() ?? "",
      otherTobacco03: entry.endOfDayOtherTobacco03?.toString() ?? "",
      propaneExchange22: entry.propaneExchange?.toString() ?? "",
      propaneNew22: entry.propaneNew?.toString() ?? "",
      scratchLotto27: entry.scratchLotto27?.toString() ?? "",
      input1: entry.endOfDayInput1?.toString() ?? "",
      onlineLotto41: entry.onlineLotto41?.toString() ?? "",
      input2: entry.endOfDayInput2?.toString() ?? "",
      essoGift925: entry.endOfDayEssoGift925?.toString() ?? "",
    });
  }, [date]);

  const inputRefs = useRef<Record<FieldKey, HTMLInputElement | null>>({} as Record<
    FieldKey,
    HTMLInputElement | null
  >);

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

  const updateLocal = (key: FieldKey, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }));
  };

  const bindInput = (
    key: FieldKey,
    setter?: (date: string, value: number | null) => void
  ) => ({
    ref: (node: HTMLInputElement | null) => {
      inputRefs.current[key] = node;
    },
    value: formatDecimalInput(values[key] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = normalizeRawInput(e.target.value);
      updateLocal(key, raw);
      setter?.(date, toNumberOrNull(raw));
    },
    onKeyDown: handleEnter(key),
    inputMode: "decimal" as const,
  });

  return (
    <div className="card border-0" style={cardShellStyle}>
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start align-items-md-center flex-column flex-md-row gap-2 pt-4 px-4">
        <div>
          <h5 className="mb-1">End of Day</h5>
          <div className="text-muted small">
            Daily totals, references and final over / short
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
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="p-3 p-lg-4 bg-white" style={cardShellStyle}>
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: "60%" }}>Fuel sales</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("fuelSales", setEndOfDayFuelSales)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>pump tests</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("pumpTests", setEndOfDayPumpTests)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Item Sales</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("itemSales", setEndOfDayItemSales)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Wrong shelf price</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("wrongShelfPrice", setEndOfDayWrongShelfPrice)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Damaged product</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("damagedProduct", setEndOfDayDamagedProduct)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Employee Discount</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("employeeDiscount", setEndOfDayEmployeeDiscount)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Gst</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("gst", setEndOfDayGst)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Pst</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("pst", setEndOfDayPst)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>PSTV</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("pstv", setEndOfDayPstv)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>GSTV</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("gstv", setEndOfDayGstv)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Penny Rounding</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("pennyRounding", setEndOfDayPennyRounding)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Total POS</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("totalPos", setEndOfDayTotalPos)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Pump Over run</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("pumpOverRun", setEndOfDayPumpOverRun)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Payouts</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("payouts", setPayouts)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Delivery App</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("deliveryApp", setEndOfDayDeliveryApp)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Redemptions</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("redemptions", setEndOfDayRedemptions)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>02 Cigarettes</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("cigarettes02", setEndOfDayCigarettes02)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>03 Other Tobacco</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("otherTobacco03", setEndOfDayOtherTobacco03)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>22 Propane EXCHANGE</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("propaneExchange22", setPropaneExchange)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>22 propane NEW</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("propaneNew22", setPropaneNew)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>027 Scratch lotto</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("scratchLotto27", setScratchLotto27)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>33 prepaid gift</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("input1", setEndOfDayInput1)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>41 online lotto</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("onlineLotto41", setOnlineLotto41)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>85 Activation fee ONLY</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("input2", setEndOfDayInput2)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>925 Esso gift card</th>
                      <td>
                        <input
                          className="form-control"
                          {...bindInput("essoGift925", setEndOfDayEssoGift925)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="d-grid gap-3">
              <div className="p-3 bg-white" style={cardShellStyle}>
                <div className="text-muted small mb-1">End and Begin Differ</div>
                <div className="fw-bold fs-5">{formatDisplay(endAndBeginDiffer)}</div>
              </div>

              <div className="p-3 bg-white" style={cardShellStyle}>
                <div className="text-muted small mb-1">Canadian Cash</div>
                <div className="fw-bold fs-5">{formatDisplay(canadianCash)}</div>
              </div>

              <div className="p-3 bg-white" style={cardShellStyle}>
                <div className="text-muted small mb-1">Cash Drop</div>
                <div className="fw-bold fs-5">{formatDisplay(cashDrop)}</div>
              </div>

              <div className="p-3 bg-white" style={cardShellStyle}>
                <div className="text-muted small mb-1">Over / Short</div>
                <div
                  className={
                    finalOverShort === 0
                      ? "text-success fw-bold fs-4"
                      : finalOverShort < 0
                      ? "text-danger fw-bold fs-4"
                      : "text-primary fw-bold fs-4"
                  }
                >
                  {formatDisplay(finalOverShort)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndOfDayPage;