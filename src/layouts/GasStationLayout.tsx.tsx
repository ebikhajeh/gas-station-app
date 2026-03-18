import { useMemo } from "react";
import type { ReactNode } from "react";
import { useUiStore } from "../store/ui/ui.store";
import { useDailyStore } from "../store/daily/daily.store";
import { computePrepaidStatus } from "../features/prepaid/selectors/prepaid.selectors";
import { computePropaneStatus } from "../features/propane/selectors/propane.selectors";
import { computeFuelStatus } from "../features/fuel/selectors/fuel.selectors";
import { computeCashStatus } from "../features/cash/selectors/cash.selectors";
import { computeLottoStatus } from "../features/lotto/selectors/lotto.selectors";
import { computeCigarettesStatus } from "../features/cigarettes/selectors/cigarettes.selectors";
import { useEndOfDayStatus } from "../features/summary/hooks/useEndOfDayStatus";
import {
  addDaysToDateInput,
  getTodayLocalDateInput,
} from "../utils/date";

type Props = {
  endOfDay: ReactNode;
  prepaid: ReactNode;
  propane: ReactNode;
  fuel: ReactNode;
  cash: ReactNode;
  lotto: ReactNode;
  cigarettes: ReactNode;
  reports: ReactNode;
};

const GasStationLayout = ({
  endOfDay,
  prepaid,
  propane,
  fuel,
  cash,
  lotto,
  cigarettes,
  reports,
}: Props) => {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const activeTab = useUiStore((s) => s.activeTab);
  const setSelectedDate = useUiStore((s) => s.setSelectedDate);
  const setActiveTab = useUiStore((s) => s.setActiveTab);

  const byDate = useDailyStore((s) => s.byDate);
  const syncStatus = useDailyStore((s) => s.getSyncStatus(selectedDate));

  const endOfDayBadgeStatus = useEndOfDayStatus(selectedDate);

  const entry = useMemo(() => {
    return byDate[selectedDate] ?? null;
  }, [byDate, selectedDate]);

  const prepaidBadgeStatus = useMemo(() => {
    return computePrepaidStatus(entry);
  }, [entry]);

  const propaneBadgeStatus = useMemo(() => {
    return computePropaneStatus(entry);
  }, [entry]);

  const fuelBadgeStatus = useMemo(() => {
    return computeFuelStatus(entry);
  }, [entry]);

  const cashBadgeStatus = useMemo(() => {
    return computeCashStatus(entry);
  }, [entry]);

  const lottoBadgeStatus = useMemo(() => {
    return computeLottoStatus(entry);
  }, [entry]);

  const cigarettesBadgeStatus = useMemo(() => {
    return computeCigarettesStatus(entry, selectedDate);
  }, [entry, selectedDate]);

  const goDay = (delta: number) => {
    setSelectedDate(addDaysToDateInput(selectedDate, delta));
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
    <div className="min-vh-100 bg-light">
      <div className="bg-white border-bottom">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <div className="h5 mb-1">Mobil Waypoint Pitt Meadows 1755</div>
              <div className="text-muted small">
                PBL #324481 • Selected:{" "}
                <span className="fw-semibold">{selectedDate}</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light border">Daily Ops</span>
              <span className={`small fw-semibold ${syncTextClass}`}>
                {syncText}
              </span>
            </div>
          </div>

          <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-end mt-3">
            <div>
              <label className="form-label mb-1">Date</label>
              <div className="d-flex gap-2 flex-wrap">
                <input
                  type="date"
                  className="form-control"
                  style={{ maxWidth: 220 }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <div className="btn-group" role="group" aria-label="date nav">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => goDay(-1)}
                    type="button"
                  >
                    ◀ Prev
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedDate(getTodayLocalDateInput())}
                    type="button"
                  >
                    Today
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => goDay(1)}
                    type="button"
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ul className="nav nav-tabs mt-4">
            <TabButton
              label="Cash & Drops"
              active={activeTab === "cash"}
              onClick={() => setActiveTab("cash")}
              badge={cashBadgeStatus}
            />

            <TabButton
              label="Cigarettes"
              active={activeTab === "cigarettes"}
              onClick={() => setActiveTab("cigarettes")}
              badge={cigarettesBadgeStatus}
            />

            <TabButton
              label="Prepaid"
              active={activeTab === "prepaid"}
              onClick={() => setActiveTab("prepaid")}
              badge={prepaidBadgeStatus}
            />

            <TabButton
              label="Propane"
              active={activeTab === "propane"}
              onClick={() => setActiveTab("propane")}
              badge={propaneBadgeStatus}
            />

            <TabButton
              label="Fuel"
              active={activeTab === "fuel"}
              onClick={() => setActiveTab("fuel")}
              badge={fuelBadgeStatus}
            />

            <TabButton
              label="Lotto"
              active={activeTab === "lotto"}
              onClick={() => setActiveTab("lotto")}
              badge={lottoBadgeStatus}
            />

            <TabButton
              label="End of Day"
              active={activeTab === "endOfDay"}
              onClick={() => setActiveTab("endOfDay")}
              badge={endOfDayBadgeStatus}
            />

            <TabButton
              label="Reports"
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
            />
          </ul>
        </div>
      </div>

      <div className="container py-4">
        {activeTab === "prepaid" && prepaid}
        {activeTab === "propane" && propane}
        {activeTab === "fuel" && fuel}
        {activeTab === "cash" && cash}
        {activeTab === "lotto" && lotto}
        {activeTab === "cigarettes" && cigarettes}
        {activeTab === "reports" && reports}
        {activeTab === "endOfDay" && endOfDay}
      </div>
    </div>
  );
};

export default GasStationLayout;

const TabButton = ({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: "missing" | "ok" | "check";
}) => {
  const badgeView =
    badge === "ok" ? (
      <span className="badge text-bg-success ms-2">OK</span>
    ) : badge === "check" ? (
      <span className="badge text-bg-danger ms-2">CHECK</span>
    ) : badge === "missing" ? (
      <span className="badge text-bg-secondary ms-2">MISSING</span>
    ) : null;

  return (
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${active ? "active" : ""}`}
        onClick={onClick}
      >
        {label}
        {badgeView}
      </button>
    </li>
  );
};