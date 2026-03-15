import { create } from "zustand";
import { storage } from "../persist/storage";
import { STORAGE_KEYS } from "../persist/storageKeys";
import type { DailyEntry, DateKey } from "../../domain/daily/daily.model";
import { makeEmptyDailyEntry } from "../../domain/daily/daily.model";

export type SyncStatus = "idle" | "saving" | "saved" | "error";

type DailyState = {
  byDate: Record<DateKey, DailyEntry>;
  syncByDate: Record<DateKey, SyncStatus>;

  getEntry: (date: DateKey) => DailyEntry;

  // Prepaid
  setPrepaidInput: (date: DateKey, value: number | null) => void;

  // End of Day (current)
  setEndOfDayInput1: (date: DateKey, value: number | null) => void;
  setEndOfDayInput2: (date: DateKey, value: number | null) => void;

  // End of Day - Propane POS
  setPropaneExchange: (date: DateKey, value: number | null) => void;
  setPropaneNew: (date: DateKey, value: number | null) => void;

  // Propane Counts
  setFillOpening: (date: DateKey, value: number | null) => void;
  setFillDelivery: (date: DateKey, value: number | null) => void;
  setFillClosing: (date: DateKey, value: number | null) => void;

  setTotalOpening: (date: DateKey, value: number | null) => void;
  setTotalDelivery: (date: DateKey, value: number | null) => void;
  setTotalClosing: (date: DateKey, value: number | null) => void;

  // Fuel - Opening
  setFuelOpeningRegTotal: (date: DateKey, value: number | null) => void;
  setFuelOpeningSup93: (date: DateKey, value: number | null) => void;
  setFuelOpeningDsl: (date: DateKey, value: number | null) => void;

  // Fuel - Delivery
  setFuelDeliveryRegTotal: (date: DateKey, value: number | null) => void;
  setFuelDeliverySup93: (date: DateKey, value: number | null) => void;
  setFuelDeliveryDsl: (date: DateKey, value: number | null) => void;

  // Fuel - Sales
  setFuelSalesReg87Morning: (date: DateKey, value: number | null) => void;
  setFuelSalesReg87Evening: (date: DateKey, value: number | null) => void;

  setFuelSalesEx89Morning: (date: DateKey, value: number | null) => void;
  setFuelSalesEx89Evening: (date: DateKey, value: number | null) => void;

  setFuelSalesSup91Morning: (date: DateKey, value: number | null) => void;
  setFuelSalesSup91Evening: (date: DateKey, value: number | null) => void;

  setFuelSalesSup93Morning: (date: DateKey, value: number | null) => void;
  setFuelSalesSup93Evening: (date: DateKey, value: number | null) => void;

  setFuelSalesDslMorning: (date: DateKey, value: number | null) => void;
  setFuelSalesDslEvening: (date: DateKey, value: number | null) => void;

  // Fuel - Closing Dip
  setFuelClosingDipRegT1: (date: DateKey, value: number | null) => void;
  setFuelClosingDipRegT2: (date: DateKey, value: number | null) => void;
  setFuelClosingDipSup: (date: DateKey, value: number | null) => void;
  setFuelClosingDipDsl: (date: DateKey, value: number | null) => void;

  // Fuel - Checklist
  setFuelCalledScamTransport: (date: DateKey, value: boolean) => void;
  setFuelEnteredOnWebsite: (date: DateKey, value: boolean) => void;

    // Cash & Drops - Morning
  setCashMorningCashierName: (date: DateKey, value: string | null) => void;
  setCashMorningBeginTray: (date: DateKey, value: number | null) => void;
  setCashMorningOther: (date: DateKey, value: number | null) => void;
  setCashMorningEndingTray: (date: DateKey, value: number | null) => void;
  setCashMorningCanadianCash: (date: DateKey, value: number | null) => void;

  setCashMorningDrop1_5: (date: DateKey, value: number | null) => void;
  setCashMorningDrop1_10: (date: DateKey, value: number | null) => void;
  setCashMorningDrop1_20: (date: DateKey, value: number | null) => void;
  setCashMorningDrop1_50: (date: DateKey, value: number | null) => void;
  setCashMorningDrop1_100: (date: DateKey, value: number | null) => void;

  setCashMorningDrop2_5: (date: DateKey, value: number | null) => void;
  setCashMorningDrop2_10: (date: DateKey, value: number | null) => void;
  setCashMorningDrop2_20: (date: DateKey, value: number | null) => void;
  setCashMorningDrop2_50: (date: DateKey, value: number | null) => void;
  setCashMorningDrop2_100: (date: DateKey, value: number | null) => void;

  setCashMorningCoinsDrop1: (date: DateKey, value: number | null) => void;
  setCashMorningCoinsDrop2: (date: DateKey, value: number | null) => void;
  setCashMorningCoinsDrop3: (date: DateKey, value: number | null) => void;
  setCashMorningUsDrop: (date: DateKey, value: number | null) => void;

  // Cash & Drops - Evening
  setCashEveningCashierName: (date: DateKey, value: string | null) => void;
  setCashEveningBeginTray: (date: DateKey, value: number | null) => void;
  setCashEveningOther: (date: DateKey, value: number | null) => void;
  setCashEveningEndingTray: (date: DateKey, value: number | null) => void;
  setCashEveningCanadianCash: (date: DateKey, value: number | null) => void;

  setCashEveningDrop1_5: (date: DateKey, value: number | null) => void;
  setCashEveningDrop1_10: (date: DateKey, value: number | null) => void;
  setCashEveningDrop1_20: (date: DateKey, value: number | null) => void;
  setCashEveningDrop1_50: (date: DateKey, value: number | null) => void;
  setCashEveningDrop1_100: (date: DateKey, value: number | null) => void;

  setCashEveningDrop2_5: (date: DateKey, value: number | null) => void;
  setCashEveningDrop2_10: (date: DateKey, value: number | null) => void;
  setCashEveningDrop2_20: (date: DateKey, value: number | null) => void;
  setCashEveningDrop2_50: (date: DateKey, value: number | null) => void;
  setCashEveningDrop2_100: (date: DateKey, value: number | null) => void;

  setCashEveningCoinsDrop1: (date: DateKey, value: number | null) => void;
  setCashEveningCoinsDrop2: (date: DateKey, value: number | null) => void;
  setCashEveningCoinsDrop3: (date: DateKey, value: number | null) => void;
  setCashEveningUsDrop: (date: DateKey, value: number | null) => void;

  // Cash & Drops - Comments
  setCashComment1: (date: DateKey, value: string | null) => void;
  setCashComment2: (date: DateKey, value: string | null) => void;
  setCashComment3: (date: DateKey, value: string | null) => void;

  getSyncStatus: (date: DateKey) => SyncStatus;
  clearDate: (date: DateKey) => void;
};

type PersistedDailyState = Pick<DailyState, "byDate">;

const SAVE_DEBOUNCE_MS = 400;
const saveTimers: Record<string, number | undefined> = {};

const loadInitialDailyState = (): PersistedDailyState => {
  const saved = storage.get<PersistedDailyState>(STORAGE_KEYS.DAILY_STATE);
  return saved ?? { byDate: {} };
};

export const useDailyStore = create<DailyState>((set, get) => {
  const initial = loadInitialDailyState();

  const persistNow = () => {
    const snapshot: PersistedDailyState = { byDate: get().byDate };
    storage.set(STORAGE_KEYS.DAILY_STATE, snapshot);
  };

  const schedulePersist = (date: DateKey) => {
    set((state) => ({
      syncByDate: { ...state.syncByDate, [date]: "saving" },
    }));

    const existing = saveTimers[date];
    if (existing) window.clearTimeout(existing);

    saveTimers[date] = window.setTimeout(() => {
      try {
        persistNow();

        set((state) => ({
          syncByDate: { ...state.syncByDate, [date]: "saved" },
        }));
      } catch {
        set((state) => ({
          syncByDate: { ...state.syncByDate, [date]: "error" },
        }));
      }
    }, SAVE_DEBOUNCE_MS);
  };

  const ensureEntry = (date: DateKey): DailyEntry => {
    const existing = get().byDate[date];

    if (!existing) {
      const created = makeEmptyDailyEntry();
      set((state) => ({
        byDate: { ...state.byDate, [date]: created },
        syncByDate: { ...state.syncByDate, [date]: "idle" },
      }));
      return created;
    }

    const normalized: DailyEntry = {
      ...makeEmptyDailyEntry(),
      ...existing,
    };

    const changed = JSON.stringify(existing) !== JSON.stringify(normalized);

    if (changed) {
      set((state) => ({
        byDate: { ...state.byDate, [date]: normalized },
      }));
    }

    return normalized;
  };

  const patchEntry = (date: DateKey, patch: Partial<DailyEntry>) => {
    const current = ensureEntry(date);
    const next: DailyEntry = { ...current, ...patch };

    set((state) => ({
      byDate: { ...state.byDate, [date]: next },
    }));

    schedulePersist(date);
  };

  return {
    byDate: initial.byDate,
    syncByDate: {},

    getEntry: (date) => ensureEntry(date),

    // Prepaid
    setPrepaidInput: (date, value) => patchEntry(date, { prepaidInput: value }),

    // End of Day (current)
    setEndOfDayInput1: (date, value) => patchEntry(date, { endOfDayInput1: value }),
    setEndOfDayInput2: (date, value) => patchEntry(date, { endOfDayInput2: value }),

    // End of Day - Propane POS
    setPropaneExchange: (date, value) => patchEntry(date, { propaneExchange: value }),
    setPropaneNew: (date, value) => patchEntry(date, { propaneNew: value }),

    // Propane Counts
    setFillOpening: (date, value) => patchEntry(date, { fillOpening: value }),
    setFillDelivery: (date, value) => patchEntry(date, { fillDelivery: value }),
    setFillClosing: (date, value) => patchEntry(date, { fillClosing: value }),

    setTotalOpening: (date, value) => patchEntry(date, { totalOpening: value }),
    setTotalDelivery: (date, value) => patchEntry(date, { totalDelivery: value }),
    setTotalClosing: (date, value) => patchEntry(date, { totalClosing: value }),

    // Fuel - Opening
    setFuelOpeningRegTotal: (date, value) =>
      patchEntry(date, { fuelOpeningRegTotal: value }),
    setFuelOpeningSup93: (date, value) =>
      patchEntry(date, { fuelOpeningSup93: value }),
    setFuelOpeningDsl: (date, value) =>
      patchEntry(date, { fuelOpeningDsl: value }),

    // Fuel - Delivery
    setFuelDeliveryRegTotal: (date, value) =>
      patchEntry(date, { fuelDeliveryRegTotal: value }),
    setFuelDeliverySup93: (date, value) =>
      patchEntry(date, { fuelDeliverySup93: value }),
    setFuelDeliveryDsl: (date, value) =>
      patchEntry(date, { fuelDeliveryDsl: value }),

    // Fuel - Sales
    setFuelSalesReg87Morning: (date, value) =>
      patchEntry(date, { fuelSalesReg87Morning: value }),
    setFuelSalesReg87Evening: (date, value) =>
      patchEntry(date, { fuelSalesReg87Evening: value }),

    setFuelSalesEx89Morning: (date, value) =>
      patchEntry(date, { fuelSalesEx89Morning: value }),
    setFuelSalesEx89Evening: (date, value) =>
      patchEntry(date, { fuelSalesEx89Evening: value }),

    setFuelSalesSup91Morning: (date, value) =>
      patchEntry(date, { fuelSalesSup91Morning: value }),
    setFuelSalesSup91Evening: (date, value) =>
      patchEntry(date, { fuelSalesSup91Evening: value }),

    setFuelSalesSup93Morning: (date, value) =>
      patchEntry(date, { fuelSalesSup93Morning: value }),
    setFuelSalesSup93Evening: (date, value) =>
      patchEntry(date, { fuelSalesSup93Evening: value }),

    setFuelSalesDslMorning: (date, value) =>
      patchEntry(date, { fuelSalesDslMorning: value }),
    setFuelSalesDslEvening: (date, value) =>
      patchEntry(date, { fuelSalesDslEvening: value }),

    // Fuel - Closing Dip
    setFuelClosingDipRegT1: (date, value) =>
      patchEntry(date, { fuelClosingDipRegT1: value }),
    setFuelClosingDipRegT2: (date, value) =>
      patchEntry(date, { fuelClosingDipRegT2: value }),
    setFuelClosingDipSup: (date, value) =>
      patchEntry(date, { fuelClosingDipSup: value }),
    setFuelClosingDipDsl: (date, value) =>
      patchEntry(date, { fuelClosingDipDsl: value }),

    // Fuel - Checklist
    setFuelCalledScamTransport: (date, value) =>
      patchEntry(date, { fuelCalledScamTransport: value }),
    setFuelEnteredOnWebsite: (date, value) =>
      patchEntry(date, { fuelEnteredOnWebsite: value }),

        // Cash & Drops - Morning
    setCashMorningCashierName: (date, value) =>
      patchEntry(date, { cashMorningCashierName: value }),
    setCashMorningBeginTray: (date, value) =>
      patchEntry(date, { cashMorningBeginTray: value }),
    setCashMorningOther: (date, value) =>
      patchEntry(date, { cashMorningOther: value }),
    setCashMorningEndingTray: (date, value) =>
      patchEntry(date, { cashMorningEndingTray: value }),
    setCashMorningCanadianCash: (date, value) =>
      patchEntry(date, { cashMorningCanadianCash: value }),

    setCashMorningDrop1_5: (date, value) =>
      patchEntry(date, { cashMorningDrop1_5: value }),
    setCashMorningDrop1_10: (date, value) =>
      patchEntry(date, { cashMorningDrop1_10: value }),
    setCashMorningDrop1_20: (date, value) =>
      patchEntry(date, { cashMorningDrop1_20: value }),
    setCashMorningDrop1_50: (date, value) =>
      patchEntry(date, { cashMorningDrop1_50: value }),
    setCashMorningDrop1_100: (date, value) =>
      patchEntry(date, { cashMorningDrop1_100: value }),

    setCashMorningDrop2_5: (date, value) =>
      patchEntry(date, { cashMorningDrop2_5: value }),
    setCashMorningDrop2_10: (date, value) =>
      patchEntry(date, { cashMorningDrop2_10: value }),
    setCashMorningDrop2_20: (date, value) =>
      patchEntry(date, { cashMorningDrop2_20: value }),
    setCashMorningDrop2_50: (date, value) =>
      patchEntry(date, { cashMorningDrop2_50: value }),
    setCashMorningDrop2_100: (date, value) =>
      patchEntry(date, { cashMorningDrop2_100: value }),

    setCashMorningCoinsDrop1: (date, value) =>
      patchEntry(date, { cashMorningCoinsDrop1: value }),
    setCashMorningCoinsDrop2: (date, value) =>
      patchEntry(date, { cashMorningCoinsDrop2: value }),
    setCashMorningCoinsDrop3: (date, value) =>
      patchEntry(date, { cashMorningCoinsDrop3: value }),
    setCashMorningUsDrop: (date, value) =>
      patchEntry(date, { cashMorningUsDrop: value }),

    // Cash & Drops - Evening
    setCashEveningCashierName: (date, value) =>
      patchEntry(date, { cashEveningCashierName: value }),
    setCashEveningBeginTray: (date, value) =>
      patchEntry(date, { cashEveningBeginTray: value }),
    setCashEveningOther: (date, value) =>
      patchEntry(date, { cashEveningOther: value }),
    setCashEveningEndingTray: (date, value) =>
      patchEntry(date, { cashEveningEndingTray: value }),
    setCashEveningCanadianCash: (date, value) =>
      patchEntry(date, { cashEveningCanadianCash: value }),

    setCashEveningDrop1_5: (date, value) =>
      patchEntry(date, { cashEveningDrop1_5: value }),
    setCashEveningDrop1_10: (date, value) =>
      patchEntry(date, { cashEveningDrop1_10: value }),
    setCashEveningDrop1_20: (date, value) =>
      patchEntry(date, { cashEveningDrop1_20: value }),
    setCashEveningDrop1_50: (date, value) =>
      patchEntry(date, { cashEveningDrop1_50: value }),
    setCashEveningDrop1_100: (date, value) =>
      patchEntry(date, { cashEveningDrop1_100: value }),

    setCashEveningDrop2_5: (date, value) =>
      patchEntry(date, { cashEveningDrop2_5: value }),
    setCashEveningDrop2_10: (date, value) =>
      patchEntry(date, { cashEveningDrop2_10: value }),
    setCashEveningDrop2_20: (date, value) =>
      patchEntry(date, { cashEveningDrop2_20: value }),
    setCashEveningDrop2_50: (date, value) =>
      patchEntry(date, { cashEveningDrop2_50: value }),
    setCashEveningDrop2_100: (date, value) =>
      patchEntry(date, { cashEveningDrop2_100: value }),

    setCashEveningCoinsDrop1: (date, value) =>
      patchEntry(date, { cashEveningCoinsDrop1: value }),
    setCashEveningCoinsDrop2: (date, value) =>
      patchEntry(date, { cashEveningCoinsDrop2: value }),
    setCashEveningCoinsDrop3: (date, value) =>
      patchEntry(date, { cashEveningCoinsDrop3: value }),
    setCashEveningUsDrop: (date, value) =>
      patchEntry(date, { cashEveningUsDrop: value }),

    // Cash & Drops - Comments
    setCashComment1: (date, value) =>
      patchEntry(date, { cashComment1: value }),
    setCashComment2: (date, value) =>
      patchEntry(date, { cashComment2: value }),
    setCashComment3: (date, value) =>
      patchEntry(date, { cashComment3: value }),

    getSyncStatus: (date) => get().syncByDate[date] ?? "idle",

    clearDate: (date) => {
      const t = saveTimers[date];
      if (t) window.clearTimeout(t);
      delete saveTimers[date];

      set((state) => {
        const nextByDate = { ...state.byDate };
        const nextSync = { ...state.syncByDate };
        delete nextByDate[date];
        delete nextSync[date];
        return { byDate: nextByDate, syncByDate: nextSync };
      });

      persistNow();
    },
  };
});