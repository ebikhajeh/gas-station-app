import { useEffect, useMemo, useRef, useState } from "react";
import { makeEmptyDailyEntry } from "../../../domain/daily/daily.model";
import { useDailyStore } from "../../../store/daily/daily.store";
import { cigaretteListA, type CigaretteItem } from "../data/cigaretteListA";
import { cigaretteListB } from "../data/cigaretteListB";
import {
  cartonsToSingles,
  computeCigaretteItemsSold,
  computeCigaretteOverShort,
  computeCigarettesStatus,
  getCigarettesEveningCashierLabel,
  getCigarettesMorningCashierLabel,
} from "../selectors/cigarettes.selectors";

type Status = "missing" | "check" | "ok";
type SyncStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  date: string;
  onStatusChange?: (status: Status) => void;
}

type InputModeKey =
  | "morningSingle"
  | "morningCartons"
  | "delivery"
  | "eveningSingle"
  | "eveningCartons"
  | "bulkSale";

type LocalMaps = Record<string, string>;

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

const formatIntegerInput = (value: string) => {
  if (value.trim() === "") return "";
  const normalized = value.replace(/,/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
  }).format(parsed);
};

const formatDisplayNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
  }).format(value);
};

const normalizeRawInput = (value: string) => value.replace(/,/g, "");

const toIntegerOrNull = (value: string): number | null => {
  const v = value.trim();
  if (v === "") return null;
  const parsed = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
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

const stickyLastColumnStyle: React.CSSProperties = {
  position: "sticky",
  right: 0,
  background: "#ffffff",
  zIndex: 2,
  minWidth: 120,
};

const stickyLastHeaderStyle: React.CSSProperties = {
  position: "sticky",
  right: 0,
  background: "#f8f9fa",
  zIndex: 3,
  minWidth: 120,
};

const getActiveList = (date: string) => {
  const day = Number(date.slice(-2));
  if (!Number.isFinite(day)) return cigaretteListA;
  return day % 2 === 1 ? cigaretteListA : cigaretteListB;
};

const getRowKey = (item: CigaretteItem) => item.code || item.name;

const buildOrderedRefs = (rowCount: number) => {
  const result: Array<{ mode: InputModeKey; rowIndex: number }> = [];

  for (let i = 0; i < rowCount; i += 1) {
    result.push({ mode: "morningSingle", rowIndex: i });
  }
  for (let i = 0; i < rowCount; i += 1) {
    result.push({ mode: "morningCartons", rowIndex: i });
  }
  for (let i = 0; i < rowCount; i += 1) {
    result.push({ mode: "eveningSingle", rowIndex: i });
  }
  for (let i = 0; i < rowCount; i += 1) {
    result.push({ mode: "eveningCartons", rowIndex: i });
  }
  for (let i = 0; i < rowCount; i += 1) {
    result.push({ mode: "delivery", rowIndex: i });
  }
  for (let i = 0; i < rowCount; i += 1) {
    result.push({ mode: "bulkSale", rowIndex: i });
  }

  return result;
};

const groupHeaderStyle = (group: string): React.CSSProperties => {
  const palette: Record<string, string> = {
    "DU MAURIER": "#eef6ff",
    MARLBORO: "#fff3e6",
    "JOHN PLAYER": "#eef8ee",
    "PALL MALL": "#f7efff",
    PLAYERS: "#fff7d6",
    EXPORT: "#eaf4ff",
    "EXPORT A": "#eaf4ff",
    CAMEL: "#fff0f0",
    "CANADIAN CLASSICS": "#eef8ff",
    BELMONT: "#f4f0ff",
    NEXT: "#eefcf4",
  };

  return {
    background: palette[group] ?? "#f8f9fa",
    fontWeight: 700,
    color: "#374151",
  };
};

const CigarettesPage = ({ date, onStatusChange }: Props) => {
  const byDate = useDailyStore((s) => s.byDate);
  const getSyncStatus = useDailyStore((s) => s.getSyncStatus);

  const setCigarettesMorningSingle = useDailyStore((s) => s.setCigarettesMorningSingle);
  const setCigarettesMorningCartons = useDailyStore((s) => s.setCigarettesMorningCartons);
  const setCigarettesDeliveryCartons = useDailyStore((s) => s.setCigarettesDeliveryCartons);
  const setCigarettesEveningSingle = useDailyStore((s) => s.setCigarettesEveningSingle);
  const setCigarettesEveningCartons = useDailyStore((s) => s.setCigarettesEveningCartons);
  const setCigarettesBulkSale = useDailyStore((s) => s.setCigarettesBulkSale);

  const entry = useMemo(() => byDate[date] ?? makeEmptyDailyEntry(), [byDate, date]);
  const sync = getSyncStatus(date);

  const activeList = useMemo(() => getActiveList(date), [date]);
  const status = useMemo(() => computeCigarettesStatus(entry, date), [entry, date]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const morningCashierLabel = useMemo(
    () => getCigarettesMorningCashierLabel(entry),
    [entry]
  );
  const eveningCashierLabel = useMemo(
    () => getCigarettesEveningCashierLabel(entry),
    [entry]
  );

  const [morningSinglesInputs, setMorningSinglesInputs] = useState<LocalMaps>({});
  const [morningCartonsInputs, setMorningCartonsInputs] = useState<LocalMaps>({});
  const [deliveryInputs, setDeliveryInputs] = useState<LocalMaps>({});
  const [eveningSinglesInputs, setEveningSinglesInputs] = useState<LocalMaps>({});
  const [eveningCartonsInputs, setEveningCartonsInputs] = useState<LocalMaps>({});
  const [bulkSaleInputs, setBulkSaleInputs] = useState<LocalMaps>({});

  useEffect(() => {
    const nextMorningSingles: LocalMaps = {};
    const nextMorningCartons: LocalMaps = {};
    const nextDelivery: LocalMaps = {};
    const nextEveningSingles: LocalMaps = {};
    const nextEveningCartons: LocalMaps = {};
    const nextBulkSale: LocalMaps = {};

    activeList.forEach((item) => {
      const key = getRowKey(item);

      nextMorningSingles[key] =
        entry.cigarettesMorningSingles?.[key]?.toString() ?? "";
      nextMorningCartons[key] =
        entry.cigarettesMorningCartons?.[key]?.toString() ?? "";
      nextDelivery[key] =
        entry.cigarettesDeliveryCartons?.[key]?.toString() ?? "";
      nextEveningSingles[key] =
        entry.cigarettesEveningSingles?.[key]?.toString() ?? "";
      nextEveningCartons[key] =
        entry.cigarettesEveningCartons?.[key]?.toString() ?? "";
      nextBulkSale[key] =
        entry.cigarettesBulkSale?.[key]?.toString() ?? "";
    });

    setMorningSinglesInputs(nextMorningSingles);
    setMorningCartonsInputs(nextMorningCartons);
    setDeliveryInputs(nextDelivery);
    setEveningSinglesInputs(nextEveningSingles);
    setEveningCartonsInputs(nextEveningCartons);
    setBulkSaleInputs(nextBulkSale);
  }, [date, activeList, entry]);

  const orderedRefs = useMemo(() => buildOrderedRefs(activeList.length), [activeList.length]);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getRefMapKey = (mode: InputModeKey, rowIndex: number) => `${mode}-${rowIndex}`;

  const focusNextByOrder = (mode: InputModeKey, rowIndex: number) => {
    const currentIndex = orderedRefs.findIndex(
      (item) => item.mode === mode && item.rowIndex === rowIndex
    );

    if (currentIndex === -1) return;

    const next = orderedRefs[currentIndex + 1];
    if (!next) return;

    const nextRef = inputRefs.current[getRefMapKey(next.mode, next.rowIndex)];
    if (nextRef) {
      nextRef.focus();
      nextRef.select?.();
    }
  };

  const handleEnter =
    (mode: InputModeKey, rowIndex: number) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNextByOrder(mode, rowIndex);
      }
    };

  let lastGroup = "";

  return (
    <div className="card border-0" style={cardShellStyle}>
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start align-items-md-center flex-column flex-md-row gap-2 pt-4 px-4">
        <div>
          <h5 className="mb-1">Cigarettes</h5>
          <div className="text-muted small">
            Daily cigarette counts, delivery, bulk sale and over / short
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
        <div className="mb-3" style={sectionTitleStyle}>
          {activeList === cigaretteListA ? "List A" : "List B"}
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 110 }}>Item Code</th>
                <th style={{ minWidth: 300 }}>Name</th>
                <th style={{ minWidth: 110 }}>{morningCashierLabel || "Morning Single"}</th>
                <th style={{ minWidth: 130 }}>
                  {(morningCashierLabel || "Morning")} Cartons ×10
                </th>
                <th style={{ minWidth: 120 }}>Delivery ×10</th>
                <th style={{ minWidth: 110 }}>{eveningCashierLabel || "Evening Single"}</th>
                <th style={{ minWidth: 130 }}>
                  {(eveningCashierLabel || "Evening")} Cartons ×10
                </th>
                <th style={{ minWidth: 120 }}>Items Sold</th>
                <th style={{ minWidth: 120 }}>Bulk Sale</th>
                <th style={stickyLastHeaderStyle}>Over / Short</th>
              </tr>
            </thead>

            <tbody>
              {activeList.map((item, rowIndex) => {
                const key = getRowKey(item);
                const rowValues = {
                  morningSingle: entry.cigarettesMorningSingles?.[key] ?? null,
                  morningCartons: entry.cigarettesMorningCartons?.[key] ?? null,
                  deliveryCartons: entry.cigarettesDeliveryCartons?.[key] ?? null,
                  eveningSingle: entry.cigarettesEveningSingles?.[key] ?? null,
                  eveningCartons: entry.cigarettesEveningCartons?.[key] ?? null,
                  bulkSale: entry.cigarettesBulkSale?.[key] ?? null,
                };

                const itemsSold = computeCigaretteItemsSold(rowValues);
                const overShort = computeCigaretteOverShort(rowValues);

                const rows: React.ReactNode[] = [];

                if (item.group !== lastGroup) {
                  lastGroup = item.group;
                  rows.push(
                    <tr key={`group-${item.group}-${rowIndex}`}>
                      <td colSpan={10} style={groupHeaderStyle(item.group)}>
                        {item.group}
                      </td>
                    </tr>
                  );
                }

                rows.push(
                  <tr key={key}>
                    <td>{item.code || "—"}</td>
                    <td>{item.name}</td>

                    <td>
                      <input
                        ref={(node) => {
                          inputRefs.current[getRefMapKey("morningSingle", rowIndex)] = node;
                        }}
                        className="form-control"
                        value={formatIntegerInput(morningSinglesInputs[key] ?? "")}
                        onChange={(e) => {
                          const raw = normalizeRawInput(e.target.value);
                          setMorningSinglesInputs((prev) => ({ ...prev, [key]: raw }));
                          setCigarettesMorningSingle(date, key, toIntegerOrNull(raw));
                        }}
                        onKeyDown={handleEnter("morningSingle", rowIndex)}
                        inputMode="numeric"
                      />
                    </td>

                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          ref={(node) => {
                            inputRefs.current[getRefMapKey("morningCartons", rowIndex)] = node;
                          }}
                          className="form-control"
                          value={formatIntegerInput(morningCartonsInputs[key] ?? "")}
                          onChange={(e) => {
                            const raw = normalizeRawInput(e.target.value);
                            setMorningCartonsInputs((prev) => ({ ...prev, [key]: raw }));
                            setCigarettesMorningCartons(date, key, toIntegerOrNull(raw));
                          }}
                          onKeyDown={handleEnter("morningCartons", rowIndex)}
                          inputMode="numeric"
                        />
                        <small className="text-muted">
                          {formatDisplayNumber(
                            cartonsToSingles(entry.cigarettesMorningCartons?.[key] ?? null)
                          )}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          ref={(node) => {
                            inputRefs.current[getRefMapKey("delivery", rowIndex)] = node;
                          }}
                          className="form-control"
                          value={formatIntegerInput(deliveryInputs[key] ?? "")}
                          onChange={(e) => {
                            const raw = normalizeRawInput(e.target.value);
                            setDeliveryInputs((prev) => ({ ...prev, [key]: raw }));
                            setCigarettesDeliveryCartons(date, key, toIntegerOrNull(raw));
                          }}
                          onKeyDown={handleEnter("delivery", rowIndex)}
                          inputMode="numeric"
                        />
                        <small className="text-muted">
                          {formatDisplayNumber(
                            cartonsToSingles(entry.cigarettesDeliveryCartons?.[key] ?? null)
                          )}
                        </small>
                      </div>
                    </td>

                    <td>
                      <input
                        ref={(node) => {
                          inputRefs.current[getRefMapKey("eveningSingle", rowIndex)] = node;
                        }}
                        className="form-control"
                        value={formatIntegerInput(eveningSinglesInputs[key] ?? "")}
                        onChange={(e) => {
                          const raw = normalizeRawInput(e.target.value);
                          setEveningSinglesInputs((prev) => ({ ...prev, [key]: raw }));
                          setCigarettesEveningSingle(date, key, toIntegerOrNull(raw));
                        }}
                        onKeyDown={handleEnter("eveningSingle", rowIndex)}
                        inputMode="numeric"
                      />
                    </td>

                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          ref={(node) => {
                            inputRefs.current[getRefMapKey("eveningCartons", rowIndex)] = node;
                          }}
                          className="form-control"
                          value={formatIntegerInput(eveningCartonsInputs[key] ?? "")}
                          onChange={(e) => {
                            const raw = normalizeRawInput(e.target.value);
                            setEveningCartonsInputs((prev) => ({ ...prev, [key]: raw }));
                            setCigarettesEveningCartons(date, key, toIntegerOrNull(raw));
                          }}
                          onKeyDown={handleEnter("eveningCartons", rowIndex)}
                          inputMode="numeric"
                        />
                        <small className="text-muted">
                          {formatDisplayNumber(
                            cartonsToSingles(entry.cigarettesEveningCartons?.[key] ?? null)
                          )}
                        </small>
                      </div>
                    </td>

                    <td className="fw-semibold">{formatDisplayNumber(itemsSold)}</td>

                    <td>
                      <input
                        ref={(node) => {
                          inputRefs.current[getRefMapKey("bulkSale", rowIndex)] = node;
                        }}
                        className="form-control"
                        value={formatIntegerInput(bulkSaleInputs[key] ?? "")}
                        onChange={(e) => {
                          const raw = normalizeRawInput(e.target.value);
                          setBulkSaleInputs((prev) => ({ ...prev, [key]: raw }));
                          setCigarettesBulkSale(date, key, toIntegerOrNull(raw));
                        }}
                        onKeyDown={handleEnter("bulkSale", rowIndex)}
                        inputMode="numeric"
                      />
                    </td>

                    <td
                      style={stickyLastColumnStyle}
                      className={
                        overShort === 0
                          ? "text-success fw-semibold"
                          : overShort < 0
                          ? "text-danger fw-semibold"
                          : "text-primary fw-semibold"
                      }
                    >
                      {formatDisplayNumber(overShort)}
                    </td>
                  </tr>
                );

                return rows;
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-muted small">
          Bulk Sale comes from invoice department <strong>000002</strong>.
        </div>
      </div>
    </div>
  );
};

export default CigarettesPage;