import { create } from "zustand";
import { storage } from "../persist/storage";
import { STORAGE_KEYS } from "../persist/storageKeys";

export type TabKey = "endOfDay" | "prepaid" | "propane" | "fuel" | "cash";

type UiState = {
  selectedDate: string;
  activeTab: TabKey;

  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: TabKey) => void;

  goToToday: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
};

type PersistedUiState = Pick<UiState, "selectedDate" | "activeTab">;

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const loadInitialUiState = (): PersistedUiState => {
  const today = formatDateInput(new Date());

  const saved = storage.get<Partial<PersistedUiState>>(STORAGE_KEYS.UI_STATE);

  return {
    selectedDate: saved?.selectedDate ?? today,
    activeTab: saved?.activeTab ?? "endOfDay",
  };
};

export const useUiStore = create<UiState>((set, get) => {
  const initial = loadInitialUiState();

  const persist = (patch?: Partial<PersistedUiState>) => {
    const current = {
      selectedDate: get().selectedDate,
      activeTab: get().activeTab,
      ...patch,
    };

    storage.set(STORAGE_KEYS.UI_STATE, current);
  };

  return {
    selectedDate: initial.selectedDate,
    activeTab: initial.activeTab,

    setSelectedDate: (date) => {
      set({ selectedDate: date });
      persist({ selectedDate: date });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
      persist({ activeTab: tab });
    },

    goToToday: () => {
      const today = formatDateInput(new Date());
      set({ selectedDate: today });
      persist({ selectedDate: today });
    },

    goToPrevDay: () => {
      const current = new Date(`${get().selectedDate}T12:00:00`);
      current.setDate(current.getDate() - 1);
      const next = formatDateInput(current);

      set({ selectedDate: next });
      persist({ selectedDate: next });
    },

    goToNextDay: () => {
      const current = new Date(`${get().selectedDate}T12:00:00`);
      current.setDate(current.getDate() + 1);
      const next = formatDateInput(current);

      set({ selectedDate: next });
      persist({ selectedDate: next });
    },
  };
});